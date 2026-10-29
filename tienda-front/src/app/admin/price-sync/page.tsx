"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { API_URL } from "@/utils/api";
import { useToast } from "@/hooks/useToast";
import SearchableSelect from "@/components/ui/SearchableSelect";
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
  conditionMultiplier: number;
  languageMultiplier: number;
}

interface PreviewResponse {
  totalMatching: number;
  onlyZeroPriceCount: number;
  onlyInStockCount: number;
  devaluationRulesCount: number;
  samples: PreviewSample[];
}

export default function AdminPriceSyncPage() {
  const { showToast } = useToast();

  // Metadatos de Juegos y Expansiones
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [expansions, setExpansions] = useState<ExpansionOption[]>([]);
  const [loadingExpansions, setLoadingExpansions] = useState(false);

  // Parámetros de sincronización
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedExpansion, setSelectedExpansion] = useState<string>("ALL");
  const [targetScope, setTargetScope] = useState<TargetScope>("ONLY_IN_STOCK");
  const [applyDevaluations, setApplyDevaluations] = useState<boolean>(true);

  // Estado de vista previa y ejecución
  const [preview, setPreview] = useState<PreviewResponse | null>(null);
  const [loadingPreview, setLoadingPreview] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [lastSyncResult, setLastSyncResult] = useState<{
    updatedCount: number;
    timestamp: string;
  } | null>(null);

  // 1. Cargar categorías TCG al montar
  useEffect(() => {
    fetch(`${API_URL}/products/meta/categories/admin?isTcg=true`, {
      credentials: "include",
    })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (Array.isArray(data)) setCategories(data);
      })
      .catch(() => setCategories([]));
  }, []);

  // 2. Cargar expansiones cuando cambia el juego seleccionado
  useEffect(() => {
    if (!selectedCategory || selectedCategory === "ALL") {
      setExpansions([]);
      setSelectedExpansion("ALL");
      return;
    }

    setLoadingExpansions(true);
    fetch(
      `${API_URL}/products/meta/expansions?category=${encodeURIComponent(
        selectedCategory
      )}`,
      { credentials: "include" }
    )
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (Array.isArray(data)) setExpansions(data);
      })
      .catch(() => setExpansions([]))
      .finally(() => setLoadingExpansions(false));
  }, [selectedCategory]);

  // 3. Cargar vista previa cada vez que cambia Juego o Expansión
  const fetchPreview = useCallback(async () => {
    setLoadingPreview(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory && selectedCategory !== "ALL") {
        params.set("category", selectedCategory);
      }
      if (selectedExpansion && selectedExpansion !== "ALL") {
        params.set("expansion", selectedExpansion);
      }

      const res = await fetch(
        `${API_URL}/sync/dealer-prices/preview?${params.toString()}`,
        {
          credentials: "include",
          headers: { "x-auth-scope": "admin" },
        }
      );
      if (res.ok) {
        const data = await res.json();
        setPreview(data);
      }
    } catch (e) {
      console.error("Error cargando vista previa de sincronización:", e);
    } finally {
      setLoadingPreview(false);
    }
  }, [selectedCategory, selectedExpansion]);

  useEffect(() => {
    fetchPreview();
  }, [fetchPreview]);

  // Opciones para el SearchableSelect de expansiones
  const expansionOptions = useMemo(() => {
    const base = [
      {
        value: "ALL",
        label: "Todas las expansiones de este juego",
      },
    ];
    const mapped = expansions.map((exp) => ({
      value: exp.name,
      label: `${exp.name} (${exp.products} cartas)`,
    }));
    return [...base, ...mapped];
  }, [expansions]);

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
      const condMult = applyDevaluations ? sample.conditionMultiplier : 1.0;
      const langMult = applyDevaluations ? sample.languageMultiplier : 1.0;
      const raw = sample.marketBasePrice * condMult * langMult;
      return Number(Math.max(0.01, raw).toFixed(2));
    },
    [applyDevaluations]
  );

  // Ejecutar sincronización
  const handleSync = async () => {
    if (affectedCount === 0) {
      showToast("No hay cartas que coincidan con los filtros seleccionados.", "info");
      return;
    }

    setSyncing(true);
    try {
      const res = await fetch(`${API_URL}/sync/dealer-prices`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "x-auth-scope": "admin",
        },
        body: JSON.stringify({
          category: selectedCategory,
          expansion: selectedExpansion,
          targetScope,
          applyDevaluations,
          autoPublish: true,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast(
          `Sincronización completada: ${data.updatedCount} precios actualizados.`,
          "success"
        );
        setLastSyncResult({
          updatedCount: data.updatedCount,
          timestamp: new Date().toLocaleTimeString("es-CL"),
        });
        fetchPreview();
      } else {
        showToast(data.message || "Error al sincronizar precios", "error");
      }
    } catch (err) {
      showToast("Error de red al sincronizar precios", "error");
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
            <span>Automatización de Catálogo TCG</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Sincronización Inteligente de Precios
          </h1>
          <p className="text-white/50 text-xs mt-1">
            Actualiza tus precios en USD según el catálogo oficial filtrando por juego, expansión y tus reglas de estado e idioma.
          </p>
        </div>

        {lastSyncResult && (
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
            <IconCheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>
              Última sincronización ({lastSyncResult.timestamp}):{" "}
              <strong>{lastSyncResult.updatedCount}</strong> cartas actualizadas
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
                  Paso 1
                </span>
                <h2 className="text-base font-bold text-white">
                  Selecciona Juego y Expansión
                </h2>
              </div>
            </div>

            {/* Selector de Juego */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-2.5">
                Juego TCG a Sincronizar
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory("ALL");
                    setSelectedExpansion("ALL");
                  }}
                  className={`p-3.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                    selectedCategory === "ALL"
                      ? "bg-red/15 border-red text-white shadow-md shadow-red/10"
                      : "bg-[#080B12] border-white/10 text-white/60 hover:text-white hover:border-white/20"
                  }`}
                >
                  <div>
                    <div className="text-xs font-black">Todos los Juegos TCG</div>
                    <div className="text-[11px] text-white/40 mt-0.5">
                      Catálogo global completo
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
                        setSelectedExpansion("ALL");
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
                          Permite filtrar por edición
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

            {/* Selector de Expansión */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-2">
                Expansión / Edición Específica
              </label>
              {selectedCategory === "ALL" ? (
                <div className="p-3.5 rounded-xl bg-[#080B12] border border-white/10 text-xs text-white/40 flex items-center gap-2.5">
                  <IconBox className="w-4 h-4 text-white/30 shrink-0" />
                  <span>
                    Selecciona un juego específico arriba si deseas elegir una expansión puntual (ej. <em>Modern Horizons 3</em>, <em>Prismatic Evolutions</em>).
                  </span>
                </div>
              ) : (
                <SearchableSelect
                  options={expansionOptions}
                  value={selectedExpansion}
                  onChange={(val) => setSelectedExpansion(val || "ALL")}
                  placeholder={
                    loadingExpansions
                      ? "Cargando expansiones del juego..."
                      : "Busca o selecciona una expansión..."
                  }
                  disabled={loadingExpansions}
                />
              )}
            </div>
          </div>

          {/* PASO 2: ALCANCE DE PROTECCIÓN DE PRECIOS */}
          <div className="bg-[#0E121B] border border-white/10 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-3 pb-3 border-b border-white/5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0">
                <IconShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                  Paso 2 · Protección de Precios Manuales
                </span>
                <h2 className="text-base font-bold text-white">
                  ¿Qué cartas quieres actualizar dentro de esta selección?
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                {
                  id: "ONLY_IN_STOCK" as TargetScope,
                  title: "Solo con Stock (> 0)",
                  desc: "Actualiza únicamente las cartas que tienes disponibles en inventario físico.",
                  count: preview?.onlyInStockCount ?? 0,
                  badge: "Recomendado",
                },
                {
                  id: "ONLY_ZERO_PRICE" as TargetScope,
                  title: "Solo sin Precio ($0)",
                  desc: "Asigna precio de mercado solo a cartas en $0 sin tocar tus precios personalizados.",
                  count: preview?.onlyZeroPriceCount ?? 0,
                  badge: "Modo Seguro",
                },
                {
                  id: "ALL" as TargetScope,
                  title: "Todo el Catálogo",
                  desc: "Actualiza todas las variantes (con y sin stock) de la selección.",
                  count: preview?.totalMatching ?? 0,
                  badge: "Masivo",
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
                          {opt.count.toLocaleString("es-CL")} cartas
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
                    Paso 3 · Reglas de Estado e Idioma
                  </span>
                  <h2 className="text-base font-bold text-white mt-0.5">
                    Aplicar Reglas de Devaluación (Condición e Idioma)
                  </h2>
                  <p className="text-xs text-white/50 mt-1 leading-relaxed max-w-xl">
                    Calcula el precio final tomando en cuenta los porcentajes de descuento por{" "}
                    <strong className="text-white/80">Condición</strong> (LP, MP, HP, Damaged) e{" "}
                    <strong className="text-white/80">Idioma</strong> que ya tienes configurados en{" "}
                    <Link
                      href="/admin/devaluations"
                      className="text-amber-300 underline hover:text-amber-200"
                    >
                      Reglas de Estado
                    </Link>{" "}
                    ({preview?.devaluationRulesCount || 0} reglas activas).
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span
                  className={`text-xs font-black uppercase tracking-wider ${
                    applyDevaluations ? "text-emerald-400" : "text-white/40"
                  }`}
                >
                  {applyDevaluations ? "Sí, aplicar" : "No"}
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
                Resumen de Sincronización
              </h3>
            </div>

            <div className="bg-[#080B12] border border-white/10 rounded-xl p-4 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-white/40">Juego seleccionado:</span>
                <span className="font-bold text-white text-right truncate max-w-[160px]">
                  {selectedCategory === "ALL" ? "Todos los Juegos" : selectedCategory}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/40">Expansión:</span>
                <span className="font-bold text-emerald-400 text-right truncate max-w-[160px]">
                  {selectedExpansion === "ALL" ? "Todas las ediciones" : selectedExpansion}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/40">Alcance:</span>
                <span className="font-bold text-white">
                  {targetScope === "ONLY_IN_STOCK"
                    ? "Solo con Stock (> 0)"
                    : targetScope === "ONLY_ZERO_PRICE"
                    ? "Solo Precio $0"
                    : "Todo el Catálogo"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/40">Devaluación (Estado/Idioma):</span>
                <span
                  className={`font-bold ${
                    applyDevaluations ? "text-emerald-400" : "text-white/50"
                  }`}
                >
                  {applyDevaluations ? "Activada" : "Desactivada"}
                </span>
              </div>
              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                <span className="text-white/60 font-bold uppercase text-[10px] tracking-wider">
                  Cartas a actualizar:
                </span>
                <span className="text-2xl font-mono font-black text-white">
                  {loadingPreview ? "..." : affectedCount.toLocaleString("es-CL")}
                </span>
              </div>
            </div>

            {targetScope === "ALL" && selectedCategory === "ALL" && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-[11px] text-amber-200">
                <IconAlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  Estás en modo <strong>Catálogo Completo</strong>. Esto sobrescribirá los precios de todos tus juegos y expansiones.
                </span>
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
              Sincronizar {affectedCount.toLocaleString("es-CL")} Cartas Ahora
            </Button>
          </div>
        </div>
      </div>

      {/* TABLA DE SIMULACIÓN EN VIVO (MUESTRA DE CARTAS DE LA SELECCIÓN) */}
      <div className="bg-[#0E121B] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="px-6 py-4 bg-[#090C14] border-b border-white/10 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-white">
              Vista Previa de Simulación en Vivo
            </h3>
            <p className="text-xs text-white/40 mt-0.5">
              Muestra representativa de cómo quedarán los precios base (USD) en tu inventario al aplicar la sincronización.
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
              No se encontraron cartas con precio de mercado oficial para este filtro.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#090C14] border-b border-white/10 text-[10px] uppercase tracking-wider text-white/40 font-black">
                  <th className="px-5 py-3">Carta / Expansión</th>
                  <th className="px-5 py-3">Variante (Estado e Idioma)</th>
                  <th className="px-5 py-3 text-center">Stock</th>
                  <th className="px-5 py-3 text-right">Precio Actual (USD)</th>
                  <th className="px-5 py-3 text-right">Mercado Base (NM)</th>
                  <th className="px-5 py-3 text-right">Nuevo Precio Calculado</th>
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
                      <td className="px-5 py-3.5 text-right font-mono text-white/70">
                        ${sample.marketBasePrice.toFixed(2)} USD
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono">
                        <span className="font-black text-emerald-400 text-sm">
                          ${simulated.toFixed(2)} USD
                        </span>
                        {Math.abs(factor - 1) > 0.001 && (
                          <span className="block text-[10px] text-amber-300/80">
                            ({Math.round(factor * 100)}% por Estado/Idioma)
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
