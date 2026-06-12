import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { randomUUID } from 'crypto';
import { MagicService } from '../sync/magic.service';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private uploadService: UploadService,
    private magicService: MagicService
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
        items: {
          create: {
            price: price || 0,
            stock: stock || 0,
            conditionId: defaultCond?.id || "",
            languageId: defaultLang?.id || ""
          }
        }
      },
    });
  }

  /**
   * Crea un producto y su CardDetail correspondiente usando la información oficial obtenida de Scryfall.
   * Este método es completamente reutilizable en cualquier otra parte de la aplicación.
   */
  async createProductFromScryfallCard(scryfallCard: any, categoryId: string, itemData?: any) {
    const attrs: string[] = scryfallCard.colors || scryfallCard.card_faces?.[0]?.colors || [];
    if (scryfallCard.oracle_text?.includes('{E}')) attrs.push('Energy');
    if (scryfallCard.oracle_text?.toLowerCase().includes('devotion')) attrs.push('Devotion');

    return this.prisma.product.create({
      data: {
        externalId: scryfallCard.id,
        name: scryfallCard.name,
        description: scryfallCard.oracle_text || null,
        imageUrl: scryfallCard.image_uris?.normal || scryfallCard.card_faces?.[0]?.image_uris?.normal || '',
        categoryId: categoryId,
        cardDetail: {
          create: {
            expansion: scryfallCard.set_name || itemData?.expansion || 'Unknown Set',
            rarity: scryfallCard.rarity || itemData?.rarity || 'Common',
            collectorNum: scryfallCard.collector_number || itemData?.collectorNum || '',
            game: 'Magic',
            attributes: attrs
          }
        }
      },
      include: { items: true, cardDetail: true }
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
            game: 'Magic',
            attributes: []
          }
        }
      },
      include: { items: true, cardDetail: true }
    });
  }

  async bulkUpload(categoryId: string, items: any[]) {
    const category = await this.prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) throw new Error("Category not found");

    if (category.name !== "Singles Magic The Gathering") {
      throw new Error("La carga masiva actualmente solo está soportada para Singles Magic The Gathering.");
    }

    const results = { added: 0, updated: 0, errors: [] as { index: number, error: string }[] };

    // Pre-cargar idiomas, condiciones y acabados (finishes) para evitar consultas repetitivas
    const [languages, conditions, finishes] = await Promise.all([
      this.prisma.language.findMany(),
      this.prisma.condition.findMany(),
      this.prisma.finish.findMany({ where: { game: 'Magic' } })
    ]);

    const langMap = new Map(languages.map(l => [l.code, l.id]));
    const condMap = new Map(conditions.map(c => [c.name, c.id]));
    const defaultLang = languages.find(l => l.code === 'es')?.id || languages[0]?.id;
    const defaultCond = conditions.find(c => c.name === 'near_mint')?.id || conditions[0]?.id;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
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

        // Si la carta aún no existe, la insertamos dinámicamente usando las funciones modulares
        if (!product) {
          if (item.scryfallId) {
            try {
              const scryfallCard = await this.magicService.fetchCardById(item.scryfallId);
              if (scryfallCard) {
                product = await this.createProductFromScryfallCard(scryfallCard, categoryId, item);
                results.added++;
              }
            } catch (fetchErr: any) {
              // Fallback a creación manual con los datos provistos en el CSV
              product = await this.createProductManually(item, categoryId);
              results.added++;
            }
          } else {
            // Creación manual directa si no hay scryfallId
            product = await this.createProductManually(item, categoryId);
            results.added++;
          }
        }

        if (product) {
          const conditionId = condMap.get(item.condition || "") || defaultCond;
          const languageId = langMap.get(item.language || "") || defaultLang;

          // Resolver el finish correcto usando alias desde la BD (Data-Driven)
          const csvFinish = (item.finish || "").toLowerCase().trim();
          const matchedFinish = finishes.find(f =>
            f.name.toLowerCase() === csvFinish || f.aliases.includes(csvFinish)
          );
          const finishId = item.finishId || matchedFinish?.id || null;

          const existingItem = product.items.find(i =>
            i.conditionId === conditionId &&
            i.languageId === languageId &&
            i.finishId === finishId
          );

          if (existingItem) {
            await this.prisma.inventoryItem.update({
              where: { id: existingItem.id },
              data: {
                stock: existingItem.stock + item.quantity,
                price: item.price !== undefined ? item.price : existingItem.price
              }
            });
          } else {
            await this.prisma.inventoryItem.create({
              data: {
                productId: product.id,
                price: item.price || 0,
                stock: item.quantity,
                conditionId: conditionId,
                languageId: languageId,
                finishId: finishId || undefined
              }
            });
          }
          results.updated++;
        } else {
          results.errors.push({
            index: item.originalIndex !== undefined ? item.originalIndex : i,
            error: `No se pudo encontrar ni crear la carta '${item.name}' de la edición '${item.expansion}'.`
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

  async bulkUpdateStock(items: { id: string, stock: number, originalIndex?: number }[]) {
    const results = { updated: 0, errors: [] as { index: number, error: string }[] };

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
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
          const defaultLang = await this.prisma.language.findFirst({ where: { code: 'en' } });
          const defaultCond = await this.prisma.condition.findFirst({ where: { name: 'near_mint' } });

          await this.prisma.inventoryItem.create({
            data: {
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

  async getCategories(storeId?: string) {
    const whereClause = storeId ? { items: { some: { storeId } } } : undefined;
    
    const categories = await this.prisma.category.findMany({
      where: storeId ? { products: { some: whereClause } } : undefined,
      include: {
        _count: {
          select: { products: { where: whereClause } }
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

  async findAll(page: number = 1, limit: number = 50, categoryName?: string, expansionName?: string, attributeValue?: string, searchName?: string, storeId?: string) {
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

    if (storeId) {
      // Filtrar productos que tengan inventario (items) en este storeId
      whereClause.items = {
        some: {
          storeId: storeId
        }
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
      select: { game: true },
      distinct: ['game']
    });

    // 2. Buscar dinámicamente cuál de los juegos base está contenido en el parámetro recibido
    let targetGame = game;
    const lowerInput = game.toLowerCase();

    for (const record of availableGames) {
      const lowerBaseGame = record.game.toLowerCase();
      // Verificamos si el string recibido (ej. "Singles Magic The Gathering") contiene el nombre de la BD ("Magic")
      if (lowerInput.indexOf(lowerBaseGame) !== -1) {
        targetGame = record.game;
        break;
      }
    }

    // 3. Consultar la base de datos usando el nombre real encontrado
    return this.prisma.finish.findMany({
      where: { game: { equals: targetGame, mode: 'insensitive' as any } },
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
      const masterItem = await this.prisma.inventoryItem.findFirst({
        where: {
          productId,
          finishId: finishId || null,
          storeId: null
        }
      });
      if (masterItem && Number(masterItem.price) > 0) {
        finalPrice = Number(masterItem.price);
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

  async getGlobalProducts(search?: string) {
    const where: any = { storeId: null };
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }
    return this.prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { category: true, cardDetail: true }
    });
  }
}