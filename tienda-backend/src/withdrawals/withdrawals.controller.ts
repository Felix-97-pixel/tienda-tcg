import {
  Controller,
  Post,
  Patch,
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
import {
  WithdrawalsService,
  RequestSettlementPayload,
} from './withdrawals.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { Permission } from '../auth/constants/permissions.enum';

@Controller('withdrawals')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class WithdrawalsController {
  constructor(private readonly withdrawalsService: WithdrawalsService) {}

  @RequirePermissions(Permission.WALLET_WITHDRAW)
  @Post('request')
  async requestWithdrawal(
    @Req() req: any,
    @Body() body: RequestSettlementPayload,
  ) {
    return this.withdrawalsService.requestWithdrawal(req.user.userId, body);
  }

  @RequirePermissions(Permission.WALLET_WITHDRAW)
  @Patch(':id/store-dte')
  async attachStoreSettlementDte(
    @Req() req: any,
    @Param('id') id: string,
    @Body()
    body: {
      storeDteType?: number;
      storeDteFolio?: string;
      storeDteUrl?: string;
      notes?: string;
    },
  ) {
    return this.withdrawalsService.attachStoreSettlementDte(
      req.user.userId,
      id,
      body,
    );
  }

  @RequirePermissions(Permission.ORDERS_DISPATCH)
  @Patch('vendor-orders/:vendorOrderId/buyer-dte')
  async updateVendorOrderBuyerDte(
    @Req() req: any,
    @Param('vendorOrderId') vendorOrderId: string,
    @Body()
    body: {
      buyerDteType: number;
      buyerDteFolio: string;
      buyerDteUrl?: string;
    },
  ) {
    return this.withdrawalsService.updateVendorOrderBuyerDte(
      req.user.userId,
      vendorOrderId,
      body,
    );
  }

  @RequirePermissions(Permission.WALLET_READ)
  @Get('history')
  async getHistory(@Req() req: any) {
    return this.withdrawalsService.getStoreHistory(req.user.userId);
  }

  /**
   * Resumen tributario macro del mes para la Tienda / Formulario 29 SII.
   */
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
    const { csvContent, filename } =
      await this.withdrawalsService.generateStoreTaxSalesCsv(req.user.userId, {
        period,
        startDate,
        endDate,
        storeId,
      });

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(HttpStatus.OK).send(csvContent);
  }

  @RequirePermissions(Permission.ACCOUNTING_READ)
  @Get('pending')
  async getPending(@Query('status') status?: string) {
    return this.withdrawalsService.getPendingWithdrawals(status);
  }

  @RequirePermissions(Permission.ACCOUNTING_READ)
  @Post(':id/approve')
  async approve(
    @Req() req: any,
    @Param('id') id: string,
    @Body()
    body?: {
      platformDteType?: number;
      platformDteFolio?: string;
      platformDteUrl?: string;
      notes?: string;
    },
  ) {
    return this.withdrawalsService.approveWithdrawal(
      id,
      req.user?.userId,
      body,
    );
  }

  @RequirePermissions(Permission.ACCOUNTING_READ)
  @Post(':id/complete')
  async complete(
    @Req() req: any,
    @Param('id') id: string,
    @Body()
    body?: {
      transferReference?: string;
      transferReceiptUrl?: string;
      platformDteType?: number;
      platformDteFolio?: string;
      platformDteUrl?: string;
      notes?: string;
    },
  ) {
    return this.withdrawalsService.completeWithdrawal(
      id,
      req.user?.userId,
      body,
    );
  }

  @RequirePermissions(Permission.ACCOUNTING_READ)
  @Post(':id/reject')
  async reject(
    @Req() req: any,
    @Param('id') id: string,
    @Body()
    body?: {
      reason?: string;
      isFailedTransfer?: boolean;
    },
  ) {
    return this.withdrawalsService.rejectWithdrawal(
      id,
      req.user?.userId,
      body,
    );
  }
}
