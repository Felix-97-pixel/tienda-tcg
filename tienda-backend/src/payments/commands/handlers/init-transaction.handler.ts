import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { WebpayProvider } from '../../providers/webpay.provider';
import { ShippingService } from '../../../shipping/shipping.service';
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
    private readonly shippingService: ShippingService,
  ) {}

  async execute(command: InitTransactionCommand) {
    const { dto, userId, returnUrl } = command;

    // 1. Obtener información de inventario para saber el storeId de cada item y SU PRECIO REAL
    const itemsWithRealData = await Promise.all(
      dto.items.map(async (item) => {
        let storeId = 'admin-store';
        let realUnitPrice = 0;
        let productName = item.productName;

        if (item.inventoryItemId) {
          const inv = await this.prisma.inventoryItem.findUnique({
            where: { id: item.inventoryItemId },
            select: {
              storeId: true,
              stock: true,
              reservedStock: true,
              price: true,
              product: {
                select: {
                  name: true,
                  cardDetail: {
                    select: { gameId: true },
                  },
                },
              },
            },
          });
          if (!inv) {
            throw new BadRequestException('Un producto del carrito no existe en la base de datos.');
          }
          const availableStock = inv.stock - inv.reservedStock;
          if (availableStock < item.quantity) {
             throw new BadRequestException(`El producto ${inv.product.name} no tiene suficiente stock disponible (Alguien más está procesando su compra).`);
          }
          if (inv.storeId) storeId = inv.storeId;
          productName = inv.product.name;

          const rawPrice = Number(inv.price);
          const gameId = inv.product.cardDetail?.gameId;

          if (gameId) {
            let itemRate = 1000;
            if (storeId && storeId !== 'admin-store') {
              const storeRate = await this.prisma.storeGameExchangeRate.findUnique({
                where: { storeId_gameId: { storeId, gameId } },
              });
              if (storeRate) {
                itemRate = Number(storeRate.rate);
              } else {
                const globalRate = await this.prisma.globalGameExchangeRate.findUnique({
                  where: { gameId_currencyCode: { gameId, currencyCode: 'CLP' } },
                });
                if (globalRate) {
                  itemRate = Number(globalRate.rate);
                }
              }
            } else {
              const globalRate = await this.prisma.globalGameExchangeRate.findUnique({
                where: { gameId_currencyCode: { gameId, currencyCode: 'CLP' } },
              });
              if (globalRate) {
                itemRate = Number(globalRate.rate);
              }
            }
            realUnitPrice = Math.round(rawPrice * itemRate);
          } else {
            realUnitPrice = Math.round(rawPrice);
          }
        } else {
          // Para productos custom o sin inventario directo
          realUnitPrice = Math.round(Number(item.unitPrice));
        }
        return { ...item, storeId, realUnitPrice, productName };
      })
    );

    // 2. Agrupar items por storeId
    const vendorGroups = itemsWithRealData.reduce((acc, item) => {
      if (!acc[item.storeId]) {
        acc[item.storeId] = [];
      }
      acc[item.storeId].push(item);
      return acc;
    }, {} as Record<string, typeof itemsWithRealData>);

    // Get default currency
    const defaultCurrency = await this.prisma.currency.findFirst({
      where: { isDefault: true },
    });

    const currencyCode = dto.currency || defaultCurrency?.code || 'CLP';
    const exchangeRate = Number(dto.exchangeRate || defaultCurrency?.exchangeRate || 1);

    // Obtener costo de envío
    if (!dto.storeShippingProviders || Object.keys(dto.storeShippingProviders).length === 0) {
      throw new BadRequestException('El proveedor de envío es obligatorio para cada tienda.');
    }

    // Obtener cotización dinámica en vivo para calcular el costo de envío exacto
    let dynamicQuotes: Record<string, any> = {};
    if (dto.cityCode || dto.city) {
      try {
        const quotesResult = await this.shippingService.quoteCartShipping({
          destinationCommune: dto.cityCode || dto.city,
          destinationRegion: dto.regionCode,
          cartItems: itemsWithRealData.map((item) => ({
            productId: item.productId,
            storeId: item.storeId,
            quantity: item.quantity,
            productName: item.productName,
          })),
        });
        dynamicQuotes = quotesResult.stores || {};
      } catch (err: any) {
        this.logger.warn(`No se pudo obtener cotización dinámica en backend: ${err.message}`);
      }
    }

    // Calcular totales
    let globalSubtotal = 0;
    let totalShippingCost = 0;
    const vendorOrdersData = [];

    for (const [storeId, items] of Object.entries(vendorGroups)) {
      const store = await this.prisma.store.findUnique({
        where: { id: storeId },
        select: { id: true, name: true, pickupEnabled: true },
      });
      if (!store) throw new NotFoundException(`Tienda ${storeId} no encontrada`);

      const shippingProviderId = dto.storeShippingProviders[storeId];
      if (!shippingProviderId) {
        throw new BadRequestException(`No se ha seleccionado método de envío para la tienda ${store.name}.`);
      }

      let storeShippingCost = 0;
      let finalShippingProviderId: string | null = null;
      let shippingCourierName: string | null = null;
      let deliveryStatus = 'PENDING_DISPATCH';

      const isPickup =
        shippingProviderId === 'RETIRO_TIENDA' ||
        shippingProviderId.startsWith('pickup_') ||
        shippingProviderId === 'pickup';

      if (isPickup) {
        if (!store.pickupEnabled) {
          throw new BadRequestException(`La tienda ${store.name} no tiene habilitada la opción de retiro en tienda.`);
        }
        storeShippingCost = 0;
        finalShippingProviderId = null;
        shippingCourierName = 'RETIRO_TIENDA';
        deliveryStatus = 'PENDING_PICKUP';
      } else {
        const provider = await this.prisma.shippingProvider.findUnique({
          where: { id: shippingProviderId }
        });
        if (!provider) {
          throw new BadRequestException(`El proveedor de envío seleccionado para la tienda ${store.name} no es válido.`);
        }
        finalShippingProviderId = provider.id;
        shippingCourierName = provider.name;

        // Buscar la opción cotizada dinámicamente para esta tienda
        const storeQuote = dynamicQuotes[storeId];
        const matchedOption = storeQuote?.options?.find(
          (opt: any) => opt.id === shippingProviderId || opt.provider === provider.name
        );
        if (matchedOption && typeof matchedOption.price === 'number') {
          storeShippingCost = Math.round(matchedOption.price);
        } else {
          storeShippingCost = Number(provider.price);
        }
      }

      totalShippingCost += storeShippingCost;

      // Calcular subtotal BASE con el PRECIO REAL DE LA BD en CLP
      const vendorBaseSubtotal = items.reduce(
        (sum, i) => sum + i.realUnitPrice * i.quantity,
        0,
      );
      
      // SaaS Model: 0% Comisión por venta. El subtotal es exactamente el precio neto de la tienda
      globalSubtotal += vendorBaseSubtotal;
      
      vendorOrdersData.push({
        storeId,
        shippingProviderId: finalShippingProviderId,
        shippingCourier: shippingCourierName,
        deliveryStatus,
        shippingCost: storeShippingCost,
        subtotal: vendorBaseSubtotal,
        status: 'PENDING',
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            inventoryItemId: item.inventoryItemId,
            productName: item.productName,
            quantity: item.quantity,
            // SaaS Model: El precio unitario guardado en la orden es exactamente el fijado por la tienda (0% markup)
            unitPrice: item.realUnitPrice,
          })),
        },
      });
    }

    const totalWithShipping = globalSubtotal + totalShippingCost;

    // SaaS Model: Traspaso de la tarifa de procesamiento de pasarela al cliente (Webpay Plus: ~2.90%)
    const gatewayFeeRate = 0.029;
    const computedFee = Math.round(totalWithShipping * gatewayFeeRate);
    const gatewayFee = dto.gatewayFee && Number(dto.gatewayFee) > 0 ? Math.round(Number(dto.gatewayFee)) : computedFee;
    const finalChargedAmount = totalWithShipping + gatewayFee;

    // Generar buyOrder único
    const buyOrder = `ORD-${Date.now()}`.slice(0, 26);
    const sessionId = `SES-${Date.now()}`.slice(0, 61);

    const orderNotes = dto.notes
      ? `${dto.notes} | Tarifa de pasarela (2.90%): $${gatewayFee.toLocaleString('es-CL')}`
      : `Tarifa de pasarela (2.90%): $${gatewayFee.toLocaleString('es-CL')}`;

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
        cityCode: dto.cityCode,
        regionCode: dto.regionCode,
        notes: orderNotes,
        totalAmount: finalChargedAmount,
        currencyCode,
        exchangeRate,
        status: 'PENDING',
        vendorOrders: {
          create: vendorOrdersData as any,
        },
        reservations: {
          create: dto.items
            .filter(i => i.inventoryItemId)
            .map(item => ({
              inventoryItemId: item.inventoryItemId,
              quantity: item.quantity,
              expiresAt: new Date(Date.now() + 15 * 60 * 1000)
            }))
        }
      },
    });

    for (const item of dto.items) {
      if (item.inventoryItemId) {
        await this.prisma.inventoryItem.update({
          where: { id: item.inventoryItemId },
          data: { reservedStock: { increment: item.quantity } }
        });
      }
    }

    // Llamar a Webpay para crear transacción
    const amountInCLP = Math.round(finalChargedAmount); // Webpay usa enteros en CLP
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
