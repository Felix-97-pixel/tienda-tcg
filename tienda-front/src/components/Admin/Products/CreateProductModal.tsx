"use client";
import React, { useState } from "react";
import { API_URL } from "@/utils/api";
import { useTranslations } from "next-intl";
import { useToast } from "@/hooks/useToast";
import { useImageUpload } from "@/hooks/useImageUpload";
import SearchableSelect from "@/components/Common/SearchableSelect";
import Image from "next/image";

interface CreateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: { id: string, name: string }[];
  brands: { id: string, name: string }[];
  onSuccess: () => void;
}

export default function CreateProductModal({ isOpen, onClose, categories, brands, onSuccess }: CreateProductModalProps) {
  const t = useTranslations("products");
  const tc = useTranslations("common");
  const { showToast } = useToast();
  const { isUploading: uploadingImage, handleUpload, handleRemove } = useImageUpload();

  const [creatingProduct, setCreatingProduct] = useState({
    name: "",
    categoryId: "",
    brandId: "",
    price: 0,
    stock: 0,
    imageUrl: "",
    description: "",
  });

  if (!isOpen) return null;

  const handleCreateProduct = async () => {
    if (!creatingProduct.name || !creatingProduct.categoryId) {
      showToast(t("modal.requiredFields"), "error");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(creatingProduct),
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        showToast(t("modal.successCreate"), "success");
        setCreatingProduct({
          name: "", categoryId: "", brandId: "", price: 0, stock: 0, imageUrl: "", description: ""
        });
        onSuccess();
        onClose();
      } else {
        showToast(data.error || t("modal.errorCreate"), "error");
      }
    } catch (err) {
      showToast(tc("networkError"), "error");
    }
  };

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-8 shadow-2xl animate-in zoom-in-95 duration-200 scrollbar-hide">
        <h2 className="mb-6 text-xl font-bold text-dark">{t("modal.createTitle")}</h2>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Nombre */}
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-xs font-medium text-dark-4">{t("modal.nameLabel")}</label>
            <input
              type="text"
              value={creatingProduct.name}
              onChange={(e) => setCreatingProduct({ ...creatingProduct, name: e.target.value })}
              className="w-full rounded-xl border border-stroke bg-gray-1 py-2.5 px-4 text-sm outline-none focus:border-blue transition-all"
              placeholder={t("modal.namePlaceholder")}
            />
          </div>

          {/* Categoría */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-dark-4">{t("modal.categoryLabel")}</label>
            <SearchableSelect
              options={categories.map(c => ({ label: c.name, value: c.id }))}
              value={creatingProduct.categoryId}
              onChange={(val) => setCreatingProduct({ ...creatingProduct, categoryId: val })}
              placeholder={t("modal.categoryPlaceholder")}
            />
          </div>

          {/* Marca */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-dark-4">{t("modal.brandLabel")}</label>
            <SearchableSelect
              options={brands.map(b => ({ label: b.name, value: b.id }))}
              value={creatingProduct.brandId}
              onChange={(val) => setCreatingProduct({ ...creatingProduct, brandId: val })}
              placeholder={t("modal.brandPlaceholder")}
            />
          </div>

          {/* Precio y Stock */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-dark-4">{t("modal.priceLabel")}</label>
            <input
              type="number"
              value={creatingProduct.price}
              onChange={(e) => setCreatingProduct({ ...creatingProduct, price: Number(e.target.value) })}
              className="w-full rounded-xl border border-stroke bg-gray-1 py-2.5 px-4 text-sm outline-none focus:border-blue transition-all"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-dark-4">{t("modal.stockLabel")}</label>
            <input
              type="number"
              value={creatingProduct.stock}
              onChange={(e) => setCreatingProduct({ ...creatingProduct, stock: Number(e.target.value) })}
              className="w-full rounded-xl border border-stroke bg-gray-1 py-2.5 px-4 text-sm outline-none focus:border-blue transition-all"
            />
          </div>

          {/* Imagen */}
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-xs font-medium text-dark-4">{t("modal.imageLabel")}</label>
            <div className="flex items-center gap-4">
              <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-gray-1 border-2 border-dashed border-stroke flex items-center justify-center">
                {creatingProduct.imageUrl ? (
                  <div className="relative h-full w-full">
                    <Image src={creatingProduct.imageUrl} alt="Preview" fill className="object-cover" />
                    <button
                      onClick={() => { handleRemove(creatingProduct.imageUrl); setCreatingProduct({ ...creatingProduct, imageUrl: "" }); }}
                      className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-md hover:bg-red-600 transition-all"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <span className="text-[10px] text-dark-4 text-center px-1 font-bold uppercase">{t("modal.noImage")}</span>
                )}
              </div>
              <input
                type="file"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const url = await handleUpload(file, "", 'products');
                    if (url) setCreatingProduct({ ...creatingProduct, imageUrl: url });
                  }
                }}
                disabled={uploadingImage}
                className="flex-1 cursor-pointer text-sm text-dark-4 file:mr-4 file:rounded-lg file:border-0 file:bg-blue/10 file:px-4 file:py-2 file:text-xs file:font-bold file:text-blue hover:file:bg-blue/20 transition-all"
              />
            </div>
          </div>

          {/* Descripción */}
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-xs font-medium text-dark-4">{t("modal.descriptionLabel")}</label>
            <textarea
              rows={3}
              value={creatingProduct.description}
              onChange={(e) => setCreatingProduct({ ...creatingProduct, description: e.target.value })}
              className="w-full rounded-xl border border-stroke bg-gray-1 py-3 px-4 text-sm outline-none focus:border-blue transition-all"
              placeholder={t("modal.descriptionPlaceholder")}
            />
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
            onClick={handleCreateProduct}
            disabled={uploadingImage}
            className="flex-1 rounded-xl btn-green py-3 font-bold text-white shadow-lg shadow-green-600/20 transition-all active:scale-95 disabled:opacity-50"
          >
            {uploadingImage ? t("modal.uploading") : t("modal.createButton")}
          </button>
        </div>
      </div>
    </div>
  );
}
