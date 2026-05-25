"use client";
import React, { useState } from "react";
import { API_URL } from "@/utils/api";
import { useTranslations } from "next-intl";
import { useToast } from "@/hooks/useToast";
import SearchableSelect from "@/components/ui/SearchableSelect";
import Papa from "papaparse";
import { Button } from "@/components/ui/Button";
import { FileInput } from "@/components/ui/FileInput";

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

    Papa.parse(bulkFile, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const parsedItems = results.data.map((row: any, index: number) => {
          return {
            scryfallId: row["Scryfall ID"] || undefined,
            name: row["Name"] || "",
            expansion: row["Set name"] || "",
            rarity: row["Rarity"] || "",
            collectorNum: String(row["Collector number"] || ""),
            quantity: Number(row["Quantity"]) || 1,
            price: Number(row["Purchase price"]) || 0,
            condition: row["Condition"] || "near_mint",
            language: row["Language"] || "en",
            finish: row["Foil"] || "normal",
            originalIndex: index
          };
        });

        try {
          const res = await fetch(`${API_URL}/products/bulk-upload`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              categoryId: bulkCategory,
              items: parsedItems
            }),
            credentials: "include",
          });

          const data = await res.json();
          if (res.ok) {
            // Show toast using the backend success summary if available, otherwise general success
            let successMsg = t("bulk.success");
            if (data && data.added !== undefined) {
              successMsg = t("bulk.successMtg", {
                added: data.added,
                updated: data.updated,
                errors: data.errors?.length || 0
              });
            }
            showToast(successMsg, "success");
            
            // If there were errors, download error log or show warning
            if (data && data.errors && data.errors.length > 0) {
              const errorCsv = Papa.unparse(data.errors.map((e: any) => ({
                Fila: e.index + 2, // +1 for header, +1 for 0-index
                Error: e.error
              })));
              const blob = new Blob([errorCsv], { type: "text/csv;charset=utf-8;" });
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.setAttribute("href", url);
              link.setAttribute("download", `errores_subida_masiva_${Date.now()}.csv`);
              link.style.visibility = "hidden";
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              showToast(t("bulk.errorMessage"), "warning");
            }
            
            onSuccess();
            onClose();
          } else {
            showToast(data.message || t("bulk.errorBulk"), "error");
          }
        } catch (error) {
          showToast(tc("networkError"), "error");
        } finally {
          setIsUploading(false);
        }
      },
      error: (error) => {
        showToast(t("bulk.errorCsvRead"), "error");
        setIsUploading(false);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-2xl animate-in zoom-in-95 duration-200">
        <h2 className="mb-2 text-xl font-bold text-dark">{t("bulk.title")}</h2>
        <p className="mb-6 text-sm text-dark-4">{t("bulk.subtitle")}</p>
        
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-dark">{t("modal.categoryLabel")}</label>
            <SearchableSelect
              options={categories.map(c => ({ label: c.name, value: c.id }))}
              value={bulkCategory}
              onChange={setBulkCategory}
              placeholder={t("modal.categoryPlaceholder")}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-dark">{t("bulk.fileLabel")}</label>
            <FileInput
              accept=".csv"
              onChange={(e) => setBulkFile(e.target.files?.[0] || null)}
            />
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <Button
            variant="secondary"
            onClick={onClose}
            fullWidth
          >
            {tc("cancel")}
          </Button>
          <Button
            onClick={handleUpload}
            isLoading={isUploading}
            fullWidth
          >
            {isUploading ? tc("loading") : t("bulk.uploadButton")}
          </Button>
        </div>
      </div>
    </div>
  );
}
