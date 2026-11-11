"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { API_URL } from "@/utils/api";
import { IconHistory, IconTrendingUp, IconTrendingDown, IconInfo } from "@/components/ui/Icons";
import { useTranslations } from "next-intl";

interface PricePoint {
  id: string;
  price: number;
  date: string;
  createdAt: string;
}

interface LocalPricePoint {
  id: string;
  date: string;
  lowPrice: number;
  avgPrice: number;
  highPrice: number;
  lastSoldPrice: number | null;
  activeListings: number;
  totalStock: number;
}

interface FinishHistory {
  finishId: string;
  finishName: string;
  currentPrice: number;
  currency: string;
  history: PricePoint[];
}

interface LocalFinishHistory {
  finishId: string | null;
  currency: string;
  currentLowPrice: number;
  currentAvgPrice: number;
  lastSoldPrice: number | null;
  activeListings: number;
  history: LocalPricePoint[];
}

interface PriceHistoryResponse {
  productId: string;
  productName: string;
  daysRequested: number;
  currency?: string;
  availableFinishes: FinishHistory[];
  series?: FinishHistory[];
  localSeries?: LocalFinishHistory[];
}

interface MergedChartPoint {
  date: string;
  rawDate: string;
  usaPrice: number | null;
  localPrice: number | null;
  localAvgPrice: number | null;
  lastSoldPrice: number | null;
  activeListings: number;
}

interface PriceHistoryChartProps {
  productId: string;
  productSlug?: string;
}

type PeriodOption = 30 | 90 | 180 | 365;

export default function PriceHistoryChart({ productId }: PriceHistoryChartProps) {
  const t = useTranslations("product_details");
  const [data, setData] = useState<PriceHistoryResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDays, setSelectedDays] = useState<PeriodOption>(90);
  const [selectedFinishId, setSelectedFinishId] = useState<string | null>(null);
  const [priceSource, setPriceSource] = useState<"ALL" | "USA" | "LOCAL">("ALL");

  useEffect(() => {
    let isCancelled = false;
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/products/${productId}/price-history?days=${selectedDays}`);
        if (res.ok) {
          const json: PriceHistoryResponse = await res.json();
          if (!isCancelled) {
            setData(json);
            const finishes = json.availableFinishes || json.series || [];
            if (!selectedFinishId && finishes.length > 0) {
              setSelectedFinishId(finishes[0].finishId);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching price history:", err);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    if (productId) {
      fetchHistory();
    }

    return () => {
      isCancelled = true;
    };
  }, [productId, selectedDays]);

  // Acabado seleccionado actualmente (Mercado Internacional)
  const activeFinish = useMemo(() => {
    const finishes = data?.availableFinishes || data?.series || [];
    if (finishes.length === 0) return null;
    return finishes.find((f) => f.finishId === selectedFinishId) || finishes[0];
  }, [data, selectedFinishId]);

  // Acabado correspondiente en Mercado Local de Usuarios
  const activeLocalFinish = useMemo(() => {
    if (!data?.localSeries || data.localSeries.length === 0) return null;
    return (
      data.localSeries.find((l) => l.finishId === selectedFinishId) ||
      data.localSeries[0]
    );
  }, [data, selectedFinishId]);

  // Serie de datos unificada combinando EE.UU. y Mercado de Usuarios
  const chartData = useMemo(() => {
    const usaPoints = activeFinish?.history || [];
    const localPoints = activeLocalFinish?.history || [];

    if (usaPoints.length === 0 && localPoints.length === 0) {
      return [];
    }

    const map = new Map<string, MergedChartPoint>();

    for (const pt of usaPoints) {
      const dStr = (pt.date || pt.createdAt || "").split("T")[0];
      if (!dStr) continue;
      const [year, month, day] = dStr.split("-").map(Number);
      const d = new Date(year, month - 1, day);
      const formattedDate = d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });

      map.set(dStr, {
        date: formattedDate,
        rawDate: dStr,
        usaPrice: Number(pt.price),
        localPrice: null,
        localAvgPrice: null,
        lastSoldPrice: null,
        activeListings: 0,
      });
    }

    for (const pt of localPoints) {
      const dStr = (pt.date || "").split("T")[0];
      if (!dStr) continue;
      const [year, month, day] = dStr.split("-").map(Number);
      const d = new Date(year, month - 1, day);
      const formattedDate = d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });

      const existing: MergedChartPoint = map.get(dStr) || {
        date: formattedDate,
        rawDate: dStr,
        usaPrice: null,
        localPrice: null,
        localAvgPrice: null,
        lastSoldPrice: null,
        activeListings: 0,
      };

      existing.localPrice = Number(pt.lowPrice);
      existing.localAvgPrice = Number(pt.avgPrice);
      existing.lastSoldPrice = pt.lastSoldPrice ? Number(pt.lastSoldPrice) : null;
      existing.activeListings = pt.activeListings;
      map.set(dStr, existing);
    }

    return Array.from(map.values()).sort((a, b) => a.rawDate.localeCompare(b.rawDate));
  }, [activeFinish, activeLocalFinish]);

  // Variación porcentual en el período
  const { percentChange, isPositive } = useMemo(() => {
    if (!chartData || chartData.length < 2) {
      return { percentChange: 0, isPositive: true };
    }
    const extractVal = (pt: any) =>
      priceSource === "LOCAL"
        ? (pt.localPrice ?? pt.localAvgPrice ?? 0)
        : (pt.usaPrice ?? pt.localPrice ?? 0);

    const first = extractVal(chartData[0]);
    const last = extractVal(chartData[chartData.length - 1]);
    const diff = last - first;
    const pct = first > 0 ? (diff / first) * 100 : 0;
    return {
      percentChange: Math.abs(pct),
      isPositive: diff >= 0,
    };
  }, [chartData, priceSource]);

  // Métricas estadísticas para el panel lateral
  const stats = useMemo(() => {
    const prices = chartData
      .map((pt) =>
        priceSource === "LOCAL"
          ? (pt.localPrice ?? pt.localAvgPrice ?? 0)
          : (pt.usaPrice ?? pt.localPrice ?? 0)
      )
      .filter((p) => p > 0);

    const fallbackPrice = activeFinish?.currentPrice ?? 0;
    if (prices.length === 0) {
      return {
        low: fallbackPrice,
        high: fallbackPrice,
        median: fallbackPrice,
        avg: fallbackPrice,
        volatilityLevel: "LOW",
        totalPoints: 0,
      };
    }

    const low = Math.min(...prices);
    const high = Math.max(...prices);
    const sorted = [...prices].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)] || fallbackPrice;
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
    const spreadPct = low > 0 ? ((high - low) / low) * 100 : 0;

    let volatilityLevel = "LOW";
    if (spreadPct > 40) volatilityLevel = "HIGH";
    else if (spreadPct > 15) volatilityLevel = "MED";

    return {
      low,
      high,
      median,
      avg,
      volatilityLevel,
      totalPoints: prices.length,
    };
  }, [chartData, priceSource, activeFinish]);

  const hasHistoryData = chartData.length > 0;
  const currentSpotPriceUSA = activeFinish?.currentPrice ?? 0;
  const currentSpotPriceLocal = activeLocalFinish?.currentLowPrice ?? null;
  const currentLastSoldPrice = activeLocalFinish?.lastSoldPrice ?? null;
  const currentQuantity = activeLocalFinish?.history?.[activeLocalFinish.history.length - 1]?.totalStock ?? 0;
  const currentSellers = activeLocalFinish?.activeListings ?? 0;

  return (
    <div className="w-full rounded-2xl border border-[var(--tt-border-medium)] bg-[var(--tt-bg-surface)] p-5 md:p-6 shadow-sm transition-all">
      {/* 2-Column Grid Matching TCGPlayer (Image 2) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Columna Izquierda: Gráfico de Precios */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[var(--tt-border-medium)] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--tt-bg-subtle)] text-[var(--tt-text-main)]">
                  <IconHistory className="h-4 w-4" />
                </div>
                <h3 className="text-base font-bold text-[var(--tt-text-main)] tracking-tight">
                  {t("price_history_title")}
                </h3>
              </div>
              <p className="mt-1 text-xs text-[var(--tt-text-muted)]">
                {t("price_history_subtitle")}
              </p>
            </div>

            {/* Badge de Variación y Acabado Activo (Matching Image 2) */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--tt-bg-subtle)] border border-[var(--tt-border-medium)] text-xs font-mono font-bold text-[var(--tt-text-main)]">
                {activeFinish?.finishName || "Normal"} ${currentSpotPriceUSA > 0 ? currentSpotPriceUSA.toFixed(2) : "—"}
                {chartData.length > 1 && (
                  <span
                    className={`ml-1 text-[11px] font-bold ${
                      isPositive
                        ? "text-emerald-500"
                        : "text-rose-500"
                    }`}
                  >
                    ({isPositive ? "+" : "-"}{percentChange.toFixed(1)}%)
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Selector de Fuente (Comparativa / EE.UU. / TapTrade) */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex items-center rounded-xl border border-[var(--tt-border-medium)] bg-[var(--tt-bg-subtle)] p-1 text-xs">
              <button
                onClick={() => setPriceSource("ALL")}
                className={`rounded-lg px-2.5 py-1 font-semibold transition-all cursor-pointer ${
                  priceSource === "ALL"
                    ? "bg-[var(--tt-bg-surface)] text-[var(--tt-text-main)] shadow-sm font-bold"
                    : "text-[var(--tt-text-muted)] hover:text-[var(--tt-text-main)]"
                }`}
              >
                Comparativa
              </button>
              <button
                onClick={() => setPriceSource("USA")}
                className={`rounded-lg px-2.5 py-1 font-semibold transition-all cursor-pointer ${
                  priceSource === "USA"
                    ? "bg-blue-500/15 text-blue-500 dark:text-blue-400 shadow-sm font-bold"
                    : "text-[var(--tt-text-muted)] hover:text-[var(--tt-text-main)]"
                }`}
              >
                EE.UU. (TCGPlayer)
              </button>
              <button
                onClick={() => setPriceSource("LOCAL")}
                className={`rounded-lg px-2.5 py-1 font-semibold transition-all cursor-pointer ${
                  priceSource === "LOCAL"
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shadow-sm font-bold"
                    : "text-[var(--tt-text-muted)] hover:text-[var(--tt-text-main)]"
                }`}
              >
                TapTrade (Chile)
              </button>
            </div>

            {/* Selector de Rango de Período (1M / 3M / 6M / 1Y) Matching Image 2 */}
            <div className="inline-flex items-center rounded-xl border border-[var(--tt-border-medium)] bg-[var(--tt-bg-subtle)] p-1 text-xs font-mono font-bold">
              {[
                { days: 30 as PeriodOption, label: "1M" },
                { days: 90 as PeriodOption, label: "3M" },
                { days: 180 as PeriodOption, label: "6M" },
                { days: 365 as PeriodOption, label: "1Y" },
              ].map(({ days, label }) => {
                const isActive = selectedDays === days;
                return (
                  <button
                    key={days}
                    onClick={() => setSelectedDays(days)}
                    className={`rounded-lg px-3 py-1 transition-all cursor-pointer ${
                      isActive
                        ? "bg-[var(--tt-bg-surface)] text-[var(--tt-text-main)] shadow-sm font-black border border-[var(--tt-border-medium)]"
                        : "text-[var(--tt-text-muted)] hover:text-[var(--tt-text-main)]"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Gráfico Recharts */}
          <div className="h-[280px] w-full pt-2">
            {loading ? (
              <div className="flex h-full w-full items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
              </div>
            ) : !hasHistoryData ? (
              <div className="flex h-full w-full flex-col items-center justify-center rounded-xl border border-dashed border-[var(--tt-border-medium)] bg-[var(--tt-bg-subtle)]/50 p-6 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--tt-bg-surface)] text-[var(--tt-text-muted)] mb-2 shadow-sm">
                  <IconHistory className="h-5 w-5" />
                </div>
                <h4 className="text-sm font-semibold text-[var(--tt-text-main)]">
                  {t("price_history_no_data")}
                </h4>
                <p className="mt-1 max-w-sm text-xs text-[var(--tt-text-muted)]">
                  {t("price_history_no_data_desc")}
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPriceUsa" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorPriceLocal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    stroke="var(--tt-text-muted)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: "var(--tt-border-medium)" }}
                  />
                  <YAxis
                    stroke="var(--tt-text-muted)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: "var(--tt-border-medium)" }}
                    tickFormatter={(val) => `$${val}`}
                    domain={["auto", "auto"]}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload;
                        return (
                          <div className="rounded-xl border border-[var(--tt-border-medium)] bg-[var(--tt-bg-surface)] p-3 shadow-2xl backdrop-blur-md text-xs space-y-1.5 min-w-[200px]">
                            <p className="font-bold text-[var(--tt-text-main)] border-b border-[var(--tt-border-medium)] pb-1">
                              {item.date}
                            </p>
                            {item.usaPrice != null && (priceSource === "ALL" || priceSource === "USA") && (
                              <div className="flex items-center justify-between gap-3 text-blue-500 dark:text-blue-400">
                                <span className="font-semibold">EE.UU. (TCGPlayer):</span>
                                <span className="font-mono font-black">${item.usaPrice.toFixed(2)} USD</span>
                              </div>
                            )}
                            {item.localPrice != null && (priceSource === "ALL" || priceSource === "LOCAL") && (
                              <div className="flex items-center justify-between gap-3 text-emerald-500">
                                <span className="font-semibold">TapTrade (Mínimo):</span>
                                <span className="font-mono font-black">${item.localPrice.toLocaleString("es-CL")} CLP</span>
                              </div>
                            )}
                            {item.localAvgPrice != null && (priceSource === "ALL" || priceSource === "LOCAL") && (
                              <div className="flex items-center justify-between gap-3 text-[var(--tt-text-muted)] text-[11px]">
                                <span>Promedio Usuarios:</span>
                                <span className="font-mono">${item.localAvgPrice.toLocaleString("es-CL")} CLP</span>
                              </div>
                            )}
                            {item.lastSoldPrice != null && (
                              <div className="flex items-center justify-between gap-3 text-amber-400 border-t border-[var(--tt-border-medium)] pt-1 text-[11px]">
                                <span className="font-semibold">Última Venta:</span>
                                <span className="font-mono font-bold">${item.lastSoldPrice.toLocaleString("es-CL")} CLP</span>
                              </div>
                            )}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  {(priceSource === "ALL" || priceSource === "USA") && (
                    <Area
                      type="monotone"
                      dataKey="usaPrice"
                      stroke="#3b82f6"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorPriceUsa)"
                      dot={false}
                      activeDot={{ r: 5, stroke: "#3b82f6", strokeWidth: 2, fill: "var(--tt-bg-surface)" }}
                    />
                  )}
                  {(priceSource === "ALL" || priceSource === "LOCAL") && (
                    <Area
                      type="monotone"
                      dataKey="localPrice"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorPriceLocal)"
                      dot={false}
                      activeDot={{ r: 5, stroke: "#10b981", strokeWidth: 2, fill: "var(--tt-bg-surface)" }}
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Columna Derecha: Métricas y Comparativas Matching Image 2 */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Card 1: Near Mint Comparison Prices */}
          <div className="rounded-xl p-4 bg-[var(--tt-bg-subtle)] border border-[var(--tt-border-medium)] shadow-sm">
            <h4 className="text-xs font-bold text-[var(--tt-text-main)] mb-0.5">
              {t("comparison_prices_title")}
            </h4>
            <p className="text-[11px] text-[var(--tt-text-muted)] mb-3">
              {t("comparison_prices_subtitle")}
            </p>
            <div className="space-y-2">
              {data?.availableFinishes && data.availableFinishes.length > 0 ? (
                data.availableFinishes.map((f) => {
                  const isSelected = f.finishId === activeFinish?.finishId;
                  return (
                    <button
                      key={f.finishId}
                      type="button"
                      onClick={() => setSelectedFinishId(f.finishId)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[var(--tt-bg-surface)] border-emerald-500/50 text-emerald-500 shadow-sm"
                          : "bg-[var(--tt-bg-surface)] border-[var(--tt-border-medium)] text-[var(--tt-text-main)] hover:border-[var(--tt-border-strong)]"
                      }`}
                    >
                      <span className="capitalize">{f.finishName}:</span>
                      <span className="font-mono text-sm">
                        ${f.currentPrice > 0 ? f.currentPrice.toFixed(2) : "—"}{" "}
                        <span className="text-[10px] text-[var(--tt-text-muted)] font-normal font-sans">USD</span>
                      </span>
                    </button>
                  );
                })
              ) : (
                <div className="p-2.5 rounded-lg bg-[var(--tt-bg-surface)] border border-[var(--tt-border-medium)] text-xs text-[var(--tt-text-muted)]">
                  Normal: ${currentSpotPriceUSA > 0 ? currentSpotPriceUSA.toFixed(2) : "—"} USD
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Price Points ⓘ */}
          <div className="rounded-xl p-4 bg-[var(--tt-bg-subtle)] border border-[var(--tt-border-medium)] shadow-sm">
            <div className="flex items-center justify-between mb-3 border-b border-[var(--tt-border-subtle)] pb-2">
              <div className="flex items-center gap-1.5 font-bold text-xs text-[var(--tt-text-main)]">
                <span>{t("price_points_title")}</span>
                <span title={t("price_points_tooltip")} className="inline-flex items-center cursor-help">
                  <IconInfo className="w-3.5 h-3.5 opacity-60" />
                </span>
              </div>
              <span className="text-[11px] text-emerald-500 font-mono font-bold">
                Near Mint {activeFinish?.finishName || "Normal"}
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[var(--tt-text-muted)]">{t("market_price")}:</span>
                <span className="font-mono font-extrabold text-[var(--tt-text-main)] text-sm">
                  ${currentSpotPriceUSA > 0 ? currentSpotPriceUSA.toFixed(2) : stats.median.toFixed(2)} USD
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[var(--tt-text-muted)]">{t("most_recent_sale")}:</span>
                <span className="font-mono font-bold text-amber-500">
                  {currentLastSoldPrice
                    ? `$${currentLastSoldPrice.toLocaleString("es-CL")} CLP`
                    : currentSpotPriceUSA > 0
                    ? `$${Math.round(currentSpotPriceUSA * 950).toLocaleString("es-CL")} CLP`
                    : "—"}
                </span>
              </div>

              {/* Volatility Indicator bar matching Image 2 */}
              <div className="pt-1 pb-1">
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="text-[var(--tt-text-muted)] flex items-center gap-1">
                    {stats.volatilityLevel === "LOW"
                      ? t("volatility_low")
                      : stats.volatilityLevel === "MED"
                      ? t("volatility_med")
                      : t("volatility_high")}
                    <IconInfo className="w-3 h-3 opacity-50" />
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[var(--tt-border-medium)] relative overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      stats.volatilityLevel === "LOW"
                        ? "bg-emerald-500 w-1/3"
                        : stats.volatilityLevel === "MED"
                        ? "bg-blue-500 w-2/3"
                        : "bg-rose-500 w-full"
                    }`}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-[var(--tt-border-subtle)] text-[11px]">
                <span className="text-[var(--tt-text-muted)]">{t("listed_median")}:</span>
                <span className="font-mono font-bold text-[var(--tt-text-main)]">${stats.median.toFixed(2)} USD</span>
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[var(--tt-text-muted)]">
                  {t("current_quantity")}:{" "}
                  <strong className="text-[var(--tt-text-main)] font-mono">{currentQuantity || "—"}</strong>
                </span>
                <span className="text-[var(--tt-text-muted)]">
                  {t("current_sellers")}:{" "}
                  <strong className="text-[var(--tt-text-main)] font-mono">{currentSellers || "—"}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Snapshot del Período */}
          <div className="rounded-xl p-4 bg-[var(--tt-bg-subtle)] border border-[var(--tt-border-medium)] shadow-sm">
            <div className="flex items-center justify-between mb-3 border-b border-[var(--tt-border-subtle)] pb-2">
              <h4 className="text-xs font-bold text-[var(--tt-text-main)]">
                {t("snapshot_title", { days: selectedDays })}
              </h4>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[11px] text-[var(--tt-text-muted)] block">{t("low_sale_price")}:</span>
                <span className="font-mono font-bold text-[var(--tt-text-main)] text-sm">
                  ${stats.low.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-[var(--tt-text-muted)] block">{t("high_sale_price")}:</span>
                <span className="font-mono font-bold text-[var(--tt-text-main)] text-sm">
                  ${stats.high.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-[var(--tt-text-muted)] block">Total Registros:</span>
                <span className="font-mono font-bold text-[var(--tt-text-main)]">
                  {stats.totalPoints}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-[var(--tt-text-muted)] block">{t("avg_daily_sold")}:</span>
                <span className="font-mono font-bold text-[var(--tt-text-main)]">
                  ${stats.avg.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
