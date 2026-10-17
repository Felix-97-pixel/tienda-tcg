import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import {
  CreateZoneDto,
  UpdateZoneDto,
  CreateRegionDto,
  UpdateRegionDto,
  CreateCommuneDto,
  UpdateCommuneDto,
} from './dto/locations.dto';

@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  /**
   * GET /api/v1/locations
   * Catálogo público de Regiones y Comunas de Chile (con sus Zonas Logísticas)
   */
  @Get()
  getPublicLocations() {
    return this.locationsService.getPublicLocations();
  }

  /**
   * GET /api/v1/locations/zones
   * Listado público de Zonas Logísticas activas
   */
  @Get('zones')
  getPublicZones() {
    return this.locationsService.getAllZonesPublic();
  }

  /* ─────────────────────────────────────────────────────────────
   * SUPERADMIN: ZONAS LOGÍSTICAS
   * ───────────────────────────────────────────────────────────── */

  @Get('admin/zones')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
  getAllZones() {
    return this.locationsService.getAllZones();
  }

  @Post('admin/zones')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
  createZone(@Body() dto: CreateZoneDto) {
    return this.locationsService.createZone(dto);
  }

  @Patch('admin/zones/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
  updateZone(@Param('id') id: string, @Body() dto: UpdateZoneDto) {
    return this.locationsService.updateZone(id, dto);
  }

  @Delete('admin/zones/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
  deleteZone(@Param('id') id: string) {
    return this.locationsService.deleteZone(id);
  }

  /* ─────────────────────────────────────────────────────────────
   * SUPERADMIN: REGIONES
   * ───────────────────────────────────────────────────────────── */

  @Get('admin/regions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
  getAllRegions() {
    return this.locationsService.getAllRegions();
  }

  @Post('admin/regions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
  createRegion(@Body() dto: CreateRegionDto) {
    return this.locationsService.createRegion(dto);
  }

  @Patch('admin/regions/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
  updateRegion(@Param('id') id: string, @Body() dto: UpdateRegionDto) {
    return this.locationsService.updateRegion(id, dto);
  }

  @Delete('admin/regions/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
  deleteRegion(@Param('id') id: string) {
    return this.locationsService.deleteRegion(id);
  }

  /* ─────────────────────────────────────────────────────────────
   * SUPERADMIN: COMUNAS
   * ───────────────────────────────────────────────────────────── */

  @Get('admin/communes')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
  getAllCommunes(
    @Query('regionId') regionId?: string,
    @Query('search') search?: string,
  ) {
    return this.locationsService.getAllCommunes(regionId, search);
  }

  @Post('admin/communes')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
  createCommune(@Body() dto: CreateCommuneDto) {
    return this.locationsService.createCommune(dto);
  }

  @Patch('admin/communes/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
  updateCommune(@Param('id') id: string, @Body() dto: UpdateCommuneDto) {
    return this.locationsService.updateCommune(id, dto);
  }

  @Delete('admin/communes/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
  deleteCommune(@Param('id') id: string) {
    return this.locationsService.deleteCommune(id);
  }
}
