import { TcgProvider } from './base-tcg.provider';
import axios from 'axios';
import { PrismaService } from '../../prisma/prisma.service';

export class RiftboundProvider extends TcgProvider {
  constructor(prisma: PrismaService) {
    super('Riftbound', prisma);
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

  /** Obtener cartas de Riftcodex */
  async fetchExternalSet(setId: string): Promise<any[]> {
    let allCards = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const url = `https://api.riftcodex.com/cards?set_id=${setId}&page=${page}`;
      const res = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });

      const data = res.data;
      const cardList = data?.items || (Array.isArray(data) ? data : []);

      if (cardList.length === 0) {
        hasMore = false;
        break;
      }

      allCards.push(...cardList);

      if (data.page < data.pages) page++;
      else hasMore = false;
    }

    return allCards;
  }

  /** Mapear campos de Riftcodex a nuestro Producto */
  mapToProduct(c: any, categoryId: string) {
    return {
      externalId: c.tcgplayer_id ? String(c.tcgplayer_id) : `rb-${c.id}`,
      name: c.name,
      image: c.media?.image_url || '',
      expansion: c.set?.label || 'Riftbound',
      rarity: c.classification?.rarity || c.rarity || 'Common',
      number: String(c.collector_number || ''),
      attributes: Array.isArray(c.classification?.domain) ? c.classification.domain : [],
      categoryId: categoryId
    };
  }

  /** Lógica de precios usando JustTCG */
  async updateGamePrices(expansionName: string) {
    this.logger.log(`=== [Riftbound] Iniciando actualización vía JustTCG para: "${expansionName}" ===`);

    const apiKey = process.env.JUSTTCG_API_KEY;
    if (!apiKey) {
      this.logger.error('[Riftbound] JUSTTCG_API_KEY no configurada en las variables de entorno.');
      return { updated: 0, errors: 1 };
    }

    const gameName = 'riftbound-league-of-legends-trading-card-game';
    let updatedCount = 0;

    try {
      // 1. Resolver el ID real del set
      this.logger.log(`[Riftbound] Buscando set "${expansionName}" en JustTCG...`);
      const setsRes = await axios.get(`https://api.justtcg.com/v1/sets?game=${gameName}`, {
        headers: { 'X-Api-Key': apiKey }
      });
      const sets = setsRes.data?.data || [];
      const match = sets.find((s: any) => s.name?.toLowerCase() === expansionName.toLowerCase());

      if (!match) {
        this.logger.warn(`[Riftbound] No se encontró el set "${expansionName}" en JustTCG.`);
        return { updated: 0, errors: 1 };
      }

      const setSlug = match.set_id || match.slug || match.id;
      this.logger.log(`[Riftbound] Set resuelto como: "${setSlug}". Cargando productos locales...`);

      // Pre-cargar acabados
      const normalFinish = await this.prisma.finish.findFirst({ where: { name: 'Normal', game: 'Riftbound' } });
      const foilFinish = await this.prisma.finish.findFirst({ where: { name: 'Foil', game: 'Riftbound' } });

      // 2. Cargar productos locales para match rápido
      const localProducts = await this.prisma.product.findMany({
        where: { cardDetail: { expansion: { equals: expansionName, mode: 'insensitive' } } },
        select: { id: true, externalId: true }
      });

      const totalRift = localProducts.length;
      this.logger.log(`[Riftbound] ${totalRift} productos encontrados en la BD local.`);

      let offset = 0;
      const limit = 20;
      let hasMore = true;

      while (hasMore) {
        this.logger.log(`[Riftbound] Consultando cartas (Offset: ${offset})...`);

        // El famoso delay de 8 segundos para no ser bloqueados
        if (offset > 0) {
          this.logger.log(`[Riftbound] Esperando 8 segundos para respetar Rate Limit...`);
          await new Promise(resolve => setTimeout(resolve, 8000));
        }

        const url = `https://api.justtcg.com/v1/cards?game=${gameName}&set=${setSlug}&limit=${limit}&offset=${offset}`;
        const res = await axios.get(url, { headers: { 'X-Api-Key': apiKey } });

        const cards = res.data?.data || [];
        if (cards.length === 0) break;

        for (const card of cards) {
          const tcgId = card.tcgplayerId ? String(card.tcgplayerId) : null;
          if (!tcgId) continue;

          const matchLocal = localProducts.find(lp => lp.externalId === tcgId);
          if (!matchLocal) continue;

          // Procesar variantes
          for (const variant of card.variants || []) {
            if (variant.condition === 'Near Mint' && (variant.marketPrice > 0 || variant.price > 0)) {
              const finalPrice = variant.marketPrice || variant.price;
              const isVariantFoil = variant.printing === 'Foil';
              const targetFinishId = isVariantFoil ? foilFinish?.id : normalFinish?.id;

              if (targetFinishId) {
                await this.prisma.inventoryItem.updateMany({
                  where: { productId: matchLocal.id, finishId: targetFinishId },
                  data: { price: finalPrice }
                });
              }
            }
          }
          // Incrementar por CARTA única procesada, no por variantes
          updatedCount++;
          this.onProgress?.('riftbound', updatedCount, totalRift, 'price');
        }
        this.logger.log(`[Riftbound] Lote procesado. Progreso: ${updatedCount}/${totalRift}`);
        hasMore = res.data?.meta?.hasMore || false;
        offset += limit;
      }

      // 3. Limpiar variantes que quedaron vacías
      await this.cleanEmptyInventory(expansionName);

      this.logger.log(`[Riftbound] ¡Actualización completada! ${updatedCount} cartas procesadas.`);
      return { updated: updatedCount, errors: 0 };
    } catch (err) {
      this.logger.error(`[Riftbound] Error en JustTCG: ${err.message}`);
      return { updated: updatedCount, errors: 1 };
    }
  }
}
