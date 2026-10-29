import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { PosService } from './pos.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { StoresService } from '../stores/stores.service';
import { CreatePosSaleDto } from './dto/create-pos-sale.dto';
import { OpenShiftDto, CloseShiftDto } from './dto/pos-shift.dto';
import { SyncOfflineSalesDto } from './dto/sync-offline-sales.dto';
import { PosBuyOperationDto } from './dto/pos-buy-operation.dto';
import { SkipThrottle } from '@nestjs/throttler';

@Controller('pos')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.SUPERADMIN)
export class PosController {
  constructor(
    private readonly posService: PosService,
    private readonly storesService: StoresService,
  ) {}

  private async getStore(req: any) {
    return this.storesService.getStoreByOwner(req.user.userId);
  }

  /**
   * GET /api/v1/pos/search?q=...
   * Búsqueda híbrida de productos sellados por código de barras o cartas sueltas por texto.
   */
  @Get('search')
  async search(@Request() req: any, @Query('q') q: string) {
    const store = await this.getStore(req);
    return this.posService.searchProducts(store.id, q);
  }

  /**
   * POST /api/v1/pos/sales
   * Registra y cobra una venta presencial con sincronización inmediata de inventario.
   */
  @Post('sales')
  async processSale(@Request() req: any, @Body() dto: CreatePosSaleDto) {
    const store = await this.getStore(req);
    const cashierName = req.user.name || req.user.email || 'Cajero';
    return this.posService.processSale(store.id, cashierName, dto);
  }

  /**
   * POST /api/v1/pos/buy
   * Registra una compra / trade-in a un cliente (abono a Store Credit o pago en efectivo).
   */
  @Post('buy')
  async processBuy(@Request() req: any, @Body() dto: PosBuyOperationDto) {
    const store = await this.getStore(req);
    const cashierName = req.user.name || req.user.email || 'Cajero';
    return this.posService.processBuyOperation(store.id, cashierName, dto);
  }

  /**
   * GET /api/v1/pos/cash-purchases
   * Lista el historial de compras de cartas pagadas en efectivo (CashPurchase).
   */
  @Get('cash-purchases')
  async getCashPurchases(@Request() req: any) {
    const store = await this.getStore(req);
    return this.posService.getCashPurchases(store.id);
  }

  /**
   * GET /api/v1/pos/transactions-ledger
   * Obtiene el libro mayor unificado de la tienda: ventas (online y POS),
   * compras de cartas (Efectivo y Crédito de Tienda) y turnos/cierres de caja.
   */
  @Get('transactions-ledger')
  async getTransactionsLedger(@Request() req: any) {
    const store = await this.getStore(req);
    return this.posService.getTransactionsLedger(store.id);
  }

  /**
   * GET /api/v1/pos/shift/current
   * Consulta el turno de caja abierto actualmente para la tienda.
   */
  @Get('shift/current')
  async getCurrentShift(@Request() req: any) {
    const store = await this.getStore(req);
    return this.posService.getCurrentShift(store.id);
  }

  /**
   * POST /api/v1/pos/shift/open
   * Abre un turno de caja con fondo inicial en efectivo.
   */
  @Post('shift/open')
  async openShift(@Request() req: any, @Body() dto: OpenShiftDto) {
    const store = await this.getStore(req);
    const cashierName = req.user.name || req.user.email || 'Cajero';
    return this.posService.openShift(store.id, cashierName, dto);
  }

  /**
   * GET /api/v1/pos/catalog-cache
   * Snapshot liviano del catálogo para IndexedDB en modo offline.
   */
  @Get('catalog-cache')
  async getCatalogCache(@Request() req: any) {
    const store = await this.getStore(req);
    return this.posService.getCatalogCache(store.id);
  }

  /**
   * POST /api/v1/pos/sales/sync-offline
   * Sincroniza un lote de ventas realizadas en modo offline.
   * SkipThrottle previene que la sincronización en ráfaga o reconexión sea bloqueada por 429.
   */
  @SkipThrottle()
  @Post('sales/sync-offline')
  async syncOfflineSales(@Request() req: any, @Body() dto: SyncOfflineSalesDto) {
    const store = await this.getStore(req);
    const cashierName = req.user.name || req.user.email || 'Cajero';
    return this.posService.syncOfflineSales(store.id, cashierName, dto);
  }

  /**
   * POST /api/v1/pos/shift/close
   * Cierra el turno de caja y calcula el arqueo de ventas.
   */
  @Post('shift/close')
  async closeShift(@Request() req: any, @Body() dto: CloseShiftDto) {
    const store = await this.getStore(req);
    return this.posService.closeShift(store.id, dto);
  }
}
