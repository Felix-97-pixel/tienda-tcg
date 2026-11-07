import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionType } from '@prisma/client';

export interface ReconstructedStoreBalances {
  escrowBalance: number;
  availableBalance: number;
  settledBalance: number;
  totalCommissionRetained: number;
}

@Injectable()
export class FinancialLedgerService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Reconstruye de forma determinista los saldos en custodia (Escrow), disponible (Available)
   * y liquidado (Settled) de una tienda a partir de los asientos inmutables del Ledger.
   * Compatible al 100% con asientos históricos previos y asientos append-only v2.
   */
  async reconstructStoreBalances(
    storeId: string,
    txClient?: any,
  ): Promise<ReconstructedStoreBalances> {
    const db = txClient || this.prisma;

    const allTxs = await db.walletTransaction.findMany({
      where: { storeId },
      select: {
        id: true,
        type: true,
        direction: true,
        bucket: true,
        amount: true,
        isWithdrawable: true,
      },
    });

    let heldSales = 0;
    let releasedFromEscrow = 0;
    let escrowRefunds = 0;

    let legacyDirectAvailableSales = 0;
    let availableCredits = 0; // WITHDRAWAL_REVERSAL, ADJUSTMENT (+)
    let availableDebits = 0; // WITHDRAWAL, REFUND en AVAILABLE, CHARGEBACK, ADJUSTMENT (-)
    let totalCommissionRetained = 0;

    for (const t of allTxs) {
      const rawAmount = Number(t.amount || 0);
      const absAmount = Math.abs(rawAmount);

      if (t.type === TransactionType.SALE) {
        if (!t.isWithdrawable) {
          heldSales += absAmount;
        } else {
          // Asiento legacy donde isWithdrawable fue puesto en true directamente
          legacyDirectAvailableSales += absAmount;
        }
      } else if (t.type === TransactionType.ESCROW_RELEASE) {
        releasedFromEscrow += absAmount;
      } else if (t.type === TransactionType.COMMISSION) {
        totalCommissionRetained += absAmount;
      } else if (t.type === TransactionType.WITHDRAWAL) {
        availableDebits += absAmount;
      } else if (t.type === TransactionType.WITHDRAWAL_REVERSAL) {
        availableCredits += absAmount;
      } else if (
        t.type === TransactionType.REFUND ||
        t.type === TransactionType.CHARGEBACK
      ) {
        if (t.bucket === 'ESCROW') {
          escrowRefunds += absAmount;
        } else {
          availableDebits += absAmount;
        }
      } else if (t.type === TransactionType.ADJUSTMENT) {
        if (t.bucket === 'ESCROW') {
          if (rawAmount >= 0) heldSales += absAmount;
          else escrowRefunds += absAmount;
        } else {
          if (rawAmount >= 0) availableCredits += absAmount;
          else availableDebits += absAmount;
        }
      }
    }

    const completedWithdrawals = await db.withdrawalRequest.aggregate({
      where: { storeId, status: 'COMPLETED' },
      _sum: { amount: true },
    });

    const escrowBalance = Math.max(
      0,
      Math.round(heldSales - releasedFromEscrow - escrowRefunds),
    );
    const availableBalance = Math.round(
      legacyDirectAvailableSales +
        releasedFromEscrow +
        availableCredits -
        availableDebits,
    );
    const settledBalance = Math.round(
      Number(completedWithdrawals._sum?.amount || 0),
    );

    return {
      escrowBalance,
      availableBalance: Math.max(0, availableBalance),
      settledBalance,
      totalCommissionRetained: Math.round(totalCommissionRetained),
    };
  }

  /**
   * Registra de manera inmutable e idempotente la recaudación de una sub-orden en Custodia (Escrow)
   * y el asiento de comisión de plataforma al vendedor (si aplica) cuando el pago es autorizado.
   */
  async recordVendorSaleInEscrow(
    params: {
      storeId: string;
      orderId: string;
      vendorOrderId: string;
      grossSaleAmount: number;
      taxableNet: number;
      vatAmount: number;
      sellerCommissionNet: number;
      sellerCommissionVat: number;
      sellerCommissionGross: number;
      sellerNetPayout: number;
      paymentMethod: string;
      createdByUserId?: string | null;
    },
    txClient?: any,
  ) {
    const db = txClient || this.prisma;
    const saleIdempotencyKey = `SALE_ESCROW:${params.vendorOrderId}`;

    // Control de idempotencia: verificar si ya existe el asiento para esta sub-orden
    const existingSaleTx = await db.walletTransaction.findFirst({
      where: { idempotencyKey: saleIdempotencyKey },
    });
    if (existingSaleTx) {
      return existingSaleTx;
    }

    const currentBalances = await this.reconstructStoreBalances(params.storeId, db);
    const netPayout =
      params.sellerNetPayout > 0
        ? Math.round(params.sellerNetPayout)
        : Math.max(0, Math.round(params.grossSaleAmount - params.sellerCommissionGross));

    const newEscrowBalance = currentBalances.escrowBalance + netPayout;

    // 1. Si existe comisión descontada al vendedor, registrar asiento inmutable de comisión
    if (params.sellerCommissionGross > 0) {
      const commKey = `SELLER_COMM:${params.vendorOrderId}`;
      const existingComm = await db.walletTransaction.findFirst({
        where: { idempotencyKey: commKey },
      });
      if (!existingComm) {
        await db.walletTransaction.create({
          data: {
            storeId: params.storeId,
            orderId: params.orderId,
            vendorOrderId: params.vendorOrderId,
            amount: -Math.round(params.sellerCommissionGross),
            netAmount: Math.round(params.sellerCommissionNet),
            vatAmount: Math.round(params.sellerCommissionVat),
            type: TransactionType.COMMISSION,
            direction: 'DEBIT',
            bucket: 'PLATFORM_REVENUE',
            status: 'POSTED',
            balanceAfterEscrow: currentBalances.escrowBalance,
            balanceAfterAvailable: currentBalances.availableBalance,
            paymentMethod: params.paymentMethod,
            isWithdrawable: false,
            reference: `Comisión TapTrade retenida por Sub-Orden #${params.vendorOrderId.slice(0, 8)} (Bruto venta: $${Math.round(params.grossSaleAmount).toLocaleString('es-CL')})`,
            idempotencyKey: commKey,
            createdByUserId: params.createdByUserId || 'SYSTEM_PAYMENT_COMMIT',
            metadata: {
              ledgerVersion: 2,
              grossSaleAmount: Math.round(params.grossSaleAmount),
              sellerCommissionNet: Math.round(params.sellerCommissionNet),
              sellerCommissionVat: Math.round(params.sellerCommissionVat),
              sellerCommissionGross: Math.round(params.sellerCommissionGross),
            },
          },
        });
      }
    }

    // 2. Registrar asiento inmutable de recaudación en Custodia (Escrow) por el saldo líquido de la tienda
    const saleTx = await db.walletTransaction.create({
      data: {
        storeId: params.storeId,
        orderId: params.orderId,
        vendorOrderId: params.vendorOrderId,
        amount: netPayout,
        netAmount: Math.round(params.taxableNet),
        vatAmount: Math.round(params.vatAmount),
        type: TransactionType.SALE,
        direction: 'CREDIT',
        bucket: 'ESCROW',
        status: 'POSTED',
        balanceAfterEscrow: newEscrowBalance,
        balanceAfterAvailable: currentBalances.availableBalance,
        paymentMethod: params.paymentMethod,
        isWithdrawable: false,
        reference: `Order: ${params.vendorOrderId} (Custodia - Pendiente de Despacho)`,
        idempotencyKey: saleIdempotencyKey,
        createdByUserId: params.createdByUserId || 'SYSTEM_PAYMENT_COMMIT',
        metadata: {
          ledgerVersion: 2,
          grossSaleAmount: Math.round(params.grossSaleAmount),
          sellerCommissionGross: Math.round(params.sellerCommissionGross),
          sellerNetPayout: netPayout,
        },
      },
    });

    await db.vendorOrder.update({
      where: { id: params.vendorOrderId },
      data: {
        settlementStatus: 'HELD_ESCROW',
        sellerNetPayout: netPayout,
      },
    });

    return saleTx;
  }

  /**
   * Libera los fondos de una sub-orden desde Custodia (ESCROW) hacia Saldo Disponible (AVAILABLE)
   * mediante un NUEVO asiento inmutable (ESCROW_RELEASE) sin sobrescribir el asiento SALE original.
   */
  async releaseVendorOrderFromEscrow(
    params: {
      storeId: string;
      orderId?: string | null;
      vendorOrderId: string;
      releaseReference: string;
      createdByUserId?: string | null;
      fallbackAmount?: number;
      paymentMethod?: string;
    },
    txClient?: any,
  ) {
    const db = txClient || this.prisma;
    const releaseKey = `ESCROW_RELEASE:${params.vendorOrderId}`;

    // Idempotencia: si ya fue liberada, devolver el asiento existente sin duplicar
    const existingRelease = await db.walletTransaction.findFirst({
      where: { idempotencyKey: releaseKey },
    });
    if (existingRelease) {
      const balances = await this.reconstructStoreBalances(params.storeId, db);
      return {
        releaseTx: existingRelease,
        releasedAmount: Number(existingRelease.amount),
        newAvailableBalance: balances.availableBalance,
        newEscrowBalance: balances.escrowBalance,
      };
    }

    // Verificar que no exista una disputa arbitral abierta (OrderDispute) que congele el escrow
    const activeDispute = await db.orderDispute.findFirst({
      where: {
        vendorOrderId: params.vendorOrderId,
        status: { in: ['OPEN', 'UNDER_REVIEW'] },
      },
    });
    if (activeDispute) {
      throw new ConflictException(
        'No es posible liberar los fondos en custodia mientras exista una disputa arbitral activa sobre esta sub-orden.',
      );
    }

    // Buscar el asiento original de venta en custodia (sin modificarlo)
    let originalSaleTx = await db.walletTransaction.findFirst({
      where: {
        storeId: params.storeId,
        type: TransactionType.SALE,
        OR: [
          { vendorOrderId: params.vendorOrderId },
          { reference: { contains: params.vendorOrderId } },
        ],
      },
      orderBy: { createdAt: 'asc' },
    });

    // Si por alguna razón histórica no existía el asiento SALE en custodia, lo creamos primero
    if (!originalSaleTx && params.fallbackAmount && params.fallbackAmount > 0) {
      originalSaleTx = await this.recordVendorSaleInEscrow(
        {
          storeId: params.storeId,
          orderId: params.orderId || '',
          vendorOrderId: params.vendorOrderId,
          grossSaleAmount: params.fallbackAmount,
          taxableNet: Math.round(params.fallbackAmount / 1.19),
          vatAmount:
            params.fallbackAmount - Math.round(params.fallbackAmount / 1.19),
          sellerCommissionNet: 0,
          sellerCommissionVat: 0,
          sellerCommissionGross: 0,
          sellerNetPayout: params.fallbackAmount,
          paymentMethod: params.paymentMethod || 'WEBPAY',
          createdByUserId: params.createdByUserId,
        },
        db,
      );
    }

    const amountToRelease = originalSaleTx
      ? Math.round(Number(originalSaleTx.amount))
      : Math.round(params.fallbackAmount || 0);

    const currentBalances = await this.reconstructStoreBalances(params.storeId, db);
    const newEscrowBalance = Math.max(0, currentBalances.escrowBalance - amountToRelease);
    const newAvailableBalance = currentBalances.availableBalance + amountToRelease;

    // Insertar asiento inmutable ESCROW_RELEASE (crédito en AVAILABLE, referenciando el asiento original)
    const releaseTx = await db.walletTransaction.create({
      data: {
        storeId: params.storeId,
        orderId: params.orderId || originalSaleTx?.orderId || null,
        vendorOrderId: params.vendorOrderId,
        parentTransactionId: originalSaleTx?.id || null,
        amount: amountToRelease,
        netAmount: originalSaleTx?.netAmount ?? null,
        vatAmount: originalSaleTx?.vatAmount ?? null,
        type: TransactionType.ESCROW_RELEASE,
        direction: 'CREDIT',
        bucket: 'AVAILABLE',
        status: 'POSTED',
        balanceAfterEscrow: newEscrowBalance,
        balanceAfterAvailable: newAvailableBalance,
        paymentMethod: originalSaleTx?.paymentMethod || params.paymentMethod || 'WEBPAY',
        isWithdrawable: true,
        reference: params.releaseReference,
        idempotencyKey: releaseKey,
        createdByUserId: params.createdByUserId || 'STORE_DISPATCH',
        metadata: {
          ledgerVersion: 2,
          releasedFromSaleTxId: originalSaleTx?.id || null,
          vendorOrderId: params.vendorOrderId,
        },
      },
    });

    // Actualizar estado de liquidación de la sub-orden a AVAILABLE
    await db.vendorOrder.update({
      where: { id: params.vendorOrderId },
      data: {
        settlementStatus: 'AVAILABLE',
      },
    });

    // Sincronizar caché de balance en Store y Company con el saldo reconstruido del Ledger
    await this.syncStoreBalanceCache(params.storeId, newAvailableBalance, db);

    return {
      releaseTx,
      releasedAmount: amountToRelease,
      newAvailableBalance,
      newEscrowBalance,
    };
  }

  /**
   * Registra un Reembolso (REFUND) o Contracargo (CHARGEBACK) de forma inmutable (compensatoria)
   * sobre una sub-orden, afectando el bolsillo correspondiente (ESCROW o AVAILABLE).
   */
  async recordOrderRefundOrChargeback(
    params: {
      vendorOrderId: string;
      kind: 'REFUND' | 'CHARGEBACK';
      reason: string;
      createdByUserId: string;
    },
    txClient?: any,
  ) {
    const db = txClient || this.prisma;
    const vendorOrder = await db.vendorOrder.findUnique({
      where: { id: params.vendorOrderId },
    });
    if (!vendorOrder) {
      throw new NotFoundException('Sub-orden no encontrada para reversa financiera');
    }

    if (vendorOrder.settlementStatus === 'LOCKED_IN_SETTLEMENT') {
      throw new BadRequestException(
        'Esta sub-orden está bloqueada dentro de una liquidación en curso. Rechace primero la liquidación antes de aplicar el reembolso.',
      );
    }

    const idempotencyKey = `${params.kind}:${params.vendorOrderId}`;
    const existing = await db.walletTransaction.findFirst({
      where: { idempotencyKey },
    });
    if (existing) return existing;

    const payoutAmount =
      Number(vendorOrder.sellerNetPayout) > 0
        ? Math.round(Number(vendorOrder.sellerNetPayout))
        : Math.round(Number(vendorOrder.subtotal) + Number(vendorOrder.shippingCost));

    const wasReleased =
      vendorOrder.settlementStatus === 'AVAILABLE' ||
      vendorOrder.settlementStatus === 'SETTLED';
    const targetBucket = wasReleased ? 'AVAILABLE' : 'ESCROW';

    const currentBalances = await this.reconstructStoreBalances(vendorOrder.storeId, db);
    const newEscrowBalance =
      targetBucket === 'ESCROW'
        ? Math.max(0, currentBalances.escrowBalance - payoutAmount)
        : currentBalances.escrowBalance;
    const newAvailableBalance =
      targetBucket === 'AVAILABLE'
        ? Math.max(0, currentBalances.availableBalance - payoutAmount)
        : currentBalances.availableBalance;

    const reversalTx = await db.walletTransaction.create({
      data: {
        storeId: vendorOrder.storeId,
        orderId: vendorOrder.orderId,
        vendorOrderId: vendorOrder.id,
        amount: -payoutAmount,
        netAmount: Math.round(Number(vendorOrder.taxableNet || 0)),
        vatAmount: Math.round(Number(vendorOrder.vatAmount || 0)),
        type:
          params.kind === 'CHARGEBACK'
            ? TransactionType.CHARGEBACK
            : TransactionType.REFUND,
        direction: 'DEBIT',
        bucket: targetBucket,
        status: 'POSTED',
        balanceAfterEscrow: newEscrowBalance,
        balanceAfterAvailable: newAvailableBalance,
        paymentMethod: 'REVERSAL',
        isWithdrawable: false,
        reference: `${params.kind === 'CHARGEBACK' ? 'Contracargo Bancario' : 'Reembolso / Anulación'} Sub-Orden #${vendorOrder.id.slice(0, 8)}: ${params.reason}`,
        idempotencyKey,
        createdByUserId: params.createdByUserId,
        metadata: {
          ledgerVersion: 2,
          reason: params.reason,
          previousSettlementStatus: vendorOrder.settlementStatus,
        },
      },
    });

    await db.vendorOrder.update({
      where: { id: vendorOrder.id },
      data: {
        status: 'REFUNDED',
        settlementStatus: 'REFUNDED',
      },
    });

    await this.syncStoreBalanceCache(vendorOrder.storeId, newAvailableBalance, db);
    return reversalTx;
  }

  /**
   * Registra un ajuste manual autorizado por Superadministrador en el Ledger inmutable.
   */
  async recordManualAdjustment(
    params: {
      storeId: string;
      amount: number; // Positivo (abono) o Negativo (cargo)
      reason: string;
      createdByUserId: string;
      bucket?: 'AVAILABLE' | 'ESCROW';
    },
    txClient?: any,
  ) {
    const db = txClient || this.prisma;
    const roundedAmount = Math.round(params.amount);
    if (roundedAmount === 0) {
      throw new BadRequestException('El monto del ajuste manual no puede ser 0.');
    }

    const bucket = params.bucket || 'AVAILABLE';
    const currentBalances = await this.reconstructStoreBalances(params.storeId, db);

    const newEscrowBalance =
      bucket === 'ESCROW'
        ? Math.max(0, currentBalances.escrowBalance + roundedAmount)
        : currentBalances.escrowBalance;
    const newAvailableBalance =
      bucket === 'AVAILABLE'
        ? Math.max(0, currentBalances.availableBalance + roundedAmount)
        : currentBalances.availableBalance;

    const adjTx = await db.walletTransaction.create({
      data: {
        storeId: params.storeId,
        amount: roundedAmount,
        type: TransactionType.ADJUSTMENT,
        direction: roundedAmount >= 0 ? 'CREDIT' : 'DEBIT',
        bucket,
        status: 'POSTED',
        balanceAfterEscrow: newEscrowBalance,
        balanceAfterAvailable: newAvailableBalance,
        paymentMethod: 'MANUAL_ADJUSTMENT',
        isWithdrawable: bucket === 'AVAILABLE',
        reference: `Ajuste Manual Autorizado: ${params.reason}`,
        createdByUserId: params.createdByUserId,
        metadata: {
          ledgerVersion: 2,
          reason: params.reason,
          authorizedBy: params.createdByUserId,
        },
      },
    });

    await this.syncStoreBalanceCache(params.storeId, newAvailableBalance, db);
    return adjTx;
  }

  /**
   * Sincroniza la columna Store.balance y Company.balance con el saldo disponible reconstruido del Ledger.
   */
  async syncStoreBalanceCache(
    storeId: string,
    availableBalance: number,
    txClient?: any,
  ) {
    const db = txClient || this.prisma;
    const store = await db.store.update({
      where: { id: storeId },
      data: { balance: Math.max(0, Math.round(availableBalance)) },
      select: { companyId: true },
    });

    if (store?.companyId) {
      const companyStores = await db.store.findMany({
        where: { companyId: store.companyId },
        select: { balance: true },
      });
      const totalCompanyBalance = companyStores.reduce(
        (sum: number, s: any) => sum + Number(s.balance || 0),
        0,
      );
      await db.company.update({
        where: { id: store.companyId },
        data: { balance: Math.max(0, Math.round(totalCompanyBalance)) },
      });
    }
  }
}

