"use client";
import { useState, useEffect, useCallback, useRef } from "react";
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
  
  // Estados de progreso independientes
  const [priceProgress, setPriceProgress] = useState<SyncProgress>({ current: 0, total: 0, active: false });
  const [importProgress, setImportProgress] = useState<SyncProgress>({ current: 0, total: 0, active: false });

  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const prevImportActiveRef = useRef(false);
  const prevPriceActiveRef = useRef(false);

  // Limpiar polling al desmontar o cambiar de juego
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [game]);

  // Cargar expansiones locales y sets externos
  const refreshData = useCallback(async () => {
    if (!defaultCategory) return;
    const cat = encodeURIComponent(defaultCategory);
    
    // Lista de expansiones en BD local
    fetch(`${API_URL}/products/meta/expansions?category=${cat}`)
      .then(r => r.json())
      .then(d => setExpansionsList(Array.isArray(d) ? d : []))
      .catch(() => setExpansionsList([]));

    // Lista de sets disponibles en el proveedor
    fetch(`${API_URL}/sync/${game}-sets`, { credentials: "include" })
      .then(r => r.json())
      .then(data => {
        const normalized: TcgSet[] = (Array.isArray(data) ? data : [])
          .map(s => ({
            id: game === 'magic' ? (s.code?.toLowerCase() || s.id) : (s.id || s.code || ''),
            name: s.name || '',
            releaseDate: s.releaseDate || s.release_date
          }))
          .filter(s => Boolean(s.id));
        setSets(normalized);
        if (normalized.length > 0) {
          setSelectedSetId(prev => prev || normalized[0].id);
        }
      })
      .catch(() => setSets([]));
  }, [game, defaultCategory]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Polling unificado para progreso
  const startPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }

    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/sync/status/${game}`, { credentials: "include" });
        const data = await res.json();
        
        const importData: SyncProgress = data?.import || { current: 0, total: 0, active: false };
        const priceData: SyncProgress = data?.price || { current: 0, total: 0, active: false };

        const wasImportActive = prevImportActiveRef.current;
        const wasPriceActive = prevPriceActiveRef.current;

        prevImportActiveRef.current = !!importData.active;
        prevPriceActiveRef.current = !!priceData.active;

        setImportProgress(importData);
        setPriceProgress(priceData);

        // Disparar toasts fuera del updater de estado para evitar colisiones en render de React
        if (wasImportActive && !importData.active) {
          showToast("Catálogo sincronizado exitosamente", "success");
        }
        if (wasPriceActive && !priceData.active) {
          showToast("Precios actualizados exitosamente", "success");
        }
        
        if (!importData.active && !priceData.active) {
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
          }
          refreshData();
          
          setTimeout(() => {
            setImportProgress({ current: 0, total: 0, active: false });
            setPriceProgress({ current: 0, total: 0, active: false });
          }, 3500);
        }
      } catch {
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
      }
    }, 2000);
  }, [game, refreshData, showToast]);

  // Verificar estados al cargar (Persistencia)
  useEffect(() => {
    fetch(`${API_URL}/sync/status/${game}`, { credentials: "include" })
      .then(r => r.json())
      .then(data => {
        if (!data) return;
        const imp = data.import || { current: 0, total: 0, active: false };
        const pri = data.price || { current: 0, total: 0, active: false };
        prevImportActiveRef.current = !!imp.active;
        prevPriceActiveRef.current = !!pri.active;
        setImportProgress(imp);
        setPriceProgress(pri);
        if (imp.active || pri.active) {
          startPolling();
        }
      })
      .catch(() => {});
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
        showToast(data.message || "Operación iniciada", "success");
        startPolling();
      } else {
        const errMsg = data.error || (Array.isArray(data.message) ? data.message[0] : data.message) || "Ocurrió un error";
        showToast(errMsg, "error");
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
        showToast(data.message || "Importación iniciada", "success");
        startPolling();
      } else {
        const errMsg = data.error || (Array.isArray(data.message) ? data.message[0] : data.message) || "Ocurrió un error";
        showToast(errMsg, "error");
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
    priceProgress,
    importProgress,
    syncPrices,
    syncSet
  };
}
