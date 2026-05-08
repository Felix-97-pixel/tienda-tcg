import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as https from 'https';
import axios from 'axios';

const JSONStream = require('JSONStream');

@Injectable()
export class PriceUpdaterService {
  private readonly logger = new Logger(PriceUpdaterService.name);

  constructor(private prisma: PrismaService) { }

  async checkExpansionExists(expansion: string): Promise<boolean> {
    const count = await this.prisma.product.count({
      where: {
        cardDetail: {
          expansion: { equals: expansion, mode: 'insensitive' }
        }
      }
    });
    return count > 0;
  }

  /**
   * Paso 1: Consultar Scryfall para obtener el código de set (ej: "blb")
   * a partir del nombre de la expansión (ej: "Bloomburrow")
   */
  private async getSetCode(expansion: string): Promise<string | null> {
    try {
      const response = await axios.get('https://api.scryfall.com/sets');
      const sets: any[] = response.data?.data ?? [];
      const match = sets.find(
        (s) => s.name?.toLowerCase() === expansion.toLowerCase()
      );
      if (match) {
        this.logger.log(`Scryfall encontró el set: ${match.name} (${match.code})`);
        return match.code.toUpperCase();
      }
      return null;
    } catch (err) {
      this.logger.error('Error consultando Scryfall /sets:', err.message);
      return null;
    }
  }

  /**
   * Paso 2: Descargar el archivo de la edición desde MTGJSON (ej: BLB.json)
   * Devuelve un mapa: scryfallId → mtgjsonUUID
   */
  private async getSetUUIDs(setCode: string): Promise<Map<string, string>> {
    const scryfallToMtgjson = new Map<string, string>();
    const mtgjsonUUIDs = new Set<string>();

    return new Promise((resolve, reject) => {
      const url = `https://mtgjson.com/api/v5/${setCode}.json`;
      this.logger.log(`Descargando set file: ${url}`);

      https.get(url, (res) => {
        if (res.statusCode !== 200) {
          this.logger.error(`MTGJSON no encontró el set '${setCode}' (HTTP ${res.statusCode})`);
          return resolve(scryfallToMtgjson);
        }

        const parser = JSONStream.parse('data.cards.*');

        parser.on('data', (card: any) => {
          if (card.uuid && card.identifiers?.scryfallId) {
            scryfallToMtgjson.set(card.identifiers.scryfallId, card.uuid);
            mtgjsonUUIDs.add(card.uuid);
          }
        });

        parser.on('end', () => {
          this.logger.log(`Set ${setCode}: ${mtgjsonUUIDs.size} cartas mapeadas.`);
          resolve(scryfallToMtgjson);
        });
        parser.on('error', reject);
        res.pipe(parser);
      }).on('error', reject);
    });
  }

  /**
   * Paso 3: Consultar AllPricesToday.json filtrando solo los UUIDs que nos interesan.
   * AllPricesToday pesa mucho menos que AllPrices (sin historial de 90 días).
   */
  private async getPricesForUUIDs(
    uuidsToFind: Set<string>
  ): Promise<Map<string, { normal: number; foil: number }>> {
    const result = new Map<string, { normal: number; foil: number }>();

    return new Promise((resolve, reject) => {
      this.logger.log(`Consultando AllPricesToday.json para ${uuidsToFind.size} UUIDs...`);
      let parsedCount = 0;

      https.get('https://mtgjson.com/api/v5/AllPricesToday.json', (res) => {
        const parser = JSONStream.parse('data.$*');

        parser.on('data', (data: any) => {
          parsedCount++;
          if (parsedCount % 50000 === 0) {
            this.logger.log(`Progreso AllPricesToday: ${parsedCount} entradas revisadas...`);
          }

          if (uuidsToFind.has(data.key)) {
            const ckRetail = data.value?.paper?.cardkingdom?.retail;
            let normal = 0;
            let foil = 0;

            if (ckRetail?.normal) {
              const dates = Object.keys(ckRetail.normal).sort();
              normal = ckRetail.normal[dates[dates.length - 1]] ?? 0;
            }
            if (ckRetail?.foil) {
              const dates = Object.keys(ckRetail.foil).sort();
              foil = ckRetail.foil[dates[dates.length - 1]] ?? 0;
            }

            if (normal > 0 || foil > 0) {
              result.set(data.key, { normal, foil });
            }
          }
        });

        parser.on('end', () => {
          this.logger.log(`AllPricesToday procesado. Precios encontrados: ${result.size}`);
          resolve(result);
        });
        parser.on('error', reject);
        res.pipe(parser);
      }).on('error', reject);
    });
  }

  /**
   * Método principal: orquesta todo el proceso para actualizar los precios
   * de una expansión específica usando datos 100% de MTGJSON.
   */
  async updateSetPrices(expansion: string) {
    this.logger.log(`=== Iniciando actualización MTGJSON para: "${expansion}" ===`);

    // 1. Obtener los productos de nuestra BD con sus scryfallIds (externalId)
    const products = await this.prisma.product.findMany({
      where: {
        cardDetail: {
          expansion: { equals: expansion, mode: 'insensitive' }
        }
      },
      select: { id: true, externalId: true }
    });

    if (products.length === 0) {
      this.logger.warn(`No se encontraron cartas de '${expansion}' en la BD.`);
      return;
    }
    this.logger.log(`${products.length} cartas encontradas en BD.`);

    // Mapa: scryfallId → productId (BD)
    const scryfallToProductId = new Map<string, string>();
    for (const p of products) {
      scryfallToProductId.set(p.externalId, p.id);
    }

    // 2. Obtener el código de la edición desde Scryfall (ej: "BLB")
    const setCode = await this.getSetCode(expansion);
    if (!setCode) {
      this.logger.error(`No se pudo encontrar el código de set para "${expansion}" en Scryfall.`);
      return;
    }
    this.logger.log(`Código de set encontrado: ${setCode}`);

    // 3. Descargar BLB.json (solo ~500KB) y mapear ScryfallId → MTGJSON UUID
    const scryfallToMtgjson = await this.getSetUUIDs(setCode);

    // Cruzar: construir mapa UUID de MTGJSON → productId de nuestra BD
    const mtgjsonUUIDtoProductId = new Map<string, string>();
    for (const [scryfallId, mtgjsonUUID] of scryfallToMtgjson) {
      const productId = scryfallToProductId.get(scryfallId);
      if (productId) {
        mtgjsonUUIDtoProductId.set(mtgjsonUUID, productId);
      }
    }

    if (mtgjsonUUIDtoProductId.size === 0) {
      this.logger.error('No se encontraron equivalencias entre IDs de Scryfall y MTGJSON.');
      return;
    }
    this.logger.log(`${mtgjsonUUIDtoProductId.size} cartas cruzadas correctamente.`);

    // 4. Consultar AllPricesToday con solo los UUIDs que nos interesan
    const uuidsToFind = new Set(mtgjsonUUIDtoProductId.keys());
    const prices = await this.getPricesForUUIDs(uuidsToFind);

    // 5. Guardar precios en la BD (tabla InventoryItem)
    this.logger.log(`Guardando ${prices.size} precios en la base de datos...`);
    let updated = 0;

    for (const [mtgjsonUUID, { normal, foil }] of prices) {
      const productId = mtgjsonUUIDtoProductId.get(mtgjsonUUID)!;

      if (normal > 0) {
        await this.prisma.inventoryItem.updateMany({
          where: { productId, isFoil: false },
          data: { price: normal }
        });
      }
      if (foil > 0) {
        await this.prisma.inventoryItem.updateMany({
          where: { productId, isFoil: true },
          data: { price: foil }
        });
      }
      updated++;
    }

    this.logger.log(`=== ¡Proceso completado! ${updated} cartas de "${expansion}" actualizadas con precios de Card Kingdom. ===`);
  }

  /**
   * Actualiza precios para Pokémon usando pokemontcg.io (TCGPlayer data)
   */
  async updatePokemonSetPrices(expansion: string) {
    this.logger.log(`=== Iniciando actualización Pokémon TCG para: "${expansion}" ===`);

    // 1. Buscar el set en la API para obtener el ID real
    const setsRes = await axios.get(`https://api.pokemontcg.io/v2/sets?q=name:"${expansion}"`);
    const set = setsRes.data?.data?.[0];
    if (!set) {
      this.logger.error(`No se encontró el set Pokémon con nombre "${expansion}" en la API.`);
      return;
    }

    const setId = set.id;
    this.logger.log(`Set Pokémon encontrado: ${set.name} (${setId})`);

    let page = 1;
    const pageSize = 250;
    let hasMore = true;
    let updatedCount = 0;

    while (hasMore) {
      const url = `https://api.pokemontcg.io/v2/cards?q=set.id:${setId}&page=${page}&pageSize=${pageSize}&select=id,tcgplayer`;
      const res = await axios.get(url);
      const cards = res.data?.data ?? [];

      if (cards.length === 0) {
        hasMore = false;
        break;
      }

      for (const card of cards) {
        const externalId = card.id;
        const prices = card.tcgplayer?.prices;

        if (!prices) continue;

        // Pokémon puede tener varios tipos de precios (normal, holofoil, reverseHolofoil, etc.)
        // Intentamos mapear a nuestro sistema de normal vs foil
        const normalPrice = prices.normal?.mid || prices.unlimitedHolofoil?.mid || 0;
        const foilPrice = prices.holofoil?.mid || prices.reverseHolofoil?.mid || prices['1stEditionHolofoil']?.mid || 0;

        if (normalPrice > 0) {
          await this.prisma.inventoryItem.updateMany({
            where: {
              product: { externalId },
              isFoil: false
            },
            data: { price: normalPrice }
          });
        }

        if (foilPrice > 0) {
          await this.prisma.inventoryItem.updateMany({
            where: {
              product: { externalId },
              isFoil: true
            },
            data: { price: foilPrice }
          });
        }
        updatedCount++;
      }

      if (cards.length < pageSize) hasMore = false;
      else page++;
    }

    this.logger.log(`=== ¡Proceso completado! ${updatedCount} cartas de Pokémon de "${expansion}" actualizadas. ===`);
  }
}