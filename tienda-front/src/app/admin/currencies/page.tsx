"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { List, Column } from "@/components/ui/List";
import { Currency } from "@/types/currency";

// Custom Hook y Subcomponentes
import { useCurrencies } from "@/components/Admin/Currencies/hooks/useCurrencies";
import CurrencyModal from "@/components/Admin/Currencies/CurrencyModal";

export default function AdminCurrencies() {
  const { currencies, loading, refresh, deleteCurrency } = useCurrencies();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null);

  const openModal = (currency?: Currency) => {
    setSelectedCurrency(currency || null);
    setIsModalOpen(true);
  };

  const columns: Column<Currency>[] = [
    {
      key: "code",
      header: "Código",
      render: (currency) => (
        <span className="font-semibold text-white">{currency.code}</span>
      ),
    },
    {
      key: "name",
      header: "Nombre",
      render: (currency) => (
        <span className="text-gray-4">{currency.name || "-"}</span>
      ),
    },
    {
      key: "symbol",
      header: "Símbolo",
      render: (currency) => (
        <span className="text-gray-4">{currency.symbol || "-"}</span>
      ),
    },
    {
      key: "exchangeRate",
      header: "Tasa de Cambio",
      render: (currency) => (
        <span className="text-gray-4">{currency.exchangeRate}</span>
      ),
    },
    {
      key: "isDefault",
      header: "Principal",
      render: (currency) => (
        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${currency.isDefault ? 'bg-green-100 text-green-700' : 'bg-[#111318]00 text-gray-700'}`}>
          {currency.isDefault ? "Sí" : "No"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Acciones",
      headerClassName: "text-right",
      cellClassName: "text-right",
      render: (currency) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            size="sm"
            variant="secondary"
            className="px-3 bg-blue/10 text-blue hover:bg-blue hover:text-white"
            onClick={() => openModal(currency)}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
          </Button>
          <Button
            size="sm"
            variant="danger"
            className="px-3"
            onClick={() => deleteCurrency(currency)}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Divisas</h1>
          <p className="text-gray-4 text-sm mt-1">Administra los precios de cambio (Ej: Dólar a Pesos)</p>
        </div>
        <Button onClick={() => openModal()}>
          Agregar Divisa
        </Button>
      </div>

      {/* Tabla */}
      <List
        columns={columns}
        data={currencies}
        loading={loading}
        keyExtractor={(currency) => currency.id.toString()}
      />

      {/* Modal */}
      <CurrencyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currency={selectedCurrency}
        onSuccess={refresh}
      />
    </div>
  );
}
