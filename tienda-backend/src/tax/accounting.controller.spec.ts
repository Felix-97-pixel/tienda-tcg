import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AccountingController } from './accounting.controller';
import { AccountingService } from './accounting.service';

describe('AccountingController', () => {
  let controller: AccountingController;
  let service: AccountingService;

  const mockAccountingService = {
    getAccountingSummary: jest.fn().mockResolvedValue({
      kpis: {
        totalOrdersCount: 1,
        totalCollected: 14192,
        thirdPartyFunds: 13690,
        platform: {
          serviceFeeGross: 502,
          serviceFeeNet: 422,
          vatDebit: 80,
          transbankFeeEstimate: 387,
          transbankVatCreditEstimate: 62,
          netPlatformMargin: 97,
        },
        saas: {
          activeCompaniesCount: 1,
          totalUf: 5.0,
          ufValueClp: 38500,
          netRevenue: 192500,
          vatDebit: 36575,
          grossRevenue: 229075,
        },
        f29: {
          marketplaceNet: 422,
          marketplaceVatDebit: 80,
          saasNet: 192500,
          saasVatDebit: 36575,
          totalNetSales: 192922,
          totalVatDebit: 36655,
          transbankVatCredit: 62,
          netVatToPay: 36593,
          ppmRate: 0.0025,
          ppmAmount: 482,
          totalF29ToPay: 37075,
        },
        escrow: {
          held: 13690,
          available: 0,
          withdrawn: 0,
        },
      },
      pagination: {
        page: 1,
        limit: 20,
        totalPages: 1,
        totalItems: 1,
      },
      orders: [],
    }),
    generateAccountingCsv: jest.fn().mockResolvedValue('\uFEFFFecha;Hora;Nro Orden\r\n2026-11-03;10:00;"ORD-1"'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountingController],
      providers: [
        {
          provide: AccountingService,
          useValue: mockAccountingService,
        },
      ],
    }).compile();

    controller = module.get<AccountingController>(AccountingController);
    service = module.get<AccountingService>(AccountingService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return accounting summary', async () => {
    const res = await controller.getSummary({ page: 1, limit: 20 });
    expect(res).toBeDefined();
    expect(res.kpis.totalCollected).toBe(14192);
    expect(res.kpis.saas.netRevenue).toBe(192500);
    expect(res.kpis.f29.totalF29ToPay).toBe(37075);
    expect(mockAccountingService.getAccountingSummary).toHaveBeenCalledWith({ page: 1, limit: 20 });
  });

  it('should export csv', async () => {
    const res = {
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    } as any;

    await controller.exportCsv({}, res);
    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'text/csv; charset=utf-8');
    expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.send).toHaveBeenCalled();
  });
});
