import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SellerTaxProfileService } from './seller-tax-profile.service';
import {
  DEFAULT_VAT_RATE,
  TaxBreakdown,
  breakdownFromGross,
  breakdownFromNet,
  exemptBreakdown,
} from './tax-calculator';

export interface VendorGroupInput {
  storeId: string;
  productsGross: number; // Suma de items en pesos chilenos enteros (IVA incluido)
  shippingGross: number; // Costo de despacho en pesos chilenos enteros (IVA incluido)
  categoryCommissionRate?: number | null; // Comisión especial por categoría de producto (opcional)
}

export interface VendorOrderQuote {
  storeId: string;
  storeName: string;
  productsGross: number;
  shippingGross: number;
  totalGross: number;
  tax: TaxBreakdown; // Desglose fiscal de la venta de la tienda (Neto + IVA = Bruto)
  commissionRateApplied: number; // Porcentaje de comisión al vendedor (ej: 0.10 = 10%)
  commissionCalcBase: 'NET' | 'GROSS'; // Base sobre la que se calculó la comisión
  sellerCommission: TaxBreakdown; // Comisión descontada a la tienda (Neto + IVA 19% = Bruto)
  sellerNetPayout: number; // Saldo líquido para la tienda (totalGross - sellerCommission.gross)
  sellerRut: string | null;
  sellerLegalName: string | null;
}

export interface CheckoutQuote {
  vendors: VendorOrderQuote[];
  productsTotal: number;
  shippingTotal: number;
  baseTotal: number; // productos + despacho (100% venta por cuenta de terceros antes de comisión vendedor)
  serviceFee: TaxBreakdown; // Cargo por servicio al comprador (ej: 3% neto + IVA)
  sellerCommissionTotal: TaxBreakdown; // Suma consolidada de comisiones descontadas a las tiendas
  totalSellerNetPayout: number; // Suma consolidada de saldos líquidos a transferir a las tiendas
  gatewayFee: number; // Costo estimado de pasarela retenido por Transbank / MP
  transbankFeeEstimate: number; // Alias para compatibilidad de BD
  gatewayRate: number; // Tasa efectiva pasarela con IVA
  gatewayName: string; // 'WEBPAY' | 'MERCADOPAGO'
  amountToCharge: number; // Total final enviado a la pasarela
  totalVatIncluded: number; // IVA total consolidado (tiendas + comisión comprador TapTrade)
  vatRate: number;
}

@Injectable()
export class CheckoutPricingService {
  // Constantes de tasas oficiales configurables
  private readonly DEFAULT_TAPTRADE_BUYER_FEE_RATE = 0.03; // 3% neto cargo servicio al comprador
  private readonly DEFAULT_SELLER_COMMISSION_RATE = 0; // 0% por defecto (o configurable por Plan / Tienda / Categoría / Plataforma)
  private readonly DEFAULT_TRANSBANK_CREDIT_RATE = 0.0229; // 2.29% neto crédito (peor caso)

  constructor(
    private readonly prisma: PrismaService,
    private readonly sellerTaxProfile: SellerTaxProfileService,
  ) {}

  /**
   * Construye la cotización tributaria y financiera exacta para una orden multitienda.
   * Reglas del modelo de intermediación comercial (Mandato Mercantil SII):
   * 1. Precios de catálogo y despachos son BRUTOS (IVA incluido por cada tienda según su régimen).
   * 2. El dinero recaudado por cuenta de las tiendas se separa estrictamente de los ingresos propios de TapTrade.
   * 3. Comisión al Vendedor: se resuelve por jerarquía (Excepción Tienda -> Categoría -> Plan SaaS -> Tasa General Plataforma)
   *    y puede calcularse sobre el monto NETO o BRUTO de la venta de la tienda, agregando el IVA débito (19%) de la comisión.
   * 4. Cargo por Servicio al Comprador: 3% neto + IVA (parametrizable) más gross-up de pasarela.
   * 5. Snapshot fiscal y financiero completo e inmutable por tienda y consolidado.
   */
  async buildQuote(
    groups: VendorGroupInput[],
    gateway: 'WEBPAY' | 'MERCADOPAGO' = 'WEBPAY',
  ): Promise<CheckoutQuote> {
    const vatRate = await this.getGlobalNumberSetting('tax.vatRate', DEFAULT_VAT_RATE);
    const taptradeBuyerRate = await this.getGlobalNumberSetting(
      'platform.serviceFeeRate',
      this.DEFAULT_TAPTRADE_BUYER_FEE_RATE,
    );
    const defaultSellerCommissionRate = await this.getGlobalNumberSetting(
      'platform.sellerCommissionRate',
      this.DEFAULT_SELLER_COMMISSION_RATE,
    );
    const transbankCreditRate = await this.getGlobalNumberSetting(
      'platform.transbankCreditRate',
      this.DEFAULT_TRANSBANK_CREDIT_RATE,
    );
    const mercadopagoRate = await this.getGlobalNumberSetting(
      'platform.mercadopagoRate',
      0.0319,
    );

    const storeIds = groups.map((g) => g.storeId);
    const profiles = await this.sellerTaxProfile.getForStores(storeIds);

    const vendors: VendorOrderQuote[] = [];

    for (const group of groups) {
      const profile = profiles.get(group.storeId) || {
        storeId: group.storeId,
        storeName: 'Tienda',
        companyId: null,
        sellerRut: null,
        sellerLegalName: null,
        fantasyName: null,
        taxActivity: null,
        taxAddress: null,
        taxCommune: null,
        taxRegion: null,
        dteEmail: null,
        taxClassification: 'PRIMERA_CATEGORIA_AFECTO',
        siiActivityStarted: true,
        verificationStatus: 'ENABLED',
        customCommissionRate: null,
        planCommissionRate: null,
        commissionCalcBase: 'NET' as const,
        bankProfile: {
          bankName: null,
          bankAccountType: null,
          bankAccountNumber: null,
          bankHolderRut: null,
          bankHolderName: null,
          bankEmail: null,
        },
      };

      // Verificar habilitación comercial y tributaria del vendedor si el servicio provee el validador
      if (typeof this.sellerTaxProfile.assertSellerEnabledForSale === 'function') {
        this.sellerTaxProfile.assertSellerEnabledForSale(profile as any);
      }

      const productsGross = Math.round(group.productsGross);
      const shippingGross = Math.round(group.shippingGross);
      const totalGross = productsGross + shippingGross;

      // Desglose fiscal de la venta de la tienda según su condición tributaria ante el SII
      const isExemptSeller = profile.taxClassification === 'PRIMERA_CATEGORIA_EXENTO';
      const tax = isExemptSeller
        ? exemptBreakdown(totalGross)
        : breakdownFromGross(totalGross, vatRate);

      // Resolver tasa de comisión al vendedor según jerarquía comercial:
      // 1. Excepción comercial de la empresa/tienda -> 2. Categoría -> 3. Plan SaaS -> 4. Plataforma general
      let commissionRateApplied = defaultSellerCommissionRate;
      if (profile.customCommissionRate !== undefined && profile.customCommissionRate !== null) {
        commissionRateApplied = Number(profile.customCommissionRate);
      } else if (group.categoryCommissionRate !== undefined && group.categoryCommissionRate !== null) {
        commissionRateApplied = Number(group.categoryCommissionRate);
      } else if (profile.planCommissionRate !== undefined && profile.planCommissionRate !== null) {
        commissionRateApplied = Number(profile.planCommissionRate);
      }

      const commissionCalcBase: 'NET' | 'GROSS' =
        profile.commissionCalcBase === 'GROSS' ? 'GROSS' : 'NET';

      // Base de cálculo de la comisión de TapTrade al vendedor (Neto o Bruto de la operación)
      const baseForCommission = commissionCalcBase === 'GROSS' ? totalGross : tax.net;
      const sellerCommNet = Math.round(baseForCommission * commissionRateApplied);
      const sellerCommission = breakdownFromNet(sellerCommNet, vatRate);

      // Saldo líquido que corresponde a la tienda tras descontar la comisión (neto + IVA)
      const sellerNetPayout = Math.max(0, totalGross - sellerCommission.gross);

      vendors.push({
        storeId: group.storeId,
        storeName: profile.storeName,
        productsGross,
        shippingGross,
        totalGross,
        tax,
        commissionRateApplied,
        commissionCalcBase,
        sellerCommission,
        sellerNetPayout,
        sellerRut: profile.sellerRut,
        sellerLegalName: profile.sellerLegalName,
      });
    }

    const productsTotal = vendors.reduce((sum, v) => sum + v.productsGross, 0);
    const shippingTotal = vendors.reduce((sum, v) => sum + v.shippingGross, 0);
    const baseTotal = productsTotal + shippingTotal;

    //Consolidado de comisiones descontadas a los vendedores
    const sellerCommNetTotal = vendors.reduce((sum, v) => sum + v.sellerCommission.net, 0);
    const sellerCommVatTotal = vendors.reduce((sum, v) => sum + v.sellerCommission.vat, 0);
    const sellerCommGrossTotal = vendors.reduce((sum, v) => sum + v.sellerCommission.gross, 0);
    const sellerCommissionTotal: TaxBreakdown = {
      net: sellerCommNetTotal,
      vat: sellerCommVatTotal,
      gross: sellerCommGrossTotal,
      rate: vatRate,
    };
    const totalSellerNetPayout = vendors.reduce((sum, v) => sum + v.sellerNetPayout, 0);

    // 1. Cargo por servicio de TapTrade al comprador: 3% neto + IVA (19%) sobre el total de venta
    const serviceFeeNet = Math.round(baseTotal * taptradeBuyerRate);
    const serviceFeeVat = Math.round(serviceFeeNet * vatRate);
    const serviceFeeGross = serviceFeeNet + serviceFeeVat;
    const serviceFee: TaxBreakdown = {
      net: serviceFeeNet,
      vat: serviceFeeVat,
      gross: serviceFeeGross,
      rate: vatRate,
    };

    // 2. Costo de Pasarela de Pago: Gross-up para que tiendas y TapTrade reciban sus montos íntegros
    const gatewayNetRate = gateway === 'MERCADOPAGO' ? mercadopagoRate : transbankCreditRate;
    const gatewayGrossRate = gatewayNetRate * (1 + vatRate);
    const grossUpDenominator = Math.max(0.01, 1 - gatewayGrossRate);

    // Monto final exacto a recaudar en la pasarela
    const amountToCharge = Math.round((baseTotal + serviceFeeGross) / grossUpDenominator);

    // Costo de procesamiento retenido por la pasarela
    const gatewayFee = amountToCharge - (baseTotal + serviceFeeGross);
    const transbankFeeEstimate = gatewayFee;

    // Consolidación de IVA total incluido en la compra para información al consumidor (tiendas + cargo comprador TapTrade)
    const totalVatIncluded = vendors.reduce((sum, v) => sum + v.tax.vat, 0) + serviceFee.vat;

    // Verificación de invariantes contables:
    const expectedTotal = productsTotal + shippingTotal + serviceFee.gross + gatewayFee;
    if (expectedTotal !== amountToCharge) {
      throw new InternalServerErrorException(
        `Descuadre contable en CheckoutPricingService: esperado=${expectedTotal}, calculado=${amountToCharge}`,
      );
    }

    if (totalSellerNetPayout + sellerCommissionTotal.gross !== baseTotal) {
      throw new InternalServerErrorException(
        `Descuadre contable en distribución de vendedores: payout=${totalSellerNetPayout} + comisión=${sellerCommissionTotal.gross} !== baseTotal=${baseTotal}`,
      );
    }

    return {
      vendors,
      productsTotal,
      shippingTotal,
      baseTotal,
      serviceFee,
      sellerCommissionTotal,
      totalSellerNetPayout,
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
