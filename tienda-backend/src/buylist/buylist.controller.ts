import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { BuylistService } from './buylist.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { StoresService } from '../stores/stores.service';

@Controller('buylist')
export class BuylistController {
  constructor(
    private readonly buylistService: BuylistService,
    private readonly storesService: StoresService,
  ) {}

  @Get('public/:subdomain')
  getPublicBuylist(@Param('subdomain') subdomain: string) {
    return this.buylistService.getPublicBuylist(subdomain);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMyBuylist(@Request() req: any) {
    const store = await this.storesService.getStoreByOwner(req.user.userId);
    return this.buylistService.getStoreBuylist(store.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me')
  async addBuylistItem(@Request() req: any, @Body() data: any) {
    const store = await this.storesService.getStoreByOwner(req.user.userId);
    return this.buylistService.addBuylistItem(store.id, data);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/:id')
  async updateBuylistItem(@Request() req: any, @Param('id') id: string, @Body() data: any) {
    const store = await this.storesService.getStoreByOwner(req.user.userId);
    return this.buylistService.updateBuylistItem(store.id, id, data);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('me/:id')
  async deleteBuylistItem(@Request() req: any, @Param('id') id: string) {
    const store = await this.storesService.getStoreByOwner(req.user.userId);
    return this.buylistService.deleteBuylistItem(store.id, id);
  }
}
