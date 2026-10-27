import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../prisma/prisma.service';
import { GetSalesStatsQuery } from '../impl/get-sales-stats.query';

/**
 * Handler: Calcula estadísticas de ventas para el panel administrativo.
 * Incluye conteos por estado, ingresos, productos más vendidos y órdenes recientes.
 * Soporta scoping automático a nivel de tienda si el solicitante es ADMIN (dueño de tienda).
 */
@QueryHandler(GetSalesStatsQuery)
export class GetSalesStatsHandler
  implements IQueryHandler<GetSalesStatsQuery>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetSalesStatsQuery) {
    const { userId, role } = query;

    let storeId: string | null = null;
    if (role !== 'SUPERADMIN' && userId) {
      const store = await this.prisma.store.findUnique({
        where: { ownerId: userId },
        select: { id: true },
      });
      if (store) {
        storeId = store.id;
      }
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();

    // Consultas adaptadas: si hay storeId (dueño de tienda), se consulta su VendorOrder / InventoryItem.
    // Si no hay storeId (superadmin), se consulta globalmente.
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
      // Conteos de órdenes
      storeId
        ? this.prisma.vendorOrder.count({ where: { storeId } })
        : this.prisma.order.count(),
      storeId
        ? this.prisma.vendorOrder.count({ where: { storeId, status: 'PAID' } })
        : this.prisma.order.count({ where: { status: 'PAID' } }),
      storeId
        ? this.prisma.vendorOrder.count({ where: { storeId, status: 'FAILED' } })
        : this.prisma.order.count({ where: { status: 'FAILED' } }),
      storeId
        ? this.prisma.vendorOrder.count({ where: { storeId, status: 'PENDING' } })
        : this.prisma.order.count({ where: { status: 'PENDING' } }),

      // Ingresos totales de órdenes pagadas
      storeId
        ? this.prisma.vendorOrder.aggregate({
            where: { storeId, status: 'PAID' },
            _sum: { subtotal: true },
          })
        : this.prisma.order.aggregate({
            where: { status: 'PAID' },
            _sum: { totalAmount: true },
          }),

      // Productos más vendidos
      this.prisma.orderItem.groupBy({
        by: ['productId', 'productName'],
        where: {
          vendorOrder: {
            ...(storeId ? { storeId } : {}),
            status: 'PAID',
          },
        },
        _sum: { quantity: true },
        _count: { vendorOrderId: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 10,
      }),

      // Órdenes recientes
      storeId
        ? this.prisma.vendorOrder
            .findMany({
              where: { storeId, status: 'PAID' },
              orderBy: { createdAt: 'desc' },
              take: 5,
              include: {
                order: { select: { buyOrder: true, name: true } },
              },
            })
            .then((vos) =>
              vos.map((vo) => ({
                id: vo.id,
                buyOrder: vo.order?.buyOrder || 'N/A',
                name: vo.order?.name || 'Cliente',
                totalAmount: Number(vo.subtotal),
                createdAt: vo.createdAt,
              })),
            )
        : this.prisma.order.findMany({
            where: { status: 'PAID' },
            orderBy: { createdAt: 'desc' },
            take: 5,
            select: { id: true, buyOrder: true, name: true, totalAmount: true, createdAt: true },
          }),

      // Ingresos del mes actual
      storeId
        ? this.prisma.vendorOrder.aggregate({
            where: {
              storeId,
              status: 'PAID',
              createdAt: { gte: new Date(currentYear, currentMonth, 1) },
            },
            _sum: { subtotal: true },
          })
        : this.prisma.order.aggregate({
            where: {
              status: 'PAID',
              createdAt: { gte: new Date(currentYear, currentMonth, 1) },
            },
            _sum: { totalAmount: true },
          }),

      // Ingresos del mes anterior
      storeId
        ? this.prisma.vendorOrder.aggregate({
            where: {
              storeId,
              status: 'PAID',
              createdAt: {
                gte: new Date(currentYear, currentMonth - 1, 1),
                lt: new Date(currentYear, currentMonth, 1),
              },
            },
            _sum: { subtotal: true },
          })
        : this.prisma.order.aggregate({
            where: {
              status: 'PAID',
              createdAt: {
                gte: new Date(currentYear, currentMonth - 1, 1),
                lt: new Date(currentYear, currentMonth, 1),
              },
            },
            _sum: { totalAmount: true },
          }),

      // Ingresos de HOY
      storeId
        ? this.prisma.vendorOrder.aggregate({
            where: {
              storeId,
              status: 'PAID',
              createdAt: { gte: todayStart },
            },
            _sum: { subtotal: true },
          })
        : this.prisma.order.aggregate({
            where: { status: 'PAID', createdAt: { gte: todayStart } },
            _sum: { totalAmount: true },
          }),

      // Alertas de Bajo Stock (Stock entre 1 y 3) de la tienda
      this.prisma.inventoryItem.findMany({
        where: {
          ...(storeId ? { storeId } : {}),
          stock: { gt: 0, lte: 3 },
          isPublished: true,
        },
        orderBy: { stock: 'asc' },
        take: 10,
        select: {
          id: true,
          stock: true,
          product: { select: { name: true } },
          condition: { select: { name: true } },
          language: { select: { name: true } },
        },
      }),

      // Despachos Pendientes
      this.prisma.vendorOrder.count({
        where: {
          ...(storeId ? { storeId } : {}),
          status: 'PAID',
          deliveryStatus: { not: 'DISPATCHED' },
        },
      }),
    ]);

    const totalRevenue = Number(
      (storeId ? (revenueResult as any)._sum.subtotal : (revenueResult as any)._sum.totalAmount) ?? 0,
    );
    const thisMonth = Number(
      (storeId ? (revenueThisMonth as any)._sum.subtotal : (revenueThisMonth as any)._sum.totalAmount) ?? 0,
    );
    const prevMonth = Number(
      (storeId ? (revenuePrevMonth as any)._sum.subtotal : (revenuePrevMonth as any)._sum.totalAmount) ?? 0,
    );
    const todayRevenue = Number(
      (storeId ? (todayRevenueRaw as any)._sum.subtotal : (todayRevenueRaw as any)._sum.totalAmount) ?? 0,
    );

    const monthGrowth =
      prevMonth > 0
        ? (((thisMonth - prevMonth) / prevMonth) * 100).toFixed(1)
        : null;

    const topProducts = (topProductsRaw || []).map((p) => ({
      productId: p.productId,
      productName: p.productName,
      totalUnits: p._sum.quantity ?? 0,
      timesOrdered: p._count.vendorOrderId,
    }));

    // Obtener ingresos por mes del año actual (12 consultas paralelas rápidas)
    const monthsPromises = Array.from({ length: 12 }, (_, i) => {
      const start = new Date(currentYear, i, 1);
      const end = new Date(currentYear, i + 1, 1);
      return storeId
        ? this.prisma.vendorOrder.aggregate({
            where: { storeId, status: 'PAID', createdAt: { gte: start, lt: end } },
            _sum: { subtotal: true },
          })
        : this.prisma.order.aggregate({
            where: { status: 'PAID', createdAt: { gte: start, lt: end } },
            _sum: { totalAmount: true },
          });
    });
    const monthlyResults = await Promise.all(monthsPromises);
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const monthlyRevenues = monthlyResults.map((res, index) => ({
      month: monthNames[index],
      revenue: Number(
        (storeId ? (res as any)._sum.subtotal : (res as any)._sum.totalAmount) ?? 0,
      ),
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
        lowStockItems: lowStockItemsRaw,
      },
      topProducts,
      recentOrders,
      monthlyRevenues,
    };
  }
}
