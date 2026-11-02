import { Controller, Post, Get, Body, Param, UseGuards, Req } from '@nestjs/common';
import { WithdrawalsService } from './withdrawals.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { Permission } from '../auth/constants/permissions.enum';

@Controller('withdrawals')
export class WithdrawalsController {
  constructor(private readonly withdrawalsService: WithdrawalsService) {}

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.WALLET_WITHDRAW)
  @Post('request')
  async requestWithdrawal(
    @Req() req: any,
    @Body() body: { amount: number; bankDetails: string },
  ) {
    return this.withdrawalsService.requestWithdrawal(req.user.userId, body.amount, body.bankDetails);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.WALLET_READ)
  @Get('history')
  async getHistory(@Req() req: any) {
    return this.withdrawalsService.getStoreHistory(req.user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN')
  @Get('pending')
  async getPending() {
    return this.withdrawalsService.getPendingWithdrawals();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN')
  @Post(':id/complete')
  async complete(@Param('id') id: string) {
    return this.withdrawalsService.completeWithdrawal(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN')
  @Post(':id/reject')
  async reject(@Param('id') id: string) {
    return this.withdrawalsService.rejectWithdrawal(id);
  }
}
