"use client";
import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Switch } from "@/components/ui/Switch";
import { Button } from "@/components/ui/Button";
import { Currency } from "@/types/currency";
import { API_URL } from "@/utils/api";
import { useToast } from "@/hooks/useToast";

interface CurrencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: Currency | null;
  onSuccess: () => void;
}

export default function CurrencyModal({ isOpen, onClose, currency, onSuccess }: CurrencyModalProps) {
  const { showToast } = useToast();

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [exchangeRate, setExchangeRate] = useState<number | "">("");
  const [isDefault, setIsDefault] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (currency) {
      setCode(currency.code);
      setName(currency.name || "");
      setSymbol(currency.symbol || "$");
      setExchangeRate(currency.exchangeRate);
      setIsDefault(currency.isDefault);
    } else {
      setCode("");
      setName("");
      setSymbol("$");
      setExchangeRate("");
      setIsDefault(false);
    }
  }, [currency, isOpen]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      code,
      name,
      symbol,
      exchangeRate: Number(exchangeRate),
      isDefault
    };

    try {
      const url = currency
        ? `${API_URL}/currencies/${currency.id}`
        : `${API_URL}/currencies`;
      const method = currency ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showToast("Divisa guardada correctamente", "success");
        onSuccess();
        onClose();
      } else {
        const errData = await res.json();
        showToast(errData.message || "Error al guardar la divisa", "error");
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
      title={currency ? "Editar Divisa" : "Agregar Divisa"}
      maxWidth="md"
    >
      <form onSubmit={handleSave} className="space-y-5">
        <Input
          label="Código (Ej: USD) *"
          type="text"
          required
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="USD"
        />

        <Input
          label="Nombre (Ej: Dólar Estadounidense)"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Dólar Estadounidense"
        />

        <Input
          label="Símbolo (Ej: $) *"
          type="text"
          required
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          placeholder="$"
        />

        <div>
          <Input
            label="Tasa de Cambio *"
            type="number"
            required
            step="0.01"
            min="0.01"
            value={exchangeRate}
            onChange={(e) => setExchangeRate(e.target.value ? Number(e.target.value) : "")}
            placeholder="950"
          />
          <p className="text-xs text-gray-4 mt-1.5 ml-1">Valor de 1 unidad de esta divisa en la moneda principal (Ej: 1 USD = 950 CLP)</p>
        </div>

        <div className="pt-2">
          <Switch
            label="Divisa Principal"
            checked={isDefault}
            onChange={(e) => setIsDefault(e.target.checked)}
          />
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-stroke mt-6">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button type="submit" isLoading={saving}>
            Guardar
          </Button>
        </div>
      </form>
    </Modal>
  );
}
