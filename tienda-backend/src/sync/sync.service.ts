import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RiftboundProvider } from './providers/riftbound.provider';
import { MagicProvider } from './providers/magic.provider';
import { PokemonProvider } from './providers/pokemon.provider';
import { MagicService } from './magic.service';
import { PokemonService } from './pokemon.service';
import { RiftboundService } from './riftbound.service';

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
    };

  constructor(
    private prisma: PrismaService,
    private magicService: MagicService,
    private pokemonService: PokemonService,
    private riftboundService: RiftboundService
  ) {
    this.providers = {
      riftbound: new RiftboundProvider(this.prisma, this.riftboundService),
      pokemon: new PokemonProvider(this.prisma, this.pokemonService),
      magic: new MagicProvider(this.prisma, this.magicService),
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
      where: { key: { in: ['mtg_sync_destination', 'pokemon_sync_destination', 'riftbound_sync_destination'] } }
    });
    const settingsMap = new Map(settings.map(s => [s.key, s.value.toLowerCase()]));
    const gameLower = game.toLowerCase();

    const mtgDest = settingsMap.get('mtg_sync_destination') || 'singles magic the gathering';
    const pkmDest = settingsMap.get('pokemon_sync_destination') || 'singles pokemon';
    const rbDest = settingsMap.get('riftbound_sync_destination') || 'singles riftbound';

    if (gameLower === mtgDest) return 'magic';
    if (gameLower === pkmDest) return 'pokemon';
    if (gameLower === rbDest) return 'riftbound';

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
   * Obtiene la lista de ediciones de Pokemon desde PokemonService (pokemontcg.io)
   */
  async getPokemonSets() {
    return this.pokemonService.fetchSets();
  }

  /**
   * Obtiene la lista de ediciones de Riftbound desde RiftboundService (Riftcodex)
   */
  async getRiftboundSets() {
    return this.riftboundService.fetchSets();
  }
  /**
   * Obtiene una vista previa del impacto de sincronización de precios para la tienda
   * filtrando opcionalmente por categoría (juego) y expansión.
   */
  async previewDealerPrices(
    storeId: string,
    filters: { category?: string; expansion?: string },
  ) {
    const categoryFilter =
      filters.category && filters.category !== 'ALL' ? filters.category : null;
    const expansionFilter =
      filters.expansion && filters.expansion !== 'ALL' ? filters.expansion : null;

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

    if (expansionFilter) {
      productWhere.cardDetail = {
        expansion: { equals: expansionFilter, mode: 'insensitive' },
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
              marketPrices: true,
            },
          },
          condition: { select: { id: true, name: true, displayName: true } },
          language: { select: { id: true, name: true, code: true } },
          finish: { select: { id: true, name: true } },
        },
        orderBy: [{ stock: 'desc' }, { updatedAt: 'desc' }],
        take: 10,
      }),
    ]);

    const condMap = new Map(
      condDevs.map((d) => [`${d.conditionId}_${d.gameId}`, Number(d.multiplier)]),
    );
    const langMap = new Map(
      langDevs.map((d) => [`${d.languageId}_${d.gameId}`, Number(d.multiplier)]),
    );

    const samples = sampleRows
      .map((row) => {
        const mp =
          row.product.marketPrices.find(
            (m) => (m.finishId || null) === (row.finishId || null),
          ) || row.product.marketPrices[0];
        if (!mp || Number(mp.price) <= 0) return null;

        const gameId = row.product.cardDetail?.gameId || '';
        const condMult = condMap.get(`${row.conditionId}_${gameId}`) ?? 1.0;
        const langMult = langMap.get(`${row.languageId}_${gameId}`) ?? 1.0;

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
          marketBasePrice: Number(mp.price),
          conditionMultiplier: condMult,
          languageMultiplier: langMult,
        };
      })
      .filter(Boolean);

    return {
      totalMatching,
      onlyZeroPriceCount,
      onlyInStockCount,
      devaluationRulesCount: condDevs.length + langDevs.length,
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
      targetScope?: 'ALL' | 'ONLY_ZERO_PRICE' | 'ONLY_IN_STOCK';
      applyDevaluations?: boolean;
      marginPercent?: number;
      autoPublish?: boolean;
    } = {},
  ) {
    if (!storeId) throw new Error('Store ID is required');

    const categoryFilter =
      options.category && options.category !== 'ALL' ? options.category : '';
    const expansionFilter =
      options.expansion && options.expansion !== 'ALL' ? options.expansion : '';
    const targetScope = options.targetScope || 'ALL';
    const applyDevaluations = Boolean(options.applyDevaluations);
    const marginPercent = Number(options.marginPercent || 0);
    const marginMultiplier = Math.max(0.05, 1 + marginPercent / 100);
    const autoPublish = Boolean(options.autoPublish);

    try {
      const result = await this.prisma.$executeRaw`
        UPDATE "InventoryItem" AS d
        SET
          price = ROUND(
            GREATEST(
              0.01,
              m.price
              * (CASE WHEN ${applyDevaluations} THEN COALESCE(scd.multiplier, 1.0) ELSE 1.0 END)
              * (CASE WHEN ${applyDevaluations} THEN COALESCE(sld.multiplier, 1.0) ELSE 1.0 END)
              * CAST(${marginMultiplier} AS numeric)
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
          AND (${expansionFilter} = '' OR LOWER(COALESCE(cd.expansion, '')) = LOWER(${expansionFilter}))
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
}
