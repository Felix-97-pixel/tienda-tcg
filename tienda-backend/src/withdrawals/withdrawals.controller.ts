import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Req,
  Res,
  Query,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
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

  /**
   * Resumen tributario macro del mes para la Tienda / Formulario 29 SII (Opción A).
   */
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.WALLET_READ)
  @Get('tax-summary')
  async getTaxSummary(
    @Req() req: any,
    @Query('period') period?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('storeId') storeId?: string,
  ) {
    return this.withdrawalsService.getStoreTaxSummary(req.user.userId, {
      period,
      startDate,
      endDate,
      storeId,
    });
  }

  /**
   * Descarga del Libro de Ventas en formato CSV (BOM UTF-8) para el contador de la tienda.
   */
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.WALLET_READ)
  @Get('tax-sales-csv')
  async exportTaxSalesCsv(
    @Req() req: any,
    @Res() res: Response,
    @Query('period') period?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('storeId') storeId?: string,
  ) {
    const { csvContent, filename } = await this.withdrawalsService.generateStoreTaxSalesCsv(
      req.user.userId,
      { period, startDate, endDate, storeId },
    );

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(HttpStatus.OK).send(csvContent);
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
