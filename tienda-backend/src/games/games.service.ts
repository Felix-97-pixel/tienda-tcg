import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class GamesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.game.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            expansions: true,
            cardDetails: true,
            stores: true
          }
        }
      }
    });
  }

  async findOne(id: string) {
    const game = await this.prisma.game.findUnique({ where: { id } });
    if (!game) throw new NotFoundException('Juego no encontrado');
    return game;
  }

  async create(data: { name: string; logoUrl?: string; isActive?: boolean }) {
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    const existing = await this.prisma.game.findFirst({ where: { OR: [{ name: data.name }, { slug }] } });
    if (existing) {
      throw new ConflictException('Ya existe un juego con ese nombre o slug');
    }

    return this.prisma.game.create({
      data: {
        name: data.name,
        slug,
        logoUrl: data.logoUrl,
        isActive: data.isActive !== undefined ? data.isActive : true
      }
    });
  }

  async update(id: string, data: { name?: string; logoUrl?: string; isActive?: boolean }) {
    await this.findOne(id); // verifica existencia
    
    const updateData: Prisma.GameUpdateInput = { ...data };
    
    if (data.name) {
      updateData.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    try {
      return await this.prisma.game.update({
        where: { id },
        data: updateData
      });
    } catch (e: any) {
      if (e.code === 'P2002') {
        throw new ConflictException('El nombre o slug ya está en uso por otro juego');
      }
      throw e;
    }
  }

  async remove(id: string) {
    const game = await this.prisma.game.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            expansions: true,
            cardDetails: true
          }
        }
      }
    });

    if (!game) throw new NotFoundException('Juego no encontrado');

    if (game._count.expansions > 0 || game._count.cardDetails > 0) {
      throw new ConflictException(`No se puede eliminar el juego porque tiene ${game._count.expansions} expansiones y ${game._count.cardDetails} cartas asociadas.`);
    }

    return this.prisma.game.delete({ where: { id } });
  }
}
