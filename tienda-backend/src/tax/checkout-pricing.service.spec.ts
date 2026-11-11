import { BadRequestException } from '@nestjs/common';
import { CheckoutPricingService } from './checkout-pricing.service';

describe('CheckoutPricingService (Comisiones Híbridas, Pasarela y Normativa SII)', () => {
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
              taxClassification: 'PRIMERA_CATEGORIA_AFECTO',
              siiActivityStarted: true,
              verificationStatus: 'ENABLED',
              customCommissionRate: null,
              planCommissionRate: 0,
              commissionCalcBase: 'NET',
            },
          ],
        ]),
      ),
      assertSellerEnabledForSale: jest.fn((profile: any) => {
        if (profile.verificationStatus !== 'ENABLED' || !profile.siiActivityStarted) {
          throw new BadRequestException('Tienda no habilitada');
        }
      }),
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

    // Tienda con plan 0% comisión (store-1 tiene planCommissionRate: 0):
    expect(quote.vendors[0].sellerCommission.net).toBe(0);
    expect(quote.vendors[0].sellerCommission.vat).toBe(0);
    expect(quote.vendors[0].sellerCommission.gross).toBe(0);
    expect(quote.vendors[0].sellerNetPayout).toBe(13690);

    // Al comprador final se le cobra 0% de comisión de servicio y 0 pasarela:
    expect(quote.serviceFee.net).toBe(0);
    expect(quote.serviceFee.vat).toBe(0);
    expect(quote.serviceFee.gross).toBe(0);
    expect(quote.gatewayFee).toBe(0);
    expect(quote.amountToCharge).toBe(13690);
    expect(quote.totalVatIncluded).toBe(2186);
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
    // El comprador solo paga productos + envío (sin recargos):
    expect(quote.serviceFee.net).toBe(0);
    expect(quote.serviceFee.vat).toBe(0);
    expect(quote.serviceFee.gross).toBe(0);
    expect(quote.gatewayFee).toBe(0);
    expect(quote.amountToCharge).toBe(3960);
  });

  it('debe calcular exactamente el ejemplo ilustrativo del prompt ($100.000 neto + $19.000 IVA = $119.000 bruto, 10% comisión sobre neto -> $11.900 comisión y $107.100 saldo tienda)', async () => {
    mockSellerTaxProfile.getForStores.mockResolvedValue(
      new Map([
        [
          'store-10pct',
          {
            storeId: 'store-10pct',
            storeName: 'Tienda Especializada',
            sellerRut: '77.111.222-3',
            sellerLegalName: 'Comercial TCG SpA',
            taxClassification: 'PRIMERA_CATEGORIA_AFECTO',
            siiActivityStarted: true,
            verificationStatus: 'ENABLED',
            customCommissionRate: 0.1, // 10% del neto
            planCommissionRate: 0,
            commissionCalcBase: 'NET',
          },
        ],
      ]),
    );

    const quote = await service.buildQuote([
      {
        storeId: 'store-10pct',
        productsGross: 119000,
        shippingGross: 0,
      },
    ]);

    const v = quote.vendors[0];
    expect(v.tax.net).toBe(100000);
    expect(v.tax.vat).toBe(19000);
    expect(v.tax.gross).toBe(119000);
    expect(v.commissionRateApplied).toBe(0.1);
    expect(v.commissionCalcBase).toBe('NET');
    expect(v.sellerCommission.net).toBe(10000);
    expect(v.sellerCommission.vat).toBe(1900);
    expect(v.sellerCommission.gross).toBe(11900);
    expect(v.sellerNetPayout).toBe(107100);
    expect(quote.totalSellerNetPayout).toBe(107100);
    expect(quote.sellerCommissionTotal.gross).toBe(11900);
  });

  it('debe rechazar ventas si la tienda se encuentra en estado PENDING_VERIFICATION o SUSPENDED', async () => {
    mockSellerTaxProfile.getForStores.mockResolvedValue(
      new Map([
        [
          'store-unverified',
          {
            storeId: 'store-unverified',
            storeName: 'Tienda Sin Verificar',
            sellerRut: null,
            sellerLegalName: null,
            taxClassification: 'PRIMERA_CATEGORIA_AFECTO',
            siiActivityStarted: false,
            verificationStatus: 'PENDING_VERIFICATION',
            customCommissionRate: null,
            planCommissionRate: 0,
            commissionCalcBase: 'NET',
          },
        ],
      ]),
    );

    await expect(
      service.buildQuote([
        {
          storeId: 'store-unverified',
          productsGross: 10000,
          shippingGross: 0,
        },
      ]),
    ).rejects.toThrow(BadRequestException);
  });
});
