import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../prisma/prisma.service';
import { GetAdvancedReportsQuery } from '../impl/get-advanced-reports.query';

@QueryHandler(GetAdvancedReportsQuery)
export class GetAdvancedReportsHandler implements IQueryHandler<GetAdvancedReportsQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetAdvancedReportsQuery) {
    const { userId, role } = query;

    let storeId: string | null = null;
    if (role !== 'SUPERADMIN' && userId) {
      const store = await this.prisma.store.findFirst({
        where: { ownerId: userId },
        select: { id: true },
      });
      if (store) {
        storeId = store.id;
      }
    }

    // Rendimiento Financiero
    const transactions = await this.prisma.walletTransaction.findMany({
      where: storeId ? { storeId } : {},
      select: { amount: true, type: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    const vendorOrders = await this.prisma.vendorOrder.findMany({
      where: storeId ? { storeId } : {},
      select: { status: true, id: true },
    });

    const orders = storeId
      ? await this.prisma.vendorOrder
          .findMany({
            where: { storeId, status: 'PAID' },
            select: { subtotal: true, createdAt: true },
            orderBy: { createdAt: 'asc' },
          })
          .then((vos) =>
            vos.map((vo) => ({
              totalAmount: Number(vo.subtotal),
              createdAt: vo.createdAt,
            })),
          )
      : await this.prisma.order.findMany({
          select: { totalAmount: true, createdAt: true },
          where: { status: 'PAID' },
          orderBy: { createdAt: 'asc' },
        });

    // Preferencias y Catálogo (Basado en OrderItems de órdenes pagadas)
    const orderItemsRaw = await this.prisma.orderItem.findMany({
      where: {
        vendorOrder: {
          ...(storeId ? { storeId } : {}),
          status: 'PAID',
        },
      },
      select: {
        quantity: true,
        unitPrice: true,
        productId: true,
        inventoryItemId: true,
      },
    });

    // Requerimos datos de InventoryItem para condición e idioma
    const inventoryItemIds = orderItemsRaw.map((oi) => oi.inventoryItemId).filter((id): id is string => Boolean(id));
    const inventoryItems = inventoryItemIds.length > 0
      ? await this.prisma.inventoryItem.findMany({
          where: { id: { in: inventoryItemIds } },
          select: {
            id: true,
            condition: { select: { name: true } },
            language: { select: { name: true } },
          },
        })
      : [];

    // Requerimos datos de Product para Expansión y Rareza
    const productIds = orderItemsRaw.map((oi) => oi.productId);
    const products = productIds.length > 0
      ? await this.prisma.product.findMany({
          where: { id: { in: productIds } },
          select: {
            id: true,
            cardDetail: {
              select: {
                expansion: true,
                rarity: true,
                gameRel: { select: { name: true } },
              },
            },
          },
        })
      : [];

    // Salud del Inventario
    const inventoryValueAggregation = await this.prisma.inventoryItem.findMany({
      where: {
        ...(storeId ? { storeId } : {}),
        isPublished: true,
        stock: { gt: 0 },
      },
      select: { price: true, stock: true },
    });

    let totalInventoryValue = 0;
    for (const item of inventoryValueAggregation) {
      totalInventoryValue += Number(item.price) * item.stock;
    }

    // Dead Stock (Productos en stock que no han tenido ventas en orderItems)
    const deadStockCount = await this.prisma.inventoryItem.count({
      where: {
        ...(storeId ? { storeId } : {}),
        stock: { gt: 0 },
        id: { notIn: inventoryItemIds },
      },
    });

    return {
      financial: {
        transactions,
        vendorOrders,
        orders,
      },
      preferences: {
        orderItems: orderItemsRaw,
        inventoryItems,
        products,
      },
      inventory: {
        totalValue: totalInventoryValue,
        deadStockCount,
      },
    };
  }
}
