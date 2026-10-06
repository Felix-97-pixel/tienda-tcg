"use client";
import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { API_URL } from "@/utils/api";
import { useToast } from "@/hooks/useToast";

interface CurrencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  exchangeRate: any | null;
  globalCurrencies: any[];
  games: any[];
  onSuccess: () => void;
}

export default function CurrencyModal({ isOpen, onClose, exchangeRate, globalCurrencies, games, onSuccess }: CurrencyModalProps) {
  const { showToast } = useToast();

  const [gameId, setGameId] = useState("");
  const [currencyCode, setCurrencyId] = useState("");
  const [rate, setRate] = useState<number | "">("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (exchangeRate) {
      setGameId(exchangeRate.gameId);
      setCurrencyId(exchangeRate.currencyCode);
      setRate(exchangeRate.rate);
    } else {
      setGameId(games.length > 0 ? games[0].id : "");
      setCurrencyId(globalCurrencies.length > 0 ? globalCurrencies[0].code : "");
      setRate("");
    }
  }, [exchangeRate, isOpen, games, globalCurrencies]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      gameId,
      currencyCode,
      rate: Number(rate)
    };

    try {
      const res = await fetch(`${API_URL}/currencies${exchangeRate ? `/${exchangeRate.id}` : ""}`, {
        method: exchangeRate ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(exchangeRate ? { currencyCode, rate: Number(rate) } : payload),
      });

      if (res.ok) {
        showToast("Tasa de cambio guardada correctamente", "success");
        onSuccess();
        onClose();
      } else {
        const errData = await res.json();
        showToast(errData.message || "Error al guardar", "error");
      }
    } catch (error) {
      showToast("Error de red", "error");
    } finally {
      setSaving(false);
    }
  };

  const selectedCurrency = globalCurrencies.find(c => c.code === currencyCode);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={exchangeRate ? "Editar Tasa de Cambio" : "Agregar Tasa de Cambio"}
      maxWidth="md"
    >
      <form onSubmit={handleSave} className="space-y-5">
        <div>
          <label className="block text-xs font-bold text-gray-4 uppercase tracking-wider mb-2">Juego *</label>
          <select 
            value={gameId}
            onChange={(e) => setGameId(e.target.value)}
            className="w-full bg-[#111318] border border-stroke rounded-xl px-4 py-3 text-sm text-white focus:border-blue outline-none transition-colors"
            required
            disabled={!!exchangeRate} // No permitir cambiar juego si estamos editando
          >
            {games.map(game => (
              <option key={game.id} value={game.id}>{game.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-4 uppercase tracking-wider mb-2">Divisa Base *</label>
          <select 
            value={currencyCode}
            onChange={(e) => setCurrencyId(e.target.value)}
            className="w-full bg-[#111318] border border-stroke rounded-xl px-4 py-3 text-sm text-white focus:border-blue outline-none transition-colors"
            required
          >
            {globalCurrencies.length === 0 && <option value="">Primero crea divisas en "Divisas Soportadas"</option>}
            {globalCurrencies.map(curr => (
              <option key={curr.id} value={curr.code}>{curr.name} ({curr.code})</option>
            ))}
          </select>
        </div>

        <div>
          <Input
            label="Valor Local *"
            type="number"
            required
            step="0.01"
            min="0.01"
            value={rate}
            onChange={(e) => setRate(e.target.value ? Number(e.target.value) : "")}
            placeholder="950"
          />
          <p className="text-xs text-gray-4 mt-1.5 ml-1">
            Valor de 1 unidad de esta divisa en CLP. {selectedCurrency ? `Ej: 1 ${selectedCurrency.code} = ${rate || 'X'} CLP` : ''}
          </p>
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
