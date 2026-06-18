"use client";
import React, { useState, useEffect } from "react";
import { API_URL } from "@/utils/api";
import { useTranslations } from "next-intl";
import { useToast } from "@/hooks/useToast";
import { Modal } from "@/components/ui/Modal";
import SearchableSelect from "@/components/ui/SearchableSelect";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Product } from "@/types/product";

export interface BuylistModalProps {
  product: Product;
  onClose: () => void;
  onUpdate: () => void;
}

export default function BuylistModal({ product: initialProduct, onClose, onUpdate }: BuylistModalProps) {
  const t = useTranslations("products");
  const tc = useTranslations("common");
  const { showToast } = useToast();
  const [product, setProduct] = useState(initialProduct);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

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
  }, [initialProduct]);

  const [languages, setLanguages] = useState<{ id: string, name: string }[]>([]);
  const [conditions, setConditions] = useState<{ id: string, name: string }[]>([]);
  
  const [newVariation, setNewVariation] = useState({
    languageId: "",
    conditionId: "",
    quantityWanted: 1,
    cashPrice: 0,
    creditPrice: 0,
    isActive: true
  });

  useEffect(() => {
    fetch(`${API_URL}/products/meta/languages`).then(r => r.json()).then(setLanguages);
    fetch(`${API_URL}/products/meta/conditions`).then(r => r.json()).then(setConditions);
  }, []);

  const handleAddVariation = async () => {
    if (!newVariation.languageId || !newVariation.conditionId) {
      showToast("Debes seleccionar idioma y condición", "error");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/buylist/me`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newVariation, productId: product.id }),
        credentials: "include",
      });

      if (res.ok) {
        showToast("Solicitud agregada correctamente", "success");
        setNewVariation({ ...newVariation, quantityWanted: 1, cashPrice: 0, creditPrice: 0 });
        await refreshProduct();
        onUpdate();
      } else {
        const errorData = await res.json();
        showToast(errorData.message || "Error al agregar solicitud", "error");
      }
    } catch (err) {
      showToast(tc("networkError"), "error");
    }
  };

  const handleUpdateItem = async (itemId: string, updates: any) => {
    try {
      const res = await fetch(`${API_URL}/buylist/me/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        credentials: "include",
      });

      if (res.ok) {
        showToast("Solicitud actualizada", "success");
        await refreshProduct();
        onUpdate();
      } else {
        showToast(tc("error"), "error");
      }
    } catch (err) {
      showToast(tc("networkError"), "error");
    }
  };

  const confirmDelete = (id: string) => {
    setItemToDelete(id);
  };

  const handleDeleteItem = async () => {
    if (!itemToDelete) return;

    try {
      const res = await fetch(`${API_URL}/buylist/me/${itemToDelete}`, { method: "DELETE", credentials: "include" });
      if (res.ok) {
        showToast("Solicitud eliminada", "success");
        setItemToDelete(null);
        await refreshProduct();
        onUpdate();
      } else {
        showToast("Error al eliminar", "error");
      }
    } catch (err) {
      showToast(tc("networkError"), "error");
    }
  };

  if (!product) return null;

  // TypeScript assertion to handle dynamically attached buyListItems
  const buyListItems = (product as any).buyListItems || [];

  return (
    <>
    <Modal
      isOpen={true}
      onClose={onClose}
      title={<>Gestionar Buylist - <span className="text-blue">{product?.name}</span></>}
      maxWidth="4xl"
    >

      {/* Formulario Nueva Variación */}
      <div className="mb-8 p-5 bg-[#111318] rounded-2xl border border-stroke">
        <h3 className="text-sm font-bold text-white mb-4">Añadir Nueva Solicitud de Compra</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-4">Idioma</label>
            <SearchableSelect
              options={languages.map(l => ({ label: l.name, value: l.id }))}
              value={newVariation.languageId}
              onChange={(val) => setNewVariation({ ...newVariation, languageId: val })}
              placeholder="Idioma..."
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-4">Condición</label>
            <SearchableSelect
              options={conditions.map(c => ({ label: c.name, value: c.id }))}
              value={newVariation.conditionId}
              onChange={(val) => setNewVariation({ ...newVariation, conditionId: val })}
              placeholder="Condición..."
            />
          </div>
          <div>
            <Input
              label="Cant. Buscada"
              type="number"
              value={newVariation.quantityWanted}
              onChange={(e) => setNewVariation({ ...newVariation, quantityWanted: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-4">Precio Cash ($)</label>
            <input
              type="number"
              className="w-full rounded-lg border border-stroke bg-[#0f1115] px-4 py-2.5 text-green-400 font-bold focus:border-blue outline-none transition"
              value={newVariation.cashPrice}
              onChange={(e) => setNewVariation({ ...newVariation, cashPrice: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-4">Precio SC ($)</label>
            <input
              type="number"
              className="w-full rounded-lg border border-stroke bg-[#0f1115] px-4 py-2.5 text-blue font-bold focus:border-blue outline-none transition"
              value={newVariation.creditPrice}
              onChange={(e) => setNewVariation({ ...newVariation, creditPrice: Number(e.target.value) })}
            />
          </div>
          <div className="flex flex-col justify-end">
            <Button
              variant="success"
              onClick={handleAddVariation}
              fullWidth
            >
              AÑADIR
            </Button>
          </div>
        </div>
      </div>

      {/* Tabla de Variaciones Actuales */}
      <div className="overflow-x-auto rounded-xl border border-stroke">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-[#111318] border-b border-stroke">
              <th className="p-3 font-bold text-gray-4">Idioma</th>
              <th className="p-3 font-bold text-gray-4">Condición</th>
              <th className="p-3 font-bold text-gray-4">Buscados</th>
              <th className="p-3 font-bold text-gray-4">Cash ($)</th>
              <th className="p-3 font-bold text-gray-4">Crédito ($)</th>
              <th className="p-3 font-bold text-gray-4 text-center">Estado</th>
              <th className="p-3 font-bold text-gray-4 text-center">{tc("actions")}</th>
            </tr>
          </thead>
          <tbody>
            {buyListItems.length === 0 && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-gray-4">
                  No estás comprando ninguna variación de esta carta.
                </td>
              </tr>
            )}
            {buyListItems.map((item: any) => (
                <tr key={item.id} className="border-b border-stroke hover:bg-gray-50 transition-colors">
                  <td className="p-3 font-medium text-white">{item.language?.name || "N/A"}</td>
                  <td className="p-3 text-white">
                    {item.condition?.name || "N/A"}
                  </td>
                  <td className="p-3">
                    <input
                      type="number"
                      className="w-16 rounded border border-stroke p-1 text-xs font-bold text-white bg-transparent"
                      defaultValue={item.quantityWanted}
                      onBlur={(e) => handleUpdateItem(item.id, { quantityWanted: Number(e.target.value) })}
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="number"
                      className="w-24 rounded border border-stroke p-1 text-xs font-bold text-green-400 bg-transparent"
                      defaultValue={item.cashPrice}
                      onBlur={(e) => handleUpdateItem(item.id, { cashPrice: Number(e.target.value) })}
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="number"
                      className="w-24 rounded border border-stroke p-1 text-xs font-bold text-blue bg-transparent"
                      defaultValue={item.creditPrice}
                      onBlur={(e) => handleUpdateItem(item.id, { creditPrice: Number(e.target.value) })}
                    />
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => handleUpdateItem(item.id, { isActive: !item.isActive })}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg shadow-sm transition-all text-white ${item.isActive ? "bg-green hover:bg-green-dark border border-green" : "bg-yellow hover:bg-yellow-dark border border-yellow"}`}
                    >
                      {item.isActive ? "Publicado" : "Pausado"}
                    </button>
                  </td>
                  <td className="p-3 text-center">
                    <Button variant="danger" size="sm" onClick={() => confirmDelete(item.id)}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </Button>
                  </td>
                </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 flex justify-end">
        <Button
          variant="secondary"
          onClick={onClose}
        >
          {tc("close")}
        </Button>
      </div>
    </Modal>

      {/* Modal de confirmación de eliminación */}
      <Modal isOpen={!!itemToDelete} onClose={() => setItemToDelete(null)} title="Confirmar Eliminación">
        <div className="p-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-red/10 rounded-full flex items-center justify-center text-red">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h3 className="text-xl font-bold text-white">¿Eliminar solicitud?</h3>
            <p className="text-gray-4">
              ¿Estás seguro que deseas eliminar esta solicitud de compra permanentemente?
            </p>
          </div>
          <div className="flex gap-3 mt-8">
            <Button variant="secondary" className="flex-1" onClick={() => setItemToDelete(null)}>
              Cancelar
            </Button>
            <Button variant="danger" className="flex-1" onClick={handleDeleteItem}>
              Sí, eliminar
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
