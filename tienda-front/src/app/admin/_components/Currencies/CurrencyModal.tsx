"use client";
import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { PercentageSlider } from "@/components/ui/PercentageSlider";
import { IconCash, IconWallet } from "@/components/ui/Icons";
import { adminFetch } from "@/utils/api";
import { useActiveBranch } from "@/hooks/useActiveBranch";
import { roundToCLP } from "@/utils/tcgPrices";
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
  const t = useTranslations("currencies_page");
  const { showToast } = useToast();
  const { activeBranchId } = useActiveBranch();

  const [gameId, setGameId] = useState("");
  const [rate, setRate] = useState<number | "">("");
  const [buyPercentage, setBuyPercentage] = useState<number | "">(50);
  const [creditPercentage, setCreditPercentage] = useState<number | "">(70);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (exchangeRate) {
      setGameId(exchangeRate.gameId);
      setRate(exchangeRate.rate);
      setBuyPercentage(exchangeRate.buyPercentage !== undefined ? Number(exchangeRate.buyPercentage) : 50);
      setCreditPercentage(exchangeRate.creditPercentage !== undefined ? Number(exchangeRate.creditPercentage) : 70);
    } else {
      setGameId(games.length > 0 ? games[0].id : "");
      setRate("");
      setBuyPercentage(50);
      setCreditPercentage(70);
    }
  }, [exchangeRate, isOpen, games, globalCurrencies]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameId || !rate || Number(rate) <= 0) {
      return;
    }

    setSaving(true);

    const payload = {
      gameId,
      rate: Number(rate),
      buyPercentage: Number(buyPercentage),
      creditPercentage: Number(creditPercentage),
    };

    try {
      const res = await adminFetch("/stores/me/exchange-rates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }, activeBranchId);

      if (res.ok) {
        showToast("OK", "success");
        onSuccess();
        onClose();
      } else {
        const errData = await res.json().catch(() => ({}));
        showToast(errData.message || "Error", "error");
      }
    } catch (error) {
      showToast("Error", "error");
    } finally {
      setSaving(false);
    }
  };

  const selectedGlobalRate = globalCurrencies.find(c => c.gameId === gameId);
  const baseCurrency = (selectedGlobalRate?.currencyCode && selectedGlobalRate.currencyCode !== "CLP") 
    ? selectedGlobalRate.currencyCode 
    : "USD";

  const numRate = Number(rate) || 0;
  const numBuyPct = Number(buyPercentage) || 50;
  const numCreditPct = Number(creditPercentage) || 70;
  const sampleCashCLP = roundToCLP(numRate * (numBuyPct / 100));
  const sampleCreditCLP = roundToCLP(numRate * (numCreditPct / 100));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={exchangeRate ? t("modal_edit_val_title") : t("modal_add_val_title")}
      maxWidth="lg"
    >
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-4 uppercase tracking-wider mb-2">{t("field_game")}</label>
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
            label={t("field_local_val_pvp")}
            type="number"
            required
            step="1"
            min="1"
            value={rate}
            onChange={(e) => setRate(e.target.value ? Number(e.target.value) : "")}
            placeholder="1300"
          />
        </div>

        <div className="space-y-3">
          <PercentageSlider
            label={t("cash_valuation_label")}
            value={Number(buyPercentage) || 0}
            onChange={(val) => setBuyPercentage(val)}
            min={1}
            max={100}
            step={1}
            variant="emerald"
            badgeLabel={`${Number(buyPercentage) || 0}% Cash`}
            suggestedValue={50}
            suggestedLabel={t("suggested_50")}
            minLabel={t("min_1")}
            maxLabel={t("max_100")}
            description={t("cash_valuation_desc")}
            icon={<IconCash className="w-4 h-4 text-emerald-400" />}
          />

          <PercentageSlider
            label={t("credit_valuation_label")}
            value={Number(creditPercentage) || 0}
            onChange={(val) => setCreditPercentage(val)}
            min={1}
            max={100}
            step={1}
            variant="cyan"
            badgeLabel={`${Number(creditPercentage) || 0}% Store Credit`}
            suggestedValue={70}
            suggestedLabel={t("suggested_70")}
            minLabel={t("min_1")}
            maxLabel={t("max_100")}
            description={t("credit_valuation_desc")}
            icon={<IconWallet className="w-4 h-4 text-cyan-400" />}
          />
        </div>

        <div className="bg-[#111318] border border-white/10 rounded-xl p-3.5 text-xs text-gray-4 space-y-2">
          <div className="flex items-center justify-between text-white font-medium">
            <span>{t("sale_conversion", { currency: baseCurrency })}</span>
            <span className="text-emerald-400 font-bold font-mono">
              {numRate > 0 ? `$${numRate.toLocaleString("es-CL")} CLP` : "$X CLP"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
            <div className="bg-white/[0.02] p-2 rounded-lg border border-white/5">
              <span className="text-[11px] text-emerald-400 font-bold block">Trade-in Cash ({numBuyPct}%)</span>
              <span className="font-mono text-white text-xs font-bold block mt-0.5">
                {numRate > 0 ? `$${sampleCashCLP.toLocaleString("es-CL")} CLP` : "$0 CLP"}
              </span>
              <span className="text-[10px] text-white/40">{t("per_each_unit", { currency: baseCurrency })}</span>
            </div>
            <div className="bg-white/[0.02] p-2 rounded-lg border border-white/5">
              <span className="text-[11px] text-cyan-400 font-bold block">Trade-in Store Credit ({numCreditPct}%)</span>
              <span className="font-mono text-white text-xs font-bold block mt-0.5">
                {numRate > 0 ? `$${sampleCreditCLP.toLocaleString("es-CL")} CLP` : "$0 CLP"}
              </span>
              <span className="text-[10px] text-white/40">{t("per_each_unit", { currency: baseCurrency })}</span>
            </div>
          </div>

          <p className="text-[11px] text-gray-400 pt-0.5">
            {t("pos_auto_note")}
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-stroke mt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={saving}
          >
            {t("btn_cancel")}
          </Button>
          <Button type="submit" isLoading={saving}>
            {t("btn_save")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
