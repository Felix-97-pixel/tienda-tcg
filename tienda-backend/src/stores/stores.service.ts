import { Injectable, NotFoundException, ConflictException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { UpdateStoreByOwnerDto } from './dto/update-store-by-owner.dto';
import { UpdateStoreFullDto } from './dto/update-store-full.dto';
import { ManageCompanyUserDto } from './dto/manage-company-user.dto';
import { ManageStoreUserDto } from './dto/manage-store-user.dto';
import { UpdateUserCredentialsDto } from './dto/update-user-credentials.dto';
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

  async getStoreByOwner(userId: string, requestedStoreId?: string) {
    let whereCondition: any = {
      OR: [
        { ownerId: userId },
        { members: { some: { userId } } },
        { company: { ownerId: userId } },
        { company: { members: { some: { userId } } } },
      ],
    };

    if (requestedStoreId) {
      whereCondition = {
        id: requestedStoreId,
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } },
          { company: { ownerId: userId } },
          { company: { members: { some: { userId } } } },
        ],
      };
    }

    const store = await this.prisma.store.findFirst({
      where: whereCondition,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            rut: true,
            legalName: true,
            taxActivity: true,
          },
        },
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
      },
      orderBy: { isMainBranch: 'desc' },
    });

    if (!store) {
      throw new NotFoundException('No tienes una tienda asignada');
    }

    return store;
  }

  async findByUserId(userId: string) {
    return this.prisma.store.findFirst({
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

        // Modelo Value-Metric por SKUs: Todos los módulos base (addons) están incluidos para todas las tiendas
    const ALL_ADDONS = [
      'addon:buylist',
      'addon:reports',
      'addon:store_credit',
      'addon:radar',
      'addon:estadisticas',
    ];

    // Union unique
    return Array.from(new Set([...ALL_ADDONS, ...planFeatures, ...customFeats]));
  }

  async getStoreById(id: string) {
    const store = await this.prisma.store.findUnique({
      where: { id },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            rut: true,
            legalName: true,
            taxActivity: true,
          },
        },
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

  async updateStoreByOwner(userId: string, data: UpdateStoreByOwnerDto, targetStoreId?: string) {
    let whereCondition: any = {
      OR: [
        { ownerId: userId },
        { members: { some: { userId } } },
        { company: { ownerId: userId } },
        { company: { members: { some: { userId, role: { in: ['OWNER', 'ADMIN'] } } } } },
      ],
    };

    if (targetStoreId) {
      whereCondition = {
        id: targetStoreId,
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } },
          { company: { ownerId: userId } },
          { company: { members: { some: { userId, role: { in: ['OWNER', 'ADMIN'] } } } } },
        ],
      };
    }

    const store = await this.prisma.store.findFirst({ where: whereCondition });
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

  async upsertDevaluations(userId: string, gameId: string, devaluationsData: { conditionId: string, multiplier: number }[], requestedStoreId?: string) {
    const store = await this.getStoreByOwner(userId, requestedStoreId);
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

  async upsertLanguageDevaluations(userId: string, gameId: string, languageDevaluationsData: { languageId: string, multiplier: number }[], requestedStoreId?: string) {
    const store = await this.getStoreByOwner(userId, requestedStoreId);
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
      name, subdomain, logoUrl, description, facebook, instagram, twitter, twitch, whatsapp, email, address, latitude, longitude, website,
      rut, legalName, taxActivity,
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

    if (subdomain && subdomain !== store.subdomain) {
      const cleanSub = subdomain.toLowerCase().replace(/[^a-z0-9_-]/g, '');
      const existing = await this.prisma.store.findUnique({ where: { subdomain: cleanSub } });
      if (existing && existing.id !== storeId) {
        throw new ConflictException('El subdominio ya está registrado por otra tienda o sucursal.');
      }
      updateData.subdomain = cleanSub;
    }

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

    if ((rut !== undefined || legalName !== undefined || taxActivity !== undefined) && store.companyId) {
      await this.prisma.company.update({
        where: { id: store.companyId },
        data: {
          ...(rut !== undefined ? { rut: rut.trim() || null } : {}),
          ...(legalName !== undefined ? { legalName: legalName.trim() || null } : {}),
          ...(taxActivity !== undefined ? { taxActivity: taxActivity.trim() || null } : {}),
        },
      });
    }

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


  /**
   * Obtiene todas las empresas registradas para el panel SuperAdmin,
   * incluyendo sus sucursales (stores) y el usuario dueño.
   */
  async findAllCompanies() {
    return this.prisma.company.findMany({
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        plan: true,
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        stores: {
          include: {
            originRegion: true,
            originCommune: true,
            subscriptionPlans: true,
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
              orderBy: { createdAt: 'asc' },
            },
          },
          orderBy: { isMainBranch: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
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
    const {
      storeName,
      subdomain,
      logoUrl,
      ownerEmail,
      ownerName,
      ownerPassword,
      companyName,
      companyRut,
      companyLogoUrl,
    } = createStoreDto as any;

    const cleanSubdomain = (subdomain || '').toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (!cleanSubdomain) {
      throw new BadRequestException('El subdominio es requerido y solo puede contener letras, números, guiones y guiones bajos.');
    }

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
        const existingStore = await tx.store.findFirst({ where: { ownerId: user.id } });
        if (existingStore) {
          throw new ConflictException('El usuario ya es dueño de otra tienda.');
        }
      }

      // 2. Asegurar o crear la entidad Company (Holding)
      let company = await tx.company.findFirst({ where: { ownerId: user.id } });
      if (!company) {
        company = await tx.company.create({
          data: {
            name: companyName || storeName || createStoreDto.name,
            rut: companyRut || null,
            logoUrl: companyLogoUrl || null,
            ownerId: user.id,
            balance: 0,
            extraBranchesCount: 0,
          },
        });
      }

      // Asegurar membresía de empresa como OWNER
      await tx.companyMember.upsert({
        where: { companyId_userId: { companyId: company.id, userId: user.id } },
        update: {},
        create: {
          companyId: company.id,
          userId: user.id,
          role: 'OWNER',
        },
      });

      // 3. Crear la tienda (Casa matriz inicial)
      try {
        const store = await tx.store.create({
          data: {
            name: storeName || createStoreDto.name, // Support both variable names
            subdomain: cleanSubdomain,
            logoUrl: logoUrl || companyLogoUrl || null,
            ownerId: user.id,
            companyId: company.id,
            isMainBranch: true,
          },
          include: {
            owner: {
              select: { id: true, email: true, name: true }
            }
          }
        });

        // Asegurar membresía de sucursal como BRANCH_MANAGER
        await tx.storeMember.upsert({
          where: { storeId_userId: { storeId: store.id, userId: user.id } },
          update: {},
          create: {
            storeId: store.id,
            userId: user.id,
            role: 'BRANCH_MANAGER',
          },
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


  async getExchangeRates(userId: string, requestedStoreId?: string) {
    const store = await this.getStoreByOwner(userId, requestedStoreId);
    return this.prisma.storeGameExchangeRate.findMany({ where: { storeId: store.id }, include: { game: true } });
  }

  async upsertExchangeRate(userId: string, data: { gameId: string, rate: number }, requestedStoreId?: string) {
    const store = await this.getStoreByOwner(userId, requestedStoreId);
    return this.prisma.storeGameExchangeRate.upsert({
      where: { storeId_gameId: { storeId: store.id, gameId: data.gameId } },
      update: { rate: data.rate },
      create: { storeId: store.id, gameId: data.gameId, rate: data.rate },
      include: { game: true }
    });
  }

  async deleteExchangeRate(userId: string, id: string, requestedStoreId?: string) {
    const store = await this.getStoreByOwner(userId, requestedStoreId);
    return this.prisma.storeGameExchangeRate.delete({ where: { id, storeId: store.id } });
  }


  /**
   * Obtiene la empresa a la que pertenece el usuario autenticado (dueño o miembro).
   */
  async getCompanyByOwner(userId: string) {
    let company = await this.prisma.company.findFirst({
      where: {
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } },
          { stores: { some: { members: { some: { userId } } } } },
        ],
      },
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
      const store = await this.prisma.store.findFirst({
        where: {
          OR: [
            { ownerId: userId },
            { members: { some: { userId } } },
          ],
        },
      });
      if (store) {
        company = await this.prisma.company.create({
          data: {
            name: store.name,
            ownerId: store.ownerId,
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
        await this.prisma.companyMember.upsert({
          where: { companyId_userId: { companyId: company.id, userId: store.ownerId } },
          update: {},
          create: { companyId: company.id, userId: store.ownerId, role: 'OWNER' },
        });
      } else {
        throw new NotFoundException('No tienes una empresa ni tienda asignada.');
      }
    }

    return company;
  }

  /**
   * Actualiza el plan SaaS asignado a una Empresa (Holding).
   */
  async updateCompanyPlan(companyId: string, planId: string | null) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      include: { stores: true },
    });
    if (!company) {
      throw new NotFoundException('Empresa no encontrada');
    }

    const updated = await this.prisma.company.update({
      where: { id: companyId },
      data: { planId },
      include: {
        plan: true,
        stores: true,
      },
    });

    if (updated.stores && updated.stores.length > 0) {
      for (const st of updated.stores) {
        await this.prisma.store.update({
          where: { id: st.id },
          data: {
            subscriptionPlans: planId ? { set: [{ id: planId }] } : { set: [] },
          },
        });
      }
    }

    return updated;
  }

  /**
   * Crea una nueva sucursal (Branch) directamente bajo una empresa (SuperAdmin).
   */
  async createBranchForCompany(companyId: string, data: { name: string; subdomain: string; logoUrl?: string; address?: string; originRegionId?: string; originCommuneId?: string; pickupSchedule?: string }) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      include: { stores: true },
    });
    if (!company) {
      throw new NotFoundException('Empresa no encontrada');
    }

    const cleanSubdomain = data.subdomain.toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (!cleanSubdomain) {
      throw new BadRequestException('El subdominio es inválido.');
    }

    const existingSubdomain = await this.prisma.store.findUnique({
      where: { subdomain: cleanSubdomain },
    });
    if (existingSubdomain) {
      throw new ConflictException('El subdominio ya está registrado por otra tienda o sucursal.');
    }

    const isFirstBranch = company.stores.length === 0;

    const newBranch = await this.prisma.store.create({
      data: {
        name: data.name,
        subdomain: cleanSubdomain,
        logoUrl: data.logoUrl || company.logoUrl || null,
        address: data.address,
        originRegionId: data.originRegionId,
        originCommuneId: data.originCommuneId,
        pickupSchedule: data.pickupSchedule,
        pickupEnabled: !!data.address,
        isMainBranch: isFirstBranch,
        companyId: company.id,
        ownerId: company.ownerId,
      },
      include: {
        originRegion: true,
        originCommune: true,
      },
    });

    // Vincular al dueño en StoreMember
    await this.prisma.storeMember.upsert({
      where: { storeId_userId: { storeId: newBranch.id, userId: company.ownerId } },
      update: {},
      create: {
        storeId: newBranch.id,
        userId: company.ownerId,
        role: 'BRANCH_MANAGER',
      },
    });

    if (!isFirstBranch) {
      await this.prisma.company.update({
        where: { id: company.id },
        data: { extraBranchesCount: { increment: 1 } },
      });
    }

    return newBranch;
  }

  /**
   * Lista las sucursales asociadas a la empresa del usuario.
   * Si el usuario es dueño o admin corporativo, ve todas las sucursales.
   * Si es personal/cajero asignado, solo ve las sucursales donde es miembro.
   */
  async getBranches(userId: string) {
    const company = await this.getCompanyByOwner(userId);
    const isCompanyLevel = company.ownerId === userId || await this.prisma.companyMember.findFirst({
      where: { companyId: company.id, userId, role: { in: ['OWNER', 'ADMIN'] } },
    });

    if (isCompanyLevel) {
      return company.stores;
    }

    const storeMemberships = await this.prisma.storeMember.findMany({
      where: { userId },
      select: { storeId: true },
    });
    const allowedStoreIds = storeMemberships.map((sm) => sm.storeId);
    return company.stores.filter((s) => allowedStoreIds.includes(s.id));
  }

  /**
   * Crea una nueva sucursal (Branch) para la empresa del usuario,
   * validando los permisos y cuotas del modelo de negocio.
   */
  async createBranch(userId: string, data: { name: string; subdomain: string; logoUrl?: string; address?: string; originRegionId?: string; originCommuneId?: string; pickupSchedule?: string }) {
    const company = await this.getCompanyByOwner(userId);

    const cleanSubdomain = data.subdomain.toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (!cleanSubdomain) {
      throw new BadRequestException('El subdominio es inválido.');
    }

    // Verificar si el subdominio ya existe
    const existingSubdomain = await this.prisma.store.findUnique({
      where: { subdomain: cleanSubdomain },
    });
    if (existingSubdomain) {
      throw new ConflictException('El subdominio ya está registrado por otra tienda o sucursal.');
    }

    const isFirstBranch = company.stores.length === 0;

    const branch = await this.prisma.store.create({
      data: {
        name: data.name,
        subdomain: cleanSubdomain,
        logoUrl: data.logoUrl || company.logoUrl || null,
        address: data.address,
        originRegionId: data.originRegionId,
        originCommuneId: data.originCommuneId,
        pickupSchedule: data.pickupSchedule,
        pickupEnabled: !!data.address,
        isMainBranch: isFirstBranch,
        companyId: company.id,
        ownerId: company.ownerId,
      },
      include: {
        originRegion: true,
        originCommune: true,
      },
    });

    await this.prisma.storeMember.upsert({
      where: { storeId_userId: { storeId: branch.id, userId } },
      update: {},
      create: {
        storeId: branch.id,
        userId,
        role: 'BRANCH_MANAGER',
      },
    });

    if (!isFirstBranch) {
      await this.prisma.company.update({
        where: { id: company.id },
        data: { extraBranchesCount: { increment: 1 } },
      });
    }

    return branch;
  }

  // ==========================================
  // GESTIÓN DE USUARIOS DE EMPRESA Y SUCURSAL
  // ==========================================

  private async checkCompanyAccess(companyId: string, currentUser: any) {
    if (currentUser?.role === 'SUPERADMIN') return true;
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      include: { members: true },
    });
    if (!company) {
      throw new NotFoundException('Empresa no encontrada');
    }
    const isOwner = company.ownerId === currentUser.userId;
    const isMemberAdmin = company.members.some(
      (m) => m.userId === currentUser.userId && (m.role === 'OWNER' || m.role === 'ADMIN'),
    );
    if (!isOwner && !isMemberAdmin) {
      throw new ForbiddenException('No tienes permisos para administrar esta empresa');
    }
    return company;
  }

  private async checkStoreAccess(storeId: string, currentUser: any) {
    if (currentUser?.role === 'SUPERADMIN') return true;
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
      include: {
        members: true,
        company: {
          include: { members: true },
        },
      },
    });
    if (!store) {
      throw new NotFoundException('Sucursal no encontrada');
    }
    const isOwner = store.ownerId === currentUser.userId || store.company?.ownerId === currentUser.userId;
    const isCompanyAdmin = store.company?.members.some(
      (m) => m.userId === currentUser.userId && (m.role === 'OWNER' || m.role === 'ADMIN'),
    );
    const isBranchManager = store.members.some(
      (m) => m.userId === currentUser.userId && m.role === 'BRANCH_MANAGER',
    );
    if (!isOwner && !isCompanyAdmin && !isBranchManager) {
      throw new ForbiddenException('No tienes permisos para administrar el personal de esta sucursal');
    }
    return store;
  }

  /**
   * Obtiene los miembros corporativos de una empresa.
   */
  async getCompanyUsers(companyId: string, currentUser: any) {
    await this.checkCompanyAccess(companyId, currentUser);
    return this.prisma.companyMember.findMany({
      where: { companyId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Agrega o vincula un usuario a nivel de empresa (Holding).
   */
  async addCompanyUser(companyId: string, data: ManageCompanyUserDto, currentUser: any) {
    await this.checkCompanyAccess(companyId, currentUser);
    const company = await this.prisma.company.findUnique({ where: { id: companyId } });
    if (!company) throw new NotFoundException('Empresa no encontrada');

    let user = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (!user) {
      const rawPassword = data.password || 'TapTrade2026!';
      const hashedPassword = await bcrypt.hash(rawPassword, 10);
      user = await this.prisma.user.create({
        data: {
          email: data.email,
          name: data.name,
          password: hashedPassword,
          role: 'ADMIN',
          isVerified: true,
        },
      });
    } else {
      if (data.name && (!user.name || user.name === 'Jugador')) {
        await this.prisma.user.update({
          where: { id: user.id },
          data: { name: data.name },
        });
      }
    }

    const memberRole = data.role || 'ADMIN';
    return this.prisma.companyMember.upsert({
      where: { companyId_userId: { companyId, userId: user.id } },
      update: { role: memberRole },
      create: {
        companyId,
        userId: user.id,
        role: memberRole,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, createdAt: true },
        },
      },
    });
  }

  /**
   * Desvincula un miembro de la empresa.
   */
  async removeCompanyUser(companyId: string, targetUserId: string, currentUser: any) {
    await this.checkCompanyAccess(companyId, currentUser);
    const company = await this.prisma.company.findUnique({ where: { id: companyId } });
    if (!company) throw new NotFoundException('Empresa no encontrada');

    if (company.ownerId === targetUserId) {
      throw new BadRequestException('No es posible desvincular al dueño titular de la empresa.');
    }

    return this.prisma.companyMember.delete({
      where: { companyId_userId: { companyId, userId: targetUserId } },
    });
  }

  /**
   * Obtiene los miembros (cajeros / encargados) asignados a una sucursal específica.
   */
  async getStoreUsers(storeId: string, currentUser: any) {
    await this.checkStoreAccess(storeId, currentUser);
    return this.prisma.storeMember.findMany({
      where: { storeId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Agrega o vincula un usuario a una sucursal específica.
   */
  async addStoreUser(storeId: string, data: ManageStoreUserDto, currentUser: any) {
    await this.checkStoreAccess(storeId, currentUser);
    const store = await this.prisma.store.findUnique({ where: { id: storeId } });
    if (!store) throw new NotFoundException('Sucursal no encontrada');

    let user = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (!user) {
      const rawPassword = data.password || 'TapTrade2026!';
      const hashedPassword = await bcrypt.hash(rawPassword, 10);
      user = await this.prisma.user.create({
        data: {
          email: data.email,
          name: data.name,
          password: hashedPassword,
          role: 'ADMIN',
          isVerified: true,
        },
      });
    } else {
      if (data.name && (!user.name || user.name === 'Jugador')) {
        await this.prisma.user.update({
          where: { id: user.id },
          data: { name: data.name },
        });
      }
    }

    const memberRole = data.role || 'CASHIER';
    return this.prisma.storeMember.upsert({
      where: { storeId_userId: { storeId, userId: user.id } },
      update: { role: memberRole },
      create: {
        storeId,
        userId: user.id,
        role: memberRole,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, createdAt: true },
        },
      },
    });
  }

  /**
   * Desvincula un usuario de una sucursal.
   */
  async removeStoreUser(storeId: string, targetUserId: string, currentUser: any) {
    await this.checkStoreAccess(storeId, currentUser);
    const store = await this.prisma.store.findUnique({ where: { id: storeId } });
    if (!store) throw new NotFoundException('Sucursal no encontrada');

    if (store.ownerId === targetUserId && store.isMainBranch) {
      throw new BadRequestException('No es posible desvincular al dueño titular de la casa matriz.');
    }

    return this.prisma.storeMember.delete({
      where: { storeId_userId: { storeId, userId: targetUserId } },
    });
  }

  /**
   * Actualiza las credenciales (nombre, correo o contraseña) de un usuario perteneciente a la empresa o sucursal.
   * Permite a Superadmin o administradores corporativos reestablecer accesos.
   */
  async updateUserCredentials(targetUserId: string, data: UpdateUserCredentialsDto, currentUser: any) {
    const isSuperAdmin = currentUser?.role === 'SUPERADMIN' || currentUser?.sessionType === 'SUPERADMIN';

    const targetUser = await this.prisma.user.findUnique({ where: { id: targetUserId } });
    if (!targetUser) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (!isSuperAdmin) {
      const managedCompanies = await this.prisma.company.findMany({
        where: {
          OR: [
            { ownerId: currentUser.userId },
            { members: { some: { userId: currentUser.userId, role: { in: ['OWNER', 'ADMIN'] } } } },
          ],
        },
        select: { id: true },
      });
      const managedCompanyIds = managedCompanies.map((c) => c.id);

      const isTargetInManagedCompany = await this.prisma.companyMember.findFirst({
        where: { companyId: { in: managedCompanyIds }, userId: targetUserId },
      });

      const isTargetInManagedStore = await this.prisma.storeMember.findFirst({
        where: {
          store: { companyId: { in: managedCompanyIds } },
          userId: targetUserId,
        },
      });

      const isTargetCompanyOwner = await this.prisma.company.findFirst({
        where: { id: { in: managedCompanyIds }, ownerId: targetUserId },
      });

      if (!isTargetInManagedCompany && !isTargetInManagedStore && !isTargetCompanyOwner) {
        throw new ForbiddenException('No tienes permisos para modificar las credenciales de este usuario');
      }

      if (targetUser.role === 'SUPERADMIN') {
        throw new ForbiddenException('No puedes modificar las credenciales de un Superadministrador');
      }
    }

    // Validar unicidad del correo electrónico si cambia
    if (data.email && data.email.toLowerCase() !== targetUser.email.toLowerCase()) {
      const emailExists = await this.prisma.user.findUnique({
        where: { email: data.email.toLowerCase() },
      });
      if (emailExists) {
        throw new BadRequestException('El correo electrónico ya se encuentra registrado por otro usuario');
      }
    }

    // Construir objeto de actualización
    const userUpdate: any = {};
    if (data.name) userUpdate.name = data.name.trim();
    if (data.email) userUpdate.email = data.email.toLowerCase().trim();
    if (data.password) {
      userUpdate.password = await bcrypt.hash(data.password, 10);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: targetUserId },
      data: userUpdate,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    // Actualizar rol en CompanyMember si se especificó companyId y role
    if (data.companyId && data.role) {
      const validCompanyRoles = ['OWNER', 'ADMIN', 'ACCOUNTANT'];
      if (validCompanyRoles.includes(data.role)) {
        await this.prisma.companyMember.updateMany({
          where: { companyId: data.companyId, userId: targetUserId },
          data: { role: data.role as any },
        });
      }
    }

    // Actualizar rol en StoreMember si se especificó storeId y role
    if (data.storeId && data.role) {
      const validStoreRoles = ['BRANCH_MANAGER', 'CASHIER'];
      if (validStoreRoles.includes(data.role)) {
        await this.prisma.storeMember.updateMany({
          where: { storeId: data.storeId, userId: targetUserId },
          data: { role: data.role as any },
        });
      }
    }

    return {
      success: true,
      message: 'Credenciales actualizadas exitosamente',
      user: updatedUser,
    };
  }
}
