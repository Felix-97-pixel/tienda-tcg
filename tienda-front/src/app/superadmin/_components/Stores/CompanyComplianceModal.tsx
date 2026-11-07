"use client";
import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { adminFetch } from "@/utils/api";
import { Company } from "./hooks/useSuperAdminStores";
import { IconShieldCheck, IconX, IconCheck } from "@/components/ui/Icons";
import toast from "react-hot-toast";

interface CompanyComplianceModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: Company | null;
  onSuccess: () => void;
}

export default function CompanyComplianceModal({
  isOpen,
  onClose,
  company,
  onSuccess,
}: CompanyComplianceModalProps) {
  const t = useTranslations("stores_page");
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    verificationStatus: "ENABLED",
    siiActivityStarted: false,
    taxClassification: "VAT_TAXABLE",
    rut: "",
    legalName: "",
    taxActivity: "",
    taxAddress: "",
    taxEmail: "",
    customCommissionRate: "",
    commissionCalcBase: "NET",
    bankName: "",
    bankAccountType: "Cuenta Corriente",
    bankAccountNumber: "",
    bankHolderRut: "",
    bankHolderName: "",
    verificationNotes: "",
  });

  useEffect(() => {
    if (company) {
      setForm({
        verificationStatus: company.verificationStatus || "ENABLED",
        siiActivityStarted: Boolean(company.siiActivityStarted),
        taxClassification: company.taxClassification || "VAT_TAXABLE",
        rut: company.rut || "",
        legalName: company.legalName || company.name || "",
        taxActivity: company.taxActivity || "",
        taxAddress: company.taxAddress || "",
        taxEmail: company.taxEmail || company.owner?.email || "",
        customCommissionRate:
          company.customCommissionRate !== null && company.customCommissionRate !== undefined
            ? String(company.customCommissionRate)
            : "",
        commissionCalcBase: company.commissionCalcBase || "NET",
        bankName: company.bankName || "",
        bankAccountType: company.bankAccountType || "Cuenta Corriente",
        bankAccountNumber: company.bankAccountNumber || "",
        bankHolderRut: company.bankHolderRut || company.rut || "",
        bankHolderName: company.bankHolderName || company.legalName || company.name || "",
        verificationNotes: company.verificationNotes || "",
      });
    }
  }, [company]);

  if (!isOpen || !company) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: Record<string, any> = {
        verificationStatus: form.verificationStatus,
        siiActivityStarted: form.siiActivityStarted,
        taxClassification: form.taxClassification,
        rut: form.rut || undefined,
        legalName: form.legalName || undefined,
        taxActivity: form.taxActivity || undefined,
        taxAddress: form.taxAddress || undefined,
        taxEmail: form.taxEmail || undefined,
        customCommissionRate:
          form.customCommissionRate.trim() === "" ? null : Number(form.customCommissionRate),
        commissionCalcBase: form.commissionCalcBase,
        bankName: form.bankName || undefined,
        bankAccountType: form.bankAccountType || undefined,
        bankAccountNumber: form.bankAccountNumber || undefined,
        bankHolderRut: form.bankHolderRut || undefined,
        bankHolderName: form.bankHolderName || undefined,
        verificationNotes: form.verificationNotes,
      };

      const res = await adminFetch(`/stores/companies/${company.id}/compliance`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(t("toast_compliance_saved"));
        onSuccess();
        onClose();
      } else {
        const err = await res.json();
        toast.error(err.message || t("err_save_compliance"));
      }
    } catch {
      toast.error(t("err_save_compliance"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#0E121B] border border-white/15 rounded-3xl max-w-3xl w-full p-6 space-y-5 shadow-2xl text-white my-8">
        <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <IconShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>{t("compliance_modal_title", { name: company.name })}</span>
            </h3>
            <p className="text-xs text-white/50 mt-1">{t("compliance_modal_sub")}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white"
          >
            <IconX className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 max-h-[75vh] overflow-y-auto pr-1">
          {/* Estado de Habilitación y SII */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase text-white/60 mb-1">
                {t("field_verification_status")}
              </label>
              <select
                value={form.verificationStatus}
                onChange={(e) => setForm({ ...form, verificationStatus: e.target.value })}
                className="w-full bg-[#080B12] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:border-red focus:outline-none"
              >
                <option value="ENABLED">{t("status_enabled")}</option>
                <option value="PENDING_VERIFICATION">{t("status_pending_verif")}</option>
                <option value="PENDING_DOCS">{t("status_pending_docs")}</option>
                <option value="SUSPENDED">{t("status_suspended")}</option>
                <option value="BLOCKED">{t("status_blocked")}</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-white/60 mb-1">
                {t("field_tax_class")}
              </label>
              <select
                value={form.taxClassification}
                onChange={(e) => setForm({ ...form, taxClassification: e.target.value })}
                className="w-full bg-[#080B12] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:border-red focus:outline-none"
              >
                <option value="VAT_TAXABLE">{t("tax_vat_taxable")}</option>
                <option value="VAT_EXEMPT">{t("tax_vat_exempt")}</option>
                <option value="NON_TAXABLE">{t("tax_non_taxable")}</option>
              </select>
            </div>

            <div className="flex items-center pt-5">
              <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-emerald-400 font-bold">
                <input
                  type="checkbox"
                  checked={form.siiActivityStarted}
                  onChange={(e) => setForm({ ...form, siiActivityStarted: e.target.checked })}
                  className="w-4 h-4 accent-emerald-400"
                />
                <span>{t("field_sii_started")}</span>
              </label>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-white/60 mb-1">
                {t("company_rut_label")}
              </label>
              <input
                type="text"
                value={form.rut}
                onChange={(e) => setForm({ ...form, rut: e.target.value })}
                placeholder="76.123.456-0"
                className="w-full bg-[#080B12] border border-white/15 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-red focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-white/60 mb-1">
                {t("field_legal_name")}
              </label>
              <input
                type="text"
                value={form.legalName}
                onChange={(e) => setForm({ ...form, legalName: e.target.value })}
                className="w-full bg-[#080B12] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:border-red focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-white/60 mb-1">
                {t("field_tax_activity")}
              </label>
              <input
                type="text"
                value={form.taxActivity}
                onChange={(e) => setForm({ ...form, taxActivity: e.target.value })}
                className="w-full bg-[#080B12] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:border-red focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold uppercase text-white/60 mb-1">
                {t("field_tax_address")}
              </label>
              <input
                type="text"
                value={form.taxAddress}
                onChange={(e) => setForm({ ...form, taxAddress: e.target.value })}
                className="w-full bg-[#080B12] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:border-red focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-white/60 mb-1">
                {t("field_tax_email")}
              </label>
              <input
                type="email"
                value={form.taxEmail}
                onChange={(e) => setForm({ ...form, taxEmail: e.target.value })}
                className="w-full bg-[#080B12] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:border-red focus:outline-none"
              />
            </div>
          </div>

          {/* Comisión Comercial Particular */}
          <div className="border-t border-white/10 pt-4 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-amber-400">
              {t("section_commission")}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase text-white/60 mb-1">
                  {t("field_custom_comm_rate")}
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={form.customCommissionRate}
                  onChange={(e) => setForm({ ...form, customCommissionRate: e.target.value })}
                  placeholder={t("ph_custom_comm_rate")}
                  className="w-full bg-[#080B12] border border-white/15 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-white/60 mb-1">
                  {t("field_comm_calc_base")}
                </label>
                <select
                  value={form.commissionCalcBase}
                  onChange={(e) => setForm({ ...form, commissionCalcBase: e.target.value })}
                  className="w-full bg-[#080B12] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                >
                  <option value="NET">{t("base_net")}</option>
                  <option value="GROSS">{t("base_gross")}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Cuenta Bancaria Corporativa */}
          <div className="border-t border-white/10 pt-4 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-emerald-400">
              {t("section_bank")}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase text-white/60 mb-1">
                  {t("field_bank_name")}
                </label>
                <input
                  type="text"
                  value={form.bankName}
                  onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                  className="w-full bg-[#080B12] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-white/60 mb-1">
                  {t("field_bank_type")}
                </label>
                <input
                  type="text"
                  value={form.bankAccountType}
                  onChange={(e) => setForm({ ...form, bankAccountType: e.target.value })}
                  className="w-full bg-[#080B12] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-white/60 mb-1">
                  {t("field_bank_number")}
                </label>
                <input
                  type="text"
                  value={form.bankAccountNumber}
                  onChange={(e) => setForm({ ...form, bankAccountNumber: e.target.value })}
                  className="w-full bg-[#080B12] border border-white/15 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-emerald-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-white/60 mb-1">
                  {t("field_bank_rut")}
                </label>
                <input
                  type="text"
                  value={form.bankHolderRut}
                  onChange={(e) => setForm({ ...form, bankHolderRut: e.target.value })}
                  className="w-full bg-[#080B12] border border-white/15 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-emerald-400 focus:outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold uppercase text-white/60 mb-1">
                  {t("field_bank_holder")}
                </label>
                <input
                  type="text"
                  value={form.bankHolderName}
                  onChange={(e) => setForm({ ...form, bankHolderName: e.target.value })}
                  className="w-full bg-[#080B12] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-400 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Notas de Auditoría */}
          <div className="border-t border-white/10 pt-4">
            <label className="block text-[11px] font-bold uppercase text-white/60 mb-1">
              {t("field_verif_notes")}
            </label>
            <textarea
              rows={2}
              value={form.verificationNotes}
              onChange={(e) => setForm({ ...form, verificationNotes: e.target.value })}
              className="w-full bg-[#080B12] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:border-red focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-white/10">
            <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>
              {t("btn_cancel")}
            </Button>
            <Button type="submit" variant="primary" disabled={saving}>
              <IconCheck className="w-4 h-4 mr-1.5" />
              <span>{t("btn_save_compliance")}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

