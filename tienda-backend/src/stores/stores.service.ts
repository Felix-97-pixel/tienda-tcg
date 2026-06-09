import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import * as bcrypt from 'bcrypt';

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

  async findAll() {
    return this.prisma.store.findMany({
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            name: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async create(createStoreDto: CreateStoreDto) {
    const { storeName, subdomain, logoUrl, ownerEmail, ownerName, ownerPassword } = createStoreDto as any;

    return this.prisma.$transaction(async (tx) => {
      // 1. Verificar si el usuario ya existe
      let user = await tx.user.findUnique({ where: { email: ownerEmail } });

      if (!user) {
        // Crear usuario con rol ADMIN
        const hashedPassword = await bcrypt.hash(ownerPassword, 10);
        user = await tx.user.create({
          data: {
            email: ownerEmail,
            password: hashedPassword,
            name: ownerName,
            role: 'ADMIN',
            isVerified: true, // Auto verificar porque lo crea superadmin
          }
        });
      } else {
        // Verificar si el usuario ya tiene tienda
        const existingStore = await tx.store.findUnique({ where: { ownerId: user.id } });
        if (existingStore) {
          throw new ConflictException('El usuario ya es dueño de otra tienda.');
        }
      }

      // 2. Crear la tienda
      try {
        const store = await tx.store.create({
          data: {
            name: storeName || createStoreDto.name, // Support both variable names
            subdomain,
            logoUrl,
            ownerId: user.id,
          },
          include: {
            owner: {
              select: { id: true, email: true, name: true }
            }
          }
        });
        return store;
      } catch (error: any) {
        if (error.code === 'P2002') {
          throw new ConflictException('El subdominio o el usuario ya están en uso.');
        }
        throw error;
      }
    });
  }

  async update(id: string, updateStoreDto: UpdateStoreDto) {
    // Check existence
    const store = await this.prisma.store.findUnique({ where: { id } });
    if (!store) throw new NotFoundException('Tienda no encontrada');

    try {
      const { name, subdomain, logoUrl, customDomain } = updateStoreDto;
      return await this.prisma.store.update({
        where: { id },
        data: { name, subdomain, logoUrl, customDomain },
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('El subdominio ya está en uso.');
      }
      throw error;
    }
  }

  async remove(id: string) {
    const store = await this.prisma.store.findUnique({ where: { id } });
    if (!store) throw new NotFoundException('Tienda no encontrada');

    // Aquí podríamos validar si la tienda tiene transacciones o productos
    // Por simplicidad, eliminaremos la tienda. Si hay dependencias, Prisma lanzará error P2003
    return this.prisma.store.delete({
      where: { id }
    });
  }
}
