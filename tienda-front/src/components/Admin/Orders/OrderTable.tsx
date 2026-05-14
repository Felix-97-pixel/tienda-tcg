"use client";
import React from "react";
import { useTranslations } from "next-intl";

const LIMIT_PLACEHOLDER = 8;

interface Order {
  id: string;
  buyOrder: string;
  name: string;
  email: string;
  totalAmount: string;
  status: string;
  createdAt: string;
}

interface OrderTableProps {
  orders: Order[];
  loading: boolean;
  statusClasses: Record<string, string>;
  statusLabel: (status: string) => string;
  onViewDetails: (order: Order) => void;
}

export default function OrderTable({ orders, loading, statusClasses, statusLabel, onViewDetails }: OrderTableProps) {
  const t = useTranslations("orders");
  const tc = useTranslations("common");

  return (
    <div className="bg-white rounded-2xl shadow-1 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-1 border-b border-stroke text-left">
              <th className="py-4 px-6 font-bold text-dark-4 text-xs uppercase tracking-wider">{t("table.order")}</th>
              <th className="py-4 px-6 font-bold text-dark-4 text-xs uppercase tracking-wider">{t("table.customer")}</th>
              <th className="py-4 px-6 font-bold text-dark-4 text-xs uppercase tracking-wider hidden xl:table-cell">{t("detail.email")}</th>
              <th className="py-4 px-6 font-bold text-dark-4 text-xs uppercase tracking-wider">{t("table.total")}</th>
              <th className="py-4 px-6 font-bold text-dark-4 text-xs uppercase tracking-wider">{t("table.status")}</th>
              <th className="py-4 px-6 font-bold text-dark-4 text-xs uppercase tracking-wider">{t("table.date")}</th>
              <th className="py-4 px-6 font-bold text-dark-4 text-xs uppercase tracking-wider text-right">{t("table.actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              Array.from({ length: LIMIT_PLACEHOLDER }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={7} className="py-6 px-6"><div className="h-10 bg-gray-2 rounded-xl w-full"></div></td>
                </tr>
              ))
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-20 text-dark-4 font-medium">{tc("noResults")}</td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="group hover:bg-blue/5 transition-colors">
                  <td className="py-4 px-6">
                    <span className="font-mono font-bold text-blue bg-blue/5 px-2 py-1 rounded-lg border border-blue/10">
                      #{order.buyOrder}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <p className="font-bold text-dark">{order.name}</p>
                  </td>
                  <td className="py-4 px-6 hidden xl:table-cell">
                    <p className="text-dark-4 font-medium">{order.email}</p>
                  </td>
                  <td className="py-4 px-6 font-black text-dark">
                    ${parseFloat(order.totalAmount).toLocaleString("es-CL")}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${statusClasses[order.status] ?? ""}`}>
                      {statusLabel(order.status)}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-dark-4 font-medium text-xs">
                    {new Date(order.createdAt).toLocaleDateString("es-CL")}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button 
                      onClick={() => onViewDetails(order)} 
                      className="px-4 py-2 rounded-xl bg-gray-1 text-dark-4 text-xs font-bold hover:bg-blue hover:text-white transition-all active:scale-95 shadow-sm"
                    >
                      {t("detail.title")}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

