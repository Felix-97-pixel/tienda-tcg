import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { UpdateStoreByOwnerDto } from './dto/update-store-by-owner.dto';
import { UpdateStoreFullDto } from './dto/update-store-full.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class StoresService {
  constructor(private prisma: PrismaService) { }

  async getPublicStores() {
    return this.prisma.store.findMany({
      select: {
        id: true,
        name: true,
        subdomain: true,
        logoUrl: true,
        address: true,
        latitude: true,
        longitude: true,
        pickupEnabled: true,
        pickupAddress: true,
        pickupSchedule: true,
        originRegion: { select: { id: true, name: true } },
        originCommune: { select: { id: true, name: true } },
        shipping: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            price: true,
            isActive: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async getPublicStoreBySubdomain(subdomain: string) {
    const store = await this.prisma.store.findUnique({
      where: { subdomain },
      select: {
        id: true,
        name: true,
        subdomain: true,
        logoUrl: true,
        address: true,
        latitude: true,
        longitude: true,
        pickupEnabled: true,
        pickupAddress: true,
        pickupSchedule: true,
        settings: true,
        gameExchangeRates: true,
        shipping: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            price: true,
            isActive: true,
          },
        },
      }
    });

    if (!store) {
      throw new NotFoundException(`Tienda con alias ${subdomain} no encontrada`);
    }

    return store;
  }

  async getPublicStoreById(id: string) {
    const store = await this.prisma.store.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        logoUrl: true,
        subdomain: true,
      },
    });

    if (!store) {
      throw new NotFoundException('Tienda no encontrada');
    }
    return store;
  }

  async getStoreByOwner(userId: string) {
    const store = await this.prisma.store.findUnique({
      where: { ownerId: userId },
      include: {
        settings: true,
        gameExchangeRates: true,
        devaluations: {
          include: { condition: true }
        },
        languageDevaluations: {
          include: { language: true }
        },
        subscriptionPlans: {
          include: { features: true }
        },
        customFeatures: true,
        supportedGames: true,
        originRegion: true,
        originCommune: {
          include: { zone: true },
        },
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
        subscriptionPlans: { include: { features: true } },
        customFeatures: true,
        gameExchangeRates: true,
      }
    });
  }

  async getStoreFeatures(storeId: string): Promise<string[]> {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
      include: {
        subscriptionPlans: { include: { features: true } },
        customFeatures: true,
        gameExchangeRates: true,
      }
    });

    if (!store) return [];

    const planFeatures = store.subscriptionPlans?.flatMap(p => p.features.map(f => f.key)) || [];
    const customFeats = store.customFeatures.map(f => f.key) || [];

    // Union unique
    return Array.from(new Set([...planFeatures, ...customFeats]));
  }

  async getStoreById(id: string) {
    const store = await this.prisma.store.findUnique({
      where: { id },
      include: {
        settings: true,
        gameExchangeRates: true,
        devaluations: {
          include: { condition: true }
        },
        languageDevaluations: {
          include: { language: true }
        },
        subscriptionPlans: { include: { features: true } },
        customFeatures: true,
      }
    });

    if (!store) {
      throw new NotFoundException('Tienda no encontrada');
    }

    return store;
  }

  async updateStoreByOwner(userId: string, data: UpdateStoreByOwnerDto) {
    const store = await this.prisma.store.findUnique({ where: { ownerId: userId } });
    if (!store) {
      throw new NotFoundException('No tienes una tienda asignada');
    }

    const {
      name, logoUrl, description, facebook, instagram, twitter, twitch, whatsapp, email, address, latitude, longitude, website,
      pickupEnabled, pickupAddress, pickupSchedule, originCommuneCode, originRegionCode, originCommuneId, originRegionId
    } = data;

    // Resolver llaves foráneas de ubicación
    let finalOriginCommuneId = originCommuneId;
    let finalOriginRegionId = originRegionId;
    let finalCommuneCode = originCommuneCode;
    let finalRegionCode = originRegionCode;

    if (finalOriginCommuneId) {
      const com = await this.prisma.commune.findUnique({
        where: { id: finalOriginCommuneId },
        include: { region: true },
      });
      if (com) {
        finalOriginRegionId = com.regionId;
        finalCommuneCode = com.code;
        finalRegionCode = com.region.code;
      }
    } else if (originCommuneCode) {
      const com = await this.prisma.commune.findUnique({
        where: { code: originCommuneCode.toUpperCase().trim() },
        include: { region: true },
      });
      if (com) {
        finalOriginCommuneId = com.id;
        finalOriginRegionId = com.regionId;
        finalCommuneCode = com.code;
        finalRegionCode = com.region.code;
      }
    }


    // Actualizar nombre, logo, ubicación y despacho de la tienda
    await this.prisma.store.update({
      where: { id: store.id },
      data: {
        name: name !== undefined ? name : undefined,
        logoUrl: logoUrl !== undefined ? logoUrl : undefined,
        address: address !== undefined ? address : undefined,
        latitude: latitude !== undefined ? latitude : undefined,
        longitude: longitude !== undefined ? longitude : undefined,
        pickupEnabled: pickupEnabled !== undefined ? pickupEnabled : undefined,
        pickupAddress: pickupAddress !== undefined ? pickupAddress : undefined,
        pickupSchedule: pickupSchedule !== undefined ? pickupSchedule : undefined,
        originCommuneId: finalOriginCommuneId !== undefined ? finalOriginCommuneId : undefined,
        originRegionId: finalOriginRegionId !== undefined ? finalOriginRegionId : undefined,
        supportedGames: data.supportedGames ? { set: data.supportedGames.map((id: string) => ({ id })) } : undefined,
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

  async upsertDevaluations(userId: string, gameId: string, devaluationsData: { conditionId: string, multiplier: number }[]) {
    const store = await this.prisma.store.findUnique({ where: { ownerId: userId } });
    if (!store) {
      throw new NotFoundException('No tienes una tienda asignada');
    }

    // Execute multiple upserts
    await this.prisma.$transaction(
      devaluationsData.map(dev =>
        this.prisma.storeConditionDevaluation.upsert({
          where: {
            storeId_conditionId_gameId: {
              storeId: store.id,
              conditionId: dev.conditionId,
              gameId: gameId,
            },
          },
          update: {
            multiplier: dev.multiplier,
          },
          create: {
            storeId: store.id,
            conditionId: dev.conditionId,
            gameId: gameId,
            multiplier: dev.multiplier,
          },
        })
      )
    );
    return this.getStoreByOwner(userId);
  }

  async upsertLanguageDevaluations(userId: string, gameId: string, languageDevaluationsData: { languageId: string, multiplier: number }[]) {
    const store = await this.prisma.store.findUnique({ where: { ownerId: userId } });
    if (!store) {
      throw new NotFoundException('No tienes una tienda asignada');
    }

    await this.prisma.$transaction(
      languageDevaluationsData.map(dev =>
        this.prisma.storeLanguageDevaluation.upsert({
          where: {
            storeId_languageId_gameId: {
              storeId: store.id,
              languageId: dev.languageId,
              gameId: gameId,
            },
          },
          update: {
            multiplier: dev.multiplier,
          },
          create: {
            storeId: store.id,
            languageId: dev.languageId,
            gameId: gameId,
            multiplier: dev.multiplier,
          },
        })
      )
    );

    return this.getStoreByOwner(userId);
  }

  async updateStoreById(storeId: string, data: UpdateStoreFullDto) {
    const store = await this.prisma.store.findUnique({ where: { id: storeId } });
    if (!store) {
      throw new NotFoundException('Tienda no encontrada');
    }

    const {
      name, logoUrl, description, facebook, instagram, twitter, twitch, whatsapp, email, address, latitude, longitude, website,
      subscriptionPlanIds, customFeatureIds,
      subscriptionDiscountType, subscriptionDiscountValue, subscriptionNotes
    } = data;

    const updateData: any = {
      name: name !== undefined ? name : undefined,
      logoUrl: logoUrl !== undefined ? logoUrl : undefined,
      address: address !== undefined ? address : undefined,
      latitude: latitude !== undefined ? latitude : undefined,
      longitude: longitude !== undefined ? longitude : undefined,
      subscriptionDiscountType: subscriptionDiscountType !== undefined ? subscriptionDiscountType : undefined,
      subscriptionDiscountValue: subscriptionDiscountValue !== undefined ? Number(subscriptionDiscountValue) : undefined,
      subscriptionNotes: subscriptionNotes !== undefined ? subscriptionNotes : undefined,
    };

    if (subscriptionPlanIds !== undefined && Array.isArray(subscriptionPlanIds)) {
      updateData.subscriptionPlans = {
        set: subscriptionPlanIds.map((id: string) => ({ id }))
      };
    }

    if (customFeatureIds !== undefined && Array.isArray(customFeatureIds)) {
      updateData.customFeatures = {
        set: customFeatureIds.map((id: string) => ({ id }))
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


  async getExchangeRates(userId: string) {
    const store = await this.getStoreByOwner(userId);
    return this.prisma.storeGameExchangeRate.findMany({ where: { storeId: store.id }, include: { game: true } });
  }

  async upsertExchangeRate(userId: string, data: { gameId: string, rate: number }) {
    const store = await this.getStoreByOwner(userId);
    return this.prisma.storeGameExchangeRate.upsert({
      where: { storeId_gameId: { storeId: store.id, gameId: data.gameId } },
      update: { rate: data.rate },
      create: { storeId: store.id, gameId: data.gameId, rate: data.rate },
      include: { game: true }
    });
  }

  async deleteExchangeRate(userId: string, id: string) {
    const store = await this.getStoreByOwner(userId);
    return this.prisma.storeGameExchangeRate.delete({ where: { id, storeId: store.id } });
  }


  /**
   * Obtiene la empresa a la que pertenece el usuario autenticado (dueño).
   */
  async getCompanyByOwner(userId: string) {
    let company = await this.prisma.company.findFirst({
      where: { ownerId: userId },
      include: {
        stores: {
          include: {
            originRegion: true,
            originCommune: true,
            supportedGames: true,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!company) {
      // Fallback: Si el usuario tiene una Store pero aún no se le creó la Company, la autogeneramos
      const store = await this.prisma.store.findUnique({ where: { ownerId: userId } });
      if (store) {
        company = await this.prisma.company.create({
          data: {
            name: store.name,
            ownerId: userId,
            balance: store.balance,
            extraBranchesCount: 0,
          },
          include: {
            stores: {
              include: {
                originRegion: true,
                originCommune: true,
                supportedGames: true,
              },
            },
          },
        });
        await this.prisma.store.update({
          where: { id: store.id },
          data: { companyId: company.id, isMainBranch: true },
        });
      } else {
        throw new NotFoundException('No tienes una empresa ni tienda asignada.');
      }
    }

    return company;
  }

  /**
   * Lista todas las sucursales asociadas a la empresa del usuario.
   */
  async getBranches(userId: string) {
    const company = await this.getCompanyByOwner(userId);
    return company.stores;
  }

  /**
   * Crea una nueva sucursal (Branch) para la empresa del usuario,
   * validando los permisos y cuotas del modelo de negocio.
   */
  async createBranch(userId: string, data: { name: string; subdomain: string; address?: string; originRegionId?: string; originCommuneId?: string; pickupSchedule?: string }) {
    const company = await this.getCompanyByOwner(userId);

    // Verificar si el subdominio ya existe
    const existingSubdomain = await this.prisma.store.findUnique({
      where: { subdomain: data.subdomain },
    });
    if (existingSubdomain) {
      throw new ConflictException('El subdominio ya está registrado por otra tienda o sucursal.');
    }

    // Regla de Negocio: La primera sucursal es la principal (isMainBranch: true).
    // Las sucursales subsiguientes son adicionales (isMainBranch: false).
    const isFirstBranch = company.stores.length === 0;

    return this.prisma.store.create({
      data: {
        name: data.name,
        subdomain: data.subdomain,
        address: data.address,
        originRegionId: data.originRegionId,
        originCommuneId: data.originCommuneId,
        pickupSchedule: data.pickupSchedule,
        pickupEnabled: !!data.address,
        isMainBranch: isFirstBranch,
        companyId: company.id,
        // Generamos un ownerId único sintético para la sucursal secundaria respetando el schema
        ownerId: isFirstBranch ? userId : require('crypto').randomUUID(),
      },
      include: {
        originRegion: true,
        originCommune: true,
      },
    });
  }

}
