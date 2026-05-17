import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class RiftboundService {
  private readonly logger = new Logger(RiftboundService.name);
  private readonly riftcodexBaseUrl = 'https://api.riftcodex.com';
  private readonly justTcgBaseUrl = 'https://api.justtcg.com/v1';
  private readonly justTcgGameName = 'riftbound-league-of-legends-trading-card-game';
  private readonly userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

  /**
   * Obtiene todas las cartas impresas de una edición (Set ID) desde la API de Riftcodex.
   */
  async fetchCardsBySet(setId: string): Promise<any[]> {
    const allCards = [];
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
        this.logger.error(`Error al consultar cartas del set ${setId} en Riftcodex: ${error.message}`);
        throw new Error(`Riftcodex API Error: ${error.message}`);
      }
    }

    return allCards;
  }

  /**
   * Obtiene y ordena cronológicamente todos los sets de Riftbound desde la API de Riftcodex.
   */
  async fetchSets(): Promise<any[]> {
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

      const mappedSets = results.map((s: any) => ({
        id: s.set_id || s.id || '',
        name: s.name || 'Set sin nombre',
        release_date: s.published_on || s.release_date || new Date().toISOString()
      }));

      return mappedSets.sort((a: any, b: any) => {
        const dateA = new Date(a.release_date).getTime();
        const dateB = new Date(b.release_date).getTime();
        return (dateB || 0) - (dateA || 0);
      });
    } catch (error: any) {
      this.logger.error(`Error al consultar sets en Riftcodex: ${error.message}`);
      return [];
    }
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
