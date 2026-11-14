import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RiftboundProvider } from './providers/riftbound.provider';
import { MagicProvider } from './providers/magic.provider';
import { PokemonProvider } from './providers/pokemon.provider';
import { OnePieceProvider } from './providers/onepiece.provider';
import { LorcanaProvider } from './providers/lorcana.provider';
import { GundamProvider } from './providers/gundam.provider';
import { MagicService } from './magic.service';
import { ScrydexService } from './scrydex.service';

@Injectable()
export class SyncService {
  private providers: Record<string, any>;
  private syncProgress: Record<string, {
    import: { current: number, total: number, active: boolean },
    price: { current: number, total: number, active: boolean }
  }> = {
      magic: {
        import: { current: 0, total: 0, active: false },
        price: { current: 0, total: 0, active: false }
      },
      pokemon: {
        import: { current: 0, total: 0, active: false },
        price: { current: 0, total: 0, active: false }
      },
      riftbound: {
        import: { current: 0, total: 0, active: false },
        price: { current: 0, total: 0, active: false }
      },
      onepiece: {
        import: { current: 0, total: 0, active: false },
        price: { current: 0, total: 0, active: false }
      },
      lorcana: {
        import: { current: 0, total: 0, active: false },
        price: { current: 0, total: 0, active: false }
      },
      gundam: {
        import: { current: 0, total: 0, active: false },
        price: { current: 0, total: 0, active: false }
      },
    };

  constructor(
    private prisma: PrismaService,
    private magicService: MagicService,
    private scrydexService: ScrydexService
  ) {
    this.providers = {
      riftbound: new RiftboundProvider(this.prisma, this.scrydexService),
      pokemon: new PokemonProvider(this.prisma, this.scrydexService),
      magic: new MagicProvider(this.prisma, this.magicService),
      onepiece: new OnePieceProvider(this.prisma, this.scrydexService),
      lorcana: new LorcanaProvider(this.prisma, this.scrydexService),
      gundam: new GundamProvider(this.prisma, this.scrydexService),
    };

    // Inyectamos el callback para reportar progreso
    // Los providers deben pasar el tipo de tarea: 'import' o 'price' (opcional, por defecto 'import')
    Object.values(this.providers).forEach(p => {
      p.onProgress = (game: string, current: number, total: number, type: 'import' | 'price' = 'import') => {
        const key = game.toLowerCase();
        if (this.syncProgress[key]) {
          this.syncProgress[key][type] = { current, total, active: true };
        }
      };
    });
  }

  getProgress(game: string) {
    return this.syncProgress[game.toLowerCase()] || {
      import: { current: 0, total: 0, active: false },
      price: { current: 0, total: 0, active: false }
    };
  }

  private setStatus(game: string, type: 'import' | 'price', active: boolean) {
    const key = game.toLowerCase();
    if (this.syncProgress[key]) {
      this.syncProgress[key][type].active = active;
      if (active) {
        this.syncProgress[key][type].current = 0;
        this.syncProgress[key][type].total = 0;
      }
    }
  }

  /**
   * Importación de un Set Completo
   */
  async syncSet(game: string, setId: string) {
    const providerKey = await this.resolveProviderKey(game);
    const provider = this.providers[providerKey];
    if (!provider) throw new Error(`La categoría '${game}' no está configurada.`);

    this.setStatus(providerKey, 'import', true);

    // Background execution
    provider.syncSet(setId, game)
      .then(() => this.setStatus(providerKey, 'import', false))
      .catch((err) => {
        console.error(`Error en importación (${providerKey}):`, err.message);
        this.setStatus(providerKey, 'import', false);
      });

    return { message: `Importación de '${setId}' iniciada.`, active: true };
  }

  /**
   * Importación Masiva Genérica (Strategy Pattern)
   */
  async syncAllSets(game: string) {
    const providerKey = await this.resolveProviderKey(game);
    const provider = this.providers[providerKey];
    if (!provider) throw new Error(`La categoría '${game}' no está configurada.`);

    this.setStatus(providerKey, 'import', true);

    // Ejecución en segundo plano
    (async () => {
      try {
        const sets = await provider.fetchAllSets();
        console.log(`[SyncService] Iniciando sincronización masiva de ${sets.length} expansiones de ${game}...`);
        
        let completed = 0;
        const totalSets = sets.length;
        
        // Deshabilitamos temporalmente el reporte individual de cartas para que la barra no salte
        const originalOnProgress = provider.onProgress;
        provider.onProgress = undefined;

        for (const set of sets) {
          console.log(`[SyncService] Sincronizando expansión: ${set.name} (${set.id}) [${completed + 1}/${totalSets}]`);
          try {
            await provider.syncSet(set.id, game);
            // Pequeña pausa entre expansiones para no saturar
            await new Promise(resolve => setTimeout(resolve, 2000));
          } catch (err: any) {
            console.error(`[SyncService] Error sincronizando expansión ${set.id}:`, err.message);
          } finally {
            completed++;
            // Actualizar progreso total basado en los sets completados
            if (this.syncProgress[providerKey]) {
              this.syncProgress[providerKey].import.current = completed;
              this.syncProgress[providerKey].import.total = totalSets;
            }
          }
        }
        
        provider.onProgress = originalOnProgress;
        console.log(`[SyncService] Sincronización masiva de ${game} completada.`);
        this.setStatus(providerKey, 'import', false);
      } catch (err) {
        console.error(`[SyncService] Error en sincronización masiva de ${game}:`, err.message);
        this.setStatus(providerKey, 'import', false);
      }
    })();

    return { message: `Sincronización masiva iniciada en segundo plano.`, active: true };
  }

  /**
   * Actualización de Precios (Movido desde PriceUpdaterService)
   */
  async updatePrices(game: string, expansion: string) {
    const providerKey = game.toLowerCase();
    const provider = this.providers[providerKey];
    if (!provider) throw new Error(`Juego ${game} no soportado.`);

    this.setStatus(providerKey, 'price', true);

    // Background execution
    provider.updateGamePrices(expansion)
      .then(() => this.setStatus(providerKey, 'price', false))
      .catch((err) => {
        console.error(`Error en precios (${providerKey}):`, err.message);
        this.setStatus(providerKey, 'price', false);
      });

    return { message: `Actualización de precios para '${expansion}' iniciada.`, active: true };
  }

  async checkExpansionExists(expansion: string): Promise<boolean> {
    const count = await this.prisma.product.count({
      where: { cardDetail: { expansion: { equals: expansion, mode: 'insensitive' } } }
    });
    return count > 0;
  }

  private async resolveProviderKey(game: string): Promise<string> {
    const settings = await this.prisma.globalSetting.findMany({
      where: { key: { in: [
        'mtg_sync_destination',
        'pokemon_sync_destination',
        'riftbound_sync_destination',
        'onepiece_sync_destination',
        'lorcana_sync_destination',
        'gundam_sync_destination'
      ] } }
    });
    const settingsMap = new Map(settings.map(s => [s.key, s.value.toLowerCase()]));
    const gameLower = game.toLowerCase();

    const mtgDest = settingsMap.get('mtg_sync_destination') || 'singles magic the gathering';
    const pkmDest = settingsMap.get('pokemon_sync_destination') || 'singles pokemon';
    const rbDest = settingsMap.get('riftbound_sync_destination') || 'singles riftbound';
    const opDest = settingsMap.get('onepiece_sync_destination') || 'singles one piece';
    const lrcDest = settingsMap.get('lorcana_sync_destination') || 'singles lorcana';
    const gdmDest = settingsMap.get('gundam_sync_destination') || 'singles gundam';

    if (gameLower === mtgDest || gameLower.includes('magic')) return 'magic';
    if (gameLower === pkmDest || gameLower.includes('pokemon')) return 'pokemon';
    if (gameLower === rbDest || gameLower.includes('riftbound')) return 'riftbound';
    if (gameLower === opDest || gameLower.includes('one piece') || gameLower === 'onepiece') return 'onepiece';
    if (gameLower === lrcDest || gameLower.includes('lorcana')) return 'lorcana';
    if (gameLower === gdmDest || gameLower.includes('gundam')) return 'gundam';

    return this.providers[gameLower] ? gameLower : '';
  }

  /**
   * Resuelve y devuelve el Provider instanciado en base al nombre de la categoría o juego.
   */
  async getProviderForCategory(categoryName: string) {
    const providerKey = await this.resolveProviderKey(categoryName);
    return this.providers[providerKey] || null;
  }

  /**
   * Obtiene la lista de ediciones de Magic desde MagicService (MTGJSON)
   */
  async getMtgSets() {
    return this.magicService.fetchSets();
  }

  /**
   * Obtiene la lista de ediciones de Pokemon desde ScrydexService
   */
  async getPokemonSets() {
    const sets = await this.scrydexService.fetchSets('pokemon');
    return sets
      .filter((s) => !s.id?.startsWith('tcgp-') && (!s.language || s.language === 'English' || s.language_code === 'EN'))
      .map((s) => ({
        id: s.id,
        name: s.name || s.id,
        code: s.code || '',
        releaseDate: s.release_date || (s as any).releaseDate,
        total: s.total,
        images: {
          logo: (s as any).logo || s.images?.logo,
          symbol: (s as any).symbol || s.images?.symbol,
        },
      }))
      .sort((a, b) =>
        new Date(b.releaseDate || 0).getTime() - new Date(a.releaseDate || 0).getTime()
      );
  }

  /**
   * Obtiene la lista de ediciones de Riftbound desde ScrydexService
   */
  async getRiftboundSets() {
    return this.scrydexService.fetchSets('riftbound');
  }

  /**
   * Obtiene la lista de ediciones de One Piece desde ScrydexService
   */
  async getOnePieceSets() {
    return this.scrydexService.fetchSets('onepiece');
  }

  /**
   * Obtiene la lista de ediciones de Disney Lorcana desde ScrydexService
   */
  async getLorcanaSets() {
    return this.scrydexService.fetchSets('lorcana');
  }

  /**
   * Obtiene la lista de ediciones de Gundam Card Game desde ScrydexService
   */
  async getGundamSets() {
    return this.scrydexService.fetchSets('gundam');
  }
  /**
   * Obtiene una vista previa del impacto de sincronización de precios para la tienda
   * filtrando opcionalmente por categoría (juego) y expansión.
   */
  async previewDealerPrices(
    storeId: string,
    filters: {
      category?: string;
      expansion?: string;
      expansions?: string[] | string;
      priceDate?: string;
      priceBenchmarkSource?: 'USA_MARKET' | 'LOCAL_MARKET';
    },
  ) {
    const categoryFilter =
      filters.category && filters.category !== 'ALL' ? filters.category : null;

    const rawExpansions: string[] = filters.expansions
      ? (Array.isArray(filters.expansions)
          ? filters.expansions
          : typeof filters.expansions === 'string'
          ? filters.expansions.split(',').map((s) => s.trim())
          : [])
      : filters.expansion && filters.expansion !== 'ALL'
      ? [filters.expansion]
      : [];

    const expansionsList = rawExpansions.filter((e) => e && e !== 'ALL');
    const isHistorical = Boolean(filters.priceDate && filters.priceDate !== 'LATEST');
    const targetDateObj = isHistorical ? new Date(filters.priceDate!) : null;
    if (targetDateObj) targetDateObj.setUTCHours(0, 0, 0, 0);

    const productWhere: any = {
      marketPrices: {
        some: {
          price: { gt: 0 },
        },
      },
    };

    if (categoryFilter) {
      productWhere.category = {
        OR: [
          { name: { equals: categoryFilter, mode: 'insensitive' } },
          { slug: { equals: categoryFilter, mode: 'insensitive' } },
          { id: categoryFilter },
        ],
      };
    }

    if (expansionsList.length > 0) {
      productWhere.cardDetail = {
        expansion: { in: expansionsList, mode: 'insensitive' },
      };
    }

    const baseWhere: any = {
      storeId,
      product: productWhere,
    };

    const [
      totalMatching,
      onlyZeroPriceCount,
      onlyInStockCount,
      condDevs,
      langDevs,
      sampleRows,
      historyDates,
    ] = await Promise.all([
      this.prisma.inventoryItem.count({ where: baseWhere }),
      this.prisma.inventoryItem.count({
        where: { ...baseWhere, price: 0 },
      }),
      this.prisma.inventoryItem.count({
        where: { ...baseWhere, stock: { gt: 0 } },
      }),
      this.prisma.storeConditionDevaluation.findMany({ where: { storeId } }),
      this.prisma.storeLanguageDevaluation.findMany({ where: { storeId } }),
      this.prisma.inventoryItem.findMany({
        where: baseWhere,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              imageUrl: true,
              category: { select: { name: true } },
              cardDetail: { select: { expansion: true, gameId: true } },
              marketPrices: {
                include: {
                  history: isHistorical && targetDateObj
                    ? { where: { date: targetDateObj }, take: 1 }
                    : { orderBy: { date: 'desc' }, take: 1 },
                },
              },
              localMarketPrices: isHistorical && targetDateObj
                ? { where: { date: targetDateObj }, take: 1 }
                : { orderBy: { date: 'desc' }, take: 1 },
            },
          },
          condition: { select: { id: true, name: true, displayName: true } },
          language: { select: { id: true, name: true, code: true } },
          finish: { select: { id: true, name: true } },
        },
        orderBy: [{ stock: 'desc' }, { updatedAt: 'desc' }],
        take: 10,
      }),
      this.prisma.marketPriceHistory.findMany({
        distinct: ['date'],
        orderBy: { date: 'desc' },
        take: 14,
        select: { date: true },
      }),
    ]);

    const availableDates = historyDates.map(
      (h) => h.date.toISOString().split('T')[0],
    );

    const condMap = new Map(
      condDevs.map((d) => [`${d.conditionId}_${d.gameId}`, Number(d.multiplier)]),
    );
    const langMap = new Map(
      langDevs.map((d) => [`${d.languageId}_${d.gameId}`, Number(d.multiplier)]),
    );

    let latestTimestamp = 0;
    const samples = sampleRows
      .map((row) => {
        const mp: any =
          row.product.marketPrices.find(
            (m: any) => (m.finishId || null) === (row.finishId || null),
          ) || row.product.marketPrices[0];
        if (!mp || Number(mp.price) <= 0) return null;

        const lmp = row.product.localMarketPrices?.[0];
        const localPrice = lmp ? Number(lmp.lowPrice || lmp.avgPrice) : null;

        const gameId = row.product.cardDetail?.gameId || '';
        const condMult = condMap.get(`${row.conditionId}_${gameId}`) ?? 1.0;
        const langMult = langMap.get(`${row.languageId}_${gameId}`) ?? 1.0;

        const histPrice = isHistorical && mp.history?.[0]?.price
          ? Number(mp.history[0].price)
          : null;
        const marketBasePrice = histPrice ?? Number(mp.price);

        const sampleDate = isHistorical && mp.history?.[0]?.date
          ? new Date(mp.history[0].date).toISOString().split('T')[0]
          : mp.updatedAt
          ? new Date(mp.updatedAt).toISOString().split('T')[0]
          : null;

        if (mp.updatedAt) {
          const t = new Date(mp.updatedAt).getTime();
          if (t > latestTimestamp) latestTimestamp = t;
        }

        return {
          id: row.id,
          name: row.product.name,
          imageUrl: row.product.imageUrl,
          categoryName: row.product.category?.name || '',
          expansion: row.product.cardDetail?.expansion || 'General',
          condition: row.condition?.displayName || row.condition?.name || 'NM',
          language: row.language?.code?.toUpperCase() || 'EN',
          finish: row.finish?.name || 'Normal',
          stock: row.stock,
          isPublished: row.isPublished,
          currentPrice: Number(row.price),
          marketBasePrice,
          localBasePrice: localPrice,
          priceDate: sampleDate,
          conditionMultiplier: condMult,
          languageMultiplier: langMult,
        };
      })
      .filter(Boolean);

    const localCoverageCount = samples.filter(
      (s: any) => s.localBasePrice && Number(s.localBasePrice) > 0,
    ).length;

    const effectiveDate = isHistorical && filters.priceDate
      ? filters.priceDate
      : latestTimestamp > 0
      ? new Date(latestTimestamp).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];

    const hoursAgo = latestTimestamp > 0
      ? Math.max(0, Math.round((Date.now() - latestTimestamp) / (1000 * 60 * 60)))
      : 0;

    const isDataOutdated = !isHistorical && hoursAgo > 48;

    return {
      totalMatching,
      onlyZeroPriceCount,
      onlyInStockCount,
      devaluationRulesCount: condDevs.length + langDevs.length,
      localCoverageCount,
      effectiveDate,
      hoursAgo,
      isDataOutdated,
      availableDates,
      samples,
    };
  }

  /**
   * Sincroniza los precios de una tienda copiando los precios del catálogo maestro,
   * permitiendo filtrar por juego (categoría), expansión, alcance de stock/precio,
   * reglas de devaluación de estado/idioma y margen porcentual.
   */
  async syncDealerPrices(
    storeId: string,
    options: {
      category?: string;
      expansion?: string;
      expansions?: string[] | string;
      targetScope?: 'ALL' | 'ONLY_ZERO_PRICE' | 'ONLY_IN_STOCK';
      applyDevaluations?: boolean;
      marginPercent?: number;
      autoPublish?: boolean;
      sourcePriceBasis?: 'GROSS' | 'NET';
      priceBenchmarkSource?: 'USA_MARKET' | 'LOCAL_MARKET';
      priceDate?: string;
    } = {},
  ) {
    if (!storeId) throw new Error('Store ID is required');

    const categoryFilter =
      options.category && options.category !== 'ALL' ? options.category : '';

    const rawExpansions: string[] = options.expansions
      ? (Array.isArray(options.expansions)
          ? options.expansions
          : typeof options.expansions === 'string'
          ? options.expansions.split(',').map((s) => s.trim())
          : [])
      : options.expansion && options.expansion !== 'ALL'
      ? [options.expansion]
      : [];

    const expansionsList = rawExpansions
      .filter((e) => e && e !== 'ALL')
      .map((e) => e.toLowerCase());

    const expansionCondition =
      expansionsList.length > 0
        ? Prisma.sql`AND LOWER(COALESCE(cd.expansion, '')) IN (${Prisma.join(expansionsList)})`
        : Prisma.empty;

    const targetScope = options.targetScope || 'ALL';
    const applyDevaluations = Boolean(options.applyDevaluations);
    const marginPercent = Number(options.marginPercent || 0);
    const marginMultiplier = Math.max(0.05, 1 + marginPercent / 100);
    const autoPublish = Boolean(options.autoPublish);
    const priceBenchmarkSource = options.priceBenchmarkSource || 'USA_MARKET';
    const isHistorical = Boolean(options.priceDate && options.priceDate !== 'LATEST');
    const targetDateStr = isHistorical ? options.priceDate! : '1970-01-01';

    // Normativa SII / Decisión del usuario: Si la fuente es neta, agregar 19% IVA al precio de catálogo
    const vatMultiplier = options.sourcePriceBasis === 'NET' ? 1.19 : 1.0;

    const lmpDateCondition = isHistorical
      ? Prisma.sql`AND lmp."date" = CAST(${targetDateStr} AS date)`
      : Prisma.sql`AND lmp."date" = CURRENT_DATE`;

    try {
      const result = await this.prisma.$executeRaw`
        UPDATE "InventoryItem" AS d
        SET
          price = ROUND(
            GREATEST(
              0.01,
              (CASE
                WHEN ${priceBenchmarkSource} = 'LOCAL_MARKET' AND COALESCE(lmp."lowPrice", 0) > 0 THEN lmp."lowPrice"
                WHEN ${isHistorical} AND mph.price IS NOT NULL THEN mph.price
                ELSE m.price
              END)
              * (CASE WHEN ${applyDevaluations} THEN COALESCE(scd.multiplier, 1.0) ELSE 1.0 END)
              * (CASE WHEN ${applyDevaluations} THEN COALESCE(sld.multiplier, 1.0) ELSE 1.0 END)
              * CAST(${marginMultiplier} AS numeric)
              * CAST(${vatMultiplier} AS numeric)
            ),
            2
          ),
          "isPublished" = CASE
            WHEN ${autoPublish} AND d.stock > 0 THEN true
            ELSE d."isPublished"
          END,
          "updatedAt" = NOW()
        FROM "MarketPrice" AS m
        INNER JOIN "Product" AS p ON p.id = d."productId"
        LEFT JOIN "MarketPriceHistory" AS mph
          ON mph."marketPriceId" = m.id
          AND mph."date" = CAST(${targetDateStr} AS date)
        LEFT JOIN "LocalMarketPriceHistory" AS lmp
          ON lmp."productId" = d."productId"
          AND (lmp."finishId" = d."finishId" OR (lmp."finishId" IS NULL AND d."finishId" IS NULL))
          ${lmpDateCondition}
        INNER JOIN "Category" AS c ON c.id = p."categoryId"
        LEFT JOIN "CardDetail" AS cd ON cd."productId" = p.id
        LEFT JOIN "StoreConditionDevaluation" AS scd
          ON scd."storeId" = d."storeId"
          AND scd."conditionId" = d."conditionId"
          AND scd."gameId" = cd."gameId"
        LEFT JOIN "StoreLanguageDevaluation" AS sld
          ON sld."storeId" = d."storeId"
          AND sld."languageId" = d."languageId"
          AND sld."gameId" = cd."gameId"
        WHERE d."productId" = m."productId"
          AND (d."finishId" = m."finishId" OR (d."finishId" IS NULL AND m."finishId" IS NULL))
          AND d."storeId" = ${storeId}
          AND m.price > 0
          AND (${categoryFilter} = '' OR LOWER(c.name) = LOWER(${categoryFilter}) OR LOWER(c.slug) = LOWER(${categoryFilter}) OR c.id = ${categoryFilter})
          ${expansionCondition}
          AND (
            ${targetScope} = 'ALL'
            OR (${targetScope} = 'ONLY_ZERO_PRICE' AND d.price = 0)
            OR (${targetScope} = 'ONLY_IN_STOCK' AND d.stock > 0)
          );
      `;
      return {
        success: true,
        updatedCount: Number(result),
      };
    } catch (e: any) {
      console.error("Error syncing dealer prices", e);
      throw new Error("Error sincronizando los precios.");
    }
  }

  /**
   * Actualiza en segundo plano los precios de mercado para múltiples expansiones de un juego
   */
  async updateBatchPrices(game: string, expansions: string[]) {
    const providerKey = game.toLowerCase();
    const provider = this.providers[providerKey];
    if (!provider) throw new Error(`Juego ${game} no soportado.`);

    const validExpansions = (expansions || []).filter((e) => e && e !== 'ALL');
    if (validExpansions.length === 0) {
      return { success: false, message: 'No hay expansiones válidas seleccionadas.' };
    }

    this.setStatus(providerKey, 'price', true);

    (async () => {
      try {
        for (const exp of validExpansions) {
          await provider.updateGamePrices(exp);
        }
      } catch (err: any) {
        console.error(`Error en actualización por lote (${providerKey}):`, err.message);
      } finally {
        this.setStatus(providerKey, 'price', false);
      }
    })();

    return {
      message: `Actualización de precios para ${validExpansions.length} expansiones iniciada en segundo plano.`,
      active: true,
    };
  }
}
