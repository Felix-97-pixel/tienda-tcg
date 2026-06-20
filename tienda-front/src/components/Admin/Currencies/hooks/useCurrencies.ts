"use client";
import { useState, useEffect, useCallback } from "react";
import { API_URL } from "@/utils/api";
import { useToast } from "@/hooks/useToast";
import { Currency } from "@/types/currency";

export function useCurrencies() {
  const { showToast } = useToast();

  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);
  
  const fetchCurrencies = useCallback(() => {
    setLoading(true);
    fetch(`${API_URL}/currencies`)
      .then((res) => res.json())
      .then((data) => {
        setCurrencies(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching currencies:", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchCurrencies();
  }, [fetchCurrencies]);

  const deleteCurrency = async (currency: Currency) => {
    if (!confirm(`¿Seguro que deseas eliminar la divisa ${currency.code}?`)) return false;
    try {
      const res = await fetch(`${API_URL}/currencies/${currency.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        showToast("Divisa eliminada", "success");
        fetchCurrencies();
        return true;
      } else {
        const errData = await res.json();
        showToast(errData.message || "Error al eliminar divisa", "error");
        return false;
      }
    } catch (e) {
      showToast("Error de red", "error");
      return false;
    }
  };

  return {
    currencies,
    loading,
    refresh: fetchCurrencies,
    deleteCurrency,
  };
}
