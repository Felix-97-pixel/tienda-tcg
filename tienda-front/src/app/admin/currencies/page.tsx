"use client";
import React, { useEffect, useState } from "react";
import { API_URL } from "@/utils/api";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import { List, Column } from "@/components/ui/List";
import { Currency } from "@/types/currency";

export default function AdminCurrencies() {
  const { showToast } = useToast();

  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null);

  // Form states
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [exchangeRate, setExchangeRate] = useState<number | "">("");
  const [isDefault, setIsDefault] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchCurrencies = () => {
    setLoading(true);
    fetch(`${API_URL}/currencies`)
      .then((res) => res.json())
      .then((data) => {
        setCurrencies(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching currencies:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCurrencies();
  }, []);

  const openModal = (currency?: Currency) => {
    if (currency) {
      setSelectedCurrency(currency);
      setCode(currency.code);
      setName(currency.name || "");
      setSymbol(currency.symbol || "$");
      setExchangeRate(currency.exchangeRate);
      setIsDefault(currency.isDefault);
    } else {
      setSelectedCurrency(null);
      setCode("");
      setName("");
      setSymbol("$");
      setExchangeRate("");
      setIsDefault(false);
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (currency: Currency) => {
    if (!confirm(`¿Seguro que deseas eliminar la divisa ${currency.code}?`)) return;
    try {
      const res = await fetch(`${API_URL}/currencies/${currency.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        showToast("Divisa eliminada", "success");
        fetchCurrencies();
      } else {
        const errData = await res.json();
        showToast(errData.message || "Error al eliminar divisa", "error");
      }
    } catch (e) {
      showToast("Error de red", "error");
    }
  };

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
      const url = selectedCurrency
        ? `${API_URL}/currencies/${selectedCurrency.id}`
        : `${API_URL}/currencies`;
      const method = selectedCurrency ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showToast("Divisa guardada correctamente", "success");
        setIsModalOpen(false);
        fetchCurrencies();
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

  const columns: Column<Currency>[] = [
    {
      key: "code",
      header: "Código",
      render: (currency) => (
        <span className="font-semibold text-dark">{currency.code}</span>
      ),
    },
    {
      key: "name",
      header: "Nombre",
      render: (currency) => (
        <span className="text-dark-4">{currency.name || "-"}</span>
      ),
    },
    {
      key: "symbol",
      header: "Símbolo",
      render: (currency) => (
        <span className="text-dark-4">{currency.symbol || "-"}</span>
      ),
    },
    {
      key: "exchangeRate",
      header: "Tasa de Cambio",
      render: (currency) => (
        <span className="text-dark-4">{currency.exchangeRate}</span>
      ),
    },
    {
      key: "isDefault",
      header: "Principal",
      render: (currency) => (
        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${currency.isDefault ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
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
            onClick={() => handleDelete(currency)}
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
          <h1 className="text-2xl font-bold text-dark">Divisas</h1>
          <p className="text-dark-4 text-sm mt-1">Administra los precios de cambio (Ej: Dólar a Pesos)</p>
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
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedCurrency ? "Editar Divisa" : "Agregar Divisa"}
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
            <p className="text-xs text-dark-4 mt-1.5 ml-1">Valor de 1 unidad de esta divisa en la moneda principal (Ej: 1 USD = 950 CLP)</p>
          </div>

          <div className="pt-2">
            <Checkbox
              label="Divisa Principal"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-stroke mt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" isLoading={saving}>
              Guardar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
