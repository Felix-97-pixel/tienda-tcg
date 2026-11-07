import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { MercadoPagoProvider } from '../../providers/mercadopago.provider';
import { ShippingService } from '../../../shipping/shipping.service';
import { PricingService } from '../../../tax/pricing.service';
import { CheckoutPricingService } from '../../../tax/checkout-pricing.service';
import { FinancialLedgerService } from '../../../tax/financial-ledger.service';
import { ProcessPaymentCommand } from '../impl/process-payment.command';

@CommandHandler(ProcessPaymentCommand)
export class ProcessPaymentHandler implements ICommandHandler<ProcessPaymentCommand> {
  private readonly logger = new Logger(ProcessPaymentHandler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mp: MercadoPagoProvider,
    private readonly shippingService: ShippingService,
    private readonly pricingService: PricingService,
    private readonly checkoutPricing: CheckoutPricingService,
    private readonly financialLedger: FinancialLedgerService,
  ) {}

  async execute(command: ProcessPaymentCommand) {
    const { dto, userId } = command;

    // 1. Obtener información de inventario para saber el storeId de cada item y SU PRECIO REAL
    const itemsWithStoreId = await Promise.all(
      dto.items.map(async (item) => {
        let storeId = null;
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
            throw new BadRequestException(`Un producto del carrito no existe.`);
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

        return {
          ...item,
          storeId: storeId || 'admin-store',
          realUnitPrice,
          productName,
        };
      }),
    );

    // 2. Agrupar por storeId
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

    let dynamicQuotes: Record<string, any> = {};
    if (dto.cityCode || dto.city) {
      try {
        const quotesResult = await this.shippingService.quoteCartShipping({
          destinationCommune: dto.cityCode || dto.city,
          destinationRegion: dto.regionCode,
          cartItems: itemsWithStoreId.map((item) => ({
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

      const vendorProductsGross = items.reduce((sum, i) => sum + i.realUnitPrice * i.quantity, 0);

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

    // 3. Generar cotización oficial del servidor
    const quote = await this.checkoutPricing.buildQuote(quoteGroupInputs);

    const buyOrder = `ORD-${Date.now()}`.slice(0, 26);

    // 4. Ejecutar la llamada a Mercado Pago
    let paymentResponse;
    try {
      const mpPayer: any = {
        email: dto.payer?.email || dto.email,
      };

      if (dto.payer?.identification?.number) {
        mpPayer.identification = {
          type: dto.payer.identification.type || 'RUT',
          number: dto.payer.identification.number,
        };
      }

      if (dto.payer?.first_name || dto.name) {
        mpPayer.first_name = dto.payer?.first_name || dto.name.split(' ')[0] || 'Comprador';
        mpPayer.last_name = dto.payer?.last_name || dto.name.split(' ').slice(1).join(' ') || 'Prueba';
      }

      const payload: any = {
        payment_method_id: dto.payment_method_id,
        token: dto.token,
        transaction_amount: Math.round(quote.amountToCharge),
        installments: dto.installments ? Number(dto.installments) : 1,
        description: `Compra TapTrade - ${buyOrder}`,
        issuer_id: dto.issuer_id,
        payer: mpPayer,
        external_reference: buyOrder,
      };

      this.logger.log(`Iniciando cobro Mercado Pago: monto=${payload.transaction_amount}, email=${mpPayer.email}`);
      paymentResponse = await this.mp.payment.create({
        body: payload,
      });

      this.logger.log(
        `Respuesta Mercado Pago: status=${paymentResponse.status}, detail=${paymentResponse.status_detail}, id=${paymentResponse.id}`,
      );
    } catch (error: any) {
      this.logger.error('Error procesando pago con Mercado Pago', error);
      const mpMessage = error.response?.message || error.message || 'Error desconocido';
      throw new BadRequestException(`Error al procesar el pago con la tarjeta: ${mpMessage}`);
    }

    // 5. Guardar Orden en BD con snapshot fiscal inmutable
    const isApproved = paymentResponse.status === 'approved';
    const statusDb = isApproved ? 'PAID' : 'FAILED';

    const orderNotes = dto.notes
      ? `${dto.notes} | Comisión TapTrade (3% + IVA): $${quote.serviceFee.gross.toLocaleString('es-CL')}`
      : `Comisión TapTrade (3% + IVA): $${quote.serviceFee.gross.toLocaleString('es-CL')}`;

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
        sellerCommissionNet: quote.sellerCommissionTotal.net,
        sellerCommissionVat: quote.sellerCommissionTotal.vat,
        sellerCommissionGross: quote.sellerCommissionTotal.gross,
        transbankFeeEstimate: quote.transbankFeeEstimate,
        vatRateSnapshot: quote.vatRate,
        currencyCode,
        exchangeRate,
        status: statusDb,
        vendorOrders: {
          create: vendorOrdersData.map((v) => {
            const vQuote = quote.vendors.find((vq) => vq.storeId === v.storeId);
            const fallbackGross = Number(v.subtotal || 0) + Number(v.shippingCost || 0);
            return {
              ...v,
              status: statusDb,
              deliveryStatus: isApproved ? 'PENDING_DISPATCH' : 'PENDING_PAYMENT',
              vatRate: quote.vatRate,
              taxableNet: vQuote?.tax.net ?? 0,
              vatAmount: vQuote?.tax.vat ?? 0,
              commissionRateApplied: vQuote?.commissionRateApplied ?? 0,
              commissionCalcBase: vQuote?.commissionCalcBase ?? 'NET',
              sellerCommissionNet: vQuote?.sellerCommission.net ?? 0,
              sellerCommissionVat: vQuote?.sellerCommission.vat ?? 0,
              sellerCommissionGross: vQuote?.sellerCommission.gross ?? 0,
              sellerNetPayout: vQuote?.sellerNetPayout ?? fallbackGross,
              settlementStatus: 'HELD_ESCROW',
              sellerRut: vQuote?.sellerRut ?? null,
              sellerLegalName: vQuote?.sellerLegalName ?? null,
            };
          }) as any,
        },
      },
      include: { vendorOrders: { include: { items: true } } },
    });

    await this.prisma.payment.create({
      data: {
        orderId: order.id,
        token: String(paymentResponse.id),
        amount: quote.amountToCharge,
        status: isApproved ? 'AUTHORIZED' : 'FAILED',
        paymentType: dto.payment_method_id,
        installments: dto.installments,
      },
    });

    // 6. Si fue aprobado, procesar inventario y registrar en el Libro Mayor Inmutable (Ledger)
    if (isApproved) {
      await this.prisma.$transaction(async (tx) => {
        for (const vendorOrder of order.vendorOrders) {
          const itemsConInventario = vendorOrder.items.filter((i) => i.inventoryItemId);

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
              orderId: order.id,
              vendorOrderId: vendorOrder.id,
              grossSaleAmount: grossSale,
              taxableNet: Number(vendorOrder.taxableNet || 0),
              vatAmount: Number(vendorOrder.vatAmount || 0),
              sellerCommissionNet: sellerCommNet,
              sellerCommissionVat: sellerCommVat,
              sellerCommissionGross: sellerCommGross,
              sellerNetPayout,
              paymentMethod: 'MERCADOPAGO',
              createdByUserId: userId || 'MERCADOPAGO_API',
            },
            tx,
          );
        }
      });
    }

    return {
      orderId: order.id,
      paymentId: paymentResponse.id,
      status: paymentResponse.status,
      statusDetail: paymentResponse.status_detail,
      approved: isApproved,
      quote,
    };
  }
}
