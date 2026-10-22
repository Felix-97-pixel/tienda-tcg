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
    const isSuperAdmin = query.requesterRole === 'SUPERADMIN';
    const isAdmin = query.requesterRole === 'ADMIN';

    // Si es ADMIN de tienda, solo mostrar el VendorOrder de su propia tienda
    let filteredVendorOrders = order.vendorOrders;
    if (isAdmin && !isSuperAdmin && query.requesterUserId) {
      const store = await this.prisma.store.findUnique({
        where: { ownerId: query.requesterUserId },
        select: { id: true },
      });
      if (store) {
        filteredVendorOrders = order.vendorOrders.filter(
          (vo) => vo.storeId === store.id,
        );
      }
    }

    // Enriquecer items con imágenes y detalles TCG
    const allItems = filteredVendorOrders.flatMap((vo) => vo.items);
    const invIds = [
      ...new Set(
        allItems.map((i) => i.inventoryItemId || i.productId).filter(Boolean),
      ),
    ] as string[];
    const prodIds = [
      ...new Set(allItems.map((i) => i.productId).filter(Boolean)),
    ] as string[];

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

    const enrichedVendorOrders = filteredVendorOrders.map((vo) => ({
      ...vo,
      items: vo.items.map((item) => {
        const inv =
          (item.inventoryItemId && invMap.get(item.inventoryItemId)) ||
          invMap.get(item.productId);
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
    }));

    const resultOrder = {
      ...order,
      vendorOrders: enrichedVendorOrders,
    };

    // Si la orden pertenece a un usuario registrado y quien consulta no es el dueño ni admin,
    // ofuscar datos personales sensibles para prevenir fuga de información privada (IDOR)
    if (!isOwner && !isAdmin && !isSuperAdmin) {
      return {
        ...resultOrder,
        email: resultOrder.email
          ? resultOrder.email.replace(/(.{2})(.*)(@.*)/, '$1***$3')
          : resultOrder.email,
        phone: resultOrder.phone ? '******' + resultOrder.phone.slice(-4) : null,
        address: 'Dirección protegida',
      };
    }

    return resultOrder;
  }
}
