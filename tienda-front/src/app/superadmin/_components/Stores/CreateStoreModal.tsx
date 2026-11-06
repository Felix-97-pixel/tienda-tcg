"use client";
import React from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { ImageUploadField } from "@/components/ui/ImageUploadField";
import { IconX, IconStore, IconShield, IconMapPin, IconLoader } from "@/components/ui/Icons";

interface CreateStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  formData: {
    companyName: string;
    companyRut: string;
    companyLogoUrl: string;
    storeName: string;
    subdomain: string;
    logoUrl: string;
    address: string;
    ownerEmail: string;
    ownerName: string;
    ownerPassword: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isSubmitting: boolean;
}

export default function CreateStoreModal({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  handleInputChange,
  isSubmitting,
}: CreateStoreModalProps) {
  const t = useTranslations("stores_page");
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-[#0E121B] border border-white/10 rounded-3xl shadow-2xl w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-white/10 bg-white/[0.02] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red to-red-dark flex items-center justify-center text-white shadow-lg shadow-red/20">
              <IconStore className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-black text-white uppercase tracking-tight">
                {t("register_company_title")}
              </h3>
              <p className="text-xs text-white/50">
                {t("register_company_sub")}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all"
          >
            <IconX className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={onSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Bloque 1: Empresa / Holding */}
          <div className="space-y-4">
            <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
              <IconStore className="w-4 h-4 text-red" />
              {t("company_data_section")}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-white/70 mb-1.5 uppercase tracking-wider">
                  {t("company_name_label")}
                </label>
                <input
                  required
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  className="w-full bg-[#080B12] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-red focus:ring-1 focus:ring-red/30 transition-all"
                  placeholder="Blood Moon Gaming Corp"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white/70 mb-1.5 uppercase tracking-wider">
                  {t("company_rut_label")}
                </label>
                <input
                  type="text"
                  name="companyRut"
                  value={formData.companyRut}
                  onChange={handleInputChange}
                  className="w-full bg-[#080B12] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-red focus:ring-1 focus:ring-red/30 transition-all font-mono"
                  placeholder="77.890.123-K"
                />
              </div>

              <div className="sm:col-span-2">
                <ImageUploadField
                  label={t("company_logo_label")}
                  value={formData.companyLogoUrl}
                  onChange={(url) => setFormData((prev: any) => ({ ...prev, companyLogoUrl: url }))}
                  folder="companies"
                  type="logo"
                />
              </div>
            </div>
          </div>

          {/* Bloque 2: Casa Matriz (Primera Sucursal) */}
          <div className="pt-4 border-t border-white/10 space-y-4">
            <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
              <IconMapPin className="w-4 h-4 text-emerald-400" />
              {t("hq_section")}
            </h4>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs font-bold text-white/70 mb-1.5 uppercase tracking-wider">
                  {t("branch_name_label")}
                </label>
                <input
                  required
                  type="text"
                  name="storeName"
                  value={formData.storeName}
                  onChange={handleInputChange}
                  className="w-full bg-[#080B12] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-red focus:ring-1 focus:ring-red/30 transition-all"
                  placeholder="Blood Moon Santiago Centro"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white/70 mb-1.5 uppercase tracking-wider">
                  {t("subdomain_label")}
                </label>
                <div className="flex items-center rounded-xl bg-[#080B12] border border-white/10 focus-within:border-red focus-within:ring-1 focus-within:ring-red/30 transition-all overflow-hidden px-4 py-2.5">
                  <span className="text-xs text-white/40 select-none font-mono pr-1">taptrade.cl/shop/store/</span>
                  <input
                    required
                    type="text"
                    name="subdomain"
                    value={formData.subdomain}
                    onChange={handleInputChange}
                    className="w-full bg-transparent text-sm text-white placeholder:text-white/30 outline-none font-mono"
                    placeholder="bloodmoon_santiago"
                  />
                </div>
                <p className="text-[11px] text-white/40 mt-1">
                  {t("subdomain_hint")}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-white/70 mb-1.5 uppercase tracking-wider">
                  {t("physical_address_label")}
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full bg-[#080B12] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-red focus:ring-1 focus:ring-red/30 transition-all"
                  placeholder="Av. Providencia 2124, Local 4B"
                />
              </div>

              <div>
                <ImageUploadField
                  label={t("branch_logo_label")}
                  value={formData.logoUrl}
                  onChange={(url) => setFormData((prev: any) => ({ ...prev, logoUrl: url }))}
                  folder="stores"
                  type="logo"
                  description={t("branch_logo_desc")}
                />
              </div>
            </div>
          </div>

          {/* Bloque 3: Dueño de la Empresa */}
          <div className="pt-4 border-t border-white/10 space-y-4">
            <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
              <IconShield className="w-4 h-4 text-purple-400" />
              {t("owner_section")}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-white/70 mb-1.5 uppercase tracking-wider">
                  {t("owner_name_label")}
                </label>
                <input
                  required
                  type="text"
                  name="ownerName"
                  value={formData.ownerName}
                  onChange={handleInputChange}
                  className="w-full bg-[#080B12] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-red focus:ring-1 focus:ring-red/30 transition-all"
                  placeholder="Rodrigo Valenzuela"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white/70 mb-1.5 uppercase tracking-wider">
                  {t("field_email")}
                </label>
                <input
                  required
                  type="email"
                  name="ownerEmail"
                  value={formData.ownerEmail}
                  onChange={handleInputChange}
                  className="w-full bg-[#080B12] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-red focus:ring-1 focus:ring-red/30 transition-all font-mono"
                  placeholder="dueno@bloodmoon.cl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white/70 mb-1.5 uppercase tracking-wider">
                  {t("owner_password_label")}
                </label>
                <input
                  required
                  type="password"
                  name="ownerPassword"
                  value={formData.ownerPassword}
                  onChange={handleInputChange}
                  className="w-full bg-[#080B12] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-red focus:ring-1 focus:ring-red/30 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              {t("btn_cancel")}
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <IconLoader className="w-4 h-4 animate-spin" />
                  {t("btn_registering")}
                </span>
              ) : (
                t("btn_register_company_submit")
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
