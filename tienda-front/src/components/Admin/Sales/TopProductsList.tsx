"use client";
import React from "react";
import { useTranslations } from "next-intl";

interface TopProduct {
  productId: string;
  productName: string;
  totalUnits: number;
  timesOrdered: number;
}

interface TopProductsListProps {
  products: TopProduct[];
}

export default function TopProductsList({ products }: TopProductsListProps) {
  const t = useTranslations("sales");
  const tc = useTranslations("common");
  const to = useTranslations("orders");

  return (
    <div className="bg-white rounded-2xl shadow-1 overflow-hidden border border-transparent hover:border-stroke transition-colors h-full">
      <div className="flex items-center justify-between px-6 py-5 border-b border-stroke bg-gray-50/50">
        <h2 className="font-black text-dark text-sm uppercase tracking-widest flex items-center gap-2">
          <span className="text-xl">🏆</span> {t("charts.topProductsTitle")}
        </h2>
        <span className="text-[10px] font-black text-dark-4 uppercase">{t("charts.unitsSold")}</span>
      </div>
      
      {products.length === 0 ? (
        <div className="p-12 text-center text-dark-4 text-sm font-bold uppercase tracking-widest">{tc("noResults")}</div>
      ) : (
        <div className="divide-y divide-gray-100">
          {products.map((product, index) => {
            const maxUnits = products[0].totalUnits;
            const barWidth = maxUnits > 0 ? (product.totalUnits / maxUnits) * 100 : 0;
            const rankColors = [
              "bg-yellow-400 text-white shadow-lg shadow-yellow-400/20",
              "bg-slate-400 text-white shadow-lg shadow-slate-400/20",
              "bg-orange-400 text-white shadow-lg shadow-orange-400/20"
            ];

            return (
              <div key={product.productId} className="px-6 py-5 group hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`w-7 h-7 flex-shrink-0 rounded-xl flex items-center justify-center text-xs font-black transition-transform group-hover:scale-110 ${rankColors[index] || "bg-gray-100 text-dark-4"}`}>
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-dark truncate leading-tight">{product.productName}</p>
                      <p className="text-[10px] text-dark-4 font-bold uppercase tracking-tighter mt-0.5">{product.timesOrdered} {to("title")}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-black text-blue">{product.totalUnits} UDS</p>
                  </div>
                </div>
                <div className="h-2 bg-gray-1 rounded-full overflow-hidden border border-stroke/50">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ease-out shadow-inner ${index === 0 ? "bg-yellow-400" : "bg-blue"}`} 
                    style={{ width: `${barWidth}%` }} 
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
