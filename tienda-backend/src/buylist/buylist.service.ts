import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBuylistItemDto } from './dto/create-buylist-item.dto';
import { UpdateBuylistItemDto } from './dto/update-buylist-item.dto';

@Injectable()
export class BuylistService {
  constructor(private prisma: PrismaService) {}

  async getStoreBuylist(storeId: string) {
    return this.prisma.buyListItem.findMany({
      where: { storeId },
      include: {
        product: true,
        condition: true,
        language: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPublicBuylist(subdomain: string) {
    const store = await this.prisma.store.findUnique({
      where: { subdomain },
    });
    if (!store) throw new NotFoundException('Store not found');

    return this.prisma.buyListItem.findMany({
      where: { storeId: store.id, isActive: true },
      include: {
        product: {
          include: {
            cardDetail: true,
            category: true,
          },
        },
        condition: true,
        language: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllPublicBuylist(search?: string, game?: string, storeId?: string) {
    const where: any = {
      isActive: true,
    };

    if (storeId) {
      where.storeId = storeId;
    }

    if (search && search.trim()) {
      where.product = {
        name: { contains: search.trim(), mode: 'insensitive' },
      };
    }

    if (game && game.trim()) {
      where.product = {
        ...(where.product || {}),
        category: {
          name: { contains: game.trim(), mode: 'insensitive' },
        },
      };
    }

    return this.prisma.buyListItem.findMany({
      where,
      include: {
        product: {
          include: {
            cardDetail: true,
            category: true,
          },
        },
        condition: true,
        language: true,
        store: {
          select: {
            id: true,
            name: true,
            subdomain: true,
            logoUrl: true,
            settings: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async addBuylistItem(storeId: string, data: CreateBuylistItemDto) {
    // Check if it already exists
    const existing = await this.prisma.buyListItem.findFirst({
      where: {
        storeId,
        productId: data.productId,
        conditionId: data.conditionId,
        languageId: data.languageId,
      },
    });

    if (existing) {
      throw new ConflictException('Item already exists in buylist');
    }

    return this.prisma.buyListItem.create({
      data: {
        storeId,
        productId: data.productId,
        conditionId: data.conditionId,
        languageId: data.languageId,
        quantityWanted: data.quantityWanted,
        cashPrice: data.cashPrice,
        creditPrice: data.creditPrice,
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
      include: {
        product: true,
        condition: true,
        language: true,
      },
    });
  }

  async updateBuylistItem(storeId: string, id: string, data: UpdateBuylistItemDto) {
    const item = await this.prisma.buyListItem.findUnique({ where: { id } });
    if (!item || item.storeId !== storeId) {
      throw new NotFoundException('Item not found');
    }

    return this.prisma.buyListItem.update({
      where: { id },
      data: {
        quantityWanted: data.quantityWanted,
        cashPrice: data.cashPrice,
        creditPrice: data.creditPrice,
        isActive: data.isActive,
      },
    });
  }

  async deleteBuylistItem(storeId: string, id: string) {
    const item = await this.prisma.buyListItem.findUnique({ where: { id } });
    if (!item || item.storeId !== storeId) {
      throw new NotFoundException('Item not found');
    }

    return this.prisma.buyListItem.delete({
      where: { id },
    });
  }
}
