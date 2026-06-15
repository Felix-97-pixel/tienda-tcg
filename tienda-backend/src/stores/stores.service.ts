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
        settings: true,
        supportedGames: true,
      }
    });

    if (!store) {
      throw new NotFoundException(`Tienda con alias ${subdomain} no encontrada`);
    }

    return store;
  }

  async getStoreByOwner(userId: string) {
    const store = await this.prisma.store.findUnique({
      where: { ownerId: userId },
      include: {
        settings: true,
        supportedGames: true,
        subscriptionPlan: {
          include: { features: true }
        },
        customFeatures: true,
      }
    });

    if (!store) {
      throw new NotFoundException('No tienes una tienda asignada');
    }

    return store;
  }

  async findByUserId(userId: string) {
    return this.prisma.store.findUnique({
      where: { ownerId: userId },
      include: {
        subscriptionPlan: { include: { features: true } },
        customFeatures: true,
      }
    });
  }

  async getStoreFeatures(storeId: string): Promise<string[]> {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
      include: {
        subscriptionPlan: { include: { features: true } },
        customFeatures: true,
      }
    });

    if (!store) return [];

    const planFeatures = store.subscriptionPlan?.features.map(f => f.key) || [];
    const customFeats = store.customFeatures.map(f => f.key) || [];
    
    // Union unique
    return Array.from(new Set([...planFeatures, ...customFeats]));
  }

  async getStoreById(id: string) {
    const store = await this.prisma.store.findUnique({
      where: { id },
      include: {
        settings: true,
        supportedGames: true,
        subscriptionPlan: { include: { features: true } },
        customFeatures: true,
      }
    });

    if (!store) {
      throw new NotFoundException('Tienda no encontrada');
    }

    return store;
  }

  async updateStoreByOwner(userId: string, data: any) {
    const store = await this.prisma.store.findUnique({ where: { ownerId: userId } });
    if (!store) {
      throw new NotFoundException('No tienes una tienda asignada');
    }

    const { name, logoUrl, description, facebook, instagram, twitter, twitch, whatsapp, email, address, website } = data;

    // Actualizar nombre y logo de la tienda
    await this.prisma.store.update({
      where: { id: store.id },
      data: {
        name: name !== undefined ? name : undefined,
        logoUrl: logoUrl !== undefined ? logoUrl : undefined,
      }
    });

    // Keys de settings
    const settingsKeys = {
      description,
      facebook,
      instagram,
      twitter,
      twitch,
      whatsapp,
      email,
      address,
      website
    };

    // Upsert para cada setting que fue enviado (no undefined)
    for (const [key, value] of Object.entries(settingsKeys)) {
      if (value !== undefined) {
        await this.prisma.storeSetting.upsert({
          where: {
            key_storeId: {
              key,
              storeId: store.id
            }
          },
          update: { value: value as string },
          create: {
            key,
            value: value as string,
            storeId: store.id
          }
        });
      }
    }

    // Retornar tienda actualizada
    return this.getStoreByOwner(userId);
  }

  async updateStoreById(storeId: string, data: any) {
    const store = await this.prisma.store.findUnique({ where: { id: storeId } });
    if (!store) {
      throw new NotFoundException('Tienda no encontrada');
    }

    const { name, logoUrl, description, facebook, instagram, twitter, twitch, whatsapp, email, address, website, games } = data;

    const updateData: any = {
      name: name !== undefined ? name : undefined,
      logoUrl: logoUrl !== undefined ? logoUrl : undefined,
    };

    if (games !== undefined && Array.isArray(games)) {
      updateData.supportedGames = {
        set: games.map((id: string) => ({ id }))
      };
    }

    await this.prisma.store.update({
      where: { id: store.id },
      data: updateData
    });

    // Keys de settings
    const settingsKeys = {
      description,
      facebook,
      instagram,
      twitter,
      twitch,
      whatsapp,
      email,
      address,
      website
    };

    // Upsert para cada setting que fue enviado (no undefined)
    for (const [key, value] of Object.entries(settingsKeys)) {
      if (value !== undefined) {
        await this.prisma.storeSetting.upsert({
          where: {
            key_storeId: {
              key,
              storeId: store.id
            }
          },
          update: { value: value as string },
          create: {
            key,
            value: value as string,
            storeId: store.id
          }
        });
      }
    }

    return this.getStoreById(store.id);
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
            supportedGames: createStoreDto.games?.length ? { connect: createStoreDto.games.map((id: string) => ({ id })) } : undefined,
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
