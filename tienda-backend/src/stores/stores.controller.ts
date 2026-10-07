import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { StoresService } from './stores.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Get('public/:subdomain')
  getPublicStore(@Param('subdomain') subdomain: string) {
    return this.storesService.getPublicStoreBySubdomain(subdomain);
  }

  @Get('public-by-id/:id')
  getPublicStoreById(@Param('id') id: string) {
    return this.storesService.getPublicStoreById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getStoreByOwner(@Request() req: any) {
    const store = await this.storesService.getStoreByOwner(req.user.userId);
    const features = await this.storesService.getStoreFeatures(store.id);
    return { ...store, activeFeatures: features };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/exchange-rates')
  async getExchangeRates(@Request() req: any) {
    return this.storesService.getExchangeRates(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/exchange-rates')
  async upsertExchangeRate(@Request() req: any, @Body() data: { gameId: string, rate: number }) {
    return this.storesService.upsertExchangeRate(req.user.userId, data);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('me/exchange-rates/:id')
  async deleteExchangeRate(@Request() req: any, @Param('id') id: string) {
    return this.storesService.deleteExchangeRate(req.user.userId, id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  updateStoreByOwner(@Request() req: any, @Body() data: any) {
    return this.storesService.updateStoreByOwner(req.user.userId, data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN')
  @Get()
  findAll() {
    return this.storesService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN')
  @Get(':id/full')
  async getStoreFull(@Param('id') id: string) {
    const store = await this.storesService.getStoreById(id);
    const features = await this.storesService.getStoreFeatures(store.id);
    return { ...store, activeFeatures: features };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN')
  @Patch(':id/full')
  updateStoreFull(@Param('id') id: string, @Body() data: any) {
    return this.storesService.updateStoreById(id, data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN')
  @Post()
  create(@Body() createStoreDto: CreateStoreDto) {
    return this.storesService.create(createStoreDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStoreDto: UpdateStoreDto) {
    return this.storesService.update(id, updateStoreDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.storesService.remove(id);
  }
}
