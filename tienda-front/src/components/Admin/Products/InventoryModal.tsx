"use client";
import React, { useState, useEffect } from "react";
import { API_URL } from "@/utils/api";
import { useTranslations } from "next-intl";
import { useToast } from "@/hooks/useToast";
import { Product, InventoryItem } from "@/types/product";
import SearchableSelect from "@/components/Common/SearchableSelect";

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSuccess: () => void;
}

export default function InventoryModal({ isOpen, onClose, product, onSuccess }: InventoryModalProps) {
  const t = useTranslations("products");
  const tc = useTranslations("common");
  const { showToast } = useToast();

  const [languages, setLanguages] = useState<{ id: string, name: string }[]>([]);
  const [conditions, setConditions] = useState<{ id: string, name: string }[]>([]);
  const [newVariation, setNewVariation] = useState({
    languageId: "",
    conditionId: "",
    price: 0,
    stock: 0,
    isFoil: false
  });

  useEffect(() => {
    if (isOpen) {
      fetch(`${API_URL}/products/meta/languages`).then(r => r.json()).then(setLanguages);
      fetch(`${API_URL}/products/meta/conditions`).then(r => r.json()).then(setConditions);
    }
  }, [isOpen]);

  if (!isOpen || !product) return null;

  const handleAddVariation = async () => {
    if (!newVariation.languageId || !newVariation.conditionId) {
      showToast("Idioma y condición son obligatorios", "error");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/inventory`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newVariation, productId: product.id }),
        credentials: "include",
      });
      if (res.ok) {
        showToast("Variación añadida", "success");
        onSuccess();
        // Reset form
        setNewVariation({ languageId: "", conditionId: "", price: 0, stock: 0, isFoil: false });
      } else {
        showToast("Error al añadir variación", "error");
      }
    } catch (err) {
      showToast("Error de red", "error");
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm("¿Seguro que deseas eliminar esta variación?")) return;
    try {
      const res = await fetch(`${API_URL}/inventory/${id}`, { method: "DELETE", credentials: "include" });
      if (res.ok) {
        showToast("Variación eliminada", "success");
        onSuccess();
      }
    } catch (err) {
      showToast("Error al eliminar", "error");
    }
  };

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-8 shadow-2xl animate-in zoom-in-95 duration-200 scrollbar-hide">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-dark">{t("inventory.title") || "Gestionar Inventario"} - <span className="text-blue">{product.name}</span></h2>
          <button onClick={onClose} className="text-dark-4 hover:text-dark">✕</button>
        </div>

        {/* Formulario Nueva Variación */}
        <div className="mb-8 p-5 bg-gray-1 rounded-2xl border border-stroke">
          <h3 className="text-sm font-bold text-dark mb-4">Añadir Nueva Variación</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
            <div>
              <label className="mb-1 block text-xs font-medium text-dark-4">Idioma</label>
              <SearchableSelect
                options={languages.map(l => ({ label: l.name, value: l.id }))}
                value={newVariation.languageId}
                onChange={(val) => setNewVariation({ ...newVariation, languageId: val })}
                placeholder="Idioma..."
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-dark-4">Condición</label>
              <SearchableSelect
                options={conditions.map(c => ({ label: c.name, value: c.id }))}
                value={newVariation.conditionId}
                onChange={(val) => setNewVariation({ ...newVariation, conditionId: val })}
                placeholder="Condición..."
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-dark-4">Precio</label>
              <input
                type="number"
                value={newVariation.price}
                onChange={(e) => setNewVariation({ ...newVariation, price: Number(e.target.value) })}
                className="w-full rounded-xl border border-stroke bg-white py-2 px-3 text-sm outline-none focus:border-blue"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-dark-4">Stock</label>
              <input
                type="number"
                value={newVariation.stock}
                onChange={(e) => setNewVariation({ ...newVariation, stock: Number(e.target.value) })}
                className="w-full rounded-xl border border-stroke bg-white py-2 px-3 text-sm outline-none focus:border-blue"
              />
            </div>
            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2 cursor-pointer mb-2">
                <input
                  type="checkbox"
                  checked={newVariation.isFoil}
                  onChange={(e) => setNewVariation({ ...newVariation, isFoil: e.target.checked })}
                  className="accent-blue"
                />
                <span className="text-xs font-bold text-dark">¿Es Foil?</span>
              </label>
              <button
                onClick={handleAddVariation}
                className="w-full rounded-xl bg-blue py-2 text-xs font-bold text-white hover:bg-blue-700 transition-all"
              >
                Añadir
              </button>
            </div>
          </div>
        </div>

        {/* Tabla de Variaciones Actuales */}
        <div className="overflow-x-auto rounded-xl border border-stroke">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-gray-1 border-b border-stroke">
                <th className="p-3 font-bold text-dark-4">Idioma</th>
                <th className="p-3 font-bold text-dark-4">Condición</th>
                <th className="p-3 font-bold text-dark-4">Foil</th>
                <th className="p-3 font-bold text-dark-4">Precio</th>
                <th className="p-3 font-bold text-dark-4">Stock</th>
                <th className="p-3 font-bold text-dark-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {product.items.map((item: InventoryItem) => (
                <tr key={item.id} className="border-b border-stroke hover:bg-gray-50 transition-colors">
                  <td className="p-3 font-medium text-dark">{item.language?.name || "N/A"}</td>
                  <td className="p-3 text-dark">{item.condition_rel?.name || item.condition || "N/A"}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.isFoil ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-500'}`}>
                      {item.isFoil ? "FOIL" : "REG"}
                    </span>
                  </td>
                  <td className="p-3 font-bold text-blue">${item.price.toLocaleString()}</td>
                  <td className="p-3 text-dark">{item.stock}</td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="text-red-500 hover:text-red-700 transition-all"
                      title="Eliminar variación"
                    >
                      <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
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
            {tc("close") || "Cerrar"}
          </button>
        </div>
      </div>
    </div>
  );
}
