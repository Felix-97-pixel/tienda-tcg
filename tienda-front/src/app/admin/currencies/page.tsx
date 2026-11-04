"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { List, Column } from "@/components/ui/List";
import { useCurrencies } from "@/app/admin/_components/Currencies/hooks/useCurrencies";
import CurrencyModal from "@/app/admin/_components/Currencies/CurrencyModal";
import { IconPencil, IconTrash } from "@/components/ui/Icons";

export default function AdminCurrencies() {
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
      header: "Juego",
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
      header: "Divisa Base Global",
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
      header: "Valor Local (PVP Final)",
      render: (rate) => {
        const numRate = Number(rate.rate);
        return (
          <div>
            <span className="text-emerald-400 font-bold text-sm">
              ${numRate.toLocaleString("es-CL")} CLP
            </span>
            <span className="block text-[11px] text-gray-400">
              1 USD = ${numRate.toLocaleString("es-CL")} CLP (PVP final con IVA)
            </span>
          </div>
        );
      },
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
            title="Editar Tasa"
          >
            <IconPencil className="w-3.5 h-3.5" />
          </button>
          <button
            className="w-10 h-7 rounded-full border border-stroke flex items-center justify-center text-gray-4 hover:border-red hover:text-red transition-colors"
            onClick={() => deleteExchangeRate(rate)}
            title="Eliminar Tasa"
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
            <h1 className="text-2xl font-bold text-white tracking-tight">Tasas de Cambio</h1>
            {branchName && (
              <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-white/70 font-medium">
                Sucursal: <strong className="text-white">{branchName}</strong>
              </span>
            )}
          </div>
          <p className="text-gray-4 text-sm mt-1">
            Configura el valor de conversión en CLP para cada juego. Este valor fija el Precio Final de Venta al Público (con IVA incluido) en tu tienda.
          </p>
        </div>
        <Button onClick={() => openModal()}>
          Agregar Tasa
        </Button>
      </div>

      <List
        columns={columns}
        data={exchangeRates}
        loading={loading}
        emptyMessage="No tienes tasas de cambio configuradas aún para esta sucursal. Haz clic en 'Agregar Tasa' para configurar una."
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
