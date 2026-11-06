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
      if (!res.ok) throw new Error("Error al generar archivo CSV");

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
      showToast("Libro de ventas descargado con éxito", "success");
    } catch (err) {
      showToast("Error al exportar libro de ventas", "error");
    } finally {
      setExportingCsv(false);
    }
  };

  const handleRequestWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(requestAmount);
    if (!amt || amt <= 0 || amt > history.balance) {
      showToast("Monto inválido", "error");
      return;
    }
    
    try {
      const res = await adminFetch("/withdrawals/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amt, bankDetails }),
      });
      if (res.ok) {
        showToast("Retiro solicitado con éxito", "success");
        setRequestAmount("");
        fetchHistory();
      } else {
        const data = await res.json();
        showToast(data.message || "Error al solicitar retiro", "error");
      }
    } catch {
      showToast("Error de conexión", "error");
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
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">0% Comisión por Venta • 100% de Abono para tu Tienda</h4>
            <p className="text-[11px] text-white/60 mt-0.5 leading-relaxed">
              Recibes el valor bruto íntegro de tus cartas y envíos en tu saldo. Conforme a la legislación tributaria chilena (DL 825), tu empresa declara el 19% de IVA de sus ventas en el Formulario 29.
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
                Formulario 29 SII • Contabilidad & Declaración de IVA
              </span>
            </div>
            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              <IconReceipt className="w-5 h-5 text-amber-400 shrink-0" />
              <span>Resumen Tributario F29 del Mes</span>
            </h2>
            <p className="text-xs text-white/50 leading-relaxed max-w-2xl">
              Cálculo mensual automático de tu Base Imponible Neta y Débito Fiscal para el contador de tu empresa. Conforme a las normas del SII para comercio electrónico y marketplaces.
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
                Mes Actual
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
                Mes Anterior
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
                Año 2026
              </button>
            </div>

            {/* Selector de Sucursal si la empresa tiene más de una */}
            {taxSummary?.availableStores && taxSummary.availableStores.length > 1 && (
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="bg-[#080B12] border border-white/10 text-white rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-red"
              >
                <option value="ALL">Todas las Sucursales (Holding)</option>
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
              <span>{exportingCsv ? "Exportando..." : "Descargar Libro de Ventas (CSV)"}</span>
            </Button>
          </div>
        </div>

        {/* Empresa y Período Activo */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-[#121622] p-3 rounded-2xl border border-white/5">
          <div className="flex items-center gap-2 text-white/80">
            <IconStore className="w-4 h-4 text-gray-400 shrink-0" />
            <span>Empresa / Razón Social:</span>
            <strong className="text-white">
              {taxSummary?.company?.legalName || taxSummary?.company?.name || "Mi Tienda"}
            </strong>
            {taxSummary?.company?.rut && (
              <span className="font-mono text-white/60">
                (RUT: {taxSummary.company.rut})
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-white/80">
            <IconCalendar className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Período Consultado:</span>
            <span className="font-bold text-amber-300 capitalize">
              {taxSummary?.periodLabel || "Mes Actual"}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-white/80">
              {taxSummary?.orderCount || 0} órdenes
            </span>
          </div>
        </div>

        {/* Grid de KPIs Tributarios para el Formulario 29 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* KPI 1: Venta Bruta Total (100% Abono Tienda) */}
          <div className="bg-[#11141E] p-4 rounded-2xl border border-white/5 space-y-1 relative overflow-hidden">
            <span className="text-[10px] font-black uppercase tracking-wider text-white/50 block">
              Venta Bruta Total (100% Abono)
            </span>
            <p className="text-2xl font-black text-white tracking-tight">
              ${(taxSummary?.totalGross || 0).toLocaleString("es-CL")}
            </p>
            <p className="text-[11px] text-white/40 leading-snug">
              Total recaudado por cartas y despachos abonado a tu saldo.
            </p>
          </div>

          {/* KPI 2: Base Imponible Neta Tienda */}
          <div className="bg-[#11141E] p-4 rounded-2xl border border-white/5 space-y-1 relative overflow-hidden">
            <span className="text-[10px] font-black uppercase tracking-wider text-white/50 block">
              Base Imponible Neta (Sin IVA)
            </span>
            <p className="text-2xl font-black text-cyan-400 tracking-tight">
              ${(taxSummary?.taxableNet || 0).toLocaleString("es-CL")}
            </p>
            <p className="text-[11px] text-white/40 leading-snug">
              Ingresos netos de tu negocio a registrar en la contabilidad mensual.
            </p>
          </div>

          {/* KPI 3: Débito Fiscal IVA 19% (F29 Código 538) */}
          <div className="bg-[#11141E] p-4 rounded-2xl border border-amber-500/30 bg-amber-500/[0.03] space-y-1 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">
                Débito Fiscal IVA 19%
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                F29 Cód. 538
              </span>
            </div>
            <p className="text-2xl font-black text-amber-400 tracking-tight">
              ${(taxSummary?.vatDebit || 0).toLocaleString("es-CL")}
            </p>
            <p className="text-[11px] text-amber-300/60 leading-snug">
              IVA de ventas electrónicas a pagar al SII por tu empresa este mes.
            </p>
          </div>

          {/* KPI 4: IVA Crédito Fiscal por Comisión TapTrade (F29 Código 520) */}
          <div className="bg-[#11141E] p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.03] space-y-1 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block">
                Crédito Fiscal Factura TapTrade
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                F29 Cód. 520
              </span>
            </div>
            <p className="text-2xl font-black text-emerald-400 tracking-tight">
              ${(taxSummary?.platformFeeVat || 0).toLocaleString("es-CL")}
            </p>
            <p className="text-[11px] text-emerald-300/60 leading-snug">
              IVA a tu favor por la factura de comisión (3%) emitida por TapTrade SpA.
            </p>
          </div>
        </div>

        {/* Guía Explicativa para el Contador */}
        <div className="p-4 rounded-2xl bg-[#090C14] border border-white/5 space-y-2 text-xs text-white/70">
          <p className="font-bold text-white flex items-center gap-1.5 text-xs">
            <IconInfo className="w-4 h-4 text-blue-400 shrink-0" />
            <span>Guía Rápida de Declaración F29 para tu Contador</span>
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] pt-1">
            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
              <span className="font-bold text-white block">1. Emisión de Boletas</span>
              <p className="text-white/50 leading-relaxed">
                Tu tienda emite las boletas electrónicas a los compradores finales por la <strong>Venta Bruta Total</strong> de cada pedido despachado.
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
              <span className="font-bold text-amber-400 block">2. Código 538 en el F29</span>
              <p className="text-white/50 leading-relaxed">
                El total de ventas con medios de pago electrónicos se declara en el <strong>Código 538</strong> con su respectivo <strong>Débito Fiscal (19%)</strong>.
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
              <span className="font-bold text-emerald-400 block">3. Descuento de Comisión</span>
              <p className="text-white/50 leading-relaxed">
                TapTrade te emite Factura Electrónica por su comisión (3% + IVA). Tu contador registra el <strong>IVA Crédito Fiscal (Cód. 520)</strong> para rebajar tu pago.
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
            <h2 className="text-xs font-black tracking-widest uppercase text-white/50">Saldo Disponible (Retirable)</h2>
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          </div>
          <p className="text-3xl font-black tracking-tight text-emerald-400">
            ${Number(history.balance || 0).toLocaleString("es-CL")} <span className="text-xs text-emerald-400/60 font-normal">CLP</span>
          </p>
          <p className="text-xs text-white/40 mt-3 leading-relaxed">
            Fondos de ventas despachadas con número de seguimiento ingresado. Listos para transferencia electrónica (TEF).
          </p>
        </div>

        {/* Card 2: Saldo en Custodia (Escrow) */}
        <div className="bg-[#0E121B] p-6 rounded-2xl border border-white/10 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-500/20 transition-all duration-500" />
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-black tracking-widest uppercase text-amber-400/80">Saldo en Custodia (Escrow)</h2>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
              Retenido
            </span>
          </div>
          <p className="text-3xl font-black tracking-tight text-amber-400">
            ${Number(history.heldBalance || 0).toLocaleString("es-CL")} <span className="text-xs text-amber-400/60 font-normal">CLP</span>
          </p>
          <p className="text-xs text-white/40 mt-3 leading-relaxed">
            Ventas pagadas retenidas temporalmente. Se liberan automáticamente al registrar el número de envío en <strong>Despachos & Pedidos</strong>.
          </p>
        </div>

        {/* Card 3: Formulario Retiro */}
        <div className="bg-[#0E121B] p-6 rounded-2xl border border-white/10 shadow-xl md:col-span-2 lg:col-span-1">
          <h2 className="text-sm font-bold text-white mb-4">Solicitar Retiro de Fondos</h2>
          <form onSubmit={handleRequestWithdrawal} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-1.5">Monto a Retirar</label>
              <input 
                type="number" 
                value={requestAmount}
                onChange={(e) => setRequestAmount(e.target.value)}
                className="w-full bg-[#080B12] border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/30 text-sm focus:border-red focus:ring-1 focus:ring-red/30 focus:outline-none transition-all"
                placeholder="Ej: 50000"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-1.5">Datos Bancarios (Banco, Tipo, N° Cuenta, RUT)</label>
              <input 
                type="text" 
                value={bankDetails}
                onChange={(e) => setBankDetails(e.target.value)}
                className="w-full bg-[#080B12] border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/30 text-sm focus:border-red focus:ring-1 focus:ring-red/30 focus:outline-none transition-all"
                placeholder="Ej: Banco Estado, Cuenta RUT, 19.xxx.xxx-x"
                required
              />
            </div>
            <Button type="submit" variant="primary" className="w-full">
              Enviar Solicitud
            </Button>
          </form>
        </div>
      </div>

      {/* Historial de Transacciones */}
      <div className="bg-[#0E121B] rounded-2xl border border-white/10 shadow-xl overflow-hidden">
        <div className="p-5 border-b border-white/10">
          <h2 className="text-sm font-bold text-white">Historial de Transacciones</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#090C14] border-b border-white/10 text-white/50 text-[11px] font-black uppercase tracking-wider">
                <th className="py-3 px-5">Fecha</th>
                <th className="py-3 px-5">Referencia</th>
                <th className="py-3 px-5">Método</th>
                <th className="py-3 px-5 text-right">Monto</th>
              </tr>
            </thead>
            <tbody>
              {history.transactions.length === 0 ? (
                <tr><td colSpan={4} className="py-8 text-center text-white/40 text-sm">No hay transacciones recientes</td></tr>
              ) : (
                history.transactions.map((tx: any) => (
                  <tr key={tx.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-5 text-sm text-white/70">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-5 text-sm text-white font-medium">
                      {tx.type === "WITHDRAWAL" ? "Retiro de Fondos" : tx.reference}
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
          <h2 className="text-sm font-bold text-white">Estado de Retiros Solicitados</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#090C14] border-b border-white/10 text-white/50 text-[11px] font-black uppercase tracking-wider">
                <th className="py-3 px-5">Fecha Solicitud</th>
                <th className="py-3 px-5">Cuenta Destino</th>
                <th className="py-3 px-5">Estado</th>
                <th className="py-3 px-5 text-right">Monto</th>
              </tr>
            </thead>
            <tbody>
              {history.withdrawals.length === 0 ? (
                <tr><td colSpan={4} className="py-8 text-center text-white/40 text-sm">No has solicitado retiros aún</td></tr>
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
                      {w.status === "PENDING" && <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-full text-xs font-bold">En Proceso</span>}
                      {w.status === "COMPLETED" && <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-xs font-bold">Completado</span>}
                      {w.status === "REJECTED" && <span className="bg-red/10 text-red border border-red/30 px-2.5 py-0.5 rounded-full text-xs font-bold">Rechazado</span>}
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
