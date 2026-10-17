import { Injectable, OnModuleInit, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateZoneDto,
  UpdateZoneDto,
  CreateRegionDto,
  UpdateRegionDto,
  CreateCommuneDto,
  UpdateCommuneDto,
} from './dto/locations.dto';

@Injectable()
export class LocationsService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.backfillStoreLocations();
  }

  /**
   * Vincula tiendas existentes con las llaves foráneas originCommuneId y originRegionId
   */
  async backfillStoreLocations() {
    try {
      const storesWithoutRelations = await this.prisma.store.findMany({
        where: {
          OR: [{ originCommuneId: null }, { originRegionId: null }],
        },
        select: {
          id: true,
          name: true,
        },
      });

      if (storesWithoutRelations.length > 0) {
        console.log(`📍 Sincronizando ${storesWithoutRelations.length} tiendas con llaves foráneas de ubicación...`);
        const santiagoCommune = await this.prisma.commune.findUnique({
          where: { code: 'SANTIAGO' },
          include: { region: true },
        });

        if (santiagoCommune) {
          for (const store of storesWithoutRelations) {
            await this.prisma.store.update({
              where: { id: store.id },
              data: {
                originCommuneId: santiagoCommune.id,
                originRegionId: santiagoCommune.regionId,
              },
            });
          }
        }
        console.log('✅ Tiendas sincronizadas con relaciones de Región y Comuna exitosamente');
      }
    } catch (error: any) {
      console.error('❌ Error en backfillStoreLocations:', error?.message);
    }
  }

  /* ─────────────────────────────────────────────────────────────
   * CATÁLOGOS PÚBLICOS
   * ───────────────────────────────────────────────────────────── */

  async getPublicLocations() {
    return this.prisma.region.findMany({
      where: { isActive: true },
      orderBy: { ordinal: 'asc' },
      select: {
        id: true,
        code: true,
        name: true,
        shortName: true,
        zone: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        communes: {
          where: { isActive: true },
          orderBy: { name: 'asc' },
          select: {
            id: true,
            code: true,
            name: true,
            zone: {
              select: {
                id: true,
                code: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }

  async getAllZonesPublic() {
    return this.prisma.logisticZone.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Busca una comuna por su código para la cotización de envíos
   */
  async findCommuneByCode(code: string) {
    const normalizedCode = code.toUpperCase().trim();
    const commune = await this.prisma.commune.findUnique({
      where: { code: normalizedCode },
      include: {
        region: {
          include: { zone: true },
        },
        zone: true,
      },
    });

    if (commune) {
      return {
        id: commune.id,
        code: commune.code,
        name: commune.name,
        regionId: commune.regionId,
        regionCode: commune.region.code,
        zoneId: commune.zoneId,
        zone: commune.zone?.code || commune.region.zone?.code || 'CENTRO',
        isActive: commune.isActive && commune.region.isActive,
      };
    }

    // Fallback de seguridad
    return {
      id: undefined,
      code: 'SANTIAGO',
      name: 'Santiago Centro',
      regionId: undefined,
      regionCode: 'RM',
      zoneId: undefined,
      zone: 'RM',
      isActive: true,
    };
  }

  /* ─────────────────────────────────────────────────────────────
   * SUPERADMIN CRUD: ZONAS LOGÍSTICAS
   * ───────────────────────────────────────────────────────────── */

  async getAllZones() {
    return this.prisma.logisticZone.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            regions: true,
            communes: true,
          },
        },
      },
    });
  }

  async createZone(dto: CreateZoneDto) {
    const code = dto.code.toUpperCase().trim();
    const existing = await this.prisma.logisticZone.findUnique({ where: { code } });
    if (existing) {
      throw new ConflictException(`Ya existe una zona logística con el código ${code}`);
    }

    return this.prisma.logisticZone.create({
      data: {
        code,
        name: dto.name.trim(),
        description: dto.description?.trim() || null,
        isActive: dto.isActive !== undefined ? dto.isActive : true,
      },
    });
  }

  async updateZone(id: string, dto: UpdateZoneDto) {
    const zone = await this.prisma.logisticZone.findUnique({ where: { id } });
    if (!zone) throw new NotFoundException('Zona logística no encontrada');

    if (dto.code && dto.code.toUpperCase().trim() !== zone.code) {
      const existing = await this.prisma.logisticZone.findUnique({
        where: { code: dto.code.toUpperCase().trim() },
      });
      if (existing) {
        throw new ConflictException(`Ya existe otra zona con el código ${dto.code}`);
      }
    }

    return this.prisma.logisticZone.update({
      where: { id },
      data: {
        ...(dto.code ? { code: dto.code.toUpperCase().trim() } : {}),
        ...(dto.name ? { name: dto.name.trim() } : {}),
        ...(dto.description !== undefined ? { description: dto.description ? dto.description.trim() : null } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      },
    });
  }

  async deleteZone(id: string) {
    const zone = await this.prisma.logisticZone.findUnique({
      where: { id },
      include: {
        _count: {
          select: { regions: true, communes: true },
        },
      },
    });
    if (!zone) throw new NotFoundException('Zona logística no encontrada');

    if (zone._count.regions > 0 || zone._count.communes > 0) {
      throw new ConflictException(
        `No se puede eliminar la zona porque tiene ${zone._count.regions} regiones y ${zone._count.communes} comunas asociadas. Reasígnalas primero.`
      );
    }

    return this.prisma.logisticZone.delete({ where: { id } });
  }

  /* ─────────────────────────────────────────────────────────────
   * SUPERADMIN CRUD: REGIONES
   * ───────────────────────────────────────────────────────────── */

  async getAllRegions() {
    return this.prisma.region.findMany({
      orderBy: { ordinal: 'asc' },
      include: {
        zone: true,
        _count: {
          select: { communes: true, stores: true },
        },
      },
    });
  }

  async createRegion(dto: CreateRegionDto) {
    const existing = await this.prisma.region.findUnique({
      where: { code: dto.code.toUpperCase().trim() },
    });
    if (existing) {
      throw new ConflictException(`Ya existe una región con el código ${dto.code}`);
    }

    if (dto.zoneId) {
      const zone = await this.prisma.logisticZone.findUnique({ where: { id: dto.zoneId } });
      if (!zone) throw new NotFoundException('Zona logística asignada no encontrada');
    }

    return this.prisma.region.create({
      data: {
        code: dto.code.toUpperCase().trim(),
        name: dto.name.trim(),
        shortName: dto.shortName?.trim() || null,
        zoneId: dto.zoneId || null,
        ordinal: dto.ordinal ?? 0,
        isActive: dto.isActive !== undefined ? dto.isActive : true,
      },
      include: { zone: true },
    });
  }

  async updateRegion(id: string, dto: UpdateRegionDto) {
    const region = await this.prisma.region.findUnique({ where: { id } });
    if (!region) throw new NotFoundException('Región no encontrada');

    if (dto.code && dto.code.toUpperCase().trim() !== region.code) {
      const existing = await this.prisma.region.findUnique({
        where: { code: dto.code.toUpperCase().trim() },
      });
      if (existing) {
        throw new ConflictException(`Ya existe otra región con el código ${dto.code}`);
      }
    }

    if (dto.zoneId) {
      const zone = await this.prisma.logisticZone.findUnique({ where: { id: dto.zoneId } });
      if (!zone) throw new NotFoundException('Zona logística asignada no encontrada');
    }

    return this.prisma.region.update({
      where: { id },
      data: {
        ...(dto.code ? { code: dto.code.toUpperCase().trim() } : {}),
        ...(dto.name ? { name: dto.name.trim() } : {}),
        ...(dto.shortName !== undefined ? { shortName: dto.shortName ? dto.shortName.trim() : null } : {}),
        ...(dto.zoneId !== undefined ? { zoneId: dto.zoneId || null } : {}),
        ...(dto.ordinal !== undefined ? { ordinal: dto.ordinal } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      },
      include: { zone: true },
    });
  }

  async deleteRegion(id: string) {
    const region = await this.prisma.region.findUnique({
      where: { id },
      include: { _count: { select: { communes: true, stores: true } } },
    });
    if (!region) throw new NotFoundException('Región no encontrada');

    if (region._count.stores > 0) {
      throw new ConflictException(
        `No se puede eliminar la región porque tiene ${region._count.stores} tiendas asociadas.`
      );
    }

    return this.prisma.region.delete({
      where: { id },
    });
  }

  /* ─────────────────────────────────────────────────────────────
   * SUPERADMIN CRUD: COMUNAS
   * ───────────────────────────────────────────────────────────── */

  async getAllCommunes(regionId?: string, search?: string) {
    const whereClause: any = {};
    if (regionId && regionId !== 'all') {
      whereClause.regionId = regionId;
    }
    if (search && search.trim()) {
      whereClause.OR = [
        { name: { contains: search.trim(), mode: 'insensitive' } },
        { code: { contains: search.trim().toUpperCase() } },
      ];
    }

    return this.prisma.commune.findMany({
      where: whereClause,
      include: {
        region: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        zone: true,
      },
      orderBy: [{ region: { ordinal: 'asc' } }, { name: 'asc' }],
    });
  }

  async createCommune(dto: CreateCommuneDto) {
    const region = await this.prisma.region.findUnique({ where: { id: dto.regionId } });
    if (!region) throw new NotFoundException('Región no encontrada');

    const existing = await this.prisma.commune.findUnique({
      where: { code: dto.code.toUpperCase().trim() },
    });
    if (existing) {
      throw new ConflictException(`Ya existe una comuna con el código ${dto.code}`);
    }

    let finalZoneId = dto.zoneId;
    if (!finalZoneId) {
      finalZoneId = region.zoneId || undefined;
    }

    return this.prisma.commune.create({
      data: {
        code: dto.code.toUpperCase().trim(),
        name: dto.name.trim(),
        regionId: dto.regionId,
        zoneId: finalZoneId || null,
        isActive: dto.isActive !== undefined ? dto.isActive : true,
      },
      include: { region: true, zone: true },
    });
  }

  async updateCommune(id: string, dto: UpdateCommuneDto) {
    const commune = await this.prisma.commune.findUnique({ where: { id } });
    if (!commune) throw new NotFoundException('Comuna no encontrada');

    if (dto.code && dto.code.toUpperCase().trim() !== commune.code) {
      const existing = await this.prisma.commune.findUnique({
        where: { code: dto.code.toUpperCase().trim() },
      });
      if (existing) {
        throw new ConflictException(`Ya existe otra comuna con el código ${dto.code}`);
      }
    }

    if (dto.regionId) {
      const region = await this.prisma.region.findUnique({ where: { id: dto.regionId } });
      if (!region) throw new NotFoundException('Región no encontrada');
    }

    if (dto.zoneId) {
      const zone = await this.prisma.logisticZone.findUnique({ where: { id: dto.zoneId } });
      if (!zone) throw new NotFoundException('Zona logística no encontrada');
    }

    return this.prisma.commune.update({
      where: { id },
      data: {
        ...(dto.code ? { code: dto.code.toUpperCase().trim() } : {}),
        ...(dto.name ? { name: dto.name.trim() } : {}),
        ...(dto.regionId ? { regionId: dto.regionId } : {}),
        ...(dto.zoneId !== undefined ? { zoneId: dto.zoneId || null } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      },
      include: { region: true, zone: true },
    });
  }

  async deleteCommune(id: string) {
    const commune = await this.prisma.commune.findUnique({
      where: { id },
      include: { _count: { select: { stores: true } } },
    });
    if (!commune) throw new NotFoundException('Comuna no encontrada');

    if (commune._count.stores > 0) {
      throw new ConflictException(
        `No se puede eliminar la comuna porque tiene ${commune._count.stores} tiendas asociadas.`
      );
    }

    return this.prisma.commune.delete({
      where: { id },
    });
  }
}
