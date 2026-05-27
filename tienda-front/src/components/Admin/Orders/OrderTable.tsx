"use client";
import React from "react";
import { useTranslations } from "next-intl";
import { List, Column } from "@/components/ui/List";
import { Button } from "@/components/ui/Button";
import { Order } from "@/types/order";

export interface OrderTableProps {
  orders: Order[];
  loading: boolean;
  statusClasses: Record<string, string>;
  statusLabel: (status: string) => string;
  onViewDetails: (order: Order) => void;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

const LIMIT_PLACEHOLDER = 8;

export default function OrderTable({ orders, loading, statusClasses, statusLabel, onViewDetails, page, totalPages, onPageChange }: OrderTableProps) {
  const t = useTranslations("orders");
  const tc = useTranslations("common");

  const columns: Column<Order>[] = [
    {
      key: "order",
      header: t("table.order"),
      render: (order) => (
        <span className="font-mono font-bold text-blue bg-blue/5 px-2 py-1 rounded-lg border border-blue/10">
          #{order.buyOrder}
        </span>
      ),
    },
    {
      key: "customer",
      header: t("table.customer"),
      render: (order) => (
        <p className="font-bold text-dark">{order.name}</p>
      ),
    },
    {
      key: "email",
      header: t("detail.email"),
      headerClassName: "hidden xl:table-cell",
      cellClassName: "hidden xl:table-cell",
      render: (order) => (
        <p className="text-dark-4 font-medium">{order.email}</p>
      ),
    },
    {
      key: "total",
      header: t("table.total"),
      cellClassName: "font-black text-dark",
      render: (order) => (
        `$${parseFloat(order.totalAmount).toLocaleString("es-CL")}`
      ),
    },
    {
      key: "status",
      header: t("table.status"),
      render: (order) => (
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${statusClasses[order.status] ?? ""}`}>
          {statusLabel(order.status)}
        </span>
      ),
    },
    {
      key: "date",
      header: t("table.date"),
      cellClassName: "text-dark-4 font-medium text-xs",
      render: (order) => (
        new Date(order.createdAt).toLocaleDateString("es-CL")
      ),
    },
    {
      key: "actions",
      header: t("table.actions"),
      headerClassName: "text-right",
      cellClassName: "text-right",
      render: (order) => (
        <Button 
          size="sm"
          variant="secondary"
          onClick={() => onViewDetails(order)} 
        >
          {t("detail.title")}
        </Button>
      ),
    },
  ];

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
    />
  );
}
