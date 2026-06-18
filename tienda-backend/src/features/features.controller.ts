import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { FeaturesService } from './features.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPERADMIN')
@Controller('features')
export class FeaturesController {
  constructor(private readonly featuresService: FeaturesService) {}

  // ================= FEATURES =================

  @Get()
  getAllFeatures() {
    return this.featuresService.getAllFeatures();
  }

  @Post()
  createFeature(@Body() data: { key: string; name: string; description?: string; price?: number }) {
    return this.featuresService.createFeature(data);
  }

  @Patch(':id')
  updateFeature(
    @Param('id') id: string,
    @Body() data: { key?: string; name?: string; description?: string; price?: number }
  ) {
    return this.featuresService.updateFeature(id, data);
  }

  @Delete(':id')
  deleteFeature(@Param('id') id: string) {
    return this.featuresService.deleteFeature(id);
  }

  // ================= SUBSCRIPTION PLANS =================

  @Get('plans')
  getAllPlans() {
    return this.featuresService.getAllPlans();
  }

  @Post('plans')
  createPlan(@Body() data: { name: string; description?: string; price?: number; featureIds?: string[]; skuLimit?: number; commissionRate?: number }) {
    return this.featuresService.createPlan(data);
  }

  @Patch('plans/:id')
  updatePlan(
    @Param('id') id: string,
    @Body() data: { name?: string; description?: string; price?: number; featureIds?: string[]; skuLimit?: number; commissionRate?: number }
  ) {
    return this.featuresService.updatePlan(id, data);
  }

  @Delete('plans/:id')
  deletePlan(@Param('id') id: string) {
    return this.featuresService.deletePlan(id);
  }
}
