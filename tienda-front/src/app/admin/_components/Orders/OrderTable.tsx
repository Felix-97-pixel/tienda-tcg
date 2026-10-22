"use client";
import React from "react";
import { useTranslations } from "next-intl";
import { List, Column } from "@/components/ui/List";
import { Button } from "@/components/ui/Button";
import { Order } from "@/types/order";
import { ShippingBadge } from "@/components/ui/ShippingBadge";
import { IconCheckCircle, IconClock } from "@/components/ui/Icons";

export interface OrderTableProps {
  orders: Order[];
  loading: boolean;
  statusClasses: Record<string, string>;
  statusLabel: (status: string) => string;
  onViewDetails: (order: Order) => void;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  emptyMessage?: React.ReactNode;
}

const LIMIT_PLACEHOLDER = 8;

export default function OrderTable({
  orders,
  loading,
  statusClasses,
  statusLabel,
  onViewDetails,
  page,
  totalPages,
  onPageChange,
  emptyMessage,
}: OrderTableProps) {
  const t = useTranslations("orders");

  const columns: Column<Order>[] = [
    {
      key: "order",
      header: t("table.order"),
      render: (order) => (
        <span className="font-mono font-bold text-red-light bg-red/10 px-2.5 py-1 rounded-lg border border-red/20 text-xs">
          #{order.buyOrder}
        </span>
      ),
    },
    {
      key: "customer",
      header: t("table.customer"),
      render: (order) => (
        <div>
          <p className="font-bold text-white text-xs">{order.name}</p>
          <p className="text-[11px] text-gray-400 font-medium">{order.email}</p>
        </div>
      ),
    },
    {
      key: "shippingMethod",
      header: "Método de Envío",
      render: (order) => {
        const vo = order.vendorOrders?.[0];
        const carrierRaw = (
          vo?.shippingProvider?.name ||
          vo?.shippingCourier ||
          "STARKEN"
        ).toUpperCase();
        const isPickup = carrierRaw.includes("RETIRO");
        const badgeName = isPickup
          ? "retiro"
          : carrierRaw.includes("CHILE")
          ? "chilexpress"
          : carrierRaw.includes("BLUE")
          ? "blue_express"
          : carrierRaw.includes("CORREO")
          ? "correos_chile"
          : "starken";

        return (
          <div className="flex items-center gap-2">
            <ShippingBadge name={badgeName} size="sm" />
            <span className="text-xs font-semibold text-gray-300 hidden md:inline">
              {isPickup
                ? "Retiro en Local"
                : carrierRaw.includes("CHILE")
                ? "Chilexpress"
                : carrierRaw.includes("BLUE")
                ? "Blue Express"
                : carrierRaw.includes("CORREO")
                ? "Correos"
                : "Starken"}
            </span>
          </div>
        );
      },
    },
    {
      key: "total",
      header: t("table.total"),
      cellClassName: "font-black text-white",
      render: (order) => {
        const storeTotal =
          order.vendorOrders && order.vendorOrders.length > 0
            ? order.vendorOrders.reduce(
                (sum, vo) =>
                  sum +
                  (parseFloat(vo.subtotal as any) || 0) +
                  (parseFloat(vo.shippingCost as any) || 0),
                0
              )
            : parseFloat(order.totalAmount);
        return `$${storeTotal.toLocaleString("es-CL")}`;
      },
    },
    {
      key: "deliveryStatus",
      header: "Estado de Envío",
      render: (order) => {
        const vo = order.vendorOrders?.[0];
        const isDispatched = vo?.deliveryStatus === "DISPATCHED";
        const carrierRaw = (
          vo?.shippingProvider?.name ||
          vo?.shippingCourier ||
          ""
        ).toUpperCase();
        const isPickup = carrierRaw.includes("RETIRO");

        if (isDispatched) {
          return (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 inline-flex items-center gap-1.5">
              <IconCheckCircle className="w-3 h-3 text-emerald-400 shrink-0" />
              <span>{isPickup ? "Entregado" : "Despachado"}</span>
            </span>
          );
        }

        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30 inline-flex items-center gap-1.5">
            <IconClock className="w-3 h-3 text-amber-400 shrink-0" />
            <span>{isPickup ? "Por Entregar" : "Por Despachar"}</span>
          </span>
        );
      },
    },
    {
      key: "date",
      header: t("table.date"),
      cellClassName: "text-gray-4 font-medium text-xs",
      render: (order) => new Date(order.createdAt).toLocaleDateString("es-CL"),
    },
    {
      key: "actions",
      header: t("table.actions"),
      headerClassName: "text-right",
      cellClassName: "text-right",
      render: (order) => (
        <Button size="sm" variant="secondary" onClick={() => onViewDetails(order)}>
          {t("detail.title")}
        </Button>
      ),
    },
  ];

  const defaultEmptyState = (
    <div className="py-12 flex flex-col items-center justify-center space-y-2 text-center">
      <IconCheckCircle className="w-10 h-10 text-emerald-400/80 mb-1" />
      <p className="text-white font-bold text-base">¡Todo al día!</p>
      <p className="text-gray-400 text-xs max-w-sm">
        No hay pedidos pendientes en esta sección.
      </p>
    </div>
  );

  return (
    <List
      columns={columns}
      data={orders}
      loading={loading}
      loadingItemsCount={LIMIT_PLACEHOLDER}
      wrapperProps={{ className: "text-sm" }}
      keyExtractor={(order) => order.id}
      page={page}
      totalPages={totalPages}
      onPageChange={onPageChange}
      emptyMessage={emptyMessage || defaultEmptyState}
    />
  );
}
