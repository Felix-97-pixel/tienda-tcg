import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../prisma/prisma.service';
import { ShippingService } from '../../../shipping/shipping.service';
import { FinancialLedgerService } from '../../../tax/financial-ledger.service';
import { DispatchVendorOrderCommand } from '../impl/dispatch-vendor-order.command';

@Injectable()
@CommandHandler(DispatchVendorOrderCommand)
export class DispatchVendorOrderHandler
  implements ICommandHandler<DispatchVendorOrderCommand>
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly shippingService: ShippingService,
    private readonly financialLedger: FinancialLedgerService,
  ) {}

  async execute(command: DispatchVendorOrderCommand) {
    const { vendorOrderId, dto, userId } = command;

    // 1. Obtener usuario y su tienda
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { stores: true },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // 2. Obtener la sub-orden (VendorOrder)
    const vendorOrder = await this.prisma.vendorOrder.findUnique({
      where: { id: vendorOrderId },
      include: { store: true, order: true, shippingProvider: true },
    });

    if (!vendorOrder) {
      throw new NotFoundException('Sub-orden de tienda no encontrada');
    }

    // 3. Validar permisos: debe ser dueño/miembro de la tienda, de la empresa matriz o un SUPERADMIN
    const isSuperAdmin = user.role === 'SUPERADMIN';
    const storeAccess = isSuperAdmin
      ? true
      : await this.prisma.store.findFirst({
          where: {
            id: vendorOrder.storeId,
            OR: [
              { ownerId: userId },
              { members: { some: { userId } } },
              { company: { ownerId: userId } },
              { company: { members: { some: { userId } } } },
            ],
          },
        });

    if (!storeAccess) {
      throw new ForbiddenException(
        'No tienes permisos para despachar órdenes de esta tienda',
      );
    }

    // 4. Validar estado
    if (vendorOrder.status !== 'PAID') {
      throw new BadRequestException(
        'Solo se pueden despachar órdenes que hayan sido pagadas exitosamente',
      );
    }

    if (vendorOrder.deliveryStatus === 'DISPATCHED') {
      throw new BadRequestException('Esta orden ya ha sido despachada previamente');
    }

    // 5. El método de envío oficial lo determina lo que el cliente seleccionó y pagó en la compra
    const officialCourier = (
      vendorOrder.shippingProvider?.name ||
      vendorOrder.shippingCourier ||
      dto.courier ||
      'STARKEN'
    )
      .trim()
      .toUpperCase();

    const isLocalPickup = officialCourier.includes('RETIRO');
    const cleanTracking = dto.trackingNumber?.trim() || (isLocalPickup ? 'RETIRO-LOCAL' : '');

    // 6. Validación de Seguimiento Oficial y Prevención de Fraude
    const validation = await this.shippingService.validateTracking(
      officialCourier,
      cleanTracking,
      vendorOrderId,
    );

    if (!validation.valid) {
      throw new BadRequestException(
        validation.message || `El número de seguimiento no es válido para ${officialCourier}.`,
      );
    }

    let generatedTrackingUrl = dto.trackingUrl?.trim() || validation.trackingUrl;

    if (!generatedTrackingUrl && !isLocalPickup) {
      if (officialCourier.includes('STARKEN')) {
        generatedTrackingUrl = `https://www.starken.cl/seguimiento?codigo=${cleanTracking}`;
      } else if (officialCourier.includes('CHILE')) {
        generatedTrackingUrl = `https://www.chilexpress.cl/seguimiento-envios?numeroEnvio=${cleanTracking}`;
      } else if (officialCourier.includes('CORREO')) {
        generatedTrackingUrl = `https://www.correos.cl/seguimiento-en-linea?envio=${cleanTracking}`;
      } else if (officialCourier.includes('BLUE')) {
        generatedTrackingUrl = `https://www.bluex.cl/seguimiento/?tracking=${cleanTracking}`;
      }
    }

    const grossOrderTotal =
      Number(vendorOrder.subtotal) + Number(vendorOrder.shippingCost);
    const totalAbono =
      Number((vendorOrder as any).sellerNetPayout) > 0
        ? Number((vendorOrder as any).sellerNetPayout)
        : Math.max(
            0,
            grossOrderTotal - Number((vendorOrder as any).sellerCommissionGross || 0),
          );

    // Validación TapTrade Shield (Nivel 2 y 3 >= $20.000 CLP)
    if (grossOrderTotal >= 20000 && !isLocalPickup) {
      if (!dto.contentPhotoUrl || !dto.packagingPhotoUrl || !dto.packagePhotoUrl) {
        throw new BadRequestException(
          'Para pedidos iguales o superiores a $20.000 CLP es obligatorio registrar las 3 fotografías de evidencia de empaque (Protocolo TapTrade Shield).',
        );
      }
    }

    const dispatchRef = isLocalPickup
      ? `Order: ${vendorOrderId} (Entregado en local / Retiro en Tienda)`
      : `Order: ${vendorOrderId} (Despachado con ${officialCourier} #${cleanTracking})`;

    // 6. Transacción atómica: actualizar orden, insertar asiento inmutable ESCROW_RELEASE y sincronizar balance
    return await this.prisma.$transaction(async (tx) => {
      // A. Actualizar VendorOrder
      const updatedVendorOrder = await tx.vendorOrder.update({
        where: { id: vendorOrderId },
        data: {
          deliveryStatus: 'DISPATCHED',
          shippingCourier: officialCourier,
          trackingNumber: cleanTracking,
          trackingUrl: generatedTrackingUrl || null,
          dispatchedAt: new Date(),
          ...(dto.buyerDteType ? { buyerDteType: Number(dto.buyerDteType) } : {}),
          ...(dto.buyerDteFolio ? { buyerDteFolio: dto.buyerDteFolio.trim() } : {}),
          ...(dto.buyerDteUrl ? { buyerDteUrl: dto.buyerDteUrl.trim() } : {}),
        },
      });

      // B. Liberar fondos desde Custodia (ESCROW) a Disponible (AVAILABLE) en el Ledger inmutable (sin mutar el asiento SALE original)
      const releaseResult = await this.financialLedger.releaseVendorOrderFromEscrow(
        {
          storeId: vendorOrder.storeId,
          orderId: vendorOrder.orderId,
          vendorOrderId,
          releaseReference: dispatchRef,
          createdByUserId: userId,
          fallbackAmount: totalAbono,
          paymentMethod: 'WEBPAY',
        },
        tx,
      );

      // C. Guardar evidencia fotográfica (TapTrade Shield)
      if (dto.contentPhotoUrl && dto.packagingPhotoUrl && dto.packagePhotoUrl) {
        await tx.dispatchEvidence.upsert({
          where: { vendorOrderId },
          create: {
            vendorOrderId,
            contentPhotoUrl: dto.contentPhotoUrl,
            packagingPhotoUrl: dto.packagingPhotoUrl,
            packagePhotoUrl: dto.packagePhotoUrl,
            uploaderUserId: userId,
            lifecycleExpiresAt: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
          },
          update: {
            contentPhotoUrl: dto.contentPhotoUrl,
            packagingPhotoUrl: dto.packagingPhotoUrl,
            packagePhotoUrl: dto.packagePhotoUrl,
            uploaderUserId: userId,
          },
        });
      }

      return {
        success: true,
        message: 'Pedido despachado y fondos liberados exitosamente a la billetera',
        vendorOrder: updatedVendorOrder,
        releasedAmount: releaseResult.releasedAmount,
        newBalance: releaseResult.newAvailableBalance,
      };
    });
  }
}
