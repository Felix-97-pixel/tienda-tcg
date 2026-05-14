import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';
import { GameType } from '../common/enums/game-type.enum';
import { RiftboundProvider } from './providers/riftbound.provider';
import { MagicProvider } from './providers/magic.provider';
import { PokemonProvider } from './providers/pokemon.provider';

interface CardToSync {
  externalId: string;
  name: string;
  image: string;
  expansion: string;
  rarity: string;
  number: string;
  attributes: string[];
}

@Injectable()
export class SyncService {
  private providers: Record<string, any>;

  constructor(private prisma: PrismaService) {
    this.providers = {
      riftbound: new RiftboundProvider(this.prisma),
      pokemon: new PokemonProvider(this.prisma),
      magic: new MagicProvider(this.prisma),
    };
  }

  async syncSet(game: string, setId: string) {
    // 1. Obtener las configuraciones de destino desde la base de datos
    const settings = await this.prisma.globalSetting.findMany({
      where: {
        key: { in: ['mtg_sync_destination', 'pokemon_sync_destination', 'riftbound_sync_destination'] }
      }
    });

    const settingsMap = new Map(settings.map(s => [s.key, s.value.toLowerCase()]));
    const gameNameLower = game.toLowerCase();

    // 2. Determinar el proveedor comparando el nombre recibido con las configuraciones
    let providerKey = '';

    if (gameNameLower === settingsMap.get('mtg_sync_destination')) providerKey = 'magic';
    else if (gameNameLower === settingsMap.get('pokemon_sync_destination')) providerKey = 'pokemon';
    else if (gameNameLower === settingsMap.get('riftbound_sync_destination')) providerKey = 'riftbound';
    
    // Si no coincide con ninguna configuración, probamos con las llaves directas por si acaso
    if (!providerKey && this.providers[gameNameLower]) {
      providerKey = gameNameLower;
    }

    const provider = this.providers[providerKey];
    if (provider) {
      return provider.syncSet(setId, game);
    }

    throw new Error(`La categoría '${game}' no está configurada como destino para ningún TCG.`);
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
