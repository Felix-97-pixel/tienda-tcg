"use client";
import React from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Order } from "@/types/order";

export interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  statusClasses: Record<string, string>;
  statusLabel: (status: string) => string;
}

export default function OrderDetailsModal({ isOpen, onClose, order, statusClasses, statusLabel }: OrderDetailsModalProps) {
  const t = useTranslations("orders");
  const tc = useTranslations("common");

  const formatMoney = (val: string) => `$${parseFloat(val).toLocaleString("es-CL")}`;

  if (!isOpen || !order) return null;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title={`${t("detail.title")} #${order?.buyOrder}`}
      maxWidth="xl"
    >
        {/* Content */}
        <div className="space-y-6">
          {/* Summary Card */}
          <div className="bg-gray-1 rounded-2xl p-6 space-y-3 border border-stroke">
            <div className="flex justify-between items-center text-sm">
               <span className="text-dark-4 font-medium">{t("table.customer")}</span>
               <span className="font-bold text-dark">{order?.name}</span>
            </div>
            {order?.email && (
              <div className="flex justify-between items-center text-sm">
                 <span className="text-dark-4 font-medium">Email</span>
                 <span className="font-bold text-dark">{order.email}</span>
              </div>
            )}
            {order?.phone && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-dark-4 font-medium">{t("detail.phone")}</span>
                <span className="font-bold text-dark">{order.phone}</span>
              </div>
            )}
            {order?.city && (
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
        <div className="mt-8 flex justify-end">
          <Button
            onClick={onClose}
            variant="secondary"
          >
            {tc("close")}
          </Button>
        </div>
    </Modal>
  );
}
