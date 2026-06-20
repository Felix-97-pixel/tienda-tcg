"use client";
import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { List, Column } from "@/components/ui/List";
import { TopProduct } from "@/types/adminSale";
import { API_URL } from "@/utils/api";
import Papa from "papaparse";

export interface TopProductsListProps {
  products: TopProduct[];
}

export default function TopProductsList({ products: initialProducts }: TopProductsListProps) {
  const t = useTranslations("sales");
  const to = useTranslations("orders");
  const tp = useTranslations("products");

  const [products, setProducts] = useState<TopProduct[]>(initialProducts);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  const fetchFilteredProducts = async () => {
    if (!startDate && !endDate) {
      setProducts(initialProducts);
      return;
    }
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (startDate) query.append("startDate", startDate);
      if (endDate) query.append("endDate", endDate);
      
      const res = await fetch(`${API_URL}/payments/stats/top-products?${query.toString()}`, { credentials: "include" });
      if (res.ok) {
        setProducts(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    const data = products.map(p => ({
      'Producto': p.productName,
      'Unidades Vendidas': p.totalUnits,
      'Veces Ordenado': p.timesOrdered
    }));
    const csv = Papa.unparse(data);
    const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `top-productos${startDate ? `-${startDate}` : ''}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns: Column<TopProduct>[] = [
    {
      key: "product",
      header: tp("table.product"),
      render: (product) => {
        const index = products.findIndex(p => p.productId === product.productId);
        const rankColors = ["bg-yellow-400 text-white shadow-lg", "bg-slate-400 text-white shadow-lg", "bg-orange-400 text-white shadow-lg"];
        return (
          <div className="flex items-center gap-3 min-w-0">
            <span className={`w-7 h-7 flex-shrink-0 rounded-xl flex items-center justify-center text-xs font-black ${rankColors[index] || "bg-[#111318] text-gray-4"}`}>
              {index + 1}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate leading-tight">{product.productName}</p>
              <p className="text-[10px] text-gray-4 font-bold uppercase mt-0.5">{product.timesOrdered} {to("title")}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: "units",
      header: t("charts.unitsSold"),
      headerClassName: "text-right",
      cellClassName: "text-right",
      render: (product) => {
        const maxUnits = products[0]?.totalUnits || 1;
        const barWidth = maxUnits > 0 ? (product.totalUnits / maxUnits) * 100 : 0;
        return (
          <div className="flex flex-col items-end gap-1.5 w-full">
            <p className="text-sm font-black text-blue">{product.totalUnits} UDS</p>
            <div className="h-1.5 bg-[#111318] rounded-full overflow-hidden w-full max-w-[80px]">
              <div className="h-full rounded-full bg-blue transition-all" style={{ width: `${barWidth}%` }} />
            </div>
          </div>
        );
      },
    }
  ];

  return (
    <div className="bg-[#1a1d24] rounded-2xl shadow-1 overflow-hidden border border-transparent hover:border-stroke transition-colors h-full flex flex-col">
      <div className="flex flex-col gap-3 px-6 py-5 border-b border-stroke bg-gray-50/50 shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="font-black text-white text-sm uppercase tracking-widest flex items-center gap-2">
            <span className="text-xl">🏆</span> {t("charts.topProductsTitle")}
          </h2>
          <button onClick={downloadCSV} className="text-gray-4 hover:text-white p-1 bg-[#0f1115] rounded-md transition-colors" title="Descargar Top 10 en CSV">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          </button>
        </div>
        <div className="flex gap-2 items-center">
          <div className="relative w-full">
            <input 
              type="date" 
              value={startDate} 
              onChange={e => setStartDate(e.target.value)} 
              className="bg-[#0f1115] text-xs text-white px-3 py-2 rounded-lg border border-white/10 outline-none w-full focus:border-blue focus:ring-1 focus:ring-blue transition-all [color-scheme:dark]" 
            />
          </div>
          <span className="text-gray-5 text-xs font-bold">-</span>
          <div className="relative w-full">
            <input 
              type="date" 
              value={endDate} 
              onChange={e => setEndDate(e.target.value)} 
              className="bg-[#0f1115] text-xs text-white px-3 py-2 rounded-lg border border-white/10 outline-none w-full focus:border-blue focus:ring-1 focus:ring-blue transition-all [color-scheme:dark]" 
            />
          </div>
          <button onClick={fetchFilteredProducts} className="bg-blue hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors shadow-lg shadow-blue/20">
            Filtrar
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto relative">
        {loading && <div className="absolute inset-0 bg-[#1a1d24]/50 z-10 flex items-center justify-center"><div className="w-6 h-6 border-2 border-blue border-t-transparent rounded-full animate-spin" /></div>}
        <List
          columns={columns}
          data={products}
          keyExtractor={(p) => p.productId}
          wrapperProps={{ className: "shadow-none rounded-none border-none" }}
        />
      </div>
    </div>
  );
}
