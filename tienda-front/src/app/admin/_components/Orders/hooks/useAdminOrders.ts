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

export function useAdminOrders(limit: number = 15) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/payments/orders?page=${p}&limit=${limit}`, { credentials: "include" });
      if (!res.ok) throw new Error("No autorizado");
      const data = await res.json();
      setOrders(data.orders);
      setTotal(data.total);
    } catch (err) {
      console.error("Error fetching orders", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => { 
    fetchOrders(page); 
  }, [page, fetchOrders]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return {
    orders,
    loading,
    page,
    setPage,
    totalPages,
    refresh: () => fetchOrders(page),
  };
}
