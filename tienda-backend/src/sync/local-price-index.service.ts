import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

export interface CardPriceHistoryPoint {
  date: string;
  usaPrice: number | null;
  localLowPrice: number | null;
  localAvgPrice: number | null;
  localLastSoldPrice: number | null;
  activeListings: number;
}

@Injectable()
export class LocalPriceIndexService implements OnApplicationBootstrap {
  private readonly logger = new Logger(LocalPriceIndexService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Resiliencia y Catch-Up: Al arrancar el backend (ej: en localhost o tras suspender la BD),
   * se verifica tras 20 segundos si ya existe el snapshot consolidado del día de hoy.
   * Si no existe (porque el servidor estuvo apagado a las 00:00), se genera automáticamente.
   */
  async onApplicationBootstrap(): Promise<void> {
    this.logger.log('LocalPriceIndexService inicializado. Programando verificación Catch-Up del mercado local en 20 segundos...');
    setTimeout(() => {
      this.checkAndRunCatchUp('BOOTSTRAP_STARTUP').catch((err) => {
        this.logger.error(`Error en Catch-Up de mercado local al arranque: ${err.message}`, err.stack);
      });
    }, 20000);
  }

  /**
   * Verifica si el snapshot de hoy está pendiente y lo ejecuta de forma segura e idempotente.
   */
  async checkAndRunCatchUp(triggerReason: string = 'BOOTSTRAP'): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
      const existingTodayCount = await this.prisma.localMarketPriceHistory.count({
        where: { date: today },
      });

      if (existingTodayCount === 0) {
        this.logger.log(
          `[LocalPriceIndex Catch-Up (${triggerReason})] No se encontró snapshot para hoy (${today.toISOString().split('T')[0]}). Generando automáticamente...`,
        );
        const result = await this.generateDailySnapshot();
        this.logger.log(
          `[LocalPriceIndex Catch-Up (${triggerReason})] Snapshot generado exitosamente: ${result.created} registros.`,
        );
      } else {
        this.logger.log(
          `[LocalPriceIndex Catch-Up (${triggerReason})] Snapshot de hoy ya registrado (${existingTodayCount} registros). Mercado local al día.`,
        );
      }
    } catch (e: any) {
      this.logger.error(`[LocalPriceIndex Catch-Up] Error al verificar snapshot pendiente: ${e.message}`);
    }
  }

  /**
   * Cron nocturno (00:00 cada día): genera el snapshot consolidado automático.
   */
  @Cron('0 0 * * *')
  async handleMidnightCron(): Promise<void> {
    this.logger.log('[CRON Nocturno] Iniciando generación automática del índice de precios local...');
    try {
      await this.generateDailySnapshot();
    } catch (e: any) {
      this.logger.error(`[CRON Nocturno] Error en snapshot: ${e.message}`);
    }
  }

  /**
   * Genera el snapshot diario consolidado del mercado interno de TapTrade
   * calculando precios de lista (InventoryItem) y ventas reales (OrderItem).
   */
  async generateDailySnapshot(): Promise<{ processed: number; created: number }> {
    this.logger.log('Iniciando consolidación del Índice de Precios Local de TapTrade...');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
      // 1. Agregación en tiempo récord (1 query SQL) sobre todos los ítems publicados con stock
      const aggregated: any[] = await this.prisma.$queryRaw`
        SELECT 
          "productId", 
          "finishId", 
          MIN("price")::float AS "lowPrice", 
          ROUND(AVG("price")::numeric, 2)::float AS "avgPrice", 
          MAX("price")::float AS "highPrice", 
          COUNT(DISTINCT "storeId")::int AS "activeListings", 
          SUM("stock")::int AS "totalStock"
        FROM "InventoryItem"
        WHERE "stock" > 0 AND "isPublished" = true
        GROUP BY "productId", "finishId";
      `;

      this.logger.log(`Se agregaron ${aggregated.length} variantes con stock activo en el marketplace.`);

      let created = 0;
      for (const row of aggregated) {
        // 2. Buscar última venta real en OrderItem para este producto
        const lastOrder = await this.prisma.orderItem.findFirst({
          where: { productId: row.productId },
          orderBy: { vendorOrder: { createdAt: 'desc' } },
          select: { unitPrice: true }
        });

        const lastSoldPrice = lastOrder?.unitPrice ? Number(lastOrder.unitPrice) : null;

        await this.prisma.localMarketPriceHistory.upsert({
          where: {
            productId_finishId_date: {
              productId: row.productId,
              finishId: row.finishId || '',
              date: today,
            },
          },
          create: {
            productId: row.productId,
            finishId: row.finishId || null,
            date: today,
            lowPrice: row.lowPrice,
            avgPrice: row.avgPrice,
            highPrice: row.highPrice,
            lastSoldPrice: lastSoldPrice,
            activeListings: row.activeListings,
            totalStock: row.totalStock,
            currency: 'CLP',
          },
          update: {
            lowPrice: row.lowPrice,
            avgPrice: row.avgPrice,
            highPrice: row.highPrice,
            lastSoldPrice: lastSoldPrice ?? undefined,
            activeListings: row.activeListings,
            totalStock: row.totalStock,
          },
        });
        created++;
      }

      this.logger.log(`Snapshot diario completado: ${created} registros consolidados.`);
      return { processed: aggregated.length, created };
    } catch (error: any) {
      this.logger.error(`Error generando snapshot diario local: ${error.message}`);
      throw error;
    }
  }

  /**
   * Obtiene la serie de tiempo combinada para la gráfica de la carta en /shop-details:
   * 1. Fluctuación de EE.UU. (MarketPriceHistory)
   * 2. Fluctuación de los usuarios de TapTrade (LocalMarketPriceHistory)
   */
  async getCombinedPriceHistory(productId: string, days: number = 30): Promise<CardPriceHistoryPoint[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    // 1. Obtener histórico de EE.UU.
    const usaHistory = await this.prisma.marketPriceHistory.findMany({
      where: {
        marketPrice: { productId },
        date: { gte: startDate }
      },
      orderBy: { date: 'asc' },
      select: {
        date: true,
        price: true,
      }
    });

    // 2. Obtener histórico local de TapTrade
    const localHistory = await this.prisma.localMarketPriceHistory.findMany({
      where: {
        productId,
        date: { gte: startDate }
      },
      orderBy: { date: 'asc' },
      select: {
        date: true,
        lowPrice: true,
        avgPrice: true,
        lastSoldPrice: true,
        activeListings: true,
      }
    });

    // 3. Fusionar por fecha en un mapa unificado
    const pointsMap = new Map<string, CardPriceHistoryPoint>();

    for (const u of usaHistory) {
      const dStr = u.date.toISOString().split('T')[0];
      pointsMap.set(dStr, {
        date: dStr,
        usaPrice: Number(u.price),
        localLowPrice: null,
        localAvgPrice: null,
        localLastSoldPrice: null,
        activeListings: 0,
      });
    }

    for (const l of localHistory) {
      const dStr = l.date.toISOString().split('T')[0];
      const existing = pointsMap.get(dStr) || {
        date: dStr,
        usaPrice: null,
        localLowPrice: null,
        localAvgPrice: null,
        localLastSoldPrice: null,
        activeListings: 0,
      };

      existing.localLowPrice = Number(l.lowPrice);
      existing.localAvgPrice = Number(l.avgPrice);
      existing.localLastSoldPrice = l.lastSoldPrice ? Number(l.lastSoldPrice) : null;
      existing.activeListings = l.activeListings;
      pointsMap.set(dStr, existing);
    }

    return Array.from(pointsMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  }
}
