import { Controller, Post, Body, HttpCode, UseGuards, Get, Param } from '@nestjs/common';
import { PriceUpdaterService } from './price-updater.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('price-updater')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class PriceUpdaterController {
  constructor(private readonly priceUpdaterService: PriceUpdaterService) { }

  @Post('sync-set')
  @HttpCode(200)
  async syncSetPrices(@Body('expansion') expansion: string) {
    if (!expansion) {
      return { error: 'Debes enviar el nombre de la expansión en el cuerpo de la petición' };
    }

    const exists = await this.priceUpdaterService.checkExpansionExists(expansion);
    if (!exists) {
      return { error: `La expansión '${expansion}' no existe en tu base de datos.` };
    }

    this.priceUpdaterService.updateSetPrices(expansion);

    return {
      message: `La actualización de precios para la expansión '${expansion}' ha comenzado en segundo plano.`,
      source: 'MTGJSON (100% libre de scraping)'
    };
  }

  @Post('sync-pokemon')
  @HttpCode(200)
  async syncPokemonPrices(@Body('expansion') expansion: string) {
    if (!expansion) {
      return { error: 'Debes enviar el nombre de la expansión en el cuerpo de la petición' };
    }

    const exists = await this.priceUpdaterService.checkExpansionExists(expansion);
    if (!exists) {
      return { error: `La expansión '${expansion}' no existe en tu base de datos.` };
    }

    this.priceUpdaterService.updatePokemonSetPrices(expansion);

    return {
      message: `La actualización de precios para la expansión '${expansion}' ha comenzado en segundo plano.`,
      source: 'TCGPlayer (PokemonTCG.io API)'
    };
  }

  @Post('sync-riftbound')
  @HttpCode(200)
  async syncRiftboundPrices(@Body('expansion') expansion: string) {
    if (!expansion) {
      return { error: 'Debes enviar el nombre de la expansión en el cuerpo de la petición' };
    }

    const exists = await this.priceUpdaterService.checkExpansionExists(expansion);
    if (!exists) {
      return { error: `La expansión '${expansion}' no existe en tu base de datos.` };
    }

    this.priceUpdaterService.updateRiftboundSetPrices(expansion);

    return {
      message: `La actualización de precios para la expansión '${expansion}' ha comenzado en segundo plano.`,
      source: 'JustTCG API (Datos Premium NM/Foil)'
    };
  }

  @Get('status/:game')
  async getStatus(@Param('game') game: string) {
    return this.priceUpdaterService.getProgress(game);
  }
}
