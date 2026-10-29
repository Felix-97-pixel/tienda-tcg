import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class RiftboundService {
  private readonly logger = new Logger(RiftboundService.name);
  private readonly riftcodexBaseUrl = 'https://api.riftcodex.com';
  private readonly riotOfficialApiUrl = 'https://americas.api.riotgames.com/riftbound/content/v1/contents';
  private readonly riotOfficialGalleryUrl = 'https://riftbound.leagueoflegends.com/en-us/card-gallery/';
  private readonly justTcgBaseUrl = 'https://api.justtcg.com/v1';
  private readonly justTcgGameName = 'riftbound-league-of-legends-trading-card-game';
  private readonly userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

  private galleryCache: { timestamp: number; cards: any[]; sets: any[] } | null = null;
  private readonly CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos

  /**
   * Obtiene el catálogo oficial desde Riot Games:
   * 1. Si existe RIOT_API_KEY aprobada, consulta el endpoint oficial riftbound-content-v1.
   * 2. Como fuente oficial inmediata (sin esperar aprobación de API Key), extrae el catálogo oficial embebido en la Galería Oficial de Riot Games (riftbound.leagueoflegends.com).
   */
  private async fetchOfficialRiotCatalog(): Promise<{ sets: any[]; cards: any[] }> {
    if (this.galleryCache && Date.now() - this.galleryCache.timestamp < this.CACHE_TTL_MS) {
      return { sets: this.galleryCache.sets, cards: this.galleryCache.cards };
    }

    const riotApiKey = process.env.RIOT_API_KEY;
    if (riotApiKey) {
      try {
        const res = await axios.get(`${this.riotOfficialApiUrl}?locale=en`, {
          headers: { 'X-Riot-Token': riotApiKey, 'User-Agent': this.userAgent },
        });
        if (res.data && Array.isArray(res.data.sets)) {
          const sets: any[] = [];
          const cards: any[] = [];
          for (const s of res.data.sets) {
            sets.push({
              id: s.id,
              name: s.name,
              release_date: res.data.lastUpdated || new Date().toISOString(),
            });
            for (const c of s.cards || []) {
              const fullName = c.subtitle ? `${c.name}, ${c.subtitle}` : c.name;
              const rawDomains = c.faction
                ? String(c.faction)
                    .split(/[,/\-]+/)
                    .map((d: string) => d.trim())
                    .filter(Boolean)
                    .map((d: string) => d.charAt(0).toUpperCase() + d.slice(1).toLowerCase())
                : [];
              cards.push({
                id: c.id,
                name: fullName,
                collector_number: c.collectorNumber,
                set: { set_id: s.id, label: s.name },
                classification: {
                  type: c.type || 'Unit',
                  rarity: c.rarity || 'Common',
                  domain: rawDomains.length > 0 ? rawDomains : ['Colorless'],
                },
                text: {
                  plain: c.description || c.effect || c.flavorText || '',
                  rich: c.description || c.effect || '',
                },
                media: {
                  image_url: c.art?.fullURL || c.art?.thumbnailURL || '',
                  artist: c.art?.artist || '',
                },
                tags: c.tags || [],
              });
            }
          }
          this.galleryCache = { timestamp: Date.now(), sets, cards };
          return { sets, cards };
        }
      } catch (err: any) {
        this.logger.warn(`Riot API (riftbound-content-v1) no disponible con la key actual (${err.message}). Usando Galería Oficial de Riot...`);
      }
    }

    try {
      const response = await axios.get(this.riotOfficialGalleryUrl, {
        headers: { 'User-Agent': this.userAgent },
      });
      const html: string = response.data || '';
      const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
      if (match && match[1]) {
        const nextData = JSON.parse(match[1]);
        const blades = nextData?.props?.pageProps?.page?.blades || [];
        const galleryBlade = blades.find((b: any) => b.cards || b.type?.toLowerCase().includes('card'));
        const rawCards: any[] = galleryBlade?.cards?.items || galleryBlade?.cards || [];

        const setsMap = new Map<string, { id: string; name: string; release_date: string }>();
        const normalizedCards: any[] = [];

        // Orden estimado de lanzamiento para que las ediciones nuevas (como Radiance) aparezcan primero
        const setOrderPriority: Record<string, string> = {
          RAD: '2026-10-23T00:00:00.000Z',
          VEN: '2026-07-31T00:00:00.000Z',
          UNL: '2026-05-08T00:00:00.000Z',
          SFD: '2026-02-13T00:00:00.000Z',
          OGN: '2025-10-31T00:00:00.000Z',
          OGS: '2025-10-30T00:00:00.000Z',
        };

        for (const c of rawCards) {
          const setId = c.set?.value?.id || 'RB';
          const setName = c.set?.value?.label || 'Riftbound';
          if (!setsMap.has(setId)) {
            setsMap.set(setId, {
              id: setId,
              name: setName,
              release_date: setOrderPriority[setId] || new Date().toISOString(),
            });
          }

          const publicCode: string = c.publicCode || '';
          const codePart = publicCode.split('-')[1] || '';
          const numAndTotal = codePart.split('/');
          const rawCollectorCode = numAndTotal[0] || String(c.collectorNumber || '');
          const maxInSet = parseInt(numAndTotal[1] || '0', 10);
          const isSpecialPromoCode = /^SP\d+/i.test(rawCollectorCode);
          const isAltArt = /[a-zA-Z]$/.test(rawCollectorCode) && !isSpecialPromoCode;
          const isOvernumbered = maxInSet > 0 && Number(c.collectorNumber) > maxInSet;

          let cardName = c.subtitle ? `${c.name}, ${c.subtitle}` : c.name;
          if (isAltArt && !cardName.toLowerCase().includes('alternate art')) {
            cardName = `${cardName} (Alternate Art)`;
          } else if (isSpecialPromoCode && !cardName.toLowerCase().includes('showcase')) {
            cardName = `${cardName} (Showcase)`;
          } else if (isOvernumbered && c.rarity?.value?.label === 'Showcase' && !cardName.toLowerCase().includes('overnumbered')) {
            cardName = `${cardName} (Overnumbered)`;
          }

          const richBody = c.text?.richText?.body || '';
          const plainBody = richBody.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
          const parsedDomains = Array.isArray(c.domain?.values)
            ? c.domain.values.map((d: any) => d.label).filter(Boolean)
            : [];

          normalizedCards.push({
            id: c.id,
            riftbound_id: c.id,
            name: cardName,
            collector_number: isSpecialPromoCode ? rawCollectorCode : (c.collectorNumber ?? rawCollectorCode),
            set: {
              set_id: setId,
              label: setName,
            },
            classification: {
              type: c.cardType?.type?.[0]?.label || 'Unit',
              rarity: c.rarity?.value?.label || 'Common',
              domain: parsedDomains.length > 0 ? parsedDomains : ['Colorless'],
            },
            text: {
              rich: richBody,
              plain: plainBody,
            },
            media: {
              image_url: c.cardImage?.url || '',
              artist: c.illustrator?.values?.[0]?.label || '',
            },
            tags: c.tags?.tags || [],
          });
        }

        const sets = Array.from(setsMap.values());
        this.galleryCache = { timestamp: Date.now(), sets, cards: normalizedCards };
        return { sets, cards: normalizedCards };
      }
    } catch (err: any) {
      this.logger.warn(`No se pudo obtener catálogo desde la Galería Oficial de Riot: ${err.message}`);
    }

    return { sets: [], cards: [] };
  }

  /**
   * Obtiene todas las cartas impresas de una edición (Set ID) combinando el catálogo oficial de Riot Games y Riftcodex.
   */
  async fetchCardsBySet(setId: string): Promise<any[]> {
    // 1. Intentar obtener primero desde Riftcodex si el set existe ahí con sus tcgplayer_id
    const allCards: any[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      try {
        const url = `${this.riftcodexBaseUrl}/cards?set_id=${setId}&page=${page}`;
        const response = await axios.get(url, {
          headers: { 'User-Agent': this.userAgent }
        });

        const data = response.data;
        const cardList = data?.items || (Array.isArray(data) ? data : []);

        if (cardList.length === 0) {
          hasMore = false;
          break;
        }

        allCards.push(...cardList);

        if (data.page < data.pages) {
          page++;
        } else {
          hasMore = false;
        }
      } catch (error: any) {
        this.logger.warn(`Set ${setId} no disponible en Riftcodex (${error.message}), consultando catálogo oficial de Riot...`);
        hasMore = false;
      }
    }

    if (allCards.length > 0) {
      return allCards;
    }

    // 2. Si Riftcodex aún no tiene el set (ej. Radiance - RAD), obtener directamente del Catálogo Oficial de Riot Games
    const official = await this.fetchOfficialRiotCatalog();
    const riotCards = official.cards.filter(
      (c: any) => c.set?.set_id?.toUpperCase() === setId.toUpperCase() || c.set?.label?.toLowerCase() === setId.toLowerCase(),
    );

    this.logger.log(`[Riftbound] Obtenidas ${riotCards.length} cartas oficiales de Riot Games para el set "${setId}".`);
    return riotCards;
  }

  /**
   * Obtiene y ordena cronológicamente todos los sets de Riftbound combinando el Catálogo Oficial de Riot Games y Riftcodex.
   */
  async fetchSets(): Promise<any[]> {
    const mergedSets = new Map<string, { id: string; name: string; release_date: string }>();

    // 1. Cargar sets oficiales desde Riot Games (incluye Radiance - RAD y futuros lanzamientos inmediatos)
    const official = await this.fetchOfficialRiotCatalog();
    for (const s of official.sets) {
      mergedSets.set(s.id.toUpperCase(), s);
    }

    // 2. Complementar con sets adicionales de Riftcodex (ej. Promos OPP, JDG, PR)
    try {
      const response = await axios.get(`${this.riftcodexBaseUrl}/sets/`, {
        headers: { 'User-Agent': this.userAgent }
      });

      let results = [];
      if (response.data && response.data.items) {
        results = response.data.items;
      } else if (response.data && response.data.results) {
        results = response.data.results;
      } else if (Array.isArray(response.data)) {
        results = response.data;
      }

      for (const s of results) {
        const id = (s.set_id || s.id || '').toUpperCase();
        if (id && !mergedSets.has(id)) {
          mergedSets.set(id, {
            id: s.set_id || s.id || '',
            name: s.name || 'Set sin nombre',
            release_date: s.published_on || s.release_date || new Date().toISOString(),
          });
        }
      }
    } catch (error: any) {
      this.logger.warn(`Error al consultar sets secundarios en Riftcodex: ${error.message}`);
    }

    return Array.from(mergedSets.values()).sort((a: any, b: any) => {
      const dateA = new Date(a.release_date).getTime();
      const dateB = new Date(b.release_date).getTime();
      return (dateB || 0) - (dateA || 0);
    });
  }

  /**
   * Obtiene la lista de sets registrados en JustTCG con propósitos de emparejamiento de precios.
   */
  async fetchJustTcgSets(apiKey: string): Promise<any[]> {
    try {
      const url = `${this.justTcgBaseUrl}/sets?game=${this.justTcgGameName}`;
      const response = await axios.get(url, {
        headers: { 'X-Api-Key': apiKey }
      });
      return response.data?.data || [];
    } catch (error: any) {
      this.logger.error(`Error al consultar sets en JustTCG: ${error.message}`);
      throw new Error(`JustTCG API Error: ${error.message}`);
    }
  }

  /**
   * Obtiene una página específica de precios y variantes de cartas desde la API de JustTCG.
   */
  async fetchJustTcgCardsPage(apiKey: string, setSlug: string, limit: number, offset: number): Promise<any> {
    try {
      const url = `${this.justTcgBaseUrl}/cards?game=${this.justTcgGameName}&set=${setSlug}&limit=${limit}&offset=${offset}`;
      const response = await axios.get(url, {
        headers: { 'X-Api-Key': apiKey }
      });
      return response.data;
    } catch (error: any) {
      this.logger.error(`Error al consultar cartas en JustTCG (Offset: ${offset}): ${error.message}`);
      throw new Error(`JustTCG API Error: ${error.message}`);
    }
  }
}
