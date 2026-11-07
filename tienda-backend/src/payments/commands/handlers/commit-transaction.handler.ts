import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { WebpayProvider } from '../../providers/webpay.provider';
import { FinancialLedgerService } from '../../../tax/financial-ledger.service';
import { CommitTransactionCommand } from '../impl/commit-transaction.command';

/**
 * Handler: Procesa el comando de confirmar transacción.
 * Confirma la tx con Webpay y ejecuta transacción atómica e idempotente
 * para actualizar pago, orden, descuento de stock y registro en el Ledger inmutable.
 */
@CommandHandler(CommitTransactionCommand)
export class CommitTransactionHandler
  implements ICommandHandler<CommitTransactionCommand>
{
  private readonly logger = new Logger(CommitTransactionHandler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly webpay: WebpayProvider,
    private readonly financialLedger: FinancialLedgerService,
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

    // Control de idempotencia: si el pago ya fue confirmado previamente, devolver el estado existente
    if (payment.status === 'AUTHORIZED' && payment.order.status === 'PAID') {
      return {
        approved: true,
        orderId: payment.orderId,
        buyOrder: payment.order.buyOrder,
        amount: Number(payment.amount),
        authCode: payment.authCode,
        cardLast4: payment.cardLast4,
        paymentType: payment.paymentType,
        installments: payment.installments,
        transactionDate: payment.transactionDate,
        responseCode: 0,
      };
    }

    const result = await this.webpay.transaction.commit(token);

    this.logger.log(`Resultado commit Webpay: ${JSON.stringify(result)}`);

        const isApproved =
      result.response_code === 0 && result.status === 'AUTHORIZED';

    // VALIDACION CRITICA: Verificar que el monto y la orden de compra coincidan exactamente
    const amountMatches = Number(result.amount) === Number(payment.amount);
    const orderMatches = result.buy_order === payment.order.buyOrder;

    if (isApproved && (!amountMatches || !orderMatches)) {
      this.logger.error(
        `Descuadre Webpay detectado para token=${token}: esperado=${payment.amount} (buyOrder=${payment.order.buyOrder}), recibido=${result.amount} (buyOrder=${result.buy_order})`
      );
      await this.prisma.payment.update({
        where: { token },
        data: { status: 'FAILED' },
      });
      throw new ConflictException('El monto o identificador autorizado no coincide con la orden registrada');
    }

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

          // Registrar en el Libro Mayor Inmutable (Ledger) en CUSTODIA (ESCROW) + Comisión Vendedor si aplica
          const grossSale = Number(vendorOrder.subtotal) + Number(vendorOrder.shippingCost);
          const sellerCommNet = Number((vendorOrder as any).sellerCommissionNet || 0);
          const sellerCommVat = Number((vendorOrder as any).sellerCommissionVat || 0);
          const sellerCommGross = Number((vendorOrder as any).sellerCommissionGross || 0);
          const sellerNetPayout =
            Number((vendorOrder as any).sellerNetPayout) > 0
              ? Number((vendorOrder as any).sellerNetPayout)
              : Math.max(0, grossSale - sellerCommGross);

          await this.financialLedger.recordVendorSaleInEscrow(
            {
              storeId: vendorOrder.storeId,
              orderId: payment.orderId,
              vendorOrderId: vendorOrder.id,
              grossSaleAmount: grossSale,
              taxableNet: Number(vendorOrder.taxableNet || 0),
              vatAmount: Number(vendorOrder.vatAmount || 0),
              sellerCommissionNet: sellerCommNet,
              sellerCommissionVat: sellerCommVat,
              sellerCommissionGross: sellerCommGross,
              sellerNetPayout,
              paymentMethod: 'WEBPAY',
              createdByUserId: payment.order.userId || 'WEBPAY_CALLBACK',
            },
            tx,
          );
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
