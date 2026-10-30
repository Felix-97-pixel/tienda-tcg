import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class PokemonService {
  private readonly logger = new Logger(PokemonService.name);
  private readonly baseUrl = 'https://api.pokemontcg.io/v2';

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json',
    };
    const apiKey = process.env.POKEMONTCG_API_KEY || process.env.POKEMON_API_KEY;
    if (apiKey) {
      headers['X-Api-Key'] = apiKey;
    }
    return headers;
  }

  /**
   * Helper con 1 reintento para peticiones a PokemonTCG API
   */
  private async safeGet(url: string, retries = 1): Promise<any> {
    try {
      return await axios.get(url, { headers: this.getHeaders(), timeout: 15000 });
    } catch (error: any) {
      const status = error.response?.status;
      if (retries > 0 && (!status || status >= 500 || status === 429)) {
        await new Promise(res => setTimeout(res, 1500));
        return this.safeGet(url, retries - 1);
      }
      throw error;
    }
  }

  /**
   * Obtiene todas las cartas impresas de una edición (Set ID) realizando el paginado automático.
   */
  async fetchCardsBySet(setId: string): Promise<any[]> {
    const allCards = [];
    let page = 1;
    const pageSize = 250;
    let hasMore = true;

    while (hasMore) {
      try {
        const url = `${this.baseUrl}/cards?q=set.id:${setId}&page=${page}&pageSize=${pageSize}`;
        const response = await this.safeGet(url);
        const data = response.data;

        if (data.data && data.data.length > 0) {
          allCards.push(...data.data);
          if (data.data.length < pageSize) {
            hasMore = false;
          } else {
            page++;
          }
        } else {
          hasMore = false;
        }

        // Delay preventivo para rate limiting
        await new Promise((resolve) => setTimeout(resolve, 80));
      } catch (error: any) {
        this.logger.error(`Error al consultar cartas del set ${setId} en PokemonTCG API: ${error.message}`);
        throw new Error(`PokemonTCG API Error: ${error.message}`);
      }
    }

    return allCards;
  }

  /**
   * Obtiene los metadatos de un Set Pokémon buscando por su nombre exacto.
   */
  async fetchSetByName(expansionName: string): Promise<any> {
    try {
      const url = `${this.baseUrl}/sets?q=name:"${encodeURIComponent(expansionName)}"`;
      const response = await this.safeGet(url);
      const sets = response.data?.data;
      return sets && sets.length > 0 ? sets[0] : null;
    } catch (error: any) {
      this.logger.error(`Error al buscar el set "${expansionName}" en PokemonTCG API: ${error.message}`);
      throw new Error(`PokemonTCG API Error: ${error.message}`);
    }
  }

  /**
   * Obtiene una página específica de cartas de un set con selección de campos (id, tcgplayer)
   * optimizando drásticamente la transferencia de datos para actualizaciones de precios.
   */
  async fetchCardsPageWithPrices(setId: string, page: number, pageSize: number): Promise<{ cards: any[]; totalCount: number }> {
    try {
      const url = `${this.baseUrl}/cards?q=set.id:${setId}&page=${page}&pageSize=${pageSize}&select=id,tcgplayer`;
      const response = await this.safeGet(url);
      const data = response.data;
      return {
        cards: data?.data ?? [],
        totalCount: data?.totalCount || 0
      };
    } catch (error: any) {
      this.logger.error(`Error al consultar precios del set ${setId} (pág. ${page}): ${error.message}`);
      throw new Error(`PokemonTCG API Error: ${error.message}`);
    }
  }

  /**
   * Obtiene la lista completa de ediciones de Pokémon desde la API de forma cronológica.
   */
  async fetchSets(): Promise<any[]> {
    try {
      const response = await this.safeGet(`${this.baseUrl}/sets`);
      const data = response.data?.data || [];
      return data.sort((a: any, b: any) =>
        new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
      );
    } catch (error: any) {
      this.logger.error(`Error al consultar sets de Pokémon: ${error.message}`);
      return [];
    }
  }
}
