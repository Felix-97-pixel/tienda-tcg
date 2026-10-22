"use client";
import React, { useState } from "react";
import { useTranslations } from "next-intl";

// Componentes Extraídos
import OrderTable from "@/app/admin/_components/Orders/OrderTable";
import OrderDetailsModal from "@/app/admin/_components/Orders/OrderDetailsModal";
import { Button } from "@/components/ui/Button";
import {
  IconRefresh,
  IconBox,
  IconCheckCircle,
  IconClock,
} from "@/components/ui/Icons";

// Custom Hook y Tipos
import {
  useAdminOrders,
  STATUS_CLS,
} from "@/app/admin/_components/Orders/hooks/useAdminOrders";
import { Order } from "@/types/order";

export default function AdminOrdersPage() {
  const t = useTranslations("orders");
  const tc = useTranslations("common");

  const {
    orders,
    loading,
    page,
    setPage,
    totalPages,
    deliveryStatus,
    setDeliveryStatus,
    counts,
    refresh,
  } = useAdminOrders();

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const statusLabel = (status: string) => t(`status.${status}` as any) ?? status;

  const tabs = [
    {
      id: "PENDING_DISPATCH",
      label: "Por Despachar",
      count: counts.pendingDispatch,
      icon: <IconClock className="w-3.5 h-3.5 shrink-0" />,
      activeClass: "bg-red-500/10 text-white border-red-500/40 shadow-sm",
    },
    {
      id: "DISPATCHED",
      label: "Despachados / Entregados",
      count: counts.dispatched,
      icon: <IconCheckCircle className="w-3.5 h-3.5 shrink-0 text-emerald-400" />,
      activeClass: "bg-emerald-500/10 text-white border-emerald-500/40 shadow-sm",
    },
    {
      id: "ALL",
      label: "Historial Completo",
      count: counts.totalPaid,
      icon: <IconBox className="w-3.5 h-3.5 shrink-0 text-blue-400" />,
      activeClass: "bg-white/10 text-white border-white/20 shadow-sm",
    },
  ];

  return (
    <div className="p-6 space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {t("title")}
          </h1>
          <p className="text-gray-4 text-xs mt-1">
            Gestión operativa de pedidos pagados y pendientes de despacho de tu tienda.
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={refresh}
          className="flex items-center gap-2"
        >
          <IconRefresh className="w-4 h-4 text-gray-300" />
          <span>{tc("refresh")}</span>
        </Button>
      </div>

      {/* Tabs de Filtro Operativo */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/5 pb-3">
        {tabs.map((tab) => {
          const isActive = deliveryStatus === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setDeliveryStatus(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                isActive
                  ? tab.activeClass
                  : "bg-[#111318] text-gray-400 border-white/5 hover:text-white hover:border-white/10"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              <span
                className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-black ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-white/5 text-gray-400"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tabla Operativa */}
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

      {/* Modal de Detalles y Guía de Armado */}
      <OrderDetailsModal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
        statusClasses={STATUS_CLS}
        statusLabel={statusLabel}
        onRefresh={refresh}
      />
    </div>
  );
}
