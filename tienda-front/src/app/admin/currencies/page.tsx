"use client";
import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { List, Column } from "@/components/ui/List";
import { useCurrencies } from "@/app/admin/_components/Currencies/hooks/useCurrencies";
import CurrencyModal from "@/app/admin/_components/Currencies/CurrencyModal";
import { IconPencil, IconTrash } from "@/components/ui/Icons";
import { roundToCLP } from "@/utils/tcgPrices";

export default function AdminCurrencies() {
  const t = useTranslations("admin.currencies_page");
  const tCommon = useTranslations("common");
  const { exchangeRates, globalCurrencies, games, loading, branchName, refresh, deleteExchangeRate } = useCurrencies();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRate, setSelectedRate] = useState<any | null>(null);

  const openModal = (rate?: any) => {
    setSelectedRate(rate || null);
    setIsModalOpen(true);
  };

  const columns: Column<any>[] = [
    {
      key: "game",
      header: t("game"),
      render: (rate) => (
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white">{rate.game?.name || "-"}</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue/10 text-blue border border-blue/20">
            TCG
          </span>
        </div>
      ),
    },
    {
      key: "currency",
      header: t("base_currency"),
      render: (rate) => {
        const globalRate = globalCurrencies.find((g: any) => g.gameId === rate.gameId);
        const code = (globalRate?.currency?.code && globalRate.currency.code !== "CLP") 
          ? globalRate.currency.code 
          : "USD";
        return (
          <span className="text-gray-4 font-mono font-medium">{code} ($)</span>
        );
      },
    },
    {
      key: "rate",
      header: t("local_value"),
      render: (rate) => {
        const numRate = Number(rate.rate);
        return (
          <div>
            <span className="text-emerald-400 font-bold text-sm">
              ${numRate.toLocaleString("es-CL")} CLP
            </span>
            <span className="block text-[11px] text-gray-400">
              1 USD = ${numRate.toLocaleString("es-CL")} CLP (Venta)
            </span>
          </div>
        );
      },
    },
    {
      key: "buyPercentage",
      header: "Avalúo Compra (Cash)",
      render: (rate) => {
        const numRate = Number(rate.rate);
        const buyPct = rate.buyPercentage !== undefined && rate.buyPercentage !== null ? Number(rate.buyPercentage) : 50;
        const cashSample = roundToCLP(numRate * (buyPct / 100));
        return (
          <div>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
              {buyPct}%
            </span>
            <span className="block text-[11px] text-gray-400 mt-0.5">
              ${cashSample.toLocaleString("es-CL")} CLP / USD
            </span>
          </div>
        );
      },
    },
    {
      key: "creditPercentage",
      header: "Crédito de Tienda",
      render: (rate) => {
        const numRate = Number(rate.rate);
        const creditPct = rate.creditPercentage !== undefined && rate.creditPercentage !== null ? Number(rate.creditPercentage) : 70;
        const creditSample = roundToCLP(numRate * (creditPct / 100));
        return (
          <div>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
              {creditPct}%
            </span>
            <span className="block text-[11px] text-gray-400 mt-0.5">
              ${creditSample.toLocaleString("es-CL")} CLP / USD
            </span>
          </div>
        );
      },
    },
    {
      key: "actions",
      header: tCommon("actions"),
      headerClassName: "text-right",
      cellClassName: "text-right",
      render: (rate) => (
        <div className="flex items-center justify-end gap-2">
          <button
            className="w-10 h-7 rounded-full border border-stroke flex items-center justify-center text-gray-4 hover:border-white hover:text-white transition-colors"
            onClick={() => openModal(rate)}
            title={tCommon("edit")}
          >
            <IconPencil className="w-3.5 h-3.5" />
          </button>
          <button
            className="w-10 h-7 rounded-full border border-stroke flex items-center justify-center text-gray-4 hover:border-red hover:text-red transition-colors"
            onClick={() => deleteExchangeRate(rate)}
            title={tCommon("delete")}
          >
            <IconTrash className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white tracking-tight">{t("title")}</h1>
            {branchName && (
              <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-white/70 font-medium">
                {t("branch_label")} <strong className="text-white">{branchName}</strong>
              </span>
            )}
          </div>
          <p className="text-gray-4 text-sm mt-1">
            {t("subtitle")}
          </p>
        </div>
        <Button onClick={() => openModal()}>
          {t("add_rate")}
        </Button>
      </div>

      <List
        columns={columns}
        data={exchangeRates}
        loading={loading}
        emptyMessage={t("empty_rates")}
        keyExtractor={(rate) => rate.id}
      />

      <CurrencyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        exchangeRate={selectedRate}
        globalCurrencies={globalCurrencies}
        games={games}
        onSuccess={refresh}
      />
    </div>
  );
}
