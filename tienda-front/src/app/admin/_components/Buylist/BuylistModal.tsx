"use client";
import React, { useState, useEffect } from "react";
import { adminFetch } from "@/utils/api";
import { fetchCachedLanguages, fetchCachedConditions } from "@/utils/metadataCache";
import { useActiveBranch } from "@/hooks/useActiveBranch";
import { IconStore, IconTrash, IconAlertTriangle, IconCheck, IconCoins } from "@/components/ui/Icons";
import { useTranslations } from "next-intl";
import { useToast } from "@/hooks/useToast";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Product } from "@/types/product";

export interface BuylistModalProps {
  product: Product;
  onClose: () => void;
  onUpdate: () => void;
}

interface LanguageOption {
  id: string;
  name: string;
  code?: string;
}

interface ConditionOption {
  id: string;
  name: string;
  displayName?: string;
}

export default function BuylistModal({ product: initialProduct, onClose, onUpdate }: BuylistModalProps) {
  const t = useTranslations("products");
  const tc = useTranslations("common");
  const { showToast } = useToast();
  const { activeBranch } = useActiveBranch();
  const [product, setProduct] = useState(initialProduct);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const [languages, setLanguages] = useState<LanguageOption[]>([]);
  const [conditions, setConditions] = useState<ConditionOption[]>([]);

  // Checkbox selections for batch creation
  const [selectedLanguageIds, setSelectedLanguageIds] = useState<string[]>([]);
  const [selectedConditionIds, setSelectedConditionIds] = useState<string[]>([]);
  const [quantityWanted, setQuantityWanted] = useState<number>(1);
  const [cashPrice, setCashPrice] = useState<number>(0);
  const [creditPrice, setCreditPrice] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const refreshProduct = async () => {
    try {
      const res = await adminFetch(`/products/${product?.id}`, {}, activeBranch?.id);
      const data = await res.json();
      if (res.ok) setProduct(data);
    } catch (err) {
      console.error("Error refreshing product:", err);
    }
  };

  useEffect(() => {
    setProduct(initialProduct);
  }, [initialProduct]);

  // Cargar lista de idiomas y condiciones disponibles usando la caché global de metadatos
  useEffect(() => {
    fetchCachedLanguages()
      .then((data) => {
        if (Array.isArray(data)) {
          // Ordenar priorizando Español e Inglés primero
          const sorted = [...data].sort((a, b) => {
            const codeA = (a.code || "").toLowerCase();
            const codeB = (b.code || "").toLowerCase();
            if (codeA === "es") return -1;
            if (codeB === "es") return 1;
            if (codeA === "en") return -1;
            if (codeB === "en") return 1;
            return (a.name || "").localeCompare(b.name || "");
          });
          setLanguages(sorted);

          // Seleccionar por defecto Español e Inglés si están disponibles
          const defaults = sorted.filter((l) => ["es", "en"].includes((l.code || "").toLowerCase())).map((l) => l.id);
          setSelectedLanguageIds(defaults.length > 0 ? defaults : sorted.slice(0, 1).map((l) => l.id));
        }
      })
      .catch(() => {});

    fetchCachedConditions()
      .then((data) => {
        if (Array.isArray(data)) {
          // Ordenar por calidad: Near Mint -> Lightly Played -> Moderately Played -> etc.
          const rankCondition = (rawName: string) => {
            const n = (rawName || "").toLowerCase();
            if (n.includes("near") || n === "nm" || n === "mint") return 1;
            if (n.includes("light") || n === "lp" || n.includes("excel")) return 2;
            if (n.includes("moderat") || n === "mp" || n.includes("good")) return 3;
            if (n.includes("heav") || n === "hp") return 4;
            if (n.includes("damag") || n === "dmg" || n.includes("poor")) return 5;
            return 6;
          };

          const sorted = [...data].sort((a, b) => rankCondition(a.name) - rankCondition(b.name));
          setConditions(sorted);

          // Seleccionar por defecto Near Mint
          const defaultNm = sorted.find((c) => rankCondition(c.name) === 1) || sorted[0];
          if (defaultNm) {
            setSelectedConditionIds([defaultNm.id]);
          }
        }
      })
      .catch(() => {});
  }, []);

  // Helpers de selección rápida para idiomas
  const handleToggleAllLanguages = (selectAll: boolean) => {
    setSelectedLanguageIds(selectAll ? languages.map((l) => l.id) : []);
  };

  const handleSelectCommonLanguages = () => {
    const common = languages.filter((l) => ["es", "en"].includes((l.code || "").toLowerCase())).map((l) => l.id);
    setSelectedLanguageIds(common.length > 0 ? common : languages.slice(0, 2).map((l) => l.id));
  };

  // Helpers de selección rápida para condiciones
  const handleToggleAllConditions = (selectAll: boolean) => {
    setSelectedConditionIds(selectAll ? conditions.map((c) => c.id) : []);
  };

  const handleSelectTopConditions = () => {
    const top = conditions
      .filter((c) => {
        const n = (c.name || "").toLowerCase();
        return n.includes("near") || n.includes("mint") || n.includes("light") || n.includes("excel");
      })
      .map((c) => c.id);
    setSelectedConditionIds(top.length > 0 ? top : conditions.slice(0, 2).map((c) => c.id));
  };

  // Agregar múltiples variaciones seleccionadas con checkboxes
  const handleAddBatchVariations = async () => {
    if (selectedLanguageIds.length === 0 || selectedConditionIds.length === 0) {
      showToast("Debes seleccionar al menos un idioma y un estado físico con los checkboxes", "error");
      return;
    }

    if (cashPrice <= 0 && creditPrice <= 0) {
      showToast("Debes ingresar un precio en efectivo o crédito mayor a 0", "warning");
      return;
    }

    const totalToCreate = selectedLanguageIds.length * selectedConditionIds.length;
    setIsSubmitting(true);

    try {
      const res = await adminFetch(
        "/buylist/me/batch",
        {
          method: "POST",
          body: JSON.stringify({
            productId: product.id,
            languageIds: selectedLanguageIds,
            conditionIds: selectedConditionIds,
            quantityWanted: quantityWanted > 0 ? quantityWanted : 1,
            cashPrice: Number(cashPrice),
            creditPrice: Number(creditPrice),
            isActive: true,
          }),
        },
        activeBranch?.id
      );

      if (res.ok) {
        showToast(
          `Se configuraron con éxito ${totalToCreate} solicitudes de compra en tu Buylist`,
          "success"
        );
        await refreshProduct();
        onUpdate();
      } else {
        const errorData = await res.json();
        showToast(errorData.message || "Error al agregar solicitudes de compra", "error");
      }
    } catch (err) {
      showToast(tc("networkError"), "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateItem = async (itemId: string, updates: any) => {
    try {
      const res = await adminFetch(
        `/buylist/me/${itemId}`,
        { method: "PATCH", body: JSON.stringify(updates) },
        activeBranch?.id
      );

      if (res.ok) {
        showToast("Solicitud actualizada", "success");
        await refreshProduct();
        onUpdate();
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
      const res = await adminFetch(`/buylist/me/${itemToDelete}`, { method: "DELETE" }, activeBranch?.id);
      if (res.ok) {
        showToast("Solicitud eliminada", "success");
        setItemToDelete(null);
        await refreshProduct();
        onUpdate();
      } else {
        showToast("Error al eliminar", "error");
      }
    } catch (err) {
      showToast(tc("networkError"), "error");
    }
  };

  if (!product) return null;

  const buyListItems = (product as any).buyListItems || [];
  const totalCombinations = selectedLanguageIds.length * selectedConditionIds.length;

  const getConditionStyle = (rawName?: string) => {
    const n = (rawName || "").toLowerCase();
    if (n.includes("near") || n === "nm" || n === "mint") {
      return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
    }
    if (n.includes("light") || n === "lp" || n.includes("excel")) {
      return "bg-blue-500/15 text-blue-400 border-blue-500/30";
    }
    if (n.includes("moderat") || n === "mp" || n.includes("good")) {
      return "bg-amber-500/15 text-amber-400 border-amber-500/30";
    }
    if (n.includes("heav") || n === "hp") {
      return "bg-orange-500/15 text-orange-400 border-orange-500/30";
    }
    return "bg-rose-500/15 text-rose-400 border-rose-500/30";
  };

  return (
    <>
      <Modal
        isOpen={true}
        onClose={onClose}
        title={<>Gestionar Buylist - <span className="text-blue">{product?.name}</span></>}
        maxWidth="4xl"
      >
        {/* Formulario Nueva Solicitud con Checkboxes para Múltiples Idiomas y Estados */}
        <div className="mb-8 p-5 bg-[#0C1019] rounded-2xl border border-white/10 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-white/5 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <IconCoins className="w-4 h-4 text-amber-400" />
                <span>Añadir Solicitud de Compra (Selección Múltiple)</span>
              </h3>
              <p className="text-xs text-gray-4 mt-0.5">
                Marca los idiomas y estados que estás dispuesto a comprar. Se creará una solicitud por cada combinación elegida.
              </p>
            </div>
          </div>

          {/* Sección 1: Checkboxes de Idiomas */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-white/80">
                Idiomas Aceptados ({selectedLanguageIds.length} seleccionados)
              </label>
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={handleSelectCommonLanguages}
                  className="text-blue hover:underline font-semibold"
                >
                  Español e Inglés
                </button>
                <span className="text-white/20">•</span>
                <button
                  type="button"
                  onClick={() => handleToggleAllLanguages(true)}
                  className="text-gray-4 hover:text-white"
                >
                  Todos
                </button>
                <span className="text-white/20">•</span>
                <button
                  type="button"
                  onClick={() => handleToggleAllLanguages(false)}
                  className="text-gray-4 hover:text-white"
                >
                  Ninguno
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {languages.map((l) => {
                const isChecked = selectedLanguageIds.includes(l.id);
                const code = (l.code || l.name || "").substring(0, 2).toUpperCase();

                return (
                  <label
                    key={l.id}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border text-xs font-medium cursor-pointer transition-all select-none ${
                      isChecked
                        ? "bg-blue/15 border-blue text-white shadow-sm shadow-blue/20"
                        : "bg-[#111522] border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedLanguageIds([...selectedLanguageIds, l.id]);
                        } else {
                          setSelectedLanguageIds(selectedLanguageIds.filter((id) => id !== l.id));
                        }
                      }}
                      className="rounded border-white/30 bg-[#0A0D14] text-blue focus:ring-blue/30 focus:ring-offset-0 w-4 h-4 cursor-pointer"
                    />
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-white/5 border border-white/10 text-gray-300">
                      {code}
                    </span>
                    <span className="truncate">{l.name}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Sección 2: Checkboxes de Estados / Condiciones */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-white/80">
                Estados / Condiciones Aceptadas ({selectedConditionIds.length} seleccionadas)
              </label>
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={handleSelectTopConditions}
                  className="text-amber-400 hover:underline font-semibold"
                >
                  Solo NM y LP
                </button>
                <span className="text-white/20">•</span>
                <button
                  type="button"
                  onClick={() => handleToggleAllConditions(true)}
                  className="text-gray-4 hover:text-white"
                >
                  Todas
                </button>
                <span className="text-white/20">•</span>
                <button
                  type="button"
                  onClick={() => handleToggleAllConditions(false)}
                  className="text-gray-4 hover:text-white"
                >
                  Limpiar
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {conditions.map((c) => {
                const isChecked = selectedConditionIds.includes(c.id);
                const badgeClass = getConditionStyle(c.name);

                return (
                  <label
                    key={c.id}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border text-xs font-medium cursor-pointer transition-all select-none ${
                      isChecked
                        ? "bg-amber-500/15 border-amber-500 text-white shadow-sm shadow-amber-500/20"
                        : "bg-[#111522] border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedConditionIds([...selectedConditionIds, c.id]);
                        } else {
                          setSelectedConditionIds(selectedConditionIds.filter((id) => id !== c.id));
                        }
                      }}
                      className="rounded border-white/30 bg-[#0A0D14] text-amber-500 focus:ring-amber-500/30 focus:ring-offset-0 w-4 h-4 cursor-pointer"
                    />
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono border ${badgeClass}`}>
                      {c.displayName || c.name}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Sección 3: Cantidad y Precios (Efectivo y Crédito en CLP) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-white/5">
            <div>
              <Input
                label="Cant. Buscada (por variación)"
                type="number"
                min={1}
                value={quantityWanted}
                onChange={(e) => setQuantityWanted(Math.max(1, Number(e.target.value)))}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-4">Precio Efectivo / Cash ($ CLP) *</label>
              <input
                type="number"
                min={0}
                className="w-full rounded-xl border border-white/10 bg-[#0A0D14] px-4 py-2.5 text-emerald-400 font-bold focus:border-emerald-500 outline-none transition text-sm"
                value={cashPrice}
                onChange={(e) => setCashPrice(Number(e.target.value))}
                placeholder="0"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-4">Precio Crédito Tienda ($ CLP) *</label>
              <input
                type="number"
                min={0}
                className="w-full rounded-xl border border-white/10 bg-[#0A0D14] px-4 py-2.5 text-blue font-bold focus:border-blue outline-none transition text-sm"
                value={creditPrice}
                onChange={(e) => setCreditPrice(Number(e.target.value))}
                placeholder="0"
              />
            </div>
          </div>

          {/* Barra de Confirmación y Resumen */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
            <div className="text-xs text-gray-4">
              {totalCombinations > 0 ? (
                <span>
                  Se añadirán o actualizarán <strong className="text-white font-bold">{totalCombinations} solicitudes</strong> (
                  {selectedLanguageIds.length} idioma{selectedLanguageIds.length !== 1 ? "s" : ""} × {selectedConditionIds.length} estado{selectedConditionIds.length !== 1 ? "s" : ""}) a tu Buylist.
                </span>
              ) : (
                <span className="text-amber-400">Marca al menos 1 idioma y 1 estado físico con los checkboxes.</span>
              )}
            </div>

            <Button
              variant="success"
              onClick={handleAddBatchVariations}
              disabled={isSubmitting || totalCombinations === 0}
              className="text-xs font-bold !py-2.5 whitespace-nowrap"
            >
              {isSubmitting ? "Guardando..." : `+ Añadir ${totalCombinations} Solicitudes`}
            </Button>
          </div>
        </div>

        {/* Tabla de Variaciones Actuales de esta Carta en Buylist */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white/80">
              Solicitudes Activas en tu Buylist ({buyListItems.length})
            </h4>
          </div>

          <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#0C1019]">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-[#111522] border-b border-white/10 text-xs">
                  <th className="p-3 font-bold text-gray-4">Idioma</th>
                  <th className="p-3 font-bold text-gray-4">Condición</th>
                  <th className="p-3 font-bold text-gray-4">Buscados</th>
                  <th className="p-3 font-bold text-gray-4">Cash ($)</th>
                  <th className="p-3 font-bold text-gray-4">Crédito ($)</th>
                  <th className="p-3 font-bold text-gray-4 text-center">Estado</th>
                  <th className="p-3 font-bold text-gray-4 text-center">{tc("actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {buyListItems.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-4 text-xs">
                      No estás comprando ninguna variación de esta carta actualmente.
                    </td>
                  </tr>
                )}
                {buyListItems.map((item: any) => {
                  const badgeClass = getConditionStyle(item.condition?.name);
                  const langCode = (item.language?.code || item.language?.name || "EN").substring(0, 2).toUpperCase();

                  return (
                    <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-3 text-white font-medium text-xs">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-white/5 border border-white/10 mr-1.5">
                          {langCode}
                        </span>
                        {item.language?.name || "N/A"}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono border ${badgeClass}`}>
                          {item.condition?.displayName || item.condition?.name || "N/A"}
                        </span>
                      </td>
                      <td className="p-3">
                        <input
                          type="number"
                          className="w-16 rounded-lg border border-white/10 p-1 text-xs font-bold text-white bg-[#0A0D14] focus:border-blue outline-none"
                          defaultValue={item.quantityWanted}
                          onBlur={(e) => handleUpdateItem(item.id, { quantityWanted: Number(e.target.value) })}
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="number"
                          className="w-24 rounded-lg border border-white/10 p-1 text-xs font-bold text-emerald-400 bg-[#0A0D14] focus:border-emerald-500 outline-none"
                          defaultValue={item.cashPrice}
                          onBlur={(e) => handleUpdateItem(item.id, { cashPrice: Number(e.target.value) })}
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="number"
                          className="w-24 rounded-lg border border-white/10 p-1 text-xs font-bold text-blue bg-[#0A0D14] focus:border-blue outline-none"
                          defaultValue={item.creditPrice}
                          onBlur={(e) => handleUpdateItem(item.id, { creditPrice: Number(e.target.value) })}
                        />
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleUpdateItem(item.id, { isActive: !item.isActive })}
                          className={`px-3 py-1 text-[11px] font-bold rounded-lg border transition-all ${
                            item.isActive
                              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25"
                              : "bg-amber-500/15 text-amber-400 border-amber-500/30 hover:bg-amber-500/25"
                          }`}
                        >
                          {item.isActive ? "Publicado" : "Pausado"}
                        </button>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => confirmDelete(item.id)}
                          className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all"
                          title="Eliminar solicitud"
                        >
                          <IconTrash className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <Button variant="secondary" onClick={onClose}>
            {tc("close")}
          </Button>
        </div>
      </Modal>

      {/* Modal de confirmación de eliminación */}
      <Modal isOpen={!!itemToDelete} onClose={() => setItemToDelete(null)} title="Confirmar Eliminación">
        <div className="p-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-red/10 rounded-full flex items-center justify-center text-red">
              <IconAlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white">¿Eliminar solicitud?</h3>
            <p className="text-gray-4 text-sm">
              ¿Estás seguro que deseas eliminar esta solicitud de compra permanentemente?
            </p>
          </div>
          <div className="flex gap-3 mt-8">
            <Button variant="secondary" className="flex-1" onClick={() => setItemToDelete(null)}>
              Cancelar
            </Button>
            <Button variant="danger" className="flex-1" onClick={handleDeleteItem}>
              Sí, eliminar
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
