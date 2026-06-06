import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { GetOrderStatusQuery } from '../impl/get-order-status.query';

/**
 * Handler: Obtiene el estado de una orden por su ID.
 */
@QueryHandler(GetOrderStatusQuery)
export class GetOrderStatusHandler
  implements IQueryHandler<GetOrderStatusQuery>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetOrderStatusQuery) {
    const order = await this.prisma.order.findUnique({
      where: { id: query.orderId },
      include: {
        vendorOrders: {
          include: { items: true, store: true },
        },
        payment: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Orden no encontrada');
    }

    return order;
  }
}
