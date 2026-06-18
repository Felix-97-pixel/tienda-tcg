import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../prisma/prisma.service';
import { GetTopProductsQuery } from '../impl/get-top-products.query';

@QueryHandler(GetTopProductsQuery)
export class GetTopProductsHandler implements IQueryHandler<GetTopProductsQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetTopProductsQuery) {
    const whereClause: any = { vendorOrder: { status: 'PAID' } };
    
    if (query.startDate || query.endDate) {
      whereClause.vendorOrder = {
        ...whereClause.vendorOrder,
        order: {
          createdAt: {
            ...(query.startDate ? { gte: new Date(query.startDate) } : {}),
            ...(query.endDate ? { lte: new Date(query.endDate) } : {})
          }
        }
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
