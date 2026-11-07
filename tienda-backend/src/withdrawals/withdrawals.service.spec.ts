import { BadRequestException } from '@nestjs/common';
import { WithdrawalsService } from './withdrawals.service';
import { FinancialLedgerService } from '../tax/financial-ledger.service';
import { validateChileanRut, formatChileanRut } from '../tax/seller-tax-profile.service';

describe('WithdrawalsService & FinancialLedgerService (Liquidaciones, Ledger Inmutable y SII)', () => {
  let withdrawalsService: WithdrawalsService;
  let ledgerService: FinancialLedgerService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      store: {
        findFirst: jest.fn(),
        findMany: jest.fn().mockResolvedValue([{ balance: 107100 }]),
        update: jest.fn().mockResolvedValue({ id: 'store-1', companyId: 'comp-1' }),
      },
      company: {
        update: jest.fn().mockResolvedValue({ id: 'comp-1' }),
      },
      vendorOrder: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
      walletTransaction: {
        findMany: jest.fn().mockResolvedValue([]),
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'tx-new', ...data })),
      },
      withdrawalRequest: {
        aggregate: jest.fn().mockResolvedValue({ _sum: { amount: 0 } }),
        count: jest.fn().mockResolvedValue(0),
        create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'liq-1', ...data })),
        findUnique: jest.fn(),
        update: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'liq-1', ...data })),
        findMany: jest.fn().mockResolvedValue([]),
      },
      orderDispute: {
        findFirst: jest.fn().mockResolvedValue(null),
      },
      $transaction: jest.fn((cb) => cb(mockPrisma)),
    };

    ledgerService = new FinancialLedgerService(mockPrisma);
    withdrawalsService = new WithdrawalsService(mockPrisma, ledgerService);
  });

  describe('Validador Módulo 11 RUT Chileno (SII)', () => {
    it('debe validar correctamente RUTs chilenos reales y rechazar inválidos', () => {
      expect(validateChileanRut('78.531.106-K')).toBe(true);
      expect(validateChileanRut('76.123.456-0')).toBe(true);
      expect(validateChileanRut('76.123.456-9')).toBe(false);
      expect(formatChileanRut('78531106k')).toBe('78.531.106-K');
    });
  });

  describe('Libro Mayor Inmutable (FinancialLedgerService)', () => {
    it('debe reconstruir saldos de Custodia (Escrow) y Disponible (Available) sin mutar el asiento SALE original', async () => {
      // Escenario: Venta en custodia por $107.100 y posterior liberación de $107.100
      mockPrisma.walletTransaction.findMany.mockResolvedValue([
        {
          id: 'tx-sale-1',
          type: 'SALE',
          direction: 'CREDIT',
          bucket: 'ESCROW',
          amount: 107100,
          isWithdrawable: false,
        },
        {
          id: 'tx-rel-1',
          type: 'ESCROW_RELEASE',
          direction: 'CREDIT',
          bucket: 'AVAILABLE',
          amount: 107100,
          isWithdrawable: true,
        },
      ]);

      const balances = await ledgerService.reconstructStoreBalances('store-1');
      expect(balances.escrowBalance).toBe(0);
      expect(balances.availableBalance).toBe(107100);
    });

    it('debe garantizar idempotencia al liberar una sub-orden de custodia', async () => {
      mockPrisma.walletTransaction.findFirst.mockResolvedValueOnce({
        id: 'tx-rel-existing',
        amount: 50000,
      });

      const res = await ledgerService.releaseVendorOrderFromEscrow({
        storeId: 'store-1',
        vendorOrderId: 'vo-1',
        releaseReference: 'Despacho Starken #123',
      });

      expect(res.releaseTx.id).toBe('tx-rel-existing');
      expect(mockPrisma.walletTransaction.create).not.toHaveBeenCalled();
    });
  });

  describe('Liquidaciones por Lotes (Settlements) y Reversas', () => {
    it('debe bloquear las sub-órdenes seleccionadas en LOCKED_IN_SETTLEMENT y descontar la comisión vendedor', async () => {
      mockPrisma.store.findFirst.mockResolvedValue({
        id: 'store-1',
        name: 'Blood Moon Games',
        balance: 107100,
        company: {
          id: 'comp-1',
          name: 'Blood Moon SpA',
          rut: '78.531.106-K',
          legalName: 'Blood Moon SpA',
          siiActivityStarted: true,
          verificationStatus: 'ENABLED',
          bankName: 'Banco de Chile',
          bankAccountType: 'CUENTA_CORRIENTE',
          bankAccountNumber: '00-123-45678-9',
          bankHolderRut: '78.531.106-K',
          bankHolderName: 'Blood Moon SpA',
        },
      });

      mockPrisma.walletTransaction.findMany.mockResolvedValue([
        {
          id: 'tx-sale-1',
          type: 'SALE',
          direction: 'CREDIT',
          bucket: 'ESCROW',
          amount: 107100,
          isWithdrawable: false,
        },
        {
          id: 'tx-rel-1',
          type: 'ESCROW_RELEASE',
          direction: 'CREDIT',
          bucket: 'AVAILABLE',
          amount: 107100,
          isWithdrawable: true,
        },
      ]);

      mockPrisma.vendorOrder.findMany.mockResolvedValue([
        {
          id: 'vo-100',
          subtotal: 119000,
          shippingCost: 0,
          sellerCommissionNet: 10000,
          sellerCommissionVat: 1900,
          sellerCommissionGross: 11900,
          sellerNetPayout: 107100,
          settlementStatus: 'AVAILABLE',
        },
      ]);

      const settlement = await withdrawalsService.requestWithdrawal('user-1', {
        vendorOrderIds: ['vo-100'],
        storeDteType: 33,
        storeDteFolio: '4501',
        storeDteUrl: 'https://example.com/dte-4501.pdf',
      });

      expect(settlement.grossSalesAmount).toBe(119000);
      expect(settlement.sellerCommissionNet).toBe(10000);
      expect(settlement.sellerCommissionVat).toBe(1900);
      expect(settlement.sellerCommissionGross).toBe(11900);
      expect(settlement.amount).toBe(107100);
      expect(settlement.storeDteFolio).toBe('4501');

      expect(mockPrisma.vendorOrder.updateMany).toHaveBeenCalledWith({
        where: { id: { in: ['vo-100'] } },
        data: {
          settlementStatus: 'LOCKED_IN_SETTLEMENT',
          withdrawalRequestId: 'liq-1',
        },
      });
    });

    it('debe insertar un asiento compensatorio WITHDRAWAL_REVERSAL y desbloquear las órdenes al rechazar una liquidación', async () => {
      mockPrisma.withdrawalRequest.findUnique.mockResolvedValue({
        id: 'liq-1',
        settlementCode: 'LIQ-202611-0001',
        storeId: 'store-1',
        amount: 107100,
        status: 'PENDING',
      });

      await withdrawalsService.rejectWithdrawal('liq-1', 'admin-1', {
        reason: 'Cuenta bancaria con error de dígito',
        isFailedTransfer: true,
      });

      expect(mockPrisma.vendorOrder.updateMany).toHaveBeenCalledWith({
        where: { withdrawalRequestId: 'liq-1' },
        data: {
          settlementStatus: 'AVAILABLE',
          withdrawalRequestId: null,
        },
      });

      expect(mockPrisma.walletTransaction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            type: 'WITHDRAWAL_REVERSAL',
            direction: 'CREDIT',
            bucket: 'AVAILABLE',
            amount: 107100,
          }),
        }),
      );
    });

    it('debe bloquear retiros si la empresa está en estado SUSPENDED o sin Inicio de Actividades SII', async () => {
      mockPrisma.store.findFirst.mockResolvedValue({
        id: 'store-1',
        name: 'Tienda Suspendida',
        balance: 50000,
        company: {
          id: 'comp-1',
          verificationStatus: 'SUSPENDED',
          siiActivityStarted: true,
        },
      });

      await expect(
        withdrawalsService.requestWithdrawal('user-1', { amount: 10000, bankDetails: 'Banco' }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
