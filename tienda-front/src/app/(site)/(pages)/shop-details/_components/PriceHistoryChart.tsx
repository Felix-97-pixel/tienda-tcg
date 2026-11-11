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
import { IconHistory, IconTrendingUp, IconTrendingDown } from "@/components/ui/Icons";
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

type PeriodOption = 7 | 30 | 90 | 365;

export default function PriceHistoryChart({ productId }: PriceHistoryChartProps) {
  const t = useTranslations("product_details");
  const [data, setData] = useState<PriceHistoryResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDays, setSelectedDays] = useState<PeriodOption>(30);
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

  // Cálculo de variación porcentual en el periodo (según la fuente activa)
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

  const hasHistoryData = chartData.length > 0;
  const currentSpotPriceUSA = activeFinish?.currentPrice ?? 0;
  const currentSpotPriceLocal = activeLocalFinish?.currentLowPrice ?? null;
  const currentLastSoldPrice = activeLocalFinish?.lastSoldPrice ?? null;

  return (
    <div className="w-full rounded-2xl border border-[var(--tt-border-medium)] bg-[var(--tt-bg-surface)] p-5 md:p-6 shadow-sm transition-all">
      {/* Header del Gráfico */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[var(--tt-border-medium)] pb-4">
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
            Comparativa histórica: Cotizaciones oficiales EE.UU. vs. Mercado propio de usuarios TapTrade.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {/* Selector de Fuente: Comparativa / EE.UU. / TapTrade */}
          <div className="inline-flex items-center rounded-xl border border-[var(--tt-border-medium)] bg-[var(--tt-bg-subtle)] p-1 text-xs">
            <button
              onClick={() => setPriceSource("ALL")}
              className={`rounded-lg px-2.5 py-1 font-semibold transition-all ${
                priceSource === "ALL"
                  ? "bg-[var(--tt-bg-surface)] text-[var(--tt-text-main)] shadow-sm font-bold"
                  : "text-[var(--tt-text-muted)] hover:text-[var(--tt-text-main)]"
              }`}
            >
              Comparativa
            </button>
            <button
              onClick={() => setPriceSource("USA")}
              className={`rounded-lg px-2.5 py-1 font-semibold transition-all ${
                priceSource === "USA"
                  ? "bg-blue-500/15 text-blue-500 dark:text-blue-400 shadow-sm font-bold"
                  : "text-[var(--tt-text-muted)] hover:text-[var(--tt-text-main)]"
              }`}
            >
              EE.UU. (TCGPlayer)
            </button>
            <button
              onClick={() => setPriceSource("LOCAL")}
              className={`rounded-lg px-2.5 py-1 font-semibold transition-all ${
                priceSource === "LOCAL"
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shadow-sm font-bold"
                  : "text-[var(--tt-text-muted)] hover:text-[var(--tt-text-main)]"
              }`}
            >
              TapTrade (Usuarios)
            </button>
          </div>

          {/* Selector de Rango de Días */}
          <div className="inline-flex items-center rounded-xl border border-[var(--tt-border-medium)] bg-[var(--tt-bg-subtle)] p-1">
            {([7, 30, 90, 365] as PeriodOption[]).map((days) => {
              const labelKey =
                days === 7
                  ? "price_history_7d"
                  : days === 30
                  ? "price_history_30d"
                  : days === 90
                  ? "price_history_90d"
                  : "price_history_all";
              const isActive = selectedDays === days;
              return (
                <button
                  key={days}
                  onClick={() => setSelectedDays(days)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-[var(--tt-bg-surface)] text-[var(--tt-text-main)] shadow-sm"
                      : "text-[var(--tt-text-muted)] hover:text-[var(--tt-text-main)]"
                  }`}
                >
                  {t(labelKey)}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selector de Acabados (Normal / Foil) y Precios Spot Comparados */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        {data?.availableFinishes && data.availableFinishes.length > 1 && (
          <div className="flex items-center gap-1.5">
            {data.availableFinishes.map((f) => {
              const isActive = f.finishId === activeFinish?.finishId;
              return (
                <button
                  key={f.finishId}
                  onClick={() => setSelectedFinishId(f.finishId)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider transition-all border ${
                    isActive
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "border-[var(--tt-border-medium)] bg-[var(--tt-bg-subtle)] text-[var(--tt-text-muted)] hover:border-[var(--tt-border-strong)]"
                  }`}
                >
                  {f.finishName}
                </button>
              );
            })}
          </div>
        )}

        {/* Spot Price & Badges de Referencia */}
        <div className="flex flex-wrap items-center gap-4 ml-auto">
          {/* Precio EE.UU. */}
          {currentSpotPriceUSA > 0 && (priceSource === "ALL" || priceSource === "USA") && (
            <div className="text-right">
              <span className="block text-[10px] uppercase font-bold tracking-wider text-blue-400">
                Ref. EE.UU. (USD)
              </span>
              <span className="text-lg font-black text-[var(--tt-text-main)]">
                ${currentSpotPriceUSA.toFixed(2)}
              </span>
            </div>
          )}

          {/* Precio Mínimo Usuarios TapTrade */}
          {currentSpotPriceLocal != null && currentSpotPriceLocal > 0 && (priceSource === "ALL" || priceSource === "LOCAL") && (
            <div className="text-right">
              <span className="block text-[10px] uppercase font-bold tracking-wider text-emerald-500">
                Mínimo TapTrade (Chile)
              </span>
              <span className="text-lg font-black text-emerald-500">
                ${currentSpotPriceLocal.toLocaleString("es-CL")} CLP
              </span>
            </div>
          )}

          {/* Última Venta Real */}
          {currentLastSoldPrice != null && currentLastSoldPrice > 0 && (
            <div className="text-right border-l border-[var(--tt-border-medium)] pl-3">
              <span className="block text-[10px] uppercase font-bold tracking-wider text-amber-400">
                Última Venta Real
              </span>
              <span className="text-sm font-black text-amber-300">
                ${currentLastSoldPrice.toLocaleString("es-CL")} CLP
              </span>
            </div>
          )}

          {chartData.length > 1 && (
            <div
              className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold border ${
                isPositive
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400"
              }`}
            >
              {isPositive ? (
                <IconTrendingUp className="h-3.5 w-3.5" />
              ) : (
                <IconTrendingDown className="h-3.5 w-3.5" />
              )}
              <span>
                {isPositive ? "+" : "-"}
                {percentChange.toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Contenedor del Gráfico o Estado Vacío */}
      <div className="mt-5 h-[230px] w-full">
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
                        {item.activeListings > 0 && (
                          <p className="text-[10px] text-[var(--tt-text-muted)] italic pt-0.5">
                            {item.activeListings} {item.activeListings === 1 ? "vendedor con stock" : "vendedores con stock"}
                          </p>
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
  );
}

