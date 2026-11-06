"use client";
import React, { useState, useEffect } from "react";
import { adminFetch } from "@/utils/api";
import { useTranslations } from "next-intl";
import { useToast } from "@/hooks/useToast";
import { useImageUpload } from "@/hooks/useImageUpload";
import SearchableSelect from "@/components/ui/SearchableSelect";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { FileInput } from "@/components/ui/FileInput";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { IconX, IconBox } from "@/components/ui/Icons";
export interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: {
    productId: string;
    categoryId: string;
    brandId: string;
    imageUrl: string;
    productName: string;
    description: string;
    itemId: string;
    price: number;
    stock: number;
    weightGram?: number;
    widthCm?: number;
    heightCm?: number;
    lengthCm?: number;
  } | null;
  categories: { id: string, name: string, isTcg?: boolean }[];
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
    description: "",
    price: 0,
    stock: 0,
    weightGram: "",
    widthCm: "",
    heightCm: "",
    lengthCm: "",
  });

  useEffect(() => {
    if (item) {
      setForm({
        name: item.productName,
        categoryId: item.categoryId,
        brandId: item.brandId || "",
        imageUrl: item.imageUrl || "",
        description: item.description || "",
        price: item.price,
        stock: item.stock,
        weightGram: item.weightGram?.toString() || "",
        widthCm: item.widthCm?.toString() || "",
        heightCm: item.heightCm?.toString() || "",
        lengthCm: item.lengthCm?.toString() || "",
      });
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const handleUpdate = async () => {
    try {
      const res = await adminFetch(`/products/${item.productId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          price: form.price,
          stock: form.stock,
          categoryId: form.categoryId,
          brandId: form.brandId || null,
          imageUrl: form.imageUrl || null,
          weightGram: form.weightGram ? parseFloat(form.weightGram as string) : null,
          widthCm: form.widthCm ? parseFloat(form.widthCm as string) : null,
          heightCm: form.heightCm ? parseFloat(form.heightCm as string) : null,
          lengthCm: form.lengthCm ? parseFloat(form.lengthCm as string) : null,
        }),
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

  const isTcg = categories.find(c => c.id === item.categoryId)?.isTcg;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("modal.editTitle")}
      maxWidth="xl"
    >
      <div className="space-y-4">
        <div>
          <Input
            label={t("modal.nameLabel")}
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder={t("modal.namePlaceholder")}
          />
        </div>

        {!isTcg && (
          <>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-4">{t("modal.categoryLabel")}</label>
              <SearchableSelect
                options={categories.filter(c => !c.isTcg).map(c => ({ label: c.name, value: c.id }))}
                value={form.categoryId}
                onChange={(val) => setForm({ ...form, categoryId: val })}
                placeholder={t("modal.categoryPlaceholder")}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-4">{t("modal.brandLabel")}</label>
              <SearchableSelect
                options={brands.map(b => ({ label: b.name, value: b.id }))}
                value={form.brandId}
                onChange={(val) => setForm({ ...form, brandId: val })}
                placeholder={t("modal.brandPlaceholder")}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-4">{t("modal.imageLabel")}</label>
              <div className="flex items-center gap-4">
                <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-[#111318] border-2 border-dashed border-stroke flex items-center justify-center">
                  {form.imageUrl ? (
                    <div className="relative h-full w-full group">
                      <img 
                        src={form.imageUrl} 
                        alt="Preview" 
                        className="h-full w-full object-cover" 
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (target.src && target.src.includes("?")) {
                            target.src = target.src.split("?")[0];
                          }
                        }}
                      />
                      <button
                        onClick={() => { handleRemove(form.imageUrl); setForm({ ...form, imageUrl: "" }); }}
                        className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red text-white shadow-md hover:bg-red-dark transition-all opacity-0 group-hover:opacity-100"
                      >
                        <IconX className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-[10px] text-gray-4 text-center px-1 font-bold uppercase">{t("modal.noImage")}</span>
                  )}
                </div>
                <FileInput
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const category = categories.find(c => c.id === form.categoryId);
                      const folderName = category 
                        ? `products/${category.name.toLowerCase().replace(/\s+/g, '-')}` 
                        : 'products';
                      const url = await handleUpload(file, form.imageUrl, folderName);
                      if (url) setForm({ ...form, imageUrl: url });
                    }
                  }}
                  disabled={uploadingImage}
                />
              </div>
            </div>
          </>
        )}

        {!isTcg && (
          <div className="rounded-xl border border-white/10 p-5 bg-white/[0.02]">
            <h4 className="mb-4 text-sm font-bold text-white flex items-center gap-2">
              <IconBox className="w-4 h-4 text-red" />
              {t("shipping_dimensions_title")}
            </h4>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <Input
                label={t("weight_grams_label")}
                type="number"
                value={form.weightGram}
                onChange={(e) => setForm({ ...form, weightGram: e.target.value })}
                placeholder={t("weight_placeholder")}
              />
              <Input
                label={t("length_cm_label")}
                type="number"
                value={form.lengthCm}
                onChange={(e) => setForm({ ...form, lengthCm: e.target.value })}
                placeholder={t("length_placeholder")}
              />
              <Input
                label={t("width_cm_label")}
                type="number"
                value={form.widthCm}
                onChange={(e) => setForm({ ...form, widthCm: e.target.value })}
                placeholder={t("width_placeholder")}
              />
              <Input
                label={t("height_cm_label")}
                type="number"
                value={form.heightCm}
                onChange={(e) => setForm({ ...form, heightCm: e.target.value })}
                placeholder={t("height_placeholder")}
              />
            </div>
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-4">{t("description_label")}</label>
          <textarea
            className="w-full rounded-xl border border-stroke bg-[#111318] px-4 py-3 text-white focus:border-blue focus:outline-none transition-all resize-y min-h-[100px]"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder={t("description_placeholder")}
          />
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
