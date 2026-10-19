import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../prisma/prisma.service';
import { DispatchVendorOrderCommand } from '../impl/dispatch-vendor-order.command';

@Injectable()
@CommandHandler(DispatchVendorOrderCommand)
export class DispatchVendorOrderHandler
  implements ICommandHandler<DispatchVendorOrderCommand>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: DispatchVendorOrderCommand) {
    const { vendorOrderId, dto, userId } = command;

    // 1. Obtener usuario y su tienda
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { store: true },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // 2. Obtener la sub-orden (VendorOrder)
    const vendorOrder = await this.prisma.vendorOrder.findUnique({
      where: { id: vendorOrderId },
      include: { store: true, order: true },
    });

    if (!vendorOrder) {
      throw new NotFoundException('Sub-orden de tienda no encontrada');
    }

    // 3. Validar permisos: debe ser el dueño de la tienda o un SUPERADMIN
    const isOwner = user.store?.id === vendorOrder.storeId;
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

    // 5. Normalizar courier y generar URL de seguimiento oficial
    const cleanTracking = dto.trackingNumber.trim();
    const courierUpper = dto.courier.trim().toUpperCase();
    let generatedTrackingUrl = dto.trackingUrl?.trim();

    if (!generatedTrackingUrl) {
      if (courierUpper.includes('STARKEN')) {
        generatedTrackingUrl = `https://www.starken.cl/seguimiento?codigo=${cleanTracking}`;
      } else if (courierUpper.includes('CHILE')) {
        generatedTrackingUrl = `https://www.chilexpress.cl/seguimiento-envios?numeroEnvio=${cleanTracking}`;
      } else if (courierUpper.includes('CORREO')) {
        generatedTrackingUrl = `https://www.correos.cl/seguimiento-en-linea?envio=${cleanTracking}`;
      } else if (courierUpper.includes('BLUE')) {
        generatedTrackingUrl = `https://www.bluex.cl/seguimiento/?tracking=${cleanTracking}`;
      }
    }

    const totalAbono =
      Number(vendorOrder.subtotal) + Number(vendorOrder.shippingCost);

    // 6. Transacción atómica: actualizar orden, liberar custodia en billetera e incrementar balance
    return await this.prisma.$transaction(async (tx) => {
      // A. Actualizar VendorOrder
      const updatedVendorOrder = await tx.vendorOrder.update({
        where: { id: vendorOrderId },
        data: {
          deliveryStatus: 'DISPATCHED',
          shippingCourier: courierUpper,
          trackingNumber: cleanTracking,
          trackingUrl: generatedTrackingUrl,
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
            reference: `Order: ${vendorOrderId} (Despachado con ${courierUpper} #${cleanTracking})`,
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
            reference: `Order: ${vendorOrderId} (Despachado con ${courierUpper} #${cleanTracking})`,
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
