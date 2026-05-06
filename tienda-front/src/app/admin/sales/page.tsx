"use client";
import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";

type TopProduct = {
  productId: string;
  productName: string;
  totalUnits: number;
  timesOrdered: number;
};

type RecentOrder = {
  id: string;
  buyOrder: string;
  name: string;
  totalAmount: string;
  createdAt: string;
};

type Stats = {
  orders: { total: number; paid: number; failed: number; pending: number };
  revenue: { total: number; thisMonth: number; prevMonth: number; monthGrowth: number | null };
  topProducts: TopProduct[];
  recentOrders: RecentOrder[];
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const StatCard = ({ label, value, sub, color, icon }: {
  label: string; value: string; sub?: string; color: string; icon: React.ReactNode;
}) => (
  <div className="bg-white rounded-2xl shadow-1 p-6 flex items-start gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>{icon}</div>
    <div>
      <p className="text-dark-4 text-sm mb-1">{label}</p>
      <p className="text-2xl font-bold text-dark">{value}</p>
      {sub && <p className="text-xs text-dark-4 mt-1">{sub}</p>}
    </div>
  </div>
);

const AdminSalesPage = () => {
  const t = useTranslations("sales");
  const to = useTranslations("orders");
  const tc = useTranslations("common");

  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`${API_URL}/payments/stats`, { credentials: "include" });
      if (!res.ok) throw new Error();
      setStats(await res.json());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <svg className="animate-spin h-10 w-10 text-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-6 text-center text-dark-4 py-20">
        <p className="text-lg">{tc("error")}</p>
        <button onClick={fetchStats} className="mt-4 text-blue hover:underline text-sm">{tc("search")}</button>
      </div>
    );
  }

  const { orders, revenue, topProducts, recentOrders } = stats;
  const approvalRate = orders.total > 0 ? ((orders.paid / orders.total) * 100).toFixed(1) : "0";
  const growthPositive = revenue.monthGrowth !== null && revenue.monthGrowth >= 0;

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark">{t("title")}</h1>
          <p className="text-dark-4 text-sm mt-1">{t("subtitle")}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchStats} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-3 text-dark-4 hover:bg-gray-1 transition text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            {tc("search")}
          </button>
          <Link href="/admin/orders" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue text-white text-sm font-medium hover:bg-blue-dark transition">
            {to("title")} →
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard
          label={t("stats.totalRevenue")}
          value={`$${revenue.total.toLocaleString("es-CL")}`}
          sub={t("subtitle")}
          color="bg-green-100"
          icon={<svg className="w-6 h-6 text-green-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" /></svg>}
        />
        <StatCard
          label={t("stats.totalOrders")}
          value={`$${revenue.thisMonth.toLocaleString("es-CL")}`}
          sub={revenue.monthGrowth !== null
            ? `${growthPositive ? "▲" : "▼"} ${Math.abs(revenue.monthGrowth)}% ${t("stats.monthlyGrowth")}`
            : tc("noResults")}
          color={growthPositive ? "bg-blue/10" : "bg-red-100"}
          icon={<svg className={`w-6 h-6 ${growthPositive ? "text-blue" : "text-red-500"}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" /></svg>}
        />
        <StatCard
          label={t("stats.approvalRate")}
          value={`${orders.paid}`}
          sub={`${approvalRate}% ${t("stats.approvalRate")}`}
          color="bg-purple-100"
          icon={<svg className="w-6 h-6 text-purple-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
        />
        <StatCard
          label={t("stats.avgOrderValue")}
          value={`${orders.pending} / ${orders.failed}`}
          sub={`${orders.total} ${tc("total")}`}
          color="bg-yellow-100"
          icon={<svg className="w-6 h-6 text-yellow-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Top productos */}
        <div className="bg-white rounded-2xl shadow-1 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-3">
            <h2 className="font-semibold text-dark text-lg">🏆 {t("charts.topProductsTitle")}</h2>
            <span className="text-xs text-dark-4">{t("charts.unitsSold")}</span>
          </div>
          {topProducts.length === 0 ? (
            <div className="p-8 text-center text-dark-4 text-sm">{tc("noResults")}</div>
          ) : (
            <div className="divide-y divide-gray-3">
              {topProducts.map((product, index) => {
                const maxUnits = topProducts[0].totalUnits;
                const barWidth = maxUnits > 0 ? (product.totalUnits / maxUnits) * 100 : 0;
                return (
                  <div key={product.productId} className="px-6 py-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`w-6 h-6 flex-shrink-0 rounded-full flex items-center justify-center text-xs font-bold ${index === 0 ? "bg-yellow-400 text-white" : index === 1 ? "bg-gray-300 text-gray-700" : index === 2 ? "bg-orange-400 text-white" : "bg-gray-100 text-dark-4"}`}>
                          {index + 1}
                        </span>
                        <span className="text-sm font-medium text-dark truncate">{product.productName}</span>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-dark">{product.totalUnits} uds.</p>
                        <p className="text-xs text-dark-4">{product.timesOrdered} {to("title")}</p>
                      </div>
                    </div>
                    <div className="h-1.5 bg-gray-1 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-500 ${index === 0 ? "bg-yellow-400" : "bg-blue"}`} style={{ width: `${barWidth}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Órdenes recientes */}
        <div className="bg-white rounded-2xl shadow-1 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-3">
            <h2 className="font-semibold text-dark text-lg">🕐 {t("charts.revenueTitle")}</h2>
            <Link href="/admin/orders" className="text-xs text-blue hover:underline">{to("title")} →</Link>
          </div>
          {recentOrders.length === 0 ? (
            <div className="p-8 text-center text-dark-4 text-sm">{tc("noResults")}</div>
          ) : (
            <div className="divide-y divide-gray-3">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-1 transition">
                  <div>
                    <p className="text-sm font-medium text-dark">{order.name}</p>
                    <p className="text-xs text-dark-4 font-mono">{order.buyOrder}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-dark">${parseFloat(order.totalAmount).toLocaleString("es-CL")}</p>
                    <p className="text-xs text-dark-4">{new Date(order.createdAt).toLocaleDateString("es-CL", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSalesPage;
