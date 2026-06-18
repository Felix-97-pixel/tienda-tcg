"use client";
import React, { useEffect, useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { API_URL } from "@/utils/api";
import { useAppSelector } from "@/redux/store";
import UpsellBanner from "@/components/Admin/UpsellBanner";
import ChartWidget from "@/components/Admin/Sales/ChartWidget";
import { Button } from "@/components/ui/Button";
import Papa from "papaparse";

// Importación dinámica de html2canvas y jspdf para evitar problemas de SSR
const exportToPDF = async (elementId: string) => {
  const html2canvas = (await import("html2canvas")).default;
  const { jsPDF } = await import("jspdf");

  const element = document.getElementById(elementId);
  if (!element) return;

  const canvas = await html2canvas(element, { scale: 2, backgroundColor: "#0f1115" });
  const imgData = canvas.toDataURL("image/png");
  
  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

  pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
  pdf.save("reporte-avanzado.pdf");
};

export default function AdminSalesPage() {
  const t = useTranslations("sales");
  const tc = useTranslations("common");
  const { features } = useAppSelector((state) => state.authReducer);
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`${API_URL}/payments/reports/advanced`, { credentials: "include" });
      if (!res.ok) throw new Error();
      setData(await res.json());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = async (type: 'inventory' | 'deadstock' | 'transactions') => {
    try {
      const res = await fetch(`${API_URL}/payments/reports/export/${type}`, { credentials: "include" });
      if (!res.ok) throw new Error();
      const rawData = await res.json();
      
      const csv = Papa.unparse(rawData);
      const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' }); // \uFEFF para soportar tildes en Excel
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `reporte-${type}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error("Error al descargar CSV", e);
      alert("Error al descargar el reporte CSV");
    }
  };

  useEffect(() => {
    if (features.includes("addon:reports")) {
      fetchReports();
    }
  }, [features]);

  if (!features.includes("addon:reports")) {
    return (
      <div className="p-6 pb-24">
        <UpsellBanner featureName="Reportes Estadísticos" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="w-12 h-12 border-4 border-blue border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-4 text-xs font-black uppercase tracking-widest animate-pulse">Cargando reportes...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 text-center py-32 bg-[#1a1d24] rounded-2xl shadow-1 border border-stroke">
        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">⚠️</div>
        <h2 className="text-xl font-bold text-white mb-2">{t("errorTitle") || "Error"}</h2>
        <Button onClick={fetchReports} size="lg">{tc("refresh") || "Reintentar"}</Button>
      </div>
    );
  }

  // Procesamiento de Datos para Gráficos
  
  // 1. Ingresos por Día (Últimos 30 días simplificado para el ejemplo)
  const ordersByDate = data.financial.orders.reduce((acc: any, order: any) => {
    const date = new Date(order.createdAt).toLocaleDateString();
    acc[date] = (acc[date] || 0) + Number(order.totalAmount);
    return acc;
  }, {});
  const revenueData = Object.keys(ordersByDate).map(date => ({ date, amount: ordersByDate[date] }));

  // 2. Tasa de Éxito de Órdenes
  const statusCounts = data.financial.vendorOrders.reduce((acc: any, order: any) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {});
  const statusData = Object.keys(statusCounts).map(status => ({ status, count: statusCounts[status] }));

  // 3. Top Expansiones
  const expansionCounts = data.preferences.products.reduce((acc: any, product: any) => {
    const exp = product.cardDetail?.expansion || "Sin Expansión";
    acc[exp] = (acc[exp] || 0) + 1; // Simplificado: Idealmente se cruza con quantity de orderItems
    return acc;
  }, {});
  const expansionData = Object.keys(expansionCounts).map(exp => ({ name: exp, value: expansionCounts[exp] })).sort((a,b) => b.value - a.value).slice(0, 10);

  // 4. Ventas por Idioma
  const langCounts = data.preferences.inventoryItems.reduce((acc: any, item: any) => {
    const lang = item.language?.name || "Desconocido";
    acc[lang] = (acc[lang] || 0) + 1;
    return acc;
  }, {});
  const langData = Object.keys(langCounts).map(lang => ({ name: lang, value: langCounts[lang] }));

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
          <Button onClick={() => exportToPDF("pdf-report-container")} leftIcon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}>
            Exportar a PDF
          </Button>
        </div>
      </div>

      <div id="pdf-report-container" className="space-y-8 bg-[#0f1115] p-2 rounded-xl">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#1a1d24] border border-white/5 rounded-2xl p-6 shadow-1 relative group">
            <div className="flex justify-between items-start mb-2">
              <p className="text-sm text-gray-4 font-bold uppercase tracking-wider">Valor de Inventario Activo</p>
              <button onClick={() => downloadCSV('inventory')} className="text-gray-4 hover:text-white p-1 bg-[#0f1115] rounded-md transition-colors" title="Descargar CSV de Inventario">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              </button>
            </div>
            <p className="text-3xl font-black text-white">${data.inventory.totalValue.toLocaleString("es-CL")}</p>
          </div>
          
          <div className="bg-[#1a1d24] border border-white/5 rounded-2xl p-6 shadow-1 relative group">
            <div className="flex justify-between items-start mb-2">
              <p className="text-sm text-gray-4 font-bold uppercase tracking-wider">Dead Stock (Cartas sin mover)</p>
              <button onClick={() => downloadCSV('deadstock')} className="text-gray-4 hover:text-white p-1 bg-[#0f1115] rounded-md transition-colors" title="Descargar CSV de Dead Stock">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              </button>
            </div>
            <p className="text-3xl font-black text-red-500">{data.inventory.deadStockCount}</p>
          </div>
          
          <div className="bg-[#1a1d24] border border-white/5 rounded-2xl p-6 shadow-1 relative group">
            <div className="flex justify-between items-start mb-2">
              <p className="text-sm text-gray-4 font-bold uppercase tracking-wider">Transacciones Registradas</p>
              <button onClick={() => downloadCSV('transactions')} className="text-gray-4 hover:text-white p-1 bg-[#0f1115] rounded-md transition-colors" title="Descargar CSV de Clientes y Transacciones">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              </button>
            </div>
            <p className="text-3xl font-black text-blue">{data.financial.transactions.length}</p>
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
