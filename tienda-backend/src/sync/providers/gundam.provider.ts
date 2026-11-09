import { TcgProvider } from './base-tcg.provider';
import { PrismaService } from '../../prisma/prisma.service';
import { ScrydexService, ScrydexCard } from '../scrydex.service';

export class GundamProvider extends TcgProvider {
  constructor(
    prisma: PrismaService,
    private readonly scrydexService: ScrydexService,
  ) {
    super('gundam', prisma);
  }

  protected override async getGameId(): Promise<string> {
    const setting = await this.prisma.globalSetting.findUnique({
      where: { key: 'gundam_sync_game_id' },
    });
    if (!setting || !setting.value) {
      throw new Error(
        `El Juego (Game ID) no está configurado para el destino 'gundam'. Ve a Configuración -> Destinos de Sincronización.`
      );
    }
    return setting.value;
  }

  override getExpectedVariants(rawCard: any): string[] {
    const variants: string[] = [];
    if (rawCard.variants && Array.isArray(rawCard.variants)) {
      for (const v of rawCard.variants) {
        const vName = (v.name || '').toLowerCase();
        if (vName.includes('foil') || vName.includes('holo')) {
          if (!variants.includes('Foil')) variants.push('Foil');
        } else {
          if (!variants.includes('Normal')) variants.push('Normal');
        }
      }
    }
    return variants.length > 0 ? variants : ['Normal', 'Foil'];
  }

  async fetchExternalSet(setId: string): Promise<any[]> {
    const allCards: ScrydexCard[] = [];
    let page = 1;
    const pageSize = 250;
    let hasMore = true;

    while (hasMore) {
      const { cards, totalCount } = await this.scrydexService.fetchCardsPageWithPrices(
        'gundam',
        setId,
        page,
        pageSize
      );
      if (cards.length === 0) break;
      allCards.push(...cards);
      if (cards.length === 0 || allCards.length >= totalCount) {
        hasMore = false;
      } else {
        page++;
      }
    }

    return allCards;
  }

  async fetchAllSets(): Promise<{ id: string; name: string }[]> {
    const sets = await this.scrydexService.fetchSets('gundam');
    return sets.map((s) => ({
      id: s.id || s.code,
      name: s.name,
    }));
  }

  mapToProduct(c: any, categoryId: string) {
    const attrs: string[] = [];
    if (c.color) attrs.push(c.color);
    if (c.type) attrs.push(c.type);
    if (Array.isArray(c.traits)) attrs.push(...c.traits);
    if (Array.isArray(c.subtypes)) attrs.push(...c.subtypes);

    const imageUrl =
      c.images?.[0]?.large ||
      c.images?.[0]?.medium ||
      c.images?.[0]?.small ||
      c.imageUrl ||
      '';

    const expansionName = c.expansion?.name || c.set_name || 'Gundam Card Game';
    const expansionExtId = c.expansion?.id || c.set_id || '';

    return {
      externalId: c.id,
      name: c.name,
      description: Array.isArray(c.rules) ? c.rules.join('\n') : c.effect || c.description || '',
      image: imageUrl,
      expansion: expansionName,
      expansionExternalId: expansionExtId,
      rarity: c.rarity || 'Common',
      number: c.collector_number || c.printed_number || c.number || '',
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

  async updateGamePrices(expansionName: string) {
    this.logger.log(`=== [Gundam Card Game] Iniciando actualización de precios para: "${expansionName}" ===`);

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
        const set = await this.scrydexService.fetchSetByName('gundam', resolvedName);
        if (set && expansion) {
          setId = set.id || set.code;
          await this.prisma.expansion.update({
            where: { id: expansion.id },
            data: { externalId: setId },
          });
        } else if (set) {
          setId = set.id || set.code;
        }
      }

      if (!setId) {
        this.logger.warn(`[Gundam] Set "${resolvedName}" no encontrado en Scrydex.`);
        return { updated: 0, errors: 1 };
      }

      const gameId = await this.getGameId();

      const ensureFinish = async (name: string) => {
        let finish = await this.prisma.finish.findFirst({ where: { name, gameId } });
        if (!finish) {
          finish = await this.prisma.finish.create({ data: { name, gameId } });
          this.logger.log(`[Gundam] Acabado creado: ${name}`);
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
        this.logger.log(`[Gundam] Consultando página ${page} de "${setId}" en Scrydex (Bulk 250)...`);
        const { cards, totalCount } = await this.scrydexService.fetchCardsPageWithPrices(
          'gundam',
          setId,
          page,
          pageSize
        );

        if (cards.length === 0) break;

        for (const card of cards) {
          const product = await this.prisma.product.findUnique({
            where: { externalId: card.id },
            select: { id: true },
          });
          if (!product) continue;

          const normalPrice = this.scrydexService.extractVariantPrice(card, 'normal');
          const foilPrice =
            this.scrydexService.extractVariantPrice(card, 'holofoil') ||
            this.scrydexService.extractVariantPrice(card, 'foil') ||
            this.scrydexService.extractVariantPrice(card, 'altArt');

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

        this.onProgress?.('gundam', updatedCount, totalCount, 'price');
        this.logger.log(`[Gundam] Página ${page} procesada (${updatedCount}/${totalCount} cartas actualizadas).`);

        if (cards.length < pageSize) {
          hasMore = false;
        } else {
          page++;
        }
      }

      await this.cleanEmptyInventory(expansionName);

      if (csvRecords.length > 1) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `gundam_sync_${timestamp}.csv`;
        const csvData = csvRecords.join('\n');
        await this.prisma.syncBackup.create({
          data: { game: 'gundam', filename: fileName, csvData },
        });
      }

      return { updated: updatedCount, errors: 0 };
    } catch (e: any) {
      this.logger.error(`Error actualizando precios de Gundam Card Game: ${e.message}`);
      return { updated: 0, errors: 1 };
    }
  }
}

