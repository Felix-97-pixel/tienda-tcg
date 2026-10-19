import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { WebpayProvider } from '../../providers/webpay.provider';
import { CommitTransactionCommand } from '../impl/commit-transaction.command';

/**
 * Handler: Procesa el comando de confirmar transacción.
 * Confirma la tx con Webpay y ejecuta transacción atómica
 * para actualizar pago, orden y descuento de stock.
 */
@CommandHandler(CommitTransactionCommand)
export class CommitTransactionHandler
  implements ICommandHandler<CommitTransactionCommand>
{
  private readonly logger = new Logger(CommitTransactionHandler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly webpay: WebpayProvider,
  ) {}

  async execute(command: CommitTransactionCommand) {
    const { token } = command;

    const payment = await this.prisma.payment.findUnique({
      where: { token },
      include: {
        order: {
          include: {
            vendorOrders: {
              include: { items: true },
            },
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException('Pago no encontrado para ese token');
    }

    const result = await this.webpay.transaction.commit(token);

    this.logger.log(`Resultado commit Webpay: ${JSON.stringify(result)}`);

    const isApproved =
      result.response_code === 0 && result.status === 'AUTHORIZED';

    // Ejecutar todo en una transacción atómica
    await this.prisma.$transaction(async (tx) => {
      // 1. Actualizar pago
      await tx.payment.update({
        where: { token },
        data: {
          status: isApproved ? 'AUTHORIZED' : 'FAILED',
          authCode: result.authorization_code,
          cardLast4: result.card_detail?.card_number,
          paymentType: result.payment_type_code,
          installments: result.installments_number,
          transactionDate: result.transaction_date
            ? new Date(result.transaction_date)
            : null,
        },
      });

      // 1.5 Limpiar reservas de stock de esta orden
      const reservations = await tx.stockReservation.findMany({
        where: { orderId: payment.orderId }
      });
      for (const res of reservations) {
         await tx.inventoryItem.update({
            where: { id: res.inventoryItemId },
            data: { reservedStock: { decrement: res.quantity } }
         });
      }
      await tx.stockReservation.deleteMany({
        where: { orderId: payment.orderId }
      });

      // 2. Actualizar Master Order
      await tx.order.update({
        where: { id: payment.orderId },
        data: { status: isApproved ? 'PAID' : 'FAILED' },
      });

      // 3. Procesar VendorOrders
      for (const vendorOrder of payment.order.vendorOrders) {
        // Actualizar estado de la sub-orden
        await tx.vendorOrder.update({
          where: { id: vendorOrder.id },
          data: {
            status: isApproved ? 'PAID' : 'FAILED',
            deliveryStatus: isApproved ? 'PENDING_DISPATCH' : undefined,
          },
        });

        if (isApproved) {
          // Descontar stock
          const itemsConInventario = vendorOrder.items.filter(
            (i) => i.inventoryItemId,
          );

          for (const item of itemsConInventario) {
            const inventory = await tx.inventoryItem.findUnique({
              where: { id: item.inventoryItemId! },
            });

            if (inventory) {
              const newStock = Math.max(0, inventory.stock - item.quantity);
              await tx.inventoryItem.update({
                where: { id: item.inventoryItemId! },
                data: { stock: newStock },
              });
            }
          }

          // SaaS Model & Escrow: Registrar en la Billetera en CUSTODIA (isWithdrawable: false)
          // El saldo disponible se liberará cuando la tienda ingrese el despacho oficial
          const baseSubtotal = Number(vendorOrder.subtotal);
          const totalAbono = baseSubtotal + Number(vendorOrder.shippingCost);

          await tx.walletTransaction.create({
            data: {
              storeId: vendorOrder.storeId,
              amount: totalAbono,
              type: 'SALE',
              paymentMethod: 'WEBPAY',
              isWithdrawable: false,
              reference: `Order: ${vendorOrder.id} (Custodia - Pendiente de Despacho)`,
            },
          });
        }
      }
    });

    return {
      approved: isApproved,
      orderId: payment.orderId,
      buyOrder: result.buy_order,
      amount: result.amount,
      authCode: result.authorization_code,
      cardLast4: result.card_detail?.card_number,
      paymentType: result.payment_type_code,
      installments: result.installments_number,
      transactionDate: result.transaction_date,
      responseCode: result.response_code,
    };
  }
}
