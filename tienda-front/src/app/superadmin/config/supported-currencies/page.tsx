"use client";
import React, { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { List, Column } from "@/components/ui/List";
import { API_URL } from "@/utils/api";
import { useToast } from "@/hooks/useToast";
import { useTranslations } from "next-intl";
import { IconPencil, IconTrash } from "@/components/ui/Icons";

interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
}

export default function SupportedCurrenciesPage() {
  const t = useTranslations("supported_currencies_page");
  const tCommon = useTranslations("common");
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

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
        showToast(editing ? t("toast_saved") : t("toast_saved"), "success");
        setIsOpen(false);
        fetchData();
      } else {
        const err = await res.json();
        showToast(err.message || t("toast_saved"), "error");
      }
    } catch {
      showToast(tCommon("network_error") || "Error", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (c: Currency) => {
    if (!confirm(t("confirm_delete", { code: c.code }))) return;
    const res = await fetch(`${API_URL}/currencies/supported/${c.id}`, { method: "DELETE", credentials: "include" });
    if (res.ok) {
      showToast(t("toast_deleted"), "success");
      fetchData();
    } else {
      const err = await res.json();
      showToast(err.message || t("toast_deleted"), "error");
    }
  };

  const columns: Column<Currency>[] = [
    { key: "code", header: t("col_code"), render: (c) => <span className="font-semibold text-white">{c.code}</span> },
    { key: "name", header: t("col_name"), render: (c) => <span className="text-gray-4">{c.name}</span> },
    { key: "symbol", header: t("col_symbol"), render: (c) => <span className="text-gray-4">{c.symbol}</span> },
    {
      key: "actions",
      header: t("col_actions"),
      headerClassName: "text-right",
      cellClassName: "text-right",
      render: (c) => (
        <div className="flex items-center justify-end gap-2">
          <button
            className="w-10 h-7 rounded-full border border-stroke flex items-center justify-center text-gray-4 hover:border-white hover:text-white transition-colors"
            onClick={() => openModal(c)}
            title={tCommon("edit")}
          >
            <IconPencil className="w-3.5 h-3.5" />
          </button>
          <button
            className="w-10 h-7 rounded-full border border-stroke flex items-center justify-center text-gray-4 hover:border-red-500 hover:text-red-500 transition-colors"
            onClick={() => handleDelete(c)}
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
        <Button id="add-supported-currency" onClick={() => openModal()}>
          {t("btn_new_currency")}
        </Button>
      </div>

      <List columns={columns} data={currencies} loading={loading} keyExtractor={(c) => c.id} />

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={editing ? t("modal_edit_title") : t("modal_add_title")}
        maxWidth="md"
      >
        <form onSubmit={handleSave} className="space-y-5">
          <Input
            label={t("field_code")}
            required
            maxLength={5}
            value={form.code}
            placeholder={t("placeholder_code")}
            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
          />
          <Input
            label={t("field_name")}
            required
            value={form.name}
            placeholder={t("placeholder_name")}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            label={t("field_symbol")}
            required
            maxLength={4}
            value={form.symbol}
            placeholder={t("placeholder_symbol")}
            onChange={(e) => setForm({ ...form, symbol: e.target.value })}
          />
          <div className="flex justify-end gap-3 pt-6 border-t border-stroke mt-6">
            <Button type="button" variant="secondary" onClick={() => setIsOpen(false)} disabled={saving}>
              {t("btn_cancel")}
            </Button>
            <Button type="submit" isLoading={saving}>
              {t("btn_save")}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}