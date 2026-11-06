"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { List, Column } from "@/components/ui/List";
import { useCurrencies } from "@/app/superadmin/_components/Currencies/hooks/useCurrencies";
import CurrencyModal from "@/app/superadmin/_components/Currencies/CurrencyModal";
import { useTranslations } from "next-intl";
import { IconPencil, IconTrash } from "@/components/ui/Icons";

export default function AdminCurrencies() {
  const t = useTranslations("currencies_page");
  const tCommon = useTranslations("common");
  const { exchangeRates, globalCurrencies, games, loading, refresh, deleteExchangeRate } = useCurrencies();

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
        <span className="font-semibold text-white">{rate.game?.name || "-"}</span>
      ),
    },
    {
      key: "currency",
      header: t("base_currency"),
      render: (rate) => (
        <span className="text-gray-4">{rate.currency?.code} ({rate.currency?.symbol})</span>
      ),
    },
    {
      key: "rate",
      header: t("local_value"),
      render: (rate) => (
        <span className="text-gray-4">{rate.rate} CLP</span>
      ),
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
            className="w-10 h-7 rounded-full border border-stroke flex items-center justify-center text-gray-4 hover:border-red-500 hover:text-red-500 transition-colors"
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{t("title")}</h1>
          <p className="text-gray-4 text-sm mt-1">{t("subtitle")}</p>
        </div>
        <Button onClick={() => openModal()}>
          {t("add_rate")}
        </Button>
      </div>

      <List
        columns={columns}
        data={exchangeRates}
        loading={loading}
        keyExtractor={(rate) => rate.id.toString()}
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
