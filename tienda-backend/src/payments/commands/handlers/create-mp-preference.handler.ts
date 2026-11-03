import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { MercadoPagoProvider } from '../../providers/mercadopago.provider';
import { ShippingService } from '../../../shipping/shipping.service';
import { PricingService } from '../../../tax/pricing.service';
import { CheckoutPricingService } from '../../../tax/checkout-pricing.service';
import { CreateMpPreferenceCommand } from '../impl/create-mp-preference.command';

/**
 * Handler: Procesa la creación de una Preferencia de Pago en Mercado Pago (Checkout Pro).
 * Crea la orden en BD con snapshot tributario, bloquea/reserva stock e inicia la preferencia con Mercado Pago.
 */
@CommandHandler(CreateMpPreferenceCommand)
export class CreateMpPreferenceHandler
  implements ICommandHandler<CreateMpPreferenceCommand>
{
  private readonly logger = new Logger(CreateMpPreferenceHandler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mp: MercadoPagoProvider,
    private readonly shippingService: ShippingService,
    private readonly pricingService: PricingService,
    private readonly checkoutPricing: CheckoutPricingService,
  ) {}

  async execute(command: CreateMpPreferenceCommand) {
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
            throw new BadRequestException(
              `El producto ${inv.product.name} no tiene suficiente stock disponible (Alguien más está procesando su compra).`,
            );
          }
          if (inv.storeId) storeId = inv.storeId;
          productName = inv.product.name;

          // Resolver precio BRUTO (IVA incluido) en CLP entero
          realUnitPrice = await this.pricingService.resolveUnitGrossCLP({
            price: inv.price,
            storeId: storeId !== 'admin-store' ? storeId : null,
            gameId: inv.product.cardDetail?.gameId,
          });
        } else {
          realUnitPrice = Math.round(Number(item.unitPrice));
        }
        return { ...item, storeId, realUnitPrice, productName };
      }),
    );

    // 2. Agrupar items por storeId
    const vendorGroups = itemsWithRealData.reduce((acc, item) => {
      if (!acc[item.storeId]) {
        acc[item.storeId] = [];
      }
      acc[item.storeId].push(item);
      return acc;
    }, {} as Record<string, typeof itemsWithRealData>);

    const defaultCurrency = await this.prisma.currency.findFirst({
      where: { isDefault: true },
    });

    const currencyCode = dto.currency || defaultCurrency?.code || 'CLP';
    const exchangeRate = Number(dto.exchangeRate || defaultCurrency?.exchangeRate || 1);

    if (!dto.storeShippingProviders || Object.keys(dto.storeShippingProviders).length === 0) {
      throw new BadRequestException('El proveedor de envío es obligatorio para cada tienda.');
    }

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

    const vendorOrdersData: any[] = [];
    const quoteGroupInputs: Array<{ storeId: string; productsGross: number; shippingGross: number }> = [];

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
          where: { id: shippingProviderId },
        });
        if (!provider) {
          throw new BadRequestException(`El proveedor de envío seleccionado para la tienda ${store.name} no es válido.`);
        }
        finalShippingProviderId = provider.id;
        shippingCourierName = provider.name;

        const storeQuote = dynamicQuotes[storeId];
        const matchedOption = storeQuote?.options?.find(
          (opt: any) => opt.id === shippingProviderId || opt.provider === provider.name,
        );
        if (matchedOption && typeof matchedOption.price === 'number') {
          storeShippingCost = Math.round(matchedOption.price);
        } else {
          storeShippingCost = Number(provider.price);
        }
      }

      const vendorProductsGross = items.reduce(
        (sum, i) => sum + i.realUnitPrice * i.quantity,
        0,
      );

      quoteGroupInputs.push({
        storeId,
        productsGross: vendorProductsGross,
        shippingGross: storeShippingCost,
      });

      vendorOrdersData.push({
        storeId,
        shippingProviderId: finalShippingProviderId,
        shippingCourier: shippingCourierName,
        deliveryStatus,
        shippingCost: storeShippingCost,
        subtotal: vendorProductsGross,
        status: 'PENDING',
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            inventoryItemId: item.inventoryItemId,
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: item.realUnitPrice,
          })),
        },
      });
    }

    // 3. Cotización tributaria oficial del servidor
    const quote = await this.checkoutPricing.buildQuote(quoteGroupInputs);

    const buyOrder = `ORD-${Date.now()}`.slice(0, 26);
    const orderNotes = dto.notes
      ? `${dto.notes} | Comisión TapTrade (3% + IVA): $${quote.serviceFee.gross.toLocaleString('es-CL')}`
      : `Comisión TapTrade (3% + IVA): $${quote.serviceFee.gross.toLocaleString('es-CL')}`;

    // 4. Guardar orden en BD en estado PENDING con snapshot fiscal inmutable
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
        totalAmount: quote.amountToCharge,
        productsTotal: quote.productsTotal,
        shippingTotal: quote.shippingTotal,
        serviceFeeGross: quote.serviceFee.gross,
        serviceFeeNet: quote.serviceFee.net,
        serviceFeeVat: quote.serviceFee.vat,
        transbankFeeEstimate: quote.transbankFeeEstimate,
        vatRateSnapshot: quote.vatRate,
        currencyCode,
        exchangeRate,
        status: 'PENDING',
        vendorOrders: {
          create: vendorOrdersData.map((v) => {
            const vQuote = quote.vendors.find((vq) => vq.storeId === v.storeId);
            return {
              ...v,
              vatRate: quote.vatRate,
              taxableNet: vQuote?.tax.net ?? 0,
              vatAmount: vQuote?.tax.vat ?? 0,
              sellerRut: vQuote?.sellerRut ?? null,
              sellerLegalName: vQuote?.sellerLegalName ?? null,
            };
          }),
        },
        reservations: {
          create: dto.items
            .filter((i) => i.inventoryItemId)
            .map((item) => ({
              inventoryItemId: item.inventoryItemId,
              quantity: item.quantity,
              expiresAt: new Date(Date.now() + 15 * 60 * 1000),
            })),
        },
      },
    });

    for (const item of dto.items) {
      if (item.inventoryItemId) {
        await this.prisma.inventoryItem.update({
          where: { id: item.inventoryItemId },
          data: { reservedStock: { increment: item.quantity } },
        });
      }
    }

    // Configurar URLs de retorno para Mercado Pago Checkout Pro
    const cleanReturnUrl = returnUrl.split('?')[0];
    const successUrl = `${cleanReturnUrl}?status=success&orderId=${order.id}`;
    const failureUrl = `${cleanReturnUrl}?status=failed&orderId=${order.id}`;
    const pendingUrl = `${cleanReturnUrl}?status=pending&orderId=${order.id}`;

    // Construir items para Mercado Pago con desglose explícito
    const mpItems: any[] = itemsWithRealData.map((item) => ({
      id: item.productId,
      title: item.productName || 'Producto TCG',
      quantity: item.quantity,
      unit_price: Math.round(item.realUnitPrice),
      currency_id: 'CLP',
    }));

    if (quote.shippingTotal > 0) {
      mpItems.push({
        id: 'SHIPPING-COST',
        title: 'Costo de Envío Despacho',
        quantity: 1,
        unit_price: Math.round(quote.shippingTotal),
        currency_id: 'CLP',
      });
    }

    if (quote.serviceFee.gross > 0) {
      mpItems.push({
        id: 'TAPTRADE-COMMISSION',
        title: 'Comisión de Servicio TapTrade (3% + IVA)',
        quantity: 1,
        unit_price: Math.round(quote.serviceFee.gross),
        currency_id: 'CLP',
      });
    }

    this.logger.log(`Creando preferencia de Mercado Pago para Orden ${order.id} por $${quote.amountToCharge} CLP`);

    const preferenceResponse = await this.mp.preference.create({
      body: {
        items: mpItems,
        payer: {
          name: dto.name,
          email: dto.email,
        },
        back_urls: {
          success: successUrl,
          failure: failureUrl,
          pending: pendingUrl,
        },
        ...(cleanReturnUrl.startsWith('https://') && !cleanReturnUrl.includes('localhost')
          ? { auto_return: 'approved' }
          : {}),
        external_reference: order.id,
        statement_descriptor: 'TAPTRADE TCG',
      },
    });

    const isTestToken =
      this.mp['config']?.get?.('MERCADOPAGO_ACCESS_TOKEN')?.startsWith('TEST-') ||
      process.env.MERCADOPAGO_ACCESS_TOKEN?.startsWith('TEST-');
    const initPoint =
      isTestToken && preferenceResponse.sandbox_init_point
        ? preferenceResponse.sandbox_init_point
        : preferenceResponse.init_point || preferenceResponse.sandbox_init_point;

    await this.prisma.payment.create({
      data: {
        orderId: order.id,
        token: preferenceResponse.id || buyOrder,
        amount: quote.amountToCharge,
        status: 'PENDING',
        paymentType: 'MERCADOPAGO_CHECKOUT_PRO',
      },
    });

    this.logger.log(`Preferencia Mercado Pago creada: id=${preferenceResponse.id}, redirect=${initPoint}`);

    return {
      preferenceId: preferenceResponse.id,
      init_point: initPoint,
      sandbox_init_point: preferenceResponse.sandbox_init_point,
      orderId: order.id,
      buyOrder,
      quote,
    };
  }
}
