import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

export interface ScrydexCard {
  id: string;
  name: string;
  number?: string;
  collector_number?: string;
  rarity?: string;
  imageUrl?: string;
  images?: {
    small?: string;
    large?: string;
    png?: string;
  };
  tcgplayer?: {
    url?: string;
    updatedAt?: string;
    prices?: {
      normal?: { low?: number; mid?: number; high?: number; market?: number; directLow?: number };
      holofoil?: { low?: number; mid?: number; high?: number; market?: number; directLow?: number };
      reverseHolofoil?: { low?: number; mid?: number; high?: number; market?: number; directLow?: number };
      unlimitedHolofoil?: { low?: number; mid?: number; high?: number; market?: number; directLow?: number };
    };
  };
  marketPrices?: {
    normal?: number;
    foil?: number;
    reverseFoil?: number;
    composite?: number;
  };
  [key: string]: any;
}

export interface ScrydexSet {
  id: string;
  name: string;
  series?: string;
  printedTotal?: number;
  total?: number;
  releaseDate?: string;
  images?: {
    symbol?: string;
    logo?: string;
  };
  [key: string]: any;
}

@Injectable()
export class ScrydexService {
  private readonly logger = new Logger(ScrydexService.name);
  private readonly baseUrl = 'https://api.scrydex.com';

  // Cache en memoria para listas de expansiones (TTL: 24 horas)
  // Evita gastar créditos de la API cada vez que un usuario abre o recarga el dropdown en el admin.
  private setsCache = new Map<string, { data: ScrydexSet[]; expiresAt: number }>();
  private readonly SETS_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 horas

  private getHeaders(): Record<string, string> {
    const apiKey = process.env.SCRYDEX_API_KEY || process.env.SCRYDEX_SECONDARY_KEY || '';
    const teamId = process.env.SCRYDEX_TEAM_ID || '';

    return {
      'User-Agent': 'TapTrade-TCG-Marketplace/1.0',
      'Accept': 'application/json',
      'X-Api-Key': apiKey,
      'X-Team-ID': teamId,
    };
  }

  /**
   * Helper seguro con reintento para peticiones a la API de Scrydex
   */
  private async safeGet<T = any>(endpoint: string, params: Record<string, any> = {}, retries = 1): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    try {
      const response = await axios.get(url, {
        headers: this.getHeaders(),
        params,
        timeout: 20000,
      });
      return response.data;
    } catch (error: any) {
      const status = error.response?.status;
      const errorMsg = error.response?.data?.error?.message || error.message;

      if (status === 401) {
        this.logger.error(`[Scrydex] Error 401 de autenticación. Verifica que SCRYDEX_API_KEY y SCRYDEX_TEAM_ID sean correctos.`);
      }

      if (retries > 0 && (status === 429 || (status && status >= 500))) {
        this.logger.warn(`[Scrydex] Reintentando petición (${status}) a ${endpoint}...`);
        await new Promise((res) => setTimeout(res, 2000));
        return this.safeGet<T>(endpoint, params, retries - 1);
      }

      this.logger.error(`[Scrydex] Error en ${endpoint}: ${errorMsg}`);
      throw error;
    }
  }

  /**
   * Obtiene la lista de expansiones/sets de un juego soportado (pokemon, onepiece, riftbound, lorcana, gundam).
   * Almacena en caché en memoria por 24 horas para costar 0 créditos en cada navegación o recarga de dropdowns.
   */
  async fetchSets(game: string, forceRefresh = false): Promise<ScrydexSet[]> {
    const gameKey = game.toLowerCase();
    const now = Date.now();
    const cached = this.setsCache.get(gameKey);

    if (!forceRefresh && cached && cached.expiresAt > now) {
      this.logger.debug(`[Scrydex] Retornando ${cached.data.length} sets de ${gameKey} desde caché (0 créditos consumidos).`);
      return cached.data;
    }

    try {
      this.logger.log(`[Scrydex] Consultando lista de expansiones para ${gameKey} a la API externa (1 crédito)...`);
      const res = await this.safeGet<any>(`/${gameKey}/v1/expansions`, { pageSize: 250 });
      let sets: ScrydexSet[] = [];
      if (Array.isArray(res?.data)) {
        sets = res.data;
      } else if (Array.isArray(res)) {
        sets = res;
      }

      if (sets.length > 0) {
        this.setsCache.set(gameKey, {
          data: sets,
          expiresAt: now + this.SETS_CACHE_TTL_MS,
        });
      }

      return sets;
    } catch (e: any) {
      this.logger.warn(`No se pudieron obtener los sets de Scrydex para ${gameKey}: ${e.message}`);
      return cached ? cached.data : [];
    }
  }

  /**
   * Busca un set por nombre o slug
   */
  async fetchSetByName(game: string, name: string): Promise<ScrydexSet | null> {
    const sets = await this.fetchSets(game);
    const target = name.toLowerCase().trim();
    return sets.find((s) => s.name?.toLowerCase().trim() === target || s.id?.toLowerCase().trim() === target) || null;
  }

  /**
   * Obtiene una página de cartas de una expansión con precios de mercado y variantes.
   * Por directiva de arquitectura, fuerza pageSize=250 e include=prices para máximo ahorro de créditos.
   */
  async fetchCardsPageWithPrices(
    game: string,
    setId: string,
    page: number = 1,
    pageSize: number = 250,
  ): Promise<{ cards: ScrydexCard[]; totalCount: number }> {
    const gameKey = game.toLowerCase();
    try {
      const endpoint = `/${gameKey}/v1/expansions/${encodeURIComponent(setId)}/cards`;
      const res = await this.safeGet<any>(endpoint, {
        include: 'prices',
        page,
        pageSize,
      });

      const cards: ScrydexCard[] = Array.isArray(res?.data) ? res.data : [];
      const totalCount = Number(res?.total_count || res?.totalCount || res?.total || cards.length);

      return { cards, totalCount };
    } catch (e: any) {
      this.logger.error(`Error al obtener cartas de ${gameKey} (set: ${setId}, pág: ${page}): ${e.message}`);
      return { cards: [], totalCount: 0 };
    }
  }

  /**
   * Extrae el precio de mercado (TCGPlayer) para una variante dada (ej. 'normal', 'foil', 'reverseHolofoil')
   * Prioriza condición Near Mint ('NM') y tipo 'raw'.
   */
  extractVariantPrice(card: any, variantName: string = 'normal'): number | null {
    if (!card || !Array.isArray(card.variants)) return null;

    const normalizedTarget = variantName.toLowerCase().replace(/[^a-z0-9]/g, '');

    // Buscar variante que coincida
    const matchedVariant = card.variants.find((v: any) => {
      const vName = (v.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      return vName === normalizedTarget || (normalizedTarget === 'normal' && (vName === '' || vName === 'regular'));
    }) || card.variants[0];

    if (!matchedVariant || !Array.isArray(matchedVariant.prices) || matchedVariant.prices.length === 0) {
      return null;
    }

    // Priorizar NM raw
    const nmPrice = matchedVariant.prices.find((p: any) => p.condition === 'NM' && p.type === 'raw');
    if (nmPrice && (typeof nmPrice.market === 'number' || typeof nmPrice.low === 'number')) {
      return nmPrice.market ?? nmPrice.low;
    }

    // Si no hay NM exacto, buscar cualquier precio raw
    const anyRaw = matchedVariant.prices.find((p: any) => p.type === 'raw' && (p.market != null || p.low != null));
    if (anyRaw) {
      return anyRaw.market ?? anyRaw.low;
    }

    // Último recurso: primer precio con market o low
    const firstValid = matchedVariant.prices.find((p: any) => p.market != null || p.low != null);
    return firstValid ? (firstValid.market ?? firstValid.low) : null;
  }
}

