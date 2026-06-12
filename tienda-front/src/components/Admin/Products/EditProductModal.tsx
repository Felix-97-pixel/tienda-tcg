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
import { Input } from "@/components/ui/Input";
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
    description: "",
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
        description: item.description || "",
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
          description: form.description,
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
          <Input
            label={t("modal.nameLabel")}
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder={t("modal.namePlaceholder")}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-4">Descripción</label>
          <textarea
            className="w-full rounded-xl border border-stroke bg-[#111318] px-4 py-3 text-white focus:border-blue focus:outline-none transition-all resize-y min-h-[100px]"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Descripción del producto..."
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
