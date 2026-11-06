"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";
import { adminFetch } from "@/utils/api";
import { useActiveBranch } from "@/hooks/useActiveBranch";
import {
  IconReceipt,
  IconCash,
  IconCreditCard,
  IconPos,
  IconSearch,
  IconClock,
  IconRefresh,
  IconEye,
  IconX,
  IconCheckCircle,
  IconAlertTriangle,
  IconUser,
  IconCard,
  IconBarChart,
  IconRepeat,
  IconStore,
} from "@/components/ui/Icons";

type TabType = "ALL" | "PURCHASES" | "SALES" | "SHIFTS";
type DateFilterType = "TODAY" | "WEEK" | "MONTH" | "ALL";
type PurchaseSubFilter = "ALL" | "CASH" | "STORE_CREDIT";

interface LedgerData {
  sales: any[];
  cashPurchases: any[];
  creditTransactions: any[];
  cashShifts: any[];
  analytics: {
    peakHour: string;
    peakDay: string;
    hourlyDistribution: {
      hour: number;
      label: string;
      salesCount: number;
      salesAmount: number;
      purchasesCount: number;
      purchasesAmount: number;
    }[];
    dailyDistribution: {
      dayIndex: number;
      dayName: string;
      salesCount: number;
      salesAmount: number;
      purchasesCount: number;
      purchasesAmount: number;
    }[];
  };
}

export default function AdminTransactionsPage() {
  const t = useTranslations("admin.transactions_page");
  const { activeBranch, activeBranchId } = useActiveBranch();
  const [data, setData] = useState<LedgerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("ALL");
  const [dateFilter, setDateFilter] = useState<DateFilterType>("ALL");
  const [purchaseSubFilter, setPurchaseSubFilter] = useState<PurchaseSubFilter>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Modales de inspección
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(null);
  const [selectedShift, setSelectedShift] = useState<any | null>(null);

  const fetchLedger = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch("/pos/transactions-ledger");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Error cargando libro de transacciones:", err);
    } finally {
      setLoading(false);
    }
  }, [activeBranchId]);

  useEffect(() => {
    fetchLedger();
  }, [fetchLedger]);

  // Helper para filtrar por rango de fecha
  const isWithinDateFilter = useCallback(
    (dateStr: string) => {
      if (dateFilter === "ALL") return true;
      const itemDate = new Date(dateStr);
      const now = new Date();

      if (dateFilter === "TODAY") {
        return (
          itemDate.getFullYear() === now.getFullYear() &&
          itemDate.getMonth() === now.getMonth() &&
          itemDate.getDate() === now.getDate()
        );
      }

      if (dateFilter === "WEEK") {
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return itemDate >= sevenDaysAgo;
      }

      if (dateFilter === "MONTH") {
        return (
          itemDate.getFullYear() === now.getFullYear() &&
          itemDate.getMonth() === now.getMonth()
        );
      }

      return true;
    },
    [dateFilter]
  );

  // Construir lista unificada de Compras de Cartas (Efectivo + Crédito de Tienda)
  const unifiedPurchases = useMemo(() => {
    if (!data) return [];

    const cashList = (data.cashPurchases || []).map((cp) => ({
      id: `cash-${cp.id}`,
      rawId: cp.id,
      kind: "PURCHASE_CASH" as const,
      payoutType: "CASH" as const,
      code: cp.code,
      customerName: cp.customerName || t("walk_in_customer"),
      customerEmail: cp.customerEmail || cp.customerRut || null,
      cashierName: cp.cashierName || t("default_cashier"),
      totalAmount: Number(cp.totalAmount || 0),
      createdAt: cp.createdAt,
      notes: cp.notes,
      items: (cp.itemsData || []).map((it: any) => ({
        name: it.product?.name || t("default_card"),
        imageUrl: it.product?.imageUrl || null,
        quantity: Number(it.quantity || 1),
        unitPrice: Number(it.price || 0),
        condition: it.condition || null,
        language: it.language || null,
        finish: it.finish || null,
      })),
    }));

    const creditList = (data.creditTransactions || [])
      .filter((ct) => ct.type === "BUYLIST_TRADE")
      .map((ct) => ({
        id: `sc-${ct.id}`,
        rawId: ct.id,
        kind: "PURCHASE_CREDIT" as const,
        payoutType: "STORE_CREDIT" as const,
        code: `SC-${ct.id.slice(0, 8).toUpperCase()}`,
        customerName: ct.customerName || t("registered_customer"),
        customerEmail: ct.customerEmail || null,
        cashierName: ct.reference?.replace("Trade-in POS (Cajero: ", "").replace(")", "") || "POS",
        totalAmount: Math.abs(Number(ct.amount || 0)),
        createdAt: ct.createdAt,
        notes: ct.reference,
        items: (ct.itemsData || []).map((it: any) => ({
          name: it.product?.name || t("default_card"),
          imageUrl: it.product?.imageUrl || null,
          quantity: Number(it.quantity || 1),
          unitPrice: Number(it.price || 0),
          condition: it.condition || null,
          language: it.language || null,
          finish: it.finish || null,
        })),
      }));

    return [...cashList, ...creditList].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [data, t]);

  // Ventas formateadas
  const formattedSales = useMemo(() => {
    if (!data) return [];
    return (data.sales || []).map((s) => ({
      id: `sale-${s.id}`,
      rawId: s.id,
      kind: "SALE" as const,
      code: s.buyOrder,
      customerName: s.customerName || t("walk_in_customer"),
      customerEmail: s.customerEmail || null,
      cashierName: s.cashierName || t("default_store"),
      origin: s.origin,
      paymentMethod: s.paymentMethod,
      voucherRef: s.voucherRef,
      totalAmount: Number(s.totalAmount || 0),
      createdAt: s.createdAt,
      notes: s.notes,
      items: (s.items || []).map((it: any) => ({
        name: it.name || t("default_product"),
        imageUrl: null,
        quantity: Number(it.quantity || 1),
        unitPrice: Number(it.unitPrice || 0),
        condition: null,
        language: null,
      })),
    }));
  }, [data, t]);

  // Filtrado por fecha y búsqueda
  const filteredSales = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return formattedSales.filter((s) => {
      if (!isWithinDateFilter(s.createdAt)) return false;
      if (!q) return true;
      const matchHeader =
        s.code.toLowerCase().includes(q) ||
        s.customerName.toLowerCase().includes(q) ||
        (s.customerEmail && s.customerEmail.toLowerCase().includes(q)) ||
        s.cashierName.toLowerCase().includes(q);
      const matchItems = s.items.some((it: any) => it.name.toLowerCase().includes(q));
      return matchHeader || matchItems;
    });
  }, [formattedSales, isWithinDateFilter, searchQuery]);

  const filteredPurchases = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return unifiedPurchases.filter((p) => {
      if (!isWithinDateFilter(p.createdAt)) return false;
      if (purchaseSubFilter === "CASH" && p.payoutType !== "CASH") return false;
      if (purchaseSubFilter === "STORE_CREDIT" && p.payoutType !== "STORE_CREDIT") return false;
      if (!q) return true;
      const matchHeader =
        p.code.toLowerCase().includes(q) ||
        p.customerName.toLowerCase().includes(q) ||
        (p.customerEmail && p.customerEmail.toLowerCase().includes(q)) ||
        p.cashierName.toLowerCase().includes(q);
      const matchItems = p.items.some((it: any) => it.name.toLowerCase().includes(q));
      return matchHeader || matchItems;
    });
  }, [unifiedPurchases, isWithinDateFilter, purchaseSubFilter, searchQuery]);

  // Flujo unificado (Ventas + Compras)
  const unifiedFeed = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const allPurchasesFiltered = unifiedPurchases.filter((p) => {
      if (!isWithinDateFilter(p.createdAt)) return false;
      if (!q) return true;
      return (
        p.code.toLowerCase().includes(q) ||
        p.customerName.toLowerCase().includes(q) ||
        (p.customerEmail && p.customerEmail.toLowerCase().includes(q)) ||
        p.items.some((it: any) => it.name.toLowerCase().includes(q))
      );
    });

    return [...filteredSales, ...allPurchasesFiltered].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [filteredSales, unifiedPurchases, isWithinDateFilter, searchQuery]);

  const filteredShifts = useMemo(() => {
    if (!data?.cashShifts) return [];
    const q = searchQuery.trim().toLowerCase();
    return data.cashShifts.filter((sh) => {
      if (!isWithinDateFilter(sh.openedAt)) return false;
      if (!q) return true;
      return (
        sh.cashierName.toLowerCase().includes(q) ||
        (sh.notes && sh.notes.toLowerCase().includes(q))
      );
    });
  }, [data, isWithinDateFilter, searchQuery]);

  // KPIs calculados sobre el período seleccionado
  const kpis = useMemo(() => {
    const salesTotal = filteredSales.reduce((acc, s) => acc + s.totalAmount, 0);
    const cashPurchasesList = unifiedPurchases.filter(
      (p) => isWithinDateFilter(p.createdAt) && p.payoutType === "CASH"
    );
    const creditPurchasesList = unifiedPurchases.filter(
      (p) => isWithinDateFilter(p.createdAt) && p.payoutType === "STORE_CREDIT"
    );

    const cashOutTotal = cashPurchasesList.reduce((acc, p) => acc + p.totalAmount, 0);
    const creditIssuedTotal = creditPurchasesList.reduce((acc, p) => acc + p.totalAmount, 0);

    const creditRedeemedTotal = (data?.creditTransactions || [])
      .filter((ct) => ct.type === "PURCHASE" && isWithinDateFilter(ct.createdAt))
      .reduce((acc, ct) => acc + Math.abs(Number(ct.amount || 0)), 0);

    return {
      salesTotal,
      salesCount: filteredSales.length,
      cashOutTotal,
      cashOutCount: cashPurchasesList.length,
      creditIssuedTotal,
      creditIssuedCount: creditPurchasesList.length,
      creditRedeemedTotal,
    };
  }, [filteredSales, unifiedPurchases, data, isWithinDateFilter]);

  const getPaymentBadge = (method: string, origin?: string) => {
    if (origin === "ONLINE_MARKETPLACE" || method === "ONLINE_GATEWAY") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/30">
          <IconStore className="w-3 h-3" /> {t("pay_webpay")}
        </span>
      );
    }
    switch (method) {
      case "CASH":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <IconCash className="w-3 h-3" /> {t("pay_cash")}
          </span>
        );
      case "CARD_VOUCHER":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-sky-500/10 text-sky-400 border border-sky-500/30">
            <IconCreditCard className="w-3 h-3" /> {t("pay_card_pos")}
          </span>
        );
      case "TRANSFER":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
            <IconReceipt className="w-3 h-3" /> {t("pay_transfer")}
          </span>
        );
      case "STORE_CREDIT":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-300 border border-amber-500/30">
            <IconCreditCard className="w-3 h-3" /> {t("pay_store_credit")}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/5 text-white/70 border border-white/10">
            {method}
          </span>
        );
    }
  };

  return (
    <div className="p-6 space-y-6 pb-24">
      {/* Header Principal */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-red mb-1">
            <IconReceipt className="w-3.5 h-3.5" />
            <span>{t("badge")}</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            {t("title")}
          </h1>
          <p className="text-white/50 text-xs mt-1">
            {t("subtitle")}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Selector de Rango de Fecha */}
          <div className="flex bg-[#0E121B] p-1 rounded-xl border border-white/10">
            {[
              { id: "TODAY", label: t("filter_today") },
              { id: "WEEK", label: t("filter_week") },
              { id: "MONTH", label: t("filter_month") },
              { id: "ALL", label: t("filter_all_time") },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setDateFilter(opt.id as DateFilterType)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  dateFilter === opt.id
                    ? "bg-red text-white shadow-sm"
                    : "text-white/50 hover:text-white"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <button
            onClick={fetchLedger}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white transition-colors"
          >
            <IconRefresh className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span>{t("refresh_btn")}</span>
          </button>
        </div>
      </div>

      {/* Tarjetas KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* 1. Total Ventas */}
        <div className="bg-[#0E121B] border border-white/10 rounded-2xl p-4 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-white/40">
              {t("kpi_sales_income")}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <IconPos className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-mono font-black text-emerald-400">
            +${kpis.salesTotal.toLocaleString("es-CL")}
          </div>
          <div className="text-[11px] text-white/40 mt-1">
            {kpis.salesCount === 1
              ? t("kpi_sales_registered_one", { count: kpis.salesCount })
              : t("kpi_sales_registered_other", { count: kpis.salesCount })}
          </div>
        </div>

        {/* 2. Compras en Efectivo (Egreso real) */}
        <div className="bg-[#0E121B] border border-white/10 rounded-2xl p-4 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-white/40">
              {t("kpi_cash_purchases")}
            </span>
            <div className="w-8 h-8 rounded-xl bg-red/10 border border-red/20 flex items-center justify-center text-red">
              <IconCash className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-mono font-black text-red">
            -${kpis.cashOutTotal.toLocaleString("es-CL")}
          </div>
          <div className="text-[11px] text-white/40 mt-1">
            {kpis.cashOutCount === 1
              ? t("kpi_cash_paid_one", { count: kpis.cashOutCount })
              : t("kpi_cash_paid_other", { count: kpis.cashOutCount })}
          </div>
        </div>

        {/* 3. Compras con Crédito de Tienda */}
        <div className="bg-[#0E121B] border border-white/10 rounded-2xl p-4 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-white/40">
              {t("kpi_credit_purchases")}
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <IconCreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-mono font-black text-amber-300">
            ${kpis.creditIssuedTotal.toLocaleString("es-CL")}
          </div>
          <div className="text-[11px] text-white/40 mt-1">
            {t("kpi_credit_summary", {
              count: kpis.creditIssuedCount,
              redeemed: kpis.creditRedeemedTotal.toLocaleString("es-CL"),
            })}
          </div>
        </div>

        {/* 4. Pulso de Productividad (Hora y Día Punta) */}
        <div className="bg-[#0E121B] border border-white/10 rounded-2xl p-4 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-white/40">
              {t("kpi_peak_time")}
            </span>
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <IconBarChart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-black text-white truncate">
            {data?.analytics?.peakDay || t("no_data")} · {data?.analytics?.peakHour || "--:--"}
          </div>
          <div className="text-[11px] text-white/40 mt-1">
            {t("kpi_peak_desc")}
          </div>
        </div>
      </div>

      {/* Barra de Pestañas y Buscador */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#0E121B] p-3 rounded-2xl border border-white/10">
        {/* Pestañas */}
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: "ALL", label: t("tab_all"), count: unifiedFeed.length },
            { id: "PURCHASES", label: t("tab_purchases"), count: filteredPurchases.length },
            { id: "SALES", label: t("tab_sales"), count: filteredSales.length },
            { id: "SHIFTS", label: t("tab_shifts"), count: filteredShifts.length },
          ].map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  active
                    ? "bg-gradient-to-r from-red-dark to-red text-white shadow-md shadow-red/20"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono ${
                    active ? "bg-black/30 text-white" : "bg-white/5 text-white/40"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Buscador */}
        <div className="relative w-full lg:w-80">
          <IconSearch className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("search_placeholder")}
            className="w-full bg-[#090C14] border border-white/10 focus:border-red rounded-xl pl-10 pr-8 py-2 text-xs text-white placeholder:text-white/30 outline-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
            >
              <IconX className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Sub-filtro cuando está activa la pestaña de Compras de Cartas */}
      {activeTab === "PURCHASES" && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#090C14] px-4 py-3 rounded-xl border border-white/10">
          <div className="flex items-center gap-2">
            <IconRepeat className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-white/80">
              {t("filter_by_payout_label")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {[
              { id: "ALL", label: t("sub_all_purchases") },
              { id: "CASH", label: t("sub_cash_only") },
              { id: "STORE_CREDIT", label: t("sub_credit_only") },
            ].map((sub) => (
              <button
                key={sub.id}
                onClick={() => setPurchaseSubFilter(sub.id as PurchaseSubFilter)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                  purchaseSubFilter === sub.id
                    ? "bg-white/10 border-white/30 text-white"
                    : "bg-transparent border-white/10 text-white/40 hover:text-white"
                }`}
              >
                {sub.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Contenido Principal según Pestaña */}
      <div className="bg-[#0E121B] rounded-2xl shadow-xl border border-white/10 overflow-hidden min-h-[480px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-80 gap-3">
            <div className="w-8 h-8 border-4 border-red border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-white/50 font-semibold">{t("loading_ledger")}</p>
          </div>
        ) : activeTab === "ALL" ? (
          /* ================= PESTAÑA 1: FLUJO UNIFICADO ================= */
          unifiedFeed.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center px-4">
              <IconReceipt className="w-10 h-10 text-white/20 mb-3" />
              <p className="text-white/70 font-bold text-sm">{t("empty_all_title")}</p>
              <p className="text-white/30 text-xs mt-1 max-w-md">
                {t("empty_all_desc")}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#090C14] border-b border-white/10 text-[11px] uppercase tracking-wider text-white/40 font-black">
                    <th className="px-5 py-3.5">{t("col_op_date")}</th>
                    <th className="px-5 py-3.5">{t("col_movement_type")}</th>
                    <th className="px-5 py-3.5">{t("col_client_cashier")}</th>
                    <th className="px-5 py-3.5">{t("col_items_detail")}</th>
                    <th className="px-5 py-3.5 text-right">{t("col_amount")}</th>
                    <th className="px-5 py-3.5 text-center">{t("col_action")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs">
                  {unifiedFeed.map((item) => {
                    const isSale = item.kind === "SALE";
                    const isCashPurchase = item.kind === "PURCHASE_CASH";
                    return (
                      <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="font-mono font-bold text-white">{item.code}</div>
                          <div className="text-[11px] text-white/40">
                            {new Date(item.createdAt).toLocaleString("es-CL")}
                          </div>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          {isSale ? (
                            <div className="space-y-1">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                {t("badge_product_sale")}
                              </span>
                              <div>{getPaymentBadge(item.paymentMethod, item.origin)}</div>
                            </div>
                          ) : isCashPurchase ? (
                            <div className="space-y-1">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase bg-red/15 text-red border border-red/30">
                                {t("badge_cash_purchase")}
                              </span>
                              <div className="text-[11px] text-white/40">{t("paid_with_register_cash")}</div>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase bg-amber-500/15 text-amber-300 border border-amber-500/30">
                                {t("badge_credit_purchase")}
                              </span>
                              <div className="text-[11px] text-white/40">{t("credited_to_customer")}</div>
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <div className="font-bold text-white">{item.customerName}</div>
                          {item.customerEmail && (
                            <div className="text-[11px] text-white/40">{item.customerEmail}</div>
                          )}
                          <div className="text-[10px] text-white/30 mt-0.5">
                            {t("served_by", { name: item.cashierName })}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="space-y-1 max-w-md">
                            {item.items.slice(0, 3).map((it: any, i: number) => (
                              <div key={i} className="flex items-center gap-1.5 text-white/80 truncate">
                                <span className="font-mono font-bold text-emerald-400">{it.quantity}x</span>
                                <span className="font-semibold truncate">{it.name}</span>
                                {it.condition && (
                                  <span className="px-1.5 py-0.2 rounded bg-white/5 border border-white/10 text-[10px] text-white/60">
                                    {it.condition}
                                  </span>
                                )}
                                {it.language && (
                                  <span className="text-[10px] text-white/40 uppercase">[{it.language}]</span>
                                )}
                                <span className="text-[11px] font-mono text-white/40">
                                  (${Number(it.unitPrice).toLocaleString("es-CL")} {t("each_unit")})
                                </span>
                              </div>
                            ))}
                            {item.items.length > 3 && (
                              <div className="text-[11px] text-white/40 italic">
                                {t("more_items", { count: item.items.length - 3 })}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-right whitespace-nowrap font-mono font-black text-sm">
                          {isSale ? (
                            <span className="text-emerald-400">
                              +${item.totalAmount.toLocaleString("es-CL")}
                            </span>
                          ) : isCashPurchase ? (
                            <span className="text-red">
                              -${item.totalAmount.toLocaleString("es-CL")}
                            </span>
                          ) : (
                            <span className="text-amber-300">
                              ${item.totalAmount.toLocaleString("es-CL")} SC
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-center whitespace-nowrap">
                          <button
                            onClick={() => setSelectedTransaction(item)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white transition-colors"
                          >
                            <IconEye className="w-3.5 h-3.5" />
                            <span>{t("view_detail_btn")}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        ) : activeTab === "PURCHASES" ? (
          /* ================= PESTAÑA 2: COMPRAS DE CARTAS (TRADE-IN) ================= */
          filteredPurchases.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center px-4">
              <IconCard className="w-10 h-10 text-white/20 mb-3" />
              <p className="text-white/70 font-bold text-sm">{t("empty_purchases_title")}</p>
              <p className="text-white/30 text-xs mt-1 max-w-md">
                {t("empty_purchases_desc")}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#090C14] border-b border-white/10 text-[11px] uppercase tracking-wider text-white/40 font-black">
                    <th className="px-5 py-3.5">{t("col_code_date")}</th>
                    <th className="px-5 py-3.5">{t("col_payout_mode")}</th>
                    <th className="px-5 py-3.5">{t("col_seller_client")}</th>
                    <th className="px-5 py-3.5">{t("col_acquired_cards")}</th>
                    <th className="px-5 py-3.5 text-right">{t("col_total_paid")}</th>
                    <th className="px-5 py-3.5 text-center">{t("col_action")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs">
                  {filteredPurchases.map((p) => {
                    const isCash = p.payoutType === "CASH";
                    return (
                      <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="font-mono font-bold text-white">{p.code}</div>
                          <div className="text-[11px] text-white/40">
                            {new Date(p.createdAt).toLocaleString("es-CL")}
                          </div>
                          <div className="text-[10px] text-white/30 mt-0.5">
                            {t("cashier_prefix", { name: p.cashierName })}
                          </div>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          {isCash ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-red/10 text-red border border-red/30">
                              <IconCash className="w-3.5 h-3.5" /> {t("badge_cash_mode")}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-300 border border-amber-500/30">
                              <IconCreditCard className="w-3.5 h-3.5" /> {t("badge_credit_mode")}
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <div className="font-bold text-white">{p.customerName}</div>
                          {p.customerEmail && (
                            <div className="text-[11px] text-white/40">{p.customerEmail}</div>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <div className="space-y-1.5">
                            {p.items.map((it: any, idx: number) => (
                              <div key={idx} className="flex items-center gap-2 text-white/90">
                                <span className="font-mono font-bold text-emerald-400">
                                  {it.quantity}x
                                </span>
                                <span className="font-semibold">{it.name}</span>
                                {it.condition && (
                                  <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-white/70">
                                    {it.condition}
                                  </span>
                                )}
                                {it.language && (
                                  <span className="px-1.5 py-0.5 rounded bg-white/5 text-[10px] text-white/50 uppercase">
                                    {it.language}
                                  </span>
                                )}
                                <span className="text-[11px] font-mono text-emerald-300/90 font-bold">
                                  {t("at_price_each", { price: Number(it.unitPrice || 0).toLocaleString("es-CL") })}
                                </span>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-right whitespace-nowrap font-mono font-black text-sm">
                          {isCash ? (
                            <span className="text-red">
                              -${p.totalAmount.toLocaleString("es-CL")} CLP
                            </span>
                          ) : (
                            <span className="text-amber-300">
                              ${p.totalAmount.toLocaleString("es-CL")} SC
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-center whitespace-nowrap">
                          <button
                            onClick={() => setSelectedTransaction(p)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white transition-colors"
                          >
                            <IconEye className="w-3.5 h-3.5" />
                            <span>{t("view_record_btn")}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        ) : activeTab === "SALES" ? (
          /* ================= PESTAÑA 3: VENTAS REALIZADAS ================= */
          filteredSales.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center px-4">
              <IconPos className="w-10 h-10 text-white/20 mb-3" />
              <p className="text-white/70 font-bold text-sm">{t("empty_sales_title")}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#090C14] border-b border-white/10 text-[11px] uppercase tracking-wider text-white/40 font-black">
                    <th className="px-5 py-3.5">{t("col_order_date")}</th>
                    <th className="px-5 py-3.5">{t("col_channel_payment")}</th>
                    <th className="px-5 py-3.5">{t("col_client_cashier")}</th>
                    <th className="px-5 py-3.5">{t("col_sold_products")}</th>
                    <th className="px-5 py-3.5 text-right">{t("col_total_sale")}</th>
                    <th className="px-5 py-3.5 text-center">{t("col_action")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs">
                  {filteredSales.map((s) => (
                    <tr key={s.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="font-mono font-bold text-white">{s.code}</div>
                        <div className="text-[11px] text-white/40">
                          {new Date(s.createdAt).toLocaleString("es-CL")}
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        {getPaymentBadge(s.paymentMethod, s.origin)}
                        {s.voucherRef && (
                          <div className="text-[10px] text-white/40 font-mono mt-1">
                            {t("voucher_prefix", { ref: s.voucherRef })}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-bold text-white">{s.customerName}</div>
                        {s.customerEmail && (
                          <div className="text-[11px] text-white/40">{s.customerEmail}</div>
                        )}
                        <div className="text-[10px] text-white/30 mt-0.5">
                          {t("cashier_prefix", { name: s.cashierName })}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          {s.items.map((it: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-2 text-white/80">
                              <span className="font-mono font-bold text-emerald-400">{it.quantity}x</span>
                              <span className="font-semibold">{it.name}</span>
                              <span className="text-[11px] font-mono text-white/40">
                                (${Number(it.unitPrice).toLocaleString("es-CL")} {t("each_unit")})
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right whitespace-nowrap font-mono font-black text-sm text-emerald-400">
                        +${s.totalAmount.toLocaleString("es-CL")} CLP
                      </td>
                      <td className="px-5 py-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => setSelectedTransaction(s)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white transition-colors"
                        >
                          <IconEye className="w-3.5 h-3.5" />
                          <span>{t("view_detail_btn")}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          /* ================= PESTAÑA 4: CIERRES Y TURNOS DE CAJA ================= */
          filteredShifts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center px-4">
              <IconClock className="w-10 h-10 text-white/20 mb-3" />
              <p className="text-white/70 font-bold text-sm">{t("empty_shifts_title")}</p>
              <p className="text-white/30 text-xs mt-1 max-w-md">
                {t("empty_shifts_desc")}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#090C14] border-b border-white/10 text-[11px] uppercase tracking-wider text-white/40 font-black">
                    <th className="px-5 py-3.5">{t("col_status_cashier")}</th>
                    <th className="px-5 py-3.5">{t("col_open_close")}</th>
                    <th className="px-5 py-3.5 text-right">{t("col_initial_cash")}</th>
                    <th className="px-5 py-3.5 text-right">{t("col_cash_sales")}</th>
                    <th className="px-5 py-3.5 text-right">{t("col_cash_purchases_out")}</th>
                    <th className="px-5 py-3.5 text-right">{t("col_expected_cash")}</th>
                    <th className="px-5 py-3.5 text-right">{t("col_counted_diff")}</th>
                    <th className="px-5 py-3.5 text-center">{t("col_reconciliation")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs">
                  {filteredShifts.map((sh) => {
                    const isOpen = sh.status === "OPEN";
                    const diff = sh.difference !== null ? Number(sh.difference) : null;
                    return (
                      <tr key={sh.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {isOpen ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                {t("shift_open")}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-white/10 text-white/60 border border-white/10">
                                {t("shift_closed")}
                              </span>
                            )}
                            <span className="font-bold text-white">{sh.cashierName}</span>
                          </div>
                          <div className="text-[11px] text-white/40 mt-1">
                            {t("shift_counts_summary", {
                              orders: sh.ordersCount,
                              purchases: sh.cashPurchasesCount,
                            })}
                          </div>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="text-white/80">
                            <span className="text-white/40">{t("shift_start_label")}</span>
                            {new Date(sh.openedAt).toLocaleString("es-CL")}
                          </div>
                          {sh.closedAt && (
                            <div className="text-white/60 mt-0.5">
                              <span className="text-white/40">{t("shift_close_label")}</span>
                              {new Date(sh.closedAt).toLocaleString("es-CL")}
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right font-mono text-white/80">
                          ${sh.initialCash.toLocaleString("es-CL")}
                        </td>
                        <td className="px-5 py-4 text-right font-mono text-emerald-400 font-bold">
                          +${sh.cashSalesTotal.toLocaleString("es-CL")}
                        </td>
                        <td className="px-5 py-4 text-right font-mono text-red font-bold">
                          -${sh.cashOutTotal.toLocaleString("es-CL")}
                        </td>
                        <td className="px-5 py-4 text-right font-mono font-black text-white">
                          ${sh.expectedCash.toLocaleString("es-CL")}
                        </td>
                        <td className="px-5 py-4 text-right whitespace-nowrap font-mono">
                          {isOpen ? (
                            <span className="text-white/40 italic">{t("shift_in_progress")}</span>
                          ) : (
                            <div>
                              <div className="font-bold text-white">
                                ${Number(sh.actualCash || 0).toLocaleString("es-CL")}
                              </div>
                              {diff !== null && (
                                <div
                                  className={`text-[11px] font-bold ${
                                    diff === 0
                                      ? "text-emerald-400"
                                      : diff > 0
                                      ? "text-sky-400"
                                      : "text-red"
                                  }`}
                                >
                                  {diff === 0
                                    ? t("diff_exact")
                                    : diff > 0
                                    ? t("diff_surplus", { amount: diff.toLocaleString("es-CL") })
                                    : t("diff_shortage", { amount: Math.abs(diff).toLocaleString("es-CL") })}
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-4 text-center whitespace-nowrap">
                          <button
                            onClick={() => setSelectedShift(sh)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white transition-colors"
                          >
                            <IconEye className="w-3.5 h-3.5" />
                            <span>{t("view_shift_btn")}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      {/* ================= MODAL DETALLE DE TRANSACCIÓN INDIVIDUAL ================= */}
      {selectedTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0E121B] border border-white/15 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 bg-[#090C14] border-b border-white/10">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
                  {t("modal_tx_badge")}
                </span>
                <h3 className="text-lg font-mono font-black text-white">
                  {selectedTransaction.code}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTransaction(null)}
                className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-colors"
              >
                <IconX className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-[#090C14] p-4 rounded-xl border border-white/10 text-xs">
                <div>
                  <span className="text-white/40 block text-[10px] uppercase font-bold">{t("modal_tx_datetime")}</span>
                  <span className="text-white font-semibold mt-0.5 block">
                    {new Date(selectedTransaction.createdAt).toLocaleString("es-CL")}
                  </span>
                </div>
                <div>
                  <span className="text-white/40 block text-[10px] uppercase font-bold">{t("modal_tx_client")}</span>
                  <span className="text-white font-bold mt-0.5 block">
                    {selectedTransaction.customerName}
                  </span>
                  {selectedTransaction.customerEmail && (
                    <span className="text-white/40 text-[11px] block">
                      {selectedTransaction.customerEmail}
                    </span>
                  )}
                </div>
                <div>
                  <span className="text-white/40 block text-[10px] uppercase font-bold">{t("modal_tx_operator")}</span>
                  <span className="text-white font-semibold mt-0.5 block">
                    {selectedTransaction.cashierName}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-white/50 mb-3">
                  {t("modal_tx_items_breakdown", { count: selectedTransaction.items?.length || 0 })}
                </h4>
                <div className="divide-y divide-white/5 border border-white/10 rounded-xl overflow-hidden bg-[#090C14]">
                  {(selectedTransaction.items || []).map((it: any, idx: number) => (
                    <div key={idx} className="p-3.5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        {it.imageUrl ? (
                          <img
                            src={it.imageUrl}
                            alt={it.name}
                            className="w-10 h-14 object-cover rounded border border-white/10 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-14 rounded bg-white/5 border border-white/10 flex items-center justify-center text-white/30 shrink-0">
                            <IconCard className="w-5 h-5" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="font-bold text-white text-sm truncate">{it.name}</div>
                          <div className="flex flex-wrap items-center gap-1.5 mt-1">
                            <span className="text-xs font-mono text-white/60">
                              {t("modal_tx_qty_label")} <strong className="text-white">{it.quantity}</strong>
                            </span>
                            {it.condition && (
                              <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-white/70">
                                {it.condition}
                              </span>
                            )}
                            {it.language && (
                              <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-white/50 uppercase">
                                {it.language}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0 font-mono">
                        <div className="text-xs text-white/50">
                          ${Number(it.unitPrice || 0).toLocaleString("es-CL")} {t("each_unit")}
                        </div>
                        <div className="text-sm font-black text-white mt-0.5">
                          ${(Number(it.unitPrice || 0) * Number(it.quantity || 1)).toLocaleString("es-CL")}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedTransaction.notes && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
                  <strong className="uppercase text-[10px] tracking-wider block text-amber-400 mb-0.5">
                    {t("modal_tx_notes_label")}
                  </strong>
                  {selectedTransaction.notes}
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-white/10">
                <span className="text-xs font-black uppercase tracking-wider text-white/50">
                  {t("modal_tx_total_label")}
                </span>
                <span className="text-xl font-mono font-black text-white">
                  ${Number(selectedTransaction.totalAmount || 0).toLocaleString("es-CL")} CLP
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL DETALLE DE TURNO / ARQUEO DE CAJA ================= */}
      {selectedShift && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0E121B] border border-white/15 rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 bg-[#090C14] border-b border-white/10">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                  {t("modal_shift_badge")}
                </span>
                <h3 className="text-lg font-black text-white">
                  {t("modal_shift_title", {
                    name: selectedShift.cashierName,
                    status: selectedShift.status === "OPEN" ? t("shift_open") : t("shift_closed"),
                  })}
                </h3>
              </div>
              <button
                onClick={() => setSelectedShift(null)}
                className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-colors"
              >
                <IconX className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              {/* Resumen numérico del turno */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[#090C14] p-3.5 rounded-xl border border-white/10">
                  <span className="text-[10px] font-bold uppercase text-white/40 block">{t("col_initial_cash")}</span>
                  <span className="text-base font-mono font-black text-white mt-1 block">
                    ${selectedShift.initialCash.toLocaleString("es-CL")}
                  </span>
                </div>
                <div className="bg-[#090C14] p-3.5 rounded-xl border border-white/10">
                  <span className="text-[10px] font-bold uppercase text-emerald-400/80 block">{t("col_cash_sales")}</span>
                  <span className="text-base font-mono font-black text-emerald-400 mt-1 block">
                    +${selectedShift.cashSalesTotal.toLocaleString("es-CL")}
                  </span>
                </div>
                <div className="bg-[#090C14] p-3.5 rounded-xl border border-white/10">
                  <span className="text-[10px] font-bold uppercase text-red/80 block">{t("col_cash_purchases_out")}</span>
                  <span className="text-base font-mono font-black text-red mt-1 block">
                    -${selectedShift.cashOutTotal.toLocaleString("es-CL")}
                  </span>
                </div>
                <div className="bg-[#090C14] p-3.5 rounded-xl border border-white/10">
                  <span className="text-[10px] font-bold uppercase text-sky-400/80 block">{t("col_expected_cash")}</span>
                  <span className="text-base font-mono font-black text-white mt-1 block">
                    ${selectedShift.expectedCash.toLocaleString("es-CL")}
                  </span>
                </div>
              </div>

              {/* Otros medios de pago del turno */}
              <div className="grid grid-cols-3 gap-3 bg-[#090C14] p-3.5 rounded-xl border border-white/10 text-xs">
                <div>
                  <span className="text-white/40 block text-[10px] uppercase font-bold">{t("modal_shift_card_pos")}</span>
                  <span className="font-mono font-bold text-white mt-0.5 block">
                    ${selectedShift.cardTotal.toLocaleString("es-CL")}
                  </span>
                </div>
                <div>
                  <span className="text-white/40 block text-[10px] uppercase font-bold">{t("modal_shift_transfers")}</span>
                  <span className="font-mono font-bold text-white mt-0.5 block">
                    ${selectedShift.transferTotal.toLocaleString("es-CL")}
                  </span>
                </div>
                <div>
                  <span className="text-white/40 block text-[10px] uppercase font-bold">{t("modal_shift_credit_redeemed")}</span>
                  <span className="font-mono font-bold text-amber-300 mt-0.5 block">
                    ${selectedShift.creditTotal.toLocaleString("es-CL")}
                  </span>
                </div>
              </div>

              {/* Compras de cartas pagadas con efectivo en este turno */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-red mb-2.5">
                  {t("modal_shift_cash_purchases_title", { count: selectedShift.cashPurchases?.length || 0 })}
                </h4>
                {(!selectedShift.cashPurchases || selectedShift.cashPurchases.length === 0) ? (
                  <p className="text-xs text-white/30 italic bg-[#090C14] p-3 rounded-xl border border-white/5">
                    {t("modal_shift_no_cash_purchases")}
                  </p>
                ) : (
                  <div className="divide-y divide-white/5 border border-white/10 rounded-xl overflow-hidden bg-[#090C14] text-xs">
                    {selectedShift.cashPurchases.map((cp: any) => (
                      <div key={cp.id} className="p-3 flex items-center justify-between gap-4">
                        <div>
                          <div className="font-mono font-bold text-white">
                            {cp.code} · <span className="text-white/60 font-sans">{cp.customerName}</span>
                          </div>
                          <div className="text-[11px] text-white/50 mt-0.5">
                            {(cp.itemsData || []).map((it: any, i: number) => (
                              <span key={i} className="mr-2">
                                {it.quantity}x {it.product?.name || t("default_card")} (${Number(it.price || 0).toLocaleString("es-CL")})
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="font-mono font-black text-red whitespace-nowrap">
                          -${Number(cp.totalAmount || 0).toLocaleString("es-CL")}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Ventas realizadas en este turno */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-emerald-400 mb-2.5">
                  {t("modal_shift_sales_title", { count: selectedShift.orders?.length || 0 })}
                </h4>
                {(!selectedShift.orders || selectedShift.orders.length === 0) ? (
                  <p className="text-xs text-white/30 italic bg-[#090C14] p-3 rounded-xl border border-white/5">
                    {t("modal_shift_no_sales")}
                  </p>
                ) : (
                  <div className="divide-y divide-white/5 border border-white/10 rounded-xl overflow-hidden bg-[#090C14] text-xs">
                    {selectedShift.orders.map((ord: any) => (
                      <div key={ord.id} className="p-3 flex items-center justify-between gap-4">
                        <div>
                          <div className="font-mono font-bold text-white">
                            {ord.buyOrder} · <span className="text-white/60 font-sans">{ord.customerName}</span>
                          </div>
                          <div className="text-[11px] text-white/50 mt-0.5">
                            {(ord.items || []).map((it: any, i: number) => (
                              <span key={i} className="mr-2">
                                {it.quantity}x {it.name}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="text-right whitespace-nowrap">
                          <div className="font-mono font-black text-emerald-400">
                            +${Number(ord.totalAmount || 0).toLocaleString("es-CL")}
                          </div>
                          <div className="text-[10px] text-white/40 uppercase">{ord.paymentMethod}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

