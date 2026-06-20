"use client";
import React, { useState, useEffect } from "react";
import { API_URL } from "@/utils/api";
import { useTranslations } from "next-intl";
import { useToast } from "@/hooks/useToast";
import { Modal } from "@/components/ui/Modal";
import { InventoryItem } from "@/types/inventoryItem";
import SearchableSelect from "@/components/ui/SearchableSelect";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Product } from "@/types/product";

export interface SuperAdminInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSuccess: () => void;
}

export default function SuperAdminInventoryModal({ isOpen, onClose, product: initialProduct, onSuccess }: SuperAdminInventoryModalProps) {
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

  const handleUpdateItem = async (itemId: string, price: number, stock: number, isPublished?: boolean) => {
    try {
      const payload: any = { price, stock };
      if (isPublished !== undefined) {
        payload.isPublished = isPublished;
      }
      const res = await fetch(`${API_URL}/products/inventory/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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

  const confirmDelete = (id: string) => {
    setItemToDelete(id);
  };

  const handleDeleteItem = async () => {
    if (!itemToDelete) return;

    try {
      const res = await fetch(`${API_URL}/products/inventory/${itemToDelete}`, { method: "DELETE", credentials: "include" });
      if (res.ok) {
        showToast(t("inventory.successDelete"), "success");
        setItemToDelete(null);
        await refreshProduct();
        onSuccess();
      } else {
        showToast(t("inventory.errorDelete"), "error");
      }
    } catch (err) {
      showToast(tc("networkError"), "error");
    }
  };

  if (!isOpen || !product) return null;

  return (
    <>
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={<>{t("inventory.title")} - <span className="text-blue">{product?.name}</span></>}
      maxWidth="4xl"
    >

      {/* Formulario Nueva Variación */}
      <div className="mb-8 p-5 bg-[#111318] rounded-2xl border border-stroke">
        <h3 className="text-sm font-bold text-white mb-4">{t("inventory.addVariation")}</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-4">{t("inventory.language")}</label>
            <SearchableSelect
              options={languages.map(l => ({ label: l.name, value: l.id }))}
              value={newVariation.languageId}
              onChange={(val) => setNewVariation({ ...newVariation, languageId: val })}
              placeholder={`${t("inventory.language")}...`}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-4">{t("inventory.condition")}</label>
            <SearchableSelect
              options={conditions.map(c => ({ label: c.name, value: c.id }))}
              value={newVariation.conditionId}
              onChange={(val) => setNewVariation({ ...newVariation, conditionId: val })}
              placeholder={`${t("inventory.condition")}...`}
            />
          </div>
          <div>
            <Input
              label={t("inventory.price")}
              type="number"
              value={newVariation.price}
              onChange={(e) => setNewVariation({ ...newVariation, price: Number(e.target.value) })}
            />
          </div>
          <div>
            <Input
              label={t("inventory.stock")}
              type="number"
              value={newVariation.stock}
              onChange={(e) => setNewVariation({ ...newVariation, stock: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-4">Acabado</label>
            <SearchableSelect
              options={finishes.map(f => ({ label: f.name, value: f.id }))}
              value={newVariation.finishId}
              onChange={(val) => setNewVariation({ ...newVariation, finishId: val })}
              placeholder="Acabado..."
            />
          </div>
          <div className="flex flex-col justify-end">
            <Button
              variant="success"
              onClick={handleAddVariation}
              fullWidth
            >
              {t("inventory.add")}
            </Button>
          </div>
        </div>
      </div>

      {/* Tabla de Variaciones Actuales */}
      <div className="overflow-x-auto rounded-xl border border-stroke">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-[#111318] border-b border-stroke">
              <th className="p-3 font-bold text-gray-4">{t("inventory.language")}</th>
              <th className="p-3 font-bold text-gray-4">{t("inventory.condition")}</th>
              <th className="p-3 font-bold text-gray-4">Acabado</th>              <th className="p-3 font-bold text-gray-4">{t("inventory.price")}</th>
            </tr>
          </thead>
          <tbody>
            {product.marketPrices?.map((mp: any) => (
              <tr key={mp.id} className="border-b border-stroke hover:bg-gray-50 transition-colors">
                <td className="p-3 font-medium text-white">English</td>
                <td className="p-3 text-white">Near Mint</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${mp.finish?.name && mp.finish.name !== 'Normal' ? 'bg-purple-100 text-purple-600' : 'bg-[#111318]00 text-gray-5'}`}>
                    {mp.finish?.name || "-"}
                  </span>
                </td>
                <td className="p-3 font-bold text-green-400">
                  ${Number(mp.price).toLocaleString()}
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
            <h3 className="text-xl font-bold text-white">¿Eliminar variante?</h3>
            <p className="text-gray-4">
              ¿Estás seguro que deseas eliminar esta variante de precio permanentemente?
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
