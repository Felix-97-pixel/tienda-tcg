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

interface FinishHistory {
  finishId: string;
  finishName: string;
  currentPrice: number;
  currency: string;
  history: PricePoint[];
}

interface PriceHistoryResponse {
  productId: string;
  productName: string;
  daysRequested: number;
  availableFinishes: FinishHistory[];
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
            if (!selectedFinishId && json.availableFinishes.length > 0) {
              setSelectedFinishId(json.availableFinishes[0].finishId);
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

  // Acabado seleccionado actualmente
  const activeFinish = useMemo(() => {
    if (!data?.availableFinishes || data.availableFinishes.length === 0) return null;
    return (
      data.availableFinishes.find((f) => f.finishId === selectedFinishId) ||
      data.availableFinishes[0]
    );
  }, [data, selectedFinishId]);

  // Serie de datos para el gráfico
  const chartData = useMemo(() => {
    if (!activeFinish || !activeFinish.history || activeFinish.history.length === 0) {
      return [];
    }

    return activeFinish.history.map((pt) => {
      const d = new Date(pt.createdAt);
      const formattedDate = d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
      return {
        date: formattedDate,
        rawDate: pt.createdAt,
        price: Number(pt.price),
      };
    });
  }, [activeFinish]);

  // Cálculo de variación porcentual en el periodo
  const { percentChange, isPositive, priceDiff } = useMemo(() => {
    if (!chartData || chartData.length < 2) {
      return { percentChange: 0, isPositive: true, priceDiff: 0 };
    }
    const first = chartData[0].price;
    const last = chartData[chartData.length - 1].price;
    const diff = last - first;
    const pct = first > 0 ? (diff / first) * 100 : 0;
    return {
      percentChange: Math.abs(pct),
      isPositive: diff >= 0,
      priceDiff: diff,
    };
  }, [chartData]);

  const hasHistoryData = chartData.length > 0;
  const currentSpotPrice = activeFinish?.currentPrice ?? (chartData[chartData.length - 1]?.price || 0);

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
            {t("price_history_subtitle")}
          </p>
        </div>

        {/* Selector de Rango de Días */}
        <div className="inline-flex items-center rounded-xl border border-[var(--tt-border-medium)] bg-[var(--tt-bg-subtle)] p-1 self-start sm:self-auto">
          {([7, 30, 90, 365] as PeriodOption[]).map((days) => {
            const labelKey = days === 7 ? "price_history_7d" : days === 30 ? "price_history_30d" : days === 90 ? "price_history_90d" : "price_history_all";
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

      {/* Selector de Acabados (Normal / Foil) y Precios Spot */}
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

        {/* Spot Price & Trend Badge */}
        {hasHistoryData && (
          <div className="flex items-center gap-3 ml-auto">
            <div className="text-right">
              <span className="block text-[10px] uppercase font-bold tracking-wider text-[var(--tt-text-muted)]">
                {t("price_history_spot_price")} ({activeFinish?.currency || "USD"})
              </span>
              <span className="text-lg font-black text-[var(--tt-text-main)]">
                ${currentSpotPrice.toFixed(2)}
              </span>
            </div>

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
        )}
      </div>

      {/* Contenedor del Gráfico o Estado Vacío */}
      <div className="mt-5 h-[220px] w-full">
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
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
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
                      <div className="rounded-xl border border-[var(--tt-border-medium)] bg-[var(--tt-bg-surface)] p-2.5 shadow-lg backdrop-blur-md">
                        <p className="text-[11px] font-medium text-[var(--tt-text-muted)]">
                          {item.date}
                        </p>
                        <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                          ${Number(item.price).toFixed(2)}{" "}
                          <span className="text-[10px] font-bold text-[var(--tt-text-muted)]">
                            {activeFinish?.currency || "USD"}
                          </span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke="#10b981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorPrice)"
                dot={chartData.length === 1 ? { r: 5, fill: "#10b981" } : false}
                activeDot={{ r: 5, stroke: "#10b981", strokeWidth: 2, fill: "var(--tt-bg-surface)" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

