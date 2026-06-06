"use client";
import React from "react";
import { useTranslations } from "next-intl";
import { List, Column } from "@/components/ui/List";
import { TopProduct } from "@/types/adminSale";

export interface TopProductsListProps {
  products: TopProduct[];
}

export default function TopProductsList({ products }: TopProductsListProps) {
  const t = useTranslations("sales");
  const to = useTranslations("orders");
  const tp = useTranslations("products");

  const columns: Column<TopProduct>[] = [
    {
      key: "product",
      header: tp("table.product"),
      render: (product) => {
        const index = products.findIndex(p => p.productId === product.productId);
        const rankColors = [
          "bg-yellow-400 text-white shadow-lg shadow-yellow-400/20",
          "bg-slate-400 text-white shadow-lg shadow-slate-400/20",
          "bg-orange-400 text-white shadow-lg shadow-orange-400/20"
        ];
        return (
          <div className="flex items-center gap-3 min-w-0">
            <span className={`w-7 h-7 flex-shrink-0 rounded-xl flex items-center justify-center text-xs font-black transition-transform group-hover:scale-110 ${rankColors[index] || "bg-[#111318]00 text-gray-4"}`}>
              {index + 1}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate leading-tight">{product.productName}</p>
              <p className="text-[10px] text-gray-4 font-bold uppercase tracking-tighter mt-0.5">{product.timesOrdered} {to("title")}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: "units",
      header: t("charts.unitsSold"),
      headerClassName: "text-right",
      cellClassName: "text-right w-1/3",
      render: (product) => {
        const index = products.findIndex(p => p.productId === product.productId);
        const maxUnits = products[0]?.totalUnits || 1;
        const barWidth = maxUnits > 0 ? (product.totalUnits / maxUnits) * 100 : 0;
        
        return (
          <div className="flex flex-col items-end gap-1.5 w-full">
            <p className="text-sm font-black text-blue">{product.totalUnits} UDS</p>
            <div className="h-1.5 bg-[#111318] rounded-full overflow-hidden border border-stroke/50 w-full max-w-[100px]">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ease-out shadow-inner ${index === 0 ? "bg-yellow-400" : "bg-blue"}`} 
                style={{ width: `${barWidth}%` }} 
              />
            </div>
          </div>
        );
      },
    }
  ];

  return (
    <div className="bg-[#1a1d24] rounded-2xl shadow-1 overflow-hidden border border-transparent hover:border-stroke transition-colors h-full flex flex-col">
      <div className="flex items-center justify-between px-6 py-5 border-b border-stroke bg-gray-50/50 shrink-0">
        <h2 className="font-black text-white text-sm uppercase tracking-widest flex items-center gap-2">
          <span className="text-xl">🏆</span> {t("charts.topProductsTitle")}
        </h2>
      </div>
      
      <div className="flex-1 overflow-auto">
        <List
          columns={columns}
          data={products}
          keyExtractor={(product) => product.productId}
          wrapperProps={{ className: "shadow-none rounded-none border-none" }}
        />
      </div>
    </div>
  );
}
