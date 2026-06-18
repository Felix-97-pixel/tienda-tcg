import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FeaturesService {
  constructor(private prisma: PrismaService) {}

  // ================= FEATURES =================

  async getAllFeatures() {
    return this.prisma.feature.findMany({
      orderBy: { key: 'asc' }
    });
  }

  async getFeatureById(id: string) {
    const feature = await this.prisma.feature.findUnique({ where: { id } });
    if (!feature) throw new NotFoundException('Feature no encontrada');
    return feature;
  }

  async createFeature(data: { key: string; name: string; description?: string; price?: number }) {
    return this.prisma.feature.create({
      data: {
        key: data.key,
        name: data.name,
        description: data.description,
        price: data.price || 0,
      }
    });
  }

  async updateFeature(id: string, data: { key?: string; name?: string; description?: string; price?: number }) {
    await this.getFeatureById(id);
    return this.prisma.feature.update({
      where: { id },
      data: {
        key: data.key,
        name: data.name,
        description: data.description,
        price: data.price !== undefined ? data.price : undefined,
      }
    });
  }

  async deleteFeature(id: string) {
    await this.getFeatureById(id);
    return this.prisma.feature.delete({ where: { id } });
  }

  // ================= SUBSCRIPTION PLANS =================

  async getAllPlans() {
    return this.prisma.subscriptionPlan.findMany({
      include: {
        features: true
      },
      orderBy: { price: 'asc' }
    });
  }

  async getPlanById(id: string) {
    const plan = await this.prisma.subscriptionPlan.findUnique({ 
      where: { id },
      include: { features: true }
    });
    if (!plan) throw new NotFoundException('Plan no encontrado');
    return plan;
  }

  async createPlan(data: { name: string; description?: string; price?: number; featureIds?: string[]; skuLimit?: number; commissionRate?: number }) {
    return this.prisma.subscriptionPlan.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price || 0,
        skuLimit: data.skuLimit !== undefined ? data.skuLimit : -1,
        commissionRate: data.commissionRate || 0,
        features: {
          connect: (data.featureIds || []).map(id => ({ id }))
        }
      },
      include: { features: true }
    });
  }

  async updatePlan(id: string, data: { name?: string; description?: string; price?: number; featureIds?: string[]; skuLimit?: number; commissionRate?: number }) {
    await this.getPlanById(id);
    return this.prisma.subscriptionPlan.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        price: data.price !== undefined ? data.price : undefined,
        skuLimit: data.skuLimit !== undefined ? data.skuLimit : undefined,
        commissionRate: data.commissionRate !== undefined ? data.commissionRate : undefined,
        features: data.featureIds ? {
          set: data.featureIds.map(id => ({ id }))
        } : undefined
      },
      include: { features: true }
    });
  }

  async deletePlan(id: string) {
    await this.getPlanById(id);
    return this.prisma.subscriptionPlan.delete({ where: { id } });
  }
}
