import { Controller, Post, Patch, Body, UseGuards, Get, Param, Query, Req, BadRequestException, UseInterceptors, UploadedFile, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { SyncService } from './sync.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { Permission } from '../auth/constants/permissions.enum';
import { PrismaService } from '../prisma/prisma.service';
import { LocalPriceIndexService } from './local-price-index.service';
import { PriceSchedulerService } from './price-scheduler.service';

@Controller('sync')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPERADMIN)
export class SyncController {
  constructor(
    private readonly syncService: SyncService,
    private readonly prisma: PrismaService,
    private readonly localPriceIndexService: LocalPriceIndexService,
    private readonly priceSchedulerService: PriceSchedulerService,
  ) { }

  @Get('magic-sets')
  async getMtgSets() {
    return this.syncService.getMtgSets();
  }

  @Get('pokemon-sets')
  async getPokemonSets() {
    return this.syncService.getPokemonSets();
  }

  @Get('riftbound-sets')
  async getRiftboundSets() {
    return this.syncService.getRiftboundSets();
  }

  @Get('onepiece-sets')
  async getOnePieceSets() {
    return this.syncService.getOnePieceSets();
  }

  @Get('lorcana-sets')
  async getLorcanaSets() {
    return this.syncService.getLorcanaSets();
  }

  @Get('gundam-sets')
  async getGundamSets() {
    return this.syncService.getGundamSets();
  }

  @Get('status/:game')
  async getStatus(@Param('game') game: string) {
    return this.syncService.getProgress(game);
  }

  //Invoke-RestMethod -Method POST -Uri "http://localhost:3001/sync/set" -ContentType "application/json" -Body '{"game": "Singles Magic The Gathering", "setId": "tla"}'
  @Post('set')
  async syncSet(
    @Body() body: { game: string; setId: string }
  ) {
    if (body.setId === 'ALL') {
      return this.syncService.syncAllSets(body.game);
    }
    return this.syncService.syncSet(body.game, body.setId);
  }

  @Get('dealer-prices/preview')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  async previewDealerPrices(
    @Req() req: any,
    @Query('category') category?: string,
    @Query('expansion') expansion?: string,
    @Query('expansions') expansions?: string,
    @Query('priceDate') priceDate?: string,
    @Query('benchmarkSource') benchmarkSource?: 'USA_MARKET' | 'LOCAL_MARKET',
  ) {
    const store = await this.prisma.store.findFirst({
      where: { ownerId: req.user.userId },
    });
    if (!store) {
      throw new BadRequestException("No se encontró una tienda para este usuario.");
    }
    return this.syncService.previewDealerPrices(store.id, {
      category,
      expansion,
      expansions,
      priceDate,
      priceBenchmarkSource: benchmarkSource,
    });
  }

  @Post('dealer-prices')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  async syncDealerPrices(
    @Req() req: any,
    @Body()
    body?: {
      category?: string;
      expansion?: string;
      expansions?: string[];
      targetScope?: 'ALL' | 'ONLY_ZERO_PRICE' | 'ONLY_IN_STOCK';
      applyDevaluations?: boolean;
      marginPercent?: number;
      autoPublish?: boolean;
      sourcePriceBasis?: 'GROSS' | 'NET';
      priceBenchmarkSource?: 'USA_MARKET' | 'LOCAL_MARKET';
      priceDate?: string;
    },
  ) {
    if (req.user.email === 'f.pinto.97@gmail.com') {
      throw new BadRequestException("El Superadmin no usa esta función. Solo las tiendas.");
    }
    const store = await this.prisma.store.findFirst({
      where: { ownerId: req.user.userId }
    });
    if (!store) {
      throw new BadRequestException("No se encontró una tienda para este usuario.");
    }
    return this.syncService.syncDealerPrices(store.id, body || {});
  }

  @Get('backups/:game')
  async getBackups(@Param('game') game: string) {
    const where = game !== 'all' ? { game } : {};
    const backups = await this.prisma.syncBackup.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: { id: true, filename: true, game: true, createdAt: true }
    });
    return backups;
  }

  @Get('backups/download/:id')
  async downloadBackup(@Param('id') id: string, @Res() res: Response) {
    const backup = await this.prisma.syncBackup.findUnique({ where: { id } });
    if (!backup) {
      throw new BadRequestException("El backup no existe.");
    }
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${backup.filename}"`);
    res.send(backup.csvData);
  }

  @Post('rollback')
  @UseInterceptors(FileInterceptor('file'))
  async rollbackPrices(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException("No se ha enviado ningún archivo CSV.");
    
    const content = file.buffer.toString('utf8');
    const lines = content.split('\n').filter(l => l.trim() !== '');
    
    if (lines.length < 2) throw new BadRequestException("El archivo CSV está vacío o es inválido.");
    
    // Formato: productId,finishId,price
    let restoredCount = 0;
    let deletedCount = 0;
    
    for (let i = 1; i < lines.length; i++) {
      const [productId, finishId] = lines[i].split(',');
      if (!productId || !finishId) continue;

      try {
        // 1. Buscar el MarketPrice actual
        const marketPrice = await this.prisma.marketPrice.findUnique({
          where: { productId_finishId: { productId, finishId } }
        });
        if (!marketPrice) continue;

        // 2. Buscar el último registro del historial (el más reciente)
        const latestHistory = await this.prisma.marketPriceHistory.findFirst({
          where: { marketPriceId: marketPrice.id },
          orderBy: { createdAt: 'desc' }
        });

        if (latestHistory) {
          // Borrar solo el último registro del historial
          await this.prisma.marketPriceHistory.delete({
            where: { id: latestHistory.id }
          });
        }

        // 3. Ver si queda un registro anterior en el historial
        const previousHistory = await this.prisma.marketPriceHistory.findFirst({
          where: { marketPriceId: marketPrice.id },
          orderBy: { createdAt: 'desc' }
        });

        if (previousHistory) {
          // Restaurar el precio al valor anterior
          await this.prisma.marketPrice.update({
            where: { id: marketPrice.id },
            data: { price: previousHistory.price }
          });
          restoredCount++;
        } else {
          // No queda historial, borrar el MarketPrice por completo
          await this.prisma.marketPrice.delete({
            where: { id: marketPrice.id }
          });
          deletedCount++;
        }
      } catch (e) {
        console.error("Error en rollback de precio:", e);
      }
    }
    
    return { 
      success: true, 
      message: `Rollback completado: ${restoredCount} precios restaurados al valor anterior, ${deletedCount} precios eliminados (sin historial previo).` 
    };
  }

  @Post('local-index/snapshot')
  @Roles(Role.SUPERADMIN)
  async triggerLocalIndexSnapshot() {
    const result = await this.localPriceIndexService.generateDailySnapshot();
    return {
      success: true,
      message: 'Snapshot diario del mercado local TapTrade completado con éxito.',
      ...result,
    };
  }

  // --- PROGRAMACIÓN AUTOMATIZADA DE PRECIOS POR EDICIÓN (SCHEDULER) ---

  @Get('schedules')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.GLOBAL_PRICE_SYNC)
  async getSchedules(@Query('game') game?: string) {
    return this.priceSchedulerService.getSchedulesList(game);
  }

  @Patch('schedules/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.GLOBAL_PRICE_SYNC)
  async updateSchedule(
    @Param('id') id: string,
    @Body() body: { frequency: string; isEnabled?: boolean }
  ) {
    return this.priceSchedulerService.updateExpansionSchedule(id, body.frequency, body.isEnabled);
  }

  @Post('schedules/batch')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.GLOBAL_PRICE_SYNC)
  async updateBatchSchedules(
    @Body() body: { expansionIds: string[]; frequency: string; isEnabled?: boolean }
  ) {
    return this.priceSchedulerService.updateBatchSchedules(body.expansionIds, body.frequency, body.isEnabled);
  }

  @Post('schedules/run-pending')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.GLOBAL_PRICE_SYNC)
  async runPendingSchedules() {
    return this.priceSchedulerService.checkAndRunPendingSyncs('MANUAL_SUPERADMIN');
  }
}
