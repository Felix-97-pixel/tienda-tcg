import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../prisma/prisma.service';
import { GetTopProductsQuery } from '../impl/get-top-products.query';
import { resolveQueryStoreId } from './resolve-query-store';

@QueryHandler(GetTopProductsQuery)
export class GetTopProductsHandler implements IQueryHandler<GetTopProductsQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetTopProductsQuery) {
    const { userId, role, startDate, endDate } = query;

    const storeId = await resolveQueryStoreId(this.prisma, userId, role, query.storeId);

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
