"use client";
import { useState, useEffect, useCallback } from "react";
import { API_URL } from "@/utils/api";
import { TcgSet, ExpansionMeta, SyncProgress } from "@/types/tcg";
import { useToast } from "@/hooks/useToast";

export function useTcgSync(game: string, defaultCategory: string) {
  const { showToast } = useToast();
  const [sets, setSets] = useState<TcgSet[]>([]);
  const [expansionsList, setExpansionsList] = useState<ExpansionMeta[]>([]);
  const [selectedSetId, setSelectedSetId] = useState("");
  const [selectedExpansion, setSelectedExpansion] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<SyncProgress>({ current: 0, total: 0, active: false });

  // Cargar expansiones locales y sets externos
  const refreshData = useCallback(async () => {
    if (!defaultCategory) return;
    const cat = encodeURIComponent(defaultCategory);
    
    // Lista de expansiones en BD local
    fetch(`${API_URL}/products/meta/expansions?category=${cat}`)
      .then(r => r.json())
      .then(d => setExpansionsList(Array.isArray(d) ? d : []));

    // Lista de sets disponibles en el proveedor
    fetch(`${API_URL}/sync/${game}-sets`, { credentials: "include" })
      .then(r => r.json())
      .then(data => {
        const normalized: TcgSet[] = (Array.isArray(data) ? data : []).map(s => ({
          id: game === 'magic' ? s.code.toLowerCase() : s.id,
          name: s.name,
          releaseDate: s.releaseDate || s.release_date
        }));
        setSets(normalized);
        if (normalized.length > 0) setSelectedSetId(normalized[0].id);
      });
  }, [game, defaultCategory]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Polling de estado
  const startPolling = useCallback(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/price-updater/status/${game}`, { credentials: "include" });
        const data = await res.json();
        setProgress(data);
        if (!data.active) {
          clearInterval(interval);
          // Forzar 100% visualmente antes de limpiar
          setProgress({ current: data.total, total: data.total, active: false });
          refreshData();
          setTimeout(() => {
            setProgress({ current: 0, total: 0, active: false });
          }, 2500);
        }
      } catch {
        clearInterval(interval);
      }
    }, 2000);
  }, [game, refreshData]);

  // Verificar estado al cargar (Persistencia)
  useEffect(() => {
    fetch(`${API_URL}/price-updater/status/${game}`, { credentials: "include" })
      .then(r => r.json())
      .then(data => {
        if (data.active) {
          setProgress(data);
          startPolling();
        }
      });
  }, [game, startPolling]);

  // Ejecutar Sincronización de Precios
  const syncPrices = async () => {
    if (!selectedExpansion) return;
    setLoading(true);
    try {
      const endpoint = game === 'magic' ? 'sync-set' : `sync-${game}`;
      const res = await fetch(`${API_URL}/price-updater/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expansion: selectedExpansion }),
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message, "success");
        startPolling();
      } else {
        showToast(data.error, "error");
      }
    } catch {
      showToast("Error de red", "error");
    } finally {
      setLoading(false);
    }
  };

  // Importar Set Completo
  const syncSet = async () => {
    if (!selectedSetId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/sync/set`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ game: defaultCategory, setId: selectedSetId }),
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message, "success");
        refreshData();
      } else {
        showToast(data.error, "error");
      }
    } catch {
      showToast("Error de red", "error");
    } finally {
      setLoading(false);
    }
  };

  return {
    sets,
    expansionsList,
    selectedSetId,
    setSelectedSetId,
    selectedExpansion,
    setSelectedExpansion,
    loading,
    progress,
    syncPrices,
    syncSet
  };
}
