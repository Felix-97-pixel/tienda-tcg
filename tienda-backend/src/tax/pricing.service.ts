import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { calculateProductPriceCLP } from './tax-calculator';

export interface PriceResolvableItem {
  price: Prisma.Decimal | number;
  storeId?: string | null;
  gameId?: string | null;
}

@Injectable()
export class PricingService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Resuelve el precio unitario BRUTO (IVA incluido) en pesos chilenos (CLP redondeado a la decena).
   * Regla de negocio unificada (Ley de Redondeo chilena Nº 20.956):
   * - Si el producto tiene gameId (TCG como Magic, Pokémon, etc.), el precio en BD es en USD,
   *   se multiplica por la tasa configurada de la tienda o la global (o 1.000 por defecto)
   *   y se redondea a la decena más cercana mediante `calculateProductPriceCLP`.
   * - Si no tiene gameId, el precio en BD ya representa CLP y también se redondea a la decena.
   */
  async resolveUnitGrossCLP(item: PriceResolvableItem): Promise<number> {
    const rawPrice = Number(item.price);
    if (!item.gameId) {
      return calculateProductPriceCLP(rawPrice, false);
    }

    const rate = await this.resolveExchangeRate(item.storeId ?? null, item.gameId);
    return calculateProductPriceCLP(rawPrice, true, rate);
  }

  /**
   * Resuelve la tasa de cambio USD -> CLP para una combinación tienda + juego.
   */
  async resolveExchangeRate(storeId: string | null, gameId: string): Promise<number> {
    if (storeId) {
      const storeRate = await this.prisma.storeGameExchangeRate.findUnique({
        where: { storeId_gameId: { storeId, gameId } },
      });
      if (storeRate && Number(storeRate.rate) > 0) {
        return Number(storeRate.rate);
      }
    }

    const globalRate = await this.prisma.globalGameExchangeRate.findUnique({
      where: { gameId_currencyCode: { gameId, currencyCode: 'CLP' } },
    });

    if (globalRate && Number(globalRate.rate) > 0) {
      return Number(globalRate.rate);
    }

    return 1000; // Tasa por defecto de respaldo
  }

  /**
   * Carga por lotes las tasas de cambio de múltiples tiendas y juegos para operaciones masivas.
   */
  async loadExchangeRateMap(storeIds: string[], gameIds: string[]): Promise<Map<string, number>> {
    const rateMap = new Map<string, number>();

    const [storeRates, globalRates] = await Promise.all([
      this.prisma.storeGameExchangeRate.findMany({
        where: {
          storeId: { in: storeIds },
          gameId: { in: gameIds },
        },
      }),
      this.prisma.globalGameExchangeRate.findMany({
        where: {
          gameId: { in: gameIds },
          currencyCode: 'CLP',
        },
      }),
    ]);

    // Llenar primero con globales
    for (const g of globalRates) {
      rateMap.set(`global:${g.gameId}`, Number(g.rate));
    }

    // Sobrescribir con tasas específicas por tienda
    for (const s of storeRates) {
      rateMap.set(`store:${s.storeId}:${s.gameId}`, Number(s.rate));
    }

    return rateMap;
  }
}

