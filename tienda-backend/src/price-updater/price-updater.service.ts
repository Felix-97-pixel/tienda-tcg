import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RiftboundProvider } from '../sync/providers/riftbound.provider';
import { MagicProvider } from '../sync/providers/magic.provider';
import { PokemonProvider } from '../sync/providers/pokemon.provider';

@Injectable()
export class PriceUpdaterService {
  private readonly logger = new Logger(PriceUpdaterService.name);
  private providers: Record<string, any>;
  private syncProgress: Record<string, { current: number, total: number, active: boolean }> = {
    magic: { current: 0, total: 0, active: false },
    pokemon: { current: 0, total: 0, active: false },
    riftbound: { current: 0, total: 0, active: false },
  };

  constructor(private prisma: PrismaService) {
    this.providers = {
      riftbound: new RiftboundProvider(this.prisma),
      pokemon: new PokemonProvider(this.prisma),
      magic: new MagicProvider(this.prisma),
    };

    // Inyectamos una función de callback en los providers para que reporten progreso
    Object.values(this.providers).forEach(p => {
      p.onProgress = (game: string, current: number, total: number) => {
        const key = game.toLowerCase();
        if (this.syncProgress[key]) {
          this.syncProgress[key] = { current, total, active: true };
        }
      };
    });
  }

  getProgress(game: string) {
    return this.syncProgress[game.toLowerCase()] || { current: 0, total: 0, active: false };
  }

  private setStatus(game: string, active: boolean) {
    const key = game.toLowerCase();
    if (this.syncProgress[key]) {
      this.syncProgress[key].active = active;
      if (active) {
        this.syncProgress[key].current = 0;
        this.syncProgress[key].total = 0;
      }
    }
  }

  async checkExpansionExists(expansion: string): Promise<boolean> {
    const count = await this.prisma.product.count({
      where: { cardDetail: { expansion: { equals: expansion, mode: 'insensitive' } } }
    });
    return count > 0;
  }

  /**
   * Método genérico para actualizar precios de cualquier juego
   */
  async updatePrices(game: string, expansion: string) {
    const provider = this.providers[game.toLowerCase()];
    if (!provider) throw new Error(`Juego ${game} no soportado`);
    
    this.setStatus(game, true);
    try {
      const result = await provider.updateGamePrices(expansion);
      return result;
    } finally {
      this.setStatus(game, false);
    }
  }

  // Mantenemos estos métodos por compatibilidad con el Controller, 
  // pero ahora solo llaman al método genérico.
  async updateSetPrices(expansion: string) {
    return this.updatePrices('magic', expansion);
  }

  async updatePokemonSetPrices(expansion: string) {
    return this.updatePrices('pokemon', expansion);
  }

  async updateRiftboundSetPrices(expansion: string) {
    return this.updatePrices('riftbound', expansion);
  }
}