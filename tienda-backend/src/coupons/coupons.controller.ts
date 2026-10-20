import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { Throttle } from '@nestjs/throttler';

@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @Post()
  async create(@Body() createCouponDto: CreateCouponDto, @Request() req) {
    const storeId = await this.couponsService.getStoreIdByOwner(req.user.userId);
    return this.couponsService.create(createCouponDto, storeId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @Get()
  async findAll(@Request() req) {
    const storeId = await this.couponsService.getStoreIdByOwner(req.user.userId);
    return this.couponsService.findAllByStore(storeId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    const storeId = await this.couponsService.getStoreIdByOwner(req.user.userId);
    return this.couponsService.findOne(id, storeId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateCouponDto: UpdateCouponDto, @Request() req) {
    const storeId = await this.couponsService.getStoreIdByOwner(req.user.userId);
    return this.couponsService.update(id, updateCouponDto, storeId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    const storeId = await this.couponsService.getStoreIdByOwner(req.user.userId);
    return this.couponsService.remove(id, storeId);
  }

  // Endpoint público para el carrito (protegido contra fuerza bruta)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Get('validate/:code')
  validateCode(@Param('code') code: string) {
    return this.couponsService.validatePublicCode(code);
  }

  // Valida el cupón contra los ítems del carrito y devuelve a cuáles aplica
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('validate')
  validateForCart(@Body() body: { code: string; productIds?: string[]; inventoryItemIds?: string[] }) {
    return this.couponsService.validatePublicCode(body.code, body.productIds || [], body.inventoryItemIds || []);
  }
}
