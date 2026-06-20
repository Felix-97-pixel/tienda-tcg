"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { API_URL } from "@/utils/api";
import { downloadCSV } from "@/utils/exportUtils";
import { SalesReportData, ChartDataItem } from "../types/sales.types";

export function useSalesAnalytics(features: string[]) {
  const [data, setData] = useState<SalesReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchReports = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    if (features.includes("addon:reports")) {
      fetchReports();
    }
  }, [features, fetchReports]);

  const handleDownloadCSV = async (type: 'inventory' | 'deadstock' | 'transactions') => {
    try {
      await downloadCSV(`${API_URL}/payments/reports/export/${type}`, `reporte-${type}.csv`);
    } catch (e) {
      alert("Error al descargar el reporte CSV");
    }
  };

  // Procesamiento de Datos para Gráficos
  const charts = useMemo(() => {
    if (!data) return { revenueData: [], statusData: [], expansionData: [], langData: [] };

    // 1. Ingresos por Día
    const ordersByDate = data.financial.orders.reduce((acc: Record<string, number>, order) => {
      const date = new Date(order.createdAt).toLocaleDateString();
      acc[date] = (acc[date] || 0) + Number(order.totalAmount);
      return acc;
    }, {});
    const revenueData: ChartDataItem[] = Object.keys(ordersByDate).map(date => ({ date, amount: ordersByDate[date] }));

    // 2. Tasa de Éxito de Órdenes
    const statusCounts = data.financial.vendorOrders.reduce((acc: Record<string, number>, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});
    const statusData: ChartDataItem[] = Object.keys(statusCounts).map(status => ({ status, count: statusCounts[status] }));

    // 3. Top Expansiones
    const expansionCounts = data.preferences.products.reduce((acc: Record<string, number>, product) => {
      const exp = product.cardDetail?.expansion || "Sin Expansión";
      acc[exp] = (acc[exp] || 0) + 1;
      return acc;
    }, {});
    const expansionData: ChartDataItem[] = Object.keys(expansionCounts)
      .map(exp => ({ name: exp, value: expansionCounts[exp] }))
      .sort((a, b) => (b.value as number) - (a.value as number))
      .slice(0, 10);

    // 4. Ventas por Idioma
    const langCounts = data.preferences.inventoryItems.reduce((acc: Record<string, number>, item) => {
      const lang = item.language?.name || "Desconocido";
      acc[lang] = (acc[lang] || 0) + 1;
      return acc;
    }, {});
    const langData: ChartDataItem[] = Object.keys(langCounts).map(lang => ({ name: lang, value: langCounts[lang] }));

    return { revenueData, statusData, expansionData, langData };
  }, [data]);

  return {
    data,
    loading,
    error,
    charts,
    fetchReports,
    handleDownloadCSV
  };
}
