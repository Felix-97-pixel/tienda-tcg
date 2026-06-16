"use client";
import React, { useState } from "react";
import { API_URL } from "@/utils/api";
import { useTranslations } from "next-intl";
import { useToast } from "@/hooks/useToast";
import SearchableSelect from "@/components/ui/SearchableSelect";
import Papa from "papaparse";
import { Button } from "@/components/ui/Button";
import { FileInput } from "@/components/ui/FileInput";
import { Modal } from "@/components/ui/Modal";
export interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: { id: string, name: string }[];
  onSuccess: () => void;
  isGlobal?: boolean;
}

export default function BulkUploadModal({ isOpen, onClose, categories, onSuccess, isGlobal = false }: BulkUploadModalProps) {
  const t = useTranslations("products");
  const tc = useTranslations("common");
  const { showToast } = useToast();

  const [bulkCategory, setBulkCategory] = useState("");
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async () => {
    if (!bulkFile || (!isGlobal && !bulkCategory)) {
      showToast(t("bulk.selectError"), "error");
      return;
    }

    setIsUploading(true);

    Papa.parse(bulkFile, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        if (!isGlobal && results.data.length > 0) {
          const category = categories.find(c => c.id === bulkCategory);
          const categoryName = category?.name.toLowerCase() || "";
          const headers = Object.keys(results.data[0]);

          if (categoryName.includes("riftbound")) {
            if (headers.includes("Scryfall ID")) {
              showToast("Archivo incorrecto: Estás intentando subir un archivo de Magic en Riftbound.", "error");
              setIsUploading(false);
              return;
            }
            if (!headers.includes("Card Name") && !headers.includes("Name")) {
              showToast("Estructura inválida. El CSV debe contener la columna 'Card Name' o 'Name'.", "error");
              setIsUploading(false);
              return;
            }
          } else if (categoryName.includes("magic")) {
            if (headers.includes("Variant Number") || headers.includes("Card Name")) {
              showToast("Archivo incorrecto: Estás intentando subir un archivo de Riftbound en Magic.", "error");
              setIsUploading(false);
              return;
            }
            if (!headers.includes("Scryfall ID") && !headers.includes("Name")) {
              showToast("Estructura inválida. El CSV debe contener la columna 'Scryfall ID' o 'Name'.", "error");
              setIsUploading(false);
              return;
            }
          }
        }

        let parsedItems: any[] = [];
        
        if (isGlobal) {
          parsedItems = results.data.map((row: any, index: number) => ({
            "Nombre": row["Nombre"],
            "Categoria": row["Categoria"],
            "Marca": row["Marca"],
            "Descripcion": row["Descripcion"],
            originalIndex: index
          }));
        } else {
          parsedItems = results.data.map((row: any, index: number) => {
            let finishStr = row["Foil"] || "normal";
            if (row["Foil"] && row["Foil"].toString().toUpperCase() === "TRUE") finishStr = "foil";
            else if (row["Foil"] && row["Foil"].toString().toUpperCase() === "FALSE") finishStr = "normal";
            
            if (row["Variant Type"] === "Promo") finishStr = "promo";

            return {
              scryfallId: row["Scryfall ID"] || undefined,
              name: row["Name"] || row["Card Name"] || "",
              expansion: row["Set name"] || row["Set"] || "",
              rarity: row["Rarity"] || "",
              collectorNum: String(row["Collector number"] || row["Variant Number"] || ""),
              quantity: Number(row["Quantity"]) || 1,
              price: Number(row["Purchase price"]) || 0,
              condition: row["Condition"] || "near_mint",
              language: row["Language"] || "en",
              finish: finishStr,
              originalIndex: index
            };
          });
        }

        try {
          const endpoint = isGlobal ? '/products/bulk-create-global' : '/products/bulk-upload';
          const res = await fetch(`${API_URL}${endpoint}`, {
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

  const handleDownloadTemplate = () => {
    if (isGlobal) {
      const csvContent = "Nombre,Categoria,Marca,Descripcion\nDado Rojo 20 D20,Dados,Chessex,Dado de 20 caras color rojo.\nFunda Transparente 100u,Fundas,DragonShield,Pack de 100 fundas transparentes tamaño standard.\n";
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", "plantilla_productos_global.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={isGlobal ? "Subida Masiva de Productos (Global)" : t("bulk.title")}
      maxWidth="md"
    >
      <div className="space-y-4">
        <p className="mb-8 text-sm font-medium leading-relaxed text-gray-4">
          {isGlobal ? "Sube múltiples productos al catálogo global mediante un archivo CSV." : t("bulk.subtitle")}
        </p>
        
        <div className="space-y-4">
          {!isGlobal && (
            <div>
              <label className="mb-2 block text-sm font-medium text-white">{t("modal.categoryLabel")}</label>
              <SearchableSelect
                options={categories.map(c => ({ label: c.name, value: c.id }))}
                value={bulkCategory}
                onChange={setBulkCategory}
                placeholder={t("modal.categoryPlaceholder")}
              />
            </div>
          )}
          {isGlobal && (
            <div className="flex justify-start mt-2 px-1">
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="text-xs text-blue hover:text-blue-dark underline underline-offset-2 transition-colors font-medium"
              >
                Descargar Plantilla de CSV
              </button>
            </div>
          )}

          <div>
            <div className="mb-2 flex items-center gap-2">
              <label className="block text-sm font-medium text-white">{t("bulk.fileLabel")}</label>
              <div className="group relative flex cursor-help items-center text-gray-400 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                <div className="absolute bottom-full left-1/2 mb-2 hidden w-64 -translate-x-1/2 rounded border border-gray-700 bg-[#1C1E26] p-3 text-xs leading-relaxed text-gray-300 shadow-xl group-hover:block z-50">
                  Asegúrate de exportar tu inventario en CSV directamente desde <strong className="text-white">Manabox</strong> (para Magic) o <strong className="text-white">Riftscan</strong> (para Riftbound).
                </div>
              </div>
            </div>
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
    </Modal>
  );
}
