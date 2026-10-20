import { Controller, Get, Post, Patch, Param, Body, UseGuards, Req } from '@nestjs/common';
import { ShippingService } from './shipping.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { QuoteCartDto, UpdateStoreShippingDto } from './dto/quote-shipping.dto';

@Controller('shipping')
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  /**
   * GET /api/v1/shipping/locations
   * Catálogo oficial de las 16 Regiones y Comunas de Chile (Público)
   */
  @Get('locations')
  getLocations() {
    return this.shippingService.getLocations();
  }

  /**
   * POST /api/v1/shipping/quote-cart
   * Cotizador Dinámico Multi-Tienda (Público)
   * Cotiza Chilexpress, Starken y Retiro en Tienda según comuna y cubicaje TCG
   */
  @Post('quote-cart')
  async quoteCart(@Body() dto: QuoteCartDto) {
    return this.shippingService.quoteCartShipping(dto);
  }

  /**
   * GET /api/v1/shipping/store-settings/:storeId
   * Obtiene la configuración de retiro en local y comuna de despacho de la tienda
   */
  @Get('store-settings/:storeId')
  async getStoreShippingSettings(@Param('storeId') storeId: string) {
    return this.shippingService.getStoreShippingSettings(storeId);
  }

  /**
   * PATCH /api/v1/shipping/store-settings/:storeId
   * Configura retiro en tienda física, horarios y comuna de origen (ADMIN / VENDEDOR)
   */
  @Patch('store-settings/:storeId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  async updateStoreShippingSettings(
    @Param('storeId') storeId: string,
    @Body() dto: UpdateStoreShippingDto,
    @Req() req: any,
  ) {
    return this.shippingService.updateStoreShippingSettings(storeId, dto, req.user?.userId, req.user?.role);
  }

  /**
   * GET /api/v1/shipping/my-providers
   * Obtiene los proveedores de envío específicos de la tienda autenticada
   */
  @Get('my-providers')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  async getMyProviders(@Req() req: any) {
    return this.shippingService.getStoreProviders(req.user.userId);
  }

  /**
   * PATCH /api/v1/shipping/my-providers/:id
   * Actualiza precio de respaldo y estado de un proveedor exclusivamente para la tienda autenticada
   */
  @Patch('my-providers/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  async updateMyProvider(
    @Param('id') id: string,
    @Body() data: { price?: number; isActive?: boolean },
    @Req() req: any,
  ) {
    return this.shippingService.updateStoreProvider(req.user.userId, id, data);
  }

  /**
   * GET /api/v1/shipping/providers
   * Obtiene la lista de proveedores de envío activos y sus tarifas planas (Público)
   */
  @Get('providers')
  async getProviders() {
    return this.shippingService.getActiveProviders();
  }

  /**
   * GET /api/v1/shipping/providers/all
   * Obtiene todos los proveedores de envío (incluidos inactivos). Protegido para ADMIN.
   */
  @Get('providers/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  async getAllProviders(@Req() req: any) {
    if (req?.user?.userId) {
      return this.shippingService.getStoreProviders(req.user.userId);
    }
    return this.shippingService.getAllProviders();
  }

  /**
   * PATCH /api/v1/shipping/providers/:id
   * Actualiza precio y estado activo/inactivo de un proveedor para la tienda autenticada
   */
  @Patch('providers/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  async updateProvider(
    @Param('id') id: string,
    @Body() data: { price?: number; isActive?: boolean },
    @Req() req: any,
  ) {
    if (req?.user?.userId) {
      return this.shippingService.updateStoreProvider(req.user.userId, id, data);
    }
    return this.shippingService.updateProvider(id, data);
  }
}

