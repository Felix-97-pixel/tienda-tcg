"use client";
import { useState, useEffect, useCallback, useRef } from 'react';
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

  // Referencias para evitar reentrancias y bucles infinitos
  const isSyncingRef = useRef<boolean>(false);
  const lastSyncErrorTime = useRef<number>(0);

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
    if (!isOnline || isSyncingRef.current) return;

    // Cooldown de 6 segundos entre fallos para evitar saturación de red / 429
    const now = Date.now();
    if (now - lastSyncErrorTime.current < 6000) return;

    try {
      const pendingSales = await getQueuedOfflineSales();
      if (!pendingSales || pendingSales.length === 0) {
        setPendingCount(0);
        return;
      }

      isSyncingRef.current = true;
      setIsSyncing(true);
      setSyncFeedback(`Sincronizando ${pendingSales.length} venta(s)...`);

      // Sanitizar el payload para enviar exclusivamente lo que el DTO espera
      const sanitizedSales = pendingSales.map((sale) => ({
        offlineId: sale.offlineId,
        offlineCreatedAt: sale.offlineCreatedAt,
        storeId: sale.storeId,
        cashierName: sale.cashierName,
        paymentMethod: sale.paymentMethod,
        totalAmount: Number(sale.totalAmount),
        receivedAmount: sale.receivedAmount !== undefined ? Number(sale.receivedAmount) : undefined,
        changeAmount: sale.changeAmount !== undefined ? Number(sale.changeAmount) : undefined,
        voucherRef: sale.voucherRef || undefined,
        customerName: sale.customerName || undefined,
        customerEmail: sale.customerEmail || undefined,
        customerRut: sale.customerRut || undefined,
        userId: sale.userId || undefined,
        storeCreditAmount: sale.storeCreditAmount !== undefined ? Number(sale.storeCreditAmount) : undefined,
        items: (sale.items || []).map((i) => ({
          productId: i.productId,
          inventoryItemId: i.inventoryItemId,
          name: i.name,
          quantity: Number(i.quantity),
          unitPrice: Number(i.unitPrice),
        })),
      }));

      const res = await fetch(`${API_URL}/pos/sales/sync-offline`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-scope': 'admin',
        },
        credentials: 'include',
        body: JSON.stringify({ sales: sanitizedSales }),
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
        lastSyncErrorTime.current = Date.now();
        const errJson = await res.json().catch(() => ({}));
        if (res.status === 400) {
          setSyncFeedback(`Error de datos en venta offline (${errJson.message || '400'}). Revisa la consola.`);
          console.error('[POS Offline Sync Error 400]', errJson);
        } else if (res.status === 429) {
          setSyncFeedback('Límite de peticiones alcanzado. Reintentando en unos instantes...');
        } else {
          setSyncFeedback('Error temporal al sincronizar. Se reintentará en breve.');
        }
      }
    } catch {
      lastSyncErrorTime.current = Date.now();
      setSyncFeedback('Sin conexión con el servidor. Se reintentará automáticamente.');
    } finally {
      isSyncingRef.current = false;
      setIsSyncing(false);
    }
  }, [isOnline, refreshPendingCount]);

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

    // Revisar cola y conectividad periódicamente cada 15s
    const interval = setInterval(() => {
      refreshPendingCount();
      if (navigator.onLine && !isSimulatedOffline) {
        triggerSync();
      }
    }, 15000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [isSimulatedOffline, refreshPendingCount, triggerSync]);

  // Si volvemos a estar online, disparar sincronización una sola vez
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
