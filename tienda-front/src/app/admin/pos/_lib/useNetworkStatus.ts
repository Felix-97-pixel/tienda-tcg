"use client";
import { useState, useEffect, useCallback } from 'react';
import { API_URL } from '@/utils/api';
import {
  getQueuedOfflineSales,
  removeQueuedOfflineSale,
  getPendingOfflineCount,
} from './posDb';

export function useNetworkStatus() {
  const [browserOnline, setBrowserOnline] = useState<boolean>(true);
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Conectividad efectiva
  const isOnline = browserOnline && !isSimulatedOffline;

  // Actualizar conteo de pendientes
  const refreshPendingCount = useCallback(async () => {
    try {
      const count = await getPendingOfflineCount();
      setPendingCount(count);
    } catch {
      // ignore
    }
  }, []);

  // Función de sincronización automática de la cola offline hacia el servidor
  const triggerSync = useCallback(async () => {
    if (!isOnline || isSyncing) return;

    try {
      const pendingSales = await getQueuedOfflineSales();
      if (pendingSales.length === 0) {
        setPendingCount(0);
        return;
      }

      setIsSyncing(true);
      setSyncFeedback(`Sincronizando ${pendingSales.length} venta(s)...`);

      const res = await fetch(`${API_URL}/pos/sales/sync-offline`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-scope': 'admin',
        },
        credentials: 'include',
        body: JSON.stringify({ sales: pendingSales }),
      });

      if (res.ok) {
        const data = await res.json();
        // Limpiar cada venta sincronizada con éxito
        for (const sale of pendingSales) {
          await removeQueuedOfflineSale(sale.offlineId);
        }
        await refreshPendingCount();
        setSyncFeedback(`¡Sincronizadas ${data.processedCount || pendingSales.length} venta(s) exitosamente!`);
        setTimeout(() => setSyncFeedback(null), 4000);
      } else {
        setSyncFeedback('Reintentando sincronización en breve...');
      }
    } catch {
      setSyncFeedback('Sin conexión con el servidor. Se reintentará automáticamente.');
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSyncing, refreshPendingCount]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setBrowserOnline(navigator.onLine);
    refreshPendingCount();

    const handleOnline = () => {
      setBrowserOnline(true);
    };

    const handleOffline = () => {
      setBrowserOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Revisar cola y conectividad cada 12 segundos
    const interval = setInterval(() => {
      refreshPendingCount();
      if (navigator.onLine && !isSimulatedOffline) {
        triggerSync();
      }
    }, 12000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [isSimulatedOffline, refreshPendingCount, triggerSync]);

  // Si volvemos a estar online, disparar sincronización de inmediato
  useEffect(() => {
    if (isOnline) {
      triggerSync();
    }
  }, [isOnline, triggerSync]);

  const toggleSimulatedOffline = () => {
    setIsSimulatedOffline((prev) => !prev);
  };

  return {
    isOnline,
    browserOnline,
    isSimulatedOffline,
    toggleSimulatedOffline,
    isSyncing,
    pendingCount,
    syncFeedback,
    triggerSync,
    refreshPendingCount,
  };
}
