import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, User } from '@prisma/client';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOne(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        address: true,
        city: true,
        lat: true,
        lng: true,
        regionCode: true,
        cityCode: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({ data });
  }

  async findByVerificationToken(token: string): Promise<User | null> {
    return this.prisma.user.findFirst({ where: { verificationToken: token } });
  }

  async verifyUser(id: string): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: {
        isVerified: true,
        verificationToken: null,
      },
    });
  }

  async updatePassword(id: string, hashedPassword: string): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: {
        password: hashedPassword,
      },
    });
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { googleId } });
  }

  async linkGoogleAccount(id: string, googleId: string, avatar?: string): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: {
        googleId,
        avatar: avatar || undefined,
        isVerified: true,
      },
    });
  }



  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        name: dto.name,
        phone: dto.phone,
        address: dto.address,
        city: dto.city,
        lat: dto.lat,
        lng: dto.lng,
        regionCode: dto.regionCode,
        cityCode: dto.cityCode,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        address: true,
        city: true,
        lat: true,
        lng: true,
        regionCode: true,
        cityCode: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async searchUsers(query: string) {
    return this.prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: query, mode: 'insensitive' } },
          { name: { contains: query, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
      take: 10,
    });
  }

  async getUserOrders(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        vendorOrders: {
          include: { items: true, store: true },
        },
        payment: {
          select: { status: true, authCode: true, cardLast4: true },
        },
      },
    });
  }

  async getUserAddresses(userId: string) {
    return this.prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async createAddress(userId: string, dto: CreateAddressDto) {
    const existingCount = await this.prisma.address.count({ where: { userId } });
    const shouldBeDefault = dto.isDefault ?? existingCount === 0;

    return this.prisma.$transaction(async (tx) => {
      if (shouldBeDefault) {
        await tx.address.updateMany({
          where: { userId },
          data: { isDefault: false },
        });
      }

      const newAddress = await tx.address.create({
        data: {
          userId,
          alias: dto.alias || (shouldBeDefault ? 'Predeterminada' : 'Dirección secundaria'),
          name: dto.name,
          phone: dto.phone,
          address: dto.address,
          city: dto.city,
          cityCode: dto.cityCode,
          regionCode: dto.regionCode,
          isDefault: shouldBeDefault,
        },
      });

      if (shouldBeDefault) {
        await tx.user.update({
          where: { id: userId },
          data: {
            address: dto.address,
            city: dto.city,
            cityCode: dto.cityCode,
            regionCode: dto.regionCode,
            phone: dto.phone,
            name: dto.name,
          },
        });
      }

      return newAddress;
    });
  }

  async updateAddress(userId: string, addressId: string, dto: UpdateAddressDto) {
    const address = await this.prisma.address.findFirst({
      where: { id: addressId, userId },
    });
    if (!address) throw new NotFoundException('Dirección no encontrada');

    const shouldBeDefault = dto.isDefault ?? address.isDefault;

    return this.prisma.$transaction(async (tx) => {
      if (shouldBeDefault) {
        await tx.address.updateMany({
          where: { userId, id: { not: addressId } },
          data: { isDefault: false },
        });
      }

      const updated = await tx.address.update({
        where: { id: addressId },
        data: {
          alias: dto.alias ?? address.alias,
          name: dto.name ?? address.name,
          phone: dto.phone ?? address.phone,
          address: dto.address ?? address.address,
          city: dto.city ?? address.city,
          cityCode: dto.cityCode ?? address.cityCode,
          regionCode: dto.regionCode ?? address.regionCode,
          isDefault: shouldBeDefault,
        },
      });

      if (shouldBeDefault) {
        await tx.user.update({
          where: { id: userId },
          data: {
            address: updated.address,
            city: updated.city,
            cityCode: updated.cityCode,
            regionCode: updated.regionCode,
            phone: updated.phone,
            name: updated.name,
          },
        });
      }

      return updated;
    });
  }

  async setDefaultAddress(userId: string, addressId: string) {
    const address = await this.prisma.address.findFirst({
      where: { id: addressId, userId },
    });
    if (!address) throw new NotFoundException('Dirección no encontrada');

    return this.prisma.$transaction(async (tx) => {
      await tx.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });

      const updated = await tx.address.update({
        where: { id: addressId },
        data: { isDefault: true },
      });

      await tx.user.update({
        where: { id: userId },
        data: {
          address: updated.address,
          city: updated.city,
          cityCode: updated.cityCode,
          regionCode: updated.regionCode,
          phone: updated.phone,
          name: updated.name,
        },
      });

      return updated;
    });
  }

  async deleteAddress(userId: string, addressId: string) {
    const address = await this.prisma.address.findFirst({
      where: { id: addressId, userId },
    });
    if (!address) throw new NotFoundException('Dirección no encontrada');

    return this.prisma.$transaction(async (tx) => {
      await tx.address.delete({ where: { id: addressId } });

      if (address.isDefault) {
        const nextAddress = await tx.address.findFirst({
          where: { userId },
          orderBy: { createdAt: 'desc' },
        });

        if (nextAddress) {
          await tx.address.update({
            where: { id: nextAddress.id },
            data: { isDefault: true },
          });

          await tx.user.update({
            where: { id: userId },
            data: {
              address: nextAddress.address,
              city: nextAddress.city,
              cityCode: nextAddress.cityCode,
              regionCode: nextAddress.regionCode,
              phone: nextAddress.phone,
              name: nextAddress.name,
            },
          });
        } else {
          await tx.user.update({
            where: { id: userId },
            data: {
              address: null,
              city: null,
              cityCode: null,
              regionCode: null,
            },
          });
        }
      }

      return { success: true, message: 'Dirección eliminada correctamente' };
    });
  }

  async getUserStoreCredits(userId: string) {
    return this.prisma.storeCredit.findMany({
      where: { userId },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            subdomain: true,
            logoUrl: true,
          },
        },
      },
      orderBy: { balance: 'desc' },
    });
  }

  async getUserCreditTransactions(userId: string) {
    return this.prisma.storeCreditTransaction.findMany({
      where: { userId },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            subdomain: true,
            logoUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }
}


