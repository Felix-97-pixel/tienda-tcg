"use client";
import React, { useState, useEffect } from "react";
import { API_URL } from "@/utils/api";
import { useTranslations } from "next-intl";
import { useToast } from "@/hooks/useToast";
import { useImageUpload } from "@/hooks/useImageUpload";
import Image from "next/image";

interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string;
  isTcg?: boolean;
}

interface CategoryModalProps {
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
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl animate-in zoom-in-95 duration-200">
        <h2 className="mb-6 text-xl font-bold text-dark">
          {category ? t("modal.editTitle") : t("modal.createTitle")}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-dark">{t("modal.nameLabel")}</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={handleNameChange}
              placeholder={t("modal.namePlaceholder")}
              className="w-full rounded-xl border border-stroke bg-gray-1 py-3 px-5 text-sm outline-none transition focus:border-blue transition-all"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-dark">{t("modal.slugLabel")}</label>
            <input
              type="text"
              required
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder={t("modal.slugPlaceholder")}
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
                  <span className="text-[10px] text-dark-4 font-bold">Sin imagen</span>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const url = await handleUpload(file, formData.imageUrl, 'categories');
                    if (url) setFormData({ ...formData, imageUrl: url });
                  }
                }}
                disabled={isUploading}
                className="flex-1 cursor-pointer text-xs text-dark-4 file:mr-3 file:rounded-lg file:border-0 file:bg-blue/10 file:px-3 file:py-2 file:font-bold file:text-blue hover:file:bg-blue/20 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-stroke">
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={formData.isTcg}
                onChange={(e) => setFormData({ ...formData, isTcg: e.target.checked })}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue"></div>
            </label>
            <span className="text-sm font-bold text-dark">{t("modal.isTcgLabel")}</span>
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
