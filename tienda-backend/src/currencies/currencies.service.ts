import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CurrenciesService {
  constructor(private prisma: PrismaService) {}

  // ─────────────── Divisas soportadas (mantenedor) ───────────────

  async findAllSupported() {
    return this.prisma.currency.findMany({ orderBy: { code: 'asc' } });
  }

  async createSupported(data: { code: string; name: string; symbol: string }) {
    const code = data.code?.trim().toUpperCase();
    if (!code || !data.name?.trim()) throw new BadRequestException('Código y nombre son obligatorios');
    const exists = await this.prisma.currency.findUnique({ where: { code } });
    if (exists) throw new BadRequestException(`La divisa ${code} ya existe`);
    return this.prisma.currency.create({
      data: { code, name: data.name.trim(), symbol: data.symbol?.trim() || '$', exchangeRate: 1 },
    });
  }

  async updateSupported(id: string, data: { code?: string; name?: string; symbol?: string }) {
    const current = await this.prisma.currency.findUnique({ where: { id } });
    if (!current) throw new NotFoundException('Divisa no encontrada');
    return this.prisma.currency.update({
      where: { id },
      data: {
        code: data.code ? data.code.trim().toUpperCase() : undefined,
        name: data.name?.trim(),
        symbol: data.symbol?.trim(),
      },
    });
  }

  async removeSupported(id: string) {
    const current = await this.prisma.currency.findUnique({ where: { id } });
    if (!current) throw new NotFoundException('Divisa no encontrada');
    const used = await this.prisma.globalGameExchangeRate.count({ where: { currencyCode: current.code } });
    if (used > 0) {
      throw new BadRequestException(`No se puede eliminar: ${current.code} está asociada a ${used} tasa(s) global(es)`);
    }
    return this.prisma.currency.delete({ where: { id } });
  }

  // ─────────────── Tasas globales por juego ───────────────

  async findAll() {
    return this.prisma.globalGameExchangeRate.findMany({
      include: { game: true, currency: true },
    });
  }

  async findDefault() {
    // No hay una única divisa por defecto: depende del juego.
    return this.findAll();
  }

  async create(data: { gameId: string; currencyCode: string; rate: number }) {
    const currency = await this.prisma.currency.findUnique({ where: { code: data.currencyCode } });
    if (!currency) throw new BadRequestException('La divisa seleccionada no existe');
    return this.prisma.globalGameExchangeRate.upsert({
      where: { gameId_currencyCode: { gameId: data.gameId, currencyCode: data.currencyCode } },
      update: { rate: data.rate },
      create: { gameId: data.gameId, currencyCode: data.currencyCode, rate: data.rate },
      include: { game: true, currency: true },
    });
  }

  async update(id: string, data: { currencyCode?: string; rate?: number }) {
    return this.prisma.globalGameExchangeRate.update({
      where: { id },
      data: { currencyCode: data.currencyCode, rate: data.rate },
      include: { game: true, currency: true },
    });
  }

  async remove(id: string) {
    return this.prisma.globalGameExchangeRate.delete({ where: { id } });
  }
}
