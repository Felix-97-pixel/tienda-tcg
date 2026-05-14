"use client";
import React, { useState, useEffect } from "react";
import { API_URL } from "@/utils/api";
import { useTranslations } from "next-intl";
import { useToast } from "@/hooks/useToast";
import { useImageUpload } from "@/hooks/useImageUpload";
import SearchableSelect from "@/components/Common/SearchableSelect";
import Image from "next/image";

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: {
    productId: string;
    categoryId: string;
    brandId: string;
    imageUrl: string;
    productName: string;
    itemId: string;
    price: number;
    stock: number;
  } | null;
  categories: { id: string, name: string }[];
  brands: { id: string, name: string }[];
  onSuccess: () => void;
}

export default function EditProductModal({ isOpen, onClose, item, categories, brands, onSuccess }: EditProductModalProps) {
  const t = useTranslations("products");
  const tc = useTranslations("common");
  const { showToast } = useToast();
  const { isUploading: uploadingImage, handleUpload, handleRemove } = useImageUpload();

  const [form, setForm] = useState({
    name: "",
    categoryId: "",
    brandId: "",
    imageUrl: "",
    price: 0,
    stock: 0,
  });

  useEffect(() => {
    if (item) {
      setForm({
        name: item.productName,
        categoryId: item.categoryId,
        brandId: item.brandId || "",
        imageUrl: item.imageUrl || "",
        price: item.price,
        stock: item.stock,
      });
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const handleUpdate = async () => {
    try {
      // 1. Actualizar Producto (Nombre, Categoría, Marca, Imagen)
      const prodRes = await fetch(`${API_URL}/products/${item.productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          categoryId: form.categoryId,
          brandId: form.brandId,
          imageUrl: form.imageUrl,
        }),
        credentials: "include",
      });

      // 2. Actualizar Ítem de Inventario (Precio, Stock)
      const itemRes = await fetch(`${API_URL}/inventory/${item.itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          price: form.price,
          stock: form.stock,
        }),
        credentials: "include",
      });

      if (prodRes.ok && itemRes.ok) {
        showToast("Producto actualizado correctamente", "success");
        onSuccess();
        onClose();
      } else {
        showToast("Error al actualizar", "error");
      }
    } catch (err) {
      showToast("Error de red", "error");
    }
  };

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-2xl bg-white p-8 shadow-2xl animate-in zoom-in-95 duration-200">
        <h2 className="mb-6 text-xl font-bold text-dark">{t("edit.title") || "Editar Producto"}</h2>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-dark-4">{t("create.name")}</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-xl border border-stroke bg-gray-1 py-2.5 px-4 text-sm outline-none focus:border-blue transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-dark-4">{t("create.category")}</label>
              <SearchableSelect
                options={categories.map(c => ({ label: c.name, value: c.id }))}
                value={form.categoryId}
                onChange={(val) => setForm({ ...form, categoryId: val })}
                placeholder="Categoría..."
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-dark-4">{t("create.brand")}</label>
              <SearchableSelect
                options={brands.map(b => ({ label: b.name, value: b.id }))}
                value={form.brandId}
                onChange={(val) => setForm({ ...form, brandId: val })}
                placeholder="Marca..."
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-dark-4">{t("create.price")}</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                className="w-full rounded-xl border border-stroke bg-gray-1 py-2.5 px-4 text-sm outline-none focus:border-blue transition-all"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-dark-4">{t("create.stock")}</label>
              <input
                type="number"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                className="w-full rounded-xl border border-stroke bg-gray-1 py-2.5 px-4 text-sm outline-none focus:border-blue transition-all"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-dark-4">{t("create.image")}</label>
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-gray-1 border border-stroke flex items-center justify-center">
                {form.imageUrl ? (
                  <div className="relative h-full w-full">
                    <Image src={form.imageUrl} alt="Preview" fill className="object-cover" />
                    <button
                      onClick={() => { handleRemove(form.imageUrl); setForm({ ...form, imageUrl: "" }); }}
                      className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow-sm hover:bg-red-600"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <span className="text-[10px] text-dark-4">No image</span>
                )}
              </div>
              <input
                type="file"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const url = await handleUpload(file, form.imageUrl, 'products');
                    if (url) setForm({ ...form, imageUrl: url });
                  }
                }}
                disabled={uploadingImage}
                className="flex-1 cursor-pointer text-xs text-dark-4 file:mr-3 file:rounded-lg file:border-0 file:bg-blue/10 file:px-3 file:py-2 file:font-bold file:text-blue hover:file:bg-blue/20 transition-all"
              />
            </div>
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-stroke py-3 font-bold text-dark-4 hover:bg-gray-1 transition-all"
          >
            {tc("cancel")}
          </button>
          <button
            onClick={handleUpdate}
            disabled={uploadingImage}
            className="flex-1 rounded-xl bg-blue py-3 font-bold text-white shadow-lg shadow-blue/20 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
          >
            {uploadingImage ? "Subiendo..." : tc("save")}
          </button>
        </div>
      </div>
    </div>
  );
}
