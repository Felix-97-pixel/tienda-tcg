"use client";
import React, { useState, useEffect, FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Switch } from "@/components/ui/Switch";
import { Button } from "@/components/ui/Button";
import { ShippingProvider } from "@/types/shippingProvider";
import { ShippingBadge } from "@/components/ui/ShippingBadge";
import { useToast } from "@/hooks/useToast";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

interface ShippingProviderModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: ShippingProvider | null;
  onSuccess: () => void;
}

export default function ShippingProviderModal({ isOpen, onClose, provider, onSuccess }: ShippingProviderModalProps) {
  const { showToast } = useToast();

  const [price, setPrice] = useState<number | "">("");
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (provider) {
      setPrice(Number(provider.price));
      setIsActive(provider.isActive);
    } else {
      setPrice("");
      setIsActive(true);
    }
  }, [provider, isOpen]);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!provider) return;
    setSaving(true);

    const payload = {
      price: Number(price),
      isActive,
    };

    try {
      const res = await fetch(`${API_URL}/shipping/my-providers/${provider.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showToast("Tarifa de respaldo guardada correctamente", "success");
        onSuccess();
        onClose();
      } else {
        const errData = await res.json();
        showToast(errData.message || "Error al guardar tarifa de envío", "error");
      }
    } catch (error) {
      showToast("Error de conexión", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={provider ? `Configurar Tarifa: ${provider.name.toUpperCase()}` : "Configurar Método de Envío"}
      maxWidth="md"
    >
      {provider && (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Visual Brand Badge Header inside the Modal */}
          <div className="flex items-center justify-center p-6 bg-[#080B12] rounded-2xl border border-white/10 mb-4 shadow-inner">
            <ShippingBadge name={provider.name} size="lg" className="scale-110" />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-white/70">
              Tarifa Plana de Respaldo (CLP) <span className="text-red">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-bold">$</span>
              <input
                type="number"
                required
                min="0"
                step="1"
                value={price}
                onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : "")}
                placeholder="Ej: 6990"
                className="w-full bg-[#080B12] border border-white/10 rounded-xl pl-8 pr-16 py-2.5 text-sm text-white font-mono font-bold placeholder-white/20 focus:border-red focus:ring-1 focus:ring-red/30 outline-none transition"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 text-xs font-bold">CLP</span>
            </div>
            <p className="text-xs text-white/40 font-medium ml-1 mt-1">
              Este valor se utilizará por defecto o como respaldo de emergencia si la cotización en vivo con el transportista no responde.
            </p>
          </div>

          <div className="pt-2">
            <Switch
              label="Habilitar este Courier en Checkout"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              wrapperClassName="bg-[#080B12] border-white/10"
            />
            <p className="text-xs text-white/40 font-medium ml-2 mt-2">
              Si se desactiva, este proveedor no aparecerá como opción de envío para los compradores.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-white/10 mt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button variant="primary" type="submit" isLoading={saving} className="px-6">
              Guardar Tarifa
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
