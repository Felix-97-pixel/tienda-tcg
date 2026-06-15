import { TcgProvider } from './base-tcg.provider';
import { PrismaService } from '../../prisma/prisma.service';
import { PokemonService } from '../pokemon.service';

export class PokemonProvider extends TcgProvider {
  constructor(prisma: PrismaService, private readonly pokemonService: PokemonService) {
    super('Pokemon', prisma);
  }

  protected override async getGameId(): Promise<string> {
    const setting = await this.prisma.globalSetting.findUnique({ where: { key: 'pokemon_sync_game_id' } });
    if (!setting || !setting.value) {
      throw new Error(`El Juego (Game ID) no está configurado para el destino 'Pokemon'. Ve a Configuración -> Destinos de Sincronización.`);
    }
    return setting.value;
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

  async fetchAllSets(): Promise<{id: string, name: string}[]> {
    const sets = await this.pokemonService.fetchSets();
    return sets.map(s => ({ id: s.id, name: s.name }));
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

  /**
   * Busca o crea un producto en la BD para la subida masiva.
   * En Pokémon, buscamos por número y expansión, o por nombre.
   */
  async findProductForBulkUpload(itemData: any, categoryId: string): Promise<any> {
    let product = null;

    if (itemData.collectorNum) {
      product = await this.prisma.product.findFirst({
        where: {
          categoryId,
          cardDetail: {
            expansion: itemData.expansion,
            collectorNum: itemData.collectorNum
          }
        },
        include: { items: true, marketPrices: true }
      });
    }

    if (!product) {
      product = await this.prisma.product.findFirst({
        where: {
          categoryId,
          name: itemData.name,
          cardDetail: { expansion: itemData.expansion }
        },
        include: { items: true, marketPrices: true }
      });
    }

    // Como no tenemos un ID de Pokémon TCG API en itemData por ahora en el CSV genérico,
    // simplemente retornaremos el producto local si se encontró.
    return { product, externalData: null };
  }

  /** Actualización de precios usando TCGPlayer (delegado en PokemonService) */
  async updateGamePrices(expansionName: string) {
    this.logger.log(`=== [Pokémon] Iniciando actualización de precios para: "${expansionName}" ===`);

    try {
      // 1. Resolver Expansion
      const expansion = await this.prisma.expansion.findFirst({
        where: {
          OR: [
            { id: expansionName },
            { name: { equals: expansionName, mode: 'insensitive' } }
          ],
          gameId: await this.getGameId()
        }
      });
      const resolvedName = expansion?.name || expansionName;

      let setId = expansion?.externalId;
      if (!setId) {
        const set = await this.pokemonService.fetchSetByName(resolvedName);
        if (set && expansion) {
          setId = set.id;
          await this.prisma.expansion.update({
            where: { id: expansion.id },
            data: { externalId: setId }
          });
        } else if (set) {
          setId = set.id;
        }
      }

      if (!setId) {
        this.logger.warn(`[Pokémon] Set "${resolvedName}" no encontrado.`);
        return { updated: 0, errors: 1 };
      }

      this.logger.log(`[Pokémon] Set ID resuelto: ${setId}. Consultando cartas...`);

      // Pre-cargar acabados de Pokémon
      const gameId = await this.getGameId();
      
      const ensureFinish = async (name: string) => {
        let finish = await this.prisma.finish.findFirst({ where: { name, gameId } });
        if (!finish) {
          finish = await this.prisma.finish.create({ data: { name, gameId } });
          this.logger.log(`[Pokémon] Creado nuevo acabado dinámicamente: ${name}`);
        }
        return finish;
      };

      const [normalFinish, holoFinish, reverseFinish, unlimitedHoloFinish] = await Promise.all([
        ensureFinish('Normal'),
        ensureFinish('Holofoil'),
        ensureFinish('Reverse Holofoil'),
        ensureFinish('Unlimited Holofoil')
      ]);

      let page = 1;
      const pageSize = 250;
      let hasMore = true;
      let updatedCount = 0;
      const csvRecords: string[] = ['productId,finishId,price'];

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
            csvRecords.push(`${product.id},${normalFinish.id},${prices.normal.mid}`);
          }
          if (prices.holofoil?.mid > 0 && holoFinish) {
            await this.prisma.marketPrice.upsert({
              where: { productId_finishId: { productId: product.id, finishId: holoFinish.id } },
              create: { productId: product.id, finishId: holoFinish.id, price: prices.holofoil.mid },
              update: { price: prices.holofoil.mid }
            });
            csvRecords.push(`${product.id},${holoFinish.id},${prices.holofoil.mid}`);
          }
          if (prices.reverseHolofoil?.mid > 0 && reverseFinish) {
            await this.prisma.marketPrice.upsert({
              where: { productId_finishId: { productId: product.id, finishId: reverseFinish.id } },
              create: { productId: product.id, finishId: reverseFinish.id, price: prices.reverseHolofoil.mid },
              update: { price: prices.reverseHolofoil.mid }
            });
            csvRecords.push(`${product.id},${reverseFinish.id},${prices.reverseHolofoil.mid}`);
          }
          if (prices.unlimitedHolofoil?.mid > 0 && unlimitedHoloFinish) {
            await this.prisma.marketPrice.upsert({
              where: { productId_finishId: { productId: product.id, finishId: unlimitedHoloFinish.id } },
              create: { productId: product.id, finishId: unlimitedHoloFinish.id, price: prices.unlimitedHolofoil.mid },
              update: { price: prices.unlimitedHolofoil.mid }
            });
            csvRecords.push(`${product.id},${unlimitedHoloFinish.id},${prices.unlimitedHolofoil.mid}`);
          }

          updatedCount++;
        }

        this.onProgress?.('pokemon', updatedCount, totalCount, 'price');
        this.logger.log(`[Pokémon] Página ${page} procesada (${updatedCount}/${totalCount} cartas).`);
        if (cards.length < pageSize) hasMore = false;
        else page++;
      }

      // 3. Limpiar variantes que quedaron vacías
      await this.cleanEmptyInventory(expansionName);

      // Guardar CSV de respaldo en BD
      if (csvRecords.length > 1) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `pokemon_sync_${timestamp}.csv`;
        const csvData = csvRecords.join('\n');
        
        await this.prisma.syncBackup.create({
          data: { game: 'pokemon', filename: fileName, csvData }
        });
        this.logger.log(`[Pokémon] Backup CSV guardado en BD: ${fileName}`);
      }

      this.logger.log(`[Pokémon] ¡Actualización completada! ${updatedCount} cartas procesadas.`);
      return { updated: updatedCount, errors: 0 };
    } catch (error: any) {
      this.logger.error(`[Pokémon] Error: ${error.message}`);
      return { updated: 0, errors: 1 };
    }
  }
}
