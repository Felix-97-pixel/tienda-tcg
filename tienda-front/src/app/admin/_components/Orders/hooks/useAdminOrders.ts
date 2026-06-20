"use client";
import { useState, useEffect, useCallback } from "react";
import { API_URL } from "@/utils/api";
import { Order } from "@/types/order";

export const STATUS_CLS: Record<string, string> = {
  PENDING:   "bg-yellow-100 text-yellow-700 border border-yellow-200",
  PAID:      "bg-green-100 text-green-700 border border-green-200",
  FAILED:    "bg-red-100 text-red-700 border border-red-200",
  CANCELLED: "bg-[#111318]00 text-gray-600 border border-white/500",
  REFUNDED:  "bg-purple-100 text-purple-700 border border-purple-200",
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
