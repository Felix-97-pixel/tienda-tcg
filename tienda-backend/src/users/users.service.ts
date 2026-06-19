import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, User } from '@prisma/client';
import { UpdateProfileDto } from './dto/update-profile.dto';

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
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        address: true,
        city: true,
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
}
