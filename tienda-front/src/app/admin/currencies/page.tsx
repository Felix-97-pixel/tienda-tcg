"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { List, Column } from "@/components/ui/List";
import { useCurrencies } from "@/app/admin/_components/Currencies/hooks/useCurrencies";
import CurrencyModal from "@/app/admin/_components/Currencies/CurrencyModal";
import { IconPencil, IconTrash } from "@/components/ui/Icons";

export default function AdminCurrencies() {
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
      header: "Juego",
      render: (rate) => (
        <span className="font-semibold text-white">{rate.game?.name || "-"}</span>
      ),
    },
    {
      key: "currency",
      header: "Divisa Base Global",
      render: (rate) => {
        const globalRate = globalCurrencies.find((g: any) => g.gameId === rate.gameId);
        return (
          <span className="text-gray-4">{globalRate?.currency?.code || "No Configurada"}</span>
        );
      },
    },
    {
      key: "rate",
      header: "Valor Local",
      render: (rate) => (
        <span className="text-gray-4">{rate.rate} CLP</span>
      ),
    },
    {
      key: "actions",
      header: "Acciones",
      headerClassName: "text-right",
      cellClassName: "text-right",
      render: (rate) => (
        <div className="flex items-center justify-end gap-2">
          <button
            className="w-10 h-7 rounded-full border border-stroke flex items-center justify-center text-gray-4 hover:border-white hover:text-white transition-colors"
            onClick={() => openModal(rate)}
            title="Editar"
          >
            <IconPencil className="w-3.5 h-3.5" />
          </button>
          <button
            className="w-10 h-7 rounded-full border border-stroke flex items-center justify-center text-gray-4 hover:border-red-500 hover:text-red-500 transition-colors"
            onClick={() => deleteExchangeRate(rate)}
            title="Eliminar"
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
          <h1 className="text-2xl font-bold text-white">Tasas de Cambio</h1>
          <p className="text-gray-4 text-sm mt-1">Configura cuánto vale el dólar (u otras divisas) en tu tienda para cada juego.</p>
        </div>
        <Button onClick={() => openModal()}>
          Agregar Tasa
        </Button>
      </div>

      <List
        columns={columns}
        data={exchangeRates}
        loading={loading}
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
