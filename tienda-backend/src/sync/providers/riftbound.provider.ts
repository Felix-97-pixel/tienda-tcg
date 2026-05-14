import { TcgProvider } from './base-tcg.provider';
import axios from 'axios';
import { PrismaService } from '../../prisma/prisma.service';

export class RiftboundProvider extends TcgProvider {
  constructor(prisma: PrismaService) {
    super('Riftbound', prisma);
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

      // 2. Cargar productos locales para match rápido
      const localProductIds = await this.prisma.product.findMany({
        where: { cardDetail: { expansion: { equals: expansionName, mode: 'insensitive' } } },
        select: { id: true, externalId: true }
      });
      const localProducts = localProductIds;
      this.logger.log(`[Riftbound] ${localProducts.length} productos encontrados en la BD local.`);

      // Contar los ítems de inventario reales (variants) para un total preciso en la barra de progreso
      const totalInventoryItems = await this.prisma.inventoryItem.count({
        where: { productId: { in: localProducts.map(p => p.id) } }
      });
      const totalRift = totalInventoryItems || localProducts.length;

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

          for (const variant of card.variants || []) {
            if (variant.condition === 'Near Mint' && (variant.marketPrice > 0 || variant.price > 0)) {
              const finalPrice = variant.marketPrice || variant.price;
              const res = await this.prisma.inventoryItem.updateMany({
                where: { productId: matchLocal.id, isFoil: variant.printing === 'Foil' },
                data: { price: finalPrice }
              });
              updatedCount += res.count;
            }
          }
          this.onProgress?.('riftbound', updatedCount, totalRift);
        }
        this.logger.log(`[Riftbound] Lote procesado. Total actualizado: ${updatedCount}/${totalRift}`);
        hasMore = res.data?.meta?.hasMore || false;
        offset += limit;
      }

      this.logger.log(`[Riftbound] ¡Actualización completada! ${updatedCount} variantes de inventario actualizadas.`);
      return { updated: updatedCount, errors: 0 };
    } catch (err) {
      this.logger.error(`[Riftbound] Error en JustTCG: ${err.message}`);
      return { updated: updatedCount, errors: 1 };
    }
  }
}
