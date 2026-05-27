import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ShippingService } from './shipping.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('shipping')
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

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
  @Roles(Role.ADMIN)
  async getAllProviders() {
    return this.shippingService.getAllProviders();
  }

  /**
   * PATCH /api/v1/shipping/providers/:id
   * Actualiza precio y estado activo/inactivo de un proveedor. Protegido para ADMIN.
   */
  @Patch('providers/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async updateProvider(
    @Param('id') id: string,
    @Body() data: { price?: number; isActive?: boolean }
  ) {
    return this.shippingService.updateProvider(id, data);
  }
}
