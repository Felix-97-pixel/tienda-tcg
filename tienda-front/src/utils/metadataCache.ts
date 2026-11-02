import { API_URL } from "./api";

// Caché en memoria para evitar llamadas redundantes repetitivas
interface CacheEntry<T> {
  data: T | null;
  promise: Promise<T> | null;
  timestamp: number;
}

const CACHE_TTL_MS = 1000 * 60 * 15; // 15 minutos de caché para metadatos estáticos

const createCacheEntry = <T>(): CacheEntry<T> => ({
  data: null,
  promise: null,
  timestamp: 0,
});

const cache = {
  conditions: createCacheEntry<any[]>(),
  languages: createCacheEntry<any[]>(),
  currencies: createCacheEntry<any[]>(),
  games: createCacheEntry<any[]>(),
};

async function fetchWithCache<T>(
  entry: CacheEntry<T>,
  url: string,
  forceRefresh = false
): Promise<T> {
  const now = Date.now();
  if (!forceRefresh && entry.data && now - entry.timestamp < CACHE_TTL_MS) {
    return entry.data;
  }

  // Deduplicación de peticiones concurrentes en vuelo
  if (entry.promise) {
    return entry.promise;
  }

  entry.promise = fetch(url)
    .then(async (res) => {
      if (!res.ok) {
        throw new Error(`Error ${res.status} al obtener ${url}`);
      }
      const data = await res.json();
      entry.data = Array.isArray(data) ? (data as unknown as T) : data;
      entry.timestamp = Date.now();
      entry.promise = null;
      return entry.data;
    })
    .catch((err) => {
      entry.promise = null;
      console.error(`Error en metadataCache para ${url}:`, err);
      // Retornar caché anterior si existía o arreglo vacío
      return entry.data || ([] as unknown as T);
    });

  return entry.promise;
}

export function fetchCachedConditions(forceRefresh = false): Promise<any[]> {
  return fetchWithCache(cache.conditions, `${API_URL}/products/meta/conditions`, forceRefresh);
}

export function fetchCachedLanguages(forceRefresh = false): Promise<any[]> {
  return fetchWithCache(cache.languages, `${API_URL}/products/meta/languages`, forceRefresh);
}

export function fetchCachedCurrencies(forceRefresh = false): Promise<any[]> {
  return fetchWithCache(cache.currencies, `${API_URL}/currencies`, forceRefresh);
}

export function fetchCachedGames(forceRefresh = false): Promise<any[]> {
  return fetchWithCache(cache.games, `${API_URL}/games`, forceRefresh);
}

