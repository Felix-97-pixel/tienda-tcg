import { Injectable, OnModuleInit, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LocationsService } from '../locations/locations.service';
import { estimateTcgPackage } from './tcg-packaging';
import { QuoteCartDto, UpdateStoreShippingDto } from './dto/quote-shipping.dto';

export interface QuotedOption {
  id: string; // ShippingProvider DB ID
  provider: 'RETIRO_TIENDA' | 'CHILEXPRESS' | 'STARKEN';
  name: string;
  price: number;
  estimatedDays: string;
  isDefault: boolean;
  address?: string;
  schedule?: string;
  carrierLogo?: string;
}

export interface StoreShippingQuote {
  storeId: string;
  storeName: string;
  originCommune: string;
  originRegion: string;
  packageDescription: string;
  packageWeightGrams: number;
  options: QuotedOption[];
}

@Injectable()
export class ShippingService implements OnModuleInit {
  constructor(
    private readonly prisma: PrismaService,
    private readonly locationsService: LocationsService,
  ) {}

  async onModuleInit() {
    await this.seedProviders();
  }

  /**
   * Catálogo de Regiones y Comunas de Chile (Alimentado dinámicamente desde PostgreSQL)
   */
  async getLocations() {
    return this.locationsService.getPublicLocations();
  }

  /**
   * Obtiene todos los proveedores de envío activos
   */
  async getActiveProviders() {
    return this.prisma.shippingProvider.findMany({
      where: { isActive: true },
      orderBy: { price: 'desc' },
    });
  }

  /**
   * Obtiene todos los proveedores de envío
   */
  async getAllProviders() {
    return this.prisma.shippingProvider.findMany({
      orderBy: { price: 'desc' },
    });
  }

  /**
   * Obtiene los proveedores de envío específicos de la tienda autenticada
   * Asegura que cada tienda tenga sus propios registros independientes en la DB
   */
  async getStoreProviders(userId: string) {
    let store = await this.prisma.store.findUnique({
      where: { ownerId: userId },
    });

    if (!store) {
      // Fallback a la primera tienda si el usuario autenticado es superadmin
      store = await this.prisma.store.findFirst();
    }

    if (!store) {
      // Fallback a proveedores globales si no hay tiendas creadas
      return this.prisma.shippingProvider.findMany({
        where: { storeId: null },
        orderBy: { price: 'desc' },
      });
    }

    // Buscar proveedores de esta tienda
    let providers = await this.prisma.shippingProvider.findMany({
      where: { storeId: store.id },
      orderBy: { price: 'desc' },
    });

    // Si aún no existen registros propios para esta tienda, crearlos copiando los valores por defecto
    const defaultConfigs = [
      { name: 'RETIRO_TIENDA', price: 0.0, isActive: store.pickupEnabled ?? true },
      { name: 'CHILEXPRESS', price: 9990.0, isActive: true },
      { name: 'STARKEN', price: 6990.0, isActive: true },
    ];

    let createdAny = false;
    for (const def of defaultConfigs) {
      const exists = providers.find((p) => p.name === def.name);
      if (!exists) {
        await this.prisma.shippingProvider.create({
          data: {
            storeId: store.id,
            name: def.name,
            price: def.price,
            isActive: def.isActive,
          },
        });
        createdAny = true;
      }
    }

    if (createdAny) {
      providers = await this.prisma.shippingProvider.findMany({
        where: { storeId: store.id },
        orderBy: { price: 'desc' },
      });
    }

    return providers;
  }

  /**
   * Actualiza precio y estado de un proveedor de forma 100% aislada para la tienda autenticada
   */
  async updateStoreProvider(
    userId: string,
    idOrName: string,
    data: { price?: number; isActive?: boolean }
  ) {
    let store = await this.prisma.store.findUnique({
      where: { ownerId: userId },
    });

    if (!store) {
      store = await this.prisma.store.findFirst();
    }

    if (!store) {
      throw new NotFoundException('No tienes una tienda asignada');
    }

    // 1. Primero intentar encontrar por id directo perteneciente a esta tienda
    let provider = await this.prisma.shippingProvider.findFirst({
      where: {
        id: idOrName,
        storeId: store.id,
      },
    });

    // 2. Si no se encontró por ID directo con storeId, determinar el nombre del courier
    if (!provider) {
      let provName = idOrName.toUpperCase();
      try {
        const anyProv = await this.prisma.shippingProvider.findUnique({ where: { id: idOrName } });
        if (anyProv) {
          provName = anyProv.name.toUpperCase();
        }
      } catch (e) {
        // idOrName no es un UUID válido
      }

      // Buscar si la tienda ya tiene un registro para ese nombre
      provider = await this.prisma.shippingProvider.findFirst({
        where: {
          storeId: store.id,
          name: provName,
        },
      });

      // Si aún no existía el registro propio para esta tienda, crearlo específicamente para ella
      if (!provider) {
        provider = await this.prisma.shippingProvider.create({
          data: {
            storeId: store.id,
            name: provName,
            price: data.price !== undefined ? data.price : (provName === 'STARKEN' ? 6990 : 9990),
            isActive: data.isActive !== undefined ? data.isActive : true,
          },
        });

        return provider;
      }
    }

    // 3. Actualizar ÚNICAMENTE el registro de ESTA tienda
    return this.prisma.shippingProvider.update({
      where: { id: provider.id },
      data: {
        ...(data.price !== undefined ? { price: data.price } : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
      },
    });
  }

  /**
   * Actualiza un proveedor de envío por su ID (Admin global)
   */
  async updateProvider(id: string, data: { price?: number; isActive?: boolean }) {
    const provider = await this.prisma.shippingProvider.findUnique({
      where: { id },
    });

    if (!provider) {
      throw new NotFoundException(`Proveedor de envío con ID ${id} no encontrado`);
    }

    return this.prisma.shippingProvider.update({
      where: { id },
      data: {
        ...(data.price !== undefined ? { price: data.price } : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
      },
    });
  }

  /**
   * Configuración de Despacho de una Tienda (Retiro y Comuna de Origen)
   */
  async getStoreShippingSettings(storeId: string) {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
      select: {
        id: true,
        name: true,
        address: true,
        pickupEnabled: true,
        pickupAddress: true,
        pickupSchedule: true,
        originRegionId: true,
        originCommuneId: true,
        originRegion: true,
        originCommune: { include: { zone: true } },
      },
    });

    if (!store) {
      throw new NotFoundException('Tienda no encontrada');
    }

    return store;
  }

  /**
   * Actualizar Configuración de Despacho de la Tienda
   */
  async updateStoreShippingSettings(
    storeId: string,
    dto: UpdateStoreShippingDto,
    userId?: string,
    userRole?: string,
  ) {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      throw new NotFoundException('Tienda no encontrada');
    }

    if (userRole !== 'SUPERADMIN' && userId && store.ownerId !== userId) {
      throw new ForbiddenException('No tienes permiso para modificar la configuración de despacho de otra tienda');
    }

    let finalOriginCommuneId = dto.originCommuneId;
    let finalOriginRegionId = dto.originRegionId;

    if (!finalOriginCommuneId && dto.originCommuneCode) {
      const commune = await this.prisma.commune.findUnique({
        where: { code: dto.originCommuneCode.toUpperCase().trim() },
      });
      if (commune) {
        finalOriginCommuneId = commune.id;
        finalOriginRegionId = commune.regionId;
      }
    }

    return this.prisma.store.update({
      where: { id: storeId },
      data: {
        ...(dto.pickupEnabled !== undefined ? { pickupEnabled: dto.pickupEnabled } : {}),
        ...(dto.pickupAddress !== undefined ? { pickupAddress: dto.pickupAddress } : {}),
        ...(dto.pickupSchedule !== undefined ? { pickupSchedule: dto.pickupSchedule } : {}),
        ...(finalOriginCommuneId !== undefined ? { originCommuneId: finalOriginCommuneId } : {}),
        ...(finalOriginRegionId !== undefined ? { originRegionId: finalOriginRegionId } : {}),
      },
    });
  }

  /**
   * Motor Principal de Cotización Dinámica de Envíos Multi-Tienda
   */
  async quoteCartShipping(dto: QuoteCartDto) {
    const destCommune = await this.locationsService.findCommuneByCode(dto.destinationCommune);
    const destinationName = destCommune ? destCommune.name : dto.destinationCommune;
    const destZone = destCommune?.zone || 'CENTRO';

    // Agrupar ítems por tienda
    const itemsByStore: Record<string, typeof dto.cartItems> = {};
    for (const item of dto.cartItems) {
      const sId = item.storeId || 'default';
      if (!itemsByStore[sId]) itemsByStore[sId] = [];
      itemsByStore[sId].push(item);
    }

    const result: Record<string, StoreShippingQuote> = {};

    for (const [storeId, storeItems] of Object.entries(itemsByStore)) {
      // Obtener datos de la tienda
      let store = null;
      if (storeId !== 'default') {
        store = await this.prisma.store.findUnique({
          where: { id: storeId },
          select: {
            id: true,
            name: true,
            address: true,
            pickupEnabled: true,
            pickupAddress: true,
            pickupSchedule: true,
            originRegionId: true,
            originCommuneId: true,
            originCommune: {
              include: {
                region: { include: { zone: true } },
                zone: true,
              },
            },
          },
        });
      }

      const storeName = store?.name || 'Tienda TapTrade';
      let originCommune: any = null;
      if (store?.originCommune) {
        originCommune = {
          id: store.originCommune.id,
          code: store.originCommune.code,
          name: store.originCommune.name,
          regionCode: store.originCommune.region.code,
          zone: store.originCommune.zone?.code || store.originCommune.region.zone?.code || 'CENTRO',
          isActive: store.originCommune.isActive && store.originCommune.region.isActive,
        };
      } else {
        originCommune = await this.locationsService.findCommuneByCode('SANTIAGO');
      }

      // 1. Obtener proveedores específicos de esta tienda (garantizando aislamiento total entre tiendas)
      const storeProviders = await this.prisma.shippingProvider.findMany({
        where: { storeId: store?.id || storeId },
      });

      const starkenProvider = storeProviders.find((p) => p.name === 'STARKEN');
      const chilexpressProvider = storeProviders.find((p) => p.name === 'CHILEXPRESS');
      const pickupProvider = storeProviders.find((p) => p.name === 'RETIRO_TIENDA');

      // Aislamiento por tienda: Si la tienda configuró el proveedor, usar su estado; si no, por defecto activo.
      const isStarkenActive = starkenProvider ? starkenProvider.isActive : true;
      const isChilexpressActive = chilexpressProvider ? chilexpressProvider.isActive : true;
      const isPickupActive = pickupProvider ? pickupProvider.isActive : true;

      // 2. Cubicaje TCG
      const pkg = estimateTcgPackage(
        storeItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          productName: item.productName,
        }))
      );

      // 3. Cálculo de distancia / zonas
      const distanceTier = this.calculateZoneDistanceTier(originCommune, destCommune);

      // 4. Tarifas dinámicas
      const starkenRate = this.calculateStarkenRate(distanceTier, pkg.chargeableWeightGrams);
      const chilexpressRate = this.calculateChilexpressRate(distanceTier, pkg.chargeableWeightGrams);

      const options: QuotedOption[] = [];

      // Opción A: Retiro en Tienda (solo si la tienda lo tiene habilitado y el método está activo)
      if (store?.pickupEnabled && isPickupActive) {
        options.push({
          id: pickupProvider ? pickupProvider.id : 'pickup',
          provider: 'RETIRO_TIENDA',
          name: 'Retiro en Tienda (Pick-up)',
          price: 0,
          estimatedDays: 'Inmediato / En horario de atención',
          isDefault: false,
          address: store.pickupAddress || store.address || 'Dirección de la tienda',
          schedule: store.pickupSchedule || 'Lunes a Sábado de 12:00 a 19:30 hrs',
        });
      }

      // Opción B: Starken Domicilio (solo si esta tienda lo tiene activo)
      if (isStarkenActive) {
        options.push({
          id: starkenProvider ? starkenProvider.id : 'starken',
          provider: 'STARKEN',
          name: 'Starken Domicilio',
          price: starkenRate.price,
          estimatedDays: starkenRate.estimatedDays,
          isDefault: true, // Starken como opción predeterminada económica
        });
      }

      // Opción C: Chilexpress Express Domicilio (solo si esta tienda lo tiene activo)
      if (isChilexpressActive) {
        options.push({
          id: chilexpressProvider ? chilexpressProvider.id : 'chilexpress',
          provider: 'CHILEXPRESS',
          name: 'Chilexpress Express Domicilio',
          price: chilexpressRate.price,
          estimatedDays: chilexpressRate.estimatedDays,
          isDefault: false,
        });
      }

      result[storeId] = {
        storeId,
        storeName,
        originCommune: originCommune.name,
        originRegion: originCommune.regionCode,
        packageDescription: pkg.description,
        packageWeightGrams: pkg.chargeableWeightGrams,
        options,
      };
    }

    return {
      destination: {
        commune: destinationName,
        region: destCommune?.regionCode || 'RM',
        zone: destZone,
      },
      stores: result,
    };
  }

  /**
   * Distancia entre zonas tarifarias
   * 0 = Misma comuna (Local)
   * 1 = Misma zona o adyacente (Cercana)
   * 2 = Interurbana media (Centro-Sur / Centro-Norte)
   * 3 = Interurbana larga (Norte Grande)
   * 4 = Zonas Extremas (Aysén, Magallanes)
   */
  private calculateZoneDistanceTier(
    origin: { code: string; zone: string },
    dest?: { code: string; zone: string }
  ): number {
    if (!dest) return 1;
    if (origin.code === dest.code) return 0;
    if (origin.zone === dest.zone) return 1;

    // Región Metropolitana <-> Centro (V, VI, VII)
    if (
      (origin.zone === 'RM' && dest.zone === 'CENTRO') ||
      (origin.zone === 'CENTRO' && dest.zone === 'RM')
    ) {
      return 1;
    }

    // Extremo Sur
    if (dest.zone === 'EXTREMO_SUR' || origin.zone === 'EXTREMO_SUR') {
      return 4;
    }

    // Norte Grande
    if (dest.zone === 'NORTE_GRANDE' || origin.zone === 'NORTE_GRANDE') {
      return 3;
    }

    return 2;
  }

  /**
   * Matriz de Tarifas de Starken
   */
  private calculateStarkenRate(tier: number, weightGrams: number) {
    let base = 3290;
    let days = '1-2 días hábiles';

    switch (tier) {
      case 0:
        base = 3290;
        days = '24 a 48 hrs';
        break;
      case 1:
        base = 3690;
        days = '1 a 2 días hábiles';
        break;
      case 2:
        base = 4390;
        days = '2 a 3 días hábiles';
        break;
      case 3:
        base = 5690;
        days = '3 a 4 días hábiles';
        break;
      case 4:
        base = 6990;
        days = '4 a 6 días hábiles';
        break;
    }

    // Recargo por peso si supera 500g
    if (weightGrams > 500) {
      const extraKg = Math.ceil((weightGrams - 500) / 1000);
      base += extraKg * 900;
    }

    return { price: base, estimatedDays: days };
  }

  /**
   * Matriz de Tarifas de Chilexpress
   */
  private calculateChilexpressRate(tier: number, weightGrams: number) {
    let base = 3890;
    let days = 'Día hábil siguiente';

    switch (tier) {
      case 0:
        base = 3890;
        days = '24 horas hábiles';
        break;
      case 1:
        base = 4490;
        days = '24 a 48 hrs';
        break;
      case 2:
        base = 5290;
        days = '24 a 48 hrs';
        break;
      case 3:
        base = 6790;
        days = '48 a 72 hrs';
        break;
      case 4:
        base = 8290;
        days = '2 a 4 días hábiles';
        break;
    }

    // Recargo por peso si supera 500g
    if (weightGrams > 500) {
      const extraKg = Math.ceil((weightGrams - 500) / 1000);
      base += extraKg * 1200;
    }

    return { price: base, estimatedDays: days };
  }

  /**
   * Inicializa la tabla de proveedores y sincroniza registros independientes por tienda
   */
  async seedProviders() {
    try {
      const defaultProviders = [
        { name: 'RETIRO_TIENDA', price: 0.0, isActive: true },
        { name: 'CHILEXPRESS', price: 9990.0, isActive: true },
        { name: 'STARKEN', price: 6990.0, isActive: true },
      ];

      // 1. Asegurar proveedores globales de respaldo
      for (const prov of defaultProviders) {
        const existing = await this.prisma.shippingProvider.findFirst({
          where: { name: prov.name, storeId: null },
        });
        if (!existing) {
          await this.prisma.shippingProvider.create({
            data: prov,
          });
          console.log(`✅ Proveedor global ${prov.name} sembrado exitosamente`);
        } else if (!existing.isActive) {
          await this.prisma.shippingProvider.update({
            where: { id: existing.id },
            data: { isActive: true },
          });
        }
      }

      // 2. Sembrar registros aislados para cada tienda existente en la base de datos
      const stores = await this.prisma.store.findMany({
        select: { id: true, pickupEnabled: true },
      });

      for (const store of stores) {
        for (const prov of defaultProviders) {
          const existing = await this.prisma.shippingProvider.findFirst({
            where: { name: prov.name, storeId: store.id },
          });
          if (!existing) {
            await this.prisma.shippingProvider.create({
              data: {
                storeId: store.id,
                name: prov.name,
                price: prov.price,
                isActive: prov.name === 'RETIRO_TIENDA' ? (store.pickupEnabled ?? true) : prov.isActive,
              },
            });
          }
        }
      }
    } catch (error: any) {
      console.error('❌ Error al sembrar proveedores de envío:', error?.message);
    }
  }
}
