import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createCouponDto: CreateCouponDto, @Request() req) {
    const storeId = await this.couponsService.getStoreIdByOwner(req.user.userId);
    return this.couponsService.create(createCouponDto, storeId);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Request() req) {
    const storeId = await this.couponsService.getStoreIdByOwner(req.user.userId);
    return this.couponsService.findAllByStore(storeId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    const storeId = await this.couponsService.getStoreIdByOwner(req.user.userId);
    return this.couponsService.findOne(id, storeId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateCouponDto: UpdateCouponDto, @Request() req) {
    const storeId = await this.couponsService.getStoreIdByOwner(req.user.userId);
    return this.couponsService.update(id, updateCouponDto, storeId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    const storeId = await this.couponsService.getStoreIdByOwner(req.user.userId);
    return this.couponsService.remove(id, storeId);
  }

  // Endpoint público para el carrito
  @Get('validate/:code')
  validateCode(@Param('code') code: string) {
    return this.couponsService.validatePublicCode(code);
  }

  // Valida el cupón contra los ítems del carrito y devuelve a cuáles aplica
  @Post('validate')
  validateForCart(@Body() body: { code: string; productIds?: string[]; inventoryItemIds?: string[] }) {
    return this.couponsService.validatePublicCode(body.code, body.productIds || [], body.inventoryItemIds || []);
  }
}
