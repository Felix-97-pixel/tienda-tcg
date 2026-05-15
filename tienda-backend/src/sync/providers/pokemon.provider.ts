import { TcgProvider } from './base-tcg.provider';
import axios from 'axios';
import { PrismaService } from '../../prisma/prisma.service';

export class PokemonProvider extends TcgProvider {
  constructor(prisma: PrismaService) {
    super('Pokemon', prisma);
  }

  /**
   * Detecta versiones automáticamente desde los precios de TCGPlayer
   */
  override getExpectedVariants(rawCard: any): string[] {
    const prices = rawCard.tcgplayer?.prices || {};
    const variants: string[] = [];

    if (prices.normal) variants.push('Normal');
    if (prices.holofoil) variants.push('Holofoil');
    if (prices.reverseHolofoil) variants.push('Reverse Holofoil');
    if (prices.unlimitedHolofoil) variants.push('Unlimited Holofoil');

    if (variants.length === 0) {
      return ['Normal', 'Holofoil'];
    }

    return variants;
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

      // Pre-cargar acabados de Pokémon
      const normalFinish = await this.prisma.finish.findFirst({ where: { name: 'Normal', game: 'Pokemon' } });
      const holoFinish = await this.prisma.finish.findFirst({ where: { name: 'Holofoil', game: 'Pokemon' } });
      const reverseFinish = await this.prisma.finish.findFirst({ where: { name: 'Reverse Holofoil', game: 'Pokemon' } });
      const unlimitedHoloFinish = await this.prisma.finish.findFirst({ where: { name: 'Unlimited Holofoil', game: 'Pokemon' } });

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

          if (prices.normal?.mid > 0 && normalFinish) {
            await this.prisma.inventoryItem.updateMany({
              where: { product: { externalId: card.id }, finishId: normalFinish.id },
              data: { price: prices.normal.mid }
            });
          }
          if (prices.holofoil?.mid > 0 && holoFinish) {
            await this.prisma.inventoryItem.updateMany({
              where: { product: { externalId: card.id }, finishId: holoFinish.id },
              data: { price: prices.holofoil.mid }
            });
          }
          if (prices.reverseHolofoil?.mid > 0 && reverseFinish) {
            await this.prisma.inventoryItem.updateMany({
              where: { product: { externalId: card.id }, finishId: reverseFinish.id },
              data: { price: prices.reverseHolofoil.mid }
            });
          }
          if (prices.unlimitedHolofoil?.mid > 0 && unlimitedHoloFinish) {
            await this.prisma.inventoryItem.updateMany({
              where: { product: { externalId: card.id }, finishId: unlimitedHoloFinish.id },
              data: { price: prices.unlimitedHolofoil.mid }
            });
          }
          
          updatedCount++;
        }

        this.onProgress?.('pokemon', updatedCount, totalCards, 'price');
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
