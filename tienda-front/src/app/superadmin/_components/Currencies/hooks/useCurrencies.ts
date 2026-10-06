"use client";
import { useState, useEffect, useCallback } from "react";
import { API_URL } from "@/utils/api";
import { useToast } from "@/hooks/useToast";

export function useCurrencies() {
  const { showToast } = useToast();

  const [exchangeRates, setExchangeRates] = useState<any[]>([]);
  const [globalCurrencies, setGlobalCurrencies] = useState<any[]>([]);
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [ratesRes, currRes, gamesRes] = await Promise.all([
        fetch(`${API_URL}/currencies`, { credentials: "include" }),
        fetch(`${API_URL}/currencies/supported`),
        fetch(`${API_URL}/games`)
      ]);
      
      if (ratesRes.ok) setExchangeRates(await ratesRes.json());
      if (currRes.ok) setGlobalCurrencies(await currRes.json());
      if (gamesRes.ok) setGames(await gamesRes.json());
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const deleteExchangeRate = async (rate: any) => {
    if (!confirm(`¿Seguro que deseas eliminar la tasa de cambio para ${rate.game?.name}?`)) return false;
    try {
      const res = await fetch(`${API_URL}/currencies/${rate.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        showToast("Tasa de cambio eliminada", "success");
        fetchData();
        return true;
      } else {
        const errData = await res.json();
        showToast(errData.message || "Error al eliminar tasa", "error");
        return false;
      }
    } catch (e) {
      showToast("Error de red", "error");
      return false;
    }
  };

  return {
    exchangeRates,
    globalCurrencies,
    games,
    loading,
    refresh: fetchData,
    deleteExchangeRate,
  };
}
