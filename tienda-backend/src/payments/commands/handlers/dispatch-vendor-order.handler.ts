import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../prisma/prisma.service';
import { ShippingService } from '../../../shipping/shipping.service';
import { DispatchVendorOrderCommand } from '../impl/dispatch-vendor-order.command';

@Injectable()
@CommandHandler(DispatchVendorOrderCommand)
export class DispatchVendorOrderHandler
  implements ICommandHandler<DispatchVendorOrderCommand>
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly shippingService: ShippingService,
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

    // 3. Validar permisos: debe ser el dueño de la tienda o un SUPERADMIN
    const isOwner = user.stores?.some((s: any) => s.id === vendorOrder.storeId);
    const isSuperAdmin = user.role === 'SUPERADMIN';

    if (!isOwner && !isSuperAdmin) {
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

    const totalAbono =
      Number(vendorOrder.subtotal) + Number(vendorOrder.shippingCost);

    const dispatchRef = isLocalPickup
      ? `Order: ${vendorOrderId} (Entregado en local / Retiro en Tienda)`
      : `Order: ${vendorOrderId} (Despachado con ${officialCourier} #${cleanTracking})`;

    // 6. Transacción atómica: actualizar orden, liberar custodia en billetera e incrementar balance
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
        },
      });

      // B. Buscar la transacción de venta en custodia (isWithdrawable: false)
      const heldTx = await tx.walletTransaction.findFirst({
        where: {
          storeId: vendorOrder.storeId,
          type: 'SALE',
          isWithdrawable: false,
          reference: { contains: vendorOrderId },
        },
      });

      if (heldTx) {
        // Liberar fondos en la transacción existente
        await tx.walletTransaction.update({
          where: { id: heldTx.id },
          data: {
            isWithdrawable: true,
            reference: dispatchRef,
          },
        });
      } else {
        // Si no existía transacción previa retenida, registrarla directamente como disponible
        await tx.walletTransaction.create({
          data: {
            storeId: vendorOrder.storeId,
            amount: totalAbono,
            type: 'SALE',
            paymentMethod: 'WEBPAY',
            isWithdrawable: true,
            reference: dispatchRef,
          },
        });
      }

      // C. Incrementar saldo disponible para retiro en la tienda
      const updatedStore = await tx.store.update({
        where: { id: vendorOrder.storeId },
        data: {
          balance: { increment: totalAbono },
        },
      });

      return {
        success: true,
        message: 'Pedido despachado y fondos liberados exitosamente a la billetera',
        vendorOrder: updatedVendorOrder,
        releasedAmount: totalAbono,
        newBalance: Number(updatedStore.balance),
      };
    });
  }
}
