import { roundToCLP } from './tcgPrices';
import { LocalProduct } from '@/app/admin/pos/_lib/posDb';

export interface TradeInValuation {
  cashPrice: number;
  creditPrice: number;
  source: 'BUYLIST' | 'AUTO_RATE' | 'MANUAL';
  conditionId?: string;
  languageId?: string;
  rate?: number;
  buyPercentage?: number;
  creditPercentage?: number;
  basePriceUSD?: number;
}

/**
 * Resuelve el valor a pagar al cliente en Trade-in:
 * 1. Prioridad 1 (Principal): Si la carta está en la Buylist de la tienda, se usan sus precios configurados.
 * 2. Prioridad 2 (Automático): Si no está en Buylist, calcula usando la tasa del juego (rate),
 *    el % de compra en efectivo (buyPercentage) y el % de pago en crédito (creditPercentage) sobre el precio de mercado base en USD.
 * 3. Prioridad 3 (Manual): Si no hay precio de mercado o tasa, retorna $0 CLP para ingreso manual.
 */
export function resolveTradeInValuation(
  product: LocalProduct,
  buylistMap?: Map<string, { cashPrice: number; creditPrice: number; conditionId: string; languageId: string }>,
  exchangeRates?: any[]
): TradeInValuation {
  // 1. Prioridad 1: Buylist explícita de la tienda
  if (buylistMap && buylistMap.has(product.id)) {
    const item = buylistMap.get(product.id)!;
    if (item.cashPrice > 0 || item.creditPrice > 0) {
      return {
        cashPrice: item.cashPrice,
        creditPrice: item.creditPrice,
        source: 'BUYLIST',
        conditionId: item.conditionId,
        languageId: item.languageId,
      };
    }
  }

  // 2. Prioridad 2: Avalúo automático según Tasa de Cambio del Juego
  if (exchangeRates && exchangeRates.length > 0) {
    const gameId = product.cardDetail?.gameId;
    const gameCategoryName = product.category?.name?.toLowerCase().trim();

    // Buscar la tasa asociada al juego (por gameId o por nombre del juego)
    const rateConfig = exchangeRates.find((r: any) => {
      if (gameId && r.gameId === gameId) return true;
      if (r.game?.id && gameId && r.game.id === gameId) return true;
      if (gameCategoryName && r.game?.name?.toLowerCase().trim() === gameCategoryName) return true;
      return false;
    });

    if (rateConfig) {
      // Obtener el precio base de mercado en USD
      let baseUSD = 0;

      // 2a. Desde marketPrices
      if (product.marketPrices && product.marketPrices.length > 0) {
        const nonFoil = product.marketPrices.find(
          (mp) =>
            !mp.finishId ||
            mp.finish?.name?.toLowerCase().includes('normal') ||
            mp.finish?.name?.toLowerCase().includes('non')
        );
        baseUSD = Number(nonFoil?.price || product.marketPrices[0]?.price || 0);
      }

      // 2b. Fallback: desde items del producto (ej: rawPriceUsd o item.price)
      if ((!baseUSD || baseUSD <= 0) && product.items && product.items.length > 0) {
        const itemWithUsd = product.items.find((i) => i.rawPriceUsd && Number(i.rawPriceUsd) > 0);
        if (itemWithUsd) {
          baseUSD = Number(itemWithUsd.rawPriceUsd);
        } else if (product.exchangeRateApplied && Number(product.items[0]?.price) > 0) {
          baseUSD = Number(product.items[0].price) / product.exchangeRateApplied;
        }
      }

      if (baseUSD > 0) {
        const rate = Number(rateConfig.rate || 1300);
        const buyPct =
          rateConfig.buyPercentage !== undefined && rateConfig.buyPercentage !== null
            ? Number(rateConfig.buyPercentage)
            : 50;
        const creditPct =
          rateConfig.creditPercentage !== undefined && rateConfig.creditPercentage !== null
            ? Number(rateConfig.creditPercentage)
            : 70;

        // PVP final de venta al público en CLP (con IVA)
        const pvpCLP = roundToCLP(baseUSD * rate);

        // Precios automáticos calculados para Trade-in
        const cashPrice = roundToCLP(pvpCLP * (buyPct / 100));
        const creditPrice = roundToCLP(pvpCLP * (creditPct / 100));

        return {
          cashPrice,
          creditPrice,
          source: 'AUTO_RATE',
          rate,
          buyPercentage: buyPct,
          creditPercentage: creditPct,
          basePriceUSD: baseUSD,
        };
      }
    }
  }

  // 3. Fallback: Ingreso manual
  return {
    cashPrice: 0,
    creditPrice: 0,
    source: 'MANUAL',
  };
}

