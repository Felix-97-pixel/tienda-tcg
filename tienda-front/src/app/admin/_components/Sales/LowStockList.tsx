import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { API_URL } from '@/utils/api';
import Papa from 'papaparse';

export default function LowStockList({ items = [] }: { items: any[] }) {
  const t = useTranslations('sales');
  
  const downloadCSV = async () => {
    try {
      const res = await fetch(`${API_URL}/payments/reports/export/lowstock`, { credentials: "include" });
      if (!res.ok) throw new Error();
      const rawData = await res.json();
      
      const csv = Papa.unparse(rawData);
      const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `reporte-bajo-stock.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error("Error al descargar CSV", e);
      alert("Error al descargar el reporte de bajo stock");
    }
  };

  return (
    <div className="bg-[#1a1d24] border border-white/5 rounded-2xl p-6 shadow-1 flex flex-col h-full group relative">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-red-500">
          ⚠️ Alertas de Bajo Stock
        </h3>
        <div className="flex items-center gap-3">
          <button onClick={downloadCSV} className="text-gray-4 hover:text-white p-1 bg-[#0f1115] rounded-md transition-colors" title="Descargar reporte completo en CSV">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          </button>
          <Link href="/admin/products" className="text-[10px] font-black text-blue hover:text-blue-700 uppercase tracking-widest transition-colors flex items-center gap-1">
            IR A PRODUCTOS <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
          </Link>
        </div>
      </div>

      <div className="flex-1">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[160px] text-gray-5">
            <svg className="w-10 h-10 mb-2 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <p className="text-sm">No hay productos con bajo stock</p>
          </div>
        ) : (
          <div className="space-y-0">
            <div className="grid grid-cols-12 gap-4 pb-3 border-b border-white/5 text-xs font-bold text-gray-5 uppercase">
              <div className="col-span-8">Producto</div>
              <div className="col-span-4 text-right">Stock</div>
            </div>
            {items.map((item: any, i: number) => (
              <div key={item.id} className={`grid grid-cols-12 gap-4 py-3 items-center ${i !== items.length - 1 ? 'border-b border-white/5' : ''}`}>
                <div className="col-span-8 flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-[#0f1115] border border-white/5 flex items-center justify-center text-xs font-bold text-gray-4">
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white line-clamp-1">{item.product.name}</p>
                    <p className="text-xs text-gray-4 line-clamp-1">{item.language?.name} • {item.condition?.name}</p>
                  </div>
                </div>
                <div className="col-span-4 text-right">
                  <span className={`inline-flex px-2 py-1 rounded text-xs font-bold ${item.stock === 1 ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                    Quedan {item.stock}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
