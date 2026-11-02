"use client";
import React from "react";
import { Button } from "@/components/ui/Button";
import { IconX, IconStore, IconShield } from "@/components/ui/Icons";

interface CreateStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  formData: {
    storeName: string;
    subdomain: string;
    logoUrl: string;
    ownerEmail: string;
    ownerName: string;
    ownerPassword: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isSubmitting: boolean;
}

export default function CreateStoreModal({
  isOpen,
  onClose,
  onSubmit,
  formData,
  handleInputChange,
  isSubmitting
}: CreateStoreModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-[#0E121B] border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center px-6 py-5 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-dark to-red flex items-center justify-center text-white shadow-md">
              <IconStore className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">
                Registrar Empresa &bull; Casa Matriz
              </h3>
              <p className="text-xs text-white/50 mt-0.5">
                Crea una cuenta corporativa y su primera tienda física
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all"
          >
            <IconX className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 flex flex-col gap-5">
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <IconStore className="w-3.5 h-3.5 text-red" />
              Datos de la Empresa / Casa Matriz
            </h4>
            <div className="grid gap-3">
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">
                  Nombre de la Empresa / Tienda *
                </label>
                <input
                  required
                  type="text"
                  name="storeName"
                  value={formData.storeName}
                  onChange={handleInputChange}
                  className="w-full bg-[#080B12] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-white/30 focus:border-red focus:outline-none transition-all"
                  placeholder="Ej: Magic Store Chile"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">
                  Subdominio Único *
                </label>
                <input
                  required
                  type="text"
                  name="subdomain"
                  value={formData.subdomain}
                  onChange={handleInputChange}
                  className="w-full bg-[#080B12] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-white/30 focus:border-red focus:outline-none transition-all"
                  placeholder="Ej: magicstore"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">
                  Logo URL (Opcional)
                </label>
                <input
                  type="text"
                  name="logoUrl"
                  value={formData.logoUrl}
                  onChange={handleInputChange}
                  className="w-full bg-[#080B12] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-white/30 focus:border-red focus:outline-none transition-all"
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-white/10 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <IconShield className="w-3.5 h-3.5 text-red" />
              Dueño de Empresa (Super Usuario Holding)
            </h4>
            <div className="grid gap-3">
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">
                  Nombre Completo del Dueño *
                </label>
                <input
                  required
                  type="text"
                  name="ownerName"
                  value={formData.ownerName}
                  onChange={handleInputChange}
                  className="w-full bg-[#080B12] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-white/30 focus:border-red focus:outline-none transition-all"
                  placeholder="Ej: Juan Pérez"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">
                  Correo Electrónico *
                </label>
                <input
                  required
                  type="email"
                  name="ownerEmail"
                  value={formData.ownerEmail}
                  onChange={handleInputChange}
                  className="w-full bg-[#080B12] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-white/30 focus:border-red focus:outline-none transition-all"
                  placeholder="juan@magicstore.cl"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">
                  Contraseña de Acceso *
                </label>
                <input
                  required
                  type="password"
                  name="ownerPassword"
                  value={formData.ownerPassword}
                  onChange={handleInputChange}
                  className="w-full bg-[#080B12] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-white/30 focus:border-red focus:outline-none transition-all"
                  minLength={6}
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-2 pt-4 border-t border-white/10">
            <Button
              variant="outline"
              type="button"
              onClick={onClose}
              className="text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              isLoading={isSubmitting}
              variant="primary"
              className="text-xs"
            >
              {isSubmitting ? "Registrando..." : "Registrar Empresa"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
