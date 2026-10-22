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
    const { page, limit, userId, role, status, deliveryStatus } = query;
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

    // Regla operativa: en el panel de despacho y trabajo de la tienda,
    // solo se procesan órdenes PAGADAS (status: PAID).
    // Las órdenes FAILED o PENDING son intentos fallidos o no completados.
    const targetStatus = (status || 'PAID') as any;

    const voSomeCondition: any = {};
    if (storeId) {
      voSomeCondition.storeId = storeId;
    }
    if (deliveryStatus === 'PENDING_DISPATCH') {
      voSomeCondition.deliveryStatus = { not: 'DISPATCHED' };
    } else if (deliveryStatus === 'DISPATCHED') {
      voSomeCondition.deliveryStatus = 'DISPATCHED';
    }

    const where: any = {
      status: targetStatus,
      ...(Object.keys(voSomeCondition).length > 0
        ? {
            vendorOrders: {
              some: voSomeCondition,
            },
          }
        : {}),
    };

    const [orders, total, counts] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          vendorOrders: {
            where: storeId ? { storeId } : undefined,
            include: { items: true, store: true, shippingProvider: true },
          },
          payment: { select: { status: true, authCode: true, cardLast4: true } },
        },
      }),
      this.prisma.order.count({ where }),
      storeId
        ? Promise.all([
            this.prisma.order.count({
              where: {
                status: 'PAID',
                vendorOrders: {
                  some: { storeId, deliveryStatus: { not: 'DISPATCHED' } },
                },
              },
            }),
            this.prisma.order.count({
              where: {
                status: 'PAID',
                vendorOrders: {
                  some: { storeId, deliveryStatus: 'DISPATCHED' },
                },
              },
            }),
            this.prisma.order.count({
              where: {
                status: 'PAID',
                vendorOrders: {
                  some: { storeId },
                },
              },
            }),
          ]).then(([pendingDispatch, dispatched, totalPaid]) => ({
            pendingDispatch,
            dispatched,
            totalPaid,
          }))
        : Promise.resolve(undefined),
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

    return { orders: enrichedOrders, total, page, limit, counts };
  }
}
