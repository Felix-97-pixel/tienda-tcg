import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards } from '@nestjs/common';
import { CurrenciesService } from './currencies.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('currencies')
export class CurrenciesController {
  constructor(private readonly currenciesService: CurrenciesService) {}

  @Get()
  findAll() {
    return this.currenciesService.findAll();
  }

  @Get('default')
  findDefault() {
    return this.currenciesService.findDefault();
  }

  // ── Divisas soportadas (mantenedor SuperAdmin) ──
  @Get('supported')
  findAllSupported() {
    return this.currenciesService.findAllSupported();
  }

  @Post('supported')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
  createSupported(@Body() data: { code: string; name: string; symbol: string }) {
    return this.currenciesService.createSupported(data);
  }

  @Patch('supported/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
  updateSupported(@Param('id') id: string, @Body() data: { code?: string; name?: string; symbol?: string }) {
    return this.currenciesService.updateSupported(id, data);
  }

  @Delete('supported/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
  removeSupported(@Param('id') id: string) {
    return this.currenciesService.removeSupported(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
  create(@Body() data: { gameId: string; currencyCode: string; rate: number }) {
    return this.currenciesService.create(data);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
  update(@Param('id') id: string, @Body() data: { currencyCode?: string; rate?: number }) {
    return this.currenciesService.update(id, data);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
  remove(@Param('id') id: string) {
    return this.currenciesService.remove(id);
  }
}
