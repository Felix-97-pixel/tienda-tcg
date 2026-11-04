"use client";
import { useState, useEffect, useCallback } from "react";
import { adminFetch } from "@/utils/api";
import { useActiveBranch } from "@/hooks/useActiveBranch";
import { useToast } from "@/hooks/useToast";

export function useCurrencies() {
  const { showToast } = useToast();
  const { activeBranchId, branchName } = useActiveBranch();

  const [exchangeRates, setExchangeRates] = useState<any[]>([]);
  const [globalCurrencies, setGlobalCurrencies] = useState<any[]>([]);
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [ratesRes, currRes, gamesRes] = await Promise.all([
        adminFetch("/stores/me/exchange-rates", {}, activeBranchId),
        adminFetch("/currencies", {}, activeBranchId),
        adminFetch("/games", {}, activeBranchId),
      ]);

      if (ratesRes.ok) {
        const data = await ratesRes.json();
        setExchangeRates(Array.isArray(data) ? data : []);
      } else {
        console.error("Error al obtener tasas de la sucursal:", ratesRes.status);
        setExchangeRates([]);
      }

      if (currRes.ok) {
        const data = await currRes.json();
        setGlobalCurrencies(Array.isArray(data) ? data : []);
      }

      if (gamesRes.ok) {
        const data = await gamesRes.json();
        setGames(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Error fetching currencies data:", err);
      showToast("Error al cargar tasas de cambio", "error");
    } finally {
      setLoading(false);
    }
  }, [activeBranchId, showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const deleteExchangeRate = async (rate: any) => {
    if (!confirm(`¿Seguro que deseas eliminar la tasa de cambio personalizada para ${rate.game?.name || "este juego"}?`)) {
      return false;
    }

    try {
      const res = await adminFetch(
        `/stores/me/exchange-rates/${rate.id}`,
        { method: "DELETE" },
        activeBranchId
      );

      if (res.ok) {
        showToast("Tasa de cambio eliminada correctamente", "success");
        await fetchData();
        return true;
      } else {
        const errData = await res.json().catch(() => ({}));
        showToast(errData.message || "Error al eliminar tasa", "error");
        return false;
      }
    } catch (e) {
      showToast("Error de conexión al eliminar tasa", "error");
      return false;
    }
  };

  return {
    exchangeRates,
    globalCurrencies,
    games,
    loading,
    branchName,
    activeBranchId,
    refresh: fetchData,
    deleteExchangeRate,
  };
}
