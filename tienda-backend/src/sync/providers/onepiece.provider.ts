import { TcgProvider } from './base-tcg.provider';
import { PrismaService } from '../../prisma/prisma.service';
import { ScrydexService } from '../scrydex.service';

export class OnePieceProvider extends TcgProvider {
  constructor(
    prisma: PrismaService,
    private readonly scrydexService: ScrydexService,
  ) {
    super('onepiece', prisma);
  }

  protected override async getGameId(): Promise<string> {
    const setting = await this.prisma.globalSetting.findUnique({ where: { key: 'onepiece_sync_game_id' } });
    if (!setting || !setting.value) {
      // Fallback: buscar juego con slug 'onepiece' o 'one-piece'
      const game = await this.prisma.game.findFirst({
        where: {
          OR: [
            { slug: 'onepiece' },
            { slug: 'one-piece' },
            { name: { contains: 'One Piece', mode: 'insensitive' } }
          ]
        }
      });
      if (game) return game.id;
      throw new Error(`El Juego (Game ID) no está configurado para 'onepiece'. Ve a Configuración -> Destinos de Sincronización.`);
    }
    return setting.value;
  }

  override getExpectedVariants(rawCard: any): string[] {
    const variants: string[] = ['Normal'];
    const rarity = (rawCard.rarity || '').toUpperCase();

    // Raras, Super Raras y Secretas en One Piece traen foil garantizado
    if (['R', 'SR', 'SEC', 'L', 'SP'].includes(rarity) || rawCard.isParallel || rawCard.isAltArt) {
      variants.push('Foil');
    }
    return variants;
  }

  async fetchExternalSet(setId: string): Promise<any[]> {
    let page = 1;
    const pageSize = 250;
    let allCards: any[] = [];
    let hasMore = true;

    while (hasMore) {
      const { cards, totalCount } = await this.scrydexService.fetchCardsPageWithPrices('onepiece', setId, page, pageSize);
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

  async fetchAllSets(): Promise<{ id: string; name: string }[]> {
    const sets = await this.scrydexService.fetchSets('onepiece');
    return sets.map((s) => ({ id: s.id, name: s.name || s.id }));
  }

  mapToProduct(c: any, categoryId: string) {
    const attrs: string[] = [];
    if (c.color) attrs.push(c.color);
    if (c.card_type || c.type) attrs.push(c.card_type || c.type);
    if (c.attribute) attrs.push(c.attribute);

    const imageUrl =
      c.images?.[0]?.large ||
      c.images?.[0]?.medium ||
      c.images?.[0]?.small ||
      c.imageUrl ||
      '';

    const expansionName = c.expansion?.name || c.set?.name || c.expansion_id || 'One Piece Set';
    const expansionExtId = c.expansion?.id || c.set?.id || c.expansion_id || '';

    return {
      externalId: c.id,
      name: c.name,
      description: Array.isArray(c.rules) ? c.rules.join('\n') : c.effect || c.description || '',
      image: imageUrl,
      expansion: expansionName,
      expansionExternalId: expansionExtId,
      rarity: c.rarity || 'Common',
      number: c.collector_number || c.number || '',
      attributes: attrs,
      categoryId: categoryId,
    };
  }

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
   * Actualiza precios de One Piece mediante Scrydex forzando pageSize=250 para gastar 1 crédito por set.
   * Guarda automáticamente los snapshots en MarketPriceHistory mediante saveMarketPrice.
   */
  async updateGamePrices(expansionName: string) {
    this.logger.log(`=== [One Piece] Iniciando actualización de precios para: "${expansionName}" ===`);

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
        const set = await this.scrydexService.fetchSetByName('onepiece', resolvedName);
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
        this.logger.warn(`[One Piece] Set "${resolvedName}" no encontrado en Scrydex.`);
        return { updated: 0, errors: 1 };
      }

      const gameId = await this.getGameId();

      const ensureFinish = async (name: string) => {
        let finish = await this.prisma.finish.findFirst({ where: { name, gameId } });
        if (!finish) {
          finish = await this.prisma.finish.create({ data: { name, gameId } });
          this.logger.log(`[One Piece] Acabado creado: ${name}`);
        }
        return finish;
      };

      const [normalFinish, foilFinish] = await Promise.all([
        ensureFinish('Normal'),
        ensureFinish('Foil'),
      ]);

      let page = 1;
      const pageSize = 250;
      let hasMore = true;
      let updatedCount = 0;
      const csvRecords: string[] = ['productId,finishId,price'];

      while (hasMore) {
        this.logger.log(`[One Piece] Consultando página ${page} de "${setId}" en Scrydex (Bulk 250)...`);
        const { cards, totalCount } = await this.scrydexService.fetchCardsPageWithPrices('onepiece', setId, page, pageSize);

        if (cards.length === 0) break;

        for (const card of cards) {
          const product = await this.prisma.product.findUnique({
            where: { externalId: card.id },
            select: { id: true },
          });
          if (!product) continue;

          // Extraer precios de TCGPlayer a través de las variantes de Scrydex
          const normalPrice = this.scrydexService.extractVariantPrice(card, 'normal');
          const foilPrice = this.scrydexService.extractVariantPrice(card, 'foil');

          if (normalPrice && Number(normalPrice) > 0 && normalFinish) {
            await this.saveMarketPrice(product.id, normalFinish.id, Number(normalPrice));
            csvRecords.push(`${product.id},${normalFinish.id},${normalPrice}`);
          }

          if (foilPrice && Number(foilPrice) > 0 && foilFinish) {
            await this.saveMarketPrice(product.id, foilFinish.id, Number(foilPrice));
            csvRecords.push(`${product.id},${foilFinish.id},${foilPrice}`);
          }

          updatedCount++;
        }

        this.onProgress?.('onepiece', updatedCount, totalCount, 'price');
        this.logger.log(`[One Piece] Página ${page} procesada (${updatedCount}/${totalCount} cartas actualizadas).`);

        if (cards.length < pageSize) {
          hasMore = false;
        } else {
          page++;
        }
      }

      await this.cleanEmptyInventory(expansionName);

      if (csvRecords.length > 1) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `onepiece_sync_${timestamp}.csv`;
        const csvData = csvRecords.join('\n');
        await this.prisma.syncBackup.create({
          data: { game: 'onepiece', filename: fileName, csvData },
        });
      }

      return { updated: updatedCount, errors: 0 };
    } catch (e: any) {
      this.logger.error(`Error actualizando precios de One Piece: ${e.message}`);
      return { updated: 0, errors: 1 };
    }
  }
}

