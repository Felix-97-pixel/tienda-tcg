"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
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
  IconCreditCard,
  IconCheck,
  IconX,
  IconAlertTriangle,
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
  const [history, setHistory] = useState<any>({
    transactions: [],
    withdrawals: [],
    availableOrdersForSettlement: [],
    company: null,
    balance: 0,
    heldBalance: 0,
  });
  const [loading, setLoading] = useState(true);
  const [requestAmount, setRequestAmount] = useState("");
  const [bankDetails, setBankDetails] = useState("");
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [storeDteType, setStoreDteType] = useState("ACTA_RENDICION_MANDATO");
  const [storeDteFolio, setStoreDteFolio] = useState("");
  const [storeDteUrl, setStoreDteUrl] = useState("");
  const { showToast } = useToast();

  // Modal / Panel de Ficha Tributaria SII y Cuenta Bancaria Corporativa
  const [showTaxBankModal, setShowTaxBankModal] = useState(false);
  const [savingTaxBank, setSavingTaxBank] = useState(false);
  const [taxBankForm, setTaxBankForm] = useState({
    rut: "",
    legalName: "",
    fantasyName: "",
    taxActivity: "",
    taxAddress: "",
    taxEmail: "",
    taxClassification: "VAT_TAXABLE",
    siiActivityStarted: false,
    bankName: "",
    bankAccountType: "Cuenta Corriente",
    bankAccountNumber: "",
    bankHolderRut: "",
    bankHolderName: "",
    bankEmail: "",
  });

  // Estados de Resumen Tributario F29 (Opción A)
  const [taxSummary, setTaxSummary] = useState<TaxSummaryData | null>(null);
  const [loadingTax, setLoadingTax] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("current_month");
  const [selectedBranch, setSelectedBranch] = useState<string>("ALL");
  const [exportingCsv, setExportingCsv] = useState(false);

  // Estado para adjuntar DTE en una liquidación pendiente
  const [editingDteId, setEditingDteId] = useState<string | null>(null);
  const [inlineDteFolio, setInlineDteFolio] = useState("");

  const fetchHistory = useCallback(async () => {
    try {
      const res = await adminFetch("/withdrawals/history");
      if (res.ok) {
        const data = await res.json();
        setHistory(data);

        const availableOrders = data.availableOrdersForSettlement || [];
        setSelectedOrderIds(availableOrders.map((o: any) => o.id));

        if (data.company) {
          const c = data.company;
          setTaxBankForm({
            rut: c.rut || "",
            legalName: c.legalName || c.name || "",
            fantasyName: c.fantasyName || c.name || "",
            taxActivity: c.taxActivity || "",
            taxAddress: c.taxAddress || "",
            taxEmail: c.taxEmail || "",
            taxClassification: c.taxClassification || "VAT_TAXABLE",
            siiActivityStarted: Boolean(c.siiActivityStarted),
            bankName: c.bankName || "",
            bankAccountType: c.bankAccountType || "Cuenta Corriente",
            bankAccountNumber: c.bankAccountNumber || "",
            bankHolderRut: c.bankHolderRut || c.rut || "",
            bankHolderName: c.bankHolderName || c.legalName || c.name || "",
            bankEmail: c.bankEmail || c.taxEmail || "",
          });

          if (c.bankName && c.bankAccountNumber) {
            setBankDetails(
              `${c.bankName} • ${c.bankAccountType || "Cuenta"} N° ${c.bankAccountNumber} • RUT ${c.bankHolderRut || c.rut || ""}`
            );
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

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
  }, [fetchHistory]);

  useEffect(() => {
    fetchTaxSummary(selectedPeriod, selectedBranch);
  }, [selectedPeriod, selectedBranch, fetchTaxSummary]);

  const availableOrders: any[] = history.availableOrdersForSettlement || [];

  const batchSummary = useMemo(() => {
    const chosen = availableOrders.filter((o) => selectedOrderIds.includes(o.id));
    let gross = 0;
    let commission = 0;
    let netPayout = 0;
    for (const o of chosen) {
      const g = Math.round(Number(o.grossAmount || 0));
      const c = Math.round(Number(o.sellerCommissionGross || 0));
      const p =
        Number(o.sellerNetPayout || 0) > 0
          ? Math.round(Number(o.sellerNetPayout))
          : Math.max(0, g - c);
      gross += g;
      commission += c;
      netPayout += p;
    }
    return { count: chosen.length, gross, commission, netPayout };
  }, [availableOrders, selectedOrderIds]);

  const effectiveCommissionRate = useMemo(() => {
    const c = history.company;
    if (!c) return 0;
    if (c.customCommissionRate !== null && c.customCommissionRate !== undefined) {
      return Number(c.customCommissionRate);
    }
    if (c.plan?.commissionRate !== null && c.plan?.commissionRate !== undefined) {
      return Number(c.plan.commissionRate);
    }
    return 0;
  }, [history.company]);

  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrderIds((prev) =>
      prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
    );
  };

  const handleSaveTaxBankProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingTaxBank(true);
    try {
      const res = await adminFetch("/stores/me/company-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taxBankForm),
      });
      if (res.ok) {
        showToast(t("tax_bank_saved_ok"), "success");
        setShowTaxBankModal(false);
        fetchHistory();
        fetchTaxSummary(selectedPeriod, selectedBranch);
      } else {
        const err = await res.json();
        showToast(err.message || t("tax_bank_save_err"), "error");
      }
    } catch {
      showToast(t("connection_error"), "error");
    } finally {
      setSavingTaxBank(false);
    }
  };

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
    } catch {
      showToast(t("csv_export_error"), "error");
    } finally {
      setExportingCsv(false);
    }
  };

  const handleRequestWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    const useBatch = availableOrders.length > 0 && selectedOrderIds.length > 0;
    const amt = useBatch ? batchSummary.netPayout : Number(requestAmount);

    if (!amt || amt <= 0 || amt > Number(history.balance || 0)) {
      showToast(t("invalid_amount"), "error");
      return;
    }

    try {
      const res = await adminFetch("/withdrawals/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amt,
          bankDetails,
          vendorOrderIds: useBatch ? selectedOrderIds : undefined,
          storeDteType: storeDteFolio ? storeDteType : undefined,
          storeDteFolio: storeDteFolio || undefined,
          storeDteUrl: storeDteUrl || undefined,
        }),
      });
      if (res.ok) {
        showToast(t("withdrawal_requested_success"), "success");
        setRequestAmount("");
        setStoreDteFolio("");
        setStoreDteUrl("");
        fetchHistory();
      } else {
        const data = await res.json();
        showToast(data.message || t("withdrawal_request_error"), "error");
      }
    } catch {
      showToast(t("connection_error"), "error");
    }
  };

  const handleUpdateDteBacking = async (withdrawalId: string) => {
    if (!inlineDteFolio.trim()) return;
    try {
      const res = await adminFetch(`/withdrawals/${withdrawalId}/store-dte`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeDteType: "ACTA_RENDICION_MANDATO",
          storeDteFolio: inlineDteFolio.trim(),
        }),
      });
      if (res.ok) {
        showToast(t("dte_updated_ok"), "success");
        setEditingDteId(null);
        setInlineDteFolio("");
        fetchHistory();
      } else {
        const data = await res.json();
        showToast(data.message || t("withdrawal_request_error"), "error");
      }
    } catch {
      showToast(t("connection_error"), "error");
    }
  };

  const renderLedgerTypeBadge = (type: string) => {
    switch (type) {
      case "SALE":
        return (
          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            {t("tx_type_sale")}
          </span>
        );
      case "ESCROW_RELEASE":
        return (
          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            {t("tx_type_escrow_release")}
          </span>
        );
      case "COMMISSION":
        return (
          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/30">
            {t("tx_type_commission")}
          </span>
        );
      case "WITHDRAWAL":
        return (
          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/30">
            {t("tx_type_withdrawal")}
          </span>
        );
      case "WITHDRAWAL_REVERSAL":
        return (
          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
            {t("tx_type_reversal")}
          </span>
        );
      case "REFUND":
        return (
          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-red/10 text-red border border-red/30">
            {t("tx_type_refund")}
          </span>
        );
      case "CHARGEBACK":
        return (
          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-red/20 text-red border border-red/40">
            {t("tx_type_chargeback")}
          </span>
        );
      case "ADJUSTMENT":
        return (
          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-white/10 text-white/80 border border-white/20">
            {t("tx_type_adjustment")}
          </span>
        );
      default:
        return <span className="text-xs text-white/70">{type}</span>;
    }
  };

  if (loading) return <Loader text={tCommon("loading")} className="min-h-[40vh] bg-transparent py-10" />;

  const verificationStatus = history.company?.verificationStatus || "ENABLED";

  return (
    <div className="space-y-6 pb-24 text-white">
      {/* Header General + Botón Configuración Tributaria y Bancaria */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-red shadow-[0_0_8px_rgba(225,14,14,0.8)]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-red">{t("badge")}</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">{t("title")}</h1>
          <p className="text-white/40 text-xs mt-0.5">{t("subtitle")}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {verificationStatus === "ENABLED" && history.company?.siiActivityStarted ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
              <IconShieldCheck className="w-4 h-4" />
              <span>{t("sii_status_enabled")}</span>
            </span>
          ) : verificationStatus === "SUSPENDED" || verificationStatus === "BLOCKED" ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red/10 border border-red/30 text-red text-xs font-bold">
              <IconAlertTriangle className="w-4 h-4" />
              <span>{t("sii_status_suspended")}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
              <IconAlertTriangle className="w-4 h-4" />
              <span>{t("sii_status_pending")}</span>
            </span>
          )}

          <Button
            variant="secondary"
            onClick={() => setShowTaxBankModal((prev) => !prev)}
            className="flex items-center gap-2 border-white/15 text-white hover:border-red/50 text-xs"
          >
            <IconCreditCard className="w-4 h-4 text-red" />
            <span>{t("btn_config_tax_bank")}</span>
          </Button>
        </div>
      </div>

      {/* Panel Desplegable: Antecedentes Tributarios SII y Cuenta Bancaria Corporativa */}
      {showTaxBankModal && (
        <div className="bg-[#0E121B] rounded-3xl border border-red/30 p-6 shadow-2xl space-y-5">
          <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <IconShieldCheck className="w-5 h-5 text-red" />
                <span>{t("tax_bank_modal_title")}</span>
              </h2>
              <p className="text-xs text-white/50 mt-1">{t("tax_bank_modal_desc")}</p>
            </div>
            <button
              type="button"
              onClick={() => setShowTaxBankModal(false)}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white"
            >
              <IconX className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSaveTaxBankProfile} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-white/60 mb-1">
                  {t("field_rut")}
                </label>
                <input
                  type="text"
                  value={taxBankForm.rut}
                  onChange={(e) => setTaxBankForm({ ...taxBankForm, rut: e.target.value })}
                  placeholder="76.123.456-0"
                  required
                  className="w-full bg-[#080B12] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white font-mono focus:border-red focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-white/60 mb-1">
                  {t("field_legal_name")}
                </label>
                <input
                  type="text"
                  value={taxBankForm.legalName}
                  onChange={(e) => setTaxBankForm({ ...taxBankForm, legalName: e.target.value })}
                  required
                  className="w-full bg-[#080B12] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:border-red focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-white/60 mb-1">
                  {t("field_fantasy_name")}
                </label>
                <input
                  type="text"
                  value={taxBankForm.fantasyName}
                  onChange={(e) => setTaxBankForm({ ...taxBankForm, fantasyName: e.target.value })}
                  className="w-full bg-[#080B12] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:border-red focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-white/60 mb-1">
                  {t("field_tax_activity")}
                </label>
                <input
                  type="text"
                  value={taxBankForm.taxActivity}
                  onChange={(e) => setTaxBankForm({ ...taxBankForm, taxActivity: e.target.value })}
                  required
                  className="w-full bg-[#080B12] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:border-red focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-white/60 mb-1">
                  {t("field_tax_address")}
                </label>
                <input
                  type="text"
                  value={taxBankForm.taxAddress}
                  onChange={(e) => setTaxBankForm({ ...taxBankForm, taxAddress: e.target.value })}
                  required
                  className="w-full bg-[#080B12] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:border-red focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-white/60 mb-1">
                  {t("field_tax_email")}
                </label>
                <input
                  type="email"
                  value={taxBankForm.taxEmail}
                  onChange={(e) => setTaxBankForm({ ...taxBankForm, taxEmail: e.target.value })}
                  className="w-full bg-[#080B12] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:border-red focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-white/60 mb-1">
                  {t("field_tax_classification")}
                </label>
                <select
                  value={taxBankForm.taxClassification}
                  onChange={(e) => setTaxBankForm({ ...taxBankForm, taxClassification: e.target.value })}
                  className="w-full bg-[#080B12] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:border-red focus:outline-none"
                >
                  <option value="VAT_TAXABLE">{t("tax_class_vat_taxable")}</option>
                  <option value="VAT_EXEMPT">{t("tax_class_vat_exempt")}</option>
                </select>
              </div>
              <div className="sm:col-span-2 flex items-center pt-5">
                <label className="inline-flex items-center gap-2.5 cursor-pointer text-xs text-white/90 font-semibold">
                  <input
                    type="checkbox"
                    checked={taxBankForm.siiActivityStarted}
                    onChange={(e) => setTaxBankForm({ ...taxBankForm, siiActivityStarted: e.target.checked })}
                    className="w-4 h-4 rounded accent-red"
                  />
                  <span>{t("field_sii_activity_started")}</span>
                </label>
              </div>
            </div>

            <div className="border-t border-white/10 pt-4">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400">
                  {t("section_bank_account")}
                </h3>
                {history.company?.bankUpdatedAt && (
                  <span className="text-[11px] text-white/40 font-mono">
                    {t("bank_updated_at_label")} {new Date(history.company.bankUpdatedAt).toLocaleString("es-CL")}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-white/60 mb-1">
                    {t("field_bank_name")}
                  </label>
                  <input
                    type="text"
                    value={taxBankForm.bankName}
                    onChange={(e) => setTaxBankForm({ ...taxBankForm, bankName: e.target.value })}
                    placeholder="Banco de Chile / Santander / Estado..."
                    required
                    className="w-full bg-[#080B12] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:border-red focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-white/60 mb-1">
                    {t("field_bank_type")}
                  </label>
                  <select
                    value={taxBankForm.bankAccountType}
                    onChange={(e) => setTaxBankForm({ ...taxBankForm, bankAccountType: e.target.value })}
                    className="w-full bg-[#080B12] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:border-red focus:outline-none"
                  >
                    <option value="Cuenta Corriente">{t("bank_type_checking")}</option>
                    <option value="Cuenta Vista / RUT">{t("bank_type_vista")}</option>
                    <option value="Cuenta de Ahorro">{t("bank_type_savings")}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-white/60 mb-1">
                    {t("field_bank_number")}
                  </label>
                  <input
                    type="text"
                    value={taxBankForm.bankAccountNumber}
                    onChange={(e) => setTaxBankForm({ ...taxBankForm, bankAccountNumber: e.target.value })}
                    required
                    className="w-full bg-[#080B12] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white font-mono focus:border-red focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-white/60 mb-1">
                    {t("field_bank_holder_rut")}
                  </label>
                  <input
                    type="text"
                    value={taxBankForm.bankHolderRut}
                    onChange={(e) => setTaxBankForm({ ...taxBankForm, bankHolderRut: e.target.value })}
                    required
                    className="w-full bg-[#080B12] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white font-mono focus:border-red focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-white/60 mb-1">
                    {t("field_bank_holder_name")}
                  </label>
                  <input
                    type="text"
                    value={taxBankForm.bankHolderName}
                    onChange={(e) => setTaxBankForm({ ...taxBankForm, bankHolderName: e.target.value })}
                    required
                    className="w-full bg-[#080B12] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:border-red focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-white/60 mb-1">
                    {t("field_bank_email")}
                  </label>
                  <input
                    type="email"
                    value={taxBankForm.bankEmail}
                    onChange={(e) => setTaxBankForm({ ...taxBankForm, bankEmail: e.target.value })}
                    className="w-full bg-[#080B12] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:border-red focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="submit" variant="primary" disabled={savingTaxBank}>
                {savingTaxBank ? t("saving_tax_bank") : t("btn_save_tax_bank")}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Banner Informativo Tributario y Modelo de Comisión (Normativa SII) */}
      <div className="p-4 rounded-2xl bg-emerald-500/[0.06] border border-emerald-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <IconShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              {effectiveCommissionRate > 0
                ? t("commission_hybrid_title", { rate: effectiveCommissionRate })
                : t("zero_commission_title")}
            </h4>
            <p className="text-[11px] text-white/60 mt-0.5 leading-relaxed">
              {effectiveCommissionRate > 0
                ? t("commission_hybrid_desc", { rate: effectiveCommissionRate })
                : t("zero_commission_desc")}
            </p>
          </div>
        </div>
      </div>

      {/* RESUMEN TRIBUTARIO MACRO F29 DEL MES */}
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
            <p className="text-xs text-white/50 leading-relaxed max-w-2xl">{t("f29_desc")}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
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

            <Button
              variant="secondary"
              onClick={handleDownloadCsv}
              disabled={exportingCsv || loadingTax}
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
              <span className="font-mono text-white/60">(RUT: {taxSummary.company.rut})</span>
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
          <div className="bg-[#11141E] p-4 rounded-2xl border border-white/5 space-y-1 relative overflow-hidden">
            <span className="text-[10px] font-black uppercase tracking-wider text-white/50 block">
              {t("kpi_gross_title")}
            </span>
            <p className="text-2xl font-black text-white tracking-tight">
              ${(taxSummary?.totalGross || 0).toLocaleString("es-CL")}
            </p>
            <p className="text-[11px] text-white/40 leading-snug">{t("kpi_gross_desc")}</p>
          </div>

          <div className="bg-[#11141E] p-4 rounded-2xl border border-white/5 space-y-1 relative overflow-hidden">
            <span className="text-[10px] font-black uppercase tracking-wider text-white/50 block">
              {t("kpi_net_title")}
            </span>
            <p className="text-2xl font-black text-cyan-400 tracking-tight">
              ${(taxSummary?.taxableNet || 0).toLocaleString("es-CL")}
            </p>
            <p className="text-[11px] text-white/40 leading-snug">{t("kpi_net_desc")}</p>
          </div>

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
            <p className="text-[11px] text-amber-300/60 leading-snug">{t("kpi_vat_debit_desc")}</p>
          </div>

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
            <p className="text-[11px] text-emerald-300/60 leading-snug">{t("kpi_vat_credit_desc")}</p>
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
              <p className="text-white/50 leading-relaxed">{t("guide_step1_desc")}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
              <span className="font-bold text-amber-400 block">{t("guide_step2_title")}</span>
              <p className="text-white/50 leading-relaxed">{t("guide_step2_desc")}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
              <span className="font-bold text-emerald-400 block">{t("guide_step3_title")}</span>
              <p className="text-white/50 leading-relaxed">{t("guide_step3_desc")}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tarjetas de Saldo Reconstruido desde Ledger y Solicitud de Liquidación por Lotes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          {/* Card 1: Saldo Disponible */}
          <div className="bg-[#0E121B] p-6 rounded-2xl border border-white/10 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-500" />
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-black tracking-widest uppercase text-white/50">
                {t("available_balance_title")}
              </h2>
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            </div>
            <p className="text-3xl font-black tracking-tight text-emerald-400">
              ${Number(history.balance || 0).toLocaleString("es-CL")}{" "}
              <span className="text-xs text-emerald-400/60 font-normal">CLP</span>
            </p>
            <p className="text-xs text-white/40 mt-3 leading-relaxed">{t("available_balance_desc")}</p>
          </div>

          {/* Card 2: Saldo en Custodia (Escrow) */}
          <div className="bg-[#0E121B] p-6 rounded-2xl border border-white/10 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-500/20 transition-all duration-500" />
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-black tracking-widest uppercase text-amber-400/80">
                {t("escrow_balance_title")}
              </h2>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                {t("held_badge")}
              </span>
            </div>
            <p className="text-3xl font-black tracking-tight text-amber-400">
              ${Number(history.heldBalance || 0).toLocaleString("es-CL")}{" "}
              <span className="text-xs text-amber-400/60 font-normal">CLP</span>
            </p>
            <p className="text-xs text-white/40 mt-3 leading-relaxed">{t("escrow_balance_desc")}</p>
          </div>
        </div>

        {/* Card 3: Liquidación por Lote de Órdenes + Respaldo DTE / Mandato */}
        <div className="bg-[#0E121B] p-6 rounded-2xl border border-white/10 shadow-xl lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h2 className="text-sm font-black text-white uppercase tracking-wider">
              {t("request_withdrawal_title")}
            </h2>
            {availableOrders.length > 0 && (
              <button
                type="button"
                onClick={() =>
                  setSelectedOrderIds(
                    selectedOrderIds.length === availableOrders.length
                      ? []
                      : availableOrders.map((o) => o.id)
                  )
                }
                className="text-xs font-bold text-red hover:underline"
              >
                {selectedOrderIds.length === availableOrders.length
                  ? t("deselect_all_orders")
                  : t("select_all_orders")}
              </button>
            )}
          </div>

          <form onSubmit={handleRequestWithdrawal} className="space-y-4">
            {/* Selector de Sub-órdenes Disponibles para Liquidar */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-white/60">
                {t("batch_orders_title", { count: availableOrders.length })}
              </label>
              {availableOrders.length === 0 ? (
                <p className="text-xs text-white/40 bg-[#080B12] p-3 rounded-xl border border-white/5">
                  {t("no_available_orders_batch")}
                </p>
              ) : (
                <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1">
                  {availableOrders.map((vo: any) => {
                    const checked = selectedOrderIds.includes(vo.id);
                    const gross = Math.round(Number(vo.grossAmount || 0));
                    const comm = Math.round(Number(vo.sellerCommissionGross || 0));
                    const net =
                      Number(vo.sellerNetPayout || 0) > 0
                        ? Math.round(Number(vo.sellerNetPayout))
                        : Math.max(0, gross - comm);
                    return (
                      <label
                        key={vo.id}
                        className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                          checked
                            ? "bg-emerald-500/[0.06] border-emerald-500/40 text-white"
                            : "bg-[#080B12] border-white/5 text-white/60"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleOrderSelection(vo.id)}
                            className="w-3.5 h-3.5 accent-emerald-400"
                          />
                          <span className="font-mono font-bold">
                            #{vo.order?.buyOrder || vo.id.slice(0, 8)}
                          </span>
                          {vo.trackingNumber && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-white/50 font-mono">
                              Track: {vo.trackingNumber}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 font-mono">
                          <span className="text-white/50">${gross.toLocaleString("es-CL")}</span>
                          {comm > 0 && (
                            <span className="text-amber-400">-${comm.toLocaleString("es-CL")}</span>
                          )}
                          <span className="font-black text-emerald-400">
                            ${net.toLocaleString("es-CL")}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Desglose Financiero Automático del Lote */}
            {availableOrders.length > 0 && selectedOrderIds.length > 0 ? (
              <div className="p-3.5 rounded-xl bg-[#080B12] border border-emerald-500/20 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-white/60">
                  <span>{t("breakdown_gross_sales")}</span>
                  <span>${batchSummary.gross.toLocaleString("es-CL")} CLP</span>
                </div>
                <div className="flex justify-between text-amber-400">
                  <span>{t("breakdown_seller_commission")}</span>
                  <span>-${batchSummary.commission.toLocaleString("es-CL")} CLP</span>
                </div>
                <div className="flex justify-between text-sm font-black text-emerald-400 pt-1.5 border-t border-white/10">
                  <span>{t("breakdown_net_payout")}</span>
                  <span>${batchSummary.netPayout.toLocaleString("es-CL")} CLP</span>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-1.5">
                  {t("amount_to_withdraw_label")}
                </label>
                <input
                  type="number"
                  value={requestAmount}
                  onChange={(e) => setRequestAmount(e.target.value)}
                  className="w-full bg-[#080B12] border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/30 text-sm focus:border-red focus:outline-none"
                  placeholder={t("amount_placeholder")}
                />
              </div>
            )}

            {/* Respaldo Tributario DTE / Acta de Rendición de Mandato */}
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 block">
                {t("dte_backing_section")}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-white/50 mb-1">
                    {t("field_store_dte_type")}
                  </label>
                  <select
                    value={storeDteType}
                    onChange={(e) => setStoreDteType(e.target.value)}
                    className="w-full bg-[#080B12] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-red focus:outline-none"
                  >
                    <option value="ACTA_RENDICION_MANDATO">{t("dte_type_mandate")}</option>
                    <option value="BOLETA_39">{t("dte_type_boleta_39")}</option>
                    <option value="FACTURA_AFECTA_33">{t("dte_type_factura_33")}</option>
                    <option value="FACTURA_EXENTA_34">{t("dte_type_factura_34")}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-white/50 mb-1">
                    {t("field_store_dte_folio")}
                  </label>
                  <input
                    type="text"
                    value={storeDteFolio}
                    onChange={(e) => setStoreDteFolio(e.target.value)}
                    placeholder={t("ph_store_dte_folio")}
                    className="w-full bg-[#080B12] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-red focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-white/50 mb-1">
                    {t("field_store_dte_url")}
                  </label>
                  <input
                    type="url"
                    value={storeDteUrl}
                    onChange={(e) => setStoreDteUrl(e.target.value)}
                    placeholder={t("ph_store_dte_url")}
                    className="w-full bg-[#080B12] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-red focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-1.5">
                {t("bank_details_label")}
              </label>
              <input
                type="text"
                value={bankDetails}
                onChange={(e) => setBankDetails(e.target.value)}
                className="w-full bg-[#080B12] border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/30 text-sm focus:border-red focus:outline-none"
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

      {/* Libro Mayor Inmutable de Movimientos Financieros (Ledger) */}
      <div className="bg-[#0E121B] rounded-2xl border border-white/10 shadow-xl overflow-hidden">
        <div className="p-5 border-b border-white/10">
          <h2 className="text-sm font-bold text-white">{t("tx_history_title")}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#090C14] border-b border-white/10 text-white/50 text-[11px] font-black uppercase tracking-wider">
                <th className="py-3 px-5">{t("col_date")}</th>
                <th className="py-3 px-5">{t("col_bucket")}</th>
                <th className="py-3 px-5">{t("col_reference")}</th>
                <th className="py-3 px-5">{t("col_method")}</th>
                <th className="py-3 px-5 text-right">{t("col_amount")}</th>
              </tr>
            </thead>
            <tbody>
              {history.transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-white/40 text-sm">
                    {t("no_recent_tx")}
                  </td>
                </tr>
              ) : (
                history.transactions.map((tx: any) => {
                  const isNegative =
                    tx.type === "WITHDRAWAL" ||
                    tx.type === "COMMISSION" ||
                    tx.type === "REFUND" ||
                    tx.type === "CHARGEBACK" ||
                    Number(tx.amount) < 0;
                  const absAmount = Math.abs(Number(tx.amount || 0));
                  return (
                    <tr
                      key={tx.id}
                      className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="py-3 px-5 text-xs text-white/70 font-mono">
                        {new Date(tx.createdAt).toLocaleDateString("es-CL")}
                      </td>
                      <td className="py-3 px-5 text-xs space-x-2">
                        {renderLedgerTypeBadge(tx.type)}
                        <span className="text-[10px] font-mono text-white/40">
                          [
                          {tx.bucket === "HELD_ESCROW"
                            ? t("bucket_escrow")
                            : tx.bucket === "SETTLED"
                            ? t("bucket_settled")
                            : t("bucket_available")}
                          ]
                        </span>
                      </td>
                      <td className="py-3 px-5 text-xs text-white font-medium">
                        <div>{tx.reference || "-"}</div>
                        {tx.taxDocumentFolio && (
                          <span className="text-[10px] font-mono text-amber-400">
                            DTE: {tx.taxDocumentType || "Folio"} #{tx.taxDocumentFolio}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-5 text-xs">
                        {tx.paymentMethod === "MERCADOPAGO" ? (
                          <span className="bg-sky-500/10 text-sky-400 border border-sky-500/30 px-2 py-0.5 rounded-md text-xs font-bold">
                            Mercado Pago
                          </span>
                        ) : tx.paymentMethod === "WEBPAY" ? (
                          <span className="bg-orange-500/10 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded-md text-xs font-bold">
                            Webpay
                          </span>
                        ) : (
                          <span className="bg-white/5 text-white/60 border border-white/10 px-2 py-0.5 rounded-md text-xs font-bold">
                            {tx.paymentMethod || "LEDGER"}
                          </span>
                        )}
                      </td>
                      <td
                        className={`py-3 px-5 text-right font-black text-sm font-mono ${
                          isNegative ? "text-red" : "text-emerald-400"
                        }`}
                      >
                        {isNegative ? "-" : "+"}${absAmount.toLocaleString("es-CL")}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Estado de Liquidaciones y Transferencias Bancarias */}
      <div className="bg-[#0E121B] rounded-2xl border border-white/10 shadow-xl overflow-hidden mt-6">
        <div className="p-5 border-b border-white/10">
          <h2 className="text-sm font-bold text-white">{t("withdrawals_status_title")}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#090C14] border-b border-white/10 text-white/50 text-[11px] font-black uppercase tracking-wider">
                <th className="py-3 px-5">{t("col_settlement_code")}</th>
                <th className="py-3 px-5">{t("col_request_date")}</th>
                <th className="py-3 px-5">{t("col_dest_account")}</th>
                <th className="py-3 px-5">{t("col_gross_commission")}</th>
                <th className="py-3 px-5">{t("col_dte_backing")}</th>
                <th className="py-3 px-5">{t("col_status")}</th>
                <th className="py-3 px-5 text-right">{t("col_amount")}</th>
              </tr>
            </thead>
            <tbody>
              {history.withdrawals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-white/40 text-sm">
                    {t("no_withdrawals_yet")}
                  </td>
                </tr>
              ) : (
                history.withdrawals.map((w: any) => (
                  <tr
                    key={w.id}
                    className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="py-3 px-5 text-xs font-mono font-bold text-white">
                      <div>{w.settlementCode || w.id.slice(0, 8)}</div>
                      {w.vendorOrders?.length > 0 && (
                        <span className="text-[10px] text-white/40">
                          {t("orders_count_badge", { count: w.vendorOrders.length })}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-5 text-xs text-white/70 font-mono">
                      {new Date(w.createdAt).toLocaleDateString("es-CL")}
                    </td>
                    <td
                      className="py-3 px-5 text-xs text-white font-medium truncate max-w-[200px]"
                      title={w.bankDetails}
                    >
                      {w.bankDetails}
                    </td>
                    <td className="py-3 px-5 text-xs font-mono">
                      <div className="text-white/80">
                        ${Number(w.grossSalesAmount || w.amount).toLocaleString("es-CL")}
                      </div>
                      {Number(w.sellerCommissionAmount || 0) > 0 && (
                        <div className="text-[10px] text-amber-400">
                          -${Number(w.sellerCommissionAmount).toLocaleString("es-CL")} com.
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-5 text-xs font-mono">
                      {w.storeDteFolio ? (
                        <div className="text-emerald-400">
                          {w.storeDteType || "DTE"}: #{w.storeDteFolio}
                        </div>
                      ) : w.status === "PENDING" ? (
                        editingDteId === w.id ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              value={inlineDteFolio}
                              onChange={(e) => setInlineDteFolio(e.target.value)}
                              placeholder="Folio"
                              className="w-24 bg-[#080B12] border border-white/20 rounded px-2 py-1 text-xs text-white"
                            />
                            <button
                              type="button"
                              onClick={() => handleUpdateDteBacking(w.id)}
                              className="p-1 rounded bg-emerald-500/20 text-emerald-400"
                            >
                              <IconCheck className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingDteId(null)}
                              className="p-1 rounded bg-white/10 text-white/60"
                            >
                              <IconX className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingDteId(w.id);
                              setInlineDteFolio("");
                            }}
                            className="text-[11px] text-amber-400 hover:underline font-sans font-bold"
                          >
                            {t("attach_dte_btn")}
                          </button>
                        )
                      ) : (
                        <span className="text-white/30">-</span>
                      )}
                      {w.platformDteFolio && (
                        <div className="text-[10px] text-cyan-400">
                          Fact. TapTrade: #{w.platformDteFolio}
                        </div>
                      )}
                      {w.transferReference && (
                        <div className="text-[10px] text-emerald-300">
                          TEF: {w.transferReference}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-5 text-xs">
                      {w.status === "PENDING" && (
                        <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-full text-xs font-bold">
                          {t("status_in_progress")}
                        </span>
                      )}
                      {w.status === "APPROVED" && (
                        <span className="bg-sky-500/10 text-sky-400 border border-sky-500/30 px-2.5 py-0.5 rounded-full text-xs font-bold">
                          {t("status_approved")}
                        </span>
                      )}
                      {w.status === "COMPLETED" && (
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-xs font-bold">
                          {t("status_completed")}
                        </span>
                      )}
                      {w.status === "REJECTED" && (
                        <span
                          className="bg-red/10 text-red border border-red/30 px-2.5 py-0.5 rounded-full text-xs font-bold"
                          title={w.rejectionReason || ""}
                        >
                          {t("status_rejected")}
                        </span>
                      )}
                      {w.status === "FAILED" && (
                        <span
                          className="bg-red/20 text-red border border-red/40 px-2.5 py-0.5 rounded-full text-xs font-bold"
                          title={w.rejectionReason || ""}
                        >
                          {t("status_failed")}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-5 text-right font-black text-sm text-emerald-400 font-mono">
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
