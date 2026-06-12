import { TcgProvider } from './base-tcg.provider';
import { PrismaService } from '../../prisma/prisma.service';
import { PokemonService } from '../pokemon.service';

export class PokemonProvider extends TcgProvider {
  constructor(prisma: PrismaService, private readonly pokemonService: PokemonService) {
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

  /**
   * Obtiene cartas externas delegando en PokemonService.
   */
  async fetchExternalSet(setId: string): Promise<any[]> {
    return this.pokemonService.fetchCardsBySet(setId);
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

  /** Actualización de precios usando TCGPlayer (delegado en PokemonService) */
  async updateGamePrices(expansionName: string) {
    this.logger.log(`=== [Pokémon] Iniciando actualización de precios para: "${expansionName}" ===`);

    try {
      // 1. Obtener el ID del set por nombre
      const set = await this.pokemonService.fetchSetByName(expansionName);
      if (!set) {
        this.logger.warn(`[Pokémon] Set "${expansionName}" no encontrado.`);
        return { updated: 0, errors: 1 };
      }

      const setId = set.id;
      this.logger.log(`[Pokémon] Set ID resuelto: ${setId}. Consultando cartas...`);

      // Pre-cargar acabados de Pokémon
      const [normalFinish, holoFinish, reverseFinish, unlimitedHoloFinish] = await Promise.all([
        this.prisma.finish.findFirst({ where: { name: 'Normal', game: 'Pokemon' } }),
        this.prisma.finish.findFirst({ where: { name: 'Holofoil', game: 'Pokemon' } }),
        this.prisma.finish.findFirst({ where: { name: 'Reverse Holofoil', game: 'Pokemon' } }),
        this.prisma.finish.findFirst({ where: { name: 'Unlimited Holofoil', game: 'Pokemon' } })
      ]);

      let page = 1;
      const pageSize = 250;
      let hasMore = true;
      let updatedCount = 0;

      // 2. Recorrer cartas y actualizar precios
      while (hasMore) {
        this.logger.log(`[Pokémon] Consultando página ${page}...`);
        const { cards, totalCount } = await this.pokemonService.fetchCardsPageWithPrices(setId, page, pageSize);

        if (cards.length === 0) break;

        for (const card of cards) {
          const prices = card.tcgplayer?.prices;
          if (!prices) continue;

          const product = await this.prisma.product.findUnique({ where: { externalId: card.id }, select: { id: true } });
          if (!product) continue;

          if (prices.normal?.mid > 0 && normalFinish) {
            await this.prisma.marketPrice.upsert({
              where: { productId_finishId: { productId: product.id, finishId: normalFinish.id } },
              create: { productId: product.id, finishId: normalFinish.id, price: prices.normal.mid },
              update: { price: prices.normal.mid }
            });
          }
          if (prices.holofoil?.mid > 0 && holoFinish) {
            await this.prisma.marketPrice.upsert({
              where: { productId_finishId: { productId: product.id, finishId: holoFinish.id } },
              create: { productId: product.id, finishId: holoFinish.id, price: prices.holofoil.mid },
              update: { price: prices.holofoil.mid }
            });
          }
          if (prices.reverseHolofoil?.mid > 0 && reverseFinish) {
            await this.prisma.marketPrice.upsert({
              where: { productId_finishId: { productId: product.id, finishId: reverseFinish.id } },
              create: { productId: product.id, finishId: reverseFinish.id, price: prices.reverseHolofoil.mid },
              update: { price: prices.reverseHolofoil.mid }
            });
          }
          if (prices.unlimitedHolofoil?.mid > 0 && unlimitedHoloFinish) {
            await this.prisma.marketPrice.upsert({
              where: { productId_finishId: { productId: product.id, finishId: unlimitedHoloFinish.id } },
              create: { productId: product.id, finishId: unlimitedHoloFinish.id, price: prices.unlimitedHolofoil.mid },
              update: { price: prices.unlimitedHolofoil.mid }
            });
          }

          updatedCount++;
        }

        this.onProgress?.('pokemon', updatedCount, totalCount, 'price');
        this.logger.log(`[Pokémon] Página ${page} procesada (${updatedCount}/${totalCount} cartas).`);
        if (cards.length < pageSize) hasMore = false;
        else page++;
      }

      this.logger.log(`[Pokémon] ¡Actualización completada! ${updatedCount} cartas procesadas.`);
      return { updated: updatedCount, errors: 0 };
    } catch (error: any) {
      this.logger.error(`[Pokémon] Error: ${error.message}`);
      return { updated: 0, errors: 1 };
    }
  }
}
