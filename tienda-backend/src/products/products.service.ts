import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private uploadService: UploadService
  ) { }

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

  async bulkUpload(categoryId: string, items: any[]) {
    const category = await this.prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) throw new Error("Category not found");

    if (category.name !== "Singles Magic The Gathering") {
      throw new Error("La carga masiva actualmente solo está soportada para Singles Magic The Gathering.");
    }

    const results = { added: 0, updated: 0, errors: [] as string[] };

    for (const item of items) {
      try {
        let product;
        if (item.scryfallId) {
          product = await this.prisma.product.findUnique({
            where: { externalId: item.scryfallId },
            include: { items: true, cardDetail: true }
          });
        }
        
        if (!product) {
          const products = await this.prisma.product.findMany({
            where: {
              categoryId: categoryId,
              name: item.name,
              cardDetail: {
                expansion: item.expansion,
                rarity: item.rarity,
                collectorNum: item.collectorNum
              }
            },
            include: { items: true, cardDetail: true }
          });
          if (products.length > 0) {
            product = products[0];
          }
        }

        if (product) {
          if (product.items && product.items.length > 0) {
            await this.prisma.inventoryItem.update({
              where: { id: product.items[0].id },
              data: {
                stock: product.items[0].stock + item.quantity
              }
            });
          } else {
            await this.prisma.inventoryItem.create({
              data: {
                productId: product.id,
                price: item.price || 0,
                stock: item.quantity,
                condition: "New",
                isFoil: false
              }
            });
          }
          results.updated++;
        } else {
          results.errors.push(`No se encontró la carta '${item.name}' de la edición '${item.expansion}'. Asegúrate de sincronizar la edición primero.`);
        }
      } catch (err: any) {
        results.errors.push(`Error with item ${item.name}: ${err.message}`);
      }
    }
    return results;
  }

  async getAdminCategories() {
    return this.prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        imageUrl: true,
        isTcg: true,
      }
    });
  }

  async bulkUpdateStock(items: { id: string, stock: number }[]) {
    const results = { updated: 0, errors: [] as string[] };

    for (const item of items) {
      try {
        const product = await this.prisma.product.findUnique({
          where: { id: item.id },
          include: { items: true }
        });

        if (product && product.items.length > 0) {
          await this.prisma.inventoryItem.update({
            where: { id: product.items[0].id },
            data: { stock: product.items[0].stock + item.stock }
          });
          results.updated++;
        } else if (product && product.items.length === 0) {
          await this.prisma.inventoryItem.create({
            data: {
              productId: product.id,
              price: 0,
              stock: item.stock,
              condition: "New",
              isFoil: false
            }
          });
          results.updated++;
        } else {
          results.errors.push(`No se encontró el producto con ID: ${item.id}`);
        }
      } catch (err: any) {
        results.errors.push(`Error con producto ${item.id}: ${err.message}`);
      }
    }

    return results;
  }

  async createCategory(data: { name: string; slug: string; imageUrl?: string; isTcg?: boolean }) {
    return this.prisma.category.create({
      data: {
        name: data.name,
        slug: data.slug,
        imageUrl: data.imageUrl,
        isTcg: data.isTcg || false,
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
      id: c.id,
      name: c.name,
      imageUrl: c.imageUrl,
      isTcg: c.isTcg,
      products: c._count.products
    }));
  }

  async updateCategory(id: string, updateData: { imageUrl?: string; name?: string; slug?: string; isTcg?: boolean }) {
    return this.prisma.category.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteCategory(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } }
    });
    if (!category) throw new Error("Category not found");
    if (category._count.products > 0) throw new Error("Cannot delete category with products");

    if (category.imageUrl) {
      await this.uploadService.deleteImage(category.imageUrl);
    }

    return this.prisma.category.delete({
      where: { id }
    });
  }

  async createBrand(data: { name: string; imageUrl?: string }) {
    return this.prisma.brand.create({
      data,
    });
  }

  async getBrands() {
    return this.prisma.brand.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      }
    });
  }

  async updateBrand(id: string, updateData: { name?: string; imageUrl?: string }) {
    return this.prisma.brand.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteBrand(id: string) {
    const brand = await this.prisma.brand.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } }
    });
    if (!brand) throw new Error("Brand not found");
    if (brand._count.products > 0) throw new Error("Cannot delete brand with products");

    if (brand.imageUrl) {
      await this.uploadService.deleteImage(brand.imageUrl);
    }

    return this.prisma.brand.delete({
      where: { id }
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
          brand: true,
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
        brand: true,
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
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true }
    });
    if (!product) throw new Error("Producto no encontrado");
    if (product.category.isTcg) throw new Error("No se pueden eliminar cartas sueltas (TCG)");

    if (product.imageUrl) {
      await this.uploadService.deleteImage(product.imageUrl);
    }

    // Borramos dependencias primero
    await this.prisma.inventoryItem.deleteMany({
      where: { productId: id }
    });
    await this.prisma.wishlistItem.deleteMany({
      where: { productId: id }
    });
    await this.prisma.cardDetail.deleteMany({
      where: { productId: id }
    });

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