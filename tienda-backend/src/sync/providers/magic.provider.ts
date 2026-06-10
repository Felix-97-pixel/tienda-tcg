import { TcgProvider } from './base-tcg.provider';
import { PrismaService } from '../../prisma/prisma.service';
import { MagicService } from '../magic.service';

export class MagicProvider extends TcgProvider {
  constructor(prisma: PrismaService, private readonly magicService: MagicService) {
    super('Magic', prisma);
  }

  /**
   * Detecta versiones automáticamente desde Scryfall (finishes)
   */
  override getExpectedVariants(rawCard: any): string[] {
    const finishes = rawCard.finishes || [];
    const variants: string[] = [];

    if (finishes.includes('nonfoil')) variants.push('Normal');
    if (finishes.includes('foil')) variants.push('Foil');
    if (finishes.includes('etched')) variants.push('Etched Foil');
    if (finishes.includes('glossy')) variants.push('Glossy Foil');

    // Si por alguna razón no trae nada (raro en Scryfall), devolvemos por seguridad
    return variants.length > 0 ? variants : ['Normal', 'Foil'];
  }

  /**
   * Obtiene cartas externas delegando en MagicService.
   */
  async fetchExternalSet(setId: string): Promise<any[]> {
    return this.magicService.fetchCardsBySet(setId);
  }

  mapToProduct(c: any, categoryId: string) {
    const attrs: string[] = c.colors || c.card_faces?.[0]?.colors || [];
    if (c.oracle_text?.includes('{E}')) attrs.push('Energy');
    if (c.oracle_text?.toLowerCase().includes('devotion')) attrs.push('Devotion');

    return {
      externalId: c.id,
      name: c.name,
      image: c.image_uris?.normal || c.card_faces?.[0]?.image_uris?.normal || '',
      expansion: c.set_name,
      rarity: c.rarity || 'Common',
      number: c.collector_number,
      attributes: attrs,
      categoryId: categoryId
    };
  }

  /** Actualización de precios usando MTGJSON (CardKingdom) */
  async updateGamePrices(expansionName: string) {
    this.logger.log(`=== [Magic] Iniciando actualización de precios para: "${expansionName}" ===`);
    
    try {
      const products = await this.prisma.product.findMany({
        where: { cardDetail: { expansion: { equals: expansionName, mode: 'insensitive' } } },
        select: { id: true, externalId: true }
      });

      if (products.length === 0) {
        this.logger.warn(`[Magic] No se encontraron productos para la expansión: ${expansionName}`);
        return { updated: 0, errors: 1 };
      }

      // Obtener los IDs de los finishes para Magic
      const normalFinish = await this.prisma.finish.findFirst({ where: { name: 'Normal', game: 'Magic' } });
      const foilFinish = await this.prisma.finish.findFirst({ where: { name: 'Foil', game: 'Magic' } });

      this.logger.log(`[Magic] ${products.length} productos locales encontrados. Resolviendo código de set...`);

      // 1. Obtener código de set (ej: BLB)
      const setCode = await this.getSetCode(expansionName);
      if (!setCode) {
        this.logger.error(`[Magic] No se pudo resolver el código de set para: ${expansionName}`);
        return { updated: 0, errors: 1 };
      }
      this.logger.log(`[Magic] Código de set resuelto: ${setCode}. Obteniendo mapeo de UUIDs...`);

      // 2. Obtener mapeo de UUIDs
      const scryfallToMtgjson = await this.getSetUUIDs(setCode);
      this.logger.log(`[Magic] ${scryfallToMtgjson.size} UUIDs mapeados desde MTGJSON.`);

      const mtgjsonUUIDtoProductId = new Map<string, string>();
      for (const [scryfallId, mtgjsonUUID] of scryfallToMtgjson) {
        const match = products.find(p => p.externalId === scryfallId);
        if (match) mtgjsonUUIDtoProductId.set(mtgjsonUUID, match.id);
      }

      if (mtgjsonUUIDtoProductId.size === 0) {
        this.logger.warn(`[Magic] Ningún producto de la BD coincide con los UUIDs de MTGJSON.`);
        return { updated: 0, errors: 0 };
      }

      this.logger.log(`[Magic] Procesando precios para ${mtgjsonUUIDtoProductId.size} cartas únicas...`);

      // 3. Consultar precios masivos
      const prices = await this.getPricesForUUIDs(new Set(mtgjsonUUIDtoProductId.keys()));
      this.logger.log(`[Magic] ${prices.size} precios obtenidos de MTGJSON. Aplicando a la base de datos...`);

      let updated = 0;
      const total = mtgjsonUUIDtoProductId.size;
      
      for (const [mtgjsonUUID, { normal, foil }] of prices) {
        const productId = mtgjsonUUIDtoProductId.get(mtgjsonUUID)!;
        if (normal > 0 && normalFinish) {
          await this.prisma.inventoryItem.updateMany({
            where: { productId, finishId: normalFinish.id, storeId: null },
            data: { price: normal }
          });
        }
        if (foil > 0 && foilFinish) {
          await this.prisma.inventoryItem.updateMany({
            where: { productId, finishId: foilFinish.id, storeId: null },
            data: { price: foil }
          });
        }
        updated++;
        
        if (updated % 50 === 0 || updated === total) {
          this.onProgress?.('magic', updated, total, 'price');
          this.logger.log(`[Magic] Progreso: ${updated}/${total} productos actualizados...`);
        }
      }

      this.logger.log(`[Magic] ¡Actualización completada! ${updated} productos actualizados.`);
      return { updated, errors: 0 };
    } catch (error: any) {
      this.logger.error(`Error actualizando precios de Magic: ${error.message}`);
      return { updated: 0, errors: 1 };
    }
  }

  // --- HELPERS ESPECÍFICOS DE MAGIC ---

  private async getSetCode(expansion: string): Promise<string | null> {
    const sets = await this.magicService.fetchScryfallSets();
    const match = sets.find((s: any) => s.name?.toLowerCase() === expansion.toLowerCase());
    return match ? match.code.toUpperCase() : null;
  }

  private async getSetUUIDs(setCode: string): Promise<Map<string, string>> {
    const scryfallToMtgjson = new Map<string, string>();
    const JSONStream = require('JSONStream');
    const https = require('https');

    return new Promise((resolve, reject) => {
      https.get(`https://mtgjson.com/api/v5/${setCode}.json`, (res: any) => {
        if (res.statusCode !== 200) return resolve(scryfallToMtgjson);
        const parser = JSONStream.parse('data.cards.*');
        parser.on('data', (card: any) => {
          if (card.uuid && card.identifiers?.scryfallId) {
            scryfallToMtgjson.set(card.identifiers.scryfallId, card.uuid);
          }
        });
        parser.on('end', () => resolve(scryfallToMtgjson));
        parser.on('error', reject);
        res.pipe(parser);
      }).on('error', reject);
    });
  }

  private async getPricesForUUIDs(uuidsToFind: Set<string>): Promise<Map<string, { normal: number; foil: number }>> {
    const result = new Map<string, { normal: number; foil: number }>();
    const JSONStream = require('JSONStream');
    const https = require('https');

    return new Promise((resolve, reject) => {
      let processedCount = 0;
      https.get('https://mtgjson.com/api/v5/AllPricesToday.json', (res: any) => {
        const parser = JSONStream.parse('data.$*');
        parser.on('data', (data: any) => {
          processedCount++;
          if (processedCount % 50000 === 0) {
            this.logger.log(`[Magic] Progreso: ${processedCount} entradas de precios analizadas...`);
          }
          if (uuidsToFind.has(data.key)) {
            const ckRetail = data.value?.paper?.cardkingdom?.retail;
            let normal = 0, foil = 0;
            if (ckRetail?.normal) {
              const dates = Object.keys(ckRetail.normal).sort();
              normal = ckRetail.normal[dates[dates.length - 1]] ?? 0;
            }
            if (ckRetail?.foil) {
              const dates = Object.keys(ckRetail.foil).sort();
              foil = ckRetail.foil[dates[dates.length - 1]] ?? 0;
            }
            if (normal > 0 || foil > 0) result.set(data.key, { normal, foil });
          }
        });
        parser.on('end', () => resolve(result));
        parser.on('error', reject);
        res.pipe(parser);
      }).on('error', reject);
    });
  }
}
