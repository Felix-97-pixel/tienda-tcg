"use client";
import React, { useState } from "react";
import { adminFetch } from "@/utils/api";
import { useTranslations } from "next-intl";
import { useToast } from "@/hooks/useToast";
import SearchableSelect from "@/components/ui/SearchableSelect";
import Papa from "papaparse";
import { Button } from "@/components/ui/Button";
import { FileInput } from "@/components/ui/FileInput";
import { Modal } from "@/components/ui/Modal";
import { IconInfo, IconSliders, IconStore } from "@/components/ui/Icons";
import { useActiveBranch } from "@/hooks/useActiveBranch";

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
  const { activeBranch } = useActiveBranch();

  const [bulkCategory, setBulkCategory] = useState("");
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [applyDevaluations, setApplyDevaluations] = useState(true);
  const [storeAbsorbsCommission, setStoreAbsorbsCommission] = useState(true);
  const [csvPriceBasis, setCsvPriceBasis] = useState<"GROSS" | "NET">("GROSS");
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
              showToast(t("err_magic_in_riftbound"), "error");
              setIsUploading(false);
              return;
            }
            if (!headers.includes("Card Name") && !headers.includes("Name")) {
              showToast(t("err_invalid_csv_cardname"), "error");
              setIsUploading(false);
              return;
            }
          } else if (categoryName.includes("magic")) {
            if (headers.includes("Variant Number") || headers.includes("Card Name")) {
              showToast(t("err_riftbound_in_magic"), "error");
              setIsUploading(false);
              return;
            }
            if (!headers.includes("Scryfall ID") && !headers.includes("Name")) {
              showToast(t("err_invalid_csv_scryfall"), "error");
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
            const rawFoil = (row["Foil"] ?? row["Finish"] ?? row["Printing"] ?? "normal").toString().trim();
            let finishStr = rawFoil || "normal";
            if (rawFoil.toUpperCase() === "TRUE") finishStr = "foil";
            else if (rawFoil.toUpperCase() === "FALSE") finishStr = "normal";

            if (row["Variant Type"] === "Promo") finishStr = "promo";

            return {
              scryfallId: row["Scryfall ID"] || undefined,
              name: row["Name"] || row["Card Name"] || row["Product Name"] || "",
              expansion: row["Set name"] || row["Set"] || row["Set Name"] || row["Expansion"] || "",
              rarity: row["Rarity"] || "",
              collectorNum: String(row["Collector number"] || row["Variant Number"] || row["Card Number"] || row["Number"] || ""),
              quantity: Number(row["Quantity"] || row["Count"] || row["Qty"]) || 1,
              price: (() => {
                const netPriceVal = Number(row["precio_neto"] || row["Precio Neto"] || row["Net Price"] || row["net_price"]);
                const rawPriceVal = Number(row["precio_bruto"] || row["Precio Bruto"] || row["Purchase price"] || row["Price"] || row["Market Price"]) || 0;
                if (!isNaN(netPriceVal) && netPriceVal > 0) {
                  return Number((netPriceVal * 1.19).toFixed(2));
                }
                if (csvPriceBasis === "NET" && rawPriceVal > 0) {
                  return Number((rawPriceVal * 1.19).toFixed(2));
                }
                return rawPriceVal;
              })(),
              condition: row["Condition"] || row["State"] || "near_mint",
              language: row["Language"] || row["Lang"] || "en",
              finish: finishStr,
              originalIndex: index
            };
          });
        }

        try {
          const endpoint = isGlobal ? '/products/bulk-create-global' : '/products/bulk-upload';
          const res = await adminFetch(endpoint, {
            method: "POST",
            body: JSON.stringify({
              categoryId: bulkCategory,
              applyDevaluations,
              transferCommission: !storeAbsorbsCommission,
              items: parsedItems
            }),
          });

          const data = await res.json();
          if (res.ok) {
            let successMsg = t("bulk.success");
            if (data && data.added !== undefined) {
              const baseMsg = t("bulk.successMtg", {
                added: data.added,
                updated: data.updated,
                errors: data.errors?.length || 0
              });
              successMsg = data.devaluedCount > 0
                ? `${baseMsg} ${t("devalued_count_suffix", { count: data.devaluedCount })}`
                : baseMsg;
            }
            showToast(successMsg, "success");
            
            if (data && data.errors && data.errors.length > 0) {
              const errorCsv = Papa.unparse(data.errors.map((e: any) => ({
                Fila: e.index + 2,
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
      title={isGlobal ? t("bulk_global_title") : t("bulk.title")}
      maxWidth="md"
    >
      <div className="space-y-4">
        {!isGlobal && activeBranch && (
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue/10 border border-blue/20 text-xs text-blue">
            <IconStore className="w-4 h-4 shrink-0 text-blue" />
            <span>{t("target_branch_label")} <strong className="text-white font-semibold">{activeBranch.name}</strong></span>
          </div>
        )}

        <p className="mb-6 text-sm font-medium leading-relaxed text-gray-4">
          {isGlobal ? t("bulk_global_subtitle") : t("bulk.subtitle")}
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
                {t("download_csv_template")}
              </button>
            </div>
          )}

          <div>
            <div className="mb-2 flex items-center gap-2">
              <label className="block text-sm font-medium text-white">{t("bulk.fileLabel")}</label>
              <div className="group relative flex cursor-help items-center text-gray-400 hover:text-white">
                <IconInfo className="w-4 h-4" />
                <div className="absolute bottom-full left-1/2 mb-2 hidden w-64 -translate-x-1/2 rounded border border-gray-700 bg-[#1C1E26] p-3 text-xs leading-relaxed text-gray-300 shadow-xl group-hover:block z-50">
                  {t("csv_export_hint")}
                </div>
              </div>
            </div>
            <FileInput
              accept=".csv"
              onChange={(e) => setBulkFile(e.target.files?.[0] || null)}
            />
          </div>

          {!isGlobal && (
            <div className="pt-2">
              <label className="flex items-center justify-between gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/10 cursor-pointer hover:border-white/20 transition-all">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red/10 border border-red/20 flex items-center justify-center text-red shrink-0 mt-0.5">
                    <IconSliders className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white uppercase tracking-wide">
                      {t("apply_devaluation_rules_title")}
                    </p>
                    <p className="text-[11px] text-white/45 mt-1 leading-relaxed">
                      {t("apply_devaluation_rules_desc")}
                    </p>
                  </div>
                </div>
                <div className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={applyDevaluations}
                    onChange={(e) => setApplyDevaluations(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red"></div>
                </div>
              </label>

              <label className="flex items-center justify-between gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/10 cursor-pointer hover:border-white/20 transition-all mt-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                    <IconSliders className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white uppercase tracking-wide">
                      {t("transfer_commission_label")}
                    </p>
                    <p className="text-[11px] text-white/45 mt-1 leading-relaxed">
                      {storeAbsorbsCommission
                        ? t("transfer_commission_active_hint")
                        : t("transfer_commission_inactive_hint")}
                    </p>
                  </div>
                </div>
                <div className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={storeAbsorbsCommission}
                    onChange={(e) => setStoreAbsorbsCommission(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </div>
              </label>
            </div>
          )}
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
