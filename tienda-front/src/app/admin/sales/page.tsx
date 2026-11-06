"use client";
import Loader from "@/components/ui/Loader";
import React from "react";
import { useTranslations } from "next-intl";
import { useAppSelector } from "@/redux/store";
import dynamic from "next/dynamic";
import TopProductsList from "@/app/admin/_components/Sales/TopProductsList";

const ChartWidget = dynamic(() => import("@/app/admin/_components/Sales/ChartWidget"), {
  ssr: false,
  loading: () => <div className="h-64 rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse" />,
});
const MonthlyRevenueList = dynamic(() => import("@/app/admin/_components/Sales/MonthlyRevenueList"), {
  ssr: false,
  loading: () => <div className="h-64 rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse" />,
});
import LowStockList from "@/app/admin/_components/Sales/LowStockList";
import { Button } from "@/components/ui/Button";
import { exportToPDF } from "@/utils/exportUtils";
import { useSalesAnalytics } from "@/app/admin/_components/Sales/hooks/useSalesAnalytics";
import { useAdminStatistics } from "@/app/admin/_components/Sales/hooks/useAdminStatistics";
import {
  IconAlertTriangle,
  IconDownload,
  IconRefresh,
} from "@/components/ui/Icons";

export default function AdminSalesPage() {
  const t = useTranslations("sales");
  const tc = useTranslations("common");
  const { features } = useAppSelector((state) => state.adminAuthReducer);

  const {
    data,
    loading,
    error,
    charts,
    fetchReports,
    handleDownloadCSV,
  } = useSalesAnalytics(features);

  const {
    stats,
    loading: loadingStats,
    refresh: refreshStats,
  } = useAdminStatistics(features);

  const handleRefreshAll = () => {
    fetchReports();
    refreshStats();
  };

  if (loading && loadingStats) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader text={t("loading_analytics")} className="min-h-[40vh] bg-transparent py-10" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center py-32 bg-[#0E121B] rounded-3xl shadow-xl border border-white/10 max-w-lg mx-auto my-12">
        <div className="w-16 h-16 bg-red/10 text-red border border-red/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <IconAlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">{t("errorTitle")}</h2>
        <Button onClick={handleRefreshAll} variant="primary">{tc("refresh")}</Button>
      </div>
    );
  }

  const { revenueData, statusData, expansionData, langData } = charts;

  return (
    <div className="p-6 space-y-8 pb-24">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">{t("header_title")}</h1>
          <p className="text-gray-4 text-sm font-medium mt-1">
            {t("header_subtitle")}
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={handleRefreshAll}
            leftIcon={<IconRefresh className="w-4 h-4" />}
          >
            {tc("refresh")}
          </Button>
          <Button
            onClick={() => exportToPDF("pdf-report-container", "reporte-ventas.pdf")}
            leftIcon={<IconDownload className="w-4 h-4" />}
          >
            {t("export_pdf_btn")}
          </Button>
        </div>
      </div>

      <div id="pdf-report-container" className="space-y-8 bg-transparent p-1 rounded-xl">
        {/* KPIs de Inventario y Rotación */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#0E121B] border border-white/10 rounded-3xl p-6 shadow-2xl relative group">
            <div className="flex justify-between items-start mb-2">
              <p className="text-sm text-gray-4 font-bold uppercase tracking-wider">{t("kpi_active_inventory")}</p>
              <button
                onClick={() => handleDownloadCSV("inventory")}
                className="text-gray-4 hover:text-white p-1.5 bg-[#0f1115] rounded-md transition-colors"
                title={t("download_inventory_csv_title")}
              >
                <IconDownload className="w-4 h-4" />
              </button>
            </div>
            <p className="text-3xl font-black text-white">${data.inventory.totalValue.toLocaleString("es-CL")}</p>
          </div>

          <div className="bg-[#0E121B] border border-white/10 rounded-3xl p-6 shadow-2xl relative group">
            <div className="flex justify-between items-start mb-2">
              <p className="text-sm text-gray-4 font-bold uppercase tracking-wider">{t("kpi_dead_stock")}</p>
              <button
                onClick={() => handleDownloadCSV("deadstock")}
                className="text-gray-4 hover:text-white p-1.5 bg-[#0f1115] rounded-md transition-colors"
                title={t("download_deadstock_csv_title")}
              >
                <IconDownload className="w-4 h-4" />
              </button>
            </div>
            <p className="text-3xl font-black text-red-500">{data.inventory.deadStockCount}</p>
          </div>

          <div className="bg-[#0E121B] border border-white/10 rounded-3xl p-6 shadow-2xl relative group">
            <div className="flex justify-between items-start mb-2">
              <p className="text-sm text-gray-4 font-bold uppercase tracking-wider">{t("kpi_export_clients_sales")}</p>
              <button
                onClick={() => handleDownloadCSV("transactions")}
                className="text-gray-4 hover:text-white p-1.5 bg-[#0f1115] rounded-md transition-colors"
                title={t("download_transactions_csv_title")}
              >
                <IconDownload className="w-4 h-4" />
              </button>
            </div>
            <p className="text-3xl font-black text-white">{data.financial.transactions.length}</p>
          </div>
        </div>

        {/* Listas Operativas Unificadas (Bajo Stock, Top Productos, Ingresos Mensuales) */}
        {stats && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-1">
              <LowStockList items={stats.operational?.lowStockItems || []} />
            </div>
            <div className="xl:col-span-1">
              <TopProductsList products={stats.topProducts || []} />
            </div>
            <div className="xl:col-span-1">
              <MonthlyRevenueList revenues={stats.monthlyRevenues || []} />
            </div>
          </div>
        )}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <ChartWidget
            id="chart-revenue"
            title={t("chart_revenue_evolution")}
            data={revenueData}
            dataKeyX="date"
            dataKeyY="amount"
            defaultType="line"
          />
          <ChartWidget
            id="chart-status"
            title={t("chart_order_success_rate")}
            data={statusData}
            dataKeyX="status"
            dataKeyY="count"
            defaultType="pie"
          />
          <ChartWidget
            id="chart-expansion"
            title={t("chart_top_expansions")}
            data={expansionData}
            dataKeyX="name"
            dataKeyY="value"
            defaultType="bar"
          />
          <ChartWidget
            id="chart-lang"
            title={t("chart_sales_by_language")}
            data={langData}
            dataKeyX="name"
            dataKeyY="value"
            defaultType="pie"
            colors={["#3C50E0", "#22AD5C", "#FF9800", "#F23030"]}
          />
        </div>
      </div>
    </div>
  );
}
