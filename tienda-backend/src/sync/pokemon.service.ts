import { Injectable, Logger } from '@nestjs/common';
import { ScrydexService } from './scrydex.service';

@Injectable()
export class PokemonService {
  private readonly logger = new Logger(PokemonService.name);

  constructor(private readonly scrydexService: ScrydexService) {}

  /**
   * Obtiene la lista completa de ediciones de Pokémon delegando en Scrydex
   */
  async fetchSets(): Promise<any[]> {
    try {
      const sets = await this.scrydexService.fetchSets('pokemon');
      return sets
        .filter((s) => !s.id?.startsWith('tcgp-') && (!s.language || s.language === 'English' || s.language_code === 'EN'))
        .map((s) => ({
          id: s.id,
          name: s.name || s.id,
          code: s.code || '',
          releaseDate: s.release_date || (s as any).releaseDate,
          total: s.total,
          images: {
            logo: (s as any).logo || s.images?.logo,
            symbol: (s as any).symbol || s.images?.symbol,
          },
        }))
        .sort((a, b) =>
          new Date(b.releaseDate || 0).getTime() - new Date(a.releaseDate || 0).getTime()
        );
    } catch (error: any) {
      this.logger.error(`Error al consultar sets de Pokémon en Scrydex: ${error.message}`);
      return [];
    }
  }

  /**
   * Obtiene los metadatos de un Set Pokémon buscando por su nombre exacto o id en Scrydex
   */
  async fetchSetByName(expansionName: string): Promise<any> {
    try {
      return await this.scrydexService.fetchSetByName('pokemon', expansionName);
    } catch (error: any) {
      this.logger.error(`Error al buscar set "${expansionName}" en Scrydex: ${error.message}`);
      return null;
    }
  }

  /**
   * Obtiene todas las cartas de una edición delegando en Scrydex
   */
  async fetchCardsBySet(setId: string): Promise<any[]> {
    let page = 1;
    const pageSize = 250;
    let allCards: any[] = [];
    let hasMore = true;

    while (hasMore) {
      const { cards, totalCount } = await this.scrydexService.fetchCardsPageWithPrices('pokemon', setId, page, pageSize);
      if (!cards || cards.length === 0) break;
      allCards = allCards.concat(cards);
      if (allCards.length >= totalCount || cards.length === 0) {
        hasMore = false;
      } else {
        page++;
      }
    }

    return allCards;
  }

  /**
   * Obtiene página de cartas con precios delegando en Scrydex
   */
  async fetchCardsPageWithPrices(setId: string, page: number, pageSize: number): Promise<{ cards: any[]; totalCount: number }> {
    return this.scrydexService.fetchCardsPageWithPrices('pokemon', setId, page, pageSize);
  }
}
