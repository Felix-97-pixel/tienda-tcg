"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import SearchableSelect from "@/components/ui/SearchableSelect";
import DatePicker from "@/components/ui/DatePicker";
import { API_URL, getAdminAuthHeaders } from "@/utils/api";
import {
  IconCoins,
  IconReceipt,
  IconWallet,
  IconCreditCard,
  IconDownload,
  IconRefresh,
  IconFilter,
  IconChevronDown,
  IconChevronUp,
  IconShieldCheck,
  IconStore,
  IconTruck,
  IconBox,
  IconCheckCircle,
  IconClock,
  IconAlertTriangle,
  IconInfo,
} from "@/components/ui/Icons";
import toast from "react-hot-toast";

interface StoreOption {
  id: string;
  name: string;
  subdomain: string;
}

interface OrderVendorDetail {
  storeId: string;
  storeName: string;
  subtotal: number;
  shippingCost: number;
  totalPayout: number;
  deliveryStatus?: string;
  taxableNet: number;
  vatAmount: number;
  sellerRut: string | null;
  sellerLegalName: string | null;
}

interface AccountingOrder {
  id: string;
  buyOrder: string;
  createdAt: string;
  status: string;
  buyerName: string;
  buyerEmail: string;
  paymentMethod: string;
  paymentToken: string;
  storeCount: number;
  storeName: string;
  sellerRut: string;
  sellerLegalName: string;
  productsGross: number;
  shippingGross: number;
  vendorPayout: number;
  serviceFeeNet: number;
  serviceFeeVat: number;
  serviceFeeGross: number;
  transbankFeeEstimate: number;
  totalAmount: number;
  vatRate: number;
  vendors: OrderVendorDetail[];
}

interface AccountingKPIs {
  totalOrdersCount: number;
  totalCollected: number;
  thirdPartyFunds: number;
  platform: {
    serviceFeeGross: number;
    serviceFeeNet: number;
    vatDebit: number;
    transbankFeeEstimate: number;
    transbankVatCreditEstimate: number;
    netPlatformMargin: number;
  };
  saas?: {
    activeCompaniesCount: number;
    totalUf: number;
    ufValueClp: number;
    netRevenue: number;
    vatDebit: number;
    grossRevenue: number;
  };
  f29?: {
    marketplaceNet: number;
    marketplaceVatDebit: number;
    saasNet: number;
    saasVatDebit: number;
    totalNetSales: number;
    totalVatDebit: number;
    transbankVatCredit: number;
    netVatToPay: number;
    ppmRate: number;
    ppmAmount: number;
    totalF29ToPay: number;
  };
  escrow: {
    held: number;
    available: number;
    withdrawn: number;
  };
}

export default function SuperAdminAccountingPage() {
  // Estados de Filtros
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(1); // Primer día del mes actual
    return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState<string>(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [storeId, setStoreId] = useState<string>("ALL");
  const [status, setStatus] = useState<string>("PAID");
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(20);

  // Estados de Datos
  const [stores, setStores] = useState<StoreOption[]>([]);
  const [kpis, setKpis] = useState<AccountingKPIs | null>(null);
  const [orders, setOrders] = useState<AccountingOrder[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Cargar lista de tiendas para el selector
  useEffect(() => {
    const fetchStores = async () => {
      try {
        const headers = getAdminAuthHeaders();
        const res = await fetch(`${API_URL}/stores`, {
          headers,
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : data.stores || [];
          setStores(list);
        }
      } catch (err) {
        console.error("Error al cargar tiendas:", err);
      }
    };
    fetchStores();
  }, []);

  // Cargar datos contables
  const fetchAccounting = useCallback(async () => {
    setLoading(true);
    try {
      const headers = getAdminAuthHeaders();
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        status,
      });

      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);
      if (storeId && storeId !== "ALL") params.set("storeId", storeId);

      const res = await fetch(`${API_URL}/accounting/summary?${params.toString()}`, {
        headers,
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error(`Error en el servidor: ${res.statusText}`);
      }

      const data = await res.json();
      setKpis(data.kpis);
      setOrders(data.orders);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalItems(data.pagination?.totalItems || 0);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Error al cargar la información contable");
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, storeId, status, page, limit]);

  useEffect(() => {
    fetchAccounting();
  }, [fetchAccounting]);

  // Exportar Excel / CSV
  const handleExportCsv = async () => {
    setIsExporting(true);
    try {
      const headers = getAdminAuthHeaders();
      const params = new URLSearchParams({ status });
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);
      if (storeId && storeId !== "ALL") params.set("storeId", storeId);

      const res = await fetch(`${API_URL}/accounting/export?${params.toString()}`, {
        headers,
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("No se pudo generar el reporte contable");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `reporte_contable_taptrade_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Reporte descargado correctamente para Excel");
    } catch (err: any) {
      toast.error(err.message || "Error al exportar archivo");
    } finally {
      setIsExporting(false);
    }
  };

  // Presets de Fechas
  const applyDatePreset = (preset: "THIS_MONTH" | "PREV_MONTH" | "LAST_30" | "THIS_YEAR") => {
    const now = new Date();
    setPage(1);
    if (preset === "THIS_MONTH") {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      setStartDate(start.toISOString().split("T")[0]);
      setEndDate(now.toISOString().split("T")[0]);
    } else if (preset === "PREV_MONTH") {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      setStartDate(start.toISOString().split("T")[0]);
      setEndDate(end.toISOString().split("T")[0]);
    } else if (preset === "LAST_30") {
      const start = new Date();
      start.setDate(now.getDate() - 30);
      setStartDate(start.toISOString().split("T")[0]);
      setEndDate(now.toISOString().split("T")[0]);
    } else if (preset === "THIS_YEAR") {
      const start = new Date(now.getFullYear(), 0, 1);
      setStartDate(start.toISOString().split("T")[0]);
      setEndDate(now.toISOString().split("T")[0]);
    }
  };

  // Opciones para SearchableSelect
  const storeOptions = useMemo(() => {
    return [
      { value: "ALL", label: "Todas las Tiendas" },
      ...stores.map((s) => ({
        value: s.id,
        label: `${s.name} (${s.subdomain})`,
      })),
    ];
  }, [stores]);

  const statusOptions = useMemo(() => {
    return [
      { value: "PAID", label: "Pagadas (PAID)" },
      { value: "ALL", label: "Todos los Estados" },
      { value: "PENDING", label: "Pendientes (PENDING)" },
      { value: "CANCELLED", label: "Canceladas (CANCELLED)" },
    ];
  }, []);

  const formatCLP = (amount: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  return (
    <div className="p-6 space-y-8 max-w-[96rem] mx-auto text-white">
      {/* Encabezado Principal */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red/10 border border-red/20 text-red text-xs font-black tracking-widest uppercase mb-2">
            <IconShieldCheck className="w-3.5 h-3.5" />
            <span>Módulo Contable & Tributario (SII)</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">
            Consolidado Financiero & Cuadratura F29
          </h1>
          <p className="text-sm text-white/60 mt-1 max-w-3xl">
            Control de intermediación mercantil: Separa de forma estricta los ingresos propios de la plataforma (comisión afecta a IVA) de los fondos transitorios en custodia que corresponden a las tiendas asociadas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchAccounting()}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 text-sm font-bold transition-all disabled:opacity-50"
          >
            <IconRefresh className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span>Actualizar</span>
          </button>

          <button
            onClick={handleExportCsv}
            disabled={isExporting}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold shadow-lg shadow-emerald-900/30 transition-all disabled:opacity-50"
          >
            <IconDownload className="w-4 h-4" />
            <span>{isExporting ? "Generando..." : "Descargar Excel (CSV Contable)"}</span>
          </button>
        </div>
      </div>

      {/* Barra de Filtros y Atajos */}
      <div className="bg-[#0E121B] border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-4">
          <div className="flex items-center gap-2 text-xs font-bold text-white/50 uppercase tracking-wider">
            <IconFilter className="w-4 h-4 text-red" />
            <span>Atajos de Período Tributario:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => applyDatePreset("THIS_MONTH")}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 transition-all"
            >
              Mes Actual
            </button>
            <button
              onClick={() => applyDatePreset("PREV_MONTH")}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 transition-all"
            >
              Mes Anterior
            </button>
            <button
              onClick={() => applyDatePreset("LAST_30")}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 transition-all"
            >
              Últimos 30 días
            </button>
            <button
              onClick={() => applyDatePreset("THIS_YEAR")}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 transition-all"
            >
              Año en Curso
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div>
            <DatePicker
              label="Fecha Desde"
              value={startDate}
              onChange={(val) => {
                setStartDate(val);
                setPage(1);
              }}
              placeholder="Desde..."
              usePortal={true}
            />
          </div>

          <div>
            <DatePicker
              label="Fecha Hasta"
              value={endDate}
              onChange={(val) => {
                setEndDate(val);
                setPage(1);
              }}
              placeholder="Hasta..."
              usePortal={true}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-white/70 mb-1.5">
              Filtrar por Tienda
            </label>
            <SearchableSelect
              options={storeOptions}
              value={storeId}
              onChange={(val) => {
                setStoreId(val || "ALL");
                setPage(1);
              }}
              placeholder="Buscar o seleccionar tienda..."
              className="w-full"
              inputClassName="h-[38px] bg-[#141A26] border border-white/10 rounded-xl px-3.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-red transition-colors"
              usePortal={true}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-white/70 mb-1.5">
              Estado de Orden
            </label>
            <SearchableSelect
              options={statusOptions}
              value={status}
              onChange={(val) => {
                setStatus(val || "PAID");
                setPage(1);
              }}
              placeholder="Seleccionar estado..."
              className="w-full"
              inputClassName="h-[38px] bg-[#141A26] border border-white/10 rounded-xl px-3.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-red transition-colors"
              usePortal={true}
            />
          </div>
        </div>
      </div>

      {/* Tarjetas de Resumen Tributario y Financiero */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Ingresos Propios TapTrade */}
        <div className="bg-[#0E121B] border border-red/20 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-28 h-28 bg-red/10 rounded-full blur-2xl pointer-events-none" />
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-black uppercase tracking-wider text-red">
                Facturación TapTrade (F29)
              </span>
              <div className="w-9 h-9 rounded-xl bg-red/10 border border-red/30 flex items-center justify-center text-red">
                <IconReceipt className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black text-white tracking-tight">
              {formatCLP(kpis?.platform.serviceFeeGross || 0)}
            </div>
            <p className="text-xs text-white/50 mt-1">
              Comisión de plataforma total bruta
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-white/10 space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-white/60">Base Neta Imponible (3%):</span>
              <span className="font-bold text-white font-mono">
                {formatCLP(kpis?.platform.serviceFeeNet || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center text-red-light">
              <span className="font-medium">IVA Débito Fiscal (19%):</span>
              <span className="font-bold font-mono">
                {formatCLP(kpis?.platform.vatDebit || 0)}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-red/5 border border-red/20 text-[11px] text-white/70 flex items-start gap-1.5 mt-2">
              <IconInfo className="w-3.5 h-3.5 text-red shrink-0 mt-0.5" />
              <span>Base para la emisión de facturas electrónicas de comisión TapTrade.</span>
            </div>
          </div>
        </div>

        {/* Card 2: Fondos en Custodia de Terceros */}
        <div className="bg-[#0E121B] border border-blue-500/20 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-28 h-28 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-black uppercase tracking-wider text-blue-400">
                Fondos de Tiendas (Custodia)
              </span>
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <IconWallet className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black text-white tracking-tight">
              {formatCLP(kpis?.thirdPartyFunds || 0)}
            </div>
            <p className="text-xs text-white/50 mt-1">
              Abono 100% a tiendas (Productos + Envíos)
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-white/10 space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-white/60">Retenido en Escrow:</span>
              <span className="font-bold text-amber-400 font-mono">
                {formatCLP(kpis?.escrow.held || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/60">Disponible para Retiro:</span>
              <span className="font-bold text-emerald-400 font-mono">
                {formatCLP(kpis?.escrow.available || 0)}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-blue-500/5 border border-blue-500/20 text-[11px] text-white/70 flex items-start gap-1.5 mt-2">
              <IconShieldCheck className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
              <span>Mandato Mercantil: Fondos ajenos exentos de tributación propia de TapTrade.</span>
            </div>
          </div>
        </div>

        {/* Card 3: Pasarela de Pagos & Margen */}
        <div className="bg-[#0E121B] border border-amber-500/20 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-28 h-28 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                Pasarela & Margen Real
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <IconCreditCard className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black text-white tracking-tight">
              {formatCLP(kpis?.platform.netPlatformMargin || 0)}
            </div>
            <p className="text-xs text-white/50 mt-1">
              Margen operativo neto para TapTrade
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-white/10 space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-white/60">Comisión Pasarela Estimada:</span>
              <span className="font-bold text-rose-400 font-mono">
                {formatCLP(kpis?.platform.transbankFeeEstimate || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/60">IVA Crédito Fiscal Pasarela:</span>
              <span className="font-bold text-emerald-400 font-mono">
                {formatCLP(kpis?.platform.transbankVatCreditEstimate || 0)}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-amber-500/5 border border-amber-500/20 text-[11px] text-white/70 flex items-start gap-1.5 mt-2">
              <IconCoins className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <span>Gross-up aplicado en checkout cubre el costo de procesamiento financiero.</span>
            </div>
          </div>
        </div>

        {/* Card 4: Recaudación Bancaria Total */}
        <div className="bg-[#0E121B] border border-emerald-500/20 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                Recaudación Bancaria Global
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <IconCoins className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black text-white tracking-tight">
              {formatCLP(kpis?.totalCollected || 0)}
            </div>
            <p className="text-xs text-white/50 mt-1">
              Monto total que ingresó al banco vía Webpay / MP
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-white/10 space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-white/60">Órdenes Procesadas:</span>
              <span className="font-bold text-white font-mono">
                {kpis?.totalOrdersCount || 0} pedidos
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/60">Ticket Promedio Bruto:</span>
              <span className="font-bold text-white font-mono">
                {formatCLP(
                  kpis?.totalOrdersCount
                    ? Math.round((kpis.totalCollected || 0) / kpis.totalOrdersCount)
                    : 0
                )}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-[11px] text-white/70 flex items-start gap-1.5 mt-2">
              <IconCheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>Cuadra exactamente con la cartola de la cuenta corriente de la empresa.</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* PANEL DE LIQUIDACIÓN TRIBUTARIA F29 (TAPTRADE SpA)        */}
      {/* Consolidación oficial: Comisiones Marketplace + SaaS     */}
      {/* ========================================================= */}
      <div className="bg-[#0E121B] border border-red/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden space-y-6">
        <div className="absolute top-0 right-0 w-80 h-80 bg-red/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-red shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
              <h2 className="text-base font-black text-white uppercase tracking-wider">
                Liquidación Tributaria Proyectada • Formulario F29 (TapTrade SpA)
              </h2>
            </div>
            <p className="text-xs text-white/50">
              Consolida todas las ventas propias afectas a IVA del período: <strong>Comisiones Marketplace</strong> (boletas a compradores) y <strong>Suscripciones SaaS de Software</strong> (facturas a tiendas).
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-lg text-xs font-mono font-bold bg-white/5 border border-white/10 text-white/80">
              RUT: 78.531.106-K
            </span>
            <span className="px-3 py-1 rounded-lg text-xs font-bold bg-red/10 text-red border border-red/30">
              Régimen Pro-Pyme (PPM 0.25%)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna 1: Ventas Propias Netas */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
            <span className="text-xs font-bold text-white/60 uppercase tracking-wider block">
              1. Ventas Propias Netas (Base Imponible)
            </span>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-white/60">Comisiones Marketplace (3% neto):</span>
                <span className="font-mono font-bold text-white">
                  {formatCLP(kpis?.f29?.marketplaceNet || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/60">
                  Suscripciones SaaS ({kpis?.saas?.activeCompaniesCount || 0} emp. / {kpis?.saas?.totalUf || 0} UF):
                </span>
                <span className="font-mono font-bold text-white">
                  {formatCLP(kpis?.f29?.saasNet || 0)}
                </span>
              </div>
              <div className="pt-2 border-t border-white/10 flex justify-between items-center text-sm font-black text-white">
                <span>Total Ventas Netas TapTrade:</span>
                <span className="font-mono text-emerald-400">
                  {formatCLP(kpis?.f29?.totalNetSales || 0)}
                </span>
              </div>
            </div>
            <p className="text-[10px] text-white/40 leading-relaxed pt-1">
              Valor UF referencial: {formatCLP(kpis?.saas?.ufValueClp || 38500)} CLP. Suma base imponible sobre la cual se calcula el PPM.
            </p>
          </div>

          {/* Columna 2: Cuadratura de IVA */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
            <span className="text-xs font-bold text-white/60 uppercase tracking-wider block">
              2. IVA Débito vs Crédito Fiscal
            </span>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-white/60">(+) IVA Débito Comisiones:</span>
                <span className="font-mono text-white/80">
                  {formatCLP(kpis?.f29?.marketplaceVatDebit || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/60">(+) IVA Débito Suscripciones SaaS:</span>
                <span className="font-mono text-white/80">
                  {formatCLP(kpis?.f29?.saasVatDebit || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center text-amber-400 font-bold">
                <span>(=) IVA Débito Bruto Total (Código 538):</span>
                <span className="font-mono">
                  {formatCLP(kpis?.f29?.totalVatDebit || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center text-emerald-400">
                <span>(-) IVA Crédito Pasarelas (Transbank/MP):</span>
                <span className="font-mono">
                  -{formatCLP(kpis?.f29?.transbankVatCredit || 0)}
                </span>
              </div>
              <div className="pt-2 border-t border-white/10 flex justify-between items-center font-bold text-white">
                <span>(=) IVA Neto a Pagar al Fisco:</span>
                <span className="font-mono text-amber-400">
                  {formatCLP(kpis?.f29?.netVatToPay || 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Columna 3: Total Formulario F29 */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-red/10 to-red/5 border border-red/40 flex flex-col justify-between">
            <div>
              <span className="text-xs font-black text-red uppercase tracking-wider block mb-2">
                3. Total a Pagar en Formulario F29
              </span>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between items-center text-white/70">
                  <span>IVA Neto Liquidado:</span>
                  <span className="font-mono font-bold text-white">
                    {formatCLP(kpis?.f29?.netVatToPay || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-white/70">
                  <span>PPM Anticipo Renta (0.25% - Cód 115):</span>
                  <span className="font-mono font-bold text-white">
                    {formatCLP(kpis?.f29?.ppmAmount || 0)}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 mt-3">
              <span className="text-[11px] font-bold text-white/50 uppercase block">
                Monto Final a Pagar al SII (TGR):
              </span>
              <div className="text-3xl font-black text-white font-mono tracking-tight text-emerald-400 mt-1">
                {formatCLP(kpis?.f29?.totalF29ToPay || 0)}
              </div>
              <span className="text-[10px] text-white/40 block mt-1">
                Vence el día 20 del mes siguiente. Los fondos de custodia de las tiendas están 100% exentos de este pago.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de Detalle Contable de Órdenes */}
      <div className="bg-[#0E121B] border border-white/10 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-5 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white">
              Libro Diario de Transacciones
            </h2>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/10 text-white/70">
              {totalItems} transacciones
            </span>
          </div>
          <span className="text-xs text-white/50">
            Página {page} de {totalPages}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02] text-white/50 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Fecha / N° Orden</th>
                <th className="py-3 px-4">Tienda Vendedora</th>
                <th className="py-3 px-4">Cliente</th>
                <th className="py-3 px-4 text-right">Bruto Tienda</th>
                <th className="py-3 px-4 text-right">Comisión TapTrade (Neto)</th>
                <th className="py-3 px-4 text-right">IVA Débito (19%)</th>
                <th className="py-3 px-4 text-right">Comisión Total</th>
                <th className="py-3 px-4 text-right">Pasarela (Est.)</th>
                <th className="py-3 px-4 text-right">Total Webpay</th>
                <th className="py-3 px-4 text-center">Estado</th>
                <th className="py-3 px-4 text-center">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-white/40">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <IconRefresh className="w-6 h-6 animate-spin text-red" />
                      <span>Cargando transacciones contables...</span>
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-white/40">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <IconInfo className="w-6 h-6 text-white/30" />
                      <p>No se encontraron transacciones en el rango seleccionado.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((o) => {
                  const isExpanded = expandedOrderId === o.id;
                  const dateStr = new Date(o.createdAt).toLocaleDateString("es-CL", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <React.Fragment key={o.id}>
                      <tr className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-white font-mono">{o.buyOrder}</div>
                          <div className="text-[11px] text-white/40 flex items-center gap-1 mt-0.5">
                            <IconClock className="w-3 h-3" />
                            <span>{dateStr}</span>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-bold text-white">{o.storeName}</div>
                          <div className="text-[11px] text-white/40 font-mono">
                            RUT: {o.sellerRut}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="text-white font-medium">{o.buyerName}</div>
                          <div className="text-[11px] text-white/40">{o.buyerEmail}</div>
                        </td>

                        <td className="py-3 px-4 text-right font-mono font-bold text-blue-400">
                          {formatCLP(o.vendorPayout)}
                          <div className="text-[10px] text-white/40 font-normal">
                            Prod: {formatCLP(o.productsGross)} | Env: {formatCLP(o.shippingGross)}
                          </div>
                        </td>

                        <td className="py-3 px-4 text-right font-mono text-white/90">
                          {formatCLP(o.serviceFeeNet)}
                        </td>

                        <td className="py-3 px-4 text-right font-mono text-red-light font-bold">
                          {formatCLP(o.serviceFeeVat)}
                        </td>

                        <td className="py-3 px-4 text-right font-mono font-bold text-white">
                          {formatCLP(o.serviceFeeGross)}
                        </td>

                        <td className="py-3 px-4 text-right font-mono text-amber-400 font-medium">
                          {formatCLP(o.transbankFeeEstimate)}
                        </td>

                        <td className="py-3 px-4 text-right font-mono font-black text-emerald-400 text-sm">
                          {formatCLP(o.totalAmount)}
                        </td>

                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              o.status === "PAID"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : o.status === "CANCELLED"
                                ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            }`}
                          >
                            {o.status}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() =>
                              setExpandedOrderId(isExpanded ? null : o.id)
                            }
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                            title="Ver desglose tributario"
                          >
                            {isExpanded ? (
                              <IconChevronUp className="w-4 h-4" />
                            ) : (
                              <IconChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                      </tr>

                      {/* Fila Desplegable con detalle por tienda */}
                      {isExpanded && (
                        <tr className="bg-black/30 border-b border-white/10">
                          <td colSpan={11} className="p-4">
                            <div className="bg-[#141A26] rounded-xl p-4 border border-white/10 space-y-3">
                              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                                <div className="text-xs font-bold text-white/80 uppercase tracking-wider flex items-center gap-2">
                                  <IconStore className="w-4 h-4 text-blue-400" />
                                  <span>Desglose Tributario de Tiendas Involucradas ({o.vendors.length})</span>
                                </div>
                                <div className="text-xs text-white/50 font-mono">
                                  Pasarela: {o.paymentMethod} | Token: {o.paymentToken}
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {o.vendors.map((v, idx) => (
                                  <div
                                    key={idx}
                                    className="p-3 rounded-lg bg-white/5 border border-white/5 space-y-2 text-xs"
                                  >
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <div className="font-bold text-white text-sm">
                                          {v.storeName}
                                        </div>
                                        <div className="text-white/50 text-[11px]">
                                          Razón Social: {v.sellerLegalName || "No registrada"}
                                        </div>
                                        <div className="text-white/50 text-[11px] font-mono">
                                          RUT Emisor DTE: {v.sellerRut || "Sin RUT"}
                                        </div>
                                      </div>
                                      <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold">
                                        {v.deliveryStatus || "PENDIENTE"}
                                      </span>
                                    </div>

                                    <div className="pt-2 border-t border-white/5 grid grid-cols-3 gap-2 text-center">
                                      <div className="p-1.5 rounded bg-white/5">
                                        <div className="text-[10px] text-white/40">Subtotal Prod.</div>
                                        <div className="font-mono font-bold text-white">
                                          {formatCLP(v.subtotal)}
                                        </div>
                                      </div>
                                      <div className="p-1.5 rounded bg-white/5">
                                        <div className="text-[10px] text-white/40">Costo Envío</div>
                                        <div className="font-mono font-bold text-white">
                                          {formatCLP(v.shippingCost)}
                                        </div>
                                      </div>
                                      <div className="p-1.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                                        <div className="text-[10px] text-emerald-400">Abono Tienda (100%)</div>
                                        <div className="font-mono font-bold text-emerald-400">
                                          {formatCLP(v.totalPayout)}
                                        </div>
                                      </div>
                                    </div>

                                    <div className="text-[11px] text-white/50 flex items-center justify-between pt-1">
                                      <span>Base Imponible Estimada Tienda: {formatCLP(v.taxableNet)}</span>
                                      <span>IVA 19% Tienda: {formatCLP(v.vatAmount)}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              <div className="p-3 rounded-lg bg-red/5 border border-red/20 text-xs flex items-center justify-between">
                                <div className="text-white/80">
                                  <strong>Costo Financiero Transbank / Pasarela Estimado:</strong> {formatCLP(o.transbankFeeEstimate)} (con gross-up recuperado en checkout)
                                </div>
                                <div className="font-mono text-white/60">
                                  Tasa IVA aplicada: {Math.round(o.vatRate * 100)}%
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-white/10 flex items-center justify-between text-xs">
            <span className="text-white/50">
              Mostrando página {page} de {totalPages} ({totalItems} pedidos totales)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white disabled:opacity-30 disabled:pointer-events-none transition-all"
              >
                Anterior
              </button>
              <div className="px-3 py-1.5 rounded-lg bg-white/10 text-white font-bold">
                {page}
              </div>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white disabled:opacity-30 disabled:pointer-events-none transition-all"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

