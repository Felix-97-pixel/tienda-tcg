import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StoresService {
  constructor(private prisma: PrismaService) {}

  async getPublicStoreBySubdomain(subdomain: string) {
    const store = await this.prisma.store.findUnique({
      where: { subdomain },
      select: {
        id: true,
        name: true,
        subdomain: true,
        logoUrl: true,
      }
    });

    if (!store) {
      throw new NotFoundException(`Tienda con alias ${subdomain} no encontrada`);
    }

    return store;
  }
}
