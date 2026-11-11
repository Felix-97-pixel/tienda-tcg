"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import { API_URL } from "@/utils/api";
import { useToast } from "@/hooks/useToast";
import SearchableSelect from "@/components/ui/SearchableSelect";
import MultiSearchableSelect from "@/components/ui/MultiSearchableSelect";
import ProgressDisplay from "@/app/superadmin/_components/Sync/ProgressDisplay";
import PreLoader from "@/components/layout/PreLoader";
import { Button } from "@/components/ui/Button";
import {
  IconZap,
  IconBox,
  IconClock,
  IconSearch,
  IconRefresh,
  IconCheck,
  IconAlertCircle,
  IconFilter,
  IconX,
} from "@/components/ui/Icons";
import { SyncProgress, ExpansionMeta } from "@/types/tcg";

// Caché en memoria persistente entre cambios de página
const GLOBAL_PRICE_EXPANSIONS_CACHE: Record<string, ExpansionMeta[]> = {};
let globalPriceSettingsCache: Record<string, string> | null = null;

interface SupportedGame {
  id: string;
  name: string;
  defaultCategory: string;
  settingKey: string;
}

const SUPPORTED_GAMES: SupportedGame[] = [
  { id: "riftbound", name: "Riftbound TCG", defaultCategory: "Singles Riftbound", settingKey: "riftbound_sync_destination" },
  { id: "pokemon", name: "Pokémon TCG", defaultCategory: "Singles Pokemon", settingKey: "pokemon_sync_destination" },
  { id: "magic", name: "Magic: The Gathering", defaultCategory: "Singles Magic The Gathering", settingKey: "mtg_sync_destination" },
  { id: "onepiece", name: "One Piece TCG", defaultCategory: "Singles One Piece", settingKey: "onepiece_sync_destination" },
  { id: "lorcana", name: "Disney Lorcana", defaultCategory: "Singles Lorcana", settingKey: "lorcana_sync_destination" },
  { id: "gundam", name: "Gundam Card Game", defaultCategory: "Singles Gundam", settingKey: "gundam_sync_destination" },
];

interface ScheduleItem {
  id: string;
  name: string;
  externalId: string | null;
  gameId: string;
  gameName: string;
  gameKey: string;
  isAutoSyncEnabled: boolean;
  syncFrequency: string; // 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'MANUAL'
  lastPriceSyncAt: string | null;
  nextPriceSyncAt: string | null;
  lastSyncStatus: string | null;
  lastSyncError: string | null;
  assignedCardsCount: number;
}

type FrequencyFilter = "ALL" | "DAILY" | "WEEKLY" | "MONTHLY" | "MANUAL";

export default function SuperAdminSyncPricesPage() {
  const t = useTranslations("admin.sync");
  const tCommon = useTranslations("common");
  const { showToast } = useToast();

  // Modo de navegación por pestañas: Manual vs Scheduler
  const [activeTab, setActiveTab] = useState<"manual" | "scheduler">("scheduler");

  // --- ESTADO MODO MANUAL ---
  const [selectedGameId, setSelectedGameId] = useState<string>("riftbound");
  const [destinationCategory, setDestinationCategory] = useState<string>("Singles Riftbound");
  const [expansions, setExpansions] = useState<ExpansionMeta[]>([]);
  const [selectedExpansions, setSelectedExpansions] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingExpansions, setLoadingExpansions] = useState<boolean>(false);
  const [priceProgress, setPriceProgress] = useState<SyncProgress>({ current: 0, total: 0, active: false });
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const prevActiveRef = useRef<boolean>(false);

  // --- ESTADO MODO SCHEDULER ---
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [loadingSchedules, setLoadingSchedules] = useState<boolean>(true);
  const [selectedGameFilter, setSelectedGameFilter] = useState<string>("ALL");
  const [freqFilter, setFreqFilter] = useState<FrequencyFilter>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [runningCatchUp, setRunningCatchUp] = useState<boolean>(false);

  // Asignación Masiva con Checkboxes
  const [batchSelectedIds, setBatchSelectedIds] = useState<string[]>([]);
  const [batchTargetFreq, setBatchTargetFreq] = useState<string>("DAILY");
  const [applyingBatch, setApplyingBatch] = useState<boolean>(false);

  // 1. Cargar Configuración de Destino del Juego Manual
  useEffect(() => {
    const activeGame = SUPPORTED_GAMES.find((g) => g.id === selectedGameId);
    if (!activeGame) return;

    if (globalPriceSettingsCache) {
      setDestinationCategory(globalPriceSettingsCache[activeGame.settingKey] || activeGame.defaultCategory);
      return;
    }

    fetch(`${API_URL}/settings`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data && typeof data === "object") {
          globalPriceSettingsCache = data;
          setDestinationCategory(data[activeGame.settingKey] || activeGame.defaultCategory);
        } else {
          setDestinationCategory(activeGame.defaultCategory);
        }
      })
      .catch(() => setDestinationCategory(activeGame.defaultCategory));
  }, [selectedGameId]);

  // 2. Cargar Expansiones Locales para Modo Manual
  useEffect(() => {
    setSelectedExpansions([]);

    if (GLOBAL_PRICE_EXPANSIONS_CACHE[destinationCategory]) {
      setExpansions(GLOBAL_PRICE_EXPANSIONS_CACHE[destinationCategory]);
      return;
    }

    setLoadingExpansions(true);
    fetch(`${API_URL}/products/meta/expansions?category=${encodeURIComponent(destinationCategory)}`)
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        GLOBAL_PRICE_EXPANSIONS_CACHE[destinationCategory] = list;
        setExpansions(list);
      })
      .catch(() => setExpansions([]))
      .finally(() => setLoadingExpansions(false));
  }, [destinationCategory]);

  // 3. Polling de Progreso de Precios (Modo Manual)
  const startPolling = useCallback(() => {
    if (pollingRef.current) clearInterval(pollingRef.current);

    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/sync/status/${selectedGameId}`);
        const data: SyncProgress = await res.json();
        setPriceProgress(data);

        if (prevActiveRef.current && !data.active) {
          if (pollingRef.current) clearInterval(pollingRef.current);
          showToast(t("toast_sync_success", { count: data.current }), "success");
        }
        prevActiveRef.current = data.active;
      } catch (err) {
        console.error("Error en polling de precios:", err);
      }
    }, 1500);
  }, [selectedGameId, showToast, t]);

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  // 4. Ejecutar Sincronización Manual
  const handleUpdatePrices = async () => {
    if (selectedExpansions.length === 0) {
      showToast(t("select_at_least_one"), "error");
      return;
    }

    setLoading(true);
    try {
      for (const exp of selectedExpansions) {
        await fetch(`${API_URL}/price-updater/sync-${selectedGameId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ expansion: exp }),
        });
      }

      setPriceProgress({ current: 0, total: 0, active: true });
      prevActiveRef.current = true;
      startPolling();
    } catch {
      showToast(t("toast_network_error"), "error");
    } finally {
      setLoading(false);
    }
  };

  // --- CARGAR PROGRAMACIONES DEL SCHEDULER ---
  const fetchSchedules = useCallback(async () => {
    setLoadingSchedules(true);
    try {
      const res = await fetch(`${API_URL}/sync/schedules`, { credentials: "include" });
      if (res.ok) {
        const data: ScheduleItem[] = await res.json();
        setSchedules(data);
      }
    } catch (err) {
      console.error("Error cargando schedules:", err);
      showToast(t("scheduler.toast_network_error", { defaultMessage: "Error al cargar programaciones" }), "error");
    } finally {
      setLoadingSchedules(false);
    }
  }, [showToast, t]);

  useEffect(() => {
    if (activeTab === "scheduler") {
      fetchSchedules();
    }
  }, [activeTab, fetchSchedules]);

  // Actualizar Frecuencia Individual
  const handleUpdateSingleFrequency = async (id: string, name: string, freq: string) => {
    try {
      const res = await fetch(`${API_URL}/sync/schedules/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ frequency: freq }),
      });
      if (res.ok) {
        setSchedules((prev) =>
          prev.map((item) =>
            item.id === id
              ? {
                  ...item,
                  syncFrequency: freq,
                  isAutoSyncEnabled: freq !== "MANUAL",
                }
              : item
          )
        );
        showToast(t("scheduler.toast_update_success", { name, freq }), "success");
      }
    } catch {
      showToast(t("toast_network_error"), "error");
    }
  };

  // Aplicar Frecuencia Masiva con Checkboxes
  const handleApplyBatchFrequency = async () => {
    if (batchSelectedIds.length === 0) return;

    setApplyingBatch(true);
    try {
      const res = await fetch(`${API_URL}/sync/schedules/batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          expansionIds: batchSelectedIds,
          frequency: batchTargetFreq,
        }),
      });

      if (res.ok) {
        setSchedules((prev) =>
          prev.map((item) =>
            batchSelectedIds.includes(item.id)
              ? {
                  ...item,
                  syncFrequency: batchTargetFreq,
                  isAutoSyncEnabled: batchTargetFreq !== "MANUAL",
                }
              : item
          )
        );
        showToast(t("scheduler.toast_batch_success", { count: batchSelectedIds.length }), "success");
        setBatchSelectedIds([]);
      }
    } catch {
      showToast(t("toast_network_error"), "error");
    } finally {
      setApplyingBatch(false);
    }
  };

  // Disparar Chequeo de Pendientes (Catch-Up Manual)
  const handleRunPendingNow = async () => {
    setRunningCatchUp(true);
    try {
      const res = await fetch(`${API_URL}/sync/schedules/run-pending`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        showToast(
          t("scheduler.toast_run_pending_success", {
            processed: data.processed,
            errors: data.errors,
          }),
          "success"
        );
        fetchSchedules();
      }
    } catch {
      showToast(t("toast_network_error"), "error");
    } finally {
      setRunningCatchUp(false);
    }
  };

  // --- FILTRADO DE LA TABLA ---
  const filteredSchedules = useMemo(() => {
    return schedules.filter((item) => {
      // Filtro de Juego
      if (selectedGameFilter !== "ALL" && item.gameKey !== selectedGameFilter) {
        return false;
      }
      // Filtro de Frecuencia
      if (freqFilter !== "ALL") {
        if (freqFilter === "MANUAL" && item.syncFrequency !== "MANUAL" && item.isAutoSyncEnabled) return false;
        if (freqFilter !== "MANUAL" && item.syncFrequency !== freqFilter) return false;
      }
      // Búsqueda por Texto
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesCode = (item.externalId || "").toLowerCase().includes(q);
        const matchesGame = item.gameName.toLowerCase().includes(q);
        if (!matchesName && !matchesCode && !matchesGame) return false;
      }
      return true;
    });
  }, [schedules, selectedGameFilter, freqFilter, searchQuery]);

  // Contadores para las Píldoras de Frecuencia
  const counts = useMemo(() => {
    let daily = 0;
    let weekly = 0;
    let monthly = 0;
    let manual = 0;

    const baseList = selectedGameFilter === "ALL"
      ? schedules
      : schedules.filter((s) => s.gameKey === selectedGameFilter);

    for (const item of baseList) {
      if (item.syncFrequency === "DAILY" && item.isAutoSyncEnabled) daily++;
      else if (item.syncFrequency === "WEEKLY" && item.isAutoSyncEnabled) weekly++;
      else if (item.syncFrequency === "MONTHLY" && item.isAutoSyncEnabled) monthly++;
      else manual++;
    }

    return {
      all: baseList.length,
      daily,
      weekly,
      monthly,
      manual,
      estimatedCreditsPerDay: daily * 7 + Math.ceil(weekly * 7 / 7) + Math.ceil(monthly * 7 / 30),
    };
  }, [schedules, selectedGameFilter]);

  // Opciones para el Selector con Checkboxes (MultiSearchableSelect)
  const batchOptions = useMemo(() => {
    const list = selectedGameFilter === "ALL"
      ? schedules
      : schedules.filter((s) => s.gameKey === selectedGameFilter);

    return list.map((s) => ({
      value: s.id,
      label: `${s.name}${s.externalId ? ` (${s.externalId})` : ""}`,
      count: s.assignedCardsCount,
    }));
  }, [schedules, selectedGameFilter]);

  // Opciones para el selector manual
  const gameOptions = useMemo(
    () => SUPPORTED_GAMES.map((g) => ({ value: g.id, label: g.name })),
    []
  );

  const expansionOptions = useMemo(
    () => expansions.map((e) => ({ value: e.name, label: `${e.name} (${e.products || 0} cartas)` })),
    [expansions]
  );

  return (
    <div className="p-6 space-y-6 pb-24 max-w-6xl mx-auto">
      {loading && <PreLoader message={tCommon("loading")} />}

      {/* Header con Pestañas */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--tt-border-medium)] pb-5">
        <div>
          <h1 className="text-2xl font-black text-[var(--tt-text-main)] flex items-center gap-2.5">
            <IconZap className="w-6 h-6 text-red-500" />
            {t("scheduler.title")}
          </h1>
          <p className="text-sm text-[var(--tt-text-muted)] mt-1">
            {t("scheduler.subtitle")}
          </p>
        </div>

        {/* Selector de Pestañas */}
        <div className="flex items-center gap-1.5 p-1 bg-[var(--tt-bg-subtle)] rounded-xl border border-[var(--tt-border-medium)] shrink-0">
          <button
            onClick={() => setActiveTab("scheduler")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "scheduler"
                ? "bg-[var(--tt-bg-surface)] text-[var(--tt-text-main)] shadow-sm"
                : "text-[var(--tt-text-muted)] hover:text-[var(--tt-text-main)]"
            }`}
          >
            <IconClock className="w-4 h-4 text-red-500" />
            {t("scheduler.tab_scheduler")}
          </button>
          <button
            onClick={() => setActiveTab("manual")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "manual"
                ? "bg-[var(--tt-bg-surface)] text-[var(--tt-text-main)] shadow-sm"
                : "text-[var(--tt-text-muted)] hover:text-[var(--tt-text-main)]"
            }`}
          >
            <IconZap className="w-4 h-4 text-amber-500" />
            {t("scheduler.tab_manual")}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PESTAÑA 1: SCHEDULER AUTOMATIZADO                                          */}
      {/* ========================================================================= */}
      {activeTab === "scheduler" && (
        <div className="space-y-6">
          {/* Tarjetas de Métricas de Automatización */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-[var(--tt-border-medium)] bg-[var(--tt-bg-surface)]">
              <span className="text-[11px] font-bold text-[var(--tt-text-muted)] uppercase tracking-wider block">
                {t("scheduler.daily_editions")}
              </span>
              <div className="flex items-baseline justify-between mt-1.5">
                <span className="text-2xl font-black text-emerald-500">{counts.daily}</span>
                <span className="text-[11px] text-[var(--tt-text-muted)]">Cada 24h</span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-[var(--tt-border-medium)] bg-[var(--tt-bg-surface)]">
              <span className="text-[11px] font-bold text-[var(--tt-text-muted)] uppercase tracking-wider block">
                {t("scheduler.weekly_editions")}
              </span>
              <div className="flex items-baseline justify-between mt-1.5">
                <span className="text-2xl font-black text-blue-500">{counts.weekly}</span>
                <span className="text-[11px] text-[var(--tt-text-muted)]">Cada 7 días</span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-[var(--tt-border-medium)] bg-[var(--tt-bg-surface)]">
              <span className="text-[11px] font-bold text-[var(--tt-text-muted)] uppercase tracking-wider block">
                {t("scheduler.monthly_editions")}
              </span>
              <div className="flex items-baseline justify-between mt-1.5">
                <span className="text-2xl font-black text-amber-500">{counts.monthly}</span>
                <span className="text-[11px] text-[var(--tt-text-muted)]">Cada 30 días</span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-[var(--tt-border-medium)] bg-[var(--tt-bg-surface)]">
              <span className="text-[11px] font-bold text-[var(--tt-text-muted)] uppercase tracking-wider block">
                {t("scheduler.estimated_credits")}
              </span>
              <div className="flex items-baseline justify-between mt-1.5">
                <span className="text-2xl font-black text-purple-400">
                  {t("scheduler.credits_per_day", { count: counts.estimatedCreditsPerDay })}
                </span>
                <span className="text-[11px] text-emerald-400 font-mono">Ahorro 98%</span>
              </div>
            </div>
          </div>

          {/* Caja de Asignación Masiva con Checkboxes (MultiSearchableSelect) */}
          <div className="p-5 rounded-2xl border border-[var(--tt-border-medium)] bg-[var(--tt-bg-surface)] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-[var(--tt-text-main)] flex items-center gap-2">
                <IconCheck className="w-4 h-4 text-red-500" />
                {t("scheduler.batch_title")}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRunPendingNow}
                isLoading={runningCatchUp}
                leftIcon={<IconRefresh className="w-3.5 h-3.5 text-emerald-500" />}
                className="text-xs font-bold"
              >
                {runningCatchUp ? t("scheduler.running_pending") : t("scheduler.run_pending_now")}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
              <div className="md:col-span-7">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--tt-text-muted)] mb-1.5">
                  Seleccionar ediciones por nombre o código (Checkboxes)
                </label>
                <MultiSearchableSelect
                  options={batchOptions}
                  selectedValues={batchSelectedIds}
                  onChange={setBatchSelectedIds}
                  placeholder="Escribe para buscar y marcar varias ediciones..."
                  allLabel="Marcar todas las ediciones del filtro"
                  disabled={loadingSchedules || applyingBatch}
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-white/60 mb-1.5">
                  Frecuencia a Asignar
                </label>
                <select
                  value={batchTargetFreq}
                  onChange={(e) => setBatchTargetFreq(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-[#080B12] text-white text-xs font-bold outline-none focus:border-red-500 transition-colors"
                  disabled={applyingBatch}
                >
                  <option value="DAILY" className="bg-[#0B0E17] text-white py-1">{t("scheduler.freq_daily")}</option>
                  <option value="WEEKLY" className="bg-[#0B0E17] text-white py-1">{t("scheduler.freq_weekly")}</option>
                  <option value="MONTHLY" className="bg-[#0B0E17] text-white py-1">{t("scheduler.freq_monthly")}</option>
                  <option value="MANUAL" className="bg-[#0B0E17] text-white py-1">{t("scheduler.freq_manual")}</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <Button
                  variant="primary"
                  size="md"
                  fullWidth
                  onClick={handleApplyBatchFrequency}
                  disabled={batchSelectedIds.length === 0 || applyingBatch}
                  isLoading={applyingBatch}
                  className="py-2.5 text-xs font-black"
                >
                  {t("scheduler.batch_apply")}
                </Button>
              </div>
            </div>
          </div>

          {/* Barra de Filtros y Búsqueda Reactiva */}
          <div className="space-y-3">
            {/* Selector de Juego */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setSelectedGameFilter("ALL")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  selectedGameFilter === "ALL"
                    ? "bg-red-500 text-white border-red-500 shadow-md shadow-red-500/20"
                    : "bg-[var(--tt-bg-surface)] text-[var(--tt-text-muted)] border-[var(--tt-border-medium)] hover:text-[var(--tt-text-main)]"
                }`}
              >
                Todos los Juegos ({schedules.length})
              </button>
              {SUPPORTED_GAMES.map((g) => {
                const count = schedules.filter((s) => s.gameKey === g.id).length;
                return (
                  <button
                    key={g.id}
                    onClick={() => setSelectedGameFilter(g.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      selectedGameFilter === g.id
                        ? "bg-red-500 text-white border-red-500 shadow-md shadow-red-500/20"
                        : "bg-[var(--tt-bg-surface)] text-[var(--tt-text-muted)] border-[var(--tt-border-medium)] hover:text-[var(--tt-text-main)]"
                    }`}
                  >
                    {g.name} ({count})
                  </button>
                );
              })}
            </div>

            {/* Fila de Filtro de Frecuencia y Barra de Búsqueda */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Pills de Frecuencia */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => setFreqFilter("ALL")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                    freqFilter === "ALL"
                      ? "bg-[var(--tt-bg-surface)] text-[var(--tt-text-main)] border border-[var(--tt-border-medium)] shadow-sm"
                      : "text-[var(--tt-text-muted)] hover:text-[var(--tt-text-main)]"
                  }`}
                >
                  {t("scheduler.filter_all")} ({counts.all})
                </button>
                <button
                  onClick={() => setFreqFilter("DAILY")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                    freqFilter === "DAILY"
                      ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 font-black"
                      : "text-[var(--tt-text-muted)] hover:text-emerald-500"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  {t("scheduler.filter_daily")} ({counts.daily})
                </button>
                <button
                  onClick={() => setFreqFilter("WEEKLY")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                    freqFilter === "WEEKLY"
                      ? "bg-blue-500/15 text-blue-500 border border-blue-500/30 font-black"
                      : "text-[var(--tt-text-muted)] hover:text-blue-500"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  {t("scheduler.filter_weekly")} ({counts.weekly})
                </button>
                <button
                  onClick={() => setFreqFilter("MONTHLY")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                    freqFilter === "MONTHLY"
                      ? "bg-amber-500/15 text-amber-500 border border-amber-500/30 font-black"
                      : "text-[var(--tt-text-muted)] hover:text-amber-500"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  {t("scheduler.filter_monthly")} ({counts.monthly})
                </button>
                <button
                  onClick={() => setFreqFilter("MANUAL")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                    freqFilter === "MANUAL"
                      ? "bg-[var(--tt-bg-surface)] text-[var(--tt-text-main)] border border-[var(--tt-border-medium)]"
                      : "text-[var(--tt-text-muted)] hover:text-[var(--tt-text-main)]"
                  }`}
                >
                  {t("scheduler.filter_manual")} ({counts.manual})
                </button>
              </div>

              {/* Input de Búsqueda de Texto en Tiempo Real */}
              <div className="relative w-full md:w-80">
                <IconSearch className="w-4 h-4 text-[var(--tt-text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("scheduler.search_placeholder")}
                  className="w-full pl-9 pr-8 py-2 rounded-xl border border-[var(--tt-border-medium)] bg-[var(--tt-bg-surface)] text-[var(--tt-text-main)] text-xs placeholder:text-[var(--tt-text-muted)] outline-none focus:border-red-500 transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--tt-text-muted)] hover:text-[var(--tt-text-main)]"
                  >
                    <IconX className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Tabla de Ediciones con Control Individual */}
          <div className="rounded-2xl border border-[var(--tt-border-medium)] bg-[var(--tt-bg-surface)] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--tt-border-medium)] bg-[var(--tt-bg-subtle)]/50 text-[var(--tt-text-muted)] uppercase tracking-wider font-bold text-[10px]">
                    <th className="py-3 px-4">{t("scheduler.col_expansion")}</th>
                    <th className="py-3 px-4">{t("scheduler.col_game")}</th>
                    <th className="py-3 px-4">{t("scheduler.col_frequency")}</th>
                    <th className="py-3 px-4">{t("scheduler.col_last_sync")}</th>
                    <th className="py-3 px-4">{t("scheduler.col_status")}</th>
                    <th className="py-3 px-4 text-right">{t("scheduler.col_actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--tt-border-medium)]">
                  {loadingSchedules ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-[var(--tt-text-muted)]">
                        {tCommon("loading")}...
                      </td>
                    </tr>
                  ) : filteredSchedules.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-[var(--tt-text-muted)]">
                        No se encontraron ediciones con los filtros seleccionados.
                      </td>
                    </tr>
                  ) : (
                    filteredSchedules.map((item) => {
                      const isDaily = item.syncFrequency === "DAILY";
                      const isWeekly = item.syncFrequency === "WEEKLY";
                      const isMonthly = item.syncFrequency === "MONTHLY";

                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-[var(--tt-bg-subtle)]/50 transition-colors"
                        >
                          {/* Expansión */}
                          <td className="py-3 px-4">
                            <div className="font-bold text-[var(--tt-text-main)] text-xs">
                              {item.name}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[var(--tt-text-muted)] font-mono">
                              {item.externalId && (
                                <span className="px-1.5 py-0.5 rounded bg-[var(--tt-bg-subtle)] border border-[var(--tt-border-medium)] text-[10px]">
                                  {item.externalId}
                                </span>
                              )}
                              <span>{item.assignedCardsCount} cartas registradas</span>
                            </div>
                          </td>

                          {/* Juego */}
                          <td className="py-3 px-4">
                            <span className="text-xs text-[var(--tt-text-main)]">
                              {item.gameName}
                            </span>
                          </td>

                          {/* Frecuencia Select */}
                          <td className="py-3 px-4">
                            <select
                              value={item.syncFrequency}
                              onChange={(e) =>
                                handleUpdateSingleFrequency(item.id, item.name, e.target.value)
                              }
                              className={`px-3 py-1.5 rounded-xl border text-xs font-bold outline-none cursor-pointer transition-colors ${
                                isDaily
                                  ? "bg-emerald-950/50 border-emerald-500/40 text-emerald-400"
                                  : isWeekly
                                  ? "bg-blue-950/50 border-blue-500/40 text-blue-400"
                                  : isMonthly
                                  ? "bg-amber-950/50 border-amber-500/40 text-amber-400"
                                  : "bg-[#080B12] border-white/15 text-white/70 hover:border-white/30"
                              }`}
                            >
                              <option value="DAILY" className="bg-[#0B0E17] text-white py-1">{t("scheduler.freq_daily")}</option>
                              <option value="WEEKLY" className="bg-[#0B0E17] text-white py-1">{t("scheduler.freq_weekly")}</option>
                              <option value="MONTHLY" className="bg-[#0B0E17] text-white py-1">{t("scheduler.freq_monthly")}</option>
                              <option value="MANUAL" className="bg-[#0B0E17] text-white py-1">{t("scheduler.freq_manual")}</option>
                            </select>
                          </td>

                          {/* Última Sincronización */}
                          <td className="py-3 px-4 text-xs">
                            {item.lastPriceSyncAt ? (
                              <div>
                                <div className="text-[var(--tt-text-main)] font-medium">
                                  {new Date(item.lastPriceSyncAt).toLocaleDateString()}
                                </div>
                                <div className="text-[10px] text-[var(--tt-text-muted)]">
                                  {new Date(item.lastPriceSyncAt).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </div>
                              </div>
                            ) : (
                              <span className="text-[var(--tt-text-muted)] italic text-[11px]">
                                {t("scheduler.status_pending")}
                              </span>
                            )}
                          </td>

                          {/* Estado */}
                          <td className="py-3 px-4">
                            {item.lastSyncStatus === "IN_PROGRESS" ? (
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                {t("scheduler.status_in_progress")}
                              </span>
                            ) : item.lastSyncStatus === "SUCCESS" ? (
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                {t("scheduler.status_success")}
                              </span>
                            ) : item.lastSyncStatus === "ERROR" ? (
                              <span
                                title={item.lastSyncError || "Error"}
                                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/15 text-red-500 border border-red-500/30 cursor-help"
                              >
                                <IconAlertCircle className="w-3 h-3" />
                                {t("scheduler.status_error")}
                              </span>
                            ) : (
                              <span className="text-[var(--tt-text-muted)] text-[11px]">-</span>
                            )}
                          </td>

                          {/* Acciones */}
                          <td className="py-3 px-4 text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedGameId(item.gameKey);
                                setSelectedExpansions([item.name]);
                                setActiveTab("manual");
                              }}
                              className="text-[11px] py-1 px-2.5 font-bold"
                            >
                              {t("scheduler.sync_now")}
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PESTAÑA 2: MODO MANUAL INMEDIATO (EL SELECTOR ORIGINAL)                   */}
      {/* ========================================================================= */}
      {activeTab === "manual" && (
        <div className="bg-[var(--tt-bg-surface)] rounded-2xl p-6 border border-[var(--tt-border-medium)] shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Selector de Juego */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--tt-text-muted)] mb-2">
                Juego TCG
              </label>
              <SearchableSelect
                options={gameOptions}
                value={selectedGameId}
                onChange={(val) => val && setSelectedGameId(val)}
                placeholder="Seleccionar juego..."
                disabled={priceProgress.active}
              />
            </div>

            {/* Categoría Asociada */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--tt-text-muted)] mb-2">
                Categoría Asociada
              </label>
              <div className="flex items-center justify-between p-2.5 rounded-xl border border-[var(--tt-border-medium)] bg-[var(--tt-bg-subtle)] text-sm font-bold text-[var(--tt-text-main)]">
                <span>{destinationCategory}</span>
                <span className="text-[11px] font-mono text-emerald-500">
                  {expansions.length} ediciones en BD
                </span>
              </div>
            </div>
          </div>

          {/* Selector Multi-Edición con Checkboxes */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--tt-text-muted)]">
                Ediciones Locales a Actualizar
              </label>
              {expansions.length > 0 && (
                <span className="text-[11px] text-[var(--tt-text-muted)]">
                  {selectedExpansions.length === 0
                    ? "Sin selección (elige al menos una)"
                    : `${selectedExpansions.length} de ${expansions.length} seleccionadas`}
                </span>
              )}
            </div>

            {expansions.length === 0 && !loadingExpansions ? (
              <div className="p-3.5 rounded-xl bg-[var(--tt-bg-subtle)] border border-[var(--tt-border-medium)] text-xs text-[var(--tt-text-muted)] flex items-center gap-2.5">
                <IconBox className="w-4 h-4 text-[var(--tt-text-muted)] shrink-0" />
                <span>No hay ediciones registradas para este juego en la base de datos.</span>
              </div>
            ) : (
              <MultiSearchableSelect
                options={expansionOptions}
                selectedValues={selectedExpansions}
                onChange={setSelectedExpansions}
                placeholder={loadingExpansions ? "Cargando ediciones locales..." : "Seleccionar ediciones a actualizar..."}
                allLabel="Todas las ediciones"
                disabled={loadingExpansions || priceProgress.active}
              />
            )}
          </div>

          {/* Botón de Acción */}
          <div className="pt-2">
            <Button
              variant="danger"
              size="lg"
              fullWidth
              onClick={handleUpdatePrices}
              disabled={priceProgress.active || selectedExpansions.length === 0}
              isLoading={priceProgress.active}
              leftIcon={<IconZap className="w-4 h-4" />}
              className="py-3.5 text-sm font-black shadow-lg shadow-red-500/20"
            >
              {priceProgress.active
                ? t("inProgress")
                : selectedExpansions.length === 0
                ? "Selecciona al menos una edición"
                : selectedExpansions.length === expansions.length
                ? `Actualizar Todas las Ediciones (${expansions.length})`
                : `Actualizar Precios de ${selectedExpansions.length} ${selectedExpansions.length === 1 ? "Edición" : "Ediciones"}`}
            </Button>
          </div>

          {/* Visualización de Progreso */}
          <ProgressDisplay progress={priceProgress} label={t("updating_prices")} />
        </div>
      )}
    </div>
  );
}
