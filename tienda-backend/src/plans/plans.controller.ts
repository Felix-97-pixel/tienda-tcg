import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { PlansService } from './plans.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller(['plans', 'features/plans'])
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Get()
  getAllPlans(@Query('standardOnly') standardOnly?: string) {
    return this.plansService.getAllPlans(standardOnly === 'true');
  }

  @Get(':id')
  getPlanById(@Param('id') id: string) {
    return this.plansService.getPlanById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN')
  @Post()
  createPlan(
    @Body()
    data: {
      name: string;
      description?: string;
      price?: number;
      skuLimit?: number;
      commissionRate?: number;
      isStandard?: boolean;
    },
  ) {
    return this.plansService.createPlan(data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN')
  @Patch(':id')
  updatePlan(
    @Param('id') id: string,
    @Body()
    data: {
      name?: string;
      description?: string;
      price?: number;
      skuLimit?: number;
      commissionRate?: number;
      isStandard?: boolean;
    },
  ) {
    return this.plansService.updatePlan(id, data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN')
  @Delete(':id')
  deletePlan(@Param('id') id: string) {
    return this.plansService.deletePlan(id);
  }
}

