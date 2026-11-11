import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { SyncService } from './sync.service';

export interface ScheduleExpansionItem {
  id: string;
  name: string;
  externalId: string | null;
  gameId: string;
  gameName: string;
  gameKey: string;
  isAutoSyncEnabled: boolean;
  syncFrequency: string; // 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'MANUAL'
  lastPriceSyncAt: string | null;
  nextPriceSyncAt: string | null;
  lastSyncStatus: string | null;
  lastSyncError: string | null;
  assignedCardsCount: number;
}

@Injectable()
export class PriceSchedulerService implements OnApplicationBootstrap {
  private readonly logger = new Logger(PriceSchedulerService.name);
  private isProcessing = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly syncService: SyncService,
  ) {}

  /**
   * Resiliencia y Catch-Up: Al arrancar el backend (por ejemplo si la máquina
   * estuvo suspendida en Neon o Render), se verifica tras 15 segundos si hay
   * alguna sincronización pendiente atrasada para ponerse al día inmediatamente.
   */
  async onApplicationBootstrap() {
    this.logger.log('PriceSchedulerService inicializado. Programando verificación Catch-Up en 15 segundos...');
    setTimeout(() => {
      this.checkAndRunPendingSyncs('CATCH_UP_BOOTSTRAP').catch((err) => {
        this.logger.error(`Error en Catch-Up de arranque: ${err.message}`, err.stack);
      });
    }, 15000);
  }

  /**
   * Cron horario: Cada hora en punto revisa si alguna edición habilitada
   * ha cumplido su ciclo (Daily, Weekly, Monthly).
   * Al hacer la consulta, si Neon está dormido se despierta automáticamente (Auto-Resume).
   */
  @Cron(CronExpression.EVERY_HOUR)
  async handleHourlyCron() {
    this.logger.log('[PriceScheduler] Ejecutando verificación horaria programada...');
    await this.checkAndRunPendingSyncs('HOURLY_CRON');
  }

  /**
   * Normaliza el nombre del juego al provider key interno de SyncService
   */
  mapGameNameToProviderKey(gameName: string): string | null {
    const norm = (gameName || '').toLowerCase();
    if (norm.includes('riftbound')) return 'riftbound';
    if (norm.includes('poke')) return 'pokemon';
    if (norm.includes('magic') || norm.includes('mtg')) return 'magic';
    if (norm.includes('one piece') || norm.includes('onepiece')) return 'onepiece';
    if (norm.includes('lorcana')) return 'lorcana';
    if (norm.includes('gundam')) return 'gundam';
    return null;
  }

  /**
   * Determina si una edición debe sincronizarse ahora según su frecuencia y última ejecución
   */
  shouldSyncNow(frequency: string, lastSync: Date | null, now: Date): boolean {
    if (!lastSync) return true; // Nunca se ha sincronizado

    const diffMs = now.getTime() - lastSync.getTime();
    const marginMs = 5 * 60 * 1000; // Margen de 5 minutos

    switch (frequency) {
      case 'DAILY':
        return diffMs >= 24 * 60 * 60 * 1000 - marginMs;
      case 'WEEKLY':
        return diffMs >= 7 * 24 * 60 * 60 * 1000 - marginMs;
      case 'MONTHLY':
        return diffMs >= 30 * 24 * 60 * 60 * 1000 - marginMs;
      default:
        return false;
    }
  }

  /**
   * Calcula la próxima fecha de sincronización
   */
  calculateNextSync(frequency: string, fromDate: Date = new Date()): Date | null {
    const next = new Date(fromDate);
    switch (frequency) {
      case 'DAILY':
        next.setDate(next.getDate() + 1);
        return next;
      case 'WEEKLY':
        next.setDate(next.getDate() + 7);
        return next;
      case 'MONTHLY':
        next.setDate(next.getDate() + 30);
        return next;
      default:
        return null;
    }
  }

  /**
   * Ejecuta la comprobación y sincronización de ediciones pendientes en cola secuencial
   */
  async checkAndRunPendingSyncs(triggerReason: string = 'MANUAL'): Promise<{ processed: number; errors: number }> {
    if (this.isProcessing) {
      this.logger.warn(`[PriceScheduler] Ya hay una ejecución en progreso. Ignorando solicitud (${triggerReason}).`);
      return { processed: 0, errors: 0 };
    }

    this.isProcessing = true;
    let processed = 0;
    let errors = 0;

    try {
      this.logger.log(`[PriceScheduler] Buscando ediciones activas pendientes (${triggerReason})...`);

      // 1. Obtener todas las expansiones que tengan auto-sync habilitado
      const activeExpansions = await this.prisma.expansion.findMany({
        where: {
          isAutoSyncEnabled: true,
          syncFrequency: { not: 'MANUAL' },
        },
        include: {
          gameRel: true,
        },
        orderBy: {
          lastPriceSyncAt: 'asc', // Priorizar las que llevan más tiempo sin actualizarse
        },
      });

      const now = new Date();
      const pendingList = activeExpansions.filter((exp) =>
        this.shouldSyncNow(exp.syncFrequency, exp.lastPriceSyncAt, now),
      );

      this.logger.log(
        `[PriceScheduler] ${activeExpansions.length} ediciones activas configuradas. ${pendingList.length} requieren sincronización ahora.`,
      );

      for (const exp of pendingList) {
        const gameKey = this.mapGameNameToProviderKey(exp.gameRel?.name || '');
        if (!gameKey) {
          this.logger.warn(`[PriceScheduler] No se pudo mapear el juego '${exp.gameRel?.name}' para la edición '${exp.name}'.`);
          continue;
        }

        const provider = (this.syncService as any).providers?.[gameKey];
        if (!provider) {
          this.logger.warn(`[PriceScheduler] Provider no disponible para '${gameKey}'.`);
          continue;
        }

        try {
          this.logger.log(`[PriceScheduler] Sincronizando precios de [${gameKey.toUpperCase()}] '${exp.name}' (Frecuencia: ${exp.syncFrequency})...`);

          // Marcar como en progreso
          await this.prisma.expansion.update({
            where: { id: exp.id },
            data: { lastSyncStatus: 'IN_PROGRESS', lastSyncError: null },
          });

          // Ejecutar actualización de precios
          const result = await provider.updateGamePrices(exp.name);
          const syncCompletedAt = new Date();
          const nextSync = this.calculateNextSync(exp.syncFrequency, syncCompletedAt);

          // Actualizar estado exitoso y calcular próxima fecha
          await this.prisma.expansion.update({
            where: { id: exp.id },
            data: {
              lastPriceSyncAt: syncCompletedAt,
              nextPriceSyncAt: nextSync,
              lastSyncStatus: 'SUCCESS',
              lastSyncError: null,
            },
          });

          this.logger.log(
            `[PriceScheduler] '${exp.name}' sincronizada con éxito: ${result.updated} actualizadas, ${result.errors} errores. Próxima: ${nextSync?.toISOString()}`,
          );
          processed++;
        } catch (err: any) {
          errors++;
          this.logger.error(`[PriceScheduler] Error sincronizando '${exp.name}': ${err.message}`, err.stack);

          await this.prisma.expansion.update({
            where: { id: exp.id },
            data: {
              lastSyncStatus: 'ERROR',
              lastSyncError: err.message || 'Error desconocido en sincronización',
            },
          }).catch(() => null);
        }
      }
    } catch (globalErr: any) {
      this.logger.error(`[PriceScheduler] Error global en scheduler: ${globalErr.message}`, globalErr.stack);
    } finally {
      this.isProcessing = false;
    }

    return { processed, errors };
  }

  /**
   * Obtiene la lista completa de expansiones con su configuración de sincronización
   * para alimentar la tabla y filtros de SuperAdmin
   */
  async getSchedulesList(gameKeyFilter?: string): Promise<ScheduleExpansionItem[]> {
    const expansions = await this.prisma.expansion.findMany({
      include: {
        gameRel: true,
        _count: {
          select: { cardDetails: true },
        },
      },
      orderBy: [
        { isAutoSyncEnabled: 'desc' },
        { name: 'asc' },
      ],
    });

    const result: ScheduleExpansionItem[] = [];

    for (const exp of expansions) {
      const gName = exp.gameRel?.name || 'General';
      const gKey = this.mapGameNameToProviderKey(gName) || 'unknown';

      if (gameKeyFilter && gameKeyFilter !== 'ALL' && gKey !== gameKeyFilter.toLowerCase()) {
        continue;
      }

      result.push({
        id: exp.id,
        name: exp.name,
        externalId: exp.externalId,
        gameId: exp.gameId,
        gameName: gName,
        gameKey: gKey,
        isAutoSyncEnabled: exp.isAutoSyncEnabled,
        syncFrequency: exp.syncFrequency || 'MANUAL',
        lastPriceSyncAt: exp.lastPriceSyncAt ? exp.lastPriceSyncAt.toISOString() : null,
        nextPriceSyncAt: exp.nextPriceSyncAt ? exp.nextPriceSyncAt.toISOString() : null,
        lastSyncStatus: exp.lastSyncStatus,
        lastSyncError: exp.lastSyncError,
        assignedCardsCount: exp._count?.cardDetails || 0,
      });
    }

    return result;
  }

  /**
   * Actualiza la configuración de frecuencia de una edición individual
   */
  async updateExpansionSchedule(expansionId: string, frequency: string, enabled?: boolean) {
    const freq = frequency.toUpperCase();
    const isEnabled = enabled !== undefined ? enabled : freq !== 'MANUAL';
    const nextSync = isEnabled ? this.calculateNextSync(freq) : null;

    return this.prisma.expansion.update({
      where: { id: expansionId },
      data: {
        syncFrequency: freq,
        isAutoSyncEnabled: isEnabled,
        nextPriceSyncAt: nextSync,
      },
    });
  }

  /**
   * Actualiza la configuración de frecuencia para múltiples ediciones a la vez (Batch)
   */
  async updateBatchSchedules(expansionIds: string[], frequency: string, enabled?: boolean) {
    if (!expansionIds || expansionIds.length === 0) return { count: 0 };

    const freq = frequency.toUpperCase();
    const isEnabled = enabled !== undefined ? enabled : freq !== 'MANUAL';
    const nextSync = isEnabled ? this.calculateNextSync(freq) : null;

    return this.prisma.expansion.updateMany({
      where: { id: { in: expansionIds } },
      data: {
        syncFrequency: freq,
        isAutoSyncEnabled: isEnabled,
        nextPriceSyncAt: nextSync,
      },
    });
  }
}

