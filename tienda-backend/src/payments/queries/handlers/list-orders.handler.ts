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
    const { page, limit, userId, role } = query;
    const skip = (page - 1) * limit;

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

    // Si es ADMIN de tienda, solo mostrar órdenes que contengan sub-órdenes de su tienda
    const where: any = storeId
      ? {
          vendorOrders: {
            some: { storeId },
          },
        }
      : {};

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          vendorOrders: {
            where: storeId ? { storeId } : undefined,
            include: { items: true, store: true },
          },
          payment: { select: { status: true, authCode: true, cardLast4: true } },
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    // Recopilar IDs para enriquecer con imágenes y datos de TCG
    const allItems = orders.flatMap(o => o.vendorOrders.flatMap(vo => vo.items));
    const invIds = [...new Set(allItems.map(i => i.inventoryItemId || i.productId).filter(Boolean))] as string[];
    const prodIds = [...new Set(allItems.map(i => i.productId).filter(Boolean))] as string[];

    const [inventoryItems, directProducts] = await Promise.all([
      invIds.length > 0
        ? this.prisma.inventoryItem.findMany({
            where: { id: { in: invIds } },
            include: {
              product: {
                include: {
                  cardDetail: {
                    include: { gameRel: true },
                  },
                },
              },
              condition: true,
              language: true,
              finish: true,
            },
          })
        : [],
      prodIds.length > 0
        ? this.prisma.product.findMany({
            where: { id: { in: prodIds } },
            include: {
              cardDetail: {
                include: { gameRel: true },
              },
            },
          })
        : [],
    ]);

    const invMap = new Map<string, any>();
    inventoryItems.forEach((ii: any) => invMap.set(ii.id, ii));

    const prodMap = new Map<string, any>();
    directProducts.forEach((p: any) => prodMap.set(p.id, p));

    const enrichedOrders = orders.map(order => ({
      ...order,
      vendorOrders: order.vendorOrders.map(vo => ({
        ...vo,
        items: vo.items.map(item => {
          const inv = (item.inventoryItemId && invMap.get(item.inventoryItemId)) || invMap.get(item.productId);
          const prod = inv?.product || prodMap.get(item.productId);

          return {
            ...item,
            imageUrl: prod?.imageUrl || null,
            expansion: prod?.cardDetail?.expansion || null,
            rarity: prod?.cardDetail?.rarity || null,
            collectorNum: prod?.cardDetail?.collectorNum || null,
            game: prod?.cardDetail?.gameRel?.name || null,
            condition: inv?.condition?.displayName || inv?.condition?.name || null,
            language: inv?.language?.name || null,
            finish: inv?.finish?.name || null,
          };
        }),
      })),
    }));

    return { orders: enrichedOrders, total, page, limit };
  }
}
