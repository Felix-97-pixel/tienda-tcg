"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { API_URL } from "@/utils/api";

// Componentes Extraídos
import OrderTable from "@/components/Admin/Orders/OrderTable";
import OrderDetailsModal from "@/components/Admin/Orders/OrderDetailsModal";
import { Button } from "@/components/ui/Button";
import { useAppSelector } from "@/redux/store";
import UpsellBanner from "@/components/Admin/UpsellBanner";

const STATUS_CLS: Record<string, string> = {
  PENDING:   "bg-yellow-100 text-yellow-700 border border-yellow-200",
  PAID:      "bg-green-100 text-green-700 border border-green-200",
  FAILED:    "bg-red-100 text-red-700 border border-red-200",
  CANCELLED: "bg-[#111318]00 text-gray-600 border border-white/500",
  REFUNDED:  "bg-purple-100 text-purple-700 border border-purple-200",
};

export default function AdminOrdersPage() {
  const t = useTranslations("orders");
  const tc = useTranslations("common");

  const [orders, setOrders] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  
  const LIMIT = 15;

  const fetchOrders = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/payments/orders?page=${p}&limit=${LIMIT}`, { credentials: "include" });
      if (!res.ok) throw new Error("No autorizado");
      const data = await res.json();
      setOrders(data.orders);
      setTotal(data.total);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const { features } = useAppSelector((state) => state.authReducer);

  useEffect(() => { 
    if (features.includes("module:statistics")) {
      fetchOrders(page); 
    }
  }, [page, fetchOrders, features]);

  if (!features.includes("module:statistics")) {
    return (
      <div className="p-6 pb-24">
        <UpsellBanner featureName="Órdenes e Historial" />
      </div>
    );
  }

  const totalPages = Math.ceil(total / LIMIT);
  const statusLabel = (status: string) => t(`status.${status}` as any) ?? status;

  return (
    <div className="p-6 space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{t("title")}</h1>
          <p className="text-gray-4 text-sm mt-1">{t("subtitle")}</p>
        </div>
        <Button
          variant="secondary"
          onClick={() => fetchOrders(page)}
          leftIcon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
          }
        >
          {tc("refresh")}
        </Button>
      </div>

      {/* Tabla */}
      <OrderTable 
        orders={orders}
        loading={loading}
        statusClasses={STATUS_CLS}
        statusLabel={statusLabel}
        onViewDetails={setSelectedOrder}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      {/* Modal Detalles */}
      <OrderDetailsModal 
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
        statusClasses={STATUS_CLS}
        statusLabel={statusLabel}
      />
    </div>
  );
}
