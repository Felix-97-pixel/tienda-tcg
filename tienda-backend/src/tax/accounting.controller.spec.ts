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
    expect(res.kpis.platform.serviceFeeGross).toBe(502);
    expect(service.getAccountingSummary).toHaveBeenCalled();
  });

  it('should stream csv with proper headers on export', async () => {
    const mockRes: any = {
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    await controller.exportCsv({}, mockRes);
    expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'text/csv; charset=utf-8');
    expect(mockRes.send).toHaveBeenCalled();
  });
});

