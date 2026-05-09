import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as https from 'https';
import axios from 'axios';

const JSONStream = require('JSONStream');

@Injectable()
export class PriceUpdaterService {
  private readonly logger = new Logger(PriceUpdaterService.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService
  ) { }

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

  async updateSetPrices(expansion: string) {
    this.logger.log(`=== Iniciando actualización MTGJSON para: "${expansion}" ===`);
    const products = await this.prisma.product.findMany({
      where: {
        cardDetail: { expansion: { equals: expansion, mode: 'insensitive' } }
      },
      select: { id: true, externalId: true }
    });

    if (products.length === 0) {
      this.logger.warn(`No se encontraron cartas de '${expansion}' en la BD.`);
      return;
    }

    const setCode = await this.getSetCode(expansion);
    if (!setCode) return;

    const scryfallToMtgjson = await this.getSetUUIDs(setCode);
    const mtgjsonUUIDtoProductId = new Map<string, string>();
    for (const [scryfallId, mtgjsonUUID] of scryfallToMtgjson) {
      const match = products.find(p => p.externalId === scryfallId);
      if (match) mtgjsonUUIDtoProductId.set(mtgjsonUUID, match.id);
    }

    if (mtgjsonUUIDtoProductId.size === 0) return;

    const prices = await this.getPricesForUUIDs(new Set(mtgjsonUUIDtoProductId.keys()));

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
    this.logger.log(`=== ¡Actualización MTG completada! ${updated} cartas actualizadas. ===`);
  }

  async updatePokemonSetPrices(expansion: string) {
    this.logger.log(`=== Iniciando actualización Pokémon TCG para: "${expansion}" ===`);
    const setsRes = await axios.get(`https://api.pokemontcg.io/v2/sets?q=name:"${expansion}"`);
    const set = setsRes.data?.data?.[0];
    if (!set) return;

    const setId = set.id;
    let page = 1;
    const pageSize = 250;
    let hasMore = true;
    let updatedCount = 0;

    while (hasMore) {
      const res = await axios.get(`https://api.pokemontcg.io/v2/cards?q=set.id:${setId}&page=${page}&pageSize=${pageSize}&select=id,tcgplayer`);
      const cards = res.data?.data ?? [];
      if (cards.length === 0) break;

      for (const card of cards) {
        const prices = card.tcgplayer?.prices;
        if (!prices) continue;

        const normalPrice = prices.normal?.mid || prices.unlimitedHolofoil?.mid || 0;
        const foilPrice = prices.holofoil?.mid || prices.reverseHolofoil?.mid || 0;

        if (normalPrice > 0) {
          await this.prisma.inventoryItem.updateMany({
            where: { product: { externalId: card.id }, isFoil: false },
            data: { price: normalPrice }
          });
        }
        if (foilPrice > 0) {
          await this.prisma.inventoryItem.updateMany({
            where: { product: { externalId: card.id }, isFoil: true },
            data: { price: foilPrice }
          });
        }
        updatedCount++;
      }
      if (cards.length < pageSize) hasMore = false;
      else page++;
    }
    this.logger.log(`=== ¡Actualización Pokémon completada! ${updatedCount} cartas actualizadas. ===`);
  }

  /**
   * Actualiza precios para Riftbound usando JustTCG API
   */
  async updateRiftboundSetPrices(expansion: string) {
    this.logger.log(`=== Iniciando actualización Riftbound via JustTCG para: "${expansion}" ===`);
    const apiKey = this.configService.get('JUSTTCG_API_KEY');
    if (!apiKey) {
      this.logger.error('JUSTTCG_API_KEY no configurada en el archivo .env');
      return;
    }

    // El set_id en JustTCG suele ser slug-riftbound, ej: "origins-riftbound"
    const setSlug = `${expansion.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-riftbound`;

    let offset = 0;
    const limit = 20;
    let hasMore = true;
    let updatedCount = 0;

    try {
      const gameName = 'riftbound-league-of-legends-trading-card-game';

      // Paso 1: Resolver el ID real del set en JustTCG
      this.logger.log(`Buscando ID del set para: "${expansion}"...`);
      const setsRes = await axios.get(`https://api.justtcg.com/v1/sets?game=${gameName}`, {
        headers: { 'X-Api-Key': apiKey }
      });

      const sets = setsRes.data?.data || [];
      const match = sets.find((s: any) => s.name?.toLowerCase() === expansion.toLowerCase());

      if (!match) {
        this.logger.warn(`No se encontró el set "${expansion}" en JustTCG. Abortando.`);
        return;
      }

      // Intentamos obtener el ID de varias propiedades posibles
      const setSlug = match.set_id || match.slug || match.id;

      if (!setSlug) {
        this.logger.error(`Se encontró el set "${expansion}" pero no tiene un ID/Slug válido: ${JSON.stringify(match)}`);
        return;
      }

      this.logger.log(`Set "${expansion}" resuelto como ID: "${setSlug}". Iniciando descarga de cartas...`);

      // Paso 1.5: Cargar TODOS los productos de Riftbound para match de emergencia
      const allRiftboundProducts = await this.prisma.product.findMany({
        where: { cardDetail: { game: { contains: 'Riftbound', mode: 'insensitive' } } },
        select: { id: true, externalId: true, name: true, cardDetail: { select: { expansion: true } } }
      });

      const normalize = (str: string) => str?.toLowerCase().replace(/[^a-z0-9]/g, '') || '';

      // Paso 2: Descargar solo las cartas de ese set
      while (hasMore) {
        this.logger.log(`Consultando JustTCG (Set: ${setSlug}, Cartas ${offset} a ${offset + limit})...`);

        await new Promise(resolve => setTimeout(resolve, 8000));

        const url = `https://api.justtcg.com/v1/cards?game=${gameName}&set=${setSlug}&limit=${limit}&offset=${offset}`;
        const res = await axios.get(url, {
          headers: { 'X-Api-Key': apiKey }
        });

        const cards = res.data?.data || [];
        if (cards.length === 0) break;

        for (const card of cards) {
          const tcgId = card.tcgplayerId ? String(card.tcgplayerId) : null;

          if (!tcgId) continue;

          // Buscar el producto local por su ID de TCGPlayer (externalId)
          const matchLocal = allRiftboundProducts.find(lp => lp.externalId === tcgId);

          if (!matchLocal) {
            // Log opcional para ver si falta alguna carta importante
            // this.logger.warn(`No se encontró producto con externalId: ${tcgId} (${card.name})`);
            continue;
          }

          const variants = card.variants || [];
          for (const variant of variants) {
            if (variant.condition === 'Near Mint' && (variant.marketPrice > 0 || variant.price > 0)) {
              const isFoil = variant.printing === 'Foil';
              const finalPrice = variant.marketPrice || variant.price;

              const updateRes = await this.prisma.inventoryItem.updateMany({
                where: {
                  productId: matchLocal.id,
                  isFoil: isFoil
                },
                data: { price: finalPrice }
              });

              if (updateRes.count > 0) updatedCount += updateRes.count;
            }
          }
        }

        hasMore = res.data?.meta?.hasMore || false;
        offset += limit;
      }

      this.logger.log(`=== ¡Actualización Riftbound completada! ${updatedCount} variantes actualizadas. ===`);
    } catch (err) {
      this.logger.error(`Error en JustTCG API para ${expansion}:`, err.response?.data || err.message);
    }
  }
}