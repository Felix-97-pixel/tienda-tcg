import { Controller, Post, Body, UseGuards, Get, Param, Req, BadRequestException, UseInterceptors, UploadedFile, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { SyncService } from './sync.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

@Controller('sync')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class SyncController {
  constructor(
    private readonly syncService: SyncService,
    private readonly prisma: PrismaService
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

  @Post('dealer-prices')
  async syncDealerPrices(@Req() req: any) {
    if (req.user.email === 'f.pinto.97@gmail.com') {
      throw new BadRequestException("El Superadmin no usa esta función. Solo las tiendas.");
    }
    const store = await this.prisma.store.findUnique({
      where: { ownerId: req.user.userId }
    });
    if (!store) {
      throw new BadRequestException("No se encontró una tienda para este usuario.");
    }
    return this.syncService.syncDealerPrices(store.id);
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
    
    // Asumimos formato: productId,finishId,price
    let deletedCount = 0;
    
    for (let i = 1; i < lines.length; i++) {
      const [productId, finishId] = lines[i].split(',');
      if (productId && finishId) {
        try {
          await this.prisma.marketPrice.deleteMany({
            where: { productId, finishId }
          });
          deletedCount++;
        } catch (e) {
          console.error("Error deleting rollback price:", e);
        }
      }
    }
    
    return { success: true, message: `Se revirtieron ${deletedCount} precios de manera exitosa.` };
  }
}
