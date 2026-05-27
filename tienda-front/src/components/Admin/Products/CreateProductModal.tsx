"use client";
import React, { useState } from "react";
import { API_URL } from "@/utils/api";
import { useTranslations } from "next-intl";
import { useToast } from "@/hooks/useToast";
import { useImageUpload } from "@/hooks/useImageUpload";
import SearchableSelect from "@/components/ui/SearchableSelect";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { FileInput } from "@/components/ui/FileInput";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
export interface CreateProductModalProps {
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
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={t("modal.createTitle")}
      maxWidth="3xl"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Nombre */}
          <div className="md:col-span-2">
            <Input
              label={t("modal.nameLabel")}
              type="text"
              value={creatingProduct.name}
              onChange={(e) => setCreatingProduct({ ...creatingProduct, name: e.target.value })}
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
            <Input
              label={t("modal.priceLabel")}
              type="number"
              value={creatingProduct.price}
              onChange={(e) => setCreatingProduct({ ...creatingProduct, price: Number(e.target.value) })}
            />
          </div>
          <div>
            <Input
              label={t("modal.stockLabel")}
              type="number"
              value={creatingProduct.stock}
              onChange={(e) => setCreatingProduct({ ...creatingProduct, stock: Number(e.target.value) })}
            />
          </div>

          {/* Imagen */}
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-xs font-medium text-dark-4">{t("modal.imageLabel")}</label>
            <div className="flex items-center gap-4">
              <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-gray-1 border-2 border-dashed border-stroke flex items-center justify-center">
                {creatingProduct.imageUrl ? (
                  <div className="relative h-full w-full group">
                    <Image src={creatingProduct.imageUrl} alt="Preview" fill className="object-cover" />
                    <button
                      onClick={() => { handleRemove(creatingProduct.imageUrl); setCreatingProduct({ ...creatingProduct, imageUrl: "" }); }}
                      className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red text-white shadow-md hover:bg-red-dark transition-all opacity-0 group-hover:opacity-100"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <span className="text-[10px] text-dark-4 text-center px-1 font-bold uppercase">{t("modal.noImage")}</span>
                )}
              </div>
              <FileInput
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const url = await handleUpload(file, "", 'products');
                    if (url) setCreatingProduct({ ...creatingProduct, imageUrl: url });
                  }
                }}
                disabled={uploadingImage}
              />
            </div>
          </div>

          {/* Descripción */}
          <div className="md:col-span-2">
            <Textarea
              label={t("modal.descriptionLabel")}
              rows={3}
              value={creatingProduct.description}
              onChange={(e) => setCreatingProduct({ ...creatingProduct, description: e.target.value })}
              placeholder={t("modal.descriptionPlaceholder")}
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
            onClick={handleCreateProduct}
            isLoading={uploadingImage}
            fullWidth
          >
            {uploadingImage ? t("modal.uploading") : t("modal.createButton")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
