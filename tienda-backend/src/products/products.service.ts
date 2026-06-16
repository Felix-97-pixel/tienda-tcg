import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { randomUUID } from 'crypto';
import { MagicService } from '../sync/magic.service';
import { SyncService } from '../sync/sync.service';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private uploadService: UploadService,
    private magicService: MagicService,
    private syncService: SyncService
  ) { }

  async create(createProductDto: CreateProductDto) {
    const { price, stock, ...productData } = createProductDto;

    const [defaultCond, defaultLang] = await Promise.all([
      this.prisma.condition.findFirst({ where: { name: 'near_mint' } }),
      this.prisma.language.findFirst({ where: { code: 'en' } })
    ]);

    return this.prisma.product.create({
      data: {
        ...productData,
        externalId: productData.externalId || `manual-${Date.now()}-${randomUUID()}`,
        marketPrices: {
          create: {
            price: price || 0
          }
        }
      },
    });
  }

  /**
   * Crea un producto de forma manual utilizando exclusivamente los metadatos provistos en el CSV o formulario.
   * Este método es completamente reutilizable en cualquier otra parte de la aplicación.
   */
  async createProductManually(itemData: any, categoryId: string) {
    const manualExternalId = itemData.scryfallId || `manual-${Date.now()}-${randomUUID()}`;
    return this.prisma.product.create({
      data: {
        externalId: manualExternalId,
        name: itemData.name,
        categoryId: categoryId,
        cardDetail: {
          create: {
            expansion: itemData.expansion || 'Unknown Set',
            rarity: itemData.rarity || 'Common',
            collectorNum: itemData.collectorNum || '',
            gameRel: { connect: { slug: 'magic' } },
            attributes: []
          }
        }
      },
      include: { items: true, cardDetail: true }
    });
  }

  async bulkUpload(categoryId: string, items: any[], userId: string) {
    const store = await this.prisma.store.findUnique({ where: { ownerId: userId } });
    const storeId = store?.id;
    const results = { added: 0, updated: 0, errors: [] as { index: number, error: string }[] };

    const category = await this.prisma.category.findUnique({ where: { id: categoryId } });
    const provider = category ? await this.syncService.getProviderForCategory(category.name) : null;

    // Pre-cargar idiomas, condiciones, acabados y devaluaciones
    const [languages, conditions, finishes, devaluations] = await Promise.all([
      this.prisma.language.findMany(),
      this.prisma.condition.findMany(),
      this.prisma.finish.findMany(), // Traemos todos o podríamos filtrar por juego si lo tuviéramos
      storeId ? this.prisma.storeConditionDevaluation.findMany({ where: { storeId } }) : Promise.resolve([])
    ]);

    const langMap = new Map(languages.map(l => [l.code, l.id]));
    const condMap = new Map(conditions.map(c => [c.name, c.id]));
    const devalMap = new Map(devaluations.map(d => [d.conditionId, Number(d.multiplier)]));
    const defaultLang = languages.find(l => l.code === 'en')?.id || languages[0]?.id;
    const defaultCond = conditions.find(c => c.name === 'near_mint')?.id || conditions[0]?.id;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      try {
        let product = null;

        if (provider) {
          const result = await provider.findProductForBulkUpload(item, categoryId);
          product = result.product;
        } else {
          // Búsqueda genérica en DB si no hay provider (ej. Carpetas, Accesorios)
          product = await this.prisma.product.findFirst({
            where: {
              categoryId: categoryId,
              name: item.name,
              ...(item.expansion ? { cardDetail: { expansion: item.expansion } } : {})
            },
            include: { items: true, cardDetail: true, marketPrices: true }
          });
        }

        if (product) {
          const conditionId = condMap.get(item.condition || "") || defaultCond;
          const languageId = langMap.get(item.language || "") || defaultLang;

          const csvFinish = (item.finish || "").toLowerCase().trim();
          const matchedFinish = finishes.find(f =>
            f.name.toLowerCase() === csvFinish || f.aliases.includes(csvFinish)
          );
          const finishId = item.finishId || matchedFinish?.id || null;

          const existingItem = product.items?.find((i: any) =>
            i.conditionId === conditionId &&
            i.languageId === languageId &&
            i.finishId === finishId &&
            i.storeId === storeId
          );

          if (storeId) {
            // Calcular devaluación si el precio es 0 o indefinido
            let finalPrice = item.price;
            if (!finalPrice) {
              const marketPriceObj = product.marketPrices?.find((mp: any) => mp.finishId === finishId) || product.marketPrices?.[0];
              const basePrice = marketPriceObj ? Number(marketPriceObj.price) : 0;
              const multiplier = devalMap.get(conditionId) || 1.0;
              finalPrice = basePrice * multiplier;
            }

            if (existingItem) {
              await this.prisma.inventoryItem.update({
                where: { id: existingItem.id },
                data: {
                  stock: existingItem.stock + item.quantity,
                  price: finalPrice !== undefined ? finalPrice : existingItem.price
                }
              });
            } else {
              await this.prisma.inventoryItem.create({
                data: {
                  storeId: storeId,
                  productId: product.id,
                  price: finalPrice || 0,
                  stock: item.quantity,
                  conditionId: conditionId,
                  languageId: languageId,
                  finishId: finishId || undefined
                }
              });
            }
          }
          results.updated++;
        } else {
          results.errors.push({
            index: item.originalIndex !== undefined ? item.originalIndex : i,
            error: `No se encontró en el catálogo maestro la carta '${item.name}' de la edición '${item.expansion}'.`
          });
        }
      } catch (err: any) {
        results.errors.push({
          index: item.originalIndex !== undefined ? item.originalIndex : i,
          error: `Error al procesar la carta '${item.name}': ${err.message}`
        });
      }
    }
    return results;
  }

  async bulkCreateGlobal(items: any[]) {
    const results = { created: 0, errors: [] as { index: number, error: string }[] };

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      try {
        let finalImageUrl = null;
        let finalBrandId = null;

        if (!item['Categoria']) {
          throw new BadRequestException('Falta la columna Categoria');
        }

        const catName = String(item['Categoria']).trim();
        const category = await this.prisma.category.findFirst({
          where: { name: { equals: catName, mode: 'insensitive' } }
        });

        if (!category) {
          throw new BadRequestException(`La categoría '${catName}' no existe.`);
        }

        if (item['Marca']) {
          const brandName = String(item['Marca']).trim();
          let brand = await this.prisma.brand.findFirst({
            where: { name: { equals: brandName, mode: 'insensitive' } }
          });
          if (!brand) {
            brand = await this.prisma.brand.create({
              data: { name: brandName }
            });
          }
          finalBrandId = brand.id;
        }

        await this.prisma.product.create({
          data: {
            name: item['Nombre'],
            description: item['Descripcion'] || '',
            imageUrl: finalImageUrl,
            categoryId: category.id,
            brandId: finalBrandId,
            externalId: `global-bulk-${Date.now()}-${randomUUID()}`,
          }
        });
        results.created++;
      } catch (err: any) {
        results.errors.push({
          index: item.originalIndex !== undefined ? item.originalIndex : i,
          error: `Error al procesar el producto '${item['Nombre']}': ${err.message}`
        });
      }
    }
    return results;
  }

  async getAdminCategories(isTcg: boolean = false) {
    let whereClause: any = undefined;
    if (isTcg) {
      whereClause = { isTcg: false };
    }

    return this.prisma.category.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        slug: true,
        imageUrl: true,
        isTcg: true,
      }
    });
  }

  async bulkUpdateStock(items: { id: string, stock: number, originalIndex?: number }[], userId: string) {
    const store = await this.prisma.store.findUnique({ where: { ownerId: userId } });
    const storeId = store?.id;
    const results = { updated: 0, errors: [] as { index: number, error: string }[] };

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      try {
        const product = await this.prisma.product.findUnique({
          where: { id: item.id },
          include: { items: true }
        });

        // Encontrar el item existente de ESTA tienda
        const storeItem = storeId ? product?.items.find(i => i.storeId === storeId) : null;

        if (storeId) {
          if (storeItem) {
            await this.prisma.inventoryItem.update({
              where: { id: storeItem.id },
              data: { stock: storeItem.stock + item.stock }
            });
            results.updated++;
          } else if (product) {
            const defaultLang = await this.prisma.language.findFirst({ where: { code: 'en' } });
            const defaultCond = await this.prisma.condition.findFirst({ where: { name: 'near_mint' } });

            await this.prisma.inventoryItem.create({
              data: {
                storeId: storeId,
                productId: product.id,
                price: 0,
                stock: item.stock,
                conditionId: defaultCond?.id || "",
                languageId: defaultLang?.id || ""
              }
            });
            results.updated++;
          } else {
            results.errors.push({
              index: item.originalIndex !== undefined ? item.originalIndex : i,
              error: `No se encontró el producto con ID: ${item.id}`
            });
          }
        } else {
          results.errors.push({
            index: item.originalIndex !== undefined ? item.originalIndex : i,
            error: `Operación de inventario inválida sin tienda asignada.`
          });
        }
      } catch (err: any) {
        results.errors.push({
          index: item.originalIndex !== undefined ? item.originalIndex : i,
          error: `Error con producto ${item.id}: ${err.message}`
        });
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

  async getCategories(storeId?: string, isTcg: boolean = false) {
    const whereClause: any = storeId ? { products: { some: { items: { some: { storeId } } } } } : {};

    if (isTcg) {
      whereClause.isTcg = false;
    }

    const categories = await this.prisma.category.findMany({
      where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
      select: {
        id: true,
        name: true,
        slug: true,
        imageUrl: true,
        isTcg: true,
        _count: {
          select: { products: true }
        }
      }
    });

    return categories.map(c => ({
      ...c,
      productsCount: c._count.products
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


  async getStoreIdByUserId(userId: string) {
    const store = await this.prisma.store.findUnique({
      where: { ownerId: userId },
      select: { id: true }
    });
    return store?.id;
  }

  async getGames() {
    return this.prisma.game.findMany({
      orderBy: { name: 'asc' }
    });
  }

  async getExpansions(categoryName?: string, storeId?: string) {
    const where: any = {};
    if (categoryName || storeId) {
      where.product = {};
      if (categoryName) where.product.category = { name: categoryName };
      if (storeId) where.product.items = { some: { storeId } };
    }

    const cardDetails = await this.prisma.cardDetail.groupBy({
      by: ['expansion'],
      where: Object.keys(where).length > 0 ? where : undefined,
      _count: {
        expansion: true
      }
    });

    return cardDetails.map(c => ({
      name: c.expansion,
      products: c._count.expansion
    }));
  }

  async getAttributes(categoryName?: string, expansionName?: string, storeId?: string) {
    const where: any = {};
    if (categoryName || storeId) {
      where.product = {};
      if (categoryName) where.product.category = { name: categoryName };
      if (storeId) where.product.items = { some: { storeId } };
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

  async findAll(page: number = 1, limit: number = 50, categoryName?: string, expansionName?: string, attributeValue?: string, searchName?: string, storeId?: string) {
    const skip = (page - 1) * limit;

    const whereClause: any = { isDeleted: false };

    if (searchName) {
      whereClause.name = { contains: searchName, mode: 'insensitive' };
    }

    if (categoryName) {
      whereClause.category = { name: categoryName };
    }

    if (storeId) {
      whereClause.items = { some: { storeId } };
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
          marketPrices: {
            include: { finish: true }
          },
          items: {
            include: {
              language: true,
              condition: true,
              finish: true
            }
          },
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
        marketPrices: {
          include: { finish: true }
        },
        items: {
          include: {
            condition: true,
            language: true,
            finish: true
          }
        },
      },
    });
  }

  // CAMBIO CLAVE: 'id' ahora es 'string'
  async update(id: string, updateProductDto: UpdateProductDto) {
    const { price, stock, ...productData } = updateProductDto;

    // Actualizar datos del producto
    const updatedProduct = await this.prisma.product.update({
      where: { id },
      data: productData,
      include: { items: true }
    });

    // Si se enviaron precio o stock, actualizar el primer ítem de inventario (para productos estándar)
    if ((price !== undefined || stock !== undefined) && updatedProduct.items.length > 0) {
      await this.prisma.inventoryItem.update({
        where: { id: updatedProduct.items[0].id },
        data: {
          ...(price !== undefined && { price }),
          ...(stock !== undefined && { stock }),
        }
      });
    }

    return this.findOne(id);
  }

  async remove(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true }
    });
    if (!product) throw new Error("Producto no encontrado");

    if (product.imageUrl) {
      try {
        await this.uploadService.deleteImage(product.imageUrl);
      } catch (e) {
        console.error("Error deleting image from Cloudinary:", e);
      }
    }

    // Borrado Lógico
    await this.prisma.product.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        imageUrl: null
      }
    });

    return { message: "Producto eliminado (Soft Delete)" };
  }

  async updateInventoryItem(itemId: string, data: { price?: number; stock?: number }) {
    return this.prisma.inventoryItem.update({
      where: { id: itemId },
      data
    });
  }

  async removeInventoryItem(id: string) {
    // Verificar si es el último item de un producto no TCG para evitar dejarlo sin stock
    const item = await this.prisma.inventoryItem.findUnique({
      where: { id },
      include: { product: { include: { category: true, _count: { select: { items: true } } } } }
    });

    if (item?.product.category.isTcg === false && item.product._count.items <= 1) {
      throw new BadRequestException("No se puede eliminar el único ítem de un producto estándar.");
    }

    return this.prisma.inventoryItem.delete({
      where: { id }
    });
  }

  async getLanguages() {
    return this.prisma.language.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async getConditions() {
    return this.prisma.condition.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async getFinishes(game?: string) {
    if (!game) {
      return this.prisma.finish.findMany({ orderBy: { name: 'asc' } });
    }

    // 1. Obtener todos los nombres de juegos base desde la tabla Finish ("Magic", "Pokemon", etc.)
    const availableGames = await this.prisma.finish.findMany({
      select: { gameId: true, gameRel: { select: { slug: true, name: true } } },
      distinct: ['gameId']
    });

    // 2. Buscar dinámicamente cuál de los juegos base está contenido en el parámetro recibido
    let targetGameId: string | undefined;
    const lowerInput = game.toLowerCase();

    for (const record of availableGames) {
      if (!record.gameRel) continue;
      const lowerBaseGame = record.gameRel.name.toLowerCase();
      // Verificamos si el string recibido (ej. "Singles Magic The Gathering") contiene el nombre de la BD ("Magic")
      if (lowerInput.indexOf(lowerBaseGame) !== -1) {
        targetGameId = record.gameId;
        break;
      }
    }

    // 3. Consultar la base de datos usando el nombre real encontrado
    if (!targetGameId) return [];

    return this.prisma.finish.findMany({
      where: { gameId: targetGameId },
      orderBy: { name: 'asc' },
    });
  }

  async addInventoryItem(productId: string, data: any, userId: string | null = null) {
    const { languageId, conditionId, price, stock, finishId } = data;

    let storeId: string | null = null;
    if (userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { store: true }
      });
      if (user?.email !== 'f.pinto.97@gmail.com' && user?.store) {
        storeId = user.store.id;
      }
    }

    const exists = await this.prisma.inventoryItem.findFirst({
      where: {
        productId,
        languageId,
        conditionId,
        finishId: finishId || null,
        storeId
      }
    });

    if (exists) {
      throw new BadRequestException("Esta combinación de idioma, condición y versión ya existe para este producto en esta tienda.");
    }

    let finalPrice = Number(price) || 0;

    // Si la tienda está agregando (storeId != null) y el precio es 0, intentar heredar del maestro
    if (storeId && finalPrice === 0) {
      const masterPrice = await this.prisma.marketPrice.findFirst({
        where: {
          productId,
          finishId: finishId || null
        }
      });
      if (masterPrice && Number(masterPrice.price) > 0) {
        finalPrice = Number(masterPrice.price);
      }
    }

    return this.prisma.inventoryItem.create({
      data: {
        storeId,
        productId,
        languageId,
        conditionId,
        price: finalPrice,
        stock: Number(stock) || 0,
        finishId: finishId || undefined
      }
    });
  }


}