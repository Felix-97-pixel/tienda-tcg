import { TcgProvider } from './base-tcg.provider';
import { PrismaService } from '../../prisma/prisma.service';
import { ScrydexService } from '../scrydex.service';

export class PokemonProvider extends TcgProvider {
  constructor(
    prisma: PrismaService,
    private readonly scrydexService: ScrydexService
  ) {
    super('Pokemon', prisma);
  }

  protected override async getGameId(): Promise<string> {
    const setting = await this.prisma.globalSetting.findUnique({ where: { key: 'pokemon_sync_game_id' } });
    if (!setting || !setting.value) {
      const game = await this.prisma.game.findFirst({
        where: {
          OR: [
            { slug: 'pok-mon-tcg' },
            { slug: 'pokemon' },
            { name: { contains: 'Pokemon', mode: 'insensitive' } }
          ]
        }
      });
      if (game) return game.id;
      throw new Error(`El Juego (Game ID) no está configurado para el destino 'Pokemon'. Ve a Configuración -> Destinos de Sincronización.`);
    }
    return setting.value;
  }

  /**
   * Detecta versiones automáticamente desde las variantes de Scrydex
   */
  override getExpectedVariants(rawCard: any): string[] {
    const variants: string[] = ['Normal'];
    if (Array.isArray(rawCard.variants)) {
      for (const v of rawCard.variants) {
        const vName = (v.name || '').toLowerCase();
        if (vName.includes('reverse') && !variants.includes('Reverse Holofoil')) {
          variants.push('Reverse Holofoil');
        } else if (vName.includes('holo') && !vName.includes('reverse') && !variants.includes('Holofoil')) {
          variants.push('Holofoil');
        }
      }
    }
    return variants;
  }

  /**
   * Obtiene cartas externas delegando en ScrydexService.
   */
  async fetchExternalSet(setId: string): Promise<any[]> {
    let page = 1;
    const pageSize = 250;
    let allCards: any[] = [];
    let hasMore = true;

    while (hasMore) {
      const { cards, totalCount } = await this.scrydexService.fetchCardsPageWithPrices('pokemon', setId, page, pageSize);
      if (cards.length === 0) break;
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
   * Retorna sets de Pokémon oficiales en inglés de Scrydex,
   * excluyendo colecciones digitales de Pocket (tcgp-) y sets japoneses (_ja).
   */
  async fetchAllSets(): Promise<{ id: string; name: string }[]> {
    const sets = await this.scrydexService.fetchSets('pokemon');
    return sets
      .filter((s) => !s.id?.startsWith('tcgp-') && (s.language === 'English' || s.language_code === 'EN'))
      .map((s) => ({ id: s.id, name: s.name || s.id }));
  }

  mapToProduct(c: any, categoryId: string) {
    const attrs: string[] = [];
    if (Array.isArray(c.types)) attrs.push(...c.types);
    if (c.supertype) attrs.push(c.supertype);
    if (Array.isArray(c.subtypes)) attrs.push(...c.subtypes);

    const imageUrl =
      c.images?.[0]?.large ||
      c.images?.[0]?.medium ||
      c.images?.[0]?.small ||
      c.imageUrl ||
      '';

    const expansionName = c.expansion?.name || c.set?.name || 'Pokemon Set';
    const expansionExtId = c.expansion?.id || c.set?.id || '';

    return {
      externalId: c.id,
      name: c.name,
      description: Array.isArray(c.rules) ? c.rules.join('\n') : c.description || '',
      image: imageUrl,
      expansion: expansionName,
      expansionExternalId: expansionExtId,
      rarity: c.rarity || 'Common',
      number: c.collector_number || c.printed_number || c.number || '',
      attributes: attrs,
      categoryId: categoryId,
    };
  }

  /**
   * Busca un producto en la BD para la subida masiva.
   */
  async findProductForBulkUpload(itemData: any, categoryId: string): Promise<any> {
    let product = null;

    if (itemData.collectorNum) {
      product = await this.prisma.product.findFirst({
        where: {
          categoryId,
          cardDetail: {
            expansion: itemData.expansion,
            collectorNum: itemData.collectorNum,
          },
        },
        include: { items: true, marketPrices: true, cardDetail: true },
      });
    }

    if (!product) {
      product = await this.prisma.product.findFirst({
        where: {
          categoryId,
          name: itemData.name,
          cardDetail: { expansion: itemData.expansion },
        },
        include: { items: true, marketPrices: true, cardDetail: true },
      });
    }

    return { product, externalData: null };
  }

  /**
   * Actualización de precios de Pokémon usando Scrydex con snapshots históricos.
   */
  async updateGamePrices(expansionName: string) {
    this.logger.log(`=== [Pokémon] Iniciando actualización de precios para: "${expansionName}" ===`);

    try {
      const expansion = await this.prisma.expansion.findFirst({
        where: {
          OR: [
            { id: expansionName },
            { name: { equals: expansionName, mode: 'insensitive' } },
          ],
          gameId: await this.getGameId(),
        },
      });
      const resolvedName = expansion?.name || expansionName;

      let setId = expansion?.externalId;
      if (!setId) {
        const set = await this.scrydexService.fetchSetByName('pokemon', resolvedName);
        if (set && expansion) {
          setId = set.id;
          await this.prisma.expansion.update({
            where: { id: expansion.id },
            data: { externalId: setId },
          });
        } else if (set) {
          setId = set.id;
        }
      }

      if (!setId) {
        this.logger.warn(`[Pokémon] Set "${resolvedName}" no encontrado en Scrydex.`);
        return { updated: 0, errors: 1 };
      }

      const gameId = await this.getGameId();

      const ensureFinish = async (name: string) => {
        let finish = await this.prisma.finish.findFirst({ where: { name, gameId } });
        if (!finish) {
          finish = await this.prisma.finish.create({ data: { name, gameId } });
          this.logger.log(`[Pokémon] Acabado creado: ${name}`);
        }
        return finish;
      };

      const [normalFinish, holoFinish, reverseFinish] = await Promise.all([
        ensureFinish('Normal'),
        ensureFinish('Holofoil'),
        ensureFinish('Reverse Holofoil'),
      ]);

      let page = 1;
      const pageSize = 250;
      let hasMore = true;
      let updatedCount = 0;
      const csvRecords: string[] = ['productId,finishId,price'];

      while (hasMore) {
        const { cards, totalCount } = await this.scrydexService.fetchCardsPageWithPrices('pokemon', setId, page, pageSize);
        if (cards.length === 0) break;

        for (const card of cards) {
          const product = await this.prisma.product.findUnique({
            where: { externalId: card.id },
            select: { id: true },
          });
          if (!product) continue;

          const normalPrice = this.scrydexService.extractVariantPrice(card, 'normal');
          const holoPrice =
            this.scrydexService.extractVariantPrice(card, 'holofoil') ??
            this.scrydexService.extractVariantPrice(card, 'holo');
          const reversePrice =
            this.scrydexService.extractVariantPrice(card, 'reverseHolofoil') ??
            this.scrydexService.extractVariantPrice(card, 'reverse');

          if (normalPrice != null && normalPrice > 0 && normalFinish) {
            await this.saveMarketPrice(product.id, normalFinish.id, normalPrice);
            csvRecords.push(`${product.id},${normalFinish.id},${normalPrice}`);
          }
          if (holoPrice != null && holoPrice > 0 && holoFinish) {
            await this.saveMarketPrice(product.id, holoFinish.id, holoPrice);
            csvRecords.push(`${product.id},${holoFinish.id},${holoPrice}`);
          }
          if (reversePrice != null && reversePrice > 0 && reverseFinish) {
            await this.saveMarketPrice(product.id, reverseFinish.id, reversePrice);
            csvRecords.push(`${product.id},${reverseFinish.id},${reversePrice}`);
          }

          updatedCount++;
        }

        this.onProgress?.('pokemon', updatedCount, totalCount, 'price');
        if (cards.length === 0 || updatedCount >= totalCount) {
          hasMore = false;
        } else {
          page++;
        }
      }

      await this.cleanEmptyInventory(expansionName);

      if (csvRecords.length > 1) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `pokemon_sync_${timestamp}.csv`;
        const csvData = csvRecords.join('\n');
        await this.prisma.syncBackup.create({
          data: { game: 'pokemon', filename: fileName, csvData },
        });
      }

      this.logger.log(`[Pokémon] ¡Actualización completada! ${updatedCount} cartas procesadas.`);
      return { updated: updatedCount, errors: 0 };
    } catch (error: any) {
      this.logger.error(`[Pokémon] Error: ${error.message}`);
      return { updated: 0, errors: 1 };
    }
  }
}
