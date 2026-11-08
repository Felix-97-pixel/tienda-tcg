"use client";
import Loader from "@/components/ui/Loader";
import React, { useState, useEffect, useCallback } from "react";
import { adminFetch } from "@/utils/api";
import { useTranslations } from "next-intl";
import { useToast } from "@/hooks/useToast";
import { Modal } from "@/components/ui/Modal";
import { InventoryItem } from "@/types/inventoryItem";
import SearchableSelect from "@/components/ui/SearchableSelect";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Product } from "@/types/product";
import { useActiveBranch } from "@/hooks/useActiveBranch";
import { IconStore, IconCheck, IconTrash, IconAlertTriangle, IconInfo, IconChevronUp, IconChevronDown } from "@/components/ui/Icons";
import { calculateVatBreakdownCLP, resolveGameExchangeRate } from "@/utils/tcgPrices";

export interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSuccess: () => void;
}

export default function InventoryModal({ isOpen, onClose, product: initialProduct, onSuccess }: InventoryModalProps) {
  const t = useTranslations("products");
  const tc = useTranslations("common");
  const { showToast } = useToast();
  const { activeBranch, activeBranchId } = useActiveBranch();

  const [product, setProduct] = useState(initialProduct);
  const [exchangeRate, setExchangeRate] = useState<number>(1000);
  const [baseCurrency, setBaseCurrency] = useState<string>("USD");
  const [isLoadingRates, setIsLoadingRates] = useState<boolean>(true);
  const [devaluations, setDevaluations] = useState<any[]>([]);
  const [languageDevaluations, setLanguageDevaluations] = useState<any[]>([]);
  const [isAddFormOpen, setIsAddFormOpen] = useState<boolean>(true);

  const refreshProduct = useCallback(async () => {
    if (!product?.id) return;
    try {
      const res = await adminFetch(`/products/${product.id}?adminCatalog=true`, {}, activeBranchId);
      const data = await res.json();
      if (res.ok) setProduct(data);
    } catch (err) {
      console.error("Error refreshing product:", err);
    }
  }, [product?.id, activeBranchId]);

  useEffect(() => {
    if (isOpen) {
      adminFetch("/stores/me", {}, activeBranchId)
        .then(r => r.json())
        .then(data => {
          if (data && data.devaluations) {
            setDevaluations(data.devaluations);
          }
          if (data && data.languageDevaluations) {
            setLanguageDevaluations(data.languageDevaluations);
          }
        })
        .catch(err => console.error("Error fetching store data:", err));
        
      const targetProduct = initialProduct || product;
      const gameId = targetProduct?.cardDetail?.gameId || (targetProduct as any)?.gameId;
      if (gameId) {
        Promise.all([
          adminFetch("/stores/me/exchange-rates", {}, activeBranchId).then(r => r.json()),
          adminFetch("/currencies", {}, activeBranchId).then(r => r.json())
        ]).then(([storeRates, globalRates]) => {
          const global = Array.isArray(globalRates) ? globalRates.find((g: any) => g.gameId === gameId) : null;
          if (global && global.currencyCode && global.currencyCode !== "CLP") {
            setBaseCurrency(global.currencyCode);
          } else {
            setBaseCurrency("USD");
          }
          setExchangeRate(resolveGameExchangeRate(gameId, storeRates, globalRates));
        }).catch(err => console.error("Error fetching exchange rates:", err))
          .finally(() => setIsLoadingRates(false));
      } else {
        setIsLoadingRates(false);
      }
    } else {
      setIsLoadingRates(true);
    }
  }, [isOpen, initialProduct?.id, initialProduct?.cardDetail?.gameId, product?.cardDetail?.gameId, activeBranchId]);

  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  useEffect(() => {
    setProduct(initialProduct);
  }, [initialProduct, isOpen]);

  const [languages, setLanguages] = useState<{ id: string, name: string }[]>([]);
  const [conditions, setConditions] = useState<{ id: string, name: string, displayName?: string | null }[]>([]);
  const [finishes, setFinishes] = useState<{ id: string, name: string }[]>([]);
  const [newVariation, setNewVariation] = useState({
    languageId: "",
    conditionId: "",
    finishId: "",
    price: 0,
    stock: 0
  });

  const formatPriceVal = (val: number) => {
    if (!val) return "0";
    return val.toLocaleString("es-CL", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  };

  // Opción A: PVP final en tienda con IVA incluido y redondeo a la decena (Ley del Redondeo chilena)
  const rawFinalCLP = (newVariation.price || 0) * exchangeRate;
  const { net: netPriceCLP, vat: vatPriceCLP, total: finalPriceCLP } = calculateVatBreakdownCLP(rawFinalCLP);

  useEffect(() => {
    if (newVariation.conditionId && newVariation.languageId && product?.items) {
      const selectedCond = conditions.find(c => c.id === newVariation.conditionId);
      const selectedLang = languages.find(l => l.id === newVariation.languageId);

      if (selectedCond && selectedLang) {
        const isNM = selectedCond.name.toLowerCase() === "near_mint" || selectedCond.name.toLowerCase() === "near mint" || selectedCond.name.toLowerCase() === "nm";
        const isEnglish = selectedLang.name.toLowerCase() === "english" || selectedLang.name.toLowerCase() === "inglés" || selectedLang.name.toLowerCase() === "ingles";
        
        if (!isNM || !isEnglish) {
          const nmEngItem = product.items.find((item: any) => 
            item.finishId === newVariation.finishId && 
            (item.condition?.name?.toLowerCase() === "near_mint" || item.condition?.name?.toLowerCase() === "near mint" || item.condition?.name?.toLowerCase() === "nm") &&
            (item.language?.name?.toLowerCase() === "english" || item.language?.name?.toLowerCase() === "inglés" || item.language?.name?.toLowerCase() === "ingles")
          );

          if (nmEngItem) {
            let finalMultiplier = 1;

            if (!isNM) {
              const condDeval = devaluations.find(d => d.conditionId === newVariation.conditionId);
              if (condDeval) finalMultiplier *= Number(condDeval.multiplier);
            }

            if (!isEnglish) {
              const langDeval = languageDevaluations.find(d => d.languageId === newVariation.languageId);
              if (langDeval) finalMultiplier *= Number(langDeval.multiplier);
            }

            setNewVariation(prev => ({ ...prev, price: Number((nmEngItem.price * finalMultiplier).toFixed(2)) }));
          } else {
            setNewVariation(prev => ({ ...prev, price: 0 }));
          }
        }
      }
    }
  }, [newVariation.conditionId, newVariation.languageId, newVariation.finishId, conditions, languages, product?.items, devaluations, languageDevaluations]);

  useEffect(() => {
    if (isOpen && product) {
      adminFetch("/products/meta/languages", {}, activeBranchId).then(r => r.json()).then(setLanguages);
      adminFetch("/products/meta/conditions", {}, activeBranchId).then(r => r.json()).then(setConditions);

      let foundGlobalFinishes = false;
      if (product.marketPrices && product.marketPrices.length > 0) {
        const uniqueFinishes = Array.from(new Map(
          product.marketPrices
            .filter((mp: any) => mp.finish)
            .map((mp: any) => [mp.finish!.id, mp.finish!])
        ).values());

        if (uniqueFinishes.length > 0) {
          setFinishes(uniqueFinishes as { id: string, name: string }[]);
          foundGlobalFinishes = true;
        }
      }

      if (!foundGlobalFinishes) {
        const gameString = (product?.cardDetail as any)?.gameRel?.name || (product?.cardDetail as any)?.game || product?.category?.name;
        if (gameString) {
          adminFetch(`/products/meta/finishes?game=${encodeURIComponent(gameString)}`, {}, activeBranchId)
            .then(r => r.json())
            .then(setFinishes);
        } else {
          adminFetch("/products/meta/finishes", {}, activeBranchId).then(r => r.json()).then(setFinishes);
        }
      }
    }
  }, [isOpen, product?.cardDetail?.game, product?.category?.name, product?.marketPrices, activeBranchId]);

  const handleAddVariation = async () => {
    if (!newVariation.languageId || !newVariation.conditionId) {
      showToast(t("inventory.requiredFields"), "error");
      return;
    }

    try {
      const res = await adminFetch(`/products/${product!.id}/inventory`, {
        method: "POST",
        body: JSON.stringify({ ...newVariation, productId: product!.id, isPublished: false }),
      }, activeBranchId);

      if (res.ok) {
        showToast(t("inventory.successAdd"), "success");
        setNewVariation({ languageId: "", conditionId: "", finishId: "", price: 0, stock: 0 });
        await refreshProduct();
        onSuccess();
      } else {
        try {
          const errorData = await res.json();
          showToast(errorData.message || t("inventory.errorAdd"), "error");
        } catch {
          showToast(t("inventory.errorAdd"), "error");
        }
      }
    } catch (err) {
      showToast(tc("networkError"), "error");
    }
  };

  const handleUpdateItem = async (itemId: string, price: number, stock: number, isPublished?: boolean) => {
    try {
      const payload: any = { price, stock };
      if (isPublished !== undefined) {
        payload.isPublished = isPublished;
      }
      const res = await adminFetch(`/products/inventory/${itemId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }, activeBranchId);

      if (res.ok) {
        showToast(tc("success"), "success");
        await refreshProduct();
        onSuccess();
      } else {
        showToast(tc("error"), "error");
      }
    } catch (err) {
      showToast(tc("networkError"), "error");
    }
  };

  const confirmDelete = (id: string) => {
    setItemToDelete(id);
  };

  const handleDeleteItem = async () => {
    if (!itemToDelete) return;
    try {
      const res = await adminFetch(`/products/inventory/${itemToDelete}`, {
        method: "DELETE"
      }, activeBranchId);

      if (res.ok) {
        showToast(tc("success"), "success");
        setItemToDelete(null);
        await refreshProduct();
        onSuccess();
      } else {
        showToast(tc("error"), "error");
      }
    } catch (err) {
      showToast(tc("networkError"), "error");
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={`${t("inventory.title")} - ${product?.name}`} maxWidth="6xl">
        {isLoadingRates ? (
          <div className="py-20 flex justify-center items-center">
            <Loader />
          </div>
        ) : !product ? (
          <div className="py-12 text-center text-gray-4 text-sm font-medium">
            {t("product_not_found")}
          </div>
        ) : (
          <>
            {activeBranch && (
              <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-400">
                <IconStore className="w-3.5 h-3.5 shrink-0" />
                <span>{t("managing_branch_inventory")} <strong className="text-white font-semibold">{activeBranch.name}</strong></span>
              </div>
            )}

            {/* Añadir Nueva Variación (Colapsable) */}
            <div className="bg-[#111318] p-5 rounded-2xl border border-stroke mb-8 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white">{t("inventory.addVariation")}</h4>
                  <span className="text-[11px] text-gray-400">
                    {isAddFormOpen ? t("collapse_hint_open") : t("collapse_hint_closed")}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddFormOpen(!isAddFormOpen)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white transition-all cursor-pointer"
                >
                  {isAddFormOpen ? (
                    <>
                      <IconChevronUp className="w-3.5 h-3.5" />
                      <span>{t("collapse_form_btn")}</span>
                    </>
                  ) : (
                    <>
                      <IconChevronDown className="w-3.5 h-3.5" />
                      <span>{t("expand_form_btn")}</span>
                    </>
                  )}
                </button>
              </div>

              {isAddFormOpen && (
                <div className="mt-4 pt-4 border-t border-white/5">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-bold text-gray-4 uppercase tracking-wider mb-2">{t("inventory.language")}</label>
                  <SearchableSelect
                    placeholder={`${t("inventory.language")}...`}
                    options={languages.map(l => ({ value: l.id, label: l.name }))}
                    value={newVariation.languageId}
                    onChange={(val) => setNewVariation({ ...newVariation, languageId: val })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-4 uppercase tracking-wider mb-2">{t("inventory.condition")}</label>
                  <SearchableSelect
                    placeholder={`${t("inventory.condition")}...`}
                    options={conditions.map(c => ({ value: c.id, label: c.displayName || c.name }))}
                    value={newVariation.conditionId}
                    onChange={(val) => setNewVariation({ ...newVariation, conditionId: val })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-4 uppercase tracking-wider mb-2">{t("finish_label")}</label>
                  <SearchableSelect
                    placeholder={t("finish_placeholder")}
                    options={finishes.map(f => ({ value: f.id, label: f.name }))}
                    value={newVariation.finishId}
                    onChange={(val) => setNewVariation({ ...newVariation, finishId: val })}
                  />
                </div>
                <div>
                  <Input
                    label={t("base_price_label", { currency: baseCurrency })}
                    type="number"
                    step="0.01"
                    min="0"
                    value={newVariation.price}
                    disabled={(() => {
                      if (!newVariation.conditionId || !newVariation.languageId) return false;
                      const selectedCond = conditions.find(c => c.id === newVariation.conditionId);
                      const selectedLang = languages.find(l => l.id === newVariation.languageId);
                      if (!selectedCond || !selectedLang) return false;
                      const isNM = selectedCond.name.toLowerCase() === "near_mint" || selectedCond.name.toLowerCase() === "near mint" || selectedCond.name.toLowerCase() === "nm";
                      const isEnglish = selectedLang.name.toLowerCase() === "english" || selectedLang.name.toLowerCase() === "inglés" || selectedLang.name.toLowerCase() === "ingles";
                      return !(isNM && isEnglish);
                    })()}
                    onChange={(e) => setNewVariation({ ...newVariation, price: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Input
                    label={t("inventory.stock")}
                    type="number"
                    value={newVariation.stock}
                    onChange={(e) => setNewVariation({ ...newVariation, stock: Number(e.target.value) })}
                  />
                </div>
              </div>

              {/* Tasa y Desglose IVA (Opción A) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs mb-3 px-2 gap-2">
                <div className="text-blue-400 font-bold">
                  {t("current_exchange_rate", { currency: baseCurrency, rate: exchangeRate.toLocaleString("es-CL") })}
                </div>
                <div className="text-gray-400 text-[11px]">
                  {t("chilean_vat_model_hint")}
                </div>
              </div>

              <div className="bg-[#1a1d24] rounded-xl p-4 border border-emerald-500/20 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-6 text-sm">
                  <div>
                    <span className="block text-white/50 text-xs mb-1 font-bold">{t("net_price_clp")}</span>
                    <span className="text-white font-bold text-lg">${formatPriceVal(netPriceCLP)}</span>
                    <span className="block text-[10px] text-gray-400 font-medium">{t("hundred_percent_store")}</span>
                  </div>
                  <div>
                    <span className="block text-amber-400 text-xs mb-1 font-bold">{t("vat_19_label")}</span>
                    <span className="text-amber-400 font-bold text-lg">+${formatPriceVal(vatPriceCLP)}</span>
                    <span className="block text-[10px] text-gray-400 font-medium">{t("fiscal_debit_f29")}</span>
                  </div>
                  <div>
                    <span className="block text-emerald-400 text-xs mb-1 font-bold">{t("final_store_price")}</span>
                    <span className="text-emerald-400 font-bold text-lg">
                      ${formatPriceVal(finalPriceCLP)}
                    </span>
                    <span className="block text-[10px] text-emerald-400/80 font-medium">{t("public_pvp_vat")}</span>
                  </div>
                </div>
                <div className="w-full md:w-auto min-w-[120px]">
                  <Button variant="success" onClick={handleAddVariation} fullWidth>
                    {t("inventory.add")}
                  </Button>
                </div>
              </div>
            </div>
            )}
            </div>

            {/* Tabla de Variaciones Actuales */}
            <div className="overflow-x-auto rounded-xl border border-stroke">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-[#111318] border-b border-stroke">
                    <th className="p-3 font-bold text-gray-4">{t("inventory.language")}</th>
                    <th className="p-3 font-bold text-gray-4">{t("inventory.condition")}</th>
                    <th className="p-3 font-bold text-gray-4">{t("finish_label")}</th>
                    <th className="p-3 font-bold text-gray-4">{t("col_price_currency", { currency: baseCurrency })}</th>
                    <th className="p-3 font-bold text-gray-4">{t("net_price_clp")}</th>
                    <th className="p-3 font-bold text-amber-400">{t("vat_19_label")}</th>
                    <th className="p-3 font-bold text-emerald-400">{t("final_store_price")}</th>
                    <th className="p-3 font-bold text-gray-4">{t("inventory.stock")}</th>
                    <th className="p-3 font-bold text-gray-4 text-center">{t("col_status")}</th>
                    <th className="p-3 font-bold text-gray-4 text-center">{tc("actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {product.items?.map((item: InventoryItem) => {
                    const rawFinal = Number(item.price) * exchangeRate;
                    const { net: itemNetCLP, vat: itemVatCLP, total: itemFinalCLP } = calculateVatBreakdownCLP(rawFinal);
                    return (
                      <tr key={item.id} className="border-b border-stroke hover:bg-white/[0.02] transition-colors">
                        <td className="p-3 font-medium text-white">{item.language?.name || "N/A"}</td>
                        <td className="p-3 text-white">
                          {item.condition_rel?.displayName || item.condition_rel?.name || (typeof item.condition === 'object' ? (item.condition as any).displayName || (item.condition as any).name : item.condition) || "N/A"}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.finish?.name && item.finish.name !== 'Normal' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-[#111318] text-gray-4 border border-stroke'}`}>
                            {item.finish?.name || "Normal"}
                          </span>
                        </td>
                        <td className="p-3">
                          <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            className="w-20 rounded border border-stroke p-1.5 text-xs font-bold text-white bg-[#1a1d24] focus:border-blue outline-none"
                            defaultValue={item.price}
                            onBlur={(e) => handleUpdateItem(item.id, Number(e.target.value), item.stock, item.isPublished)}
                          />
                        </td>
                        <td className="p-3 text-white font-medium">
                          ${formatPriceVal(itemNetCLP)} CLP
                          <span className="block text-[10px] text-gray-500 font-normal">{t("hundred_percent_store_short")}</span>
                        </td>
                        <td className="p-3 text-amber-400 text-xs font-semibold">
                          +${formatPriceVal(itemVatCLP)} CLP
                          <span className="block text-[10px] text-amber-400/70 font-normal">{t("debit_f29_short")}</span>
                        </td>
                        <td className="p-3 text-emerald-400 font-black">
                          ${formatPriceVal(itemFinalCLP)} CLP
                          <span className="block text-[10px] text-emerald-400/80 font-normal">{t("pvp_with_vat_short")}</span>
                        </td>
                        <td className="p-3">
                          <input
                            type="number"
                            className="w-16 rounded-lg border border-white/10 p-1.5 text-xs text-white bg-[#080B12] focus:border-red focus:outline-none"
                            defaultValue={item.stock}
                            onBlur={(e) => handleUpdateItem(item.id, item.price, Number(e.target.value), item.isPublished)}
                          />
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => handleUpdateItem(item.id, item.price, item.stock, !item.isPublished)}
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg shadow-md transition-all text-white ${item.isPublished ? "bg-emerald-600 hover:bg-emerald-500 border border-emerald-400/40 shadow-emerald-600/30 ring-1 ring-emerald-400/30" : "bg-amber-500 hover:bg-amber-400 border border-amber-300/40 shadow-amber-500/30 ring-1 ring-amber-300/30"}`}
                          >
                            {item.isPublished ? t("status_published") : t("status_paused")}
                          </button>
                        </td>
                        <td className="p-3 text-center">
                          <Button variant="danger" size="sm" onClick={() => confirmDelete(item.id)}>
                            <IconTrash className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-8 flex justify-end">
              <Button
                variant="secondary"
                onClick={onClose}
              >
                {tc("close")}
              </Button>
            </div>
          </>
        )}
      </Modal>

      {/* Modal de confirmación de eliminación */}
      <Modal isOpen={!!itemToDelete} onClose={() => setItemToDelete(null)} title={t("confirm_delete_title")}>
        <div className="p-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-red/10 border border-red/20 rounded-full flex items-center justify-center text-red">
              <IconAlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white">{t("delete_variant_q")}</h3>
            <p className="text-gray-4 text-sm">
              {t("delete_variant_confirm_desc")}
            </p>
          </div>
          <div className="flex gap-3 mt-8">
            <Button variant="secondary" className="flex-1" onClick={() => setItemToDelete(null)}>
              {t("cancel_btn")}
            </Button>
            <Button variant="danger" className="flex-1" onClick={handleDeleteItem}>
              {t("yes_delete_btn")}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
