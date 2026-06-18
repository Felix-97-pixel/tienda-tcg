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

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

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
      todayRevenueRaw,
      lowStockItemsRaw,
      pendingFulfillment,
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

      // Productos más vendidos
      this.prisma.orderItem.groupBy({
        by: ['productId', 'productName'],
        where: { vendorOrder: { status: 'PAID' } },
        _sum: { quantity: true },
        _count: { vendorOrderId: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 10,
      }),

      // Órdenes recientes
      this.prisma.order.findMany({
        where: paidFilter,
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, buyOrder: true, name: true, totalAmount: true, createdAt: true },
      }),

      // Ingresos del mes actual
      this.prisma.order.aggregate({
        where: { status: 'PAID', createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } },
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

      // Ingresos de HOY
      this.prisma.order.aggregate({
        where: { status: 'PAID', createdAt: { gte: todayStart } },
        _sum: { totalAmount: true },
      }),

      // Alertas de Bajo Stock (Stock entre 1 y 3)
      this.prisma.inventoryItem.findMany({
        where: { stock: { gt: 0, lte: 3 }, isPublished: true },
        orderBy: { stock: 'asc' },
        take: 10,
        select: {
          id: true,
          stock: true,
          product: { select: { name: true } },
          condition: { select: { name: true } },
          language: { select: { name: true } },
        }
      }),

      // Despachos Pendientes
      this.prisma.vendorOrder.count({
        where: { status: 'PENDING' } // Órdenes de tiendas que aún no despachan
      })
    ]);

    const totalRevenue = Number(revenueResult._sum.totalAmount ?? 0);
    const thisMonth = Number(revenueThisMonth._sum.totalAmount ?? 0);
    const prevMonth = Number(revenuePrevMonth._sum.totalAmount ?? 0);
    const todayRevenue = Number(todayRevenueRaw._sum.totalAmount ?? 0);

    const monthGrowth =
      prevMonth > 0
        ? (((thisMonth - prevMonth) / prevMonth) * 100).toFixed(1)
        : null;

    const topProducts = topProductsRaw.map((p) => ({
      productId: p.productId,
      productName: p.productName,
      totalUnits: p._sum.quantity ?? 0,
      timesOrdered: p._count.vendorOrderId,
    }));

    // Obtener ingresos por mes del año actual (12 consultas paralelas rápidas)
    const currentYear = new Date().getFullYear();
    const monthsPromises = Array.from({ length: 12 }, (_, i) => {
      const start = new Date(currentYear, i, 1);
      const end = new Date(currentYear, i + 1, 1);
      return this.prisma.order.aggregate({
        where: { status: 'PAID', createdAt: { gte: start, lt: end } },
        _sum: { totalAmount: true }
      });
    });
    const monthlyResults = await Promise.all(monthsPromises);
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const monthlyRevenues = monthlyResults.map((res, index) => ({
      month: monthNames[index],
      revenue: Number(res._sum.totalAmount ?? 0)
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
        todayRevenue,
        monthGrowth: monthGrowth ? parseFloat(monthGrowth) : null,
      },
      operational: {
        pendingFulfillment,
        lowStockItems: lowStockItemsRaw
      },
      topProducts,
      recentOrders,
      monthlyRevenues,
    };
  }
}
