import { TcgProvider } from './base-tcg.provider';
import { PrismaService } from '../../prisma/prisma.service';
import { RiftboundService } from '../riftbound.service';

export class RiftboundProvider extends TcgProvider {
  constructor(prisma: PrismaService, private readonly riftboundService: RiftboundService) {
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
   * Detecta versiones automáticamente desde la API de Riftcodex.
   */
  override getExpectedVariants(rawCard: any): string[] {
    // Si la API trae explícitamente las versiones/variantes disponibles
    if (rawCard.variants && Array.isArray(rawCard.variants)) {
      const hasNormal = rawCard.variants.some((v: any) => v.printing === 'Normal' || !v.is_foil);
      const hasFoil = rawCard.variants.some((v: any) => v.printing === 'Foil' || v.is_foil);

      const variants: string[] = [];
      if (hasNormal) variants.push('Normal');
      if (hasFoil) variants.push('Foil');

      if (variants.length > 0) return variants;
    }

    // Si la API no da información, usamos el estándar (Normal y Foil) por seguridad
    return ['Normal', 'Foil'];
  }

  /** Obtener cartas de Riftcodex delegando en RiftboundService */
  async fetchExternalSet(setId: string): Promise<any[]> {
    return this.riftboundService.fetchCardsBySet(setId);
  }

  async fetchAllSets(): Promise<{id: string, name: string}[]> {
    const sets = await this.riftboundService.fetchSets();
    return sets.map(s => ({ id: s.id, name: s.name }));
  }

  /** Mapear campos de Riftcodex a nuestro Producto */
  mapToProduct(c: any, categoryId: string) {
    return {
      externalId: c.tcgplayer_id ? String(c.tcgplayer_id) : `rb-${c.id}`,
      name: c.name,
      description: c.text?.plain || c.text?.rich || c.effect || c.description || c.flavor_text || c.rules_text || '',
      image: c.media?.image_url || '',
      expansion: c.set?.label || 'Riftbound',
      rarity: c.classification?.rarity || c.rarity || 'Common',
      number: String(c.collector_number || ''),
      attributes: Array.isArray(c.classification?.domain) ? c.classification.domain : [],
      categoryId: categoryId
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
        include: { items: true, marketPrices: true }
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
        include: { items: true, marketPrices: true }
      });
    }

    return { product, externalData: null };
  }

  /** Lógica de precios usando JustTCG (delegado en RiftboundService) */
  async updateGamePrices(expansionName: string) {
    this.logger.log(`=== [Riftbound] Iniciando actualización vía JustTCG para: "${expansionName}" ===`);

    const apiKey = process.env.JUSTTCG_API_KEY;
    if (!apiKey) {
      this.logger.error('[Riftbound] JUSTTCG_API_KEY no configurada en las variables de entorno.');
      return { updated: 0, errors: 1 };
    }

    let updatedCount = 0;

    try {
      this.logger.log(`[Riftbound] Resolviendo expansión "${expansionName}"...`);
      const expansion = await this.prisma.expansion.findFirst({
        where: {
          OR: [
            { id: expansionName },
            { name: { equals: expansionName, mode: 'insensitive' } }
          ],
          gameId: await this.getGameId()
        }
      });

      let setSlug = expansion?.externalId;
      const resolvedName = expansion?.name || expansionName;

      // Si no tenemos el externalId guardado, hacemos fallback a buscar en la API de JustTCG
      if (!setSlug) {
        this.logger.log(`[Riftbound] Buscando set "${resolvedName}" en JustTCG...`);
        const sets = await this.riftboundService.fetchJustTcgSets(apiKey);
        let match = sets.find((s: any) => s.name?.toLowerCase() === resolvedName.toLowerCase());
        
        if (!match) {
          match = sets.find((s: any) => 
            s.name?.toLowerCase().includes(resolvedName.toLowerCase()) || 
            resolvedName.toLowerCase().includes(s.name?.toLowerCase())
          );
        }

        if (!match) {
          this.logger.warn(`[Riftbound] No se encontró el set "${resolvedName}" en JustTCG.`);
          return { updated: 0, errors: 1 };
        }
        setSlug = match.set_id || match.slug || match.id;
        
        // Guardar el externalId para futuras consultas si tenemos el registro
        if (expansion) {
          await this.prisma.expansion.update({
            where: { id: expansion.id },
            data: { externalId: setSlug }
          });
        }
      }

      this.logger.log(`[Riftbound] Set resuelto como: "${setSlug}". Cargando productos locales...`);

      // Pre-cargar acabados
      const gameId = await this.getGameId();
      const [normalFinish, foilFinish] = await Promise.all([
        this.prisma.finish.findFirst({ where: { name: 'Normal', gameId } }),
        this.prisma.finish.findFirst({ where: { name: 'Foil', gameId } })
      ]);

      // 2. Cargar productos locales para match rápido
      const localProducts = await this.prisma.product.findMany({
        where: { cardDetail: { expansion: { equals: resolvedName, mode: 'insensitive' } } },
        select: { id: true, externalId: true }
      });

      const totalRift = localProducts.length;
      this.logger.log(`[Riftbound] ${totalRift} productos encontrados en la BD local.`);

      let offset = 0;
      const limit = 20;
      let hasMore = true;
      const csvRecords: string[] = ['productId,finishId,price'];

      while (hasMore) {
        this.logger.log(`[Riftbound] Consultando cartas (Offset: ${offset})...`);

        // Espera de 8 segundos para rate limiting
        if (offset > 0) {
          this.logger.log(`[Riftbound] Esperando 8 segundos para respetar Rate Limit...`);
          await new Promise(resolve => setTimeout(resolve, 8000));
        }

        const data = await this.riftboundService.fetchJustTcgCardsPage(apiKey, setSlug, limit, offset);
        const cards = data?.data || [];
        if (cards.length === 0) break;

        for (const card of cards) {
          const tcgId = card.tcgplayerId ? String(card.tcgplayerId) : null;
          if (!tcgId) continue;

          const matchLocal = localProducts.find(lp => lp.externalId === tcgId);
          if (!matchLocal) continue;

          // Procesar variantes
          for (const variant of card.variants || []) {
            // Filtrar variantes fantasma (Foil sin sku) o con precio nulo/0.01
            if (!variant.tcgplayerSkuId || (variant.marketPrice || variant.price) <= 0.01) continue;

            if (variant.condition === 'Near Mint') {
              const finalPrice = variant.marketPrice || variant.price;
              const isVariantFoil = variant.printing === 'Foil';
              const targetFinishId = isVariantFoil ? foilFinish?.id : normalFinish?.id;

              if (targetFinishId) {
                await this.prisma.marketPrice.upsert({
                  where: { productId_finishId: { productId: matchLocal.id, finishId: targetFinishId } },
                  create: { productId: matchLocal.id, finishId: targetFinishId, price: finalPrice },
                  update: { price: finalPrice }
                });
                csvRecords.push(`${matchLocal.id},${targetFinishId},${finalPrice}`);
              }
            }
          }
          // Incrementar por CARTA única procesada, no por variantes
          updatedCount++;
          this.onProgress?.('riftbound', updatedCount, totalRift, 'price');
        }
        this.logger.log(`[Riftbound] Lote procesado. Progreso: ${updatedCount}/${totalRift}`);
        hasMore = data?.meta?.hasMore || false;
        offset += limit;
      }

      // 3. Limpiar variantes que quedaron vacías
      await this.cleanEmptyInventory(expansionName);

      // Guardar CSV de respaldo en BD
      if (csvRecords.length > 1) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `riftbound_sync_${timestamp}.csv`;
        const csvData = csvRecords.join('\n');
        
        await this.prisma.syncBackup.create({
          data: {
            game: 'riftbound',
            filename: fileName,
            csvData: csvData
          }
        });
        this.logger.log(`[Riftbound] Backup CSV guardado en BD: ${fileName}`);
      }

      this.logger.log(`[Riftbound] ¡Actualización completada! ${updatedCount} cartas procesadas.`);
      return { updated: updatedCount, errors: 0 };
    } catch (err: any) {
      this.logger.error(`[Riftbound] Error en JustTCG: ${err.message}`);
      return { updated: updatedCount, errors: 1 };
    }
  }
}
