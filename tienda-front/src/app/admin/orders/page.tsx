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
import SegmentedControl from "@/components/ui/SegmentedControl";

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
      <div className="flex border-b border-white/5 pb-3">
        <SegmentedControl
          fullWidth={false}
          value={deliveryStatus}
          onChange={(val) => setDeliveryStatus(val)}
          options={[
            {
              value: "PENDING_DISPATCH",
              label: "Por Despachar",
              count: counts.pendingDispatch,
              icon: <IconClock className="w-3.5 h-3.5 shrink-0" />,
              variant: "default",
            },
            {
              value: "DISPATCHED",
              label: "Despachados / Entregados",
              count: counts.dispatched,
              icon: <IconCheckCircle className="w-3.5 h-3.5 shrink-0 text-emerald-300" />,
              variant: "success",
            },
            {
              value: "ALL",
              label: "Historial Completo",
              count: counts.totalPaid,
              icon: <IconBox className="w-3.5 h-3.5 shrink-0 text-blue-300" />,
              variant: "neutral",
            },
          ]}
        />
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
