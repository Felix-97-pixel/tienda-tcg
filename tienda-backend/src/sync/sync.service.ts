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
   * Importación Masiva de TODO Magic The Gathering
   */
  async syncAllMtgSets(game: string) {
    const providerKey = 'magic';
    const provider = this.providers[providerKey];
    if (!provider) throw new Error(`La categoría '${game}' no está configurada.`);

    this.setStatus(providerKey, 'import', true);

    // Ejecución en segundo plano
    (async () => {
      try {
        const sets = await this.magicService.fetchScryfallSets();
        // Filtrar basura digital/tokens, pero incluir Commander, promos, etc.
        const invalidTypes = ['token', 'memorabilia', 'alchemy', 'funny'];
        const setsToSync = sets.filter(s => !invalidTypes.includes(s.set_type) && !s.digital);
        
        console.log(`[SyncService] Iniciando sincronización masiva de ${setsToSync.length} expansiones de MTG...`);
        
        let completed = 0;
        const totalSets = setsToSync.length;
        
        // Deshabilitamos temporalmente el reporte individual de cartas para que la barra no salte
        const originalOnProgress = provider.onProgress;
        provider.onProgress = undefined;

        for (const set of setsToSync) {
          console.log(`[SyncService] Sincronizando expansión: ${set.name} (${set.code}) [${completed + 1}/${totalSets}]`);
          try {
            await provider.syncSet(set.code, game);
            // Pequeña pausa entre expansiones para no saturar
            await new Promise(resolve => setTimeout(resolve, 2000));
          } catch (err: any) {
            console.error(`[SyncService] Error sincronizando expansión ${set.code}:`, err.message);
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
        console.log(`[SyncService] Sincronización masiva de MTG completada.`);
        this.setStatus(providerKey, 'import', false);
      } catch (err) {
        console.error(`[SyncService] Error en sincronización masiva:`, err.message);
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
   * Sincroniza los precios de una tienda copiando los precios del catálogo maestro.
   */
  async syncDealerPrices(storeId: string) {
    if (!storeId) throw new Error('Store ID is required');

    try {
      // Usamos una consulta cruda para máxima eficiencia
      const result = await this.prisma.$executeRaw`
        UPDATE "InventoryItem" AS d
        SET price = m.price
        FROM "MarketPrice" AS m
        WHERE d."productId" = m."productId"
          AND (d."finishId" = m."finishId" OR (d."finishId" IS NULL AND m."finishId" IS NULL))
          AND d."storeId" = ${storeId}
          AND m.price > 0;
      `;
      return { success: true, updatedCount: Number(result) };
    } catch (e: any) {
      console.error("Error syncing dealer prices", e);
      throw new Error("Error sincronizando los precios.");
    }
  }
}
