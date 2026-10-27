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
   * GET /api/v1/pos/shift/current
   * Consulta el estado del turno de caja activo para la tienda.
   */
  @Get('shift/current')
  async getCurrentShift(@Request() req: any) {
    const store = await this.getStore(req);
    return this.posService.getCurrentShift(store.id);
  }

  /**
   * POST /api/v1/pos/shift/open
   * Abre un turno de caja con fondo inicial para vuelto.
   */
  @Post('shift/open')
  async openShift(@Request() req: any, @Body() dto: OpenShiftDto) {
    const store = await this.getStore(req);
    const cashierName = dto.cashierName || req.user.name || 'Cajero';
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
   */
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
