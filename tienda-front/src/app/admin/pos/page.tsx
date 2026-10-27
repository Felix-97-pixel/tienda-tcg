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
import PosBuyCart, { PosBuyCartItem } from './_components/PosBuyCart';
import PosCheckoutModal from './_components/PosCheckoutModal';
import PosBuyModal from './_components/PosBuyModal';
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

  // Modo de operación: 'SELL' (Vender a clientes) vs 'BUY' (Comprar / Trade-in)
  const [posMode, setPosMode] = useState<'SELL' | 'BUY'>('SELL');

  // Estados de datos
  const [storeName, setStoreName] = useState<string>('TapTrade Store');
  const [currentShift, setCurrentShift] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<LocalProduct[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Estados para filtros avanzados en modo Compra (Trade-in)
  const [buySourceTab, setBuySourceTab] = useState<'BUYLIST' | 'GLOBAL'>('BUYLIST');
  const [buylistProducts, setBuylistProducts] = useState<LocalProduct[]>([]);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [expansions, setExpansions] = useState<Array<{ name: string; products?: number }>>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedExpansion, setSelectedExpansion] = useState<string>('');

  // Catálogo completo de la Buylist de la tienda (para autocompletar precios de compra)
  const [buylistMap, setBuylistMap] = useState<Map<string, { cashPrice: number; creditPrice: number; conditionId: string; languageId: string }>>(new Map());
  const [conditions, setConditions] = useState<Array<{ id: string; name: string; displayName?: string | null }>>([]);

  // Carrito de Venta
  const [cartItems, setCartItems] = useState<PosCartItem[]>([]);
  const [discountAmount, setDiscountAmount] = useState<number>(0);

  // Carrito de Compra (Trade-in)
  const [buyCartItems, setBuyCartItems] = useState<PosBuyCartItem[]>([]);

  // Modales
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState<boolean>(false);
  const [shiftModalMode, setShiftModalMode] = useState<'OPEN' | 'CLOSE' | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Recibo para impresión térmica
  const [lastReceipt, setLastReceipt] = useState<PosReceiptData | null>(null);

  // Pantalla completa
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Ref del input de búsqueda
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Carga inicial de datos, turno, catálogo y buylist
  const loadInitialData = useCallback(async () => {
    // Cargar condiciones para selectores
    fetch(`${API_URL}/products/meta/conditions`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) setConditions(data);
      })
      .catch(() => { });

    // Cargar categorías TCG para filtros de Trade-in
    fetch(`${API_URL}/products/meta/categories/admin?isTcg=true`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) setCategories(data);
      })
      .catch(() => { });

    if (!networkStatus.isOnline) {
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

      // 3. Descargar Buylist de la tienda para autocompletar cotizaciones
      const buylistRes = await fetch(`${API_URL}/buylist/me`, {
        credentials: 'include',
        headers: { 'x-auth-scope': 'admin' },
      });
      if (buylistRes.ok) {
        const buylistData = await buylistRes.json();
        if (Array.isArray(buylistData)) {
          const map = new Map<string, { cashPrice: number; creditPrice: number; conditionId: string; languageId: string }>();
          const prods: LocalProduct[] = [];
          for (const item of buylistData) {
            if (item.productId && item.isActive) {
              map.set(item.productId, {
                cashPrice: Number(item.cashPrice || 0),
                creditPrice: Number(item.creditPrice || 0),
                conditionId: item.conditionId,
                languageId: item.languageId,
              });
              if (item.product) {
                prods.push({
                  id: item.product.id,
                  name: item.product.name,
                  category: item.product.category ? { id: item.product.category.id, name: item.product.category.name } : null,
                  imageUrl: item.product.imageUrl || item.product.cardDetail?.imageUrl,
                  cardDetail: item.product.cardDetail,
                  items: [],
                });
              }
            }
          }
          setBuylistMap(map);
          setBuylistProducts(prods);
          if (posMode === 'BUY' && buySourceTab === 'BUYLIST') {
            setSearchResults(prods);
          }
        }
      }
    } catch {
      // Fallback a local
      const local = await searchLocalCatalog('');
      setSearchResults(local);
    }
  }, [networkStatus.isOnline]);

  // Cargar expansiones dinámicamente según la categoría seleccionada
  useEffect(() => {
    if (!selectedCategory) {
      setExpansions([]);
      setSelectedExpansion('');
      return;
    }
    fetch(`${API_URL}/products/meta/expansions?category=${encodeURIComponent(selectedCategory)}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (Array.isArray(data)) setExpansions(data);
      })
      .catch(() => setExpansions([]));
  }, [selectedCategory]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Búsqueda inteligente según el modo activo (Venta vs Compra) y la pestaña (Buylist vs Catálogo Global)
  useEffect(() => {
    let cancel = false;
    setIsSearching(true);

    const timer = setTimeout(async () => {
      try {
        if (posMode === 'SELL') {
          // Modo Venta: catálogo con stock de la tienda local
          const prods = await searchLocalCatalog(searchQuery);
          if (!cancel) setSearchResults(prods);
        } else {
          // Modo Compra (Trade-in)
          if (buySourceTab === 'BUYLIST') {
            // Filtrar productos de la Buylist
            let filtered = buylistProducts;
            if (selectedCategory) {
              filtered = filtered.filter((p) => p.category?.name === selectedCategory || p.category?.id === selectedCategory);
            }
            if (selectedExpansion) {
              filtered = filtered.filter((p) => p.cardDetail?.expansion?.toLowerCase() === selectedExpansion.toLowerCase());
            }
            if (searchQuery.trim()) {
              const q = searchQuery.toLowerCase();
              filtered = filtered.filter((p) =>
                p.name.toLowerCase().includes(q) ||
                (p.cardDetail?.collectorNum && p.cardDetail.collectorNum.toLowerCase().includes(q))
              );
            }
            if (!cancel) setSearchResults(filtered);
          } else {
            // Colección Maestra Global (SuperAdmin Catalog)
            const params = new URLSearchParams();
            if (searchQuery.trim()) params.set('search', searchQuery.trim());
            params.set('adminCatalog', 'true');
            params.set('isTcg', 'true');
            params.set('limit', '30');
            if (selectedCategory) params.set('category', selectedCategory);
            if (selectedExpansion) params.set('expansion', selectedExpansion);

            const res = await fetch(`${API_URL}/products?${params.toString()}`, {
              credentials: 'include',
              headers: { 'x-auth-scope': 'admin' },
            });
            if (res.ok) {
              const data = await res.json();
              const rawProducts = Array.isArray(data) ? data : (data.data || data.products || []);
              const prods: LocalProduct[] = rawProducts.map((p: any) => ({
                id: p.id,
                name: p.name,
                category: p.category ? { id: p.category.id, name: p.category.name } : null,
                imageUrl: p.imageUrl || p.cardDetail?.imageUrl,
                cardDetail: p.cardDetail,
                items: (p.items || []).map((inv: any) => ({
                  id: inv.id,
                  conditionId: inv.conditionId,
                  condition: inv.condition,
                  languageId: inv.languageId,
                  language: inv.language,
                  price: Number(inv.price || 0),
                  stock: inv.stock || 0,
                  finish: inv.finish,
                })),
              }));
              if (!cancel) setSearchResults(prods);
            } else {
              // Fallback a catálogo local
              const prods = await searchLocalCatalog(searchQuery);
              if (!cancel) setSearchResults(prods);
            }
          }
        }
      } catch {
        // ignore
      } finally {
        if (!cancel) setIsSearching(false);
      }
    }, 150);

    return () => {
      cancel = true;
      clearTimeout(timer);
    };
  }, [searchQuery, posMode, buySourceTab, selectedCategory, selectedExpansion, buylistProducts]);

  // Listener global de pistola lectora de código de barras USB
  useEffect(() => {
    let barcodeBuffer = '';
    let lastKeyTime = Date.now();

    const handleGlobalKeyDown = async (e: KeyboardEvent) => {
      if (e.key === 'Control' || e.key === 'Alt' || e.key === 'Shift') return;

      const currentTime = Date.now();
      if (currentTime - lastKeyTime > 60) {
        barcodeBuffer = '';
      }
      lastKeyTime = currentTime;

      if (e.key === 'Enter') {
        if (barcodeBuffer.length >= 6) {
          e.preventDefault();
          const scannedCode = barcodeBuffer.trim();
          barcodeBuffer = '';

          const matches = await searchLocalCatalog(scannedCode);
          if (matches.length > 0) {
            const product = matches[0];
            if (posMode === 'SELL') {
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
              // Modo Compra
              handleAddBuyItem(product);
              playBeepSound();
              showToast(`Agregado para compra: ${product.name}`, 'success');
              setSearchQuery('');
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
  }, [posMode]);

  // ── ACCIONES DE VENTA ──
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
        expansion: product.cardDetail?.expansion,
        collectorNum: product.cardDetail?.collectorNum,
        rarity: product.cardDetail?.rarity,
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

  const handleRemoveItem = (inventoryItemId: string) => {
    setCartItems((prev) => prev.filter((i) => i.inventoryItemId !== inventoryItemId));
  };

  const handleClearCart = () => {
    setCartItems([]);
    setDiscountAmount(0);
  };

  // ── ACCIONES DE COMPRA (TRADE-IN) ──
  const handleAddBuyItem = (product: LocalProduct) => {
    const isBuylist = buylistMap.has(product.id);
    const buylistInfo = isBuylist ? buylistMap.get(product.id) : null;

    // Buscar si ya está en la lista de compra
    const existingIndex = buyCartItems.findIndex((i) => i.productId === product.id);
    if (existingIndex >= 0) {
      setBuyCartItems((prev) => {
        const updated = [...prev];
        updated[existingIndex].quantity += 1;
        return updated;
      });
      playBeepSound();
      return;
    }

    const defaultCondition = conditions[0] || { id: 'nm', name: 'Near Mint', displayName: 'Near Mint' };
    const defaultCash = buylistInfo ? buylistInfo.cashPrice : 0;
    const defaultCredit = buylistInfo ? buylistInfo.creditPrice : 0;

    const newItem: PosBuyCartItem = {
      id: `BUY-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      productId: product.id,
      name: product.name,
      imageUrl: product.imageUrl,
      expansion: product.cardDetail?.expansion,
      collectorNum: product.cardDetail?.collectorNum,
      rarity: product.cardDetail?.rarity,
      conditionId: defaultCondition.id,
      conditionName: defaultCondition.displayName || defaultCondition.name,
      languageId: 'es',
      languageCode: 'ES',
      quantity: 1,
      cashPrice: defaultCash,
      creditPrice: defaultCredit,
      isFromBuylist: isBuylist,
    };

    setBuyCartItems((prev) => [...prev, newItem]);
    playBeepSound();
    if (isBuylist) {
      showToast(`Precios aplicados automáticamente desde Buylist para ${product.name}`, 'success');
    }
  };

  const handleUpdateBuyQuantity = (id: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveBuyItem(id);
      return;
    }
    setBuyCartItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity: newQty } : i)),
    );
  };

  const handleUpdateBuyPrices = (id: string, cashPrice: number, creditPrice: number) => {
    setBuyCartItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, cashPrice, creditPrice } : i)),
    );
  };

  const handleUpdateBuyCondition = (id: string, conditionId: string, conditionName: string) => {
    setBuyCartItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, conditionId, conditionName } : i)),
    );
  };

  const handleRemoveBuyItem = (id: string) => {
    setBuyCartItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleClearBuyCart = () => {
    setBuyCartItems([]);
  };

  // Confirmar y procesar venta presencial
  const handleConfirmSale = async (payload: {
    paymentMethod: 'CASH' | 'CARD_POS' | 'TRANSFER' | 'STORE_CREDIT' | 'MIXED';
    receivedAmount?: number;
    changeAmount?: number;
    voucherRef?: string;
    customerName?: string;
    customerEmail?: string;
    customerRut?: string;
    userId?: string;
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
            userId: payload.userId,
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
        loadInitialData();
      } else {
        // Modo Offline
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
          userId: payload.userId,
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

      handleClearCart();
      setIsCheckoutOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Error al procesar la venta', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Confirmar y procesar compra / trade-in presencial
  const handleConfirmBuyPayout = async (payload: {
    payoutMethod: 'STORE_CREDIT' | 'CASH';
    totalAmount: number;
    userId?: string;
    customerName?: string;
    customerEmail?: string;
    customerRut?: string;
    notes?: string;
  }) => {
    setIsProcessing(true);

    const itemsPayload = buyCartItems.map((i) => ({
      productId: i.productId,
      name: i.name,
      imageUrl: i.imageUrl || undefined,
      quantity: i.quantity,
      cashPrice: i.cashPrice,
      creditPrice: i.creditPrice,
      condition: i.conditionName,
      language: i.languageCode,
    }));

    try {
      const res = await fetch(`${API_URL}/pos/buy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-scope': 'admin',
        },
        credentials: 'include',
        body: JSON.stringify({
          payoutMethod: payload.payoutMethod,
          items: itemsPayload,
          totalAmount: payload.totalAmount,
          userId: payload.userId,
          customerName: payload.customerName,
          customerEmail: payload.customerEmail,
          customerRut: payload.customerRut,
          cashierName: currentShift?.cashierName || 'Cajero',
          notes: payload.notes,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Error al registrar la compra');
      }

      const data = await res.json();
      if (payload.payoutMethod === 'STORE_CREDIT') {
        showToast(`Se abonaron $${payload.totalAmount.toLocaleString('es-CL')} SC al cliente exitosamente`, 'success');
      } else {
        showToast(`Compra registrada. Egresaron $${payload.totalAmount.toLocaleString('es-CL')} en efectivo de la caja`, 'success');
      }

      handleClearBuyCart();
      setIsBuyModalOpen(false);
      loadInitialData();
    } catch (err: any) {
      showToast(err.message || 'Error al registrar la compra', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Apertura y Cierre de turno de caja
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

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => { });
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => { });
    }
  };

  const isShiftOpen = currentShift && currentShift.status === 'OPEN';

  return (
    <div className="space-y-4 pb-12 text-white">
      {/* Barra Superior con interruptor VENDER / COMPRAR */}
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
        posMode={posMode}
        onTogglePosMode={setPosMode}
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
            onAddBuyItem={handleAddBuyItem}
            inputRef={searchInputRef}
            posMode={posMode}
            buylistMap={buylistMap}
            buySourceTab={buySourceTab}
            onSetBuySourceTab={setBuySourceTab}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            selectedExpansion={selectedExpansion}
            onSelectExpansion={setSelectedExpansion}
            categories={categories}
            expansions={expansions}
          />
        </div>

        {/* Columna Derecha: Ticket de Venta O Ticket de Compra según el modo */}
        <div className="lg:col-span-5 h-full overflow-hidden">
          {posMode === 'SELL' ? (
            <PosCart
              items={cartItems}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              onClearCart={handleClearCart}
              onCheckout={() => setIsCheckoutOpen(true)}
              discountAmount={discountAmount}
              onSetDiscountAmount={setDiscountAmount}
            />
          ) : (
            <PosBuyCart
              items={buyCartItems}
              onUpdateQuantity={handleUpdateBuyQuantity}
              onUpdatePrices={handleUpdateBuyPrices}
              onUpdateCondition={handleUpdateBuyCondition}
              onRemoveItem={handleRemoveBuyItem}
              onClearCart={handleClearBuyCart}
              onProceedPayout={() => setIsBuyModalOpen(true)}
              conditions={conditions}
            />
          )}
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

      <PosBuyModal
        isOpen={isBuyModalOpen}
        onClose={() => setIsBuyModalOpen(false)}
        items={buyCartItems}
        onConfirmPayout={handleConfirmBuyPayout}
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