"use client";
import React from "react";
import { Button } from "@/components/ui/Button";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#1a1d24] border border-white/10 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-white/10">
          <h3 className="text-xl font-bold text-white">Nuevo Dealer</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            ✕
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-6 flex flex-col gap-4">
          <div>
            <h4 className="text-sm font-semibold text-purple-400 mb-3 uppercase tracking-wider">Datos de la Tienda</h4>
            <div className="grid gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Nombre de Tienda</label>
                <input
                  required
                  type="text"
                  name="storeName"
                  value={formData.storeName}
                  onChange={handleInputChange}
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-purple-500"
                  placeholder="Ej: Magic Store Chile"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Subdominio</label>
                <input
                  required
                  type="text"
                  name="subdomain"
                  value={formData.subdomain}
                  onChange={handleInputChange}
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-purple-500"
                  placeholder="Ej: magicstore"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Logo URL (Opcional)</label>
                <input
                  type="text"
                  name="logoUrl"
                  value={formData.logoUrl}
                  onChange={handleInputChange}
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-purple-500"
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>

          <div className="mt-2">
            <h4 className="text-sm font-semibold text-purple-400 mb-3 uppercase tracking-wider">Cuenta del Dueño</h4>
            <div className="grid gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Nombre Completo</label>
                <input
                  required
                  type="text"
                  name="ownerName"
                  value={formData.ownerName}
                  onChange={handleInputChange}
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Correo Electrónico</label>
                <input
                  required
                  type="email"
                  name="ownerEmail"
                  value={formData.ownerEmail}
                  onChange={handleInputChange}
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Contraseña</label>
                <input
                  required
                  type="password"
                  name="ownerPassword"
                  value={formData.ownerPassword}
                  onChange={handleInputChange}
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-purple-500"
                  minLength={6}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-white/10">
            <Button
              variant="outline"
              type="button"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              isLoading={isSubmitting}
            >
              {isSubmitting ? "Creando..." : "Crear Dealer"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
