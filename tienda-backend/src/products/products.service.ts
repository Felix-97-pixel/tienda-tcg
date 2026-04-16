import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) { }

  async create(createProductDto: CreateProductDto) {
    return this.prisma.product.create({
      data: {
        ...createProductDto,
        // Si el DTO no trae externalId, generamos uno seguro usando randomUUID nativo
        externalId: createProductDto.externalId || `manual-${Date.now()}-${randomUUID()}`,
        // Asegúrate de que las relaciones (category) también estén bien mapeadas
      },
    });
  }

  async getCategories() {
    const categories = await this.prisma.category.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      }
    });
    return categories.map(c => ({
      name: c.name,
      products: c._count.products
    }));
  }

  async getExpansions(categoryName?: string) {
    const cardDetails = await this.prisma.cardDetail.groupBy({
      by: ['expansion'],
      where: categoryName ? {
        product: {
          category: {
            name: categoryName
          }
        }
      } : undefined,
      _count: {
        expansion: true
      }
    });

    return cardDetails.map(c => ({
      name: c.expansion,
      products: c._count.expansion
    }));
  }

  async getAttributes(categoryName?: string) {
    const cardDetails = await this.prisma.cardDetail.findMany({
      where: categoryName ? {
        product: { category: { name: categoryName } }
      } : undefined,
      select: { attributes: true }
    });

    const counts = new Map<string, number>();

    cardDetails.forEach((c: any) => {
      // Si la carta no tiene atributos, la consideramos "Incolora"
      if (!c.attributes || c.attributes.length === 0) {
        counts.set("Incolora", (counts.get("Incolora") || 0) + 1);
      } else {
        c.attributes.forEach((attr) => {
          counts.set(attr, (counts.get(attr) || 0) + 1);
        });
      }
    });

    return Array.from(counts.entries()).map(([name, products]) => ({ name, products }));
  }

  async findAll(page: number = 1, limit: number = 50, categoryName?: string, expansionName?: string, attributeValue?: string) {
    const skip = (page - 1) * limit;

    // Build where clause
    const whereClause: any = {};
    if (categoryName) {
      whereClause.category = {
        name: categoryName
      };
    }
    if (expansionName || attributeValue) {
      whereClause.cardDetail = { is: {} };
      if (expansionName) {
        whereClause.cardDetail.is.expansion = expansionName;
      }
      if (attributeValue) {
        if (attributeValue === "Incolora") {
          whereClause.cardDetail.is.attributes = { equals: [] };
        } else {
          whereClause.cardDetail.is.attributes = { has: attributeValue };
        }
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where: whereClause,
        skip,
        take: limit,
        include: {
          category: true,
          cardDetail: true,
          items: true,
        },
      }),
      this.prisma.product.count({ where: whereClause })
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  // CAMBIO CLAVE: 'id' ahora es 'string' para aceptar UUIDs
  async findOne(id: string) {
    return this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        cardDetail: true,
        items: true,
      },
    });
  }

  // CAMBIO CLAVE: 'id' ahora es 'string'
  async update(id: string, updateProductDto: UpdateProductDto) {
    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
    });
  }

  // CAMBIO CLAVE: 'id' ahora es 'string'
  async remove(id: string) {
    return this.prisma.product.delete({
      where: { id },
    });
  }
}