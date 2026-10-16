"use client";
import Loader from "@/components/ui/Loader";
import React from "react";
import { useTranslations } from "next-intl";
import { useAppSelector } from "@/redux/store";
import UpsellBanner from "@/app/admin/_components/UpsellBanner";
import ChartWidget from "@/app/admin/_components/Sales/ChartWidget";
import { Button } from "@/components/ui/Button";
import { exportToPDF } from "@/utils/exportUtils";
import { useSalesAnalytics } from "@/app/admin/_components/Sales/hooks/useSalesAnalytics";

export default function AdminSalesPage() {
  const t = useTranslations("sales");
  const tc = useTranslations("common");
  const { features } = useAppSelector((state) => state.authReducer);
  
  const { 
    data, 
    loading, 
    error, 
    charts, 
    fetchReports, 
    handleDownloadCSV 
  } = useSalesAnalytics(features);

  if (!features.includes("addon:reports")) {
    return (
      <div className="p-6 pb-24">
        <UpsellBanner featureName="Reportes Estadísticos" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader text="Cargando analítica..." className="min-h-[40vh] bg-transparent py-10" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center py-32 bg-[#0E121B] rounded-3xl shadow-xl border border-white/10 max-w-lg mx-auto my-12">
        <div className="w-16 h-16 bg-red/10 text-red border border-red/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">{t("errorTitle") || "Error"}</h2>
        <Button onClick={fetchReports} variant="primary">{tc("refresh") || "Reintentar"}</Button>
      </div>
    );
  }

  const { revenueData, statusData, expansionData, langData } = charts;

  return (
    <div className="p-6 space-y-8 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Analítica de Ventas</h1>
          <p className="text-gray-4 text-sm font-medium mt-1">Monitorea el rendimiento financiero y el éxito de tus productos</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={fetchReports}>{tc("refresh") || "Actualizar"}</Button>
          <Button onClick={() => exportToPDF("pdf-report-container", "reporte-ventas.pdf")} leftIcon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}>
            Exportar a PDF
          </Button>
        </div>
      </div>

      <div id="pdf-report-container" className="space-y-8 bg-transparent p-1 rounded-xl">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#0E121B] border border-white/10 rounded-3xl p-6 shadow-2xl relative group">
            <div className="flex justify-between items-start mb-2">
              <p className="text-sm text-gray-4 font-bold uppercase tracking-wider">Valor de Inventario Activo</p>
              <button onClick={() => handleDownloadCSV('inventory')} className="text-gray-4 hover:text-white p-1 bg-[#0f1115] rounded-md transition-colors" title="Descargar CSV de Inventario">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              </button>
            </div>
            <p className="text-3xl font-black text-white">${data.inventory.totalValue.toLocaleString("es-CL")}</p>
          </div>
          
          <div className="bg-[#0E121B] border border-white/10 rounded-3xl p-6 shadow-2xl relative group">
            <div className="flex justify-between items-start mb-2">
              <p className="text-sm text-gray-4 font-bold uppercase tracking-wider">Dead Stock (Cartas sin mover)</p>
              <button onClick={() => handleDownloadCSV('deadstock')} className="text-gray-4 hover:text-white p-1 bg-[#0f1115] rounded-md transition-colors" title="Descargar CSV de Dead Stock">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              </button>
            </div>
            <p className="text-3xl font-black text-red-500">{data.inventory.deadStockCount}</p>
          </div>
          
          <div className="bg-[#0E121B] border border-white/10 rounded-3xl p-6 shadow-2xl relative group">
            <div className="flex justify-between items-start mb-2">
              <p className="text-sm text-gray-4 font-bold uppercase tracking-wider">Transacciones Registradas</p>
              <button onClick={() => handleDownloadCSV('transactions')} className="text-gray-4 hover:text-white p-1 bg-[#0f1115] rounded-md transition-colors" title="Descargar CSV de Clientes y Transacciones">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              </button>
            </div>
            <p className="text-3xl font-black text-white">{data.financial.transactions.length}</p>
          </div>
        </div>

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
