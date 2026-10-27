import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../prisma/prisma.service';
import { GetTopProductsQuery } from '../impl/get-top-products.query';

@QueryHandler(GetTopProductsQuery)
export class GetTopProductsHandler implements IQueryHandler<GetTopProductsQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetTopProductsQuery) {
    const { userId, role, startDate, endDate } = query;

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

    const whereClause: any = {
      vendorOrder: {
        ...(storeId ? { storeId } : {}),
        status: 'PAID',
      },
    };

    if (startDate || endDate) {
      whereClause.vendorOrder = {
        ...whereClause.vendorOrder,
        order: {
          createdAt: {
            ...(startDate ? { gte: new Date(startDate) } : {}),
            ...(endDate ? { lte: new Date(endDate) } : {}),
          },
        },
      };
    }

    const topProductsRaw = await this.prisma.orderItem.groupBy({
      by: ['productId', 'productName'],
      where: whereClause,
      _sum: { quantity: true },
      _count: { vendorOrderId: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 10,
    });

    return topProductsRaw.map((p) => ({
      productId: p.productId,
      productName: p.productName,
      totalUnits: p._sum.quantity ?? 0,
      timesOrdered: p._count.vendorOrderId,
    }));
  }
}
