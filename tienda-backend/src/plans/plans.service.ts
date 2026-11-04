import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PlansService {
  constructor(private prisma: PrismaService) {}

  async getAllPlans(standardOnly?: boolean) {
    return this.prisma.subscriptionPlan.findMany({
      where: standardOnly ? { isStandard: true } : undefined,
      orderBy: [
        { isStandard: 'desc' },
        { price: 'asc' },
      ],
    });
  }

  async getPlanById(id: string) {
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { id },
    });
    if (!plan) throw new NotFoundException('Plan no encontrado');
    return plan;
  }

  async createPlan(data: {
    name: string;
    description?: string;
    price?: number;
    skuLimit?: number;
    commissionRate?: number;
    isStandard?: boolean;
  }) {
    return this.prisma.subscriptionPlan.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price || 0,
        skuLimit: data.skuLimit !== undefined ? data.skuLimit : -1,
        commissionRate: data.commissionRate || 0,
        isStandard: data.isStandard !== undefined ? Boolean(data.isStandard) : true,
      },
    });
  }

  async updatePlan(
    id: string,
    data: {
      name?: string;
      description?: string;
      price?: number;
      skuLimit?: number;
      commissionRate?: number;
      isStandard?: boolean;
    },
  ) {
    await this.getPlanById(id);
    return this.prisma.subscriptionPlan.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        price: data.price !== undefined ? data.price : undefined,
        skuLimit: data.skuLimit !== undefined ? data.skuLimit : undefined,
        commissionRate: data.commissionRate !== undefined ? data.commissionRate : undefined,
        isStandard: data.isStandard !== undefined ? Boolean(data.isStandard) : undefined,
      },
    });
  }

  async deletePlan(id: string) {
    await this.getPlanById(id);
    return this.prisma.subscriptionPlan.delete({ where: { id } });
  }
}

