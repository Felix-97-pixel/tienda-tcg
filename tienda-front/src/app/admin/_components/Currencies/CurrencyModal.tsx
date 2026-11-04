"use client";
import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { adminFetch } from "@/utils/api";
import { useActiveBranch } from "@/hooks/useActiveBranch";
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
  const { activeBranchId } = useActiveBranch();

  const [gameId, setGameId] = useState("");
  const [rate, setRate] = useState<number | "">("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (exchangeRate) {
      setGameId(exchangeRate.gameId);
      setRate(exchangeRate.rate);
    } else {
      setGameId(games.length > 0 ? games[0].id : "");
      setRate("");
    }
  }, [exchangeRate, isOpen, games, globalCurrencies]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameId || !rate || Number(rate) <= 0) {
      showToast("Ingresa un valor de tasa válido mayor a 0", "error");
      return;
    }

    setSaving(true);

    const payload = {
      gameId,
      rate: Number(rate)
    };

    try {
      const res = await adminFetch("/stores/me/exchange-rates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }, activeBranchId);

      if (res.ok) {
        showToast("Tasa de cambio guardada correctamente", "success");
        onSuccess();
        onClose();
      } else {
        const errData = await res.json().catch(() => ({}));
        showToast(errData.message || "Error al guardar tasa", "error");
      }
    } catch (error) {
      showToast("Error de red al guardar tasa", "error");
    } finally {
      setSaving(false);
    }
  };

  const selectedGlobalRate = globalCurrencies.find(c => c.gameId === gameId);
  const baseCurrency = (selectedGlobalRate?.currencyCode && selectedGlobalRate.currencyCode !== "CLP") 
    ? selectedGlobalRate.currencyCode 
    : "USD";

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
            disabled={!!exchangeRate}
          >
            {games.map(game => (
              <option key={game.id} value={game.id}>{game.name}</option>
            ))}
          </select>
        </div>

        <div>
          <Input
            label="Valor Local en CLP *"
            type="number"
            required
            step="1"
            min="1"
            value={rate}
            onChange={(e) => setRate(e.target.value ? Number(e.target.value) : "")}
            placeholder="1300"
          />
          <div className="bg-[#111318] border border-white/10 rounded-xl p-3 mt-3 text-xs text-gray-4 space-y-1">
            <p className="text-white font-medium">
              1 {baseCurrency} = {rate ? `$${Number(rate).toLocaleString("es-CL")} CLP` : "$X CLP"}
            </p>
            <p className="text-[11px] text-gray-400">
              Esta tasa fija el <strong>Precio Final al Cliente (con IVA incluido)</strong> en tu tienda para las cartas de este juego.
            </p>
          </div>
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
