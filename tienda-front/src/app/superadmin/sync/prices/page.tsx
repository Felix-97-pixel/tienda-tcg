"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import { API_URL } from "@/utils/api";
import { useToast } from "@/hooks/useToast";
import MultiSearchableSelect from "@/components/ui/MultiSearchableSelect";
import ProgressDisplay from "@/app/superadmin/_components/Sync/ProgressDisplay";
import { Button } from "@/components/ui/Button";
import {
  IconZap,
  IconClock,
  IconSearch,
  IconRefresh,
  IconCheck,
  IconAlertCircle,
  IconFilter,
  IconX,
  IconChevronLeft,
  IconChevronRight,
} from "@/components/ui/Icons";
import { SyncProgress } from "@/types/tcg";

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
  const { showToast } = useToast();

  // --- ESTADO MODO SCHEDULER ---
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [loadingSchedules, setLoadingSchedules] = useState<boolean>(true);
  const [selectedGameFilter, setSelectedGameFilter] = useState<string>("ALL");
  const [freqFilter, setFreqFilter] = useState<FrequencyFilter>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [runningCatchUp, setRunningCatchUp] = useState<boolean>(false);

  // Paginación
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);

  // Asignación Masiva con Checkboxes
  const [batchSelectedIds, setBatchSelectedIds] = useState<string[]>([]);
  const [batchTargetFreq, setBatchTargetFreq] = useState<string>("DAILY");
  const [applyingBatch, setApplyingBatch] = useState<boolean>(false);

  // Polling de progreso en vivo para el Scheduler
  const [schedulerProgress, setSchedulerProgress] = useState<SyncProgress>({ current: 0, total: 0, active: false });
  const [activeSyncingGame, setActiveSyncingGame] = useState<string | null>(null);
  const schedulerPollingRef = useRef<NodeJS.Timeout | null>(null);
  const schedulerPrevActiveRef = useRef<boolean>(false);

  // Floating Hover Tooltip (Nombre completo y Código)
  const [hoverTooltip, setHoverTooltip] = useState<{
    text: string;
    subtext?: string;
    x: number;
    y: number;
    placeBelow?: boolean;
  } | null>(null);

  const handleMouseEnterTooltip = (
    e: React.MouseEvent<HTMLElement>,
    text: string,
    subtext?: string
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const placeBelow = rect.top < 70;
    setHoverTooltip({
      text,
      subtext,
      x: Math.max(12, Math.min(window.innerWidth - 340, rect.left)),
      y: placeBelow ? rect.bottom + 8 : rect.top - 8,
      placeBelow,
    });
  };

  const handleMouseLeaveTooltip = () => {
    setHoverTooltip(null);
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
    fetchSchedules();
  }, [fetchSchedules]);

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

  // Iniciar polling del Scheduler para un juego
  const startSchedulerPolling = useCallback((gameKey: string) => {
    setActiveSyncingGame(gameKey);
    if (schedulerPollingRef.current) clearInterval(schedulerPollingRef.current);

    schedulerPollingRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/sync/status/${gameKey}`);
        if (res.ok) {
          const data: SyncProgress = await res.json();
          setSchedulerProgress(data);

          if (schedulerPrevActiveRef.current && !data.active) {
            if (schedulerPollingRef.current) clearInterval(schedulerPollingRef.current);
            showToast(t("toast_sync_success", { count: data.current }), "success");
            fetchSchedules(); // Auto-recargar tabla sin F5
            setActiveSyncingGame(null);
          }
          schedulerPrevActiveRef.current = data.active;
        }
      } catch (err) {
        console.error("Error en polling de scheduler:", err);
      }
    }, 1500);
  }, [fetchSchedules, showToast, t]);

  // Si al cargar o refrescar schedules hay alguna edición IN_PROGRESS, iniciar polling automático
  useEffect(() => {
    const inProgressItem = schedules.find((s) => s.lastSyncStatus === "IN_PROGRESS");
    if (inProgressItem && !schedulerProgress.active) {
      startSchedulerPolling(inProgressItem.gameKey);
    }
  }, [schedules, schedulerProgress.active, startSchedulerPolling]);

  useEffect(() => {
    return () => {
      if (schedulerPollingRef.current) clearInterval(schedulerPollingRef.current);
    };
  }, []);

  // Sincronización Inmediata Directa desde la Tabla del Scheduler
  const handleDirectSyncFromTable = async (gameKey: string, expansionName: string) => {
    try {
      showToast(`Iniciando actualización de precios para '${expansionName}'...`, "info");
      
      // Actualizar estado visual inmediato
      setSchedules((prev) =>
        prev.map((s) =>
          s.name === expansionName ? { ...s, lastSyncStatus: "IN_PROGRESS" } : s
        )
      );

      const res = await fetch(`${API_URL}/price-updater/sync-${gameKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ expansion: expansionName }),
      });

      if (res.ok) {
        setSchedulerProgress({ current: 0, total: 0, active: true });
        schedulerPrevActiveRef.current = true;
        startSchedulerPolling(gameKey);
      }
    } catch {
      showToast(t("toast_network_error"), "error");
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
        // Iniciar polling si se procesaron ediciones
        if (data.processed > 0 && selectedGameFilter !== "ALL") {
          startSchedulerPolling(selectedGameFilter);
        } else if (data.processed > 0) {
          startSchedulerPolling("riftbound");
        }
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

  // Resetear página a 1 cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedGameFilter, freqFilter, searchQuery, pageSize]);

  // Cálculos de Paginación
  const totalPages = Math.max(1, Math.ceil(filteredSchedules.length / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);

  const paginatedSchedules = useMemo(() => {
    const startIndex = (validCurrentPage - 1) * pageSize;
    return filteredSchedules.slice(startIndex, startIndex + pageSize);
  }, [filteredSchedules, validCurrentPage, pageSize]);

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

    return list.map((s) => {
      const shortCode = s.externalId
        ? s.externalId.length > 8
          ? `${s.externalId.slice(0, 6)}…`
          : s.externalId
        : "";
      return {
        value: s.id,
        label: `${s.name}${shortCode ? ` (${shortCode})` : ""}`,
        count: s.assignedCardsCount,
      };
    });
  }, [schedules, selectedGameFilter]);

  return (
    <div className="p-6 space-y-6 pb-24 max-w-6xl mx-auto">
      {/* Header Limpio del Scheduler */}
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

        {/* Botón Catch-Up Rápido en Header */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleRunPendingNow}
          isLoading={runningCatchUp}
          leftIcon={<IconRefresh className="w-4 h-4 text-emerald-500" />}
          className="text-xs font-bold shrink-0 self-start md:self-auto"
        >
          {runningCatchUp ? t("scheduler.running_pending") : t("scheduler.run_pending_now")}
        </Button>
      </div>

      {/* Barra de Progreso en Vivo del Scheduler */}
      {schedulerProgress.active && (
        <div className="p-4 rounded-2xl bg-[#0E121B] border border-red-500/30 shadow-xl shadow-red-500/5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-black uppercase tracking-wider text-red-500 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              Sincronización en Tiempo Real
            </span>
            <span className="text-xs font-mono font-bold text-white">
              {schedulerProgress.current} / {schedulerProgress.total} cartas ({schedulerProgress.total > 0 ? Math.round((schedulerProgress.current / schedulerProgress.total) * 100) : 0}%)
            </span>
          </div>
          <ProgressDisplay
            progress={schedulerProgress}
            label={
              activeSyncingGame
                ? `Actualizando precios de ${activeSyncingGame.toUpperCase()}...`
                : t("updating_prices")
            }
          />
        </div>
      )}

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
          <span className="text-[11px] text-[var(--tt-text-muted)]">
            Asigna frecuencia a múltiples colecciones simultáneamente
          </span>
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
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--tt-text-muted)] mb-1.5">
              Frecuencia a Asignar
            </label>
            <select
              value={batchTargetFreq}
              onChange={(e) => setBatchTargetFreq(e.target.value)}
              style={{
                backgroundColor: batchTargetFreq === "DAILY"
                  ? "rgba(6, 78, 59, 0.45)"
                  : batchTargetFreq === "WEEKLY"
                  ? "rgba(30, 58, 138, 0.45)"
                  : batchTargetFreq === "MONTHLY"
                  ? "rgba(120, 53, 15, 0.45)"
                  : "#080B12",
                color: batchTargetFreq === "DAILY"
                  ? "#34d399"
                  : batchTargetFreq === "WEEKLY"
                  ? "#60a5fa"
                  : batchTargetFreq === "MONTHLY"
                  ? "#fbbf24"
                  : "#FFFFFF",
              }}
              className="w-full px-3 py-2.5 rounded-xl border border-white/10 text-xs font-bold outline-none focus:border-red-500 transition-colors cursor-pointer"
              disabled={applyingBatch}
            >
              <option value="DAILY" style={{ backgroundColor: "#0B0E17", color: "#34d399" }} className="py-1">{t("scheduler.freq_daily")}</option>
              <option value="WEEKLY" style={{ backgroundColor: "#0B0E17", color: "#60a5fa" }} className="py-1">{t("scheduler.freq_weekly")}</option>
              <option value="MONTHLY" style={{ backgroundColor: "#0B0E17", color: "#fbbf24" }} className="py-1">{t("scheduler.freq_monthly")}</option>
              <option value="MANUAL" style={{ backgroundColor: "#0B0E17", color: "#FFFFFF" }} className="py-1">{t("scheduler.freq_manual")}</option>
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
              leftIcon={<IconCheck className="w-4 h-4" />}
              className="py-2.5 text-xs font-bold"
            >
              {applyingBatch
                ? t("inProgress")
                : batchSelectedIds.length === 0
                ? t("scheduler.batch_apply")
                : t("scheduler.apply_batch", { count: batchSelectedIds.length })}
            </Button>
          </div>
        </div>

        {batchSelectedIds.length > 0 && (
          <div className="flex items-center justify-between text-xs pt-1 px-1 border-t border-white/5">
            <span className="text-[var(--tt-text-muted)] font-mono">
              {batchSelectedIds.length} ediciones seleccionadas
            </span>
            <button
              onClick={() => setBatchSelectedIds([])}
              className="text-red-400 hover:text-red-300 font-bold transition-colors"
            >
              Limpiar selección
            </button>
          </div>
        )}
      </div>

      {/* Filtros de la Tabla */}
      <div className="space-y-3">
        {/* Selector de Juego TCG */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: "ALL", name: "Todos los Juegos", count: schedules.length },
            { id: "riftbound", name: "Riftbound TCG", count: schedules.filter((s) => s.gameKey === "riftbound").length },
            { id: "magic", name: "Magic: The Gathering", count: schedules.filter((s) => s.gameKey === "magic").length },
            { id: "pokemon", name: "Pokémon TCG", count: schedules.filter((s) => s.gameKey === "pokemon").length },
            { id: "onepiece", name: "One Piece TCG", count: schedules.filter((s) => s.gameKey === "onepiece").length },
            { id: "lorcana", name: "Disney Lorcana", count: schedules.filter((s) => s.gameKey === "lorcana").length },
            { id: "gundam", name: "Gundam Card Game", count: schedules.filter((s) => s.gameKey === "gundam").length },
          ].map((g) => {
            const active = selectedGameFilter === g.id;
            return (
              <button
                key={g.id}
                onClick={() => {
                  setSelectedGameFilter(g.id);
                  setBatchSelectedIds([]);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                  active
                    ? "bg-red-500/15 border-red-500 text-red-500 shadow-sm shadow-red-500/10"
                    : "bg-[var(--tt-bg-surface)] border-[var(--tt-border-medium)] text-[var(--tt-text-muted)] hover:text-[var(--tt-text-main)] hover:border-white/20"
                }`}
              >
                <span>{g.name}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  active ? "bg-red-500 text-white" : "bg-white/10 text-[var(--tt-text-muted)]"
                }`}>
                  {g.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Buscador y Píldoras de Frecuencia */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Buscador */}
          <div className="relative flex-1 max-w-md">
            <IconSearch className="w-4 h-4 text-[var(--tt-text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre o código de edición..."
              className="w-full pl-9 pr-9 py-2 rounded-xl border border-[var(--tt-border-medium)] bg-[var(--tt-bg-surface)] text-xs text-[var(--tt-text-main)] placeholder-[var(--tt-text-muted)] focus:border-red-500 focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--tt-text-muted)] hover:text-[var(--tt-text-main)]"
              >
                <IconX className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filtros de Frecuencia */}
          <div className="flex items-center gap-1.5 p-1 bg-[var(--tt-bg-subtle)] rounded-xl border border-[var(--tt-border-medium)] shrink-0 overflow-x-auto">
            <span className="text-[10px] font-bold text-[var(--tt-text-muted)] uppercase px-2 flex items-center gap-1">
              <IconFilter className="w-3 h-3" />
              Filtro:
            </span>
            {(["ALL", "DAILY", "WEEKLY", "MONTHLY", "MANUAL"] as FrequencyFilter[]).map((f) => {
              const active = freqFilter === f;
              const count = f === "ALL" ? counts.all : f === "DAILY" ? counts.daily : f === "WEEKLY" ? counts.weekly : f === "MONTHLY" ? counts.monthly : counts.manual;
              const label = f === "ALL" ? "Todas" : f === "DAILY" ? "Diarias" : f === "WEEKLY" ? "Semanales" : f === "MONTHLY" ? "Mensuales" : "Manuales";
              return (
                <button
                  key={f}
                  onClick={() => setFreqFilter(f)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    active
                      ? "bg-[var(--tt-bg-surface)] text-[var(--tt-text-main)] shadow-sm"
                      : "text-[var(--tt-text-muted)] hover:text-[var(--tt-text-main)]"
                  }`}
                >
                  <span>{label}</span>
                  <span className="text-[10px] font-mono opacity-60">({count})</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tabla del Scheduler con Paginación Optimizada */}
      <div className="bg-[var(--tt-bg-surface)] rounded-2xl border border-[var(--tt-border-medium)] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[var(--tt-border-medium)] bg-[var(--tt-bg-subtle)] text-[10px] font-black uppercase tracking-wider text-[var(--tt-text-muted)]">
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={
                      paginatedSchedules.length > 0 &&
                      paginatedSchedules.every((s) => batchSelectedIds.includes(s.id))
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        const pageIds = paginatedSchedules.map((s) => s.id);
                        setBatchSelectedIds(Array.from(new Set([...batchSelectedIds, ...pageIds])));
                      } else {
                        const pageIdSet = new Set(paginatedSchedules.map((s) => s.id));
                        setBatchSelectedIds(batchSelectedIds.filter((id) => !pageIdSet.has(id)));
                      }
                    }}
                    className="rounded border-[var(--tt-border-medium)] text-red-500 focus:ring-0 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-4 max-w-[190px]">{t("scheduler.col_expansion")}</th>
                <th className="py-3 px-4">{t("scheduler.col_frequency")}</th>
                <th className="py-3 px-4 text-center">{t("scheduler.col_cards")}</th>
                <th className="py-3 px-4 whitespace-nowrap">{t("scheduler.col_last_sync")}</th>
                <th className="py-3 px-4 whitespace-nowrap">{t("scheduler.col_next_sync")}</th>
                <th className="py-3 px-4">{t("scheduler.col_status")}</th>
                <th className="py-3 px-4 text-center w-16">{t("scheduler.col_actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--tt-border-medium)]">
              {loadingSchedules ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-sm text-[var(--tt-text-muted)]">
                    <div className="flex items-center justify-center gap-2">
                      <IconRefresh className="w-4 h-4 animate-spin text-red-500" />
                      <span>{t("scheduler.loading_schedules")}</span>
                    </div>
                  </td>
                </tr>
              ) : filteredSchedules.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-sm text-[var(--tt-text-muted)]">
                    {t("scheduler.empty_schedules")}
                  </td>
                </tr>
              ) : (
                paginatedSchedules.map((item) => {
                  const isChecked = batchSelectedIds.includes(item.id);
                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-[var(--tt-bg-subtle)] transition-colors ${
                        isChecked ? "bg-red-500/[0.03]" : ""
                      }`}
                    >
                      {/* Checkbox de Fila */}
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setBatchSelectedIds([...batchSelectedIds, item.id]);
                            } else {
                              setBatchSelectedIds(batchSelectedIds.filter((id) => id !== item.id));
                            }
                          }}
                          className="rounded border-[var(--tt-border-medium)] text-red-500 focus:ring-0 cursor-pointer"
                        />
                      </td>

                      {/* Expansión y Juego con código truncado / limitado a la mitad */}
                      <td className="py-3 px-4 max-w-[190px]">
                        <div className="font-bold text-[var(--tt-text-main)] flex items-center gap-1.5 min-w-0">
                          <span
                            className="truncate max-w-[120px] cursor-help transition-colors hover:text-red-500"
                            title={item.name}
                            onMouseEnter={(e) => handleMouseEnterTooltip(e, item.name, item.gameName)}
                            onMouseLeave={handleMouseLeaveTooltip}
                          >
                            {item.name}
                          </span>
                          {item.externalId && (
                            <span
                              title={item.externalId}
                              onMouseEnter={(e) =>
                                handleMouseEnterTooltip(
                                  e,
                                  t("scheduler.code_label", { code: item.externalId }),
                                  item.name
                                )
                              }
                              onMouseLeave={handleMouseLeaveTooltip}
                              className="text-[10px] font-mono px-1 py-0.5 rounded bg-white/5 border border-white/10 text-[var(--tt-text-muted)] hover:border-red-500/40 hover:text-[var(--tt-text-main)] inline-block max-w-[50px] truncate shrink-0 align-middle cursor-help transition-colors"
                            >
                              {item.externalId.length > 5
                                ? `${item.externalId.slice(0, 4)}…`
                                : item.externalId.toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[var(--tt-text-muted)] mt-0.5 truncate max-w-[160px]" title={item.gameName}>
                          {item.gameName}
                        </div>
                      </td>

                      {/* Selector de Frecuencia Individual */}
                      <td className="py-3 px-4">
                        <select
                          value={item.syncFrequency}
                          onChange={(e) => handleUpdateSingleFrequency(item.id, item.name, e.target.value)}
                          style={{
                            backgroundColor: item.syncFrequency === "DAILY"
                              ? "rgba(6, 78, 59, 0.45)"
                              : item.syncFrequency === "WEEKLY"
                              ? "rgba(30, 58, 138, 0.45)"
                              : item.syncFrequency === "MONTHLY"
                              ? "rgba(120, 53, 15, 0.45)"
                              : "#080B12",
                            color: item.syncFrequency === "DAILY"
                              ? "#34d399"
                              : item.syncFrequency === "WEEKLY"
                              ? "#60a5fa"
                              : item.syncFrequency === "MONTHLY"
                              ? "#fbbf24"
                              : "#FFFFFF",
                          }}
                          className="px-2.5 py-1.5 rounded-lg border border-white/10 text-xs font-bold outline-none focus:border-red-500 transition-colors cursor-pointer"
                        >
                          <option value="DAILY" style={{ backgroundColor: "#0B0E17", color: "#34d399" }} className="py-1">{t("scheduler.freq_daily")}</option>
                          <option value="WEEKLY" style={{ backgroundColor: "#0B0E17", color: "#60a5fa" }} className="py-1">{t("scheduler.freq_weekly")}</option>
                          <option value="MONTHLY" style={{ backgroundColor: "#0B0E17", color: "#fbbf24" }} className="py-1">{t("scheduler.freq_monthly")}</option>
                          <option value="MANUAL" style={{ backgroundColor: "#0B0E17", color: "#FFFFFF" }} className="py-1">{t("scheduler.freq_manual")}</option>
                        </select>
                      </td>

                      {/* Cartas Asignadas */}
                      <td className="py-3 px-4 text-center font-mono font-bold text-[var(--tt-text-main)]">
                        {item.assignedCardsCount.toLocaleString("es-CL")}
                      </td>

                      {/* Última Sincronización */}
                      <td className="py-3 px-4 text-[var(--tt-text-muted)] font-mono text-[11px] whitespace-nowrap">
                        {item.lastPriceSyncAt
                          ? new Date(item.lastPriceSyncAt).toLocaleDateString("es-CL", {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "-"}
                      </td>

                      {/* Próxima Sincronización */}
                      <td className="py-3 px-4 font-mono text-[11px] whitespace-nowrap">
                        {item.syncFrequency === "MANUAL" ? (
                          <span className="text-[var(--tt-text-muted)]">Manual</span>
                        ) : item.nextPriceSyncAt ? (
                          <span className="text-emerald-500 font-semibold">
                            {new Date(item.nextPriceSyncAt).toLocaleDateString("es-CL", {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        ) : (
                          <span className="text-amber-500 font-bold">Inmediato</span>
                        )}
                      </td>

                      {/* Estado */}
                      <td className="py-3 px-4 whitespace-nowrap">
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

                      {/* Acciones: Botón de icono compacto (sin texto redundante) */}
                      <td className="py-3 px-4 text-center w-16">
                        <button
                          type="button"
                          onClick={() => handleDirectSyncFromTable(item.gameKey, item.name)}
                          disabled={item.lastSyncStatus === "IN_PROGRESS" || schedulerProgress.active}
                          title={item.lastSyncStatus === "IN_PROGRESS" ? t("inProgress") : t("scheduler.sync_now")}
                          aria-label={item.lastSyncStatus === "IN_PROGRESS" ? t("inProgress") : t("scheduler.sync_now")}
                          className={`inline-flex items-center justify-center w-8 h-8 rounded-lg border transition-all ${
                            item.lastSyncStatus === "IN_PROGRESS"
                              ? "bg-amber-500/15 border-amber-500/30 text-amber-500 cursor-not-allowed"
                              : "bg-white/5 border-[var(--tt-border-medium)] text-[var(--tt-text-muted)] hover:text-white hover:border-red-500 hover:bg-red-500/15 cursor-pointer shadow-sm active:scale-95"
                          }`}
                        >
                          <IconRefresh
                            className={`w-3.5 h-3.5 text-red-500 ${
                              item.lastSyncStatus === "IN_PROGRESS" ? "animate-spin text-amber-500" : ""
                            }`}
                          />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Barra de Paginación Optimizada al pie de la tabla */}
        {filteredSchedules.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-[var(--tt-bg-subtle)] border-t border-[var(--tt-border-medium)] text-xs">
            <div className="text-[var(--tt-text-muted)] font-mono text-[11px]">
              Mostrando <span className="font-bold text-[var(--tt-text-main)]">{(validCurrentPage - 1) * pageSize + 1}</span> a{" "}
              <span className="font-bold text-[var(--tt-text-main)]">
                {Math.min(validCurrentPage * pageSize, filteredSchedules.length)}
              </span>{" "}
              de <span className="font-bold text-[var(--tt-text-main)]">{filteredSchedules.length.toLocaleString("es-CL")}</span> ediciones
            </div>

            <div className="flex items-center gap-3">
              {/* Selector de tamaño de página */}
              <div className="flex items-center gap-1.5 text-[var(--tt-text-muted)]">
                <span className="text-[11px]">Por página:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-[var(--tt-bg-surface)] border border-[var(--tt-border-medium)] rounded-lg px-2 py-1 text-xs text-[var(--tt-text-main)] font-mono outline-none focus:border-red-500 cursor-pointer"
                >
                  <option value={15}>15</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              {/* Controles de página */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={validCurrentPage === 1}
                  aria-label="Página anterior"
                  className="p-1.5 rounded-lg border border-[var(--tt-border-medium)] bg-[var(--tt-bg-surface)] text-[var(--tt-text-muted)] hover:text-[var(--tt-text-main)] hover:border-white/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <IconChevronLeft className="w-4 h-4" />
                </button>

                <span className="px-3 py-1 font-mono text-[11px] font-bold text-[var(--tt-text-main)]">
                  {validCurrentPage} / {totalPages}
                </span>

                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={validCurrentPage === totalPages}
                  aria-label="Página siguiente"
                  className="p-1.5 rounded-lg border border-[var(--tt-border-medium)] bg-[var(--tt-bg-surface)] text-[var(--tt-text-muted)] hover:text-[var(--tt-text-main)] hover:border-white/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <IconChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tooltip Flotante Global (Nombre completo y Código) */}
      {hoverTooltip && (
        <div
          style={{ left: hoverTooltip.x, top: hoverTooltip.y }}
          className={`fixed pointer-events-none z-[9999] px-3 py-2 rounded-xl bg-[var(--tt-bg-canvas)] border border-[var(--tt-border-medium)] text-[var(--tt-text-main)] shadow-2xl text-xs max-w-sm backdrop-blur-md transition-all duration-150 ${
            hoverTooltip.placeBelow ? "translate-y-0" : "-translate-y-full"
          }`}
        >
          <div className="font-bold break-words leading-tight">{hoverTooltip.text}</div>
          {hoverTooltip.subtext && (
            <div className="text-[10px] text-[var(--tt-text-muted)] font-normal mt-1 break-words">
              {hoverTooltip.subtext}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
