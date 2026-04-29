import { Controller, Get, Post, Delete, Param, UseGuards, Req } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('wishlist')
@UseGuards(JwtAuthGuard)
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  getWishlist(@Req() req: any) {
    return this.wishlistService.getWishlist(req.user.userId);
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
