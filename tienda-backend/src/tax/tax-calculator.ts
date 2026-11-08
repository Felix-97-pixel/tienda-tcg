/**
 * Motor de cálculo de IVA para Chile según normativa del SII (DL 825).
 * Funciones puras sin dependencias externas: deterministas, reutilizables y altamente testeadas
 * para checkout, cotizaciones, sincronización masiva, POS y contabilidad.
 */

export const DEFAULT_VAT_RATE = 0.19;

/**
 * Paso de redondeo monetario oficial en Chile (Ley de Redondeo Nº 20.956:
 * eliminación de monedas de $1 y $5 pesos; todo precio comercial se redondea a la decena).
 */
export const DEFAULT_CLP_ROUNDING_STEP = 10;

/**
 * Redondea un monto en CLP según la regla de redondeo comercial chilena (decena más cercana).
 * Elimina unidades fraccionarias de $1 y $5 pesos (ej: $11.687 -> $11.690 CLP).
 */
export function roundToCLP(amount: number, step = DEFAULT_CLP_ROUNDING_STEP): number {
  const num = Number(amount || 0);
  if (!num || isNaN(num) || num <= 0) return 0;
  return Math.round(num / step) * step;
}

/**
 * Resuelve la tasa de cambio USD -> CLP desde listas precargadas de tasas de tienda y globales.
 * Jerarquía:
 * 1. Tasa personalizada de la tienda (StoreGameExchangeRate)
 * 2. Tasa global del juego en CLP (GlobalGameExchangeRate)
 * 3. Fallback (1.000 CLP/USD por defecto)
 */
export function resolveExchangeRateFromLists(
  gameId: string | null | undefined,
  storeRates?: Array<{ gameId: string; rate: any }>,
  globalRates?: Array<{ gameId: string; rate: any }>,
  fallback = 1000,
): number {
  if (!gameId) return fallback;

  if (Array.isArray(storeRates)) {
    const storeMatch = storeRates.find((r) => r.gameId === gameId);
    if (storeMatch && Number(storeMatch.rate) > 0) {
      return Number(storeMatch.rate);
    }
  }

  if (Array.isArray(globalRates)) {
    const globalMatch = globalRates.find((r) => r.gameId === gameId);
    if (globalMatch && Number(globalMatch.rate) > 0) {
      return Number(globalMatch.rate);
    }
  }

  return fallback;
}

/**
 * Calcula el Precio de Venta al Público (PVP Bruto con IVA incluido) en CLP
 * unificado para Tienda Online, Inventario, Checkout y Punto de Venta (POS).
 * - Si `isTcg` es true, convierte desde USD multiplicando por `exchangeRate` y redondea a la decena.
 * - Si `isTcg` es false, toma el valor en CLP y lo redondea a la decena.
 */
export function calculateProductPriceCLP(
  rawPrice: number | string,
  isTcg: boolean,
  exchangeRate = 1,
  step = DEFAULT_CLP_ROUNDING_STEP,
): number {
  const numericPrice = Number(rawPrice || 0);
  if (!numericPrice || isNaN(numericPrice) || numericPrice <= 0) return 0;
  const unroundedClp = isTcg ? numericPrice * exchangeRate : numericPrice;
  return roundToCLP(unroundedClp, step);
}

/** Representa la tasa en puntos básicos para prevenir imprecisiones de punto flotante en JS (0.19 -> 1900). */
const toBasisPoints = (rate: number): number => Math.round(rate * 10_000);

export interface TaxBreakdown {
  net: number;    // Neto en pesos enteros CLP
  vat: number;    // IVA en pesos enteros CLP
  gross: number;  // Bruto en pesos enteros CLP
  rate: number;   // Tasa aplicada (ej: 0.19)
}

/**
 * Calcula el valor bruto a partir de un valor neto (ej: el admin ingresa precio neto).
 * Fórmula: Bruto = round(Neto * (1 + rate))
 */
export function grossFromNet(net: number, rate = DEFAULT_VAT_RATE): number {
  assertIntegerCLP(net);
  const bp = toBasisPoints(rate);
  return Math.round((net * (10_000 + bp)) / 10_000);
}

/**
 * Calcula el valor neto a partir de un valor bruto (ej: desglose informativo).
 * Fórmula: Neto = round(Bruto / (1 + rate))
 */
export function netFromGross(gross: number, rate = DEFAULT_VAT_RATE): number {
  assertIntegerCLP(gross);
  const bp = toBasisPoints(rate);
  return Math.round((gross * 10_000) / (10_000 + bp));
}

/**
 * Desglose tributario de un DOCUMENTO fiscal emitido a precio BRUTO (Boleta Electrónica).
 * Garantía SII: Neto + IVA === Total Bruto (exactitud al peso entero, sin desfases).
 */
export function breakdownFromGross(totalGross: number, rate = DEFAULT_VAT_RATE): TaxBreakdown {
  assertIntegerCLP(totalGross);
  const net = netFromGross(totalGross, rate);
  const vat = totalGross - net;
  return { net, vat, gross: totalGross, rate };
}

/**
 * Desglose tributario de un DOCUMENTO fiscal emitido a precio NETO (Factura Electrónica).
 * Garantía SII: Neto + IVA === Total Bruto.
 */
export function breakdownFromNet(totalNet: number, rate = DEFAULT_VAT_RATE): TaxBreakdown {
  assertIntegerCLP(totalNet);
  const vat = Math.round((totalNet * toBasisPoints(rate)) / 10_000);
  const gross = totalNet + vat;
  return { net: totalNet, vat, gross, rate };
}

/**
 * Desglose para operaciones no afectas o exentas.
 */
export function exemptBreakdown(total: number): TaxBreakdown {
  assertIntegerCLP(total);
  return { net: total, vat: 0, gross: total, rate: 0 };
}

/**
 * Valida que los valores en pesos chilenos sean números enteros no negativos.
 */
function assertIntegerCLP(value: number): void {
  if (typeof value !== 'number' || isNaN(value) || !Number.isInteger(value) || value < 0) {
    throw new Error(`Monto CLP inválido para cálculo tributario: ${value}`);
  }
}

