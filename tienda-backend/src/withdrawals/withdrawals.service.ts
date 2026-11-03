import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface StoreTaxSummaryFilter {
  period?: string;
  startDate?: string;
  endDate?: string;
  storeId?: string;
}

@Injectable()
export class WithdrawalsService {
  constructor(private prisma: PrismaService) {}

  async requestWithdrawal(userId: string, amount: number, bankDetails: string) {
    if (!amount || amount <= 0) {
      throw new BadRequestException('El monto a retirar debe ser mayor a cero.');
    }

    const store = await this.prisma.store.findFirst({
      where: {
        OR: [
          { ownerId: userId },
          { company: { ownerId: userId } },
          { company: { members: { some: { userId, role: { in: ['OWNER', 'ADMIN', 'ACCOUNTANT'] } } } } },
        ],
      },
      orderBy: { isMainBranch: 'desc' },
    });
    if (!store) throw new NotFoundException('Store not found');

    if (Number(store.balance) < amount) {
      throw new BadRequestException('Saldo insuficiente para retirar');
    }

    // Descontar saldo de forma ATÓMICA y crear petición en PENDING
    return await this.prisma.$transaction(async (tx) => {
      // updateMany con condición balance: { gte: amount } previene condiciones de carrera y saldos negativos
      const updated = await tx.store.updateMany({
        where: { 
          id: store.id,
          balance: { gte: amount },
        },
        data: { balance: { decrement: amount } },
      });

      if (updated.count === 0) {
        throw new BadRequestException('Saldo insuficiente o conflicto por petición simultánea.');
      }

      return await tx.withdrawalRequest.create({
        data: {
          storeId: store.id,
          amount,
          bankDetails,
          status: 'PENDING',
        },
      });
    });
  }

  async getPendingWithdrawals() {
    return this.prisma.withdrawalRequest.findMany({
      where: { status: 'PENDING' },
      include: { store: true }
    });
  }

  async getStoreHistory(userId: string) {
    const store = await this.prisma.store.findFirst({
      where: {
        OR: [
          { ownerId: userId },
          { company: { ownerId: userId } },
          { company: { members: { some: { userId, role: { in: ['OWNER', 'ADMIN', 'ACCOUNTANT'] } } } } },
        ],
      },
      orderBy: { isMainBranch: 'desc' },
    });
    if (!store) throw new NotFoundException('Store not found');

    const transactions = await this.prisma.walletTransaction.findMany({
      where: { storeId: store.id },
      orderBy: { createdAt: 'desc' }
    });
    
    const withdrawals = await this.prisma.withdrawalRequest.findMany({
      where: { storeId: store.id },
      orderBy: { createdAt: 'desc' }
    });

    // Calcular saldo en custodia (ventas pendientes de despacho)
    const heldBalance = transactions
      .filter((t) => t.type === 'SALE' && !t.isWithdrawable)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return {
      transactions,
      withdrawals,
      balance: store.balance,
      heldBalance,
    };
  }

  async completeWithdrawal(id: string) {
    const req = await this.prisma.withdrawalRequest.findUnique({ where: { id } });
    if (!req) throw new NotFoundException('Request not found');
    if (req.status !== 'PENDING') throw new BadRequestException('Request is not PENDING');

    return await this.prisma.$transaction(async (tx) => {
      // Registrar transaccion en el historial de la billetera (retiro consumado)
      await tx.walletTransaction.create({
        data: {
          storeId: req.storeId,
          amount: req.amount,
          type: 'WITHDRAWAL',
          reference: `Withdrawal ID: ${req.id}`,
        }
      });

      return await tx.withdrawalRequest.update({
        where: { id },
        data: { status: 'COMPLETED' }
      });
    });
  }

  async rejectWithdrawal(id: string) {
    const req = await this.prisma.withdrawalRequest.findUnique({ where: { id } });
    if (!req) throw new NotFoundException('Request not found');
    if (req.status !== 'PENDING') throw new BadRequestException('Request is not PENDING');

    return await this.prisma.$transaction(async (tx) => {
      // Devolver saldo a la tienda
      await tx.store.update({
        where: { id: req.storeId },
        data: { balance: { increment: req.amount } }
      });

      return await tx.withdrawalRequest.update({
        where: { id },
        data: { status: 'REJECTED' }
      });
    });
  }

  private resolveDateRange(filter: StoreTaxSummaryFilter) {
    const now = new Date();
    let start: Date;
    let end: Date;

    if (filter.startDate && filter.endDate) {
      start = new Date(filter.startDate);
      start.setHours(0, 0, 0, 0);
      end = new Date(filter.endDate);
      end.setHours(23, 59, 59, 999);
    } else if (filter.period === 'previous_month') {
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    } else if (filter.period === 'current_year') {
      start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
      end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
    } else {
      // current_month (default)
      start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    }

    return { start, end };
  }

  private async resolveUserStoresAndCompany(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        stores: {
          include: { company: true },
        },
        companies: {
          include: { stores: true },
        },
        storeMemberships: {
          include: { store: { include: { company: true } } },
        },
        companyMemberships: {
          include: { company: { include: { stores: true } } },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const company: any =
      user.companies?.[0] ||
      user.companyMemberships?.[0]?.company ||
      user.stores?.find((s) => s.company)?.company ||
      user.storeMemberships?.find((m) => m.store?.company)?.store?.company ||
      null;

    let availableStores: { id: string; name: string }[] = [];
    if (company) {
      const companyStores = await this.prisma.store.findMany({
        where: { companyId: company.id },
        select: { id: true, name: true },
        orderBy: { isMainBranch: "desc" },
      });
      if (companyStores.length > 0) {
        availableStores = companyStores;
      }
    }

    if (availableStores.length === 0) {
      const directStores = [
        ...(user.stores || []),
        ...(user.storeMemberships?.map((m) => m.store).filter(Boolean) || []),
      ];
      const seen = new Set<string>();
      for (const s of directStores) {
        if (!seen.has(s.id)) {
          seen.add(s.id);
          availableStores.push({ id: s.id, name: s.name });
        }
      }
    }

    if (availableStores.length === 0) {
      throw new NotFoundException('No se encontraron tiendas asociadas a tu cuenta');
    }

    return { company, availableStores };
  }

  async getStoreTaxSummary(
    userId: string,
    filter: StoreTaxSummaryFilter,
  ) {
    const { company, availableStores } = await this.resolveUserStoresAndCompany(userId);
    const { start, end } = this.resolveDateRange(filter);

    const allowedStoreIds = availableStores.map((s) => s.id);
    let targetStoreIds = allowedStoreIds;

    if (filter.storeId && filter.storeId !== 'ALL') {
      if (allowedStoreIds.includes(filter.storeId)) {
        targetStoreIds = [filter.storeId];
      }
    }

    const vendorOrders = await this.prisma.vendorOrder.findMany({
      where: {
        storeId: { in: targetStoreIds },
        status: 'PAID',
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      include: {
        order: {
          select: {
            buyOrder: true,
            name: true,
            email: true,
            createdAt: true,
            payment: {
              select: {
                paymentType: true,
              },
            },
          },
        },
        store: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    let totalGross = 0;
    let taxableNet = 0;
    let vatDebit = 0;
    let platformFeeNet = 0;
    let platformFeeVat = 0;

    const orders = vendorOrders.map((vo) => {
      const subtotal = Math.round(Number(vo.subtotal || 0));
      const shipping = Math.round(Number(vo.shippingCost || 0));
      const gross = subtotal + shipping;

      const net =
        Number(vo.taxableNet) > 0
          ? Math.round(Number(vo.taxableNet))
          : Math.round(gross / 1.19);
      const vat =
        Number(vo.vatAmount) > 0
          ? Math.round(Number(vo.vatAmount))
          : gross - net;

      // Comisión 3% + IVA cobrada por TapTrade (IVA Crédito Fiscal para la tienda)
      const feeNet = Math.round(subtotal * 0.03);
      const feeVat = Math.round(feeNet * 0.19);

      totalGross += gross;
      taxableNet += net;
      vatDebit += vat;
      platformFeeNet += feeNet;
      platformFeeVat += feeVat;

      return {
        id: vo.id,
        buyOrder: vo.order.buyOrder,
        date: vo.createdAt,
        storeId: vo.storeId,
        storeName: vo.store.name,
        customerName: vo.order.name,
        customerEmail: vo.order.email,
        subtotal,
        shippingCost: shipping,
        grossTotal: gross,
        taxableNet: net,
        vatAmount: vat,
        platformFeeNet: feeNet,
        platformFeeVat: feeVat,
        deliveryStatus: vo.deliveryStatus,
        shippingCourier: vo.shippingCourier,
        trackingNumber: vo.trackingNumber,
        paymentMethod: vo.order.payment?.paymentType || 'WEBPAY',
      };
    });

    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
    ];
    const periodLabel = `${monthNames[start.getMonth()]} ${start.getFullYear()}`;

    return {
      period: filter.period || 'current_month',
      periodLabel,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      company: company
        ? {
            id: company.id,
            name: company.name,
            legalName: company.legalName || company.name,
            rut: company.rut,
          }
        : null,
      availableStores,
      selectedStoreId: filter.storeId || 'ALL',
      totalGross,
      taxableNet,
      vatDebit, // Código 538 F29
      platformFeeNet,
      platformFeeVat, // Código 520 F29 (Crédito Fiscal)
      orderCount: vendorOrders.length,
      orders,
    };
  }

  async generateStoreTaxSalesCsv(
    userId: string,
    filter: StoreTaxSummaryFilter,
  ) {
    const summary = await this.getStoreTaxSummary(userId, filter);

    const companyName = summary.company?.legalName || summary.company?.name || 'Mi Tienda';
    const companyRut = summary.company?.rut || 'Sin RUT registrado';

    const header = [
      `"LIBRO DE VENTAS ELECTRÓNICAS - FORMULARIO 29 SII"`,
      `"Empresa / Razón Social: ${companyName}"`,
      `"RUT: ${companyRut}"`,
      `"Período: ${summary.periodLabel}"`,
      `"Venta Bruta Total: $${summary.totalGross.toLocaleString('es-CL')}"`,
      `"Base Imponible Neta: $${summary.taxableNet.toLocaleString('es-CL')}"`,
      `"Débito Fiscal IVA 19% (F29 Cód 538): $${summary.vatDebit.toLocaleString('es-CL')}"`,
      `"Crédito Fiscal IVA Comisión TapTrade (F29 Cód 520): $${summary.platformFeeVat.toLocaleString('es-CL')}"`,
      '',
      [
        '"Fecha"',
        '"N° Orden (BuyOrder)"',
        '"Sucursal"',
        '"Cliente"',
        '"Subtotal Productos"',
        '"Costo Envío"',
        '"Venta Bruta Total"',
        '"Venta Neta Imponible"',
        '"IVA Débito Fiscal (19% Cód 538)"',
        '"Comisión TapTrade Neta"',
        '"IVA Comisión (Crédito Cód 520)"',
        '"Método de Pago"',
        '"Estado Despacho"',
        '"Courier"',
        '"N° Seguimiento"',
      ].join(';'),
    ];

    const rows = summary.orders.map((o) => {
      const dateFormatted = new Date(o.date).toLocaleDateString('es-CL');
      return [
        `"${dateFormatted}"`,
        `"${o.buyOrder}"`,
        `"${o.storeName}"`,
        `"${o.customerName}"`,
        o.subtotal,
        o.shippingCost,
        o.grossTotal,
        o.taxableNet,
        o.vatAmount,
        o.platformFeeNet,
        o.platformFeeVat,
        `"${o.paymentMethod}"`,
        `"${o.deliveryStatus}"`,
        `"${o.shippingCourier || 'N/A'}"`,
        `"${o.trackingNumber || 'N/A'}"`,
      ].join(';');
    });

    const summaryRow = [
      '"TOTALES"',
      '""',
      '""',
      `"${summary.orderCount} pedidos"`,
      summary.orders.reduce((sum, o) => sum + o.subtotal, 0),
      summary.orders.reduce((sum, o) => sum + o.shippingCost, 0),
      summary.totalGross,
      summary.taxableNet,
      summary.vatDebit,
      summary.platformFeeNet,
      summary.platformFeeVat,
      '""',
      '""',
      '""',
      '""',
    ].join(';');

    const csvContent = '\uFEFF' + [...header, ...rows, '', summaryRow].join('\r\n');
    const sanitizedName = companyName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const filename = `libro_ventas_${sanitizedName}_${summary.periodLabel.toLowerCase().replace(/\s+/g, '_')}.csv`;

    return { csvContent, filename };
  }
}
