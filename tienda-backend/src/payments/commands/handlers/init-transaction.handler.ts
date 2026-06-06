import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { WebpayProvider } from '../../providers/webpay.provider';
import { InitTransactionCommand } from '../impl/init-transaction.command';

/**
 * Handler: Procesa el comando de iniciar transacción.
 * Crea la orden en BD e inicia la transacción con Webpay.
 */
@CommandHandler(InitTransactionCommand)
export class InitTransactionHandler
  implements ICommandHandler<InitTransactionCommand>
{
  private readonly logger = new Logger(InitTransactionHandler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly webpay: WebpayProvider,
  ) {}

  async execute(command: InitTransactionCommand) {
    const { dto, userId, returnUrl } = command;

    // 1. Obtener información de inventario para saber el storeId de cada item
    const itemsWithStoreId = await Promise.all(
      dto.items.map(async (item) => {
        let storeId = 'admin-store'; // Default o deberías manejar un store global
        if (item.inventoryItemId) {
          const inv = await this.prisma.inventoryItem.findUnique({
            where: { id: item.inventoryItemId },
            select: { storeId: true }
          });
          if (inv && inv.storeId) storeId = inv.storeId;
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

    // Get default currency
    const defaultCurrency = await this.prisma.currency.findFirst({
      where: { isDefault: true },
    });

    const currencyCode = dto.currency || defaultCurrency?.code || 'CLP';
    const exchangeRate = Number(dto.exchangeRate || defaultCurrency?.exchangeRate || 1);

    // Obtener costo de envío
    if (!dto.shippingProviderId) {
      throw new BadRequestException('El proveedor de envío es obligatorio.');
    }
    const provider = await this.prisma.shippingProvider.findUnique({
      where: { id: dto.shippingProviderId },
    });
    if (!provider) {
      throw new BadRequestException('El proveedor de envío seleccionado no es válido.');
    }
    const baseShippingCost = Number(provider.price);

    // Calcular totales
    let globalSubtotal = 0;
    const vendorOrdersData = [];

    for (const [storeId, items] of Object.entries(vendorGroups)) {
      const vendorBaseSubtotal = items.reduce(
        (sum, i) => sum + i.unitPrice * i.quantity * exchangeRate,
        0,
      );
      
      // Agregar 5% de comisión al subtotal para que lo pague el comprador
      const commission = vendorBaseSubtotal * 0.05;
      const vendorSubtotalWithCommission = vendorBaseSubtotal + commission;

      globalSubtotal += vendorSubtotalWithCommission;
      
      vendorOrdersData.push({
        storeId,
        shippingProviderId: dto.shippingProviderId,
        shippingCost: baseShippingCost,
        subtotal: vendorSubtotalWithCommission,
        status: 'PENDING',
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            inventoryItemId: item.inventoryItemId,
            productName: item.productName,
            quantity: item.quantity,
            // El precio unitario guardado en la orden incluye el 5% de markup
            unitPrice: (item.unitPrice * exchangeRate) * 1.05,
          })),
        },
      });
    }

    const totalShippingCost = baseShippingCost * Object.keys(vendorGroups).length; // Cobra un envío por cada vendedor
    const totalWithShipping = globalSubtotal + totalShippingCost;

    // Generar buyOrder único
    const buyOrder = `ORD-${Date.now()}`.slice(0, 26);
    const sessionId = `SES-${Date.now()}`.slice(0, 61);

    // Guardar orden en BD
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
        totalAmount: totalWithShipping,
        currencyCode,
        exchangeRate,
        status: 'PENDING',
        vendorOrders: {
          create: vendorOrdersData as any,
        },
      },
    });

    // Llamar a Webpay para crear transacción
    const amountInCLP = Math.round(totalWithShipping); // Webpay usa enteros en CLP
    const response = await this.webpay.transaction.create(
      buyOrder,
      sessionId,
      amountInCLP,
      returnUrl,
    );

    // Guardar token en BD
    await this.prisma.payment.create({
      data: {
        orderId: order.id,
        token: response.token,
        amount: totalWithShipping,
        status: 'PENDING',
      },
    });

    this.logger.log(
      `Transacción iniciada: buyOrder=${buyOrder}, token=${response.token}, total=${totalWithShipping}`,
    );

    return {
      token: response.token,
      url: response.url,
      orderId: order.id,
      buyOrder,
    };
  }
}
