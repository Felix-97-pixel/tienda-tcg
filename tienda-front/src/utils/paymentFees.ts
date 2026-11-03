/**
 * Utilidades para cálculo de comisiones de plataforma e impuestos (Normativa SII Chile).
 * 
 * En el modelo de marketplace TapTrade:
 * 1. Las tiendas reciben el 100% de sus ventas y envíos (0% comisión a la tienda).
 * 2. Los precios de catálogo y despachos son BRUTOS (IVA 19% incluido por cada tienda).
 * 3. La comisión de intermediación de TapTrade es 3% neto + IVA (3.57% nominal),
 *    con gross-up por tarifa de procesamiento pasarela peor caso (Transbank crédito 2.29% + IVA = 2.7251%),
 *    resultando en un factor de ~3.67% sobre la base imponible total (productos + despacho).
 */

export type PaymentGatewayType = 'MERCADOPAGO' | 'WEBPAY' | 'DEFAULT';

export interface GatewayFeeConfig {
  /** Tasa efectiva con gross-up (~3.67%) */
  rate: number;
  /** Texto legible */
  percentageText: string;
  /** Nombre comercial transparente */
  label: string;
  /** Descripción para el comprador */
  description: string;
}

// Tasas oficiales según directrices tributarias SII y confirmación de negocio
export const VAT_RATE = 0.19;
export const TAPTRADE_COMMISSION_NET = 0.03; // 3% neto
export const TRANSBANK_CREDIT_RATE_NET = 0.0229; // 2.29% crédito peor caso

// Gross-up exacto: (0.03 * 1.19) / (1 - (0.0229 * 1.19)) ≈ 0.0366999
const GROSS_UP_RATE = (TAPTRADE_COMMISSION_NET * (1 + VAT_RATE)) / (1 - (TRANSBANK_CREDIT_RATE_NET * (1 + VAT_RATE)));

export const GATEWAY_FEES: Record<PaymentGatewayType, GatewayFeeConfig> = {
  WEBPAY: {
    rate: GROSS_UP_RATE,
    percentageText: '3% + IVA',
    label: 'Comisión TapTrade',
    description: 'Servicio de intermediación tecnológica y protección al comprador TapTrade SpA.',
  },
  MERCADOPAGO: {
    rate: GROSS_UP_RATE,
    percentageText: '3% + IVA',
    label: 'Comisión TapTrade',
    description: 'Servicio de intermediación tecnológica y protección al comprador TapTrade SpA.',
  },
  DEFAULT: {
    rate: GROSS_UP_RATE,
    percentageText: '3% + IVA',
    label: 'Comisión TapTrade',
    description: 'Servicio de intermediación tecnológica y protección al comprador TapTrade SpA.',
  },
};

/**
 * Calcula el monto en pesos chilenos correspondiente a la comisión del comprador (3% + IVA con gross-up).
 * @param baseAmount Monto base bruto (Subtotal productos + Despachos cotizados)
 * @param gateway Pasarela seleccionada
 * @returns Monto redondeado en CLP
 */
export function calculatePaymentFee(
  baseAmount: number,
  gateway: PaymentGatewayType = 'WEBPAY'
): number {
  if (!baseAmount || baseAmount <= 0) return 0;
  const config = GATEWAY_FEES[gateway] || GATEWAY_FEES.DEFAULT;
  return Math.round(baseAmount * config.rate);
}

/**
 * Obtiene la configuración de la comisión.
 */
export function getGatewayConfig(gateway: PaymentGatewayType = 'WEBPAY'): GatewayFeeConfig {
  return GATEWAY_FEES[gateway] || GATEWAY_FEES.DEFAULT;
}
