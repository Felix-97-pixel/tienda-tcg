import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface AccountingSummaryFilter {
  startDate?: string;
  endDate?: string;
  storeId?: string;
  status?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class AccountingService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Obtiene el consolidado tributario y financiero para el Superadministrador / Contador.
   * Separa estrictamente los ingresos propios de TapTrade (F29) de los fondos de terceros (custodia).
   */
  async getAccountingSummary(filter: AccountingSummaryFilter) {
    const page = Math.max(1, Number(filter.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(filter.limit) || 20));
    const skip = (page - 1) * limit;

    const whereOrder: any = {};

    // Filtro por estado (por defecto órdenes pagadas)
    if (filter.status && filter.status !== 'ALL') {
      whereOrder.status = filter.status;
    } else if (!filter.status) {
      whereOrder.status = 'PAID';
    }

    // Filtro por fecha
    if (filter.startDate || filter.endDate) {
      whereOrder.createdAt = {};
      if (filter.startDate) {
        whereOrder.createdAt.gte = new Date(filter.startDate);
      }
      if (filter.endDate) {
        const end = new Date(filter.endDate);
        end.setHours(23, 59, 59, 999);
        whereOrder.createdAt.lte = end;
      }
    }

    // Filtro por tienda vendedora específica
    if (filter.storeId && filter.storeId !== 'ALL') {
      whereOrder.vendorOrders = {
        some: { storeId: filter.storeId },
      };
    }

    // 1. Obtener todas las órdenes que coinciden para calcular métricas acumuladas
    const allMatchingOrders = await this.prisma.order.findMany({
      where: whereOrder,
      select: {
        id: true,
        totalAmount: true,
        productsTotal: true,
        shippingTotal: true,
        serviceFeeGross: true,
        serviceFeeNet: true,
        serviceFeeVat: true,
        transbankFeeEstimate: true,
      },
    });

    const totalOrdersCount = allMatchingOrders.length;

    // Acumuladores contables
    const totalCollected = allMatchingOrders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
    const totalProductsGross = allMatchingOrders.reduce((sum, o) => sum + Number(o.productsTotal || 0), 0);
    const totalShippingGross = allMatchingOrders.reduce((sum, o) => sum + Number(o.shippingTotal || 0), 0);
    const thirdPartyFunds = totalProductsGross + totalShippingGross;

    // Ingresos Propios TapTrade (Base F29)
    const platformServiceFeeGross = allMatchingOrders.reduce((sum, o) => sum + Number(o.serviceFeeGross || 0), 0);
    const platformServiceFeeNet = allMatchingOrders.reduce((sum, o) => sum + Number(o.serviceFeeNet || 0), 0);
    const platformVatDebit = allMatchingOrders.reduce((sum, o) => sum + Number(o.serviceFeeVat || 0), 0);
    const transbankFeeEstimate = allMatchingOrders.reduce((sum, o) => sum + Number(o.transbankFeeEstimate || 0), 0);
    const transbankVatCreditEstimate = Math.round((transbankFeeEstimate * 0.19) / 1.19);
    const netPlatformMargin = platformServiceFeeNet - (transbankFeeEstimate - transbankVatCreditEstimate);

    // 2. Fondos en Custodia de Tiendas (Ledger WalletTransaction)
    const [heldInEscrowSum, availableSum, totalWithdrawnSum] = await Promise.all([
      this.prisma.walletTransaction.aggregate({
        where: { type: 'SALE', isWithdrawable: false },
        _sum: { amount: true },
      }),
      this.prisma.walletTransaction.aggregate({
        where: { type: 'SALE', isWithdrawable: true },
        _sum: { amount: true },
      }),
      this.prisma.withdrawalRequest.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true },
      }),
    ]);

    const escrowHeld = Number(heldInEscrowSum._sum.amount || 0);
    const escrowAvailable = Number(availableSum._sum.amount || 0);
    const totalWithdrawn = Number(totalWithdrawnSum._sum.amount || 0);

    // 3. Obtener órdenes paginadas con detalle tributario completo
    const pagedOrders = await this.prisma.order.findMany({
      where: whereOrder,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        payment: true,
        vendorOrders: {
          include: {
            store: {
              select: {
                id: true,
                name: true,
                subdomain: true,
                company: {
                  select: {
                    rut: true,
                    legalName: true,
                    taxActivity: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return {
      kpis: {
        totalOrdersCount,
        totalCollected: Math.round(totalCollected),
        thirdPartyFunds: Math.round(thirdPartyFunds),
        platform: {
          serviceFeeGross: Math.round(platformServiceFeeGross),
          serviceFeeNet: Math.round(platformServiceFeeNet),
          vatDebit: Math.round(platformVatDebit),
          transbankFeeEstimate: Math.round(transbankFeeEstimate),
          transbankVatCreditEstimate: Math.round(transbankVatCreditEstimate),
          netPlatformMargin: Math.round(netPlatformMargin),
        },
        escrow: {
          held: Math.round(escrowHeld),
          available: Math.round(escrowAvailable),
          withdrawn: Math.round(totalWithdrawn),
        },
      },
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalOrdersCount / limit),
        totalItems: totalOrdersCount,
      },
      orders: pagedOrders.map((o) => {
        const primaryVendor = o.vendorOrders[0];
        const storeName = primaryVendor?.store?.name || 'Multi-tienda';
        const sellerRut = primaryVendor?.sellerRut || primaryVendor?.store?.company?.rut || 'Sin RUT';
        const sellerLegalName = primaryVendor?.sellerLegalName || primaryVendor?.store?.company?.legalName || primaryVendor?.store?.name || 'Tienda Asociada';

        return {
          id: o.id,
          buyOrder: o.buyOrder,
          createdAt: o.createdAt,
          status: o.status,
          buyerName: o.name,
          buyerEmail: o.email,
          paymentMethod: o.payment?.paymentType || 'WEBPAY',
          paymentToken: o.payment?.token || o.payment?.authCode || 'N/A',
          storeCount: o.vendorOrders.length,
          storeName,
          sellerRut,
          sellerLegalName,
          productsGross: Number(o.productsTotal || 0),
          shippingGross: Number(o.shippingTotal || 0),
          vendorPayout: Number(o.productsTotal || 0) + Number(o.shippingTotal || 0),
          serviceFeeNet: Number(o.serviceFeeNet || 0),
          serviceFeeVat: Number(o.serviceFeeVat || 0),
          serviceFeeGross: Number(o.serviceFeeGross || 0),
          transbankFeeEstimate: Number(o.transbankFeeEstimate || 0),
          totalAmount: Number(o.totalAmount || 0),
          vatRate: Number(o.vatRateSnapshot || 0.19),
          vendors: o.vendorOrders.map((vo) => ({
            storeId: vo.storeId,
            storeName: vo.store.name,
            subtotal: Number(vo.subtotal),
            shippingCost: Number(vo.shippingCost),
            totalPayout: Number(vo.subtotal) + Number(vo.shippingCost),
            deliveryStatus: vo.deliveryStatus,
            taxableNet: Number(vo.taxableNet || 0),
            vatAmount: Number(vo.vatAmount || 0),
            sellerRut: vo.sellerRut || vo.store.company?.rut || null,
            sellerLegalName: vo.sellerLegalName || vo.store.company?.legalName || null,
          })),
        };
      }),
    };
  }

  /**
   * Genera el contenido CSV estructurado para exportación a Excel / software contable.
   */
  async generateAccountingCsv(filter: AccountingSummaryFilter): Promise<string> {
    // Para exportación completa traer todas las órdenes sin paginar
    const summary = await this.getAccountingSummary({ ...filter, page: 1, limit: 10000 });

    const headers = [
      'Fecha',
      'Hora',
      'Nro Orden (BuyOrder)',
      'Estado',
      'Cliente',
      'Email Cliente',
      'Pasarela',
      'Token / AuthCode',
      'Tienda Vendedora',
      'RUT Tienda',
      'Razon Social Tienda',
      'Bruto Productos (CLP)',
      'Costo Envio (CLP)',
      'Abono Tienda 100% (CLP)',
      'Comision Neta TapTrade (CLP)',
      'IVA Debito TapTrade 19% (CLP)',
      'Comision Bruta TapTrade (CLP)',
      'Costo Estimado Pasarela (CLP)',
      'Total Cobrado Comprador (CLP)',
    ];

    const rows: string[] = [headers.join(';')];

    for (const o of summary.orders) {
      const dateObj = new Date(o.createdAt);
      const fecha = dateObj.toLocaleDateString('es-CL');
      const hora = dateObj.toLocaleTimeString('es-CL');

      const row = [
        fecha,
        hora,
        `"${o.buyOrder}"`,
        o.status,
        `"${(o.buyerName || '').replace(/"/g, '""')}"`,
        `"${(o.buyerEmail || '').replace(/"/g, '""')}"`,
        o.paymentMethod,
        `"${o.paymentToken}"`,
        `"${o.storeName.replace(/"/g, '""')}"`,
        `"${o.sellerRut}"`,
        `"${o.sellerLegalName.replace(/"/g, '""')}"`,
        o.productsGross,
        o.shippingGross,
        o.vendorPayout,
        o.serviceFeeNet,
        o.serviceFeeVat,
        o.serviceFeeGross,
        o.transbankFeeEstimate,
        o.totalAmount,
      ];

      rows.push(row.join(';'));
    }

    // Fila final de Totales
    const kpis = summary.kpis;
    const totalsRow = [
      'TOTALES CONSOLIDADOS',
      '',
      `${kpis.totalOrdersCount} ordenes`,
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      kpis.thirdPartyFunds,
      '',
      kpis.thirdPartyFunds,
      kpis.platform.serviceFeeNet,
      kpis.platform.vatDebit,
      kpis.platform.serviceFeeGross,
      kpis.platform.transbankFeeEstimate,
      kpis.totalCollected,
    ];
    rows.push(totalsRow.join(';'));

    return '\uFEFF' + rows.join('\r\n'); // \uFEFF añade BOM UTF-8 para que Excel lo abra perfecto en Windows/Mac
  }
}

