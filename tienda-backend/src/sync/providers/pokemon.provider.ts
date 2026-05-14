import { TcgProvider } from './base-tcg.provider';
import axios from 'axios';
import { PrismaService } from '../../prisma/prisma.service';

export class PokemonProvider extends TcgProvider {
  constructor(prisma: PrismaService) {
    super('Pokemon', prisma);
  }

  async fetchExternalSet(setId: string): Promise<any[]> {
    const allCards = [];
    let page = 1;
    const pageSize = 250;
    let hasMore = true;

    while (hasMore) {
      try {
        const url = `https://api.pokemontcg.io/v2/cards?q=set.id:${setId}&page=${page}&pageSize=${pageSize}`;
        const res = await axios.get(url);
        const data = res.data;

        if (data.data && data.data.length > 0) {
          allCards.push(...data.data);
          if (data.data.length < pageSize) hasMore = false;
          else page++;
        } else {
          hasMore = false;
        }
      } catch (error) {
        this.logger.error(`Error en PokemonTCG API: ${error.message}`);
        hasMore = false;
      }
    }

    return allCards;
  }

  mapToProduct(c: any, categoryId: string) {
    const attrs = c.types ? [...c.types] : [];
    if (c.supertype === 'Energy' && !attrs.includes('Energy')) attrs.push('Energy');

    return {
      externalId: c.id,
      name: c.name,
      image: c.images?.large || c.images?.small || '',
      expansion: c.set.name,
      rarity: c.rarity || 'Common',
      number: c.number,
      attributes: attrs,
      categoryId: categoryId
    };
  }

  /** Actualización de precios usando TCGPlayer (vía PokemonTCG API) */
  async updateGamePrices(expansionName: string) {
    this.logger.log(`=== [Pokémon] Iniciando actualización de precios para: "${expansionName}" ===`);
    
    try {
      // 1. Obtener el ID del set por nombre
      const setsRes = await axios.get(`https://api.pokemontcg.io/v2/sets?q=name:"${expansionName}"`);
      const set = setsRes.data?.data?.[0];
      if (!set) {
        this.logger.warn(`[Pokémon] Set "${expansionName}" no encontrado.`);
        return { updated: 0, errors: 1 };
      }

      const setId = set.id;
      this.logger.log(`[Pokémon] Set ID resuelto: ${setId}. Consultando cartas...`);
      let page = 1;
      const pageSize = 250;
      let hasMore = true;
      let updatedCount = 0;

      // 2. Recorrer cartas y actualizar precios
      while (hasMore) {
        this.logger.log(`[Pokémon] Consultando página ${page}...`);
        const url = `https://api.pokemontcg.io/v2/cards?q=set.id:${setId}&page=${page}&pageSize=${pageSize}&select=id,tcgplayer`;
        const res = await axios.get(url);
        const cards = res.data?.data ?? [];
        const totalCards = res.data?.totalCount || cards.length;

        if (cards.length === 0) break;

        for (const card of cards) {
          const prices = card.tcgplayer?.prices;
          if (!prices) continue;

          const normalPrice = prices.normal?.mid || prices.unlimitedHolofoil?.mid || 0;
          const foilPrice = prices.holofoil?.mid || prices.reverseHolofoil?.mid || 0;

          if (normalPrice > 0) {
            await this.prisma.inventoryItem.updateMany({
              where: { product: { externalId: card.id }, isFoil: false },
              data: { price: normalPrice }
            });
          }
          if (foilPrice > 0) {
            await this.prisma.inventoryItem.updateMany({
              where: { product: { externalId: card.id }, isFoil: true },
              data: { price: foilPrice }
            });
          }
          updatedCount++;
        }

        this.onProgress?.('pokemon', updatedCount, totalCards);
        this.logger.log(`[Pokémon] Página ${page} procesada (${updatedCount}/${totalCards} cartas).`);
        if (cards.length < pageSize) hasMore = false;
        else page++;
      }

      this.logger.log(`[Pokémon] ¡Actualización completada! ${updatedCount} cartas procesadas.`);
      return { updated: updatedCount, errors: 0 };
    } catch (error) {
      this.logger.error(`[Pokémon] Error: ${error.message}`);
      return { updated: 0, errors: 1 };
    }
  }
}
