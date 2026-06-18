import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../prisma/prisma.service';
import { ExportReportsQuery } from '../impl/export-reports.query';

@QueryHandler(ExportReportsQuery)
export class ExportReportsHandler implements IQueryHandler<ExportReportsQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: ExportReportsQuery) {
    if (query.type === 'inventory' || query.type === 'deadstock') {
      const items = await this.prisma.inventoryItem.findMany({
        where: {
          stock: { gt: 0 },
          ...(query.type === 'deadstock' 
               ? { updatedAt: { lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } 
               : {}),
        },
        select: {
          stock: true,
          price: true,
          createdAt: true,
          updatedAt: true,
          product: { select: { name: true, cardDetail: { select: { expansion: true } } } },
          condition: { select: { name: true } },
          language: { select: { name: true } },
        },
      });

      return items.map(i => ({
        Producto: i.product.name,
        Expansión: i.product.cardDetail?.expansion || 'N/A',
        Condición: i.condition.name,
        Idioma: i.language.name,
        Stock: i.stock,
        'Valor Unitario': Number(i.price),
        'Valor Total': Number(i.price) * i.stock,
        'Ingresado El': i.createdAt.toLocaleDateString(),
        'Último Movimiento': i.updatedAt.toLocaleDateString()
      }));
    }

    if (query.type === 'lowstock') {
      const items = await this.prisma.inventoryItem.findMany({
        where: { stock: { gt: 0, lte: 3 }, isPublished: true },
        orderBy: { stock: 'asc' },
        select: {
          stock: true,
          price: true,
          createdAt: true,
          updatedAt: true,
          product: { select: { name: true, cardDetail: { select: { expansion: true } } } },
          condition: { select: { name: true } },
          language: { select: { name: true } },
        },
      });

      return items.map(i => ({
        Producto: i.product.name,
        Expansión: i.product.cardDetail?.expansion || 'N/A',
        Condición: i.condition.name,
        Idioma: i.language.name,
        Stock: i.stock,
        'Valor Unitario': Number(i.price),
        'Valor Total': Number(i.price) * i.stock,
        'Ingresado El': i.createdAt.toLocaleDateString(),
        'Último Movimiento': i.updatedAt.toLocaleDateString()
      }));
    }

    if (query.type === 'transactions') {
      const orders = await this.prisma.order.findMany({
        select: {
          buyOrder: true,
          createdAt: true,
          name: true,
          email: true,
          phone: true,
          totalAmount: true,
          status: true,
        },
        orderBy: { createdAt: 'desc' }
      });

      return orders.map(o => ({
        'ID Orden': o.buyOrder,
        'Fecha': o.createdAt.toLocaleDateString(),
        'Cliente': o.name,
        'Email': o.email,
        'Teléfono': o.phone || 'N/A',
        'Total Pagado': Number(o.totalAmount),
        'Estado': o.status
      }));
    }

    return [];
  }
}
