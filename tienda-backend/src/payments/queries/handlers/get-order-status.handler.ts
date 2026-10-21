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

    const isOwner = Boolean(query.requesterUserId && order.userId === query.requesterUserId);
    const isAdmin = query.requesterRole === 'ADMIN' || query.requesterRole === 'SUPERADMIN';

    // Si la orden pertenece a un usuario registrado y quien consulta no es el dueño ni admin,
    // ofuscar datos personales sensibles para prevenir fuga de información privada (IDOR)
    if (!isOwner && !isAdmin) {
      return {
        ...order,
        email: order.email ? order.email.replace(/(.{2})(.*)(@.*)/, '$1***$3') : order.email,
        phone: order.phone ? '******' + order.phone.slice(-4) : null,
        address: 'Dirección protegida',
      };
    }

    return order;
  }
}
