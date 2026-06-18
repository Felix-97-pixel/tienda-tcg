import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../prisma/prisma.service';
import { GetAdvancedReportsQuery } from '../impl/get-advanced-reports.query';

@QueryHandler(GetAdvancedReportsQuery)
export class GetAdvancedReportsHandler implements IQueryHandler<GetAdvancedReportsQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(_query: GetAdvancedReportsQuery) {
    // Rendimiento Financiero
    const transactions = await this.prisma.walletTransaction.findMany({
      select: { amount: true, type: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    const vendorOrders = await this.prisma.vendorOrder.findMany({
      select: { status: true, id: true },
    });

    const orders = await this.prisma.order.findMany({
      select: { totalAmount: true, createdAt: true },
      where: { status: 'PAID' },
      orderBy: { createdAt: 'asc' },
    });

    // Preferencias y Catálogo (Basado en OrderItems de órdenes pagadas)
    // Para simplificar, traemos OrderItems unidos con CardDetail y InventoryItem
    const orderItemsRaw = await this.prisma.orderItem.findMany({
      where: { vendorOrder: { status: 'PAID' } },
      select: {
        quantity: true,
        unitPrice: true,
        productId: true,
        inventoryItemId: true,
      },
    });

    // Requerimos datos de InventoryItem para condición e idioma
    const inventoryItemIds = orderItemsRaw.map(oi => oi.inventoryItemId).filter(id => id);
    const inventoryItems = await this.prisma.inventoryItem.findMany({
      where: { id: { in: inventoryItemIds as string[] } },
      select: {
        id: true,
        condition: { select: { name: true } },
        language: { select: { name: true } },
      },
    });

    // Requerimos datos de Product para Expansión y Rareza
    const productIds = orderItemsRaw.map(oi => oi.productId);
    const products = await this.prisma.product.findMany({
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
    });

    // Salud del Inventario
    const inventoryValueAggregation = await this.prisma.inventoryItem.findMany({
      where: { isPublished: true, stock: { gt: 0 } },
      select: { price: true, stock: true },
    });
    
    let totalInventoryValue = 0;
    for (const item of inventoryValueAggregation) {
      totalInventoryValue += Number(item.price) * item.stock;
    }

    // Dead Stock (Productos en stock que no están en orderItemsRaw, simplificado)
    const deadStockCount = await this.prisma.inventoryItem.count({
      where: {
        stock: { gt: 0 },
        id: { notIn: inventoryItemIds as string[] },
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
