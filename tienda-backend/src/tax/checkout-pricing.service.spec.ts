import { CheckoutPricingService } from './checkout-pricing.service';
import { SellerTaxProfileService } from './seller-tax-profile.service';

describe('CheckoutPricingService (Comisiones y Normativa SII)', () => {
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

  it('debe calcular la cotización correcta para una compra de $10.000 + $3.690 despacho', async () => {
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

    // Tarifa gross-up:
    // Base = 13690
    // taptradeGrossRate = 0.03 * 1.19 = 0.0357
    // transbankGrossRate = 0.0229 * 1.19 = 0.027251
    // feeGross = round(13690 * 0.0357 / (1 - 0.027251)) = round(488.733 / 0.972749) = 502
    expect(quote.serviceFee.gross).toBe(502);
    // feeNet = round(502 / 1.19) = 422
    expect(quote.serviceFee.net).toBe(422);
    expect(quote.serviceFee.vat).toBe(80);

    // Total a cobrar = 13690 + 502 = 14192
    expect(quote.amountToCharge).toBe(14192);

    // IVA total consolidado informativo = 2186 + 80 = 2266
    expect(quote.totalVatIncluded).toBe(2266);
  });
});

