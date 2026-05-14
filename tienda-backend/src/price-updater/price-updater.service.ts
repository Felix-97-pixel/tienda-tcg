import { Injectable, Logger } from '@nestjs/common';
import { SyncService } from '../sync/sync.service';

@Injectable()
export class PriceUpdaterService {
  private readonly logger = new Logger(PriceUpdaterService.name);

  constructor(private syncService: SyncService) {}

  /**
   * Obtiene el progreso desde el servicio unificado
   */
  getProgress(game: string) {
    return this.syncService.getProgress(game).price;
  }

  async checkExpansionExists(expansion: string) {
    return this.syncService.checkExpansionExists(expansion);
  }

  /**
   * Delegar actualización a SyncService
   */
  async updatePrices(game: string, expansion: string) {
    return this.syncService.updatePrices(game, expansion);
  }

  // Mantenemos estos métodos por compatibilidad con el Controller
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