"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { adminFetch } from "@/utils/api";
import { useToast } from "@/hooks/useToast";
import SearchableSelect from "@/components/ui/SearchableSelect";
import MultiSearchableSelect from "@/components/ui/MultiSearchableSelect";
import { Switch } from "@/components/ui/Switch";
import { Button } from "@/components/ui/Button";
import {
  IconRefresh,
  IconGamepad,
  IconCard,
  IconSliders,
  IconCheckCircle,
  IconAlertTriangle,
  IconShieldCheck,
  IconSparkles,
  IconBox,
  IconGlobe,
  IconUsers,
  IconCalendar,
  IconClock,
  IconHistory,
} from "@/components/ui/Icons";

type TargetScope = "ONLY_ZERO_PRICE" | "ONLY_IN_STOCK" | "ALL";

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  isTcg: boolean;
}

interface ExpansionOption {
  name: string;
  products: number;
}

interface PreviewSample {
  id: string;
  name: string;
  imageUrl: string | null;
  categoryName: string;
  expansion: string;
  condition: string;
  language: string;
  finish: string;
  stock: number;
  isPublished: boolean;
  currentPrice: number;
  marketBasePrice: number;
  localBasePrice?: number | null;
  priceDate?: string | null;
  conditionMultiplier: number;
  languageMultiplier: number;
}

interface PreviewResponse {
  totalMatching: number;
  onlyZeroPriceCount: number;
  onlyInStockCount: number;
  devaluationRulesCount: number;
  localCoverageCount?: number;
  effectiveDate?: string | null;
  hoursAgo?: number | null;
  isDataOutdated?: boolean;
  availableDates?: string[];
  samples: PreviewSample[];
}

export default function AdminPriceSyncPage() {
  const t = useTranslations("admin.price_sync_page");
  const { showToast } = useToast();

  // Metadatos de Juegos y Expansiones
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [expansions, setExpansions] = useState<ExpansionOption[]>([]);
  const [loadingExpansions, setLoadingExpansions] = useState(false);
  const expansionsCache = useRef<Record<string, ExpansionOption[]>>({});

  // Parámetros de sincronización (Inicia vacío por requerimiento de usuario)
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedExpansions, setSelectedExpansions] = useState<string[]>([]);
  const [targetScope, setTargetScope] = useState<TargetScope>("ONLY_IN_STOCK");
  const [applyDevaluations, setApplyDevaluations] = useState<boolean>(true);
  const [sourcePriceBasis, setSourcePriceBasis] = useState<"GROSS" | "NET">("GROSS");
  const [priceBenchmarkSource, setPriceBenchmarkSource] = useState<"USA_MARKET" | "LOCAL_MARKET">("USA_MARKET");
  const [priceDateMode, setPriceDateMode] = useState<"LATEST" | "CUSTOM">("LATEST");
  const [customPriceDate, setCustomPriceDate] = useState<string>("");

  // Estado de vista previa y ejecución
  const [preview, setPreview] = useState<PreviewResponse | null>(null);
  const [loadingPreview, setLoadingPreview] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [refreshCounter, setRefreshCounter] = useState<number>(0);
  const refreshPreview = useCallback(() => setRefreshCounter((c) => c + 1), []);
  const [lastSyncResult, setLastSyncResult] = useState<{
    updatedCount: number;
    timestamp: string;
  } | null>(null);

  // 1. Cargar categorías TCG al montar
  useEffect(() => {
    adminFetch("/products/meta/categories/admin?isTcg=true")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (Array.isArray(data)) setCategories(data);
      })
      .catch(() => setCategories([]));
  }, []);

  // 2. Cargar expansiones cuando cambia el juego seleccionado (Caché O(1) en memoria)
  useEffect(() => {
    if (!selectedCategory || selectedCategory === "ALL") {
      setExpansions([]);
      setSelectedExpansions([]);
      return;
    }

    // Al cambiar de juego, la selección inicia sin nada seleccionado
    setSelectedExpansions([]);

    if (expansionsCache.current[selectedCategory]) {
      setExpansions(expansionsCache.current[selectedCategory]);
      return;
    }

    setLoadingExpansions(true);
    adminFetch(
      `/products/meta/expansions?category=${encodeURIComponent(selectedCategory)}`
    )
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          expansionsCache.current[selectedCategory] = data;
          setExpansions(data);
        }
      })
      .catch(() => setExpansions([]))
      .finally(() => setLoadingExpansions(false));
  }, [selectedCategory]);

  // 3. Cargar vista previa cada vez que cambia Juego o Expansiones con Debounce de 300ms y AbortController
  useEffect(() => {
    // Si se eligió un juego específico y no hay ninguna expansión seleccionada, el conteo es 0
    if (selectedCategory !== "ALL" && selectedExpansions.length === 0) {
      setPreview({
        totalMatching: 0,
        onlyZeroPriceCount: 0,
        onlyInStockCount: 0,
        devaluationRulesCount: 0,
        samples: [],
      });
      setLoadingPreview(false);
      return;
    }

    setLoadingPreview(true);
    let isCancelled = false;

    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams();
        if (selectedCategory && selectedCategory !== "ALL") {
          params.set("category", selectedCategory);
        }
        if (selectedExpansions.length > 0 && selectedExpansions.length < expansions.length) {
          params.set("expansions", selectedExpansions.join(","));
        }

        params.set("benchmarkSource", priceBenchmarkSource);
        if (priceDateMode === "CUSTOM" && customPriceDate) {
          params.set("priceDate", customPriceDate);
        } else {
          params.set("priceDate", "LATEST");
        }

        const res = await adminFetch(
          `/sync/dealer-prices/preview?${params.toString()}`
        );
        if (res.ok && !isCancelled) {
          const data: PreviewResponse = await res.json();
          setPreview(data);
          if (!customPriceDate && data.availableDates && data.availableDates.length > 0) {
            setCustomPriceDate(data.availableDates[0]);
          }
        }
      } catch (e: any) {
        if (!isCancelled) {
          console.error("Error cargando vista previa de sincronización:", e);
        }
      } finally {
        if (!isCancelled) {
          setLoadingPreview(false);
        }
      }
    }, 300);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [
    selectedCategory,
    selectedExpansions,
    expansions.length,
    priceBenchmarkSource,
    priceDateMode,
    customPriceDate,
    refreshCounter,
  ]);

  // Cantidad de cartas que serán afectadas según el alcance elegido
  const affectedCount = useMemo(() => {
    if (!preview) return 0;
    if (targetScope === "ONLY_ZERO_PRICE") return preview.onlyZeroPriceCount;
    if (targetScope === "ONLY_IN_STOCK") return preview.onlyInStockCount;
    return preview.totalMatching;
  }, [preview, targetScope]);

  // Calcular precio simulado para una fila de muestra tomando en cuenta Estado + Idioma
  const computeSimulatedPrice = useCallback(
    (sample: PreviewSample) => {
      const base =
        priceBenchmarkSource === "LOCAL_MARKET" && sample.localBasePrice && sample.localBasePrice > 0
          ? sample.localBasePrice
          : sample.marketBasePrice;
      const condMult = applyDevaluations ? sample.conditionMultiplier : 1.0;
      const langMult = applyDevaluations ? sample.languageMultiplier : 1.0;
      const vatMult = sourcePriceBasis === "NET" ? 1.19 : 1.0;
      const raw = base * condMult * langMult * vatMult;
      return Number(Math.max(0.01, raw).toFixed(2));
    },
    [applyDevaluations, sourcePriceBasis, priceBenchmarkSource]
  );

  // Ejecutar sincronización
  const handleSync = async () => {
    if (affectedCount === 0) {
      showToast(t("toast_no_matching"), "info");
      return;
    }

    setSyncing(true);
    try {
      const res = await adminFetch("/sync/dealer-prices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category: selectedCategory,
          expansions: selectedExpansions,
          targetScope,
          applyDevaluations,
          sourcePriceBasis,
          priceBenchmarkSource,
          priceDate: priceDateMode === "CUSTOM" && customPriceDate ? customPriceDate : "LATEST",
          autoPublish: true,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast(
          t("toast_sync_success", { count: data.updatedCount }),
          "success"
        );
        setLastSyncResult({
          updatedCount: data.updatedCount,
          timestamp: new Date().toLocaleTimeString("es-CL"),
        });
        refreshPreview();
      } else {
        showToast(data.message || t("toast_sync_error"), "error");
      }
    } catch (err) {
      showToast(t("toast_network_error"), "error");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="p-6 space-y-6 pb-24 max-w-6xl mx-auto text-white">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-red mb-1">
            <IconRefresh className="w-3.5 h-3.5" />
            <span>{t("badge")}</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            {t("title")}
          </h1>
          <p className="text-white/50 text-xs mt-1">
            {t("subtitle")}
          </p>
        </div>

        {lastSyncResult && (
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
            <IconCheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>
              {t("last_sync_banner", {
                time: lastSyncResult.timestamp,
                count: lastSyncResult.updatedCount,
              })}
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* COLUMNA IZQUIERDA (2/3): CONFIGURACIÓN PASO A PASO */}
        <div className="lg:col-span-2 space-y-6">
          {/* PASO 1: JUEGO Y EXPANSIÓN */}
          <div className="bg-[#0E121B] border border-white/10 rounded-2xl p-6 space-y-5 shadow-xl">
            <div className="flex items-center gap-3 pb-3 border-b border-white/5">
              <div className="w-9 h-9 rounded-xl bg-red/10 border border-red/25 flex items-center justify-center text-red shrink-0">
                <IconGamepad className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-red">
                  {t("step1_badge")}
                </span>
                <h2 className="text-base font-bold text-white">
                  {t("step1_title")}
                </h2>
              </div>
            </div>

            {/* Selector de Juego */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-2.5">
                {t("game_label")}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory("ALL");
                    setSelectedExpansions([]);
                  }}
                  className={`p-3.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                    selectedCategory === "ALL"
                      ? "bg-red/15 border-red text-white shadow-md shadow-red/10"
                      : "bg-[#080B12] border-white/10 text-white/60 hover:text-white hover:border-white/20"
                  }`}
                >
                  <div>
                    <div className="text-xs font-black">{t("all_games_title")}</div>
                    <div className="text-[11px] text-white/40 mt-0.5">
                      {t("all_games_desc")}
                    </div>
                  </div>
                  {selectedCategory === "ALL" && (
                    <IconCheckCircle className="w-4 h-4 text-red shrink-0" />
                  )}
                </button>

                {categories.map((cat) => {
                  const active = selectedCategory === cat.name;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(cat.name);
                        setSelectedExpansions([]);
                      }}
                      className={`p-3.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                        active
                          ? "bg-red/15 border-red text-white shadow-md shadow-red/10"
                          : "bg-[#080B12] border-white/10 text-white/60 hover:text-white hover:border-white/20"
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="text-xs font-black truncate">{cat.name}</div>
                        <div className="text-[11px] text-white/40 mt-0.5">
                          {t("filter_by_edition_hint")}
                        </div>
                      </div>
                      {active && (
                        <IconCheckCircle className="w-4 h-4 text-red shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selector de Expansión con Checkboxes Multi-Select */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-white/60">
                  {t("expansion_label")}
                </label>
                {selectedCategory !== "ALL" && expansions.length > 0 && (
                  <span className="text-[11px] text-white/40">
                    {selectedExpansions.length === 0
                      ? "Sin selección (elige al menos una)"
                      : `${selectedExpansions.length} de ${expansions.length} seleccionadas`}
                  </span>
                )}
              </div>

              {selectedCategory === "ALL" ? (
                <div className="p-3.5 rounded-xl bg-[#080B12] border border-white/10 text-xs text-white/40 flex items-center gap-2.5">
                  <IconBox className="w-4 h-4 text-white/30 shrink-0" />
                  <span>{t("select_game_first_hint")}</span>
                </div>
              ) : (
                <MultiSearchableSelect
                  options={expansions.map((exp) => ({
                    value: exp.name,
                    label: exp.name,
                    count: exp.products,
                  }))}
                  selectedValues={selectedExpansions}
                  onChange={setSelectedExpansions}
                  placeholder={
                    loadingExpansions
                      ? t("loading_expansions_placeholder")
                      : "Seleccionar ediciones a actualizar..."
                  }
                  allLabel={t("all_expansions_label")}
                  disabled={loadingExpansions || expansions.length === 0}
                />
              )}
            </div>
          </div>

          {/* SELECTOR DE FUENTE DE PRECIOS BASE: INTERNACIONAL VS LOCAL TAPTRADE */}
          <div className="bg-[#0E121B] border border-white/10 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-3 pb-3 border-b border-white/5">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-400 shrink-0">
                <IconGlobe className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">
                  {t("benchmark_source_badge")}
                </span>
                <h2 className="text-base font-bold text-white">
                  {t("benchmark_source_title")}
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPriceBenchmarkSource("USA_MARKET")}
                className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  priceBenchmarkSource === "USA_MARKET"
                    ? "bg-blue-500/10 border-blue-500/50 text-white shadow-lg ring-1 ring-blue-500/50"
                    : "bg-[#080B12] border-white/10 text-white/60 hover:text-white hover:border-white/20"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                      {t("benchmark_usa_badge")}
                    </span>
                    <IconGlobe className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="text-sm font-bold text-white">{t("benchmark_usa_title")}</div>
                  <p className="text-[11px] text-white/40 mt-1 leading-relaxed">
                    {t("benchmark_usa_desc")}
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPriceBenchmarkSource("LOCAL_MARKET")}
                className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  priceBenchmarkSource === "LOCAL_MARKET"
                    ? "bg-emerald-500/10 border-emerald-500/50 text-white shadow-lg ring-1 ring-emerald-500/50"
                    : "bg-[#080B12] border-white/10 text-white/60 hover:text-white hover:border-white/20"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                      {t("benchmark_local_badge")}
                    </span>
                    <IconUsers className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-sm font-bold text-white">{t("benchmark_local_title")}</div>
                  <p className="text-[11px] text-white/40 mt-1 leading-relaxed">
                    {t("benchmark_local_desc")}
                  </p>
                </div>
              </button>
            </div>

            {/* AVISO DE ADVERTENCIA: DISPONIBILIDAD DE DATOS EN MERCADO PROPIO */}
            {priceBenchmarkSource === "LOCAL_MARKET" && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-200">
                <IconAlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-amber-300 text-xs">
                      {t("benchmark_local_warning_title")}
                    </span>
                    {preview && preview.samples.length > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-[10px] font-mono text-amber-300">
                        {t("local_coverage_info", {
                          count: preview.localCoverageCount ?? 0,
                          total: preview.samples.length,
                        })}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-amber-200/90 leading-relaxed">
                    {t("benchmark_local_warning_desc")}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* PASO: FECHA DE LOS PRECIOS A IMPORTAR */}
          <div className="bg-[#0E121B] border border-white/10 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-400 shrink-0">
                  <IconCalendar className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">
                    {t("snapshot_date_badge")}
                  </span>
                  <h2 className="text-base font-bold text-white">
                    {t("snapshot_date_title")}
                  </h2>
                </div>
              </div>

              {preview?.effectiveDate && (
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-white/80">
                    {t("snapshot_freshness_badge", { date: preview.effectiveDate })}
                  </span>
                  {preview.hoursAgo != null && (
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                        preview.hoursAgo < 24
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                          : "bg-amber-500/15 text-amber-400 border border-amber-500/25"
                      }`}
                    >
                      {preview.hoursAgo < 24
                        ? t("snapshot_updated_today")
                        : t("snapshot_updated_days_ago", {
                            days: Math.ceil(preview.hoursAgo / 24),
                            date: preview.effectiveDate,
                          })}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPriceDateMode("LATEST")}
                className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  priceDateMode === "LATEST"
                    ? "bg-purple-500/10 border-purple-500/50 text-white shadow-lg ring-1 ring-purple-500/50"
                    : "bg-[#080B12] border-white/10 text-white/60 hover:text-white hover:border-white/20"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                      Recomendado
                    </span>
                    <IconClock className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="text-sm font-bold text-white">{t("snapshot_mode_latest")}</div>
                  <p className="text-[11px] text-white/40 mt-1 leading-relaxed">
                    {t("snapshot_mode_latest_desc")}
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPriceDateMode("CUSTOM")}
                className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  priceDateMode === "CUSTOM"
                    ? "bg-purple-500/10 border-purple-500/50 text-white shadow-lg ring-1 ring-purple-500/50"
                    : "bg-[#080B12] border-white/10 text-white/60 hover:text-white hover:border-white/20"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 text-white/60">
                      Histórico
                    </span>
                    <IconHistory className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="text-sm font-bold text-white">{t("snapshot_mode_history")}</div>
                  <p className="text-[11px] text-white/40 mt-1 leading-relaxed">
                    {t("snapshot_mode_history_desc")}
                  </p>
                </div>
              </button>
            </div>

            {/* Selector de Fecha Específica si se elige modo Histórico */}
            {priceDateMode === "CUSTOM" && (
              <div className="pt-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-2">
                  {t("snapshot_date_label")}
                </label>
                {preview?.availableDates && preview.availableDates.length > 0 ? (
                  <select
                    value={customPriceDate}
                    onChange={(e) => setCustomPriceDate(e.target.value)}
                    className="w-full sm:w-72 bg-[#080B12] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 transition-all font-mono"
                  >
                    {preview.availableDates.map((dateStr) => (
                      <option key={dateStr} value={dateStr} className="bg-[#0E121B] text-white">
                        Snapshot del {dateStr}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="date"
                    value={customPriceDate}
                    onChange={(e) => setCustomPriceDate(e.target.value)}
                    className="bg-[#080B12] border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500 transition-all font-mono"
                  />
                )}
              </div>
            )}

            {/* Aviso si la data tiene más de 48 horas de antigüedad */}
            {preview?.isDataOutdated && priceDateMode === "LATEST" && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-200">
                <IconAlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-amber-300">
                    {t("snapshot_outdated_warning_title")}
                  </p>
                  <p className="text-[11px] text-amber-200/90 leading-relaxed">
                    {t("snapshot_outdated_warning_desc", { date: preview.effectiveDate })}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* PASO 2: ALCANCE DE PROTECCIÓN DE PRECIOS */}
          <div className="bg-[#0E121B] border border-white/10 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-3 pb-3 border-b border-white/5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0">
                <IconShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                  {t("step2_badge")}
                </span>
                <h2 className="text-base font-bold text-white">
                  {t("step2_title")}
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                {
                  id: "ONLY_IN_STOCK" as TargetScope,
                  title: t("scope_stock_title"),
                  desc: t("scope_stock_desc"),
                  count: preview?.onlyInStockCount ?? 0,
                  badge: t("scope_stock_badge"),
                },
                {
                  id: "ONLY_ZERO_PRICE" as TargetScope,
                  title: t("scope_zero_title"),
                  desc: t("scope_zero_desc"),
                  count: preview?.onlyZeroPriceCount ?? 0,
                  badge: t("scope_zero_badge"),
                },
                {
                  id: "ALL" as TargetScope,
                  title: t("scope_all_title"),
                  desc: t("scope_all_desc"),
                  count: preview?.totalMatching ?? 0,
                  badge: t("scope_all_badge"),
                },
              ].map((opt) => {
                const active = targetScope === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setTargetScope(opt.id)}
                    className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      active
                        ? "bg-emerald-500/10 border-emerald-500/50 text-white shadow-lg"
                        : "bg-[#080B12] border-white/10 text-white/60 hover:text-white hover:border-white/20"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 text-white/60">
                          {opt.badge}
                        </span>
                        <span className="font-mono text-xs font-black text-emerald-400">
                          {t("cards_count_unit", { count: opt.count.toLocaleString("es-CL") })}
                        </span>
                      </div>
                      <div className="text-sm font-bold text-white">{opt.title}</div>
                      <p className="text-[11px] text-white/40 mt-1 leading-relaxed">
                        {opt.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* PASO 3: INTERRUPTOR ÚNICO DE REGLAS DE DEVALUACIÓN (ESTADO E IDIOMA) */}
          <div className="bg-[#0E121B] border border-white/10 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                  <IconSliders className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block">
                    {t("step3_badge")}
                  </span>
                  <h2 className="text-base font-bold text-white mt-0.5">
                    {t("step3_title")}
                  </h2>
                  <p className="text-xs text-white/50 mt-1 leading-relaxed max-w-xl">
                    {t("step3_desc_prefix")}{" "}
                    <Link
                      href="/admin/devaluations"
                      className="text-amber-300 underline hover:text-amber-200"
                    >
                      {t("step3_rules_link")}
                    </Link>{" "}
                    {t("step3_active_rules", { count: preview?.devaluationRulesCount || 0 })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span
                  className={`text-xs font-black uppercase tracking-wider ${
                    applyDevaluations ? "text-emerald-400" : "text-white/40"
                  }`}
                >
                  {applyDevaluations ? t("yes_apply") : t("no_apply")}
                </span>
                <Switch
                  checked={applyDevaluations}
                  onChange={(e) => setApplyDevaluations(e.target.checked)}
                  wrapperClassName="!p-0 !border-0 !bg-transparent shrink-0"
                />
              </div>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA (1/3): RESUMEN DE IMPACTO Y BOTÓN DE EJECUCIÓN */}
        <div className="space-y-6">
          <div className="bg-[#0E121B] border border-white/10 rounded-2xl p-6 space-y-5 shadow-xl sticky top-6">
            <div className="flex items-center gap-2.5">
              <IconSparkles className="w-5 h-5 text-red" />
              <h3 className="text-base font-black text-white">
                {t("summary_title")}
              </h3>
            </div>

            <div className="bg-[#080B12] border border-white/10 rounded-xl p-4 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-white/40">{t("summary_game")}</span>
                <span className="font-bold text-white text-right truncate max-w-[160px]">
                  {selectedCategory === "ALL" ? t("summary_all_games") : selectedCategory}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/40">{t("summary_expansion")}</span>
                <span className="font-bold text-emerald-400 text-right truncate max-w-[160px]">
                  {selectedCategory === "ALL"
                    ? t("summary_all_editions")
                    : selectedExpansions.length === 0
                    ? "Sin selección (0)"
                    : selectedExpansions.length === expansions.length
                    ? t("summary_all_editions")
                    : `${selectedExpansions.length} seleccionadas`}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/40">{t("summary_market_source")}</span>
                <span className="font-bold text-white text-right text-xs">
                  {priceBenchmarkSource === "LOCAL_MARKET"
                    ? t("benchmark_local_title")
                    : t("benchmark_usa_title")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/40">{t("summary_price_date")}</span>
                <span className="font-bold text-purple-300 text-right text-xs font-mono">
                  {priceDateMode === "LATEST"
                    ? (preview?.effectiveDate || "Hoy")
                    : (customPriceDate || "Personalizada")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/40">{t("summary_scope")}</span>
                <span className="font-bold text-white">
                  {targetScope === "ONLY_IN_STOCK"
                    ? t("scope_stock_title")
                    : targetScope === "ONLY_ZERO_PRICE"
                    ? t("summary_scope_zero_short")
                    : t("scope_all_title")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/40">{t("summary_devaluation")}</span>
                <span
                  className={`font-bold ${
                    applyDevaluations ? "text-emerald-400" : "text-white/50"
                  }`}
                >
                  {applyDevaluations ? t("status_enabled") : t("status_disabled")}
                </span>
              </div>
              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                <span className="text-white/60 font-bold uppercase text-[10px] tracking-wider">
                  {t("cards_to_update")}
                </span>
                <span className="text-2xl font-mono font-black text-white">
                  {loadingPreview ? "..." : affectedCount.toLocaleString("es-CL")}
                </span>
              </div>
            </div>

            {targetScope === "ALL" && selectedCategory === "ALL" && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-[11px] text-amber-200">
                <IconAlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{t("full_catalog_warning")}</span>
              </div>
            )}

            {priceBenchmarkSource === "LOCAL_MARKET" && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-[11px] text-amber-200">
                <IconAlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{t("benchmark_local_summary_note")}</span>
              </div>
            )}

            <Button
              variant="primary"
              size="lg"
              onClick={handleSync}
              isLoading={syncing}
              disabled={loadingPreview || affectedCount === 0}
              leftIcon={<IconRefresh className="w-4 h-4" />}
              className="w-full justify-center"
            >
              {t("sync_now_btn", { count: affectedCount.toLocaleString("es-CL") })}
            </Button>
          </div>
        </div>
      </div>

      {/* TABLA DE SIMULACIÓN EN VIVO (MUESTRA DE CARTAS DE LA SELECCIÓN) */}
      <div className="bg-[#0E121B] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="px-6 py-4 bg-[#090C14] border-b border-white/10 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-white">
              {t("live_preview_title")}
            </h3>
            <p className="text-xs text-white/40 mt-0.5">
              {t("live_preview_subtitle")}
            </p>
          </div>
        </div>

        {loadingPreview ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-7 h-7 border-4 border-red border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !preview || preview.samples.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <IconCard className="w-8 h-8 text-white/20 mb-2" />
            <p className="text-xs text-white/50 font-bold">
              {t("no_samples_found")}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#090C14] border-b border-white/10 text-[10px] uppercase tracking-wider text-white/40 font-black">
                  <th className="px-5 py-3">{t("col_card_expansion")}</th>
                  <th className="px-5 py-3">{t("col_variant")}</th>
                  <th className="px-5 py-3 text-center">{t("col_stock")}</th>
                  <th className="px-5 py-3 text-right">{t("col_current_price")}</th>
                  <th className="px-5 py-3 text-right">
                    {priceBenchmarkSource === "LOCAL_MARKET"
                      ? t("col_market_base_local")
                      : t("col_market_base_usa")}
                  </th>
                  <th className="px-5 py-3 text-right">{t("col_price_date")}</th>
                  <th className="px-5 py-3 text-right">{t("col_simulated_price")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {preview.samples.map((sample) => {
                  const simulated = computeSimulatedPrice(sample);
                  const factor = applyDevaluations
                    ? sample.conditionMultiplier * sample.languageMultiplier
                    : 1;
                  return (
                    <tr key={sample.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {sample.imageUrl ? (
                            <img
                              src={sample.imageUrl}
                              alt={sample.name}
                              className="w-8 h-11 object-cover rounded border border-white/10 shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-11 rounded bg-white/5 border border-white/10 flex items-center justify-center text-white/30 shrink-0">
                              <IconCard className="w-4 h-4" />
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-white">{sample.name}</div>
                            <div className="text-[11px] text-white/40">{sample.expansion}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-white/80 mr-1.5">
                          {sample.condition}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-white/5 text-[10px] text-white/50 uppercase mr-1.5">
                          {sample.language}
                        </span>
                        <span className="text-[10px] text-amber-300/80">{sample.finish}</span>
                      </td>
                      <td className="px-5 py-3.5 text-center font-mono font-bold text-white/80">
                        {sample.stock}
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono text-white/50">
                        ${sample.currentPrice.toFixed(2)} USD
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono">
                        {priceBenchmarkSource === "LOCAL_MARKET" ? (
                          sample.localBasePrice && sample.localBasePrice > 0 ? (
                            <div>
                              <span className="font-bold text-emerald-400">
                                ${sample.localBasePrice.toLocaleString("es-CL")} CLP
                              </span>
                              <span className="block text-[9px] text-emerald-300/70 uppercase">
                                {t("badge_local_price")}
                              </span>
                            </div>
                          ) : (
                            <div>
                              <span className="font-bold text-white/50">
                                ${sample.marketBasePrice.toFixed(2)} USD
                              </span>
                              <span className="block text-[9px] text-amber-400/80 uppercase">
                                {t("badge_fallback_price")}
                              </span>
                            </div>
                          )
                        ) : (
                          <span className="text-white/70">
                            ${sample.marketBasePrice.toFixed(2)} USD
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono text-[11px] text-white/50">
                        {sample.priceDate || preview?.effectiveDate || "Hoy"}
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono">
                        <span className="font-black text-emerald-400 text-sm">
                          ${simulated.toFixed(2)} USD
                        </span>
                        {Math.abs(factor - 1) > 0.001 && (
                          <span className="block text-[10px] text-amber-300/80">
                            {t("factor_by_condition_lang", { percent: Math.round(factor * 100) })}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
