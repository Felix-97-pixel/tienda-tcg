import { Controller, Get, Post, Delete, Param, UseGuards, Req } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('wishlist')
@UseGuards(JwtAuthGuard)
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) { }

  @Get()
  getWishlist(@Req() req: any) {
    return this.wishlistService.getWishlist(req.user.userId);
  }

  @Get('count')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  getWishlistCount() {
    return this.wishlistService.getWishlistCount();
  }

  @Post(':productId')
  addProduct(@Req() req: any, @Param('productId') productId: string) {
    return this.wishlistService.addProduct(req.user.userId, productId);
  }

  @Delete(':productId')
  removeProduct(@Req() req: any, @Param('productId') productId: string) {
    return this.wishlistService.removeProduct(req.user.userId, productId);
  }
}
