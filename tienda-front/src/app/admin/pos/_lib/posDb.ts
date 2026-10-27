/**
 * Gestor de Base de Datos Local en el Navegador (IndexedDB) para el POS Offline-First.
 * Almacena el catálogo de productos localmente para búsquedas instantáneas (<5ms)
 * y encola ventas cuando no hay conexión a internet.
 */

const DB_NAME = 'taptrade_pos_db';
const DB_VERSION = 1;

export interface LocalProduct {
  id: string;
  name: string;
  barcode?: string | null;
  sku?: string | null;
  imageUrl?: string | null;
  category?: { id: string; name: string; isTcg?: boolean } | null;
  cardDetail?: {
    expansion?: string | null;
    rarity?: string | null;
    collectorNum?: string | null;
    gameId?: string | null;
  } | null;
  isTcg?: boolean;
  exchangeRateApplied?: number;
  items: Array<{
    id: string;
    price: number | string;
    rawPriceUsd?: number;
    exchangeRate?: number;
    stock: number;
    condition?: { id: string; name: string; displayName?: string | null } | null;
    language?: { id: string; name: string; code: string } | null;
    finish?: { id: string; name: string } | null;
  }>;
}

export interface OfflineQueuedSale {
  offlineId: string;
  offlineCreatedAt: string;
  storeId: string;
  cashierName?: string;
  paymentMethod: 'CASH' | 'CARD_POS' | 'TRANSFER' | 'STORE_CREDIT' | 'MIXED';
  totalAmount: number;
  receivedAmount?: number;
  changeAmount?: number;
  voucherRef?: string;
  customerName?: string;
  customerEmail?: string;
  customerRut?: string;
  userId?: string;
  storeCreditAmount?: number;
  items: Array<{
    productId: string;
    inventoryItemId: string;
    name: string;
    quantity: number;
    unitPrice: number;
  }>;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      return reject(new Error('IndexedDB solo disponible en el cliente'));
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: any) => {
      const db: IDBDatabase = event.target.result;

      // Store para catálogo de productos
      if (!db.objectStoreNames.contains('catalog')) {
        const catalogStore = db.createObjectStore('catalog', { keyPath: 'id' });
        catalogStore.createIndex('barcode', 'barcode', { unique: false });
        catalogStore.createIndex('name', 'name', { unique: false });
      }

      // Store para cola de ventas offline
      if (!db.objectStoreNames.contains('offline_sales')) {
        db.createObjectStore('offline_sales', { keyPath: 'offlineId' });
      }

      // Store para metadatos del POS
      if (!db.objectStoreNames.contains('meta')) {
        db.createObjectStore('meta', { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Guarda o reemplaza el catálogo local en IndexedDB.
 */
export async function saveCatalogToLocal(products: LocalProduct[]): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['catalog', 'meta'], 'readwrite');
    const catalogStore = tx.objectStore('catalog');
    const metaStore = tx.objectStore('meta');

    catalogStore.clear();
    for (const prod of products) {
      catalogStore.put(prod);
    }

    metaStore.put({ key: 'lastCatalogSync', timestamp: Date.now(), total: products.length });

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Búsqueda ultrarrápida local en IndexedDB por código de barras o texto.
 */
export async function searchLocalCatalog(query: string): Promise<LocalProduct[]> {
  const db = await openDb();
  const trimmed = (query || '').trim().toLowerCase();

  return new Promise((resolve, reject) => {
    const tx = db.transaction('catalog', 'readonly');
    const store = tx.objectStore('catalog');
    const request = store.openCursor();
    const results: LocalProduct[] = [];

    request.onsuccess = (event: any) => {
      const cursor: IDBCursorWithValue = event.target.result;
      if (cursor) {
        const prod: LocalProduct = cursor.value;

        // Si no hay query, retornar primeros 20 con stock
        if (!trimmed) {
          const hasStock = prod.items && prod.items.some((i) => i.stock > 0);
          if (hasStock) results.push(prod);
          if (results.length >= 20) return resolve(results);
          cursor.continue();
          return;
        }

        const matchBarcode = prod.barcode && prod.barcode.toLowerCase() === trimmed;
        const searchString = `${prod.name || ''} ${prod.barcode || ''} ${prod.sku || ''} ${prod.cardDetail?.expansion || ''} #${prod.cardDetail?.collectorNum || ''}`.toLowerCase();
        const tokens = trimmed.split(/\s+/).filter(Boolean);
        const matchTokens = tokens.length > 0 && tokens.every((token) => searchString.includes(token));

        if (matchBarcode || matchTokens) {
          const hasStock = prod.items && prod.items.some((i) => i.stock > 0);
          // Si coincide el código de barras exacto, lo ponemos al frente absoluto
          if (matchBarcode) {
            results.unshift(prod);
          } else if (hasStock) {
            // Productos con stock tienen prioridad
            const firstOutOfStockIndex = results.findIndex(
              (p) => !p.items || !p.items.some((i) => i.stock > 0),
            );
            if (firstOutOfStockIndex >= 0) {
              results.splice(firstOutOfStockIndex, 0, prod);
            } else {
              results.push(prod);
            }
          } else {
            // Productos sin stock van al final
            results.push(prod);
          }
        }

        if (results.length >= 30) {
          return resolve(results);
        }
        cursor.continue();
      } else {
        resolve(results);
      }
    };

    request.onerror = () => reject(request.error);
  });
}

/**
 * Descuenta el stock localmente en IndexedDB para mantener coherencia en pantalla.
 */
export async function decrementLocalStock(inventoryItemId: string, quantity: number): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('catalog', 'readwrite');
    const store = tx.objectStore('catalog');
    const request = store.openCursor();

    request.onsuccess = (event: any) => {
      const cursor: IDBCursorWithValue = event.target.result;
      if (cursor) {
        const prod: LocalProduct = cursor.value;
        const itemIndex = prod.items.findIndex((i) => i.id === inventoryItemId);

        if (itemIndex >= 0) {
          prod.items[itemIndex].stock = Math.max(0, prod.items[itemIndex].stock - quantity);
          cursor.update(prod);
          return resolve();
        }
        cursor.continue();
      } else {
        resolve();
      }
    };

    request.onerror = () => reject(request.error);
  });
}

/**
 * Encola una venta en la tabla local de ventas offline.
 */
export async function queueOfflineSale(sale: OfflineQueuedSale): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('offline_sales', 'readwrite');
    const store = tx.objectStore('offline_sales');
    store.put(sale);

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Obtiene todas las ventas pendientes de sincronizar.
 */
export async function getQueuedOfflineSales(): Promise<OfflineQueuedSale[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('offline_sales', 'readonly');
    const store = tx.objectStore('offline_sales');
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Elimina una venta offline una vez sincronizada con el servidor.
 */
export async function removeQueuedOfflineSale(offlineId: string): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('offline_sales', 'readwrite');
    const store = tx.objectStore('offline_sales');
    store.delete(offlineId);

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Obtiene la cantidad de ventas pendientes en cola offline.
 */
export async function getPendingOfflineCount(): Promise<number> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('offline_sales', 'readonly');
    const store = tx.objectStore('offline_sales');
    const request = store.count();

    request.onsuccess = () => resolve(request.result || 0);
    request.onerror = () => reject(request.error);
  });
}
