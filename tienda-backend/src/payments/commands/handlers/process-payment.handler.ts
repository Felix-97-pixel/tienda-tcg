import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { MercadoPagoProvider } from '../../providers/mercadopago.provider';
import { ProcessPaymentCommand } from '../impl/process-payment.command';

@CommandHandler(ProcessPaymentCommand)
export class ProcessPaymentHandler implements ICommandHandler<ProcessPaymentCommand> {
  private readonly logger = new Logger(ProcessPaymentHandler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mp: MercadoPagoProvider,
  ) {}

  async execute(command: ProcessPaymentCommand) {
    const { dto, userId } = command;

    // 1. Obtener información de inventario para saber el storeId de cada item
    const itemsWithStoreId = await Promise.all(
      dto.items.map(async (item) => {
        let storeId = null;
        if (item.inventoryItemId) {
          const inv = await this.prisma.inventoryItem.findUnique({
            where: { id: item.inventoryItemId },
            select: { storeId: true }
          });
          if (inv && inv.storeId) storeId = inv.storeId;
        }
        if (!storeId) {
          throw new BadRequestException(`No se encontró la tienda para el producto ${item.productName}`);
        }
        return { ...item, storeId };
      })
    );

    // 2. Agrupar items por storeId
    const vendorGroups = itemsWithStoreId.reduce((acc, item) => {
      if (!acc[item.storeId]) {
        acc[item.storeId] = [];
      }
      acc[item.storeId].push(item);
      return acc;
    }, {} as Record<string, typeof itemsWithStoreId>);

    const defaultCurrency = await this.prisma.currency.findFirst({
      where: { isDefault: true },
    });

    const currencyCode = dto.currency || defaultCurrency?.code || 'CLP';
    const exchangeRate = Number(dto.exchangeRate || defaultCurrency?.exchangeRate || 1);

    if (!dto.storeShippingProviders || Object.keys(dto.storeShippingProviders).length === 0) {
      throw new BadRequestException('El proveedor de envío es obligatorio para cada tienda.');
    }

    let globalTotal = 0;
    const vendorOrdersData = [];
    const disbursements = [];

    for (const [storeId, items] of Object.entries(vendorGroups)) {
      const store = await this.prisma.store.findUnique({
        where: { id: storeId },
        include: { subscriptionPlans: true, settings: true },
      });

      if (!store) throw new NotFoundException(`Tienda ${storeId} no encontrada`);

      const shippingProviderId = dto.storeShippingProviders[storeId];
      if (!shippingProviderId) {
        throw new BadRequestException(`No se ha seleccionado método de envío para la tienda ${store.name}`);
      }
      const provider = await this.prisma.shippingProvider.findUnique({
        where: { id: shippingProviderId }
      });
      if (!provider) {
        throw new BadRequestException(`El proveedor de envío seleccionado para la tienda ${store.name} no es válido.`);
      }
      const storeShippingCost = Number(provider.price);

      const mpUserIdSetting = store.settings.find(s => s.key === 'MP_USER_ID');
      if (!mpUserIdSetting || !mpUserIdSetting.value) {
        throw new BadRequestException(`La tienda ${store.name} no ha configurado Mercado Pago.`);
      }
      const sellerMpUserId = Number(mpUserIdSetting.value);

      const vendorBaseSubtotal = items.reduce(
        (sum, i) => sum + i.unitPrice * i.quantity * exchangeRate,
        0,
      );

      // 3. Calcular comisión basada en el plan base
      const commissionRate = store.subscriptionPlans?.[0]?.commissionRate || 0; // Decimal, ej: 0.05
      const commissionAmount = vendorBaseSubtotal * Number(commissionRate);

      const vendorTotal = vendorBaseSubtotal + storeShippingCost; // Precio productos + envío
      globalTotal += vendorTotal;

      vendorOrdersData.push({
        storeId,
        shippingProviderId,
        shippingCost: storeShippingCost,
        subtotal: vendorBaseSubtotal,
        status: 'PENDING',
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            inventoryItemId: item.inventoryItemId,
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice * exchangeRate,
          })),
        },
      });

      // Lo que recibe el vendedor directo a su MP
      const sellerReceives = vendorTotal - commissionAmount;

      disbursements.push({
        collector_id: sellerMpUserId,
        amount: Math.round(sellerReceives),
        external_reference: `Store: ${storeId}`,
        money_release_days: 0,
        money_release_rule: 'immediate',
      });
    }

    const buyOrder = `ORD-${Date.now()}`.slice(0, 26);

    // 4. Ejecutar la llamada a Mercado Pago
    let paymentResponse;
    try {
      const payload: any = {
        transaction_amount: Math.round(globalTotal),
        token: dto.token,
        description: `Compra E-commerce - ${buyOrder}`,
        installments: dto.installments,
        payment_method_id: dto.payment_method_id,
        issuer_id: dto.issuer_id,
        payer: {
          email: dto.email,
        },
        // Injection of disbursements for Split Payment / Marketplace
        disbursements: disbursements,
      };

      paymentResponse = await this.mp.payment.create({
        body: payload,
      });
      
    } catch (error) {
      this.logger.error('Error procesando pago con Mercado Pago', error);
      throw new BadRequestException('Error al procesar el pago con la tarjeta.');
    }

    // 5. Guardar Orden en BD
    const isApproved = paymentResponse.status === 'approved';
    const statusDb = isApproved ? 'PAID' : 'FAILED';

    const order = await this.prisma.order.create({
      data: {
        buyOrder,
        userId,
        email: dto.email,
        name: dto.name,
        phone: dto.phone,
        address: dto.address,
        city: dto.city,
        notes: dto.notes,
        totalAmount: globalTotal,
        currencyCode,
        exchangeRate,
        status: statusDb,
        vendorOrders: {
          create: vendorOrdersData.map(v => ({ ...v, status: statusDb })) as any,
        },
      },
      include: { vendorOrders: { include: { items: true } } }
    });

    await this.prisma.payment.create({
      data: {
        orderId: order.id,
        token: String(paymentResponse.id), // MP Payment ID
        amount: globalTotal,
        status: isApproved ? 'AUTHORIZED' : 'FAILED',
        paymentType: dto.payment_method_id,
        installments: dto.installments,
      },
    });

    // 6. Si fue aprobado, procesar inventario y balances
    if (isApproved) {
      await this.prisma.$transaction(async (tx) => {
        for (const vendorOrder of order.vendorOrders) {
          const itemsConInventario = vendorOrder.items.filter(i => i.inventoryItemId);

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

          // Registrar en la Billetera para historial e informes.
          const store = await tx.store.findUnique({
            where: { id: vendorOrder.storeId },
            include: { subscriptionPlans: true }
          });
          const commRate = Number(store?.subscriptionPlans?.[0]?.commissionRate || 0);
          const commissionAmount = Number(vendorOrder.subtotal) * commRate;
          const totalAbono = Number(vendorOrder.subtotal) + Number(vendorOrder.shippingCost) - commissionAmount;

          await tx.walletTransaction.create({
            data: {
              storeId: vendorOrder.storeId,
              amount: totalAbono,
              type: 'SALE',
              reference: `Order: ${vendorOrder.id} (MP Split)`,
            },
          });
        }
      });
    }

    return {
      approved: isApproved,
      orderId: order.id,
      paymentId: paymentResponse.id,
      status: paymentResponse.status,
      status_detail: paymentResponse.status_detail,
    };
  }
}
