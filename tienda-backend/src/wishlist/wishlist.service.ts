import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WishlistService {
  constructor(private prisma: PrismaService) { }

  async getWishlist(userId: string) {
    const items = await this.prisma.wishlistItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            category: true,
            cardDetail: true,
            items: true,
          }
        }
      }
    });
    return items.map(item => item.product);
  }

  async getWishlistCount() {
    const products = await this.prisma.product.findMany({
      where: {
        wishlistedBy: {
          some: {}
        }
      },
      include: {
        category: true,
        cardDetail: true,
        items: true,
        _count: {
          select: { wishlistedBy: true }
        }
      },
      orderBy: {
        wishlistedBy: {
          _count: 'desc'
        }
      }
    });

    return products.map(p => {
      const { _count, ...rest } = p;
      return {
        ...rest,
        wishlistCount: _count.wishlistedBy
      };
    });
  }


  async addProduct(userId: string, productId: string) {
    try {
      const exists = await this.prisma.wishlistItem.findUnique({
        where: {
          userId_productId: {
            userId,
            productId
          }
        }
      });
      if (exists) return { success: true, message: 'Already in wishlist' };

      await this.prisma.wishlistItem.create({
        data: {
          userId,
          productId
        }
      });

      return { success: true, message: 'Added to wishlist' };
    } catch (error) {
      console.error("Error in addProduct:", error);
      return { success: false, message: 'Internal Server Error when adding to wishlist', error: error.message };
    }
  }

  async removeProduct(userId: string, productId: string) {
    try {
      await this.prisma.wishlistItem.delete({
        where: {
          userId_productId: {
            userId,
            productId
          }
        }
      });
    } catch (e) {
      // Ignorar si no existe
    }
    return { success: true, message: 'Removed from wishlist' };
  }
}
