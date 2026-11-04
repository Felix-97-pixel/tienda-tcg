"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ImageUploadField } from "@/components/ui/ImageUploadField";
import { IconMapPin, IconPlus, IconX, IconLoader } from "@/components/ui/Icons";
import { Company } from "./hooks/useSuperAdminStores";

interface CreateBranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: Company | null;
  onSubmit: (
    companyId: string,
    data: { name: string; subdomain: string; logoUrl?: string; address?: string; pickupSchedule?: string }
  ) => Promise<void>;
  isSubmitting: boolean;
}

export default function CreateBranchModal({
  isOpen,
  onClose,
  company,
  onSubmit,
  isSubmitting,
}: CreateBranchModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    subdomain: "",
    logoUrl: "",
    address: "",
    pickupSchedule: "",
  });

  if (!isOpen || !company) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "subdomain" ? value.toLowerCase().replace(/[^a-z0-9_-]/g, "") : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(company.id, formData);
    setFormData({ name: "", subdomain: "", logoUrl: "", address: "", pickupSchedule: "" });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-[#0E121B] border border-white/10 rounded-3xl shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Encabezado */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-white/10 bg-white/[0.02] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red/15 border border-red/30 flex items-center justify-center text-red shadow-lg shadow-red/10">
              <IconMapPin className="w-5 h-5 text-red" />
            </div>
            <div>
              <h3 className="text-base font-black text-white uppercase tracking-tight">
                Nueva Sucursal Física
              </h3>
              <p className="text-xs text-white/50">
                Empresa: <span className="text-white font-semibold">{company.name}</span>
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

        {/* Resumen Informativo */}
        <div className="px-6 py-3.5 bg-gradient-to-r from-purple-950/30 via-red/10 to-transparent border-b border-white/5 flex-shrink-0">
          <p className="text-xs text-white/70 leading-relaxed">
            Esta sucursal pertenecerá al Holding de <strong className="text-white">{company.name}</strong>,
            compartiendo la billetera matriz y el plan SaaS corporativo (
            <span className="text-purple-300 font-semibold">{company.plan?.name || "Sin Plan"}</span>
            ).
          </p>
          <p className="text-[11px] text-purple-300 font-mono mt-1">
            Tarifa adicional: <strong>+2.50 UF/mes (+ IVA)</strong> en la facturación de fin de mes. Incluye dotación base para operar (1 Encargado + 1 Cajero POS).
          </p>
        </div>

        {/* Formulario con Scroll */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-white/70 mb-1.5 uppercase tracking-wider">
              Nombre de la Sucursal *
            </label>
            <input
              required
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-[#080B12] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-red focus:ring-1 focus:ring-red/30 transition-all"
              placeholder="Ej: Sucursal Viña del Mar Centro"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-white/70 mb-1.5 uppercase tracking-wider">
              Subdominio Único (URL Web) *
            </label>
            <div className="flex items-center rounded-xl bg-[#080B12] border border-white/10 focus-within:border-red focus-within:ring-1 focus-within:ring-red/30 transition-all overflow-hidden px-4 py-2.5">
              <span className="text-xs text-white/40 select-none font-mono pr-1">taptrade.cl/shop/store/</span>
              <input
                required
                type="text"
                name="subdomain"
                value={formData.subdomain}
                onChange={handleChange}
                className="w-full bg-transparent text-sm text-white placeholder:text-white/30 outline-none font-mono"
                placeholder="bloodmoon_vina"
              />
            </div>
            <p className="text-[11px] text-white/40 mt-1">
              Permite letras, números, guiones y guiones bajos (ej: bloodmoon_vina).
            </p>
          </div>

          <div>
            <ImageUploadField
              label="Logo de la Sucursal (Opcional)"
              value={formData.logoUrl}
              onChange={(url) => setFormData((prev) => ({ ...prev, logoUrl: url }))}
              companyId={company.id}
              type="logo"
              description="Opcional. Si no se sube, hereda automáticamente el logo corporativo del Holding."
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-white/70 mb-1.5 uppercase tracking-wider">
              Dirección Física (Retiro en Tienda)
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full bg-[#080B12] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-red focus:ring-1 focus:ring-red/30 transition-all"
              placeholder="Ej: Calle Valparaíso 542, Viña del Mar"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-white/70 mb-1.5 uppercase tracking-wider">
              Horario de Retiro / Atención
            </label>
            <input
              type="text"
              name="pickupSchedule"
              value={formData.pickupSchedule}
              onChange={handleChange}
              className="w-full bg-[#080B12] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-red focus:ring-1 focus:ring-red/30 transition-all"
              placeholder="Ej: Lun a Vie 11:00 a 19:30, Sáb 11:00 a 16:00"
            />
          </div>

          {/* Footer de Acciones */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <IconLoader className="w-4 h-4 animate-spin" />
                  Registrando...
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <IconPlus className="w-4 h-4" />
                  Agregar Sucursal
                </span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
