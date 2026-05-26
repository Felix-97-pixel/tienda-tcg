import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  WebpayPlus,
  Options,
  IntegrationApiKeys,
  IntegrationCommerceCodes,
  Environment,
} from 'transbank-sdk';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private tx: InstanceType<typeof WebpayPlus.Transaction>;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    const commerceCode = this.config.get<string>('WEBPAY_COMMERCE_CODE');
    const apiKey = this.config.get<string>('WEBPAY_API_KEY');
    const env = this.config.get<string>('WEBPAY_ENV', 'integration');

    if (env === 'production' && commerceCode && apiKey) {
      this.tx = new WebpayPlus.Transaction(
        new Options(commerceCode, apiKey, Environment.Production),
      );
      this.logger.log('Webpay configurado en modo PRODUCCIÓN');
    } else {
      // Modo integración (testing) — usa credenciales de prueba de Transbank
      this.tx = new WebpayPlus.Transaction(
        new Options(
          IntegrationCommerceCodes.WEBPAY_PLUS,
          IntegrationApiKeys.WEBPAY,
          Environment.Integration,
        ),
      );
      this.logger.warn('Webpay configurado en modo INTEGRACIÓN (pruebas)');
    }
  }

  /** Crea la orden en BD e inicia transacción Webpay */
  async initTransaction(
    dto: CreateOrderDto,
    userId: string | null,
    returnUrl: string,
  ) {
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
        totalAmount: total,
        currencyCode,
        exchangeRate,
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
    const amountInCLP = Math.round(total); // Webpay usa enteros en CLP
    const response = await this.tx.create(
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
        amount: total,
        status: 'PENDING',
      },
    });

    this.logger.log(`Transacción iniciada: buyOrder=${buyOrder}, token=${response.token}`);

    return {
      token: response.token,
      url: response.url,
      orderId: order.id,
      buyOrder,
    };
  }

  /** Confirma la transacción tras el retorno de Webpay */
  async commitTransaction(token: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { token },
      include: {
        order: {
          include: { items: true },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException('Pago no encontrado para ese token');
    }

    const result = await this.tx.commit(token);

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

      // 2. Actualizar orden
      await tx.order.update({
        where: { id: payment.orderId },
        data: { status: isApproved ? 'PAID' : 'FAILED' },
      });

      // 3. Descontar stock solo si el pago fue aprobado
      if (isApproved) {
        const itemsConInventario = payment.order.items.filter(
          (i) => i.inventoryItemId,
        );

        for (const item of itemsConInventario) {
          const inventory = await tx.inventoryItem.findUnique({
            where: { id: item.inventoryItemId! },
          });

          if (!inventory) {
            this.logger.warn(
              `InventoryItem ${item.inventoryItemId} no encontrado al descontar stock`,
            );
            continue;
          }

          const newStock = Math.max(0, inventory.stock - item.quantity);

          await tx.inventoryItem.update({
            where: { id: item.inventoryItemId! },
            data: { stock: newStock },
          });

          this.logger.log(
            `Stock descontado: inventoryItem=${item.inventoryItemId}, ` +
              `-${item.quantity} → stock=${newStock}`,
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

  /** Obtiene el estado de una orden por ID */
  async getOrderStatus(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, payment: true },
    });

    if (!order) {
      throw new NotFoundException('Orden no encontrada');
    }

    return order;
  }

  /** Lista todas las órdenes (admin) */
  async listOrders(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { items: true, payment: { select: { status: true, authCode: true } } },
      }),
      this.prisma.order.count(),
    ]);

    return { orders, total, page, limit };
  }

  /** Estadísticas de ventas para el panel de administración */
  async getSalesStats() {
    // Solo se cuentan órdenes PAGADAS
    const paidFilter = { status: 'PAID' as const };

    const [
      totalOrders,
      paidOrders,
      failedOrders,
      pendingOrders,
      revenueResult,
      topProductsRaw,
      recentOrders,
      revenueThisMonth,
      revenuePrevMonth,
    ] = await Promise.all([
      // Conteos por estado
      this.prisma.order.count(),
      this.prisma.order.count({ where: { status: 'PAID' } }),
      this.prisma.order.count({ where: { status: 'FAILED' } }),
      this.prisma.order.count({ where: { status: 'PENDING' } }),

      // Ingresos totales de órdenes pagadas
      this.prisma.order.aggregate({
        where: paidFilter,
        _sum: { totalAmount: true },
      }),

      // Productos más vendidos: suma de quantity por productId en órdenes PAGADAS
      this.prisma.orderItem.groupBy({
        by: ['productId', 'productName'],
        where: {
          order: { status: 'PAID' },
        },
        _sum: { quantity: true },
        _count: { orderId: true },  // en cuántas órdenes apareció
        orderBy: { _sum: { quantity: 'desc' } },
        take: 10,
      }),

      // 5 órdenes más recientes
      this.prisma.order.findMany({
        where: paidFilter,
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          buyOrder: true,
          name: true,
          totalAmount: true,
          createdAt: true,
        },
      }),

      // Ingresos del mes actual
      this.prisma.order.aggregate({
        where: {
          status: 'PAID',
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
        _sum: { totalAmount: true },
      }),

      // Ingresos del mes anterior
      this.prisma.order.aggregate({
        where: {
          status: 'PAID',
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
            lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
        _sum: { totalAmount: true },
      }),
    ]);

    const totalRevenue = Number(revenueResult._sum.totalAmount ?? 0);
    const thisMonth = Number(revenueThisMonth._sum.totalAmount ?? 0);
    const prevMonth = Number(revenuePrevMonth._sum.totalAmount ?? 0);
    const monthGrowth =
      prevMonth > 0
        ? (((thisMonth - prevMonth) / prevMonth) * 100).toFixed(1)
        : null;

    const topProducts = topProductsRaw.map((p) => ({
      productId: p.productId,
      productName: p.productName,
      totalUnits: p._sum.quantity ?? 0,
      timesOrdered: p._count.orderId,
    }));

    return {
      orders: {
        total: totalOrders,
        paid: paidOrders,
        failed: failedOrders,
        pending: pendingOrders,
      },
      revenue: {
        total: totalRevenue,
        thisMonth,
        prevMonth,
        monthGrowth: monthGrowth ? parseFloat(monthGrowth) : null,
      },
      topProducts,
      recentOrders,
    };
  }
}
