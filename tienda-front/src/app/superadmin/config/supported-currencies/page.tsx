"use client";
import React, { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { List, Column } from "@/components/ui/List";
import { API_URL } from "@/utils/api";
import { useToast } from "@/hooks/useToast";

interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
}

export default function SupportedCurrenciesPage() {
  const { showToast } = useToast();
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<Currency | null>(null);
  const [form, setForm] = useState({ code: "", name: "", symbol: "" });
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/currencies/supported`);
      if (res.ok) setCurrencies(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openModal = (c?: Currency) => {
    setEditing(c || null);
    setForm(c ? { code: c.code, name: c.name, symbol: c.symbol } : { code: "", name: "", symbol: "$" });
    setIsOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/currencies/supported${editing ? `/${editing.id}` : ""}`, {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      if (res.ok) {
        showToast(editing ? "Divisa actualizada" : "Divisa creada", "success");
        setIsOpen(false);
        fetchData();
      } else {
        const err = await res.json();
        showToast(err.message || "Error al guardar", "error");
      }
    } catch {
      showToast("Error de red", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (c: Currency) => {
    if (!confirm(`¿Eliminar la divisa ${c.code}?`)) return;
    const res = await fetch(`${API_URL}/currencies/supported/${c.id}`, { method: "DELETE", credentials: "include" });
    if (res.ok) {
      showToast("Divisa eliminada", "success");
      fetchData();
    } else {
      const err = await res.json();
      showToast(err.message || "Error al eliminar", "error");
    }
  };

  const columns: Column<Currency>[] = [
    { key: "code", header: "Código", render: (c) => <span className="font-semibold text-white">{c.code}</span> },
    { key: "name", header: "Nombre", render: (c) => <span className="text-gray-4">{c.name}</span> },
    { key: "symbol", header: "Símbolo", render: (c) => <span className="text-gray-4">{c.symbol}</span> },
    {
      key: "actions",
      header: "Acciones",
      headerClassName: "text-right",
      cellClassName: "text-right",
      render: (c) => (
        <div className="flex items-center justify-end gap-2">
          <button
            className="w-10 h-7 rounded-full border border-stroke flex items-center justify-center text-gray-4 hover:border-white hover:text-white transition-colors"
            onClick={() => openModal(c)}
            title="Editar"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
          </button>
          <button
            className="w-10 h-7 rounded-full border border-stroke flex items-center justify-center text-gray-4 hover:border-red-500 hover:text-red-500 transition-colors"
            onClick={() => handleDelete(c)}
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
          <h1 className="text-2xl font-bold text-white">Divisas Soportadas</h1>
          <p className="text-gray-4 text-sm mt-1">Define las divisas base (USD, EUR...) que luego podrás asociar a cada juego.</p>
        </div>
        <Button id="add-supported-currency" onClick={() => openModal()}>Agregar Divisa</Button>
      </div>

      <List columns={columns} data={currencies} loading={loading} keyExtractor={(c) => c.id} />

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={editing ? "Editar Divisa" : "Agregar Divisa"} maxWidth="md">
        <form onSubmit={handleSave} className="space-y-5">
          <Input label="Código *" required maxLength={5} value={form.code} placeholder="USD"
            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} />
          <Input label="Nombre *" required value={form.name} placeholder="Dólar estadounidense"
            onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Símbolo *" required maxLength={4} value={form.symbol} placeholder="$"
            onChange={(e) => setForm({ ...form, symbol: e.target.value })} />
          <div className="flex justify-end gap-3 pt-6 border-t border-stroke mt-6">
            <Button type="button" variant="secondary" onClick={() => setIsOpen(false)} disabled={saving}>Cancelar</Button>
            <Button type="submit" isLoading={saving}>Guardar</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
