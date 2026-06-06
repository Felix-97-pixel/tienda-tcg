import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../prisma/prisma.service';
import { ListOrdersQuery } from '../impl/list-orders.query';

/**
 * Handler: Lista órdenes con paginación para el panel administrativo.
 */
@QueryHandler(ListOrdersQuery)
export class ListOrdersHandler implements IQueryHandler<ListOrdersQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: ListOrdersQuery) {
    const { page, limit } = query;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          vendorOrders: {
            include: { items: true, store: true },
          },
          payment: { select: { status: true, authCode: true } },
        },
      }),
      this.prisma.order.count(),
    ]);

    return { orders, total, page, limit };
  }
}
