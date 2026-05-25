"use client";
import React, { useState, useEffect } from "react";
import { API_URL } from "@/utils/api";
import { useTranslations } from "next-intl";
import { useToast } from "@/hooks/useToast";
import { Product } from "@/types/product";
import { InventoryItem } from "@/types/inventoryItem";
import SearchableSelect from "@/components/ui/SearchableSelect";

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSuccess: () => void;
}

export default function InventoryModal({ isOpen, onClose, product: initialProduct, onSuccess }: InventoryModalProps) {
  const t = useTranslations("products");
  const tc = useTranslations("common");
  const { showToast } = useToast();
  const [product, setProduct] = useState(initialProduct);

  const refreshProduct = async () => {
    try {
      const res = await fetch(`${API_URL}/products/${product?.id}`, { credentials: "include" });
      const data = await res.json();
      if (res.ok) setProduct(data);
    } catch (err) {
      console.error("Error refreshing product:", err);
    }
  };

  useEffect(() => {
    setProduct(initialProduct);
  }, [initialProduct, isOpen]);

  const [languages, setLanguages] = useState<{ id: string, name: string }[]>([]);
  const [conditions, setConditions] = useState<{ id: string, name: string }[]>([]);
  const [finishes, setFinishes] = useState<{ id: string, name: string }[]>([]);
  const [newVariation, setNewVariation] = useState({
    languageId: "",
    conditionId: "",
    finishId: "",
    price: 0,
    stock: 0
  });

  useEffect(() => {
    if (isOpen) {
      fetch(`${API_URL}/products/meta/languages`).then(r => r.json()).then(setLanguages);
      fetch(`${API_URL}/products/meta/conditions`).then(r => r.json()).then(setConditions);
      if (product?.cardDetail?.game) {
        fetch(`${API_URL}/products/meta/finishes?game=${encodeURIComponent(product.cardDetail.game)}`)
          .then(r => r.json())
          .then(setFinishes);
      }
    }
  }, [isOpen, product?.cardDetail?.game]);

  if (!isOpen || !product) return null;

  const handleAddVariation = async () => {
    if (!newVariation.languageId || !newVariation.conditionId) {
      showToast(t("inventory.requiredFields"), "error");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/products/${product.id}/inventory`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newVariation, productId: product.id }),
        credentials: "include",
      });

      if (res.ok) {
        showToast(t("inventory.successAdd"), "success");
        setNewVariation({ languageId: "", conditionId: "", finishId: "", price: 0, stock: 0 });
        await refreshProduct();
        onSuccess();
      } else {
        showToast(t("inventory.errorAdd"), "error");
      }
    } catch (err) {
      showToast(tc("networkError"), "error");
    }
  };

  const handleUpdateItem = async (itemId: string, price: number, stock: number) => {
    try {
      const res = await fetch(`${API_URL}/products/inventory/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price, stock }),
        credentials: "include",
      });

      if (res.ok) {
        showToast(tc("success"), "success");
        await refreshProduct();
        onSuccess();
      } else {
        showToast(tc("error"), "error");
      }
    } catch (err) {
      showToast(tc("networkError"), "error");
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm(t("inventory.deleteConfirm"))) return;

    try {
      const res = await fetch(`${API_URL}/products/inventory/${id}`, { method: "DELETE", credentials: "include" });
      if (res.ok) {
        showToast(t("inventory.successDelete"), "success");
        await refreshProduct();
        onSuccess();
      } else {
        showToast(t("inventory.errorDelete"), "error");
      }
    } catch (err) {
      showToast(tc("networkError"), "error");
    }
  };

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-8 shadow-2xl animate-in zoom-in-95 duration-200 scrollbar-hide">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-dark">{t("inventory.title")} - <span className="text-blue">{product.name}</span></h2>
          <button onClick={onClose} className="text-dark-4 hover:text-dark">✕</button>
        </div>

        {/* Formulario Nueva Variación */}
        <div className="mb-8 p-5 bg-gray-1 rounded-2xl border border-stroke">
          <h3 className="text-sm font-bold text-dark mb-4">{t("inventory.addVariation")}</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
            <div>
              <label className="mb-1 block text-xs font-medium text-dark-4">{t("inventory.language")}</label>
              <SearchableSelect
                options={languages.map(l => ({ label: l.name, value: l.id }))}
                value={newVariation.languageId}
                onChange={(val) => setNewVariation({ ...newVariation, languageId: val })}
                placeholder={`${t("inventory.language")}...`}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-dark-4">{t("inventory.condition")}</label>
              <SearchableSelect
                options={conditions.map(c => ({ label: c.name, value: c.id }))}
                value={newVariation.conditionId}
                onChange={(val) => setNewVariation({ ...newVariation, conditionId: val })}
                placeholder={`${t("inventory.condition")}...`}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-dark-4">{t("inventory.price")}</label>
              <input
                type="number"
                value={newVariation.price}
                onChange={(e) => setNewVariation({ ...newVariation, price: Number(e.target.value) })}
                className="w-full rounded-xl border border-stroke bg-white py-2 px-3 text-sm outline-none focus:border-blue"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-dark-4">{t("inventory.stock")}</label>
              <input
                type="number"
                value={newVariation.stock}
                onChange={(e) => setNewVariation({ ...newVariation, stock: Number(e.target.value) })}
                className="w-full rounded-xl border border-stroke bg-white py-2 px-3 text-sm outline-none focus:border-blue"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-dark-4">Acabado</label>
              <SearchableSelect
                options={finishes.map(f => ({ label: f.name, value: f.id }))}
                value={newVariation.finishId}
                onChange={(val) => setNewVariation({ ...newVariation, finishId: val })}
                placeholder="Acabado..."
              />
            </div>
            <div className="flex flex-col justify-end">
              <button
                onClick={handleAddVariation}
                className="w-full rounded-xl btn-green py-3 text-sm font-bold shadow-lg shadow-green-600/10 transition-all active:scale-95"
              >
                {t("inventory.add")}
              </button>
            </div>
          </div>
        </div>

        {/* Tabla de Variaciones Actuales */}
        <div className="overflow-x-auto rounded-xl border border-stroke">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-gray-1 border-b border-stroke">
                <th className="p-3 font-bold text-dark-4">{t("inventory.language")}</th>
                <th className="p-3 font-bold text-dark-4">{t("inventory.condition")}</th>
                <th className="p-3 font-bold text-dark-4">Acabado</th>
                <th className="p-3 font-bold text-dark-4">{t("inventory.price")}</th>
                <th className="p-3 font-bold text-dark-4">{t("inventory.stock")}</th>
                <th className="p-3 font-bold text-dark-4 text-center">{tc("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {product.items.map((item: InventoryItem) => (
                <tr key={item.id} className="border-b border-stroke hover:bg-gray-50 transition-colors">
                  <td className="p-3 font-medium text-dark">{item.language?.name || "N/A"}</td>
                  <td className="p-3 text-dark">
                    {item.condition_rel?.name || (typeof item.condition === 'object' ? (item.condition as any).name : item.condition) || "N/A"}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.finish?.name && item.finish.name !== 'Normal' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-500'}`}>
                      {item.finish?.name || "Normal"}
                    </span>
                  </td>
                  <td className="p-3">
                    <input 
                      type="number" 
                      className="w-20 rounded border border-stroke p-1 text-xs font-bold text-blue"
                      defaultValue={item.price}
                      onBlur={(e) => handleUpdateItem(item.id, Number(e.target.value), item.stock)}
                    />
                  </td>
                  <td className="p-3">
                    <input 
                      type="number" 
                      className="w-16 rounded border border-stroke p-1 text-xs text-dark"
                      defaultValue={item.stock}
                      onBlur={(e) => handleUpdateItem(item.id, item.price, Number(e.target.value))}
                    />
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="text-red-500 hover:text-red-700 transition-colors p-2"
                      title={t("inventory.successDelete")}
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={onClose}
            className="px-8 rounded-xl bg-gray-2 py-3 font-bold text-dark hover:bg-gray-3 transition-all"
          >
            {tc("close")}
          </button>
        </div>
      </div>
    </div>
  );
}
