"use client";
import React, { useState } from "react";
import { API_URL } from "@/utils/api";
import { useTranslations } from "next-intl";
import { useToast } from "@/hooks/useToast";
import SearchableSelect from "@/components/Common/SearchableSelect";

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: { id: string, name: string }[];
  onSuccess: () => void;
}

export default function BulkUploadModal({ isOpen, onClose, categories, onSuccess }: BulkUploadModalProps) {
  const t = useTranslations("products");
  const tc = useTranslations("common");
  const { showToast } = useToast();

  const [bulkCategory, setBulkCategory] = useState("");
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen) return null;

  const handleUpload = async () => {
    if (!bulkFile || !bulkCategory) {
      showToast(t("bulk.selectError"), "error");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", bulkFile);
    formData.append("categoryId", bulkCategory);

    try {
      const res = await fetch(`${API_URL}/products/bulk-upload`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || t("bulk.success"), "success");
        onSuccess();
        onClose();
      } else {
        showToast(data.error || t("bulk.error"), "error");
      }
    } catch (error) {
      showToast(tc("networkError"), "error");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-2xl animate-in zoom-in-95 duration-200">
        <h2 className="mb-2 text-xl font-bold text-dark">{t("bulkUpload.title")}</h2>
        <p className="mb-6 text-sm text-dark-4">{t("bulkUpload.subtitle")}</p>
        
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-dark">{t("create.category")}</label>
            <SearchableSelect
              options={categories.map(c => ({ label: c.name, value: c.id }))}
              value={bulkCategory}
              onChange={setBulkCategory}
              placeholder={t("bulk.categoryPlaceholder")}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-dark">{t("bulk.fileLabel")}</label>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setBulkFile(e.target.files?.[0] || null)}
              className="w-full cursor-pointer rounded-xl border border-stroke bg-gray-1 py-3 px-5 text-sm outline-none transition focus:border-blue file:mr-4 file:rounded-lg file:border-0 file:bg-blue file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-blue-700"
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
            onClick={handleUpload}
            disabled={isUploading}
            className="flex-1 rounded-xl bg-blue py-3 font-bold text-white shadow-lg shadow-blue/20 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
          >
            {isUploading ? tc("loading") : t("bulk.uploadButton")}
          </button>
        </div>
      </div>
    </div>
  );
}
