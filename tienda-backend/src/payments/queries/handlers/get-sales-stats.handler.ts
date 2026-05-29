import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../prisma/prisma.service';
import { GetSalesStatsQuery } from '../impl/get-sales-stats.query';

/**
 * Handler: Calcula estadísticas de ventas para el panel administrativo.
 * Incluye conteos por estado, ingresos, productos más vendidos y órdenes recientes.
 */
@QueryHandler(GetSalesStatsQuery)
export class GetSalesStatsHandler
  implements IQueryHandler<GetSalesStatsQuery>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(_query: GetSalesStatsQuery) {
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
        _count: { orderId: true }, // en cuántas órdenes apareció
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
            gte: new Date(
              new Date().getFullYear(),
              new Date().getMonth() - 1,
              1,
            ),
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
