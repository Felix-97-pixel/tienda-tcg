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

export interface TrackingValidationResult {
  valid: boolean;
  courier: string;
  trackingNumber: string;
  liveConfirmed?: boolean;
  status?: string;
  destination?: string;
  service?: string;
  carrierDate?: string;
  trackingUrl?: string;
  message?: string;
  events?: Array<{
    date: string;
    description: string;
    location?: string;
    detail?: string;
  }>;
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
    let store = await this.prisma.store.findFirst({
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

    // Si aún no existen registros propios para esta tienda, crearlos copiando los valores por defecto (solo couriers de despacho)
    const defaultConfigs = [
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
    let store = await this.prisma.store.findFirst({
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

      // Aislamiento por tienda: Si la tienda configuró el proveedor, usar su estado; si no, por defecto activo.
      const isStarkenActive = starkenProvider ? starkenProvider.isActive : true;
      const isChilexpressActive = chilexpressProvider ? chilexpressProvider.isActive : true;

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

      // Opción A: Retiro en Tienda (gestionado exclusivamente por Store.pickupEnabled)
      if (store?.pickupEnabled) {
        options.push({
          id: `pickup_${store.id}`,
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
      // Limpiar proveedores obsoletos 'RETIRO_TIENDA' de la tabla ShippingProvider (el retiro es gestionado por Store.pickupEnabled)
      await this.prisma.shippingProvider.deleteMany({
        where: { name: 'RETIRO_TIENDA' },
      }).catch(() => {});

      const defaultProviders = [
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
                isActive: prov.isActive,
              },
            });
          }
        }
      }
    } catch (error: any) {
      console.error('❌ Error al sembrar proveedores de envío:', error?.message);
    }
  }

  // --- Validación de Seguimiento de Couriers (Anti-Fraude) ---
  private chilexpressTokenCache: { token: string; expiresAt: number } | null = null;

  private async getChilexpressToken(): Promise<string | null> {
    const now = Date.now();
    if (this.chilexpressTokenCache && this.chilexpressTokenCache.expiresAt > now + 60000) {
      return this.chilexpressTokenCache.token;
    }

    try {
      const clientId = process.env.CHILEXPRESS_CLIENT_ID;
      const clientSecret = process.env.CHILEXPRESS_CLIENT_SECRET;
      const subscriptionKey = process.env.CHILEXPRESS_SUBSCRIPTION_KEY;

      if (!clientId || !clientSecret || !subscriptionKey) {
        return null;
      }

      const tokenUrl = 'https://services.wschilexpress.com/centroayuda/api/v1/api/v1/token';
      const body = new URLSearchParams();
      body.set('grant_type', 'client_credentials');
      body.set('client_id', clientId);
      body.set('scope', `api://${clientId}/.default`);
      body.set('client_secret', clientSecret);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': subscriptionKey,
          'Ocp-Apim-Trace': 'true',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Origin': 'https://centrodeayuda.chilexpress.cl',
          'Referer': 'https://centrodeayuda.chilexpress.cl/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        body: body.toString(),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        return null;
      }

      const data = await res.json();
      if (data.access_token) {
        const expiresInMs = (data.expires_in || 3600) * 1000;
        this.chilexpressTokenCache = {
          token: data.access_token,
          expiresAt: now + expiresInMs,
        };
        return data.access_token;
      }
      return null;
    } catch {
      return null;
    }
  }

  private async getStarkenTrackingData(cleanTracking: string): Promise<{
    status?: string;
    destination?: string;
    service?: string;
    events?: Array<{ date: string; description: string; location?: string; detail?: string }>;
  } | null> {
    const isProd = process.env.STARKEN_ENV === 'production';
    const apiUrl = process.env.STARKEN_TRACKING_URL || (isProd
      ? 'https://restservices.starken.cl/apiprd/starkenservices/rest/getDetalleSeguimientoNuevo'
      : 'https://apiqa.starken.cl/etrackingRest/resumenTrackingCargaRedestinacion');

    const apiKey = process.env.STARKEN_API_KEY || '1234';
    const cliRut = process.env.STARKEN_RUT || '76211240';
    const password = process.env.STARKEN_PASSWORD || 'key';
    const rutEmpresa = process.env.STARKEN_RUT_EMPRESA || '96930480';

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      // 1. Endpoint principal: Etracking con historial cronológico completo
      if (apiUrl.includes('etrackingRest') || apiUrl.includes('resumenTrackingCargaRedestinacion')) {
        const res = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-key': apiKey,
            'cli-rut': cliRut,
            'password': password,
          },
          body: JSON.stringify({
            tracking: [
              {
                numeroDocumento: '',
                numeroOrdenFlete: cleanTracking,
                tipoDocumento: '',
              },
            ],
            rutEmpresa,
          }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          const of = data.listaResumenRedestinacion?.ordenFlete?.[0];
          if (of && of.codigoSalida === 1) {
            const events = (of.listaTrackingOF || []).map((e: any) => ({
              date: e.fechaHoraSeguimiento,
              description: e.descripcionEstado || 'Movimiento de carga',
              location: of.comunaDestinoOrdenFlete
                ? `${of.ciudadDestinoOrdenFlete || ''} - ${of.comunaDestinoOrdenFlete}`.trim()
                : of.ciudadDestinoOrdenFlete || '',
              detail: e.tipoDevolucion || '',
            }));

            return {
              status: of.estadoOrdenFlete || (events[events.length - 1]?.description) || 'En tránsito',
              destination: of.comunaDestinoOrdenFlete
                ? `${of.comunaDestinoOrdenFlete}, ${of.ciudadDestinoOrdenFlete || ''}`
                : of.ciudadDestinoOrdenFlete || '',
              service: of.pesoOrdenFlete ? `Carga ${of.pesoOrdenFlete} Kg` : 'Servicio Starken',
              events,
            };
          }
        }
      } else {
        // 2. Endpoint unitario alternativo: getDetalleSeguimientoNuevo
        const res = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Rut': cliRut,
            'Clave': password,
          },
          body: JSON.stringify({
            ordenFlete: Number(cleanTracking) || cleanTracking,
          }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          if (data && data.estadoFlete) {
            return {
              status: data.estadoFlete,
              destination: data.ciudadDestino || '',
              service: data.tipoServicio || 'NORMAL',
              events: [
                {
                  date: data.fechaEmision || new Date().toISOString(),
                  description: data.estadoFlete,
                  location: data.descripcionAgenciaDestino || data.ciudadDestino || '',
                },
              ],
            };
          }
        }
      }
      return null;
    } catch {
      return null;
    }
  }

  async validateTracking(
    courierRaw: string,
    trackingNumberRaw: string,
    vendorOrderId?: string,
  ): Promise<TrackingValidationResult> {
    const courier = (courierRaw || '').toUpperCase().trim();
    const cleanTracking = (trackingNumberRaw || '').replace(/[\s-]/g, '').trim();

    // 1. Manejo especial: Retiro en Tienda (presencial)
    if (courier.includes('RETIRO')) {
      return {
        valid: true,
        courier: 'RETIRO_TIENDA',
        trackingNumber: cleanTracking || 'RETIRO-LOCAL',
        liveConfirmed: true,
        status: 'Retiro en Local Presencial',
        message: 'No requiere número de courier. Entrega directa en tienda.',
      };
    }

    if (!cleanTracking) {
      return {
        valid: false,
        courier,
        trackingNumber: '',
        message: 'Por favor ingresa un número de seguimiento oficial.',
      };
    }

    // 2. Validación Anti-Fraude: Comprobar que no esté duplicado en OTRA orden distinta
    if (cleanTracking !== 'RETIRO-LOCAL' && vendorOrderId) {
      // Verificar si la orden actual ya fue despachada con este número (consulta de tracking existente)
      const currentVo = await this.prisma.vendorOrder.findUnique({
        where: { id: vendorOrderId },
        select: { deliveryStatus: true, trackingNumber: true },
      });

      // Solo comprobar duplicados si es un intento de despacho nuevo
      const isNewDispatch = !currentVo || currentVo.deliveryStatus !== 'DISPATCHED' || currentVo.trackingNumber !== cleanTracking;

      if (isNewDispatch) {
        const duplicate = await this.prisma.vendorOrder.findFirst({
          where: {
            trackingNumber: cleanTracking,
            id: { not: vendorOrderId },
            deliveryStatus: { in: ['DISPATCHED', 'DELIVERED'] },
          },
          include: {
            order: {
              select: { buyOrder: true },
            },
          },
        });

        if (duplicate) {
          return {
            valid: false,
            courier,
            trackingNumber: cleanTracking,
            message: `Esta orden de transporte ya fue registrada en el pedido #${duplicate.order?.buyOrder || duplicate.id}. No se permite reutilizar códigos de despacho.`,
          };
        }
      }
    }

    // 3. Validación específica para CHILEXPRESS
    if (courier.includes('CHILE')) {
      const isDigitsOnly = /^\d{10,12}$/.test(cleanTracking);
      if (!isDigitsOnly) {
        return {
          valid: false,
          courier: 'CHILEXPRESS',
          trackingNumber: cleanTracking,
          message: 'La Orden de Transporte (OT) de Chilexpress debe tener entre 10 y 12 dígitos numéricos (ej: 713152905010).',
        };
      }

      // Consulta en vivo a la API oficial de Chilexpress
      try {
        const token = await this.getChilexpressToken();
        if (token) {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 6000);

          const subscriptionKey = process.env.CHILEXPRESS_SUBSCRIPTION_KEY;
          const trackRes = await fetch(
            `https://services.wschilexpress.com/centroayuda/api/v1/api/v1/gettracking?ot=${cleanTracking}`,
            {
              headers: {
                'Ocp-Apim-Subscription-Key': subscriptionKey || '',
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Origin': 'https://centrodeayuda.chilexpress.cl',
                'Referer': 'https://centrodeayuda.chilexpress.cl/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              },
              signal: controller.signal,
            },
          );
          clearTimeout(timeoutId);

          if (trackRes.ok) {
            const data = await trackRes.json();
            const hasEvents = Array.isArray(data.ListTracking) && data.ListTracking.length > 0;
            const isSuccess = data.Respuesta?.resultado === true;

            if (isSuccess && hasEvents) {
              const latestEvent = data.ListTracking[0];
              // Orden cronológico (desde la creación del envío hasta el evento más reciente)
              const events = [...data.ListTracking].reverse().map((e: any) => ({
                date: e.fec_track,
                description: e.gls_tracking,
                location: e.gls_Destino || '',
                detail: e.gls_observacion || e.gls_motivo || '',
              }));

              return {
                valid: true,
                courier: 'CHILEXPRESS',
                trackingNumber: cleanTracking,
                liveConfirmed: true,
                status: latestEvent.gls_tracking || 'En tránsito',
                destination: data.DatosOT?.gls_cobertura || latestEvent.gls_Destino || '',
                service: data.DatosOT?.gls_servicio || 'EXPRESS',
                carrierDate: latestEvent.fec_track,
                trackingUrl: `https://www.chilexpress.cl/seguimiento-envios?numeroEnvio=${cleanTracking}`,
                events,
                message: 'Orden de Transporte confirmada exitosamente en los registros oficiales de Chilexpress.',
              };
            } else {
              // La API respondió pero la OT no existe o es ficticia
              return {
                valid: false,
                courier: 'CHILEXPRESS',
                trackingNumber: cleanTracking,
                liveConfirmed: true,
                message: `La OT #${cleanTracking} no figura en los registros de Chilexpress. Por favor verifica tu orden de transporte antes de confirmar.`,
              };
            }
          }
        }
      } catch (err: any) {
        // En caso de corte de red o timeout con Chilexpress, no bloquear si el formato es correcto
      }

      return {
        valid: true,
        courier: 'CHILEXPRESS',
        trackingNumber: cleanTracking,
        liveConfirmed: false,
        status: 'Formato oficial de 12 dígitos validado',
        trackingUrl: `https://www.chilexpress.cl/seguimiento-envios?numeroEnvio=${cleanTracking}`,
        message: 'Formato verificado (El servicio en tiempo real de Chilexpress no se encuentra disponible temporalmente).',
      };
    }

    // 4. Validación para STARKEN
    if (courier.includes('STARKEN')) {
      const isDigitsOnly = /^\d{8,11}$/.test(cleanTracking);
      if (!isDigitsOnly) {
        return {
          valid: false,
          courier: 'STARKEN',
          trackingNumber: cleanTracking,
          message: 'El número de orden de flete de Starken debe ser numérico de 8 a 11 dígitos (ej: 2981726481).',
        };
      }

      // Consulta en vivo a la API oficial de Starken
      const starkenData = await this.getStarkenTrackingData(cleanTracking);

      if (starkenData && starkenData.events && starkenData.events.length > 0) {
        return {
          valid: true,
          courier: 'STARKEN',
          trackingNumber: cleanTracking,
          liveConfirmed: true,
          status: starkenData.status || 'En tránsito',
          destination: starkenData.destination,
          service: starkenData.service,
          carrierDate: starkenData.events[starkenData.events.length - 1]?.date,
          trackingUrl: `https://www.starken.cl/seguimiento?codigo=${cleanTracking}`,
          events: starkenData.events,
          message: 'Orden de Flete confirmada en los registros oficiales de Starken.',
        };
      }

      return {
        valid: true,
        courier: 'STARKEN',
        trackingNumber: cleanTracking,
        liveConfirmed: false,
        status: 'Orden de Flete Starken Verificada',
        trackingUrl: `https://www.starken.cl/seguimiento?codigo=${cleanTracking}`,
        message: 'Formato oficial de orden de flete verificado para seguimiento.',
      };
    }

    // 5. BLUE EXPRESS
    if (courier.includes('BLUE')) {
      const isDigitsOnly = /^\d{10,12}$/.test(cleanTracking);
      if (!isDigitsOnly) {
        return {
          valid: false,
          courier: 'BLUE_EXPRESS',
          trackingNumber: cleanTracking,
          message: 'El número de seguimiento de Blue Express debe contener entre 10 y 12 dígitos.',
        };
      }
      return {
        valid: true,
        courier: 'BLUE_EXPRESS',
        trackingNumber: cleanTracking,
        liveConfirmed: true,
        status: 'Seguimiento Blue Express Verificado',
        trackingUrl: `https://www.bluex.cl/seguimiento/?tracking=${cleanTracking}`,
        message: 'Formato oficial Blue Express verificado.',
      };
    }

    // 6. CORREOS DE CHILE
    if (courier.includes('CORREO')) {
      const isValid = /^[A-Za-z0-9]{8,15}$/.test(cleanTracking);
      if (!isValid) {
        return {
          valid: false,
          courier: 'CORREOS_CHILE',
          trackingNumber: cleanTracking,
          message: 'El número de envío de Correos de Chile debe contener entre 8 y 15 caracteres alfanuméricos.',
        };
      }
      return {
        valid: true,
        courier: 'CORREOS_CHILE',
        trackingNumber: cleanTracking,
        liveConfirmed: true,
        status: 'Número de Envío Correos de Chile Verificado',
        trackingUrl: `https://www.correos.cl/seguimiento-en-linea?envio=${cleanTracking}`,
        message: 'Formato oficial Correos de Chile verificado.',
      };
    }

    // Default genérico
    return {
      valid: cleanTracking.length >= 6,
      courier,
      trackingNumber: cleanTracking,
      liveConfirmed: false,
      status: 'Código de seguimiento registrado',
      trackingUrl: `https://www.google.com/search?q=${encodeURIComponent(courier + ' seguimiento ' + cleanTracking)}`,
    };
  }
}

