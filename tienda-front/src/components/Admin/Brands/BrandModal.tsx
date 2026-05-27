"use client";
import React, { useState, useEffect } from "react";
import { API_URL } from "@/utils/api";
import { useTranslations } from "next-intl";
import { useToast } from "@/hooks/useToast";
import { useImageUpload } from "@/hooks/useImageUpload";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { FileInput } from "@/components/ui/FileInput";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Brand } from "@/types/brand";

export interface BrandModalProps {
  isOpen: boolean;
  onClose: () => void;
  brand: Brand | null;
  onSuccess: () => void;
}

export default function BrandModal({ isOpen, onClose, brand, onSuccess }: BrandModalProps) {
  const t = useTranslations("brands");
  const tc = useTranslations("common");
  const { showToast } = useToast();
  const { isUploading, handleUpload, handleRemove } = useImageUpload();

  const [formData, setFormData] = useState({ name: "", imageUrl: "" });

  useEffect(() => {
    if (brand) {
      setFormData({ name: brand.name, imageUrl: brand.imageUrl || "" });
    } else {
      setFormData({ name: "", imageUrl: "" });
    }
  }, [brand, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = brand ? "PATCH" : "POST";
    const url = brand ? `${API_URL}/products/meta/brands/${brand.id}` : `${API_URL}/products/meta/brands`;

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
        showToast(brand ? t("errorUpdate") : t("errorCreate"), "error");
      }
    } catch (error) {
      showToast(tc("networkError"), "error");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={brand ? t("modal.editTitle") : t("modal.createTitle")}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <Input
            label={t("modal.nameLabel")}
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder={t("modal.namePlaceholder")}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-dark">{t("modal.imageLabel")}</label>
          <div className="flex items-center gap-4">
            <div className="h-20 w-28 flex-shrink-0 overflow-hidden rounded-xl bg-gray-1 border border-stroke flex items-center justify-center">
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
                <span className="text-[10px] text-dark-4 font-bold">{tc("noImage")}</span>
              )}
            </div>
            <FileInput
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const url = await handleUpload(file, formData.imageUrl, 'brands');
                  if (url) setFormData({ ...formData, imageUrl: url });
                }
              }}
              disabled={isUploading}
            />
          </div>
          {isUploading && <p className="mt-2 text-xs text-blue animate-pulse">{tc("uploading")}</p>}
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
