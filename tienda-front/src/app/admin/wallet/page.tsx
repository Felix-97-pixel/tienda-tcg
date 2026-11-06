"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import Loader from "@/components/ui/Loader";
import { adminFetch } from "@/utils/api";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/hooks/useToast";
import {
  IconInfo,
  IconShieldCheck,
  IconReceipt,
  IconCalendar,
  IconDownload,
  IconStore,
  IconCoins,
} from "@/components/ui/Icons";

interface TaxSummaryData {
  period: string;
  periodLabel: string;
  startDate: string;
  endDate: string;
  company: {
    id: string;
    name: string;
    legalName: string;
    rut: string | null;
  } | null;
  availableStores: { id: string; name: string }[];
  selectedStoreId: string;
  totalGross: number;
  taxableNet: number;
  vatDebit: number;
  platformFeeNet: number;
  platformFeeVat: number;
  orderCount: number;
  orders: any[];
}

export default function StoreWalletPage() {
  const t = useTranslations("admin.wallet_page");
  const tCommon = useTranslations("common");
  const [history, setHistory] = useState<any>({ transactions: [], withdrawals: [], balance: 0 });
  const [loading, setLoading] = useState(true);
  const [requestAmount, setRequestAmount] = useState("");
  const [bankDetails, setBankDetails] = useState("");
  const { showToast } = useToast();

  // Estados de Resumen Tributario F29 (Opción A)
  const [taxSummary, setTaxSummary] = useState<TaxSummaryData | null>(null);
  const [loadingTax, setLoadingTax] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("current_month");
  const [selectedBranch, setSelectedBranch] = useState<string>("ALL");
  const [exportingCsv, setExportingCsv] = useState(false);

  const fetchHistory = async () => {
    try {
      const res = await adminFetch("/withdrawals/history");
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTaxSummary = useCallback(async (period: string, branch: string) => {
    setLoadingTax(true);
    try {
      const params = new URLSearchParams();
      params.set("period", period);
      if (branch && branch !== "ALL") {
        params.set("storeId", branch);
      }
      const res = await adminFetch(`/withdrawals/tax-summary?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setTaxSummary(data);
      }
    } catch (err) {
      console.error("Error al obtener resumen tributario:", err);
    } finally {
      setLoadingTax(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    fetchTaxSummary(selectedPeriod, selectedBranch);
  }, [selectedPeriod, selectedBranch, fetchTaxSummary]);

  const handleDownloadCsv = async () => {
    setExportingCsv(true);
    try {
      const params = new URLSearchParams();
      params.set("period", selectedPeriod);
      if (selectedBranch && selectedBranch !== "ALL") {
        params.set("storeId", selectedBranch);
      }
      const res = await adminFetch(`/withdrawals/tax-sales-csv?${params.toString()}`);
      if (!res.ok) throw new Error(t("csv_error"));

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const contentDisposition = res.headers.get("content-disposition");
      let filename = `libro_ventas_${selectedPeriod}.csv`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        if (match && match[1]) filename = match[1];
      }
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      showToast(t("csv_success"), "success");
    } catch (err) {
      showToast(t("csv_export_error"), "error");
    } finally {
      setExportingCsv(false);
    }
  };

  const handleRequestWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(requestAmount);
    if (!amt || amt <= 0 || amt > history.balance) {
      showToast(t("invalid_amount"), "error");
      return;
    }
    
    try {
      const res = await adminFetch("/withdrawals/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amt, bankDetails }),
      });
      if (res.ok) {
        showToast(t("withdrawal_requested_success"), "success");
        setRequestAmount("");
        fetchHistory();
      } else {
        const data = await res.json();
        showToast(data.message || t("withdrawal_request_error"), "error");
      }
    } catch {
      showToast(t("connection_error"), "error");
    }
  };

  if (loading) return <Loader text={tCommon("loading")} className="min-h-[40vh] bg-transparent py-10" />;

  return (
    <div className="space-y-6 pb-24 text-white">
      {/* Header General */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-red shadow-[0_0_8px_rgba(225,14,14,0.8)]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-red">{t("badge")}</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">{t("title")}</h1>
          <p className="text-white/40 text-xs mt-0.5">{t("subtitle")}</p>
        </div>
      </div>

      {/* Banner Informativo Tributario (Normativa SII) */}
      <div className="p-4 rounded-2xl bg-emerald-500/[0.06] border border-emerald-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <IconShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">{t("zero_commission_title")}</h4>
            <p className="text-[11px] text-white/60 mt-0.5 leading-relaxed">
              {t("zero_commission_desc")}
            </p>
          </div>
        </div>
      </div>

      {/* RESUMEN TRIBUTARIO MACRO F29 DEL MES (Opción A) */}
      <div className="bg-[#0E121B] rounded-3xl border border-white/10 p-6 shadow-2xl space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red/5 rounded-full blur-3xl pointer-events-none" />

        {/* Encabezado con Controles de Período, Sucursal y Exportación */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/5 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
              <span className="text-[11px] font-black uppercase tracking-widest text-amber-400">
                {t("f29_badge")}
              </span>
            </div>
            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              <IconReceipt className="w-5 h-5 text-amber-400 shrink-0" />
              <span>{t("f29_title")}</span>
            </h2>
            <p className="text-xs text-white/50 leading-relaxed max-w-2xl">
              {t("f29_desc")}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Presets de Período */}
            <div className="flex items-center rounded-xl bg-[#080B12] p-1 border border-white/10 text-xs">
              <button
                type="button"
                onClick={() => setSelectedPeriod("current_month")}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  selectedPeriod === "current_month"
                    ? "bg-red text-white shadow-sm"
                    : "text-white/60 hover:text-white"
                }`}
              >
                {t("period_current_month")}
              </button>
              <button
                type="button"
                onClick={() => setSelectedPeriod("previous_month")}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  selectedPeriod === "previous_month"
                    ? "bg-red text-white shadow-sm"
                    : "text-white/60 hover:text-white"
                }`}
              >
                {t("period_previous_month")}
              </button>
              <button
                type="button"
                onClick={() => setSelectedPeriod("current_year")}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  selectedPeriod === "current_year"
                    ? "bg-red text-white shadow-sm"
                    : "text-white/60 hover:text-white"
                }`}
              >
                {t("period_current_year")}
              </button>
            </div>

            {/* Selector de Sucursal si la empresa tiene más de una */}
            {taxSummary?.availableStores && taxSummary.availableStores.length > 1 && (
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="bg-[#080B12] border border-white/10 text-white rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-red"
              >
                <option value="ALL">{t("all_branches_holding")}</option>
                {taxSummary.availableStores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
            )}

            {/* Botón Descargar Libro de Ventas CSV */}
            <Button
              variant="secondary"
              onClick={handleDownloadCsv}
              disabled={exportingCsv}
              className="flex items-center gap-2 border-emerald-500/30 text-emerald-400 hover:text-emerald-300 hover:border-emerald-500/50 hover:bg-emerald-500/10 cursor-pointer"
            >
              <IconDownload className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{exportingCsv ? t("exporting_csv") : t("download_sales_ledger_csv")}</span>
            </Button>
          </div>
        </div>

        {/* Empresa y Período Activo */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-[#121622] p-3 rounded-2xl border border-white/5">
          <div className="flex items-center gap-2 text-white/80">
            <IconStore className="w-4 h-4 text-gray-400 shrink-0" />
            <span>{t("company_legal_name_label")}</span>
            <strong className="text-white">
              {taxSummary?.company?.legalName || taxSummary?.company?.name || t("my_store_default")}
            </strong>
            {taxSummary?.company?.rut && (
              <span className="font-mono text-white/60">
                (RUT: {taxSummary.company.rut})
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-white/80">
            <IconCalendar className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{t("consulted_period_label")}</span>
            <span className="font-bold text-amber-300 capitalize">
              {taxSummary?.periodLabel || t("period_current_month")}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-white/80">
              {t("orders_count_badge", { count: taxSummary?.orderCount || 0 })}
            </span>
          </div>
        </div>

        {/* Grid de KPIs Tributarios para el Formulario 29 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* KPI 1: Venta Bruta Total (100% Abono Tienda) */}
          <div className="bg-[#11141E] p-4 rounded-2xl border border-white/5 space-y-1 relative overflow-hidden">
            <span className="text-[10px] font-black uppercase tracking-wider text-white/50 block">
              {t("kpi_gross_title")}
            </span>
            <p className="text-2xl font-black text-white tracking-tight">
              ${(taxSummary?.totalGross || 0).toLocaleString("es-CL")}
            </p>
            <p className="text-[11px] text-white/40 leading-snug">
              {t("kpi_gross_desc")}
            </p>
          </div>

          {/* KPI 2: Base Imponible Neta Tienda */}
          <div className="bg-[#11141E] p-4 rounded-2xl border border-white/5 space-y-1 relative overflow-hidden">
            <span className="text-[10px] font-black uppercase tracking-wider text-white/50 block">
              {t("kpi_net_title")}
            </span>
            <p className="text-2xl font-black text-cyan-400 tracking-tight">
              ${(taxSummary?.taxableNet || 0).toLocaleString("es-CL")}
            </p>
            <p className="text-[11px] text-white/40 leading-snug">
              {t("kpi_net_desc")}
            </p>
          </div>

          {/* KPI 3: Débito Fiscal IVA 19% (F29 Código 538) */}
          <div className="bg-[#11141E] p-4 rounded-2xl border border-amber-500/30 bg-amber-500/[0.03] space-y-1 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">
                {t("kpi_vat_debit_title")}
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                {t("f29_code_538")}
              </span>
            </div>
            <p className="text-2xl font-black text-amber-400 tracking-tight">
              ${(taxSummary?.vatDebit || 0).toLocaleString("es-CL")}
            </p>
            <p className="text-[11px] text-amber-300/60 leading-snug">
              {t("kpi_vat_debit_desc")}
            </p>
          </div>

          {/* KPI 4: IVA Crédito Fiscal por Comisión TapTrade (F29 Código 520) */}
          <div className="bg-[#11141E] p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.03] space-y-1 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block">
                {t("kpi_vat_credit_title")}
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                {t("f29_code_520")}
              </span>
            </div>
            <p className="text-2xl font-black text-emerald-400 tracking-tight">
              ${(taxSummary?.platformFeeVat || 0).toLocaleString("es-CL")}
            </p>
            <p className="text-[11px] text-emerald-300/60 leading-snug">
              {t("kpi_vat_credit_desc")}
            </p>
          </div>
        </div>

        {/* Guía Explicativa para el Contador */}
        <div className="p-4 rounded-2xl bg-[#090C14] border border-white/5 space-y-2 text-xs text-white/70">
          <p className="font-bold text-white flex items-center gap-1.5 text-xs">
            <IconInfo className="w-4 h-4 text-blue-400 shrink-0" />
            <span>{t("accountant_guide_title")}</span>
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] pt-1">
            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
              <span className="font-bold text-white block">{t("guide_step1_title")}</span>
              <p className="text-white/50 leading-relaxed">
                {t("guide_step1_desc")}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
              <span className="font-bold text-amber-400 block">{t("guide_step2_title")}</span>
              <p className="text-white/50 leading-relaxed">
                {t("guide_step2_desc")}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
              <span className="font-bold text-emerald-400 block">{t("guide_step3_title")}</span>
              <p className="text-white/50 leading-relaxed">
                {t("guide_step3_desc")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tarjetas de Saldo y Retiro */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1: Saldo Disponible */}
        <div className="bg-[#0E121B] p-6 rounded-2xl border border-white/10 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-500" />
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-black tracking-widest uppercase text-white/50">{t("available_balance_title")}</h2>
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          </div>
          <p className="text-3xl font-black tracking-tight text-emerald-400">
            ${Number(history.balance || 0).toLocaleString("es-CL")} <span className="text-xs text-emerald-400/60 font-normal">CLP</span>
          </p>
          <p className="text-xs text-white/40 mt-3 leading-relaxed">
            {t("available_balance_desc")}
          </p>
        </div>

        {/* Card 2: Saldo en Custodia (Escrow) */}
        <div className="bg-[#0E121B] p-6 rounded-2xl border border-white/10 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-500/20 transition-all duration-500" />
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-black tracking-widest uppercase text-amber-400/80">{t("escrow_balance_title")}</h2>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
              {t("held_badge")}
            </span>
          </div>
          <p className="text-3xl font-black tracking-tight text-amber-400">
            ${Number(history.heldBalance || 0).toLocaleString("es-CL")} <span className="text-xs text-amber-400/60 font-normal">CLP</span>
          </p>
          <p className="text-xs text-white/40 mt-3 leading-relaxed">
            {t("escrow_balance_desc")}
          </p>
        </div>

        {/* Card 3: Formulario Retiro */}
        <div className="bg-[#0E121B] p-6 rounded-2xl border border-white/10 shadow-xl md:col-span-2 lg:col-span-1">
          <h2 className="text-sm font-bold text-white mb-4">{t("request_withdrawal_title")}</h2>
          <form onSubmit={handleRequestWithdrawal} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-1.5">{t("amount_to_withdraw_label")}</label>
              <input 
                type="number" 
                value={requestAmount}
                onChange={(e) => setRequestAmount(e.target.value)}
                className="w-full bg-[#080B12] border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/30 text-sm focus:border-red focus:ring-1 focus:ring-red/30 focus:outline-none transition-all"
                placeholder={t("amount_placeholder")}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-1.5">{t("bank_details_label")}</label>
              <input 
                type="text" 
                value={bankDetails}
                onChange={(e) => setBankDetails(e.target.value)}
                className="w-full bg-[#080B12] border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/30 text-sm focus:border-red focus:ring-1 focus:ring-red/30 focus:outline-none transition-all"
                placeholder={t("bank_details_placeholder")}
                required
              />
            </div>
            <Button type="submit" variant="primary" className="w-full">
              {t("submit_withdrawal_btn")}
            </Button>
          </form>
        </div>
      </div>

      {/* Historial de Transacciones */}
      <div className="bg-[#0E121B] rounded-2xl border border-white/10 shadow-xl overflow-hidden">
        <div className="p-5 border-b border-white/10">
          <h2 className="text-sm font-bold text-white">{t("tx_history_title")}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#090C14] border-b border-white/10 text-white/50 text-[11px] font-black uppercase tracking-wider">
                <th className="py-3 px-5">{t("col_date")}</th>
                <th className="py-3 px-5">{t("col_reference")}</th>
                <th className="py-3 px-5">{t("col_method")}</th>
                <th className="py-3 px-5 text-right">{t("col_amount")}</th>
              </tr>
            </thead>
            <tbody>
              {history.transactions.length === 0 ? (
                <tr><td colSpan={4} className="py-8 text-center text-white/40 text-sm">{t("no_recent_tx")}</td></tr>
              ) : (
                history.transactions.map((tx: any) => (
                  <tr key={tx.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-5 text-sm text-white/70">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-5 text-sm text-white font-medium">
                      {tx.type === "WITHDRAWAL" ? t("tx_type_withdrawal") : tx.reference}
                    </td>
                    <td className="py-3 px-5 text-sm">
                      {tx.paymentMethod === "MERCADOPAGO" ? (
                        <span className="bg-sky-500/10 text-sky-400 border border-sky-500/30 px-2 py-0.5 rounded-md text-xs font-bold">Mercado Pago</span>
                      ) : tx.paymentMethod === "WEBPAY" ? (
                        <span className="bg-orange-500/10 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded-md text-xs font-bold">Webpay</span>
                      ) : (
                        <span className="bg-white/5 text-white/60 border border-white/10 px-2 py-0.5 rounded-md text-xs font-bold">{tx.paymentMethod || "N/A"}</span>
                      )}
                    </td>
                    <td className={`py-3 px-5 text-right font-black text-sm ${tx.type === "WITHDRAWAL" ? "text-red" : "text-emerald-400"}`}>
                      {tx.type === "WITHDRAWAL" ? "-" : "+"}${Number(tx.amount).toLocaleString("es-CL")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Estado de Retiros */}
      <div className="bg-[#0E121B] rounded-2xl border border-white/10 shadow-xl overflow-hidden mt-6">
        <div className="p-5 border-b border-white/10">
          <h2 className="text-sm font-bold text-white">{t("withdrawals_status_title")}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#090C14] border-b border-white/10 text-white/50 text-[11px] font-black uppercase tracking-wider">
                <th className="py-3 px-5">{t("col_request_date")}</th>
                <th className="py-3 px-5">{t("col_dest_account")}</th>
                <th className="py-3 px-5">{t("col_status")}</th>
                <th className="py-3 px-5 text-right">{t("col_amount")}</th>
              </tr>
            </thead>
            <tbody>
              {history.withdrawals.length === 0 ? (
                <tr><td colSpan={4} className="py-8 text-center text-white/40 text-sm">{t("no_withdrawals_yet")}</td></tr>
              ) : (
                history.withdrawals.map((w: any) => (
                  <tr key={w.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-5 text-sm text-white/70">
                      {new Date(w.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-5 text-sm text-white font-medium truncate max-w-[200px]" title={w.bankDetails}>
                      {w.bankDetails}
                    </td>
                    <td className="py-3 px-5 text-sm">
                      {w.status === "PENDING" && <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-full text-xs font-bold">{t("status_in_progress")}</span>}
                      {w.status === "COMPLETED" && <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-xs font-bold">{t("status_completed")}</span>}
                      {w.status === "REJECTED" && <span className="bg-red/10 text-red border border-red/30 px-2.5 py-0.5 rounded-full text-xs font-bold">{t("status_rejected")}</span>}
                    </td>
                    <td className="py-3 px-5 text-right font-black text-sm text-white">
                      ${Number(w.amount).toLocaleString("es-CL")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
