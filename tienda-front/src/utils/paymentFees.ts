/**
 * Utilidades para cálculo de tarifas de procesamiento de pasarelas de pago y protección en Chile.
 * 
 * En el modelo SaaS de TapTrade, las tiendas reciben el 100% neto de sus ventas y envíos (0% comisión a la tienda).
 * Para financiar los costos transaccionales de las pasarelas (Transbank Webpay Plus / Mercado Pago)
 * y la garantía de protección al comprador (custodia de fondos, mediación por estado de cartas y checkout multi-tienda),
 * se aplica una tarifa fija del 5.00% sobre el total de la orden (productos + envíos).
 */

export type PaymentGatewayType = 'MERCADOPAGO' | 'WEBPAY' | 'DEFAULT';

export interface GatewayFeeConfig {
  /** Tasa porcentual decimal (0.05 representa 5.00%) */
  rate: number;
  /** Texto legible del porcentaje */
  percentageText: string;
  /** Nombre comercial amigable */
  label: string;
  /** Descripción para el comprador */
  description: string;
}

export const GATEWAY_FEES: Record<PaymentGatewayType, GatewayFeeConfig> = {
  // Tarifa fija unificada 5.00% para Webpay Plus (cubre Transbank débito 1.49%+IVA / crédito 2.29%+IVA + margen TapTrade)
  WEBPAY: {
    rate: 0.05,
    percentageText: '5.00%',
    label: 'Servicio y Protección al Comprador',
    description: 'Garantía de estado TCG, custodia de fondos y procesamiento seguro Webpay Plus.',
  },
  // Tarifa fija unificada 5.00% para Mercado Pago (cubre 3.19%+IVA + margen TapTrade)
  MERCADOPAGO: {
    rate: 0.05,
    percentageText: '5.00%',
    label: 'Servicio y Protección al Comprador',
    description: 'Garantía de estado TCG, custodia de fondos y procesamiento seguro Mercado Pago.',
  },
  DEFAULT: {
    rate: 0.05,
    percentageText: '5.00%',
    label: 'Servicio y Protección al Comprador',
    description: 'Garantía de estado TCG, custodia de fondos y procesamiento electrónico seguro.',
  },
};

/**
 * Calcula el monto en pesos chilenos correspondiente a la tarifa del comprador (5.00%).
 * @param baseAmount Monto base (Subtotal productos + Envíos cotizados)
 * @param gateway Pasarela seleccionada ('MERCADOPAGO' | 'WEBPAY' | 'DEFAULT')
 * @returns Monto redondeado en CLP de la tarifa
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
 * Obtiene la configuración de una pasarela específica.
 */
export function getGatewayConfig(gateway: PaymentGatewayType = 'WEBPAY'): GatewayFeeConfig {
  return GATEWAY_FEES[gateway] || GATEWAY_FEES.DEFAULT;
}
