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
  categories: { id: string, name: string, isTcg?: boolean }[];
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
    weightGram: "",
    widthCm: "",
    heightCm: "",
    lengthCm: "",
  });

  const selectedCategoryObj = categories.find(c => c.id === creatingProduct.categoryId);
  const isTcgCategory = selectedCategoryObj?.isTcg;

  if (!isOpen) return null;

  const handleCreateProduct = async () => {
    if (!creatingProduct.name || !creatingProduct.categoryId) {
      showToast(t("modal.requiredFields"), "error");
      return;
    }

    const payload = {
      ...creatingProduct,
      weightGram: creatingProduct.weightGram ? parseFloat(creatingProduct.weightGram as string) : undefined,
      widthCm: creatingProduct.widthCm ? parseFloat(creatingProduct.widthCm as string) : undefined,
      heightCm: creatingProduct.heightCm ? parseFloat(creatingProduct.heightCm as string) : undefined,
      lengthCm: creatingProduct.lengthCm ? parseFloat(creatingProduct.lengthCm as string) : undefined,
    };

    try {
      const res = await fetch(`${API_URL}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        showToast(t("modal.successCreate"), "success");
        setCreatingProduct({
          name: "", categoryId: "", brandId: "", price: 0, stock: 0, imageUrl: "", description: "", weightGram: "", widthCm: "", heightCm: "", lengthCm: ""
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
            <label className="mb-1.5 block text-xs font-medium text-gray-4">{t("modal.categoryLabel")}</label>
            <SearchableSelect
              options={categories.map(c => ({ label: c.name, value: c.id }))}
              value={creatingProduct.categoryId}
              onChange={(val) => setCreatingProduct({ ...creatingProduct, categoryId: val })}
              placeholder={t("modal.categoryPlaceholder")}
            />
          </div>

          {/* Marca */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-4">{t("modal.brandLabel")}</label>
            <SearchableSelect
              options={brands.map(b => ({ label: b.name, value: b.id }))}
              value={creatingProduct.brandId}
              onChange={(val) => setCreatingProduct({ ...creatingProduct, brandId: val })}
              placeholder={t("modal.brandPlaceholder")}
            />
          </div>



          {/* Imagen */}
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-xs font-medium text-gray-4">{t("modal.imageLabel")}</label>
            <div className="flex items-center gap-4">
              <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-[#111318] border-2 border-dashed border-stroke flex items-center justify-center">
                {creatingProduct.imageUrl ? (
                  <div className="relative h-full w-full group">
                    <Image src={creatingProduct.imageUrl} alt="Preview" fill className="object-cover" unoptimized={creatingProduct.imageUrl.includes("scryfall")} />
                    <button
                      onClick={() => { handleRemove(creatingProduct.imageUrl); setCreatingProduct({ ...creatingProduct, imageUrl: "" }); }}
                      className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red text-white shadow-md hover:bg-red-dark transition-all opacity-0 group-hover:opacity-100"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <span className="text-[10px] text-gray-4 text-center px-1 font-bold uppercase">{t("modal.noImage")}</span>
                )}
              </div>
              <FileInput
                accept="image/*"
                onChange={async (e) => {
                  if (!creatingProduct.categoryId) {
                    showToast("Por favor, selecciona una categoría primero para organizar la imagen.", "warning");
                    e.target.value = "";
                    return;
                  }
                  
                  const file = e.target.files?.[0];
                  if (file) {
                    const category = categories.find(c => c.id === creatingProduct.categoryId);
                    const folderName = category 
                      ? `products/${category.name.toLowerCase().replace(/\s+/g, '-')}` 
                      : 'products';
                      
                    const url = await handleUpload(file, "", folderName);
                    if (url) setCreatingProduct({ ...creatingProduct, imageUrl: url });
                  }
                }}
                disabled={uploadingImage}
              />
            </div>
          </div>

          {/* Dimensiones Físicas (Solo para No-TCG) */}
          {creatingProduct.categoryId && !isTcgCategory && (
            <div className="md:col-span-2 rounded-xl border border-white/10 p-5 bg-white/[0.02]">
              <h4 className="mb-4 text-sm font-bold text-white flex items-center gap-2">
                <span className="text-blue">📦</span> Dimensiones para Envío
              </h4>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <Input
                  label="Peso (Gramos)"
                  type="number"
                  value={creatingProduct.weightGram}
                  onChange={(e) => setCreatingProduct({ ...creatingProduct, weightGram: e.target.value })}
                  placeholder="Ej: 500"
                />
                <Input
                  label="Largo (cm)"
                  type="number"
                  value={creatingProduct.lengthCm}
                  onChange={(e) => setCreatingProduct({ ...creatingProduct, lengthCm: e.target.value })}
                  placeholder="Ej: 20"
                />
                <Input
                  label="Ancho (cm)"
                  type="number"
                  value={creatingProduct.widthCm}
                  onChange={(e) => setCreatingProduct({ ...creatingProduct, widthCm: e.target.value })}
                  placeholder="Ej: 15"
                />
                <Input
                  label="Alto (cm)"
                  type="number"
                  value={creatingProduct.heightCm}
                  onChange={(e) => setCreatingProduct({ ...creatingProduct, heightCm: e.target.value })}
                  placeholder="Ej: 10"
                />
              </div>
              <p className="mt-3 text-xs text-gray-4">Estas dimensiones son obligatorias para calcular el costo de envío con Starken o Chilexpress.</p>
            </div>
          )}

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
