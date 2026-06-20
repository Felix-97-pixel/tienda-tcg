import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { StoreCreditService } from './store-credit.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { StoresService } from '../stores/stores.service';
import { AdjustCreditDto } from './dto/adjust-credit.dto';

interface AuthenticatedRequest extends Request {
  user: { userId: string };
}

@Controller('store-credit')
export class StoreCreditController {
  constructor(
    private readonly storeCreditService: StoreCreditService,
    private readonly storesService: StoresService,
  ) {}

  /**
   * Helper to avoid repeating `getStoreByOwner` in every handler.
   */
  private async getStoreId(req: AuthenticatedRequest): Promise<string> {
    const store = await this.storesService.getStoreByOwner(req.user.userId);
    return store.id;
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getStoreCredits(@Request() req: AuthenticatedRequest) {
    const storeId = await this.getStoreId(req);
    return this.storeCreditService.getStoreCredits(storeId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/:userId')
  async getUserStoreCredit(
    @Request() req: AuthenticatedRequest,
    @Param('userId') userId: string,
  ) {
    const storeId = await this.getStoreId(req);
    return this.storeCreditService.getUserStoreCredit(storeId, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/:userId/transactions')
  async getTransactions(
    @Request() req: AuthenticatedRequest,
    @Param('userId') userId: string,
  ) {
    const storeId = await this.getStoreId(req);
    return this.storeCreditService.getTransactions(storeId, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('adjust')
  async adjustCredit(
    @Request() req: AuthenticatedRequest,
    @Body() dto: AdjustCreditDto,
  ) {
    const storeId = await this.getStoreId(req);
    return this.storeCreditService.adjustCredit(storeId, dto);
  }
}
