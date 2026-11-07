import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Res,
  Req,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { AccountingService, AccountingSummaryFilter } from './accounting.service';
import { FinancialLedgerService } from './financial-ledger.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { Permission } from '../auth/constants/permissions.enum';

@Controller('accounting')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AccountingController {
  constructor(
    private readonly accountingService: AccountingService,
    private readonly financialLedger: FinancialLedgerService,
  ) {}

  /**
   * Resumen contable consolidado para el Superadministrador / Contador.
   * Separa ingresos propios de TapTrade (comisión neta + IVA Débito F29) de fondos de terceros (custodia/tiendas).
   */
  @Get('summary')
  @RequirePermissions(Permission.ACCOUNTING_READ)
  async getSummary(@Query() query: AccountingSummaryFilter) {
    return this.accountingService.getAccountingSummary(query);
  }

  /**
   * Exporta las transacciones en formato CSV compatible con Microsoft Excel (BOM UTF-8, delimitado por punto y coma).
   */
  @Get('export')
  @RequirePermissions(Permission.ACCOUNTING_READ)
  async exportCsv(@Query() query: AccountingSummaryFilter, @Res() res: Response) {
    const csvContent = await this.accountingService.generateAccountingCsv(query);
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `reporte_contable_taptrade_${dateStr}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(HttpStatus.OK).send(csvContent);
  }

  /**
   * Registra un reembolso o contracargo compensatorio en el libro mayor inmutable (Superadmin).
   */
  @Post('ledger/refund')
  @RequirePermissions(Permission.ACCOUNTING_READ)
  async recordOrderRefund(
    @Req() req: any,
    @Body()
    body: {
      vendorOrderId: string;
      kind?: 'REFUND' | 'CHARGEBACK';
      reason: string;
    },
  ) {
    return this.financialLedger.recordOrderRefundOrChargeback({
      vendorOrderId: body.vendorOrderId,
      kind: body.kind || 'REFUND',
      reason: body.reason || 'Reembolso autorizado por administración',
      createdByUserId: req.user?.userId || 'SUPERADMIN',
    });
  }

  /**
   * Registra un ajuste manual autorizado (positivo o negativo) en el libro mayor inmutable (Superadmin).
   */
  @Post('ledger/adjustment')
  @RequirePermissions(Permission.ACCOUNTING_READ)
  async recordManualAdjustment(
    @Req() req: any,
    @Body()
    body: {
      storeId: string;
      amount: number;
      reason: string;
      bucket?: 'AVAILABLE' | 'ESCROW';
    },
  ) {
    return this.financialLedger.recordManualAdjustment({
      storeId: body.storeId,
      amount: Number(body.amount),
      reason: body.reason || 'Ajuste manual autorizado',
      bucket: body.bucket || 'AVAILABLE',
      createdByUserId: req.user?.userId || 'SUPERADMIN',
    });
  }
}

