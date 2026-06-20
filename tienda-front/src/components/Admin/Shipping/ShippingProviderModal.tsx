"use client";
import React, { useState, useEffect, FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Switch } from "@/components/ui/Switch";
import { Button } from "@/components/ui/Button";
import { ShippingProvider } from "@/types/shippingProvider";
import { ShippingBadge } from "@/components/ui/ShippingBadge";
import { API_URL } from "@/utils/api";
import { useToast } from "@/hooks/useToast";

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
      const res = await fetch(`${API_URL}/shipping/providers/${provider.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showToast("Tarifa de envío guardada correctamente", "success");
        onSuccess();
        onClose();
      } else {
        const errData = await res.json();
        showToast(errData.message || "Error al guardar tarifa de envío", "error");
      }
    } catch (error) {
      showToast("Error de red", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={provider ? `Configurar ${provider.name}` : "Configurar Método de Envío"}
      maxWidth="md"
    >
      {provider && (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Visual Brand Badge Header inside the Modal */}
          <div className="flex items-center justify-center p-6 bg-[#222630] rounded-xl border border-stroke mb-4">
            <ShippingBadge name={provider.name} size="lg" className="scale-110" />
          </div>

          <div className="space-y-1.5">
            <Input
              label="Tarifa Plana (CLP) *"
              type="number"
              required
              min="0"
              step="1"
              value={price}
              onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : "")}
              placeholder="Ej: 9990"
              className="font-bold text-white"
            />
            <p className="text-xs text-gray-4 font-semibold ml-1">
              Ingresa el valor total que se cobrará al cliente por este método de envío.
            </p>
          </div>

          <div className="pt-2">
            <Switch
              label="Proveedor de Envío Activo"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            <p className="text-xs text-gray-4 font-medium ml-7 mt-1.5">
              Si se desactiva, este courier no aparecerá como opción disponible para los clientes en la página de checkout.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-stroke mt-6">
            <Button
              type="button"
              variant="secondary"
              className="font-bold"
              onClick={onClose}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button type="submit" isLoading={saving} className="font-bold px-6">
              Guardar Cambios
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
