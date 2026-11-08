import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionType } from '@prisma/client';
import { FinancialLedgerService } from '../tax/financial-ledger.service';
import { validateChileanRut } from '../tax/seller-tax-profile.service';

export interface RequestSettlementPayload {
  amount?: number;
  bankDetails?: string;
  vendorOrderIds?: string[];
  storeDteType?: number;
  storeDteFolio?: string;
  storeDteUrl?: string;
  notes?: string;
}

@Injectable()
export class WithdrawalsService {
  constructor(
    private prisma: PrismaService,
    private financialLedger: FinancialLedgerService,
  ) {}

  /**
   * Resuelve la tienda principal o activa asociada al usuario autenticado (Dueño, Admin de Empresa o Miembro).
   */
  private async resolveUserStoreWithCompany(userId: string) {
    const store = await this.prisma.store.findFirst({
      where: {
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } },
          { company: { ownerId: userId } },
          { company: { members: { some: { userId } } } },
        ],
      },
      include: {
        company: {
          include: {
            plan: true,
          },
        },
        subscriptionPlans: true,
      },
      orderBy: { isMainBranch: 'desc' },
    });

    if (!store) {
      throw new NotFoundException('Tienda no encontrada para este usuario');
    }
    return store;
  }

  /**
   * Genera una solicitud formal de Liquidación (Settlement) agrupando sub-órdenes disponibles
   * (o monto disponible en caso de saldos legacy), validando requisitos B2B2C y registrando
   * el asiento inmutable en el Ledger.
   */
  async requestWithdrawal(
    userId: string,
    amountOrPayload: number | RequestSettlementPayload,
    legacyBankDetails?: string,
  ) {
    const payload: RequestSettlementPayload =
      typeof amountOrPayload === 'number'
        ? { amount: amountOrPayload, bankDetails: legacyBankDetails }
        : amountOrPayload || {};

    const store = await this.resolveUserStoreWithCompany(userId);
    const company = store.company;

    // 1. Validar estado de habilitación comercial y tributaria B2B2C
    if (
      company &&
      (company.verificationStatus === 'SUSPENDED' ||
        company.verificationStatus === 'BLOCKED' ||
        company.verificationStatus === 'PENDING_VERIFICATION' ||
        company.verificationStatus === 'PENDING_DOCS')
    ) {
      throw new BadRequestException(
        `Tu empresa se encuentra en estado "${company.verificationStatus}". Debes completar la verificación tributaria y bancaria ante TapTrade antes de solicitar liquidaciones.`,
      );
    }

    if (company && !company.siiActivityStarted) {
      throw new BadRequestException(
        'Tu empresa debe contar con Inicio de Actividades vigente en 1ª Categoría ante el SII para solicitar liquidaciones.',
      );
    }

    // 2. Resolver datos bancarios estructurados (desde Company o desde el formulario)
    const structuredBankSnapshot = company?.bankName && company?.bankAccountNumber
      ? {
          bankName: company.bankName,
          bankAccountType: company.bankAccountType || 'CUENTA_CORRIENTE',
          bankAccountNumber: company.bankAccountNumber,
          bankHolderRut: company.bankHolderRut || company.rut || null,
          bankHolderName: company.bankHolderName || company.legalName || company.name,
          bankEmail: company.bankEmail || company.dteEmail || null,
        }
      : null;

    const formattedBankDetails =
      payload.bankDetails?.trim() ||
      (structuredBankSnapshot
        ? `${structuredBankSnapshot.bankName} - ${structuredBankSnapshot.bankAccountType} N° ${structuredBankSnapshot.bankAccountNumber} (RUT: ${structuredBankSnapshot.bankHolderRut || 'S/R'} - ${structuredBankSnapshot.bankHolderName})`
        : '');

    if (!formattedBankDetails) {
      throw new BadRequestException(
        'Debes configurar la cuenta bancaria corporativa de la tienda o indicar los datos bancarios para la transferencia.',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      // 3. Reconstruir saldo disponible real desde el Ledger inmutable
      const balances = await this.financialLedger.reconstructStoreBalances(
        store.id,
        tx,
      );

      // 4. Buscar sub-órdenes disponibles para liquidar (en estado AVAILABLE o despachadas sin liquidación previa)
      const candidateWhere: any = {
        storeId: store.id,
        status: 'PAID',
        withdrawalRequestId: null,
        OR: [
          { settlementStatus: 'AVAILABLE' },
          {
            settlementStatus: 'HELD_ESCROW',
            deliveryStatus: { in: ['DISPATCHED', 'DELIVERED'] },
          },
        ],
      };

      if (payload.vendorOrderIds && payload.vendorOrderIds.length > 0) {
        candidateWhere.id = { in: payload.vendorOrderIds };
      }

      const eligibleOrders = await tx.vendorOrder.findMany({
        where: candidateWhere,
        orderBy: { createdAt: 'asc' },
      });

      let grossSalesAmount = 0;
      let sellerCommissionNet = 0;
      let sellerCommissionVat = 0;
      let sellerCommissionGross = 0;
      let finalNetPayout = 0;
      const lockedOrderIds: string[] = [];

      if (eligibleOrders.length > 0 && (payload.vendorOrderIds?.length || !payload.amount)) {
        for (const vo of eligibleOrders) {
          const orderGross = Number(vo.subtotal) + Number(vo.shippingCost);
          const commNet = Number(vo.sellerCommissionNet || 0);
          const commVat = Number(vo.sellerCommissionVat || 0);
          const commGross = Number(vo.sellerCommissionGross || 0);
          const netPayout =
            Number(vo.sellerNetPayout) > 0
              ? Number(vo.sellerNetPayout)
              : Math.max(0, orderGross - commGross);

          grossSalesAmount += orderGross;
          sellerCommissionNet += commNet;
          sellerCommissionVat += commVat;
          sellerCommissionGross += commGross;
          finalNetPayout += netPayout;
          lockedOrderIds.push(vo.id);
        }
      } else {
        // Modo compatible con retiro por monto (cuando hay saldo histórico o ajuste manual)
        const requestedAmt = Math.round(Number(payload.amount || 0));
        if (requestedAmt <= 0) {
          throw new BadRequestException(
            'No hay sub-órdenes despachadas disponibles para liquidar ni un monto válido seleccionado.',
          );
        }
        grossSalesAmount = requestedAmt;
        finalNetPayout = requestedAmt;
      }

      finalNetPayout = Math.round(finalNetPayout);

      if (finalNetPayout <= 0) {
        throw new BadRequestException('El monto líquido a liquidar debe ser mayor a $0 CLP.');
      }

      const effectiveAvailable = Math.max(
        Number(store.balance || 0),
        balances.availableBalance,
      );

      if (finalNetPayout > effectiveAvailable) {
        throw new BadRequestException(
          `Fondos disponibles insuficientes para esta liquidación (Disponible: $${effectiveAvailable.toLocaleString('es-CL')} CLP, Solicitado: $${finalNetPayout.toLocaleString('es-CL')} CLP).`,
        );
      }

      // 5. Generar código correlativo único de liquidación (LIQ-YYYYMM-XXXX)
      const now = new Date();
      const ym = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
      const countThisMonth = await tx.withdrawalRequest.count();
      const settlementCode = `LIQ-${ym}-${String(countThisMonth + 1).padStart(4, '0')}`;

      // 6. Crear el registro de Liquidación Formal (WithdrawalRequest)
      const withdrawal = await tx.withdrawalRequest.create({
        data: {
          settlementCode,
          storeId: store.id,
          grossSalesAmount: Math.round(grossSalesAmount),
          sellerCommissionNet: Math.round(sellerCommissionNet),
          sellerCommissionVat: Math.round(sellerCommissionVat),
          sellerCommissionGross: Math.round(sellerCommissionGross),
          adjustmentsAmount: 0,
          amount: finalNetPayout,
          bankDetails: formattedBankDetails,
          bankSnapshot: structuredBankSnapshot ?? undefined,
          storeDteType: payload.storeDteType ? Number(payload.storeDteType) : null,
          storeDteFolio: payload.storeDteFolio?.trim() || null,
          storeDteUrl: payload.storeDteUrl?.trim() || null,
          notes: payload.notes?.trim() || null,
          status: 'PENDING',
        },
      });

      // 7. Bloquear las sub-órdenes incluidas para impedir doble liquidación
      if (lockedOrderIds.length > 0) {
        await tx.vendorOrder.updateMany({
          where: { id: { in: lockedOrderIds } },
          data: {
            settlementStatus: 'LOCKED_IN_SETTLEMENT',
            withdrawalRequestId: withdrawal.id,
          },
        });
      }

      const newAvailableBalance = Math.max(0, effectiveAvailable - finalNetPayout);

      // 8. Registrar asiento inmutable en el Ledger (DEBIT en AVAILABLE)
      await tx.walletTransaction.create({
        data: {
          storeId: store.id,
          withdrawalRequestId: withdrawal.id,
          amount: -finalNetPayout,
          netAmount: Math.round(grossSalesAmount - sellerCommissionNet),
          vatAmount: Math.round(sellerCommissionVat),
          type: TransactionType.WITHDRAWAL,
          direction: 'DEBIT',
          bucket: 'AVAILABLE',
          status: 'POSTED',
          balanceAfterEscrow: balances.escrowBalance,
          balanceAfterAvailable: newAvailableBalance,
          paymentMethod: 'BANK_TRANSFER',
          isWithdrawable: true,
          reference: `Liquidación ${settlementCode} (${lockedOrderIds.length > 0 ? `${lockedOrderIds.length} órdenes` : 'Retiro de fondos'})`,
          idempotencyKey: `SETTLEMENT_LOCK:${withdrawal.id}`,
          createdByUserId: userId,
          metadata: {
            ledgerVersion: 2,
            settlementCode,
            lockedOrderIds,
            grossSalesAmount: Math.round(grossSalesAmount),
            sellerCommissionGross: Math.round(sellerCommissionGross),
            netPayout: finalNetPayout,
          },
        },
      });

      // 9. Sincronizar caché de balance en Store y Company
      await this.financialLedger.syncStoreBalanceCache(
        store.id,
        newAvailableBalance,
        tx,
      );

      return withdrawal;
    });
  }

  /**
   * Permite a la tienda adjuntar su Documento Tributario (DTE) o Acta de Rendición de Mandato a una liquidación.
   */
  async attachStoreSettlementDte(
    userId: string,
    withdrawalId: string,
    data: {
      storeDteType?: number;
      storeDteFolio?: string;
      storeDteUrl?: string;
      notes?: string;
    },
  ) {
    const store = await this.resolveUserStoreWithCompany(userId);
    const withdrawal = await this.prisma.withdrawalRequest.findUnique({
      where: { id: withdrawalId },
    });

    if (!withdrawal || withdrawal.storeId !== store.id) {
      throw new NotFoundException('Liquidación no encontrada para esta tienda');
    }

    return this.prisma.withdrawalRequest.update({
      where: { id: withdrawalId },
      data: {
        ...(data.storeDteType !== undefined ? { storeDteType: Number(data.storeDteType) } : {}),
        ...(data.storeDteFolio !== undefined ? { storeDteFolio: data.storeDteFolio.trim() || null } : {}),
        ...(data.storeDteUrl !== undefined ? { storeDteUrl: data.storeDteUrl.trim() || null } : {}),
        ...(data.notes !== undefined ? { notes: data.notes.trim() || null } : {}),
      },
      include: {
        vendorOrders: true,
      },
    });
  }

  /**
   * Permite a la tienda registrar el folio y enlace de la Boleta/Factura emitida al comprador final en una sub-orden.
   */
  async updateVendorOrderBuyerDte(
    userId: string,
    vendorOrderId: string,
    data: {
      buyerDteType: number;
      buyerDteFolio: string;
      buyerDteUrl?: string;
    },
  ) {
    const store = await this.resolveUserStoreWithCompany(userId);
    const vendorOrder = await this.prisma.vendorOrder.findUnique({
      where: { id: vendorOrderId },
    });

    if (!vendorOrder || vendorOrder.storeId !== store.id) {
      throw new ForbiddenException('No tienes permisos sobre esta sub-orden');
    }

    return this.prisma.vendorOrder.update({
      where: { id: vendorOrderId },
      data: {
        buyerDteType: Number(data.buyerDteType || 39),
        buyerDteFolio: data.buyerDteFolio.trim(),
        buyerDteUrl: data.buyerDteUrl?.trim() || null,
      },
    });
  }

  /**
   * Obtiene el historial financiero completo de la tienda, saldos reconstruidos desde el Ledger,
   * sub-órdenes disponibles para liquidar y liquidaciones históricas.
   */
  async getStoreHistory(userId: string) {
    const store = await this.resolveUserStoreWithCompany(userId);

    const [balances, transactions, withdrawals, availableVendorOrders] =
      await Promise.all([
        this.financialLedger.reconstructStoreBalances(store.id),
        this.prisma.walletTransaction.findMany({
          where: { storeId: store.id },
          orderBy: { createdAt: 'desc' },
          take: 100,
        }),
        this.prisma.withdrawalRequest.findMany({
          where: { storeId: store.id },
          include: {
            vendorOrders: {
              select: {
                id: true,
                subtotal: true,
                shippingCost: true,
                sellerCommissionGross: true,
                sellerNetPayout: true,
                trackingNumber: true,
                shippingCourier: true,
                dispatchedAt: true,
                buyerDteType: true,
                buyerDteFolio: true,
                order: {
                  select: {
                    buyOrder: true,
                    createdAt: true,
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 50,
        }),
        this.prisma.vendorOrder.findMany({
          where: {
            storeId: store.id,
            status: 'PAID',
            withdrawalRequestId: null,
            OR: [
              { settlementStatus: 'AVAILABLE' },
              {
                settlementStatus: 'HELD_ESCROW',
                deliveryStatus: { in: ['DISPATCHED', 'DELIVERED'] },
              },
            ],
          },
          include: {
            order: {
              select: {
                buyOrder: true,
                createdAt: true,
                name: true,
                email: true,
                origin: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        }),
      ]);

    const company = store.company;
    const planRate =
      company?.plan?.commissionRate !== undefined && company?.plan?.commissionRate !== null
        ? Number(company.plan.commissionRate)
        : store.subscriptionPlans?.[0]?.commissionRate !== undefined
          ? Number(store.subscriptionPlans[0].commissionRate)
          : 0;

    const effectiveCommissionRate =
      company?.customCommissionRate !== undefined && company?.customCommissionRate !== null
        ? Number(company.customCommissionRate)
        : planRate;

    return {
      balance: balances.availableBalance,
      heldBalance: balances.escrowBalance,
      settledBalance: balances.settledBalance,
      totalCommissionRetained: balances.totalCommissionRetained,
      companyProfile: company
        ? {
            id: company.id,
            name: company.name,
            rut: company.rut,
            rutValid: validateChileanRut(company.rut),
            legalName: company.legalName,
            fantasyName: company.fantasyName,
            taxActivity: company.taxActivity,
            taxAddress: company.taxAddress,
            taxCommune: company.taxCommune,
            taxRegion: company.taxRegion,
            dteEmail: company.dteEmail,
            taxClassification: company.taxClassification,
            siiActivityStarted: company.siiActivityStarted,
            verificationStatus: company.verificationStatus,
            effectiveCommissionRate,
            commissionCalcBase: company.commissionCalcBase || 'NET',
            bankName: company.bankName,
            bankAccountType: company.bankAccountType,
            bankAccountNumber: company.bankAccountNumber,
            bankHolderRut: company.bankHolderRut,
            bankHolderName: company.bankHolderName,
            bankEmail: company.bankEmail,
            mandateAcceptedAt: company.mandateAcceptedAt,
          }
        : null,
      availableOrdersForSettlement: availableVendorOrders
        .filter((vo) => vo.order?.origin !== 'POS_IN_STORE')
        .map((vo) => {
          const gross = Number(vo.subtotal) + Number(vo.shippingCost);
          const commGross = Number(vo.sellerCommissionGross || 0);
          const netPayout =
            Number(vo.sellerNetPayout) > 0
              ? Number(vo.sellerNetPayout)
              : Math.max(0, gross - commGross);
          return {
            id: vo.id,
            buyOrder: vo.order?.buyOrder || vo.id.slice(0, 8),
            buyerName: vo.order?.name || 'Comprador',
            createdAt: vo.createdAt,
            dispatchedAt: vo.dispatchedAt,
            shippingCourier: vo.shippingCourier,
            trackingNumber: vo.trackingNumber,
            subtotal: Number(vo.subtotal),
            shippingCost: Number(vo.shippingCost),
            grossTotal: gross,
            taxableNet: Number(vo.taxableNet || 0),
            vatAmount: Number(vo.vatAmount || 0),
            commissionRateApplied: Number(vo.commissionRateApplied || 0),
            sellerCommissionNet: Number(vo.sellerCommissionNet || 0),
            sellerCommissionVat: Number(vo.sellerCommissionVat || 0),
            sellerCommissionGross: commGross,
            sellerNetPayout: netPayout,
            buyerDteType: vo.buyerDteType,
            buyerDteFolio: vo.buyerDteFolio,
            buyerDteUrl: vo.buyerDteUrl,
          };
        }),
      transactions,
      withdrawals,
    };
  }

  /**
   * Obtiene las liquidaciones para el panel de Superadministrador (filtrables por estado).
   */
  async getPendingWithdrawals(statusFilter?: string) {
    const where: any = {};
    if (statusFilter && statusFilter !== 'ALL') {
      where.status = statusFilter;
    } else if (!statusFilter) {
      where.status = { in: ['PENDING', 'APPROVED'] };
    }

    return this.prisma.withdrawalRequest.findMany({
      where,
      include: {
        store: {
          select: {
            id: true,
            name: true,
            subdomain: true,
            owner: { select: { email: true, name: true } },
            company: {
              select: {
                id: true,
                name: true,
                rut: true,
                legalName: true,
                taxActivity: true,
                taxClassification: true,
                siiActivityStarted: true,
                verificationStatus: true,
                bankName: true,
                bankAccountType: true,
                bankAccountNumber: true,
                bankHolderRut: true,
                bankHolderName: true,
                bankEmail: true,
              },
            },
          },
        },
        vendorOrders: {
          select: {
            id: true,
            subtotal: true,
            shippingCost: true,
            taxableNet: true,
            vatAmount: true,
            sellerCommissionNet: true,
            sellerCommissionVat: true,
            sellerCommissionGross: true,
            sellerNetPayout: true,
            trackingNumber: true,
            shippingCourier: true,
            dispatchedAt: true,
            buyerDteType: true,
            buyerDteFolio: true,
            order: {
              select: {
                buyOrder: true,
                createdAt: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Aprueba una liquidación verificada antes de su ejecución bancaria o adjunta la Factura de Comisión de TapTrade (DTE 33).
   */
  async approveWithdrawal(
    withdrawalId: string,
    adminUserId?: string,
    payload?: {
      platformDteType?: number;
      platformDteFolio?: string;
      platformDteUrl?: string;
      notes?: string;
    },
  ) {
    const withdrawal = await this.prisma.withdrawalRequest.findUnique({
      where: { id: withdrawalId },
    });
    if (!withdrawal) throw new NotFoundException('Solicitud de liquidación no encontrada');
    if (withdrawal.status !== 'PENDING' && withdrawal.status !== 'APPROVED') {
      throw new BadRequestException('Esta liquidación ya fue procesada o cerrada');
    }

    return this.prisma.withdrawalRequest.update({
      where: { id: withdrawalId },
      data: {
        status: 'APPROVED',
        processedByUserId: adminUserId || withdrawal.processedByUserId,
        ...(payload?.platformDteType !== undefined
          ? { platformDteType: Number(payload.platformDteType) }
          : {}),
        ...(payload?.platformDteFolio !== undefined
          ? { platformDteFolio: payload.platformDteFolio.trim() || null }
          : {}),
        ...(payload?.platformDteUrl !== undefined
          ? { platformDteUrl: payload.platformDteUrl.trim() || null }
          : {}),
        ...(payload?.notes !== undefined ? { notes: payload.notes.trim() || null } : {}),
      },
    });
  }

  /**
   * Marca una liquidación como COMPLETADA (Transferencia Bancaria ejecutada),
   * guarda el número de operación/comprobante y marca todas las sub-órdenes del lote como SETTLED.
   */
  async completeWithdrawal(
    withdrawalId: string,
    adminUserId?: string,
    payload?: {
      transferReference?: string;
      transferReceiptUrl?: string;
      platformDteType?: number;
      platformDteFolio?: string;
      platformDteUrl?: string;
      notes?: string;
    },
  ) {
    const withdrawal = await this.prisma.withdrawalRequest.findUnique({
      where: { id: withdrawalId },
    });

    if (!withdrawal) throw new NotFoundException('Solicitud de liquidación no encontrada');
    if (withdrawal.status === 'COMPLETED' || withdrawal.status === 'REJECTED') {
      throw new BadRequestException('Esta solicitud ya fue procesada definitivamente');
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.withdrawalRequest.update({
        where: { id: withdrawalId },
        data: {
          status: 'COMPLETED',
          processedByUserId: adminUserId || 'SUPERADMIN',
          processedAt: new Date(),
          ...(payload?.transferReference !== undefined
            ? { transferReference: payload.transferReference.trim() || null }
            : {}),
          ...(payload?.transferReceiptUrl !== undefined
            ? { transferReceiptUrl: payload.transferReceiptUrl.trim() || null }
            : {}),
          ...(payload?.platformDteType !== undefined
            ? { platformDteType: Number(payload.platformDteType) }
            : {}),
          ...(payload?.platformDteFolio !== undefined
            ? { platformDteFolio: payload.platformDteFolio.trim() || null }
            : {}),
          ...(payload?.platformDteUrl !== undefined
            ? { platformDteUrl: payload.platformDteUrl.trim() || null }
            : {}),
          ...(payload?.notes !== undefined
            ? { notes: payload.notes.trim() || null }
            : {}),
        },
      });

      // Marcar todas las sub-órdenes vinculadas a este lote como liquidadas definitivamente (SETTLED)
      await tx.vendorOrder.updateMany({
        where: { withdrawalRequestId: withdrawalId },
        data: { settlementStatus: 'SETTLED' },
      });

      return updated;
    });
  }

  /**
   * Rechaza una liquidación o registra transferencia bancaria fallida (FAILED),
   * insertando un asiento compensatorio inmutable (WITHDRAWAL_REVERSAL) en el Ledger
   * y liberando las sub-órdenes nuevamente a estado AVAILABLE.
   */
  async rejectWithdrawal(
    withdrawalId: string,
    adminUserId?: string,
    payload?: {
      reason?: string;
      isFailedTransfer?: boolean;
    },
  ) {
    const withdrawal = await this.prisma.withdrawalRequest.findUnique({
      where: { id: withdrawalId },
    });

    if (!withdrawal) throw new NotFoundException('Solicitud de liquidación no encontrada');
    if (withdrawal.status === 'COMPLETED' || withdrawal.status === 'REJECTED') {
      throw new BadRequestException('Esta solicitud ya fue procesada definitivamente');
    }

    const finalStatus = payload?.isFailedTransfer ? 'FAILED' : 'REJECTED';
    const reasonText =
      payload?.reason?.trim() ||
      (payload?.isFailedTransfer
        ? 'Transferencia bancaria rechazada por el banco receptor'
        : 'Rechazada por administración');

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.withdrawalRequest.update({
        where: { id: withdrawalId },
        data: {
          status: finalStatus,
          rejectionReason: reasonText,
          processedByUserId: adminUserId || 'SUPERADMIN',
          processedAt: new Date(),
        },
      });

      // Desbloquear las sub-órdenes para que vuelvan a estar disponibles (AVAILABLE)
      await tx.vendorOrder.updateMany({
        where: { withdrawalRequestId: withdrawalId },
        data: {
          settlementStatus: 'AVAILABLE',
          withdrawalRequestId: null,
        },
      });

      // Buscar asiento original de bloqueo de retiro (sin modificarlo ni eliminarlo)
      const originalLockTx = await tx.walletTransaction.findFirst({
        where: {
          storeId: withdrawal.storeId,
          OR: [
            { withdrawalRequestId: withdrawalId },
            { idempotencyKey: `SETTLEMENT_LOCK:${withdrawalId}` },
          ],
        },
      });

      const refundAmount = Math.round(Number(withdrawal.amount));
      const currentBalances = await this.financialLedger.reconstructStoreBalances(
        withdrawal.storeId,
        tx,
      );
      const newAvailableBalance = currentBalances.availableBalance + refundAmount;

      // Insertar asiento compensatorio inmutable WITHDRAWAL_REVERSAL
      await tx.walletTransaction.create({
        data: {
          storeId: withdrawal.storeId,
          withdrawalRequestId: withdrawal.id,
          parentTransactionId: originalLockTx?.id || null,
          amount: refundAmount,
          type: TransactionType.WITHDRAWAL_REVERSAL,
          direction: 'CREDIT',
          bucket: 'AVAILABLE',
          status: 'POSTED',
          balanceAfterEscrow: currentBalances.escrowBalance,
          balanceAfterAvailable: newAvailableBalance,
          paymentMethod: 'REVERSAL',
          isWithdrawable: true,
          reference: `Reversa de Liquidación ${withdrawal.settlementCode || withdrawal.id.slice(0, 8)} (${finalStatus}): ${reasonText}`,
          idempotencyKey: `SETTLEMENT_REV:${withdrawal.id}:${Date.now()}`,
          createdByUserId: adminUserId || 'SUPERADMIN',
          metadata: {
            ledgerVersion: 2,
            reversedWithdrawalId: withdrawal.id,
            reason: reasonText,
            status: finalStatus,
          },
        },
      });

      await this.financialLedger.syncStoreBalanceCache(
        withdrawal.storeId,
        newAvailableBalance,
        tx,
      );

      return updated;
    });
  }

  /**
   * Calcula el Resumen Tributario Mensual (Formulario 29 SII) para la Tienda o Empresa (Holding).
   * Separa estrictamente las ventas de la tienda (Boletas DTE 39/41 -> Débito Fiscal Cód. 538)
   * de las comisiones retenidas por TapTrade (Factura DTE 33 -> Crédito Fiscal Cód. 520).
   */
  async getStoreTaxSummary(
    userId: string,
    query: {
      period?: string;
      startDate?: string;
      endDate?: string;
      storeId?: string;
    },
  ) {
    const userStore = await this.prisma.store.findFirst({
      where: {
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } },
          { company: { ownerId: userId } },
          { company: { members: { some: { userId } } } },
        ],
      },
      include: {
        company: {
          include: {
            stores: {
              select: { id: true, name: true, subdomain: true, isMainBranch: true },
            },
            plan: true,
          },
        },
      },
    });

    if (!userStore) {
      throw new NotFoundException('Tienda no encontrada para este usuario');
    }

    const companyStores = userStore.company?.stores?.length
      ? userStore.company.stores
      : [{ id: userStore.id, name: userStore.name, subdomain: userStore.subdomain, isMainBranch: true }];

    const allowedStoreIds = companyStores.map((s) => s.id);
    const targetStoreIds =
      query.storeId && query.storeId !== 'ALL' && allowedStoreIds.includes(query.storeId)
        ? [query.storeId]
        : allowedStoreIds;

    const now = new Date();
    let start: Date;
    let end: Date;
    let periodLabel = '';

    if (query.startDate && query.endDate) {
      start = new Date(`${query.startDate}T00:00:00.000Z`);
      end = new Date(`${query.endDate}T23:59:59.999Z`);
      periodLabel = `${query.startDate} al ${query.endDate}`;
    } else if (query.period === 'previous_month') {
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      periodLabel = start.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' });
    } else if (query.period === 'current_year') {
      start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
      end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      periodLabel = `Año Tributario ${now.getFullYear()}`;
    } else {
      start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      periodLabel = start.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' });
    }

    const vendorOrders = await this.prisma.vendorOrder.findMany({
      where: {
        storeId: { in: targetStoreIds },
        status: 'PAID',
        createdAt: { gte: start, lte: end },
      },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            company: { select: { rut: true, legalName: true, taxActivity: true } },
          },
        },
        order: {
          select: {
            id: true,
            buyOrder: true,
            createdAt: true,
            name: true,
            email: true,
            origin: true,
            posPaymentMethod: true,
            posVoucherRef: true,
            payment: {
              select: {
                paymentType: true,
                authCode: true,
              },
            },
          },
        },
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Incluir tanto ventas Online Marketplace como ventas POS Mostrador en el Libro de Ventas F29 de la tienda,
    // diferenciando su canal (POS tiene 0% comisión por transacción y cobro físico directo en local).
    let totalProductsGross = 0;
    let totalShippingGross = 0;
    let totalGross = 0;
    let onlineGross = 0;
    let onlineOrderCount = 0;
    let posGross = 0;
    let posOrderCount = 0;
    let totalTaxableNet = 0;
    let totalVatDebit = 0;
    let totalPlatformFeeNet = 0;
    let totalPlatformFeeVat = 0;
    let totalPlatformFeeGross = 0;
    let totalNetPayoutToStore = 0;

    const isCompanyVatExempt =
      userStore.company?.taxClassification === 'VAT_EXEMPT' ||
      userStore.company?.taxClassification === 'EXENTO_IVA' ||
      userStore.company?.taxClassification === 'NON_TAXABLE';

    const detailedOrders = vendorOrders.map((vo) => {
      const isPos = vo.order?.origin === 'POS_IN_STORE';
      const productsGross = Math.round(Number(vo.subtotal || 0));
      const shippingGross = isPos ? 0 : Math.round(Number(vo.shippingCost || 0));
      const orderGross = productsGross + shippingGross;

      const net =
        Number(vo.taxableNet) > 0
          ? Math.round(Number(vo.taxableNet))
          : isCompanyVatExempt
          ? orderGross
          : Math.round(orderGross / 1.19);
      const vat =
        Number(vo.vatAmount) > 0
          ? Math.round(Number(vo.vatAmount))
          : isCompanyVatExempt
          ? 0
          : orderGross - net;

      // En POS la comisión por transacción de TapTrade es $0 (monetizado vía plan SaaS UF)
      const sellerFeeNet = isPos ? 0 : Math.round(Number(vo.sellerCommissionNet || 0));
      const sellerFeeVat = isPos ? 0 : Math.round(Number(vo.sellerCommissionVat || 0));
      const sellerFeeGross = isPos ? 0 : Math.round(Number(vo.sellerCommissionGross || 0));
      const sellerNetPayout = isPos
        ? orderGross
        : Number(vo.sellerNetPayout) > 0
        ? Math.round(Number(vo.sellerNetPayout))
        : Math.max(0, orderGross - sellerFeeGross);

      totalProductsGross += productsGross;
      totalShippingGross += shippingGross;
      totalGross += orderGross;
      if (isPos) {
        posGross += orderGross;
        posOrderCount += 1;
      } else {
        onlineGross += orderGross;
        onlineOrderCount += 1;
      }
      totalTaxableNet += net;
      totalVatDebit += vat;
      totalPlatformFeeNet += sellerFeeNet;
      totalPlatformFeeVat += sellerFeeVat;
      totalPlatformFeeGross += sellerFeeGross;
      totalNetPayoutToStore += sellerNetPayout;

      const resolvedPaymentMethod = isPos
        ? `POS_${vo.order?.posPaymentMethod || 'CASH'}`
        : vo.order?.payment?.paymentType || 'WEBPAY';
      const resolvedAuthCode = isPos
        ? vo.order?.posVoucherRef || 'MOSTRADOR'
        : vo.order?.payment?.authCode || '';

      return {
        vendorOrderId: vo.id,
        buyOrder: vo.order?.buyOrder || 'N/A',
        channel: isPos ? 'POS_MOSTRADOR' : 'ONLINE_MARKETPLACE',
        date: vo.createdAt,
        storeName: vo.store?.name || userStore.name,
        sellerRut: vo.sellerRut || vo.store?.company?.rut || userStore.company?.rut || 'Sin RUT',
        sellerLegalName:
          vo.sellerLegalName ||
          vo.store?.company?.legalName ||
          userStore.company?.legalName ||
          vo.store?.name ||
          userStore.name,
        buyerName: vo.order?.name || (isPos ? 'Cliente Mostrador' : 'Cliente'),
        buyerEmail: vo.order?.email || '',
        paymentMethod: resolvedPaymentMethod,
        authCode: resolvedAuthCode,
        deliveryStatus: vo.deliveryStatus || (isPos ? 'DELIVERED' : 'PENDING_DISPATCH'),
        settlementStatus: isPos ? 'COBRADO_EN_LOCAL' : vo.settlementStatus || 'HELD_ESCROW',
        buyerDteType: vo.buyerDteType,
        buyerDteFolio: vo.buyerDteFolio,
        productsGross,
        shippingGross,
        totalGross: orderGross,
        taxableNet: net,
        vatDebit: vat,
        platformFeeNet: sellerFeeNet,
        platformFeeVat: sellerFeeVat,
        platformFeeGross: sellerFeeGross,
        sellerNetPayout,
        itemCount: vo.items.reduce((acc, item) => acc + item.quantity, 0),
      };
    });

    const netVatPayableEstimate = Math.max(0, totalVatDebit - totalPlatformFeeVat);

    return {
      periodLabel,
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
      company: {
        name: userStore.company?.name || userStore.name,
        rut: userStore.company?.rut || null,
        legalName: userStore.company?.legalName || userStore.name,
        taxActivity: userStore.company?.taxActivity || null,
        taxClassification: userStore.company?.taxClassification || 'PRIMERA_CATEGORIA_AFECTO',
        verificationStatus: userStore.company?.verificationStatus || 'ENABLED',
      },
      availableStores: companyStores,
      selectedStoreId: query.storeId || 'ALL',
      orderCount: detailedOrders.length,
      onlineOrderCount,
      posOrderCount,
      onlineGross,
      posGross,
      productsGross: totalProductsGross,
      shippingGross: totalShippingGross,
      totalGross,
      taxableNet: totalTaxableNet,
      vatDebit: totalVatDebit,
      platformFeeNet: totalPlatformFeeNet,
      platformFeeVat: totalPlatformFeeVat,
      platformFeeGross: totalPlatformFeeGross,
      totalNetPayoutToStore,
      netVatPayableEstimate,
      orders: detailedOrders,
    };
  }

  /**
   * Genera el archivo CSV del Libro de Ventas Mensual para el contador de la tienda (Formulario 29 SII).
   */
  async generateStoreTaxSalesCsv(
    userId: string,
    query: {
      period?: string;
      startDate?: string;
      endDate?: string;
      storeId?: string;
    },
  ): Promise<{ csvContent: string; filename: string }> {
    const summary = await this.getStoreTaxSummary(userId, query);

    const headers = [
      'Fecha Venta',
      'Hora',
      'Canal Venta',
      'Nro Orden TapTrade',
      'Sucursal',
      'RUT Emisor (Tienda)',
      'Razon Social Emisor',
      'Cliente Comprador',
      'Email Cliente',
      'Medio de Pago',
      'Cod. Autorizacion / Voucher',
      'Estado Despacho',
      'Estado Liquidacion',
      'Folio DTE Comprador',
      'Cant. Items',
      'Subtotal Productos Bruto (CLP)',
      'Despacho Bruto (CLP)',
      'Total Bruto Boleta SII (CLP)',
      'Base Imponible Neta Tienda (CLP)',
      'IVA Debito Fiscal 19% F29 Cod.538 (CLP)',
      'Comision Neta TapTrade (CLP)',
      'IVA Credito Comision TapTrade F29 Cod.520 (CLP)',
      'Saldo Liquido Tienda (CLP)',
    ];

    const escapeCsv = (val: any): string => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = summary.orders.map((o) => {
      const d = new Date(o.date);
      const fecha = d.toLocaleDateString('es-CL');
      const hora = d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });

      return [
        escapeCsv(fecha),
        escapeCsv(hora),
        escapeCsv(o.channel),
        escapeCsv(o.buyOrder),
        escapeCsv(o.storeName),
        escapeCsv(o.sellerRut),
        escapeCsv(o.sellerLegalName),
        escapeCsv(o.buyerName),
        escapeCsv(o.buyerEmail),
        escapeCsv(o.paymentMethod),
        escapeCsv(o.authCode),
        escapeCsv(o.deliveryStatus),
        escapeCsv(o.settlementStatus),
        escapeCsv(o.buyerDteFolio || 'Pendiente'),
        o.itemCount,
        o.productsGross,
        o.shippingGross,
        o.totalGross,
        o.taxableNet,
        o.vatDebit,
        o.platformFeeNet,
        o.platformFeeVat,
        o.sellerNetPayout,
      ].join(';');
    });

    const totalsRow = [
      escapeCsv('TOTALES PERIODO F29'),
      escapeCsv(summary.periodLabel),
      escapeCsv(`Online: ${summary.onlineOrderCount} | POS: ${summary.posOrderCount}`),
      escapeCsv(`${summary.orderCount} ordenes`),
      escapeCsv(''),
      escapeCsv(summary.company.rut || ''),
      escapeCsv(summary.company.legalName || ''),
      escapeCsv(''),
      escapeCsv(''),
      escapeCsv(''),
      escapeCsv(''),
      escapeCsv(''),
      escapeCsv(''),
      escapeCsv(''),
      summary.orders.reduce((s, o) => s + o.itemCount, 0),
      summary.productsGross,
      summary.shippingGross,
      summary.totalGross,
      summary.taxableNet,
      summary.vatDebit,
      summary.platformFeeNet,
      summary.platformFeeVat,
      summary.totalNetPayoutToStore,
    ].join(';');

    const BOM = '\uFEFF';
    const csvContent = BOM + [headers.join(';'), ...rows, '', totalsRow].join('\r\n');
    const safePeriod = `${summary.startDate}_${summary.endDate}`;
    const filename = `libro_ventas_f29_${safePeriod}.csv`;

    return { csvContent, filename };
  }
}
