import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CouponsService {
  constructor(private readonly prisma: PrismaService) {}

  async getStoreIdByOwner(userId: string): Promise<string> {
    const store = await this.prisma.store.findUnique({
      where: { ownerId: userId },
      select: { id: true },
    });
    if (!store) throw new NotFoundException('No se encontró una tienda asociada a este usuario');
    return store.id;
  }

  private async ensureCodeAvailable(code: string, excludeId?: string) {
    const existing = await this.prisma.coupon.findFirst({
      where: {
        code: { equals: code, mode: 'insensitive' },
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: { id: true },
    });
    if (existing) {
      throw new BadRequestException(`El código "${code}" ya está en uso. Elige otro código.`);
    }
  }

  async create(createCouponDto: CreateCouponDto, storeId: string) {
    const { categoryIds, gameIds, ...couponData } = createCouponDto;

    couponData.code = couponData.code.trim().toUpperCase();

    // Los códigos son únicos en toda la plataforma: así al aplicarlo se sabe a qué tienda pertenece
    await this.ensureCodeAvailable(couponData.code);

    return this.prisma.coupon.create({
      data: {
        ...couponData,
        storeId,
        validFrom: new Date(couponData.validFrom),
        validUntil: new Date(couponData.validUntil),
        categories: categoryIds && categoryIds.length > 0 ? {
          connect: categoryIds.map((id) => ({ id })),
        } : undefined,
        games: gameIds && gameIds.length > 0 ? {
          connect: gameIds.map((id) => ({ id })),
        } : undefined,
      },
      include: {
        categories: true,
        games: true,
      },
    });
  }

  async findAllByStore(storeId: string) {
    return this.prisma.coupon.findMany({
      where: { storeId },
      include: {
        categories: true,
        games: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, storeId: string) {
    const coupon = await this.prisma.coupon.findFirst({
      where: { id, storeId },
      include: {
        categories: true,
        games: true,
      },
    });

    if (!coupon) {
      throw new NotFoundException(`Coupon with ID ${id} not found`);
    }

    return coupon;
  }

  async update(id: string, updateCouponDto: UpdateCouponDto, storeId: string) {
    await this.findOne(id, storeId); // Ensure it exists and belongs to the store

    const { categoryIds, gameIds, ...couponData } = updateCouponDto;

    if (couponData.code) {
      couponData.code = couponData.code.trim().toUpperCase();
      await this.ensureCodeAvailable(couponData.code, id);
    }

    return this.prisma.coupon.update({
      where: { id },
      data: {
        ...couponData,
        validFrom: couponData.validFrom ? new Date(couponData.validFrom) : undefined,
        validUntil: couponData.validUntil ? new Date(couponData.validUntil) : undefined,
        categories: categoryIds ? {
          set: categoryIds.map((id) => ({ id })),
        } : undefined,
        games: gameIds ? {
          set: gameIds.map((id) => ({ id })),
        } : undefined,
      },
      include: {
        categories: true,
        games: true,
      },
    });
  }

  async remove(id: string, storeId: string) {
    await this.findOne(id, storeId); // Ensure it exists and belongs to the store
    return this.prisma.coupon.delete({
      where: { id },
    });
  }

  async validatePublicCode(code: string, productIds: string[] = [], inventoryItemIds: string[] = []) {
    const coupon = await this.prisma.coupon.findFirst({
      where: {
        code: {
          equals: code,
          mode: 'insensitive', // Permitir minúsculas/mayúsculas
        },
        isActive: true,
        validFrom: { lte: new Date() },
        validUntil: { gte: new Date() },
      },
      include: {
        categories: true,
        games: true,
      },
    });

    if (!coupon) {
      throw new BadRequestException('El código de cupón no existe o ha expirado');
    }

    // Calcular a qué ítems del carrito aplica (solo ítems de la tienda dueña del cupón)
    let applicableInventoryItemIds: string[] = [];
    if (inventoryItemIds.length > 0 || productIds.length > 0) {
      const items = await this.prisma.inventoryItem.findMany({
        where: {
          storeId: coupon.storeId,
          OR: [
            { id: { in: inventoryItemIds } },
            { productId: { in: productIds } },
          ],
        },
        select: {
          id: true,
          product: { select: { categoryId: true, cardDetail: { select: { gameId: true } } } },
        },
      });

      const categoryIds = new Set(coupon.categories.map((c) => c.id));
      const gameIds = new Set(coupon.games.map((g) => g.id));

      applicableInventoryItemIds = items
        .filter((it) => {
          if (coupon.scope === 'STORE_WIDE') return true;
          if (coupon.scope === 'CATEGORY_SPECIFIC') return categoryIds.has(it.product.categoryId);
          if (coupon.scope === 'GAME_SPECIFIC') {
            const g = it.product.cardDetail?.gameId;
            return !!g && gameIds.has(g);
          }
          return false;
        })
        .map((it) => it.id);
    }

    return { ...coupon, applicableInventoryItemIds };
  }
}
