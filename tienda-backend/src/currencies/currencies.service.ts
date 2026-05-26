import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CurrenciesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.currency.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findDefault() {
    return this.prisma.currency.findFirst({
      where: { isDefault: true },
    });
  }

  async create(data: { code: string; name: string; symbol: string; exchangeRate: number; isDefault: boolean }) {
    if (data.isDefault) {
      await this.prisma.currency.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.currency.create({
      data,
    });
  }

  async update(id: string, data: { code?: string; name?: string; symbol?: string; exchangeRate?: number; isDefault?: boolean }) {
    if (data.isDefault) {
      await this.prisma.currency.updateMany({
        where: { isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });
    }

    return this.prisma.currency.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    const currency = await this.prisma.currency.findUnique({ where: { id } });
    if (!currency) throw new NotFoundException('Currency not found');
    
    if (currency.isDefault) {
      throw new BadRequestException('Cannot delete default currency. Set another currency as default first.');
    }

    return this.prisma.currency.delete({
      where: { id },
    });
  }
}
