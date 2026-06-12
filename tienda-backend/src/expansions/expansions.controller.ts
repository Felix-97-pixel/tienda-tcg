import { Controller, Get, Patch, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ExpansionsService } from './expansions.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('expansions')
export class ExpansionsController {
  constructor(private readonly expansionsService: ExpansionsService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN')
  async getExpansions(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('game') game?: string,
    @Query('search') search?: string
  ) {
    return this.expansionsService.getExpansions(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 50,
      game,
      search
    );
  }

  @Get('remote-sets')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN')
  async getRemoteSets(@Query('game') game: string) {
    if (!game) throw new Error("Game parameter is required");
    return this.expansionsService.getRemoteSets(game);
  }

  @Post('auto-map')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN')
  async autoMapExpansions(@Body() data: { game: string }) {
    if (!data.game) throw new Error("Game parameter is required");
    return this.expansionsService.autoMapGameExpansions(data.game);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN')
  async updateExpansion(
    @Param('id') id: string,
    @Body() data: { externalId?: string; name?: string }
  ) {
    return this.expansionsService.updateExpansion(id, data);
  }
}
