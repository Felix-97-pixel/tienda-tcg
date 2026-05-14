import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';
import { RiftboundProvider } from './providers/riftbound.provider';
import { MagicProvider } from './providers/magic.provider';
import { PokemonProvider } from './providers/pokemon.provider';

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

  constructor(private prisma: PrismaService) {
    this.providers = {
      riftbound: new RiftboundProvider(this.prisma),
      pokemon: new PokemonProvider(this.prisma),
      magic: new MagicProvider(this.prisma),
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

    if (gameLower === settingsMap.get('mtg_sync_destination')) return 'magic';
    if (gameLower === settingsMap.get('pokemon_sync_destination')) return 'pokemon';
    if (gameLower === settingsMap.get('riftbound_sync_destination')) return 'riftbound';

    return this.providers[gameLower] ? gameLower : '';
  }

  // Los métodos de obtener listas de sets se mantienen por ahora 
  // ya que son simples GETs, pero también podrían moverse a los providers.

  /**
   * Obtiene la lista de ediciones de Magic desde MTGJSON
   */
  async getMtgSets() {
    const res = await axios.get('https://mtgjson.com/api/v5/SetList.json');
    const data = res.data?.data || [];
    // Ordenar por fecha descendente
    return data.sort((a: any, b: any) =>
      new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
    );
  }

  /**
   * Obtiene la lista de ediciones de Pokemon desde pokemontcg.io
   */
  async getPokemonSets() {
    const res = await axios.get('https://api.pokemontcg.io/v2/sets');
    const data = res.data?.data || [];
    // Ordenar por fecha descendente
    return data.sort((a: any, b: any) =>
      new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
    );
  }

  /**
   * Obtiene la lista de ediciones de Riftbound desde Riftcodex
   */
  async getRiftboundSets() {
    try {
      const res = await axios.get('https://api.riftcodex.com/sets/', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });

      // La API devuelve los sets en la propiedad 'items'
      let results = [];
      if (res.data && res.data.items) {
        results = res.data.items;
      } else if (res.data && res.data.results) {
        results = res.data.results;
      } else if (Array.isArray(res.data)) {
        results = res.data;
      }

      const mappedSets = results.map((s: any) => ({
        id: s.set_id || s.id || '',
        name: s.name || 'Set sin nombre',
        release_date: s.published_on || s.release_date || new Date().toISOString()
      }));

      // Ordenar por fecha descendente
      return mappedSets.sort((a: any, b: any) => {
        const dateA = new Date(a.release_date).getTime();
        const dateB = new Date(b.release_date).getTime();
        return (dateB || 0) - (dateA || 0);
      });
    } catch (error) {
      console.error('❌ Error al obtener sets de Riftbound:', error.message);
      return [];
    }
  }
}
