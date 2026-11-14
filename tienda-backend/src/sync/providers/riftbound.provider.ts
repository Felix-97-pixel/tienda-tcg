import { TcgProvider } from './base-tcg.provider';
import { PrismaService } from '../../prisma/prisma.service';
import { ScrydexService } from '../scrydex.service';

export class RiftboundProvider extends TcgProvider {
  constructor(
    prisma: PrismaService,
    private readonly scrydexService: ScrydexService,
  ) {
    super('Riftbound', prisma);
  }

  protected override async getGameId(): Promise<string> {
    const setting = await this.prisma.globalSetting.findUnique({ where: { key: 'riftbound_sync_game_id' } });
    if (!setting || !setting.value) {
      throw new Error(`El Juego (Game ID) no está configurado para el destino 'Riftbound'. Ve a Configuración -> Destinos de Sincronización.`);
    }
    return setting.value;
  }

  /**
   * Detecta versiones automáticamente respetando las reglas físicas de impresión de Riftbound.
   */
  override getExpectedVariants(rawCard: any): string[] {
    const setId = rawCard.set?.set_id || rawCard.set?.id || '';
    const setName = rawCard.set?.label || rawCard.set?.name || '';
    const isProvingGrounds = /ogs|proving grounds/i.test(`${setId} ${setName}`);

    // 1. Proving Grounds (Starter Box): NUNCA existe en Foil, solo Normal
    if (isProvingGrounds) {
      return ['Normal'];
    }

    // 2. Runas básicas (R01..R06): Solo existen en Normal (sus versiones Foil son las Showcase R01a..R06a)
    const rawNum = String(rawCard.collector_number || '');
    if (/^r0?[1-6]$/i.test(rawNum)) {
      return ['Normal'];
    }

    // 3. Si la API de origen trae variantes explícitas
    if (rawCard.variants && Array.isArray(rawCard.variants)) {
      const hasNormal = rawCard.variants.some((v: any) => v.printing === 'Normal' || !v.is_foil);
      const hasFoil = rawCard.variants.some((v: any) => v.printing === 'Foil' || v.is_foil);

      const variants: string[] = [];
      if (hasNormal) variants.push('Normal');
      if (hasFoil) variants.push('Foil');

      if (variants.length > 0) return variants;
    }

    // 4. En expansiones regulares de sobres: Rares, Epics y Showcases son garantizadas Foil (no existen en Normal)
    const rarity = (rawCard.classification?.rarity || rawCard.rarity || '').toLowerCase();
    if (['rare', 'epic', 'showcase'].includes(rarity)) {
      return ['Foil'];
    }

    // 5. Commons y Uncommons en sobres vienen en ambas versiones
    return ['Normal', 'Foil'];
  }

  /** Obtener cartas de Riftbound delegando en ScrydexService */
  async fetchExternalSet(setId: string): Promise<any[]> {
    let page = 1;
    const pageSize = 250;
    let allCards: any[] = [];
    let hasMore = true;

    while (hasMore) {
      const { cards, totalCount } = await this.scrydexService.fetchCardsPageWithPrices('riftbound', setId, page, pageSize);
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

  async fetchAllSets(): Promise<{ id: string; name: string }[]> {
    const sets = await this.scrydexService.fetchSets('riftbound');
    return sets.map((s) => ({ id: s.id, name: s.name || s.id }));
  }

  /** Mapear campos de Scrydex a nuestro Producto */
  mapToProduct(c: any, categoryId: string) {
    const attrs: string[] = [];
    if (Array.isArray(c.domains)) attrs.push(...c.domains);
    else if (c.domain) attrs.push(c.domain);
    else if (Array.isArray(c.classification?.domain)) attrs.push(...c.classification.domain);
    if (c.type) attrs.push(c.type);
    if (Array.isArray(c.subtypes)) attrs.push(...c.subtypes);

    const imageUrl =
      c.images?.[0]?.large ||
      c.images?.[0]?.medium ||
      c.images?.[0]?.small ||
      c.imageUrl ||
      c.media?.image_url ||
      '';

    const expansionName = c.expansion?.name || c.set?.label || c.set?.name || 'Riftbound';
    const expansionExtId = c.expansion?.id || c.set?.id || '';

    // TCGPlayer product ID si existe en variants, o fallback al id de Scrydex
    let tcgId: string | null = null;
    if (Array.isArray(c.variants)) {
      for (const v of c.variants) {
        const pId = v.marketplaces?.find((m: any) => m.name === 'tcgplayer')?.product_id;
        if (pId) {
          tcgId = String(pId);
          break;
        }
      }
    }
    const extId = tcgId ? String(tcgId) : c.tcgplayer_id ? String(c.tcgplayer_id) : c.id;

    return {
      externalId: extId,
      name: c.name,
      description: Array.isArray(c.rules) ? c.rules.join('\n') : (c.text?.plain || c.effect || c.description || c.flavor_text || ''),
      image: imageUrl,
      expansion: expansionName,
      expansionExternalId: expansionExtId,
      rarity: c.rarity || c.classification?.rarity || 'Common',
      number: String(c.number || c.collector_number || ''),
      attributes: attrs,
      categoryId: categoryId,
    };
  }

  /**
   * Busca o crea un producto en la BD para la subida masiva.
   * En Riftbound, buscamos fuertemente por collectorNum y expansion, o por name.
   */
  async findProductForBulkUpload(itemData: any, categoryId: string): Promise<any> {
    let product = null;

    // Intentar buscar por Variant Number (collectorNum) si está disponible
    if (itemData.collectorNum) {
      const numStr = itemData.collectorNum.toString();
      const cleanNum = numStr.replace(/\D/g, '');
      const parsedNum = cleanNum ? parseInt(cleanNum, 10).toString() : numStr;

      product = await this.prisma.product.findFirst({
        where: {
          categoryId,
          cardDetail: {
            expansion: itemData.expansion,
            OR: [
              { collectorNum: numStr },
              { collectorNum: parsedNum }
            ]
          }
        },
        include: { items: true, marketPrices: true, cardDetail: true }
      });
    }

    // Fallback: Buscar por nombre y expansión
    if (!product) {
      const normalizedNameDash = itemData.name.replace(/,\s*/g, ' - ');
      const normalizedNameComma = itemData.name.replace(/\s*-\s*/g, ', ');

      product = await this.prisma.product.findFirst({
        where: {
          categoryId,
          name: { in: [itemData.name, normalizedNameDash, normalizedNameComma] },
          cardDetail: { expansion: itemData.expansion }
        },
        include: { items: true, marketPrices: true, cardDetail: true }
      });
    }

    return { product, externalData: null };
  }

  /**
   * Lógica de actualización de precios para Riftbound usando Scrydex (precios oficiales de TCGPlayer).
   * Bulk de 250 cartas por consulta (máximo 1 crédito de API por set completo).
   * Registra automáticamente el historial diario en MarketPriceHistory.
   */
  async updateGamePrices(expansionName: string) {
    this.logger.log(`=== [Riftbound] Iniciando actualización de precios vía Scrydex para: "${expansionName}" ===`);

    let updatedCount = 0;

    try {
      this.logger.log(`[Riftbound] Resolviendo expansión "${expansionName}"...`);
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

      // Si no tenemos externalId o es un slug antiguo de JustTCG, buscar código de Scrydex (ej. "RAD", "OGN")
      if (!setId || setId.includes('-riftbound')) {
        this.logger.log(`[Riftbound] Buscando set "${resolvedName}" en Scrydex...`);
        const scrydexSets = await this.scrydexService.fetchSets('riftbound');
        let match = scrydexSets.find(
          (s: any) => s.name?.toLowerCase().trim() === resolvedName.toLowerCase().trim() ||
                      s.id?.toLowerCase().trim() === resolvedName.toLowerCase().trim(),
        );

        if (!match) {
          match = scrydexSets.find(
            (s: any) =>
              s.name?.toLowerCase().includes(resolvedName.toLowerCase()) ||
              resolvedName.toLowerCase().includes(s.name?.toLowerCase()),
          );
        }

        if (!match) {
          this.logger.warn(`[Riftbound] No se encontró el set "${resolvedName}" en Scrydex.`);
          return { updated: 0, errors: 1 };
        }

        setId = match.id || match.code;
        if (expansion) {
          await this.prisma.expansion.update({
            where: { id: expansion.id },
            data: { externalId: setId },
          });
        }
      }

      this.logger.log(`[Riftbound] Set resuelto como: "${setId}". Cargando cartas desde Scrydex...`);

      // Pre-cargar acabados
      const gameId = await this.getGameId();
      const [normalFinish, foilFinish] = await Promise.all([
        this.prisma.finish.findFirst({ where: { name: 'Normal', gameId } }),
        this.prisma.finish.findFirst({ where: { name: 'Foil', gameId } }),
      ]);

      // Cargar productos locales para match rápido
      const localProducts = await this.prisma.product.findMany({
        where: { cardDetail: { expansion: { equals: resolvedName, mode: 'insensitive' } } },
        select: {
          id: true,
          externalId: true,
          name: true,
          cardDetail: { select: { collectorNum: true, rarity: true, expansion: true } },
        },
      });

      const totalRift = localProducts.length;
      this.logger.log(`[Riftbound] ${totalRift} productos encontrados en la BD local.`);

      let page = 1;
      const pageSize = 50;
      let hasMore = true;
      let accumulatedCards = 0;
      const csvRecords: string[] = ['productId,finishId,price'];

      const normalizeTitle = (s: string) => s.toLowerCase().replace(/\s*-\s*/g, ', ').replace(/\s+/g, ' ').trim();
      const stripParens = (s: string) => normalizeTitle(s).replace(/\s*\([^)]*\)/g, '').trim();

      while (hasMore) {
        this.logger.log(`[Riftbound] Consultando página ${page} de set "${setId}" en Scrydex...`);
        const { cards, totalCount } = await this.scrydexService.fetchCardsPageWithPrices('riftbound', setId, page, pageSize);

        if (!cards || cards.length === 0) break;
        accumulatedCards += cards.length;

        for (const card of cards) {
          // Extraer IDs oficiales de TCGPlayer de las variantes de Scrydex
          const tcgProductIds: string[] = [];
          if (Array.isArray(card.variants)) {
            for (const v of card.variants) {
              if (Array.isArray(v.marketplaces)) {
                for (const m of v.marketplaces) {
                  if (m.name === 'tcgplayer' && m.product_id) {
                    tcgProductIds.push(String(m.product_id).trim());
                  }
                }
              }
            }
          }

          let matchLocal: any = null;

          // 1. Prioridad Máxima: Match exacto por TCGPlayer Product ID (externalId importado previamente)
          if (tcgProductIds.length > 0) {
            matchLocal = localProducts.find((lp) => lp.externalId && tcgProductIds.includes(String(lp.externalId).trim()));
          }

          // 2. Prioridad 2: Match por número de coleccionista exacto (conservando sufijos como '7a') y nombre
          if (!matchLocal) {
            const cardNum = String(card.number || card.collector_number || '').trim().toLowerCase();
            const cardNameNorm = normalizeTitle(card.name || '');

            matchLocal = localProducts.find((lp) => {
              if (!lp.cardDetail?.collectorNum) return false;
              const lpNum = lp.cardDetail.collectorNum.trim().toLowerCase();
              const lpNorm = normalizeTitle(lp.name);
              return lpNum === cardNum && (lpNorm === cardNameNorm || stripParens(lp.name) === stripParens(card.name || ''));
            });
          }

          // 3. Fallback: Match por nombre normalizado
          if (!matchLocal) {
            const cardNameNorm = normalizeTitle(card.name || '');
            matchLocal = localProducts.find((lp) => {
              const lpNorm = normalizeTitle(lp.name);
              return lpNorm === cardNameNorm || stripParens(lp.name) === stripParens(card.name || '');
            });
          }

          if (!matchLocal) continue;

          // Extraer precios de TCGPlayer de las variantes en Scrydex
          const normalPrice = this.scrydexService.extractVariantPrice(card, 'normal');
          const foilPrice = this.scrydexService.extractVariantPrice(card, 'foil');

          const cardExp = matchLocal.cardDetail?.expansion || resolvedName;
          const isProvingGrounds = /proving grounds|ogs/i.test(cardExp);
          const isBasicRune = /^r0?[1-6]$/i.test(matchLocal.cardDetail?.collectorNum || '');
          const rarity = (matchLocal.cardDetail?.rarity || '').toLowerCase();
          const isBoosterSet = !isProvingGrounds && !/promo|bundle/i.test(cardExp);

          // Guardar Normal (si físicamente existe y tiene precio)
          if (normalPrice && normalPrice > 0.01 && normalFinish) {
            const isFoilOnly = isBoosterSet && ['rare', 'epic', 'showcase'].includes(rarity);
            if (!isFoilOnly) {
              await this.saveMarketPrice(matchLocal.id, normalFinish.id, normalPrice);
              csvRecords.push(`${matchLocal.id},${normalFinish.id},${normalPrice}`);
            }
          }

          // Guardar Foil (si físicamente existe y tiene precio)
          if (foilPrice && foilPrice > 0.01 && foilFinish) {
            if (!isProvingGrounds && !isBasicRune) {
              await this.saveMarketPrice(matchLocal.id, foilFinish.id, foilPrice);
              csvRecords.push(`${matchLocal.id},${foilFinish.id},${foilPrice}`);
            }
          }

          updatedCount++;
          this.onProgress?.('riftbound', updatedCount, totalRift, 'price');
        }

        this.logger.log(`[Riftbound] Progreso Scrydex: ${updatedCount}/${totalRift} (Procesadas ${accumulatedCards}/${totalCount} cartas remotas)`);
        if (accumulatedCards >= totalCount || cards.length === 0) {
          hasMore = false;
        } else {
          page++;
        }
      }

      // Limpiar variantes vacías
      await this.cleanEmptyInventory(expansionName);

      // Guardar CSV de respaldo en BD
      if (csvRecords.length > 1) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `riftbound_scrydex_${timestamp}.csv`;
        const csvData = csvRecords.join('\n');

        await this.prisma.syncBackup.create({
          data: {
            game: 'riftbound',
            filename: fileName,
            csvData: csvData,
          },
        });
        this.logger.log(`[Riftbound] Backup CSV guardado en BD: ${fileName}`);
      }

      this.logger.log(`[Riftbound] ¡Actualización Scrydex completada! ${updatedCount} cartas procesadas.`);
      return { updated: updatedCount, errors: 0 };
    } catch (err: any) {
      this.logger.error(`[Riftbound] Error en Scrydex: ${err.message}`);
      return { updated: updatedCount, errors: 1 };
    }
  }
}
