"use client";
import Loader from "@/components/ui/Loader";
import React from "react";
import { useTranslations } from "next-intl";
import { useAppSelector } from "@/redux/store";
import UpsellBanner from "@/app/admin/_components/UpsellBanner";
import ChartWidget from "@/app/admin/_components/Sales/ChartWidget";
import TopProductsList from "@/app/admin/_components/Sales/TopProductsList";
import MonthlyRevenueList from "@/app/admin/_components/Sales/MonthlyRevenueList";
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

  if (!features.includes("addon:reports")) {
    return (
      <div className="p-6 pb-24">
        <UpsellBanner featureName="Reportes & Analítica" />
      </div>
    );
  }

  if (loading && loadingStats) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader text="Cargando analítica e indicadores..." className="min-h-[40vh] bg-transparent py-10" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center py-32 bg-[#0E121B] rounded-3xl shadow-xl border border-white/10 max-w-lg mx-auto my-12">
        <div className="w-16 h-16 bg-red/10 text-red border border-red/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <IconAlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">{t("errorTitle") || "Error"}</h2>
        <Button onClick={handleRefreshAll} variant="primary">{tc("refresh") || "Reintentar"}</Button>
      </div>
    );
  }

  const { revenueData, statusData, expansionData, langData } = charts;

  return (
    <div className="p-6 space-y-8 pb-24">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Reportes & Analítica</h1>
          <p className="text-gray-4 text-sm font-medium mt-1">
            Rendimiento de inventario, rotación de productos, alertas de stock y métricas históricas
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={handleRefreshAll}
            leftIcon={<IconRefresh className="w-4 h-4" />}
          >
            {tc("refresh") || "Actualizar"}
          </Button>
          <Button
            onClick={() => exportToPDF("pdf-report-container", "reporte-ventas.pdf")}
            leftIcon={<IconDownload className="w-4 h-4" />}
          >
            Exportar a PDF
          </Button>
        </div>
      </div>

      <div id="pdf-report-container" className="space-y-8 bg-transparent p-1 rounded-xl">
        {/* KPIs de Inventario y Rotación */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#0E121B] border border-white/10 rounded-3xl p-6 shadow-2xl relative group">
            <div className="flex justify-between items-start mb-2">
              <p className="text-sm text-gray-4 font-bold uppercase tracking-wider">Valor de Inventario Activo</p>
              <button
                onClick={() => handleDownloadCSV("inventory")}
                className="text-gray-4 hover:text-white p-1.5 bg-[#0f1115] rounded-md transition-colors"
                title="Descargar CSV de Inventario"
              >
                <IconDownload className="w-4 h-4" />
              </button>
            </div>
            <p className="text-3xl font-black text-white">${data.inventory.totalValue.toLocaleString("es-CL")}</p>
          </div>

          <div className="bg-[#0E121B] border border-white/10 rounded-3xl p-6 shadow-2xl relative group">
            <div className="flex justify-between items-start mb-2">
              <p className="text-sm text-gray-4 font-bold uppercase tracking-wider">Dead Stock (Cartas sin mover)</p>
              <button
                onClick={() => handleDownloadCSV("deadstock")}
                className="text-gray-4 hover:text-white p-1.5 bg-[#0f1115] rounded-md transition-colors"
                title="Descargar CSV de Dead Stock"
              >
                <IconDownload className="w-4 h-4" />
              </button>
            </div>
            <p className="text-3xl font-black text-red-500">{data.inventory.deadStockCount}</p>
          </div>

          <div className="bg-[#0E121B] border border-white/10 rounded-3xl p-6 shadow-2xl relative group">
            <div className="flex justify-between items-start mb-2">
              <p className="text-sm text-gray-4 font-bold uppercase tracking-wider">Exportar Clientes & Ventas</p>
              <button
                onClick={() => handleDownloadCSV("transactions")}
                className="text-gray-4 hover:text-white p-1.5 bg-[#0f1115] rounded-md transition-colors"
                title="Descargar CSV de Clientes y Transacciones"
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
            title="Evolución de Ingresos"
            data={revenueData}
            dataKeyX="date"
            dataKeyY="amount"
            defaultType="line"
          />
          <ChartWidget
            id="chart-status"
            title="Tasa de Éxito de Órdenes"
            data={statusData}
            dataKeyX="status"
            dataKeyY="count"
            defaultType="pie"
          />
          <ChartWidget
            id="chart-expansion"
            title="Top Expansiones (Volumen)"
            data={expansionData}
            dataKeyX="name"
            dataKeyY="value"
            defaultType="bar"
          />
          <ChartWidget
            id="chart-lang"
            title="Ventas por Idioma"
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
