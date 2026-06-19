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

  async getWishlistCount(userId: string) {
    // Find store for the admin
    const store = await this.prisma.store.findUnique({
      where: { ownerId: userId }
    });

    const products = await this.prisma.product.findMany({
      where: {
        wishlistedBy: {
          some: {}
        }
      },
      include: {
        category: true,
        cardDetail: true,
        items: store ? {
          where: { storeId: store.id }
        } : false,
        buyListItems: store ? {
          where: { storeId: store.id }
        } : false,
        marketPrices: {
          take: 1,
          orderBy: { updatedAt: 'desc' }
        },
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
      const { _count, items, buyListItems, marketPrices, ...rest } = p as any;
      
      const totalStock = items ? items.reduce((acc: number, item: any) => acc + item.stock, 0) : 0;
      const inStock = totalStock > 0;
      const isOnBuylist = buyListItems ? buyListItems.length > 0 : false;
      const marketPrice = marketPrices && marketPrices.length > 0 ? Number(marketPrices[0].price) : 0;
      
      // Calculate store price based on first available stock item (assuming they price similarly or just taking first)
      const storePrice = inStock && items[0].price ? Number(items[0].price) : 0;

      return {
        ...rest,
        wishlistCount: _count.wishlistedBy,
        inStock,
        stockCount: totalStock,
        isOnBuylist,
        marketPrice,
        storePrice
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
