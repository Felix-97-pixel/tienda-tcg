"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { API_URL } from '@/utils/api';
import { useToast } from '@/hooks/useToast';
import { useNetworkStatus } from './_lib/useNetworkStatus';
import {
  saveCatalogToLocal,
  searchLocalCatalog,
  decrementLocalStock,
  queueOfflineSale,
  LocalProduct,
} from './_lib/posDb';

import PosHeader from './_components/PosHeader';
import PosSearchBar from './_components/PosSearchBar';
import PosCart, { PosCartItem } from './_components/PosCart';
import PosCheckoutModal from './_components/PosCheckoutModal';
import PosShiftModal from './_components/PosShiftModal';
import PosReceipt, { PosReceiptData } from './_components/PosReceipt';

/**
 * Emite un sonido 'bip' de escáner usando el Web Audio API del navegador (sin archivos externos).
 */
function playBeepSound() {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.08);
  } catch {
    // ignore audio block
  }
}

export default function AdminPosPage() {
  const { showToast } = useToast();
  const networkStatus = useNetworkStatus();

  // Estados de datos
  const [storeName, setStoreName] = useState<string>('TapTrade Store');
  const [currentShift, setCurrentShift] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<LocalProduct[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [cartItems, setCartItems] = useState<PosCartItem[]>([]);
  const [discountAmount, setDiscountAmount] = useState<number>(0);

  // Modales
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [shiftModalMode, setShiftModalMode] = useState<'OPEN' | 'CLOSE' | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Recibo para impresión térmica
  const [lastReceipt, setLastReceipt] = useState<PosReceiptData | null>(null);

  // Pantalla completa
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Ref del input de búsqueda
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Carga inicial de datos y catálogo
  const loadInitialData = useCallback(async () => {
    if (!networkStatus.isOnline) {
      // Si entra directamente offline, consultar catálogo local de IndexedDB
      try {
        const local = await searchLocalCatalog('');
        setSearchResults(local);
      } catch {
        // ignore
      }
      return;
    }

    try {
      // 0. Obtener datos de la tienda activa
      const storeRes = await fetch(`${API_URL}/stores/me`, {
        credentials: 'include',
        headers: { 'x-auth-scope': 'admin' },
      });
      if (storeRes.ok) {
        const storeData = await storeRes.json();
        if (storeData.name) {
          setStoreName(storeData.name);
        }
      }

      // 1. Obtener turno actual
      const shiftRes = await fetch(`${API_URL}/pos/shift/current`, {
        credentials: 'include',
        headers: { 'x-auth-scope': 'admin' },
      });
      if (shiftRes.ok) {
        const shiftData = await shiftRes.json();
        setCurrentShift(shiftData);
      }

      // 2. Descargar catálogo para caché local
      const catRes = await fetch(`${API_URL}/pos/catalog-cache`, {
        credentials: 'include',
        headers: { 'x-auth-scope': 'admin' },
      });
      if (catRes.ok) {
        const catData = await catRes.json();
        if (catData.products) {
          await saveCatalogToLocal(catData.products);
          setSearchResults(catData.products.slice(0, 20));
        }
      }
    } catch {
      // Fallback a local
      const local = await searchLocalCatalog('');
      setSearchResults(local);
    }
  }, [networkStatus.isOnline]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Búsqueda en catálogo local (con debounce rápido de 80ms)
  useEffect(() => {
    let cancel = false;
    setIsSearching(true);

    const timer = setTimeout(async () => {
      try {
        const prods = await searchLocalCatalog(searchQuery);
        if (!cancel) {
          setSearchResults(prods);
        }
      } catch {
        // ignore
      } finally {
        if (!cancel) setIsSearching(false);
      }
    }, 80);

    return () => {
      cancel = true;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  // Listener global de pistola lectora de código de barras USB
  useEffect(() => {
    let barcodeBuffer = '';
    let lastKeyTime = Date.now();

    const handleGlobalKeyDown = async (e: KeyboardEvent) => {
      // Ignorar teclas modificadoras o inputs ajenos
      if (e.key === 'Control' || e.key === 'Alt' || e.key === 'Shift') return;

      const currentTime = Date.now();
      // Las pistolas emiten teclas a menos de 45ms entre sí
      if (currentTime - lastKeyTime > 60) {
        barcodeBuffer = '';
      }
      lastKeyTime = currentTime;

      if (e.key === 'Enter') {
        if (barcodeBuffer.length >= 6) {
          e.preventDefault();
          const scannedCode = barcodeBuffer.trim();
          barcodeBuffer = '';

          // Buscar producto escaneado
          const matches = await searchLocalCatalog(scannedCode);
          if (matches.length > 0) {
            const product = matches[0];
            const availableItem = product.items.find((i) => i.stock > 0);
            if (availableItem) {
              handleAddToCart(product, availableItem);
              playBeepSound();
              showToast(`Escaneado: ${product.name}`, 'success');
              setSearchQuery('');
            } else {
              showToast(`Sin stock para ${product.name}`, 'error');
            }
          } else {
            showToast(`Código no encontrado: ${scannedCode}`, 'error');
          }
        }
        return;
      }

      if (e.key.length === 1) {
        barcodeBuffer += e.key;
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Agregar producto al ticket
  const handleAddToCart = (product: LocalProduct, inventoryItem: LocalProduct['items'][0]) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.inventoryItemId === inventoryItem.id);

      if (existingIndex >= 0) {
        const existing = prev[existingIndex];
        if (existing.quantity >= inventoryItem.stock) {
          showToast(`Stock máximo alcanzado (${inventoryItem.stock})`, 'error');
          return prev;
        }
        const updated = [...prev];
        updated[existingIndex] = {
          ...existing,
          quantity: existing.quantity + 1,
        };
        return updated;
      }

      const newItem: PosCartItem = {
        inventoryItemId: inventoryItem.id,
        productId: product.id,
        name: product.name,
        imageUrl: product.imageUrl,
        conditionLabel: inventoryItem.condition?.displayName || inventoryItem.condition?.name,
        languageCode: inventoryItem.language?.code?.toUpperCase(),
        finishLabel: inventoryItem.finish?.name,
        unitPrice: Number(inventoryItem.price),
        quantity: 1,
        maxStock: inventoryItem.stock,
      };

      return [...prev, newItem];
    });

    playBeepSound();
  };

  // Actualizar cantidad en el carrito
  const handleUpdateQuantity = (inventoryItemId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(inventoryItemId);
      return;
    }

    setCartItems((prev) =>
      prev.map((item) => {
        if (item.inventoryItemId === inventoryItemId) {
          const clamped = Math.min(newQty, item.maxStock);
          return { ...item, quantity: clamped };
        }
        return item;
      }),
    );
  };

  // Quitar ítem del carrito
  const handleRemoveItem = (inventoryItemId: string) => {
    setCartItems((prev) => prev.filter((i) => i.inventoryItemId !== inventoryItemId));
  };

  // Vaciar carrito
  const handleClearCart = () => {
    setCartItems([]);
    setDiscountAmount(0);
  };

  // Procesar venta final (Online u Offline)
  const handleConfirmSale = async (payload: {
    paymentMethod: 'CASH' | 'CARD_POS' | 'TRANSFER' | 'STORE_CREDIT' | 'MIXED';
    receivedAmount?: number;
    changeAmount?: number;
    voucherRef?: string;
    customerName?: string;
    customerEmail?: string;
    customerRut?: string;
    storeCreditAmount?: number;
  }) => {
    setIsProcessing(true);

    const subtotal = cartItems.reduce((acc, i) => acc + i.unitPrice * i.quantity, 0);
    const total = Math.max(0, subtotal - discountAmount);

    const saleItemsPayload = cartItems.map((i) => ({
      productId: i.productId,
      inventoryItemId: i.inventoryItemId,
      name: i.name,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
    }));

    try {
      if (networkStatus.isOnline) {
        // Enviar al servidor en línea
        const res = await fetch(`${API_URL}/pos/sales`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-scope': 'admin',
          },
          credentials: 'include',
          body: JSON.stringify({
            items: saleItemsPayload,
            paymentMethod: payload.paymentMethod,
            totalAmount: total,
            receivedAmount: payload.receivedAmount,
            changeAmount: payload.changeAmount,
            voucherRef: payload.voucherRef,
            customerName: payload.customerName,
            customerEmail: payload.customerEmail,
            customerRut: payload.customerRut,
            storeCreditAmount: payload.storeCreditAmount,
            cashierName: currentShift?.cashierName || 'Cajero',
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || 'Error procesando la venta');
        }

        const data = await res.json();
        const orderId = data.order?.buyOrder || `POS-${Date.now()}`;

        // Preparar recibo
        const receipt: PosReceiptData = {
          orderNumber: orderId,
          storeName,
          cashierName: currentShift?.cashierName || 'Cajero',
          createdAt: new Date().toLocaleString('es-CL'),
          items: cartItems,
          subtotal,
          discountAmount,
          total,
          paymentMethod: payload.paymentMethod,
          receivedAmount: payload.receivedAmount,
          changeAmount: payload.changeAmount,
          voucherRef: payload.voucherRef,
          customerName: payload.customerName,
          customerRut: payload.customerRut,
          isOffline: false,
        };

        setLastReceipt(receipt);
        showToast(`Venta #${orderId} completada con éxito`, 'success');

        // Actualizar turno
        loadInitialData();
      } else {
        // Modo Offline: Guardar en IndexedDB y descontar stock local
        const offlineId = `OFFLINE-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

        for (const item of cartItems) {
          await decrementLocalStock(item.inventoryItemId, item.quantity);
        }

        await queueOfflineSale({
          offlineId,
          offlineCreatedAt: new Date().toISOString(),
          storeId: currentShift?.storeId || 'local_store',
          cashierName: currentShift?.cashierName || 'Cajero',
          paymentMethod: payload.paymentMethod,
          totalAmount: total,
          receivedAmount: payload.receivedAmount,
          changeAmount: payload.changeAmount,
          voucherRef: payload.voucherRef,
          customerName: payload.customerName,
          customerEmail: payload.customerEmail,
          customerRut: payload.customerRut,
          storeCreditAmount: payload.storeCreditAmount,
          items: saleItemsPayload,
        });

        await networkStatus.refreshPendingCount();

        const receipt: PosReceiptData = {
          orderNumber: offlineId,
          storeName,
          cashierName: currentShift?.cashierName || 'Cajero',
          createdAt: new Date().toLocaleString('es-CL'),
          items: cartItems,
          subtotal,
          discountAmount,
          total,
          paymentMethod: payload.paymentMethod,
          receivedAmount: payload.receivedAmount,
          changeAmount: payload.changeAmount,
          voucherRef: payload.voucherRef,
          customerName: payload.customerName,
          customerRut: payload.customerRut,
          isOffline: true,
        };

        setLastReceipt(receipt);
        showToast(`Venta guardada localmente (Modo Offline)`, 'success');
      }

      // Limpiar y cerrar
      handleClearCart();
      setIsCheckoutOpen(false);

      // Disparar diálogo de impresión térmica
      setTimeout(() => {
        window.print();
      }, 250);
    } catch (err: any) {
      showToast(err.message || 'Error al procesar cobro', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Abrir turno de caja
  const handleOpenShift = async (cashierName: string, initialCash: number) => {
    setIsProcessing(true);
    try {
      const res = await fetch(`${API_URL}/pos/shift/open`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-scope': 'admin',
        },
        credentials: 'include',
        body: JSON.stringify({ cashierName, initialCash }),
      });
      if (!res.ok) throw new Error('Error al abrir turno');
      const data = await res.json();
      setCurrentShift(data);
      setShiftModalMode(null);
      showToast('Turno de caja abierto correctamente', 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Cerrar turno de caja
  const handleCloseShift = async (actualCash: number, notes?: string) => {
    setIsProcessing(true);
    try {
      const res = await fetch(`${API_URL}/pos/shift/close`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-scope': 'admin',
        },
        credentials: 'include',
        body: JSON.stringify({ actualCash, notes }),
      });
      if (!res.ok) throw new Error('Error al cerrar turno');
      setCurrentShift(null);
      setShiftModalMode(null);
      showToast('Caja cerrada y arqueo registrado', 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Alternar pantalla completa
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const isShiftOpen = currentShift && currentShift.status === 'OPEN';

  return (
    <div className="space-y-4 pb-12 text-white">
      {/* Barra Superior */}
      <PosHeader
        storeName={storeName}
        cashierName={currentShift?.cashierName || 'Cajero Principal'}
        isShiftOpen={isShiftOpen}
        initialCash={Number(currentShift?.initialCash || 0)}
        networkStatus={networkStatus}
        onOpenShiftClick={() => setShiftModalMode('OPEN')}
        onCloseShiftClick={() => setShiftModalMode('CLOSE')}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
      />

      {/* Panel Principal de 2 Columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-175px)] min-h-[550px]">
        {/* Columna Izquierda: Búsqueda y Resultados (7 columnas en desktop) */}
        <div className="lg:col-span-7 h-full overflow-hidden">
          <PosSearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            results={searchResults}
            isSearching={isSearching}
            onAddItem={handleAddToCart}
            inputRef={searchInputRef}
          />
        </div>

        {/* Columna Derecha: Ticket de Venta Actual (5 columnas en desktop) */}
        <div className="lg:col-span-5 h-full overflow-hidden">
          <PosCart
            items={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
            onCheckout={() => setIsCheckoutOpen(true)}
            discountAmount={discountAmount}
            onSetDiscountAmount={setDiscountAmount}
          />
        </div>
      </div>

      {/* Modales */}
      <PosCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cartItems}
        totalAmount={Math.max(0, cartItems.reduce((acc, i) => acc + i.unitPrice * i.quantity, 0) - discountAmount)}
        discountAmount={discountAmount}
        isOnline={networkStatus.isOnline}
        onConfirmSale={handleConfirmSale}
        isProcessing={isProcessing}
      />

      <PosShiftModal
        isOpen={shiftModalMode !== null}
        mode={shiftModalMode || 'OPEN'}
        onClose={() => setShiftModalMode(null)}
        onSubmitOpen={handleOpenShift}
        onSubmitClose={handleCloseShift}
        currentShift={currentShift}
        isProcessing={isProcessing}
      />

      {/* Plantilla de Ticket Térmico Imprimible Oculta */}
      <PosReceipt receipt={lastReceipt} />
    </div>
  );
}
