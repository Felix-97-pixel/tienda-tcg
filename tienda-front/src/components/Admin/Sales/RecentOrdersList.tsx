"use client";
import React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { List, Column } from "@/components/ui/List";

interface RecentOrder {
  id: string;
  buyOrder: string;
  name: string;
  totalAmount: string;
  createdAt: string;
}

interface RecentOrdersListProps {
  orders: RecentOrder[];
}

export default function RecentOrdersList({ orders }: RecentOrdersListProps) {
  const t = useTranslations("sales");
  const tc = useTranslations("common");
  const to = useTranslations("orders");

  const columns: Column<RecentOrder>[] = [
    {
      key: "order",
      header: to("table.order"),
      render: (order) => (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gray-1 flex items-center justify-center text-dark-4 group-hover:bg-blue/10 group-hover:text-blue transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
          </div>
          <div>
            <p className="text-sm font-bold text-dark leading-tight">{order.name}</p>
            <p className="text-[10px] text-dark-4 font-black uppercase mt-1 tracking-tighter">ORDEN #{order.buyOrder}</p>
          </div>
        </div>
      ),
    },
    {
      key: "total",
      header: to("table.total"),
      headerClassName: "text-right",
      cellClassName: "text-right",
      render: (order) => (
        <div>
          <p className="text-sm font-black text-dark">${parseFloat(order.totalAmount).toLocaleString("es-CL")}</p>
          <p className="text-[10px] text-dark-4 font-bold mt-1">
            {new Date(order.createdAt).toLocaleDateString("es-CL", { 
              day: "2-digit", 
              month: "short", 
              hour: "2-digit", 
              minute: "2-digit" 
            }).toUpperCase()}
          </p>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-1 overflow-hidden border border-transparent hover:border-stroke transition-colors h-full flex flex-col">
      <div className="flex items-center justify-between px-6 py-5 border-b border-stroke bg-gray-50/50 shrink-0">
        <h2 className="font-black text-dark text-sm uppercase tracking-widest flex items-center gap-2">
          <span className="text-xl">🕐</span> {t("charts.revenueTitle")}
        </h2>
        <Link href="/admin/orders" className="text-[10px] font-black text-blue hover:text-blue-700 uppercase tracking-widest transition-colors flex items-center gap-1">
          {to("title")} <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
        </Link>
      </div>

      <div className="flex-1 overflow-auto">
        <List
          columns={columns}
          data={orders}
          keyExtractor={(order) => order.id}
          wrapperProps={{ className: "shadow-none rounded-none border-none" }}
        />
      </div>
    </div>
  );
}
