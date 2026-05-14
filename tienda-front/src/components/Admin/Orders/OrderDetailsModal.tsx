"use client";
import React from "react";
import { useTranslations } from "next-intl";

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: string;
}

interface Order {
  id: string;
  buyOrder: string;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  totalAmount: string;
  status: string;
  createdAt: string;
  items: OrderItem[];
  payment?: {
    status: string;
    authCode?: string;
  } | null;
}

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  statusClasses: Record<string, string>;
  statusLabel: (status: string) => string;
}

export default function OrderDetailsModal({ isOpen, onClose, order, statusClasses, statusLabel }: OrderDetailsModalProps) {
  const t = useTranslations("orders");
  const tc = useTranslations("common");

  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-[560px] max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-stroke">
          <div>
            <h2 className="font-bold text-dark text-xl">{t("detail.title")} <span className="text-blue">#{order.buyOrder}</span></h2>
            <p className="text-dark-4 text-xs mt-0.5">{order.email}</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-1 text-dark-4 transition-all">✕</button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto space-y-6 scrollbar-hide">
          {/* Summary Card */}
          <div className="bg-gray-1 rounded-2xl p-6 space-y-3 border border-stroke">
            <div className="flex justify-between items-center text-sm">
              <span className="text-dark-4 font-medium">{t("table.customer")}</span>
              <span className="font-bold text-dark">{order.name}</span>
            </div>
            {order.phone && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-dark-4 font-medium">{t("detail.phone")}</span>
                <span className="font-bold text-dark">{order.phone}</span>
              </div>
            )}
            {order.city && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-dark-4 font-medium">{t("detail.city")}</span>
                <span className="font-bold text-dark">{order.city}</span>
              </div>
            )}
            <div className="h-px bg-stroke my-2"></div>
            <div className="flex justify-between items-center">
              <span className="text-dark-4 font-medium">{tc("total")}</span>
              <span className="font-black text-blue text-lg">${parseFloat(order.totalAmount).toLocaleString("es-CL")}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-dark-4 font-medium">{tc("status")}</span>
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${statusClasses[order.status] ?? ""}`}>
                {statusLabel(order.status)}
              </span>
            </div>
            {order.payment?.authCode && (
              <div className="flex justify-between items-center text-sm pt-2 border-t border-stroke border-dashed">
                <span className="text-dark-4 font-medium">{t("detail.authCode")}</span>
                <span className="font-mono font-bold text-dark">{order.payment.authCode}</span>
              </div>
            )}
          </div>

          {/* Products List */}
          <div>
            <h3 className="font-bold text-dark text-sm mb-4 uppercase tracking-widest">{t("detail.products")}</h3>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-4 rounded-xl border border-stroke hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="font-bold text-dark text-sm">{item.productName}</p>
                    <p className="text-blue font-black text-[10px] mt-0.5">{t("detail.quantityCount", { count: item.quantity })}</p>
                  </div>
                  <p className="font-bold text-dark">${(parseFloat(item.unitPrice) * item.quantity).toLocaleString("es-CL")}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-stroke bg-gray-50">
          <button
            onClick={onClose}
            className="w-full rounded-xl bg-dark py-3 font-bold text-white hover:bg-black transition-all active:scale-95 shadow-lg shadow-dark/10"
          >
            {tc("close")}
          </button>
        </div>
      </div>
    </div>
  );
}
