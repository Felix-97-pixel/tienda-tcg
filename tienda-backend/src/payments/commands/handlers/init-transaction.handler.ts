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

    // Calcular total en la moneda base (USD típicamente)
    const baseTotal = dto.items.reduce(
      (sum, i) => sum + i.unitPrice * i.quantity,
      0,
    );

    // Get default currency
    const defaultCurrency = await this.prisma.currency.findFirst({
      where: { isDefault: true },
    });

    const currencyCode = dto.currency || defaultCurrency?.code || 'CLP';
    const exchangeRate = Number(dto.exchangeRate || defaultCurrency?.exchangeRate || 1);

    // Convert total to CLP using exchange rate since Webpay only accepts CLP
    const total = baseTotal * exchangeRate;

    // Obtener costo de envío dinámico y seguro desde la base de datos
    if (!dto.shippingProviderId) {
      throw new BadRequestException('El proveedor de envío es obligatorio.');
    }

    const provider = await this.prisma.shippingProvider.findUnique({
      where: { id: dto.shippingProviderId },
    });

    if (!provider) {
      throw new BadRequestException('El proveedor de envío seleccionado no es válido.');
    }

    const shippingCost = Number(provider.price);
    const totalWithShipping = total + shippingCost;

    // Generar buyOrder único (máx 26 chars para Webpay)
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
        shippingProviderId: dto.shippingProviderId,
        shippingCost: shippingCost,
        status: 'PENDING',
        items: {
          create: dto.items.map((item) => ({
            productId: item.productId,
            inventoryItemId: item.inventoryItemId,
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice * exchangeRate,
          })),
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
