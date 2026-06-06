"use client";
import React, { useState, useEffect } from "react";
import { API_URL } from "@/utils/api";
import { useTranslations } from "next-intl";
import { useToast } from "@/hooks/useToast";
import { useImageUpload } from "@/hooks/useImageUpload";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { FileInput } from "@/components/ui/FileInput";
import { Checkbox } from "@/components/ui/Checkbox";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { AdminCategory as Category } from "@/types/adminCategory";

export interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
  onSuccess: () => void;
}

export default function CategoryModal({ isOpen, onClose, category, onSuccess }: CategoryModalProps) {
  const t = useTranslations("categories");
  const tc = useTranslations("common");
  const { showToast } = useToast();
  const { isUploading, handleUpload, handleRemove } = useImageUpload();

  const [formData, setFormData] = useState({ name: "", slug: "", imageUrl: "", isTcg: false });

  const handleSlugify = (name: string) => name.toLowerCase().trim().replace(/[\s\W-]+/g, '-');

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        slug: category.slug,
        imageUrl: category.imageUrl || "",
        isTcg: !!category.isTcg
      });
    } else {
      setFormData({ name: "", slug: "", imageUrl: "", isTcg: false });
    }
  }, [category, isOpen]);

  if (!isOpen) return null;

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    if (!category) {
      setFormData({ ...formData, name, slug: handleSlugify(name) });
    } else {
      setFormData({ ...formData, name });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = category ? "PATCH" : "POST";
    const url = category ? `${API_URL}/products/meta/categories/${category.id}` : `${API_URL}/products/meta/categories`;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      if (res.ok) {
        showToast(tc("success"), "success");
        onSuccess();
        onClose();
      } else {
        showToast(category ? t("errorUpdate") : t("errorCreate"), "error");
      }
    } catch (error) {
      showToast(tc("networkError"), "error");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={category ? t("modal.editTitle") : t("modal.createTitle")}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <Input
            label={t("modal.nameLabel")}
            type="text"
            required
            value={formData.name}
            onChange={handleNameChange}
            placeholder={t("modal.namePlaceholder")}
          />
        </div>

        <div>
          <Input
            label={t("modal.slugLabel")}
            type="text"
            required
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            placeholder={t("modal.slugPlaceholder")}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-white">{t("modal.imageLabel")}</label>
          <div className="flex items-center gap-4">
            <div className="h-20 w-28 flex-shrink-0 overflow-hidden rounded-xl bg-[#111318] border border-stroke flex items-center justify-center">
              {formData.imageUrl ? (
                <div className="relative h-full w-full group">
                  <Image src={formData.imageUrl} alt="Preview" fill className="object-contain" />
                  <button
                    type="button"
                    onClick={async () => {
                      const success = await handleRemove(formData.imageUrl);
                      if (success) setFormData({ ...formData, imageUrl: "" });
                    }}
                    className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red text-white shadow-md hover:bg-red-dark transition-all opacity-0 group-hover:opacity-100"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <span className="text-[10px] text-gray-4 font-bold">{tc("noImage")}</span>
              )}
            </div>
            <FileInput
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const url = await handleUpload(file, formData.imageUrl, 'categories');
                  if (url) setFormData({ ...formData, imageUrl: url });
                }
              }}
              disabled={isUploading}
            />
          </div>
        </div>

        <Checkbox
          checked={formData.isTcg}
          onChange={(e) => setFormData({ ...formData, isTcg: e.target.checked })}
          label={t("modal.isTcgLabel")}
        />

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
            type="submit"
            isLoading={isUploading}
            fullWidth
          >
            {isUploading ? tc("loading") : tc("save")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
