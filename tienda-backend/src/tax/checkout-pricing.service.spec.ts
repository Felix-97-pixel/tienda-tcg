import { CheckoutPricingService } from './checkout-pricing.service';
import { SellerTaxProfileService } from './seller-tax-profile.service';

describe('CheckoutPricingService (Comisiones, Pasarela y Normativa SII)', () => {
  let service: CheckoutPricingService;
  let mockPrisma: any;
  let mockSellerTaxProfile: any;

  beforeEach(() => {
    mockPrisma = {
      globalSetting: {
        findUnique: jest.fn().mockResolvedValue(null), // usa valores por defecto
      },
    };

    mockSellerTaxProfile = {
      getForStores: jest.fn().mockResolvedValue(
        new Map([
          [
            'store-1',
            {
              storeId: 'store-1',
              storeName: 'Blood Moon Games',
              sellerRut: '76.123.456-7',
              sellerLegalName: 'Blood Moon SpA',
            },
          ],
        ]),
      ),
    };

    service = new CheckoutPricingService(mockPrisma, mockSellerTaxProfile);
  });

  it('debe calcular la cotización correcta y desglosada para $10.000 + $3.690 despacho', async () => {
    const quote = await service.buildQuote([
      {
        storeId: 'store-1',
        productsGross: 10000,
        shippingGross: 3690,
      },
    ]);

    expect(quote.productsTotal).toBe(10000);
    expect(quote.shippingTotal).toBe(3690);
    expect(quote.baseTotal).toBe(13690);

    // Vendor tax: 13690 bruto -> net = round(13690 / 1.19) = 11504, vat = 13690 - 11504 = 2186
    expect(quote.vendors[0].tax.net).toBe(11504);
    expect(quote.vendors[0].tax.vat).toBe(2186);
    expect(quote.vendors[0].tax.gross).toBe(13690);
    expect(quote.vendors[0].sellerRut).toBe('76.123.456-7');

    // Comisión TapTrade (3% neto + IVA):
    // Net: round(13690 * 0.03) = 411
    // VAT: round(411 * 0.19) = 78
    // Gross: 411 + 78 = 489
    expect(quote.serviceFee.net).toBe(411);
    expect(quote.serviceFee.vat).toBe(78);
    expect(quote.serviceFee.gross).toBe(489);

    // Tarifa pasarela (Webpay 2.29% + IVA = 2.7251%):
    // amountToCharge = round((13690 + 489) / (1 - 0.027251)) = round(14179 / 0.972749) = 14576
    // gatewayFee = 14576 - 14179 = 397
    expect(quote.gatewayFee).toBe(397);
    expect(quote.transbankFeeEstimate).toBe(397);
    expect(quote.amountToCharge).toBe(14576);

    // Verificación exacta de cuadratura:
    expect(quote.baseTotal + quote.serviceFee.gross + quote.gatewayFee).toBe(quote.amountToCharge);

    // IVA total consolidado informativo = 2186 + 78 = 2264
    expect(quote.totalVatIncluded).toBe(2264);
  });

  it('debe cuadrar exactamente el carrito del usuario ($270 productos + $3.690 Starken despacho)', async () => {
    const quote = await service.buildQuote([
      {
        storeId: 'store-1',
        productsGross: 270,
        shippingGross: 3690,
      },
    ]);

    expect(quote.productsTotal).toBe(270);
    expect(quote.shippingTotal).toBe(3690);
    expect(quote.baseTotal).toBe(3960);

    // Comisión TapTrade (3% neto + IVA):
    // Net: round(3960 * 0.03) = 119
    // VAT: round(119 * 0.19) = 23
    // Gross: 119 + 23 = 142
    expect(quote.serviceFee.net).toBe(119);
    expect(quote.serviceFee.vat).toBe(23);
    expect(quote.serviceFee.gross).toBe(142);

    // Tarifa pasarela (Webpay 2.29% + IVA = 2.7251%):
    // amountToCharge = round((3960 + 142) / (1 - 0.027251)) = round(4102 / 0.972749) = 4217
    // gatewayFee = 4217 - 4102 = 115
    expect(quote.gatewayFee).toBe(115);
    expect(quote.transbankFeeEstimate).toBe(115);
    expect(quote.amountToCharge).toBe(4217);

    // Verificación de fondo íntegro para tienda:
    // Tienda recibe 100% de productos y envío = 3960
    // TapTrade recibe su boleta de honorarios/servicios = 142 (119 ganancia + 23 IVA al fisco)
    // Transbank se descuenta = 115
    // Total cobrado al comprador = 4217
    expect(quote.baseTotal + quote.serviceFee.gross + quote.gatewayFee).toBe(4217);
  });
});
