/**
 * Utilidades para cálculo de tarifas de procesamiento de pasarelas de pago en Chile.
 * 
 * En el modelo SaaS 0% comisión de TapTrade, la comisión de recaudación de las pasarelas
 * se traspasa de forma transparente al comprador final para que las tiendas reciban el 100%
 * neto de sus ventas y envíos, y la plataforma no asuma costos de procesamiento ajenos.
 */

export type PaymentGatewayType = 'MERCADOPAGO' | 'WEBPAY' | 'DEFAULT';

export interface GatewayFeeConfig {
  /** Tasa porcentual decimal (ej: 0.0379 representa 3.79%) */
  rate: number;
  /** Texto legible del porcentaje */
  percentageText: string;
  /** Nombre comercial amigable */
  label: string;
  /** Descripción para el comprador */
  description: string;
}

export const GATEWAY_FEES: Record<PaymentGatewayType, GatewayFeeConfig> = {
  // Mercado Pago Chile: 3.19% + IVA (19%) = 3.7961% ≈ 3.79%
  MERCADOPAGO: {
    rate: 0.0379,
    percentageText: '3.79%',
    label: 'Tarifa de procesamiento Mercado Pago',
    description: 'Tarjetas de crédito, débito Redcompra y dinero en cuenta.',
  },
  // Transbank Webpay Plus: promedio ponderado débito/crédito ~2.9%
  WEBPAY: {
    rate: 0.029,
    percentageText: '2.90%',
    label: 'Tarifa de procesamiento Webpay Plus',
    description: 'Tarjetas de débito Redcompra y crédito bancario.',
  },
  DEFAULT: {
    rate: 0.0379,
    percentageText: '3.79%',
    label: 'Tarifa de procesamiento de pago',
    description: 'Costo por procesamiento electrónico seguro.',
  },
};

/**
 * Calcula el monto en pesos chilenos correspondiente a la tarifa de la pasarela.
 * @param baseAmount Monto base (Subtotal productos + Envíos cotizados)
 * @param gateway Pasarela seleccionada ('MERCADOPAGO' | 'WEBPAY' | 'DEFAULT')
 * @returns Monto redondeado en CLP de la tarifa
 */
export function calculatePaymentFee(
  baseAmount: number,
  gateway: PaymentGatewayType = 'MERCADOPAGO'
): number {
  if (!baseAmount || baseAmount <= 0) return 0;
  const config = GATEWAY_FEES[gateway] || GATEWAY_FEES.DEFAULT;
  return Math.round(baseAmount * config.rate);
}

/**
 * Obtiene la configuración de una pasarela específica.
 */
export function getGatewayConfig(gateway: PaymentGatewayType = 'MERCADOPAGO'): GatewayFeeConfig {
  return GATEWAY_FEES[gateway] || GATEWAY_FEES.DEFAULT;
}
