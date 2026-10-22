"use client";
import { useState, useEffect, useCallback } from "react";
import { API_URL } from "@/utils/api";
import { Order } from "@/types/order";

export const STATUS_CLS: Record<string, string> = {
  PENDING:   "bg-amber-500/15 text-amber-400 border border-amber-500/30",
  PAID:      "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
  FAILED:    "bg-red-500/15 text-red-400 border border-red-500/30",
  CANCELLED: "bg-white/5 text-white/50 border border-white/10",
  REFUNDED:  "bg-purple-500/15 text-purple-400 border border-purple-500/30",
};

export interface OrderCounts {
  pendingDispatch: number;
  dispatched: number;
  totalPaid: number;
}

export function useAdminOrders(limit: number = 15) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deliveryStatus, setDeliveryStatus] = useState<string>("PENDING_DISPATCH");
  const [counts, setCounts] = useState<OrderCounts>({
    pendingDispatch: 0,
    dispatched: 0,
    totalPaid: 0,
  });

  const fetchOrders = useCallback(async (p: number, dStatus: string) => {
    setLoading(true);
    try {
      const url = `${API_URL}/payments/orders?page=${p}&limit=${limit}&status=PAID${
        dStatus && dStatus !== "ALL" ? `&deliveryStatus=${dStatus}` : ""
      }`;
      const res = await fetch(url, {
        credentials: "include",
        headers: { "x-auth-scope": "admin" },
      });
      if (!res.ok) throw new Error("No autorizado");
      const data = await res.json();
      setOrders(data.orders || []);
      setTotal(data.total || 0);
      if (data.counts) {
        setCounts(data.counts);
      }
    } catch (err) {
      console.error("Error fetching orders", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => { 
    fetchOrders(page, deliveryStatus); 
  }, [page, deliveryStatus, fetchOrders]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const changeDeliveryStatus = (newStatus: string) => {
    setPage(1);
    setDeliveryStatus(newStatus);
  };

  return {
    orders,
    loading,
    page,
    setPage,
    totalPages,
    deliveryStatus,
    setDeliveryStatus: changeDeliveryStatus,
    counts,
    refresh: () => fetchOrders(page, deliveryStatus),
  };
}
