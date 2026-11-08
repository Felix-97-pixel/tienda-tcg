/**
 * TCG Pricing and Variant Resolution Utility
 * Ensures uniform price calculation and "best available price" preview across:
 * - /shop (Marketplace Catalog & Deckbuilder list)
 * - /shop-details/[slug] (Product detail page)
 * - /shop/store/[subdomain] (Individual store catalogs)
 * - Landing featured cards
 */

export interface NormalizedVariantDetails {
  variant: any | null;
  finalPriceCLP: number;
  stock: number;
  inStock: boolean;
  conditionCode: string;
  conditionClass: string;
  conditionName: string;
  languageCode: string;
  isFoil: boolean;
  storeName: string;
  store: any;
}

/**
 * Calculates the final price in CLP for a given inventory item.
 * Accounts for store-specific game exchange rates, global rates, or default fallback.
 */
/**
 * Paso de redondeo monetario oficial en Chile (Ley de Redondeo Nº 20.956:
 * eliminación de monedas de $1 y $5 pesos; todo precio comercial se redondea a la decena).
 */
export const DEFAULT_CLP_ROUNDING_STEP = 10;

/**
 * Redondea un monto en CLP según la regla de redondeo comercial chilena (decena más cercana).
 * Elimina monedas fraccionarias de $1 y $5 pesos (ej: $11.687 -> $11.690 CLP).
 */
export function roundToCLP(amount: number, step: number = DEFAULT_CLP_ROUNDING_STEP): number {
  const num = Number(amount || 0);
  if (!num || isNaN(num) || num <= 0) return 0;
  return Math.round(num / step) * step;
}

/**
 * Resuelve la tasa de cambio USD -> CLP aplicable a un juego TCG:
 * 1. Tasa personalizada de la tienda (StoreGameExchangeRate)
 * 2. Tasa global del juego en CLP (GlobalGameExchangeRate)
 * 3. Fallback a 1.000 CLP/USD
 */
export function resolveGameExchangeRate(
  gameId: string | null | undefined,
  storeRates?: any[],
  globalRates?: any[],
  fallback: number = 1000
): number {
  if (!gameId) return fallback;

  if (Array.isArray(storeRates)) {
    const customRate = storeRates.find((r: any) => r.gameId === gameId);
    if (customRate && Number(customRate.rate) > 0) {
      return Number(customRate.rate);
    }
  }

  if (Array.isArray(globalRates)) {
    const globalRateObj = globalRates.find((r: any) => r.gameId === gameId);
    if (globalRateObj && Number(globalRateObj.rate) > 0) {
      return Number(globalRateObj.rate);
    }
  }

  return fallback;
}

/**
 * Desglosa un precio final con IVA en CLP en su Precio Neto y Débito Fiscal IVA (19%).
 * Mantiene la suma exacta: Neto + IVA = Precio Final sin descuadre alguno.
 */
export function calculateVatBreakdownCLP(rawPriceCLP: number, step: number = DEFAULT_CLP_ROUNDING_STEP) {
  const total = roundToCLP(rawPriceCLP, step);
  const net = Math.round(total / 1.19);
  const vat = total - net;
  return { net, vat, total };
}

export function calculateItemPriceCLP(
  item: any,
  gameId?: string,
  globalRates: any[] = [],
  storeRatesOverride?: any[]
): number {
  if (!item) return 0;
  const rawPrice = Number(item.discountedPrice ?? item.price ?? 0);
  if (!rawPrice || isNaN(rawPrice) || rawPrice <= 0) return 0;

  // Determine gameId
  const effectiveGameId =
    gameId ||
    item.gameId ||
    item.cardDetail?.gameId ||
    item.cardDetail?.gameRel?.id ||
    item.product?.cardDetail?.gameId;

  if (effectiveGameId) {
    const storeRates = storeRatesOverride || item.store?.gameExchangeRates;
    const exchangeRate = resolveGameExchangeRate(effectiveGameId, storeRates, globalRates);
    return roundToCLP(rawPrice * exchangeRate);
  }

  return roundToCLP(rawPrice);
}

/**
 * Selects the best available variant (cheapest in-stock card) for a product.
 * - Prioritizes in-stock items (stock > 0)
 * - Prioritizes items with price > 0
 * - Orders by calculated final CLP price
 */
export function getBestAvailableVariant(
  product: any,
  globalRates: any[] = [],
  storeIdFilter?: string
): NormalizedVariantDetails {
  const gameId =
    product?.cardDetail?.gameId ||
    product?.cardDetail?.gameRel?.id ||
    product?.gameId;

  let variants: any[] = Array.isArray(product?.items) ? product.items : [];

  // Filter strictly by store if storeIdFilter is supplied (ensures store-specific lowest price)
  if (storeIdFilter) {
    variants = variants.filter(
      (v: any) => v.storeId === storeIdFilter || v.store?.id === storeIdFilter
    );
  }

  if (variants.length === 0) {
    const isStoreMatch = !storeIdFilter || product?.storeId === storeIdFilter || product?.store?.id === storeIdFilter;
    const fallbackPrice = calculateItemPriceCLP(product, gameId, globalRates);
    const fallbackStock = isStoreMatch ? Number(product?.stock ?? 0) : 0;
    const rawCond = (product?.condition_rel?.name || product?.condition || "NM").toUpperCase();
    const isFoil = Boolean(
      product?.finish?.name?.toLowerCase().includes("foil") ||
      product?.finish?.name?.toLowerCase().includes("holo") ||
      product?.cardDetail?.isFoil
    );
    const rawLang = product?.language?.name || product?.language || "EN";

    return {
      variant: null,
      finalPriceCLP: fallbackPrice,
      stock: fallbackStock,
      inStock: fallbackStock > 0,
      conditionCode: parseConditionCode(rawCond),
      conditionClass: getConditionBadgeClass(parseConditionCode(rawCond)),
      conditionName: rawCond,
      languageCode: (typeof rawLang === "string" ? rawLang : "EN").substring(0, 2).toUpperCase(),
      isFoil,
      storeName: product?.store?.name || "Tienda TapTrade",
      store: product?.store || null,
    };
  }

  // 1. Separate in-stock variants from out-of-stock
  const inStockVariants = variants.filter((v: any) => Number(v.stock ?? 0) > 0);
  const candidates = inStockVariants.length > 0 ? inStockVariants : variants;

  // 2. Filter variants with valid positive price if any exist
  const pricedCandidates = candidates.filter(
    (v: any) => calculateItemPriceCLP(v, gameId, globalRates) > 0
  );
  const pool = pricedCandidates.length > 0 ? pricedCandidates : candidates;

  // 3. Sort by final CLP price ascending
  const sorted = [...pool].sort((a: any, b: any) => {
    const priceA = calculateItemPriceCLP(a, gameId, globalRates);
    const priceB = calculateItemPriceCLP(b, gameId, globalRates);
    return priceA - priceB;
  });

  const best = sorted[0];
  const finalPriceCLP = calculateItemPriceCLP(best, gameId, globalRates);
  const stock = Number(best?.stock ?? 0);
  const inStock = inStockVariants.length > 0 && stock > 0;

  // Extract condition
  const rawCond = (
    best?.condition_rel?.displayName ||
    best?.condition_rel?.name ||
    best?.condition?.displayName ||
    best?.condition?.name ||
    (typeof best?.condition === "string" ? best.condition : "") ||
    product?.condition ||
    "NM"
  ).toUpperCase();

  const condCode = parseConditionCode(rawCond);

  // Extract foil
  const finishName = (
    best?.finish?.name ||
    (typeof best?.finish === "string" ? best.finish : "") ||
    product?.finish?.name ||
    ""
  ).toLowerCase();

  const isFoil = Boolean(
    finishName.includes("foil") ||
    finishName.includes("holo") ||
    best?.isFoil ||
    product?.cardDetail?.isFoil
  );

  // Extract language
  const rawLang =
    best?.language?.name ||
    best?.language?.code ||
    (typeof best?.language === "string" ? best.language : "") ||
    product?.language?.name ||
    "EN";
  const languageCode = (typeof rawLang === "string" ? rawLang : "EN").substring(0, 2).toUpperCase();

  const storeName = best?.store?.name || product?.store?.name || "Tienda TapTrade";

  return {
    variant: best,
    finalPriceCLP,
    stock,
    inStock,
    conditionCode: condCode,
    conditionClass: getConditionBadgeClass(condCode),
    conditionName: rawCond,
    languageCode,
    isFoil,
    storeName,
    store: best?.store || product?.store || null,
  };
}

export function parseConditionCode(rawCond: string): string {
  const upper = (rawCond || "").toUpperCase();
  if (upper.includes("LIGHT") || upper === "LP") return "LP";
  if (upper.includes("MODERATE") || upper === "MP") return "MP";
  if (upper.includes("HEAVY") || upper === "HP") return "HP";
  if (upper.includes("DAMAGE") || upper === "DMG") return "DMG";
  return "NM";
}

export function getConditionBadgeClass(code: string): string {
  switch (code) {
    case "LP":
      return "badge-condition-lp";
    case "MP":
      return "badge-condition-mp";
    case "HP":
      return "badge-condition-hp";
    case "DMG":
      return "badge-condition-dmg";
    case "NM":
    default:
      return "badge-condition-nm";
  }
}
