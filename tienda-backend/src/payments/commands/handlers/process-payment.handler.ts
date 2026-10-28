import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { MercadoPagoProvider } from '../../providers/mercadopago.provider';
import { ShippingService } from '../../../shipping/shipping.service';
import { ProcessPaymentCommand } from '../impl/process-payment.command';

@CommandHandler(ProcessPaymentCommand)
export class ProcessPaymentHandler implements ICommandHandler<ProcessPaymentCommand> {
  private readonly logger = new Logger(ProcessPaymentHandler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mp: MercadoPagoProvider,
    private readonly shippingService: ShippingService,
  ) { }

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
          realUnitPrice = Math.round(Number(item.unitPrice));
        }

        if (!storeId) {
          throw new BadRequestException(`No se encontró la tienda para el producto ${item.productName}`);
        }
        return { ...item, storeId, realUnitPrice, productName };
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

    // Obtener cotización dinámica en vivo para calcular el costo de envío exacto
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

    let globalTotal = 0;
    const vendorOrdersData = [];

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

      // Calcular subtotal BASE con el PRECIO REAL DE LA BD en CLP
      const vendorBaseSubtotal = items.reduce(
        (sum, i) => sum + i.realUnitPrice * i.quantity,
        0,
      );

      // 3. SaaS Model: 0% Comisión por venta (Take Rate = 0)
      const commissionRate = 0;
      const commissionAmount = 0;

      const vendorTotal = vendorBaseSubtotal + storeShippingCost; // Precio productos + envío
      globalTotal += vendorTotal;

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
            unitPrice: item.realUnitPrice,
          })),
        },
      });
    }

    // 3.1 SaaS Model: Traspaso de la tarifa de procesamiento de pasarela al cliente (Mercado Pago: 3.19% + IVA ≈ 3.79%)
    const gatewayFeeRate = 0.0379;
    const computedFee = Math.round(globalTotal * gatewayFeeRate);
    const gatewayFee = dto.gatewayFee && Number(dto.gatewayFee) > 0 ? Math.round(Number(dto.gatewayFee)) : computedFee;
    const finalChargedAmount = globalTotal + gatewayFee;

    const buyOrder = `ORD-${Date.now()}`.slice(0, 26);

    // 4. Ejecutar la llamada a Mercado Pago (Cuenta central en Custodia / Escrow)
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
        transaction_amount: Math.round(finalChargedAmount),
        installments: dto.installments ? Number(dto.installments) : 1,
        description: `Compra TapTrade - ${buyOrder}`,
        issuer_id: dto.issuer_id,
        payer: mpPayer,
        external_reference: buyOrder,
      };

      this.logger.log(`Iniciando cobro central Mercado Pago: monto=${payload.transaction_amount}, email=${mpPayer.email}`);
      paymentResponse = await this.mp.payment.create({
        body: payload,
      });

      this.logger.log(`Respuesta Mercado Pago: status=${paymentResponse.status}, detail=${paymentResponse.status_detail}, id=${paymentResponse.id}`);
    } catch (error: any) {
      this.logger.error('Error procesando pago con Mercado Pago', error);
      const mpMessage = error.response?.message || error.message || 'Error desconocido';
      throw new BadRequestException(`Error al procesar el pago con la tarjeta: ${mpMessage}`);
    }

    // 5. Guardar Orden en BD
    const isApproved = paymentResponse.status === 'approved';
    const statusDb = isApproved ? 'PAID' : 'FAILED';

    const orderNotes = dto.notes
      ? `${dto.notes} | Tarifa de pasarela (3.79%): $${gatewayFee.toLocaleString('es-CL')}`
      : `Tarifa de pasarela (3.79%): $${gatewayFee.toLocaleString('es-CL')}`;

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
        status: statusDb,
        vendorOrders: {
          create: vendorOrdersData.map(v => ({
            ...v,
            status: statusDb,
            deliveryStatus: isApproved ? 'PENDING_DISPATCH' : 'PENDING_PAYMENT',
          })) as any,
        },
      },
      include: { vendorOrders: { include: { items: true } } }
    });

    await this.prisma.payment.create({
      data: {
        orderId: order.id,
        token: String(paymentResponse.id), // MP Payment ID
        amount: finalChargedAmount,
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

          // SaaS Model: Registrar en la Billetera con 0% de comisión
          const totalAbono = Number(vendorOrder.subtotal) + Number(vendorOrder.shippingCost);

          await tx.walletTransaction.create({
            data: {
              storeId: vendorOrder.storeId,
              amount: totalAbono,
              type: 'SALE',
              paymentMethod: 'MERCADOPAGO',
              isWithdrawable: false,
              reference: `Order: ${vendorOrder.id} (Custodia - Pendiente de Despacho)`,
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
