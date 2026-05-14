"use client";
import React, { useState, useEffect } from "react";
import { API_URL } from "@/utils/api";
import { useTranslations } from "next-intl";
import { useToast } from "@/hooks/useToast";
import { useImageUpload } from "@/hooks/useImageUpload";
import Image from "next/image";

interface Brand {
  id: string;
  name: string;
  imageUrl?: string;
}

interface BrandModalProps {
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
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl animate-in zoom-in-95 duration-200">
        <h2 className="mb-6 text-xl font-bold text-dark">
          {brand ? t("modal.editTitle") : t("modal.createTitle")}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-dark">{t("modal.nameLabel")}</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={t("modal.namePlaceholder")}
              className="w-full rounded-xl border border-stroke bg-gray-1 py-3 px-5 text-sm outline-none transition focus:border-blue transition-all"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-dark">{t("modal.imageLabel")}</label>
            <div className="flex items-center gap-4">
              <div className="h-20 w-28 flex-shrink-0 overflow-hidden rounded-xl bg-gray-1 border border-stroke flex items-center justify-center">
                {formData.imageUrl ? (
                  <div className="relative h-full w-full">
                    <Image src={formData.imageUrl} alt="Preview" fill className="object-contain" />
                    <button
                      type="button"
                      onClick={async () => {
                        const success = await handleRemove(formData.imageUrl);
                        if (success) setFormData({ ...formData, imageUrl: "" });
                      }}
                      className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-md hover:bg-red-600 transition-all"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <span className="text-[10px] text-dark-4 font-bold">{tc("noImage")}</span>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const url = await handleUpload(file, formData.imageUrl, 'brands');
                    if (url) setFormData({ ...formData, imageUrl: url });
                  }
                }}
                disabled={isUploading}
                className="flex-1 cursor-pointer text-xs text-dark-4 file:mr-3 file:rounded-lg file:border-0 file:bg-blue/10 file:px-3 file:py-2 file:font-bold file:text-blue hover:file:bg-blue/20 transition-all"
              />
            </div>
            {isUploading && <p className="mt-2 text-xs text-blue animate-pulse">{tc("uploading")}</p>}
          </div>

          <div className="mt-8 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-stroke py-3 font-bold text-dark-4 hover:bg-gray-1 transition-all"
            >
              {tc("cancel")}
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="flex-1 rounded-xl bg-blue py-3 font-bold text-white shadow-lg shadow-blue/20 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
            >
              {isUploading ? tc("loading") : tc("save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
