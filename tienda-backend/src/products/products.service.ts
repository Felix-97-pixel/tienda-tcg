import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) { }

  async create(createProductDto: CreateProductDto) {
    const { price, stock, ...productData } = createProductDto;
    
    return this.prisma.product.create({
      data: {
        ...productData,
        externalId: productData.externalId || `manual-${Date.now()}-${randomUUID()}`,
        items: {
          create: {
            price: price || 0,
            stock: stock || 0,
            condition: "New",
            isFoil: false
          }
        }
      },
    });
  }

  async getAdminCategories() {
    return this.prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        imageUrl: true,
      }
    });
  }

  async createCategory(data: { name: string; slug: string; imageUrl?: string }) {
    return this.prisma.category.create({
      data
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
      id: c.id,
      name: c.name,
      imageUrl: c.imageUrl,
      products: c._count.products
    }));
  }

  async updateCategory(id: string, updateData: { imageUrl?: string; name?: string; slug?: string }) {
    return this.prisma.category.update({
      where: { id },
      data: updateData
    });
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

  async getAttributes(categoryName?: string, expansionName?: string) {
    const where: any = {};
    if (categoryName) {
      where.product = { category: { name: categoryName } };
    }
    if (expansionName) {
      where.expansion = expansionName;
    }

    const cardDetails = await this.prisma.cardDetail.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
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

  async findAll(page: number = 1, limit: number = 50, categoryName?: string, expansionName?: string, attributeValue?: string, searchName?: string) {
    const skip = (page - 1) * limit;

    // Build where clause
    const whereClause: any = {};
    
    if (searchName) {
      whereClause.name = {
        contains: searchName,
        mode: 'insensitive'
      };
    }

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

  async updateInventoryItem(itemId: string, data: { price?: number; stock?: number }) {
    return this.prisma.inventoryItem.update({
      where: { id: itemId },
      data
    });
  }
}