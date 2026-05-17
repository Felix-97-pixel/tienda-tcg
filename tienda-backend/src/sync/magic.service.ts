import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class MagicService {
  private readonly logger = new Logger(MagicService.name);
  private readonly baseUrl = 'https://api.scryfall.com';

  /**
   * Obtiene los metadatos de una carta individual por su Scryfall ID único.
   */
  async fetchCardById(scryfallId: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/cards/${scryfallId}`);
      return response.data;
    } catch (error: any) {
      this.logger.error(`Error al consultar la carta ${scryfallId} en Scryfall: ${error.message}`);
      throw new Error(`Scryfall API Error: ${error.message}`);
    }
  }

  /**
   * Obtiene todas las cartas impresas de una edición (Set Code).
   * Este método incluye el retardo de seguridad (rate limiting) de 80ms recomendado por Scryfall.
   */
  async fetchCardsBySet(setCode: string): Promise<any[]> {
    const allCards = [];
    let url = `${this.baseUrl}/cards/search?q=set:${setCode}+-is:digital&unique=prints`;
    let hasMore = true;

    while (hasMore) {
      try {
        const response = await axios.get(url);
        const data = response.data;
        if (data.data) {
          allCards.push(...data.data);
        }
        
        if (data.has_more && data.next_page) {
          url = data.next_page;
        } else {
          hasMore = false;
        }

        // Delay para respetar el Rate Limiting solicitado por Scryfall
        await new Promise((resolve) => setTimeout(resolve, 80));
      } catch (error: any) {
        this.logger.error(`Error al consultar el set ${setCode} en Scryfall: ${error.message}`);
        throw new Error(`Scryfall API Error: ${error.message}`);
      }
    }

    return allCards;
  }

  /**
   * Obtiene la lista de ediciones de Magic desde MTGJSON de forma cronológica.
   */
  async fetchSets(): Promise<any[]> {
    try {
      const res = await axios.get('https://mtgjson.com/api/v5/SetList.json');
      const data = res.data?.data || [];
      return data.sort((a: any, b: any) =>
        new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
      );
    } catch (error: any) {
      this.logger.error(`Error al consultar sets de Magic en MTGJSON: ${error.message}`);
      return [];
    }
  }

  /**
   * Obtiene la lista completa de sets desde Scryfall para resolver códigos de set.
   */
  async fetchScryfallSets(): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/sets`);
      return response.data?.data || [];
    } catch (error: any) {
      this.logger.error(`Error al consultar sets de Scryfall: ${error.message}`);
      return [];
    }
  }
}
