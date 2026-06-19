import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { StoreCreditService } from './store-credit.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { StoresService } from '../stores/stores.service';

@Controller('store-credit')
export class StoreCreditController {
  constructor(
    private readonly storeCreditService: StoreCreditService,
    private readonly storesService: StoresService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getStoreCredits(@Request() req: any) {
    const store = await this.storesService.getStoreByOwner(req.user.userId);
    return this.storeCreditService.getStoreCredits(store.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/:userId')
  async getUserStoreCredit(@Request() req: any, @Param('userId') userId: string) {
    const store = await this.storesService.getStoreByOwner(req.user.userId);
    return this.storeCreditService.getUserStoreCredit(store.id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/:userId/transactions')
  async getTransactions(@Request() req: any, @Param('userId') userId: string) {
    const store = await this.storesService.getStoreByOwner(req.user.userId);
    return this.storeCreditService.getTransactions(store.id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('adjust')
  async adjustCredit(@Request() req: any, @Body() data: { userId: string; amount: number; type: string; reference?: string; itemsData?: any }) {
    const store = await this.storesService.getStoreByOwner(req.user.userId);
    return this.storeCreditService.adjustCredit(store.id, data.userId, data.amount, data.type, data.reference, data.itemsData);
  }
}
