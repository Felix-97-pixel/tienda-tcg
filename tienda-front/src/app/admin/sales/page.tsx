"use client";
import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { API_URL } from "@/utils/api";

// Componentes Extraídos
import StatCard from "@/components/Admin/Sales/StatCard";
import TopProductsList from "@/components/Admin/Sales/TopProductsList";
import RecentOrdersList from "@/components/Admin/Sales/RecentOrdersList";
import { Button } from "@/components/ui/Button";

export default function AdminSalesPage() {
  const t = useTranslations("sales");
  const to = useTranslations("orders");
  const tc = useTranslations("common");

  const [stats, setStats] = useState<any>(null);
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
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="w-12 h-12 border-4 border-blue border-t-transparent rounded-full animate-spin"></div>
        <p className="text-dark-4 text-xs font-black uppercase tracking-widest animate-pulse">{t("loading")}</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-6 text-center py-32 bg-white rounded-2xl shadow-1 border border-stroke">
        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">⚠️</div>
        <h2 className="text-xl font-bold text-dark mb-2">{t("errorTitle")}</h2>
        <p className="text-dark-4 text-sm mb-6 max-w-xs mx-auto">{t("errorDesc")}</p>
        <Button 
          onClick={fetchStats} 
          size="lg"
        >
          {tc("refresh")}
        </Button>
      </div>
    );
  }

  const { orders, revenue, topProducts, recentOrders } = stats;
  const approvalRate = orders.total > 0 ? ((orders.paid / orders.total) * 100).toFixed(1) : "0";
  const growthPositive = revenue.monthGrowth !== null && revenue.monthGrowth >= 0;

  return (
    <div className="p-6 space-y-10 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark tracking-tight">{t("title")}</h1>
          <p className="text-dark-4 text-sm font-medium mt-1">{t("subtitle")}</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="secondary"
            onClick={fetchStats} 
            leftIcon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
            }
          >
            {tc("refresh")}
          </Button>
          <Link href="/admin/orders">
            <Button rightIcon={<span>→</span>}>
              {to("title")}
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
          label={t("stats.totalRevenue")}
          value={`$${revenue.total.toLocaleString("es-CL")}`}
          sub={t("stats.totalRevenueDesc")}
          color="bg-green-100 text-green-600"
          icon={<svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard
          label={t("stats.monthlyRevenue")}
          value={`$${revenue.thisMonth.toLocaleString("es-CL")}`}
          sub={revenue.monthGrowth !== null ? t("stats.vsPrevious") : t("stats.firstMonth")}
          color={growthPositive ? "bg-blue/10 text-blue" : "bg-red-100 text-red-500"}
          trend={revenue.monthGrowth !== null ? { value: revenue.monthGrowth, positive: growthPositive } : undefined}
          icon={<svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
        />
        <StatCard
          label={t("stats.effectiveness")}
          value={`${approvalRate}%`}
          sub={t("stats.paidOfTotal", { paid: orders.paid, total: orders.total })}
          color="bg-purple-100 text-purple-600"
          icon={<svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard
          label={t("stats.pending")}
          value={`${orders.pending}`}
          sub={t("stats.failedCount", { count: orders.failed })}
          color="bg-yellow-100 text-yellow-600"
          icon={<svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
      </div>

      {/* Main Charts / Lists */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <TopProductsList products={topProducts} />
        <RecentOrdersList orders={recentOrders} />
      </div>
    </div>
  );
}
