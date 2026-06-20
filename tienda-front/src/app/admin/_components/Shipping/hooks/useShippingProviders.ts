"use client";
import { useState, useEffect, useCallback } from "react";
import { API_URL } from "@/utils/api";
import { useToast } from "@/hooks/useToast";
import { ShippingProvider } from "@/types/shippingProvider";

export function useShippingProviders() {
  const { showToast } = useToast();

  const [providers, setProviders] = useState<ShippingProvider[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProviders = useCallback(() => {
    setLoading(true);
    fetch(`${API_URL}/shipping/providers/all`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setProviders(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching shipping providers:", err);
        showToast("Error al cargar proveedores de envío", "error");
        setLoading(false);
      });
  }, [showToast]);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  return {
    providers,
    loading,
    refresh: fetchProviders,
  };
}
