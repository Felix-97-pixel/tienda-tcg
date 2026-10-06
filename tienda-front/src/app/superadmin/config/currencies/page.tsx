"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { List, Column } from "@/components/ui/List";
import { useCurrencies } from "@/app/superadmin/_components/Currencies/hooks/useCurrencies";
import CurrencyModal from "@/app/superadmin/_components/Currencies/CurrencyModal";

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
      header: "Divisa Base",
      render: (rate) => (
        <span className="text-gray-4">{rate.currency?.code} ({rate.currency?.symbol})</span>
      ),
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
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
          </button>
          <button
            className="w-10 h-7 rounded-full border border-stroke flex items-center justify-center text-gray-4 hover:border-red-500 hover:text-red-500 transition-colors"
            onClick={() => deleteExchangeRate(rate)}
            title="Eliminar"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
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
