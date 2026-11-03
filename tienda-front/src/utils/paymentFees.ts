/**
 * Utilidades para cálculo de comisiones de plataforma e impuestos (Normativa SII Chile).
 * 
 * En el modelo de marketplace TapTrade:
 * 1. Las tiendas reciben el 100% de sus ventas y envíos (0% comisión a la tienda).
 * 2. Los precios de catálogo y despachos son BRUTOS (IVA 19% incluido por cada tienda).
 * 3. Comisión TapTrade: 3% neto + IVA (19% de la comisión neta) por intermediación y protección al comprador.
 * 4. Costo de Pasarela de Pago: Tarifa de procesamiento bancario (Transbank Webpay Plus o Mercado Pago).
 *    Se calcula mediante gross-up sobre (Base + Comisión TapTrade) para que tiendas y TapTrade reciban
 *    el 100% íntegro de sus fondos sin mermas financieras.
 */

export type PaymentGatewayType = 'MERCADOPAGO' | 'WEBPAY' | 'DEFAULT';

export const VAT_RATE = 0.19;
export const TAPTRADE_COMMISSION_NET = 0.03; // 3% neto
export const TRANSBANK_CREDIT_RATE_NET = 0.0229; // 2.29% crédito peor caso
export const MERCADOPAGO_RATE_NET = 0.0319; // 3.19% crédito/débito MP

export interface DetailedFeeBreakdown {
  /** Monto base imponible (subtotal productos + despachos consolidados) */
  baseAmount: number;

  /** Comisión neta propia de TapTrade (3% de baseAmount) */
  taptradeFeeNet: number;
  /** IVA débito fiscal (19%) sobre la comisión de TapTrade */
  taptradeFeeVat: number;
  /** Comisión bruta total TapTrade (boleta de servicios) */
  taptradeFeeGross: number;

  /** Costo exacto de procesamiento financiero cobrado por la pasarela */
  gatewayFee: number;
  /** Tasa efectiva pasarela con IVA */
  gatewayGrossRate: number;
  /** Identificador de la pasarela */
  gatewayName: PaymentGatewayType;
  /** Nombre comercial amigable */
  gatewayLabel: string;
  /** Texto de tasa para badges */
  gatewayPercentageText: string;
  /** Descripción explicativa para el comprador */
  gatewayDescription: string;

  /** Suma total final a pagar en el terminal bancario */
  finalAmount: number;
}

export interface GatewayFeeConfig {
  rate: number;
  percentageText: string;
  label: string;
  description: string;
}

export const GATEWAY_CONFIGS: Record<PaymentGatewayType, { netRate: number; label: string; description: string }> = {
  WEBPAY: {
    netRate: TRANSBANK_CREDIT_RATE_NET,
    label: 'Webpay Plus',
    description: 'Tarifa bancaria Transbank de recaudación y procesamiento seguro (tarjetas de crédito y débito).',
  },
  MERCADOPAGO: {
    netRate: MERCADOPAGO_RATE_NET,
    label: 'Mercado Pago',
    description: 'Tarifa de procesamiento Mercado Pago (tarjetas de crédito y débito).',
  },
  DEFAULT: {
    netRate: TRANSBANK_CREDIT_RATE_NET,
    label: 'Pasarela Segura',
    description: 'Tarifa de recaudación y procesamiento bancario seguro.',
  },
};

/**
 * Calcula el desglose financiero detallado y transparente para el checkout.
 * Separa explícitamente:
 * 1. Comisión de servicio TapTrade (3% + IVA)
 * 2. Tarifa de la pasarela de pagos (Webpay / MP)
 */
export function calculateDetailedFees(
  baseAmount: number,
  gateway: PaymentGatewayType = 'WEBPAY'
): DetailedFeeBreakdown {
  if (!baseAmount || baseAmount <= 0) {
    return {
      baseAmount: 0,
      taptradeFeeNet: 0,
      taptradeFeeVat: 0,
      taptradeFeeGross: 0,
      gatewayFee: 0,
      gatewayGrossRate: 0,
      gatewayName: gateway,
      gatewayLabel: 'Pasarela de Pago',
      gatewayPercentageText: '0%',
      gatewayDescription: '',
      finalAmount: 0,
    };
  }

  // 1. Comisión TapTrade: 3% neto + IVA (19%)
  const taptradeFeeNet = Math.round(baseAmount * TAPTRADE_COMMISSION_NET);
  const taptradeFeeVat = Math.round(taptradeFeeNet * VAT_RATE);
  const taptradeFeeGross = taptradeFeeNet + taptradeFeeVat;

  // 2. Tarifa de procesamiento pasarela (Gross-up sobre Base + TapTrade Gross)
  const gwConfig = GATEWAY_CONFIGS[gateway] || GATEWAY_CONFIGS.DEFAULT;
  const gatewayGrossRate = gwConfig.netRate * (1 + VAT_RATE);

  const grossUpDenominator = Math.max(0.01, 1 - gatewayGrossRate);
  const finalAmount = Math.round((baseAmount + taptradeFeeGross) / grossUpDenominator);
  const gatewayFee = finalAmount - (baseAmount + taptradeFeeGross);

  const pctString = `${(gwConfig.netRate * 100).toFixed(2)}% + IVA`;

  return {
    baseAmount,
    taptradeFeeNet,
    taptradeFeeVat,
    taptradeFeeGross,
    gatewayFee,
    gatewayGrossRate,
    gatewayName: gateway,
    gatewayLabel: gwConfig.label,
    gatewayPercentageText: pctString,
    gatewayDescription: gwConfig.description,
    finalAmount,
  };
}

/**
 * Retorna la suma consolidada de todas las tarifas adicionales al comprador (TapTrade + Pasarela)
 */
export function calculatePaymentFee(
  baseAmount: number,
  gateway: PaymentGatewayType = 'WEBPAY'
): number {
  const detailed = calculateDetailedFees(baseAmount, gateway);
  return detailed.taptradeFeeGross + detailed.gatewayFee;
}

export function getGatewayConfig(gateway: PaymentGatewayType = 'WEBPAY'): GatewayFeeConfig {
  const isMP = gateway === 'MERCADOPAGO';
  const netRate = isMP ? MERCADOPAGO_RATE_NET : TRANSBANK_CREDIT_RATE_NET;
  const grossRate = netRate * (1 + VAT_RATE);
  return {
    rate: grossRate,
    percentageText: `${(netRate * 100).toFixed(2)}% + IVA`,
    label: isMP ? 'Mercado Pago' : 'Webpay Plus',
    description: isMP
      ? 'Tarifa de procesamiento Mercado Pago.'
      : 'Tarifa bancaria Transbank Webpay Plus.',
  };
}
