import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { BuylistService } from './buylist.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { StoresService } from '../stores/stores.service';
import { CreateBuylistItemDto } from './dto/create-buylist-item.dto';
import { UpdateBuylistItemDto } from './dto/update-buylist-item.dto';

@Controller('buylist')
export class BuylistController {
  constructor(
    private readonly buylistService: BuylistService,
    private readonly storesService: StoresService,
  ) {}

  @Get('public/all')
  getAllPublicBuylist(
    @Query('search') search?: string,
    @Query('game') game?: string,
    @Query('storeId') storeId?: string,
  ) {
    return this.buylistService.getAllPublicBuylist(search, game, storeId);
  }

  @Get('public/:subdomain')
  getPublicBuylist(@Param('subdomain') subdomain: string) {
    return this.buylistService.getPublicBuylist(subdomain);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @Get('me')
  async getMyBuylist(@Request() req: any) {
    const store = await this.storesService.getStoreByOwner(req.user.userId);
    return this.buylistService.getStoreBuylist(store.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @Post('me')
  async addBuylistItem(@Request() req: any, @Body() dto: CreateBuylistItemDto) {
    const store = await this.storesService.getStoreByOwner(req.user.userId);
    return this.buylistService.addBuylistItem(store.id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @Patch('me/:id')
  async updateBuylistItem(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateBuylistItemDto,
  ) {
    const store = await this.storesService.getStoreByOwner(req.user.userId);
    return this.buylistService.updateBuylistItem(store.id, id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @Delete('me/:id')
  async deleteBuylistItem(@Request() req: any, @Param('id') id: string) {
    const store = await this.storesService.getStoreByOwner(req.user.userId);
    return this.buylistService.deleteBuylistItem(store.id, id);
  }
}
