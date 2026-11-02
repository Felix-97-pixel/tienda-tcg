import { Controller, Post, Get, Body, Param, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { WithdrawalsService } from './withdrawals.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('withdrawals')
export class WithdrawalsController {
  constructor(private readonly withdrawalsService: WithdrawalsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('request')
  async requestWithdrawal(
    @Req() req: any,
    @Body() body: { amount: number; bankDetails: string }
  ) {
    // Zero Trust: Bloquear a cajeros y encargados de local
    if (req.user.sessionType === 'CASHIER' || req.user.sessionType === 'BRANCH_MANAGER') {
      throw new ForbiddenException('No tienes permisos corporativos para solicitar retiros de fondos');
    }
    const userId = req.user.userId; 
    return this.withdrawalsService.requestWithdrawal(userId, body.amount, body.bankDetails);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('history')
  async getHistory(@Req() req: any) {
    // Zero Trust: Bloquear a cajeros y encargados de local
    if (req.user.sessionType === 'CASHIER' || req.user.sessionType === 'BRANCH_MANAGER') {
      throw new ForbiddenException('No tienes permisos corporativos para acceder a la billetera matriz');
    }
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
