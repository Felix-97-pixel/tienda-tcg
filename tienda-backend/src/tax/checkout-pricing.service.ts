import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SellerTaxProfileService, SellerTaxProfile } from './seller-tax-profile.service';
import {
  DEFAULT_VAT_RATE,
  TaxBreakdown,
  breakdownFromGross,
} from './tax-calculator';

export interface VendorGroupInput {
  storeId: string;
  productsGross: number; // Suma de items en pesos chilenos enteros (IVA incluido)
  shippingGross: number; // Costo de despacho en pesos chilenos enteros (IVA incluido)
}

export interface VendorOrderQuote {
  storeId: string;
  storeName: string;
  productsGross: number;
  shippingGross: number;
  totalGross: number;
  tax: TaxBreakdown;
  sellerRut: string | null;
  sellerLegalName: string | null;
}

export interface CheckoutQuote {
  vendors: VendorOrderQuote[];
  productsTotal: number;
  shippingTotal: number;
  baseTotal: number; // productos + despacho
  serviceFee: TaxBreakdown; // Comisión TapTrade (3% neto + IVA)
  gatewayFee: number; // Costo estimado de pasarela retenido por Transbank / MP
  transbankFeeEstimate: number; // Alias para compatibilidad de BD
  gatewayRate: number; // Tasa efectiva pasarela con IVA
  gatewayName: string; // 'WEBPAY' | 'MERCADOPAGO'
  amountToCharge: number; // Total final enviado a la pasarela
  totalVatIncluded: number; // IVA total consolidado (tiendas + comisión TapTrade)
  vatRate: number;
}

@Injectable()
export class CheckoutPricingService {
  // Constantes de tasas oficiales configurables
  private readonly DEFAULT_TAPTRADE_COMMISSION_RATE = 0.03; // 3% neto
  private readonly DEFAULT_TRANSBANK_CREDIT_RATE = 0.0229; // 2.29% neto crédito (peor caso)

  constructor(
    private readonly prisma: PrismaService,
    private readonly sellerTaxProfile: SellerTaxProfileService,
  ) {}

  /**
   * Construye la cotización tributaria y financiera exacta para una orden multitienda.
   * Aplica las decisiones de negocio:
   * 1. Precios de catálogo son BRUTOS (IVA incluido).
   * 2. Despachos son BRUTOS (IVA incluido).
   * 3. Comisión TapTrade: 3% neto + IVA, pagada por el comprador.
   * 4. Gross-up según tasa peor caso Transbank (crédito 2.29% + IVA) para no mermar la utilidad.
   * 5. Snapshot fiscal completo por tienda y consolidado.
   */
  async buildQuote(
    groups: VendorGroupInput[],
    gateway: 'WEBPAY' | 'MERCADOPAGO' = 'WEBPAY',
  ): Promise<CheckoutQuote> {
    const vatRate = await this.getGlobalNumberSetting('tax.vatRate', DEFAULT_VAT_RATE);
    const taptradeRate = await this.getGlobalNumberSetting('platform.serviceFeeRate', this.DEFAULT_TAPTRADE_COMMISSION_RATE);
    const transbankCreditRate = await this.getGlobalNumberSetting('platform.transbankCreditRate', this.DEFAULT_TRANSBANK_CREDIT_RATE);
    const mercadopagoRate = await this.getGlobalNumberSetting('platform.mercadopagoRate', 0.0319);

    const storeIds = groups.map((g) => g.storeId);
    const profiles = await this.sellerTaxProfile.getForStores(storeIds);

    const vendors: VendorOrderQuote[] = [];

    for (const group of groups) {
      const profile = profiles.get(group.storeId) || {
        storeId: group.storeId,
        storeName: 'Tienda',
        sellerRut: null,
        sellerLegalName: null,
      };

      const productsGross = Math.round(group.productsGross);
      const shippingGross = Math.round(group.shippingGross);
      const totalGross = productsGross + shippingGross;

      // Desglose fiscal de la venta de la tienda (Ley 19.496 / DL 825)
      const tax = breakdownFromGross(totalGross, vatRate);

      vendors.push({
        storeId: group.storeId,
        storeName: profile.storeName,
        productsGross,
        shippingGross,
        totalGross,
        tax,
        sellerRut: profile.sellerRut,
        sellerLegalName: profile.sellerLegalName,
      });
    }

    const productsTotal = vendors.reduce((sum, v) => sum + v.productsGross, 0);
    const shippingTotal = vendors.reduce((sum, v) => sum + v.shippingGross, 0);
    const baseTotal = productsTotal + shippingTotal;

    // 1. Comisión propia de TapTrade: 3% neto + IVA (19%) sobre el total de venta
    const serviceFeeNet = Math.round(baseTotal * taptradeRate);
    const serviceFeeVat = Math.round(serviceFeeNet * vatRate);
    const serviceFeeGross = serviceFeeNet + serviceFeeVat;
    const serviceFee = {
      net: serviceFeeNet,
      vat: serviceFeeVat,
      gross: serviceFeeGross,
      rate: vatRate,
    };

    // 2. Costo de Pasarela de Pago: Gross-up para que tiendas y TapTrade reciban el 100% íntegro
    const gatewayNetRate = gateway === 'MERCADOPAGO' ? mercadopagoRate : transbankCreditRate;
    const gatewayGrossRate = gatewayNetRate * (1 + vatRate);
    const grossUpDenominator = Math.max(0.01, 1 - gatewayGrossRate);

    // Monto final exacto a recaudar en la pasarela
    const amountToCharge = Math.round((baseTotal + serviceFeeGross) / grossUpDenominator);

    // Costo de procesamiento retenido por la pasarela
    const gatewayFee = amountToCharge - (baseTotal + serviceFeeGross);
    const transbankFeeEstimate = gatewayFee;

    // Consolidación de IVA total incluido en la compra para información al consumidor (tiendas + comisión TapTrade)
    const totalVatIncluded = vendors.reduce((sum, v) => sum + v.tax.vat, 0) + serviceFee.vat;

    // Verificación de invariante contable:
    const expectedTotal = productsTotal + shippingTotal + serviceFee.gross + gatewayFee;
    if (expectedTotal !== amountToCharge) {
      throw new InternalServerErrorException(
        `Descuadre contable en CheckoutPricingService: esperado=${expectedTotal}, calculado=${amountToCharge}`,
      );
    }

    return {
      vendors,
      productsTotal,
      shippingTotal,
      baseTotal,
      serviceFee,
      gatewayFee,
      transbankFeeEstimate,
      gatewayRate: gatewayGrossRate,
      gatewayName: gateway,
      amountToCharge,
      totalVatIncluded,
      vatRate,
    };
  }

  private async getGlobalNumberSetting(key: string, defaultValue: number): Promise<number> {
    try {
      const setting = await this.prisma.globalSetting.findUnique({
        where: { key },
      });
      if (setting && setting.value) {
        const val = parseFloat(setting.value);
        if (!isNaN(val)) return val;
      }
    } catch {
      // Ignorar fallback
    }
    return defaultValue;
  }
}

