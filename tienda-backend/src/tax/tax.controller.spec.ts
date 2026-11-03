import { TaxController } from './tax.controller';

describe('TaxController', () => {
  let controller: TaxController;
  let mockCheckoutPricing: any;

  beforeEach(() => {
    mockCheckoutPricing = {
      buildQuote: jest.fn().mockResolvedValue({
        productsTotal: 10000,
        shippingTotal: 3690,
        baseTotal: 13690,
        serviceFee: { net: 422, vat: 80, gross: 502, rate: 0.19 },
        transbankFeeEstimate: 387,
        amountToCharge: 14192,
        totalVatIncluded: 2266,
        vatRate: 0.19,
        vendors: [],
      }),
    };

    controller = new TaxController(mockCheckoutPricing);
  });

  it('debe devolver la cotización estructurada al recibir los grupos por tienda', async () => {
    const quote = await controller.getQuote({
      vendorGroups: [
        {
          storeId: 'store-1',
          productsGross: 10000,
          shippingGross: 3690,
        },
      ],
    });

    expect(quote.amountToCharge).toBe(14192);
    expect(quote.serviceFee.gross).toBe(502);
    expect(mockCheckoutPricing.buildQuote).toHaveBeenCalledWith([
      {
        storeId: 'store-1',
        productsGross: 10000,
        shippingGross: 3690,
      },
    ]);
  });
});

