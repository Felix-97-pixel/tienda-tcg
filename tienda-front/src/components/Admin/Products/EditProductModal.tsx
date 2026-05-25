"use client";
import React, { useState, useEffect } from "react";
import { API_URL } from "@/utils/api";
import { useTranslations } from "next-intl";
import { useToast } from "@/hooks/useToast";
import { useImageUpload } from "@/hooks/useImageUpload";
import SearchableSelect from "@/components/ui/SearchableSelect";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { FileInput } from "@/components/ui/FileInput";
import { Modal } from "@/components/ui/Modal";

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
      const res = await fetch(`${API_URL}/products/${item.productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          categoryId: form.categoryId,
          brandId: form.brandId || null,
          imageUrl: form.imageUrl,
          price: form.price,
          stock: form.stock,
        }),
        credentials: "include",
      });

      if (res.ok) {
        showToast(t("modal.successUpdate"), "success");
        onSuccess();
        onClose();
      } else {
        showToast(t("modal.errorUpdate"), "error");
      }
    } catch (err) {
      showToast(tc("networkError"), "error");
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={t("modal.editTitle")}
      maxWidth="xl"
    >
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-dark-4">{t("modal.nameLabel")}</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-xl border border-stroke bg-gray-1 py-2.5 px-4 text-sm outline-none focus:border-blue transition-all"
              placeholder={t("modal.namePlaceholder")}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-dark-4">{t("modal.categoryLabel")}</label>
              <SearchableSelect
                options={categories.map(c => ({ label: c.name, value: c.id }))}
                value={form.categoryId}
                onChange={(val) => setForm({ ...form, categoryId: val })}
                placeholder={t("modal.categoryPlaceholder")}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-dark-4">{t("modal.brandLabel")}</label>
              <SearchableSelect
                options={brands.map(b => ({ label: b.name, value: b.id }))}
                value={form.brandId}
                onChange={(val) => setForm({ ...form, brandId: val })}
                placeholder={t("modal.brandPlaceholder")}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-dark-4">{t("modal.priceLabel")}</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                className="w-full rounded-xl border border-stroke bg-gray-1 py-2.5 px-4 text-sm outline-none focus:border-blue transition-all"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-dark-4">{t("modal.stockLabel")}</label>
              <input
                type="number"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                className="w-full rounded-xl border border-stroke bg-gray-1 py-2.5 px-4 text-sm outline-none focus:border-blue transition-all"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-dark-4">{t("modal.imageLabel")}</label>
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-gray-1 border border-stroke flex items-center justify-center">
                {form.imageUrl ? (
                  <div className="relative h-full w-full group">
                    <Image src={form.imageUrl} alt="Preview" fill className="object-cover" />
                    <button
                      onClick={() => { handleRemove(form.imageUrl); setForm({ ...form, imageUrl: "" }); }}
                      className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red text-white shadow-md hover:bg-red-dark transition-all opacity-0 group-hover:opacity-100"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <span className="text-[10px] text-dark-4 font-bold uppercase">{t("modal.noImage")}</span>
                )}
              </div>
              <FileInput
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const url = await handleUpload(file, form.imageUrl, 'products');
                    if (url) setForm({ ...form, imageUrl: url });
                  }
                }}
                disabled={uploadingImage}
              />
            </div>
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            fullWidth
          >
            {tc("cancel")}
          </Button>
          <Button
            type="button"
            variant="success"
            onClick={handleUpdate}
            isLoading={uploadingImage}
            fullWidth
          >
            {uploadingImage ? t("modal.uploading") : tc("save")}
          </Button>
        </div>
    </Modal>
  );
}
