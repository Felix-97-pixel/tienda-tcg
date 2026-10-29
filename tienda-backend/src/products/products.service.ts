import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
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

    const externalId = productData.externalId || `manual-${Date.now()}-${randomUUID()}`;
    const baseSlug = productData.name.toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-');
    const shortId = externalId.split('-')[0].substring(0, 8);
    const finalSlug = `${baseSlug}-${shortId}`;

    return this.prisma.product.create({
      data: {
        ...productData,
        externalId: externalId,
        slug: finalSlug,
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

  async bulkPublishStoreInventory(userId: string) {
    const store = await this.prisma.store.findUnique({
      where: { ownerId: userId },
      include: { subscriptionPlans: true, settings: true }
    });
    if (!store) throw new BadRequestException('Tienda no encontrada.');

    const mpSettingsCount = store.settings.filter(s => ['MP_ACCESS_TOKEN', 'MP_USER_ID'].includes(s.key)).length;
    if (mpSettingsCount < 2) {
      throw new BadRequestException('Debes vincular tu cuenta de Mercado Pago antes de poder vender.');
    }

    const skuLimit = store.subscriptionPlans?.[0]?.skuLimit ?? -1;
    if (skuLimit !== -1) {
      // Si el plan tiene límite, no pueden publicar todo a lo loco si ya excedieron el límite.
      // (En realidad, el límite es sobre el total de cartas, publicadas o no, así que publicar no cuesta extra de límite.
      // Ya están creadas en la base de datos).
    }

    const res = await this.prisma.inventoryItem.updateMany({
      where: { storeId: store.id, isPublished: false },
      data: { isPublished: true }
    });

    return { published: res.count };
  }

  async bulkUpload(categoryId: string, items: any[], userId: string, applyDevaluations: boolean = true) {
    const store = await this.prisma.store.findUnique({ where: { ownerId: userId }, include: { subscriptionPlans: true, settings: true } });
    const storeId = store?.id;
    const results = { added: 0, updated: 0, devaluedCount: 0, errors: [] as { index: number, error: string }[] };

    if (store) {
      const mpSettingsCount = store.settings.filter(s => ['MP_ACCESS_TOKEN', 'MP_USER_ID'].includes(s.key)).length;
      if (mpSettingsCount < 2) {
        throw new BadRequestException('Debes vincular tu cuenta de Mercado Pago antes de poder vender.');
      }
    }

    let skuLimit = -1;
    let currentCount = 0;
    if (store && store.subscriptionPlans && store.subscriptionPlans.length > 0) {
      skuLimit = store.subscriptionPlans[0].skuLimit;
      if (skuLimit !== -1) {
        currentCount = await this.prisma.inventoryItem.count({ where: { storeId: store.id } });
      }
    }

    const category = await this.prisma.category.findUnique({ where: { id: categoryId } });
    const provider = category ? await this.syncService.getProviderForCategory(category.name) : null;

    // Pre-cargar idiomas, condiciones, acabados y reglas de devaluación (estado e idioma)
    const [languages, conditions, finishes, conditionDevals, languageDevals] = await Promise.all([
      this.prisma.language.findMany(),
      this.prisma.condition.findMany(),
      this.prisma.finish.findMany(),
      storeId ? this.prisma.storeConditionDevaluation.findMany({ where: { storeId } }) : Promise.resolve([]),
      storeId ? this.prisma.storeLanguageDevaluation.findMany({ where: { storeId } }) : Promise.resolve([]),
    ]);

    const defaultLang = languages.find(l => l.code === 'en')?.id || languages[0]?.id;
    const defaultCond = conditions.find(c => c.name === 'near_mint')?.id || conditions[0]?.id;

    // Mapas de devaluación indexados por (id_gameId) y fallback por (id)
    const condDevalByGame = new Map<string, number>();
    const condDevalFallback = new Map<string, number>();
    for (const d of conditionDevals) {
      const mult = Number(d.multiplier);
      condDevalByGame.set(`${d.conditionId}_${d.gameId}`, mult);
      if (!condDevalFallback.has(d.conditionId)) {
        condDevalFallback.set(d.conditionId, mult);
      }
    }

    const langDevalByGame = new Map<string, number>();
    const langDevalFallback = new Map<string, number>();
    for (const d of languageDevals) {
      const mult = Number(d.multiplier);
      langDevalByGame.set(`${d.languageId}_${d.gameId}`, mult);
      if (!langDevalFallback.has(d.languageId)) {
        langDevalFallback.set(d.languageId, mult);
      }
    }

    // Diccionarios de alias para normalizar valores de Excel (Manabox, Riftscan, TCGplayer, etc.)
    const conditionAliasToCanonical: Record<string, string> = {
      'nm': 'near_mint',
      'near mint': 'near_mint',
      'near_mint': 'near_mint',
      'nearmint': 'near_mint',
      'm/nm': 'near_mint',
      'nm-m': 'near_mint',
      'm': 'mint',
      'mint': 'mint',
      'mt': 'mint',
      'ex': 'excellent',
      'exc': 'excellent',
      'excellent': 'excellent',
      'lp': 'light_played',
      'light_played': 'light_played',
      'lightly_played': 'light_played',
      'lightly played': 'light_played',
      'light played': 'light_played',
      'sp': 'light_played',
      'slightly_played': 'light_played',
      'slightly played': 'light_played',
      'gd': 'good',
      'good': 'good',
      'mp': 'moderately_played',
      'moderately_played': 'moderately_played',
      'moderately played': 'moderately_played',
      'moderate played': 'moderately_played',
      'pl': 'moderately_played',
      'played': 'moderately_played',
      'hp': 'heavily_played',
      'heavily_played': 'heavily_played',
      'heavily played': 'heavily_played',
      'heavy played': 'heavily_played',
      'pr': 'poor',
      'poor': 'poor',
      'dmg': 'damaged',
      'd': 'damaged',
      'damaged': 'damaged',
      'damage': 'damaged',
    };

    const languageAliasToCode: Record<string, string> = {
      'en': 'en',
      'eng': 'en',
      'english': 'en',
      'inglés': 'en',
      'ingles': 'en',
      'es': 'es',
      'esp': 'es',
      'sp': 'es',
      'spanish': 'es',
      'español': 'es',
      'espanol': 'es',
      'ja': 'ja',
      'jp': 'ja',
      'jpn': 'ja',
      'japanese': 'ja',
      'japonés': 'ja',
      'japones': 'ja',
      'it': 'it',
      'ita': 'it',
      'italian': 'it',
      'italiano': 'it',
      'fr': 'fr',
      'fra': 'fr',
      'fre': 'fr',
      'french': 'fr',
      'francés': 'fr',
      'frances': 'fr',
      'de': 'de',
      'ger': 'de',
      'deu': 'de',
      'german': 'de',
      'alemán': 'de',
      'aleman': 'de',
      'pt': 'pt',
      'por': 'pt',
      'pt-br': 'pt',
      'pt_br': 'pt',
      'portuguese': 'pt',
      'portugués': 'pt',
      'portugues': 'pt',
      'zh_cn': 'zh_CN',
      'zh-cn': 'zh_CN',
      'zh': 'zh_CN',
      'zhs': 'zh_CN',
      'zht': 'zh_CN',
      'chs': 'zh_CN',
      'cht': 'zh_CN',
      'chinese': 'zh_CN',
      'chino': 'zh_CN',
      'simplified chinese': 'zh_CN',
      'traditional chinese': 'zh_CN',
    };

    const resolveConditionId = (rawCond?: string): string => {
      const raw = (rawCond || 'near_mint').toLowerCase().trim();
      const canonical = conditionAliasToCanonical[raw] || raw;
      const found = conditions.find(
        c =>
          c.name.toLowerCase() === canonical ||
          c.name.toLowerCase() === raw ||
          (c.displayName && c.displayName.toLowerCase() === raw),
      );
      return found?.id || defaultCond;
    };

    const resolveLanguageId = (rawLang?: string): string => {
      const raw = (rawLang || 'en').toLowerCase().trim();
      const canonicalCode = languageAliasToCode[raw] || raw;
      const found = languages.find(
        l =>
          l.code.toLowerCase() === canonicalCode.toLowerCase() ||
          l.code.toLowerCase() === raw ||
          l.name.toLowerCase() === raw,
      );
      return found?.id || defaultLang;
    };

    const resolveFinishId = (rawFinish?: string, gameId?: string | null): string | null => {
      const csvFinish = (rawFinish || 'normal').toLowerCase().trim();
      const candidatePool = gameId ? finishes.filter(f => f.gameId === gameId) : finishes;
      const poolToSearch = candidatePool.length > 0 ? candidatePool : finishes;

      const matched = poolToSearch.find(
        f =>
          f.name.toLowerCase() === csvFinish ||
          (Array.isArray(f.aliases) && f.aliases.some(a => a.toLowerCase() === csvFinish)),
      );
      if (matched) return matched.id;

      const normalFallback = poolToSearch.find(f => f.name.toLowerCase() === 'normal');
      return normalFallback?.id || null;
    };

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
          const gameId: string | undefined = product.cardDetail?.gameId || undefined;
          const conditionId = resolveConditionId(item.condition);
          const languageId = resolveLanguageId(item.language);
          const finishId = item.finishId || resolveFinishId(item.finish, gameId);

          const existingItem = product.items?.find((inv: any) =>
            inv.conditionId === conditionId &&
            inv.languageId === languageId &&
            inv.finishId === finishId &&
            inv.storeId === storeId
          );

          if (storeId) {
            // Determinar precio base: si el Excel trae precio > 0, usarlo como base; si viene en 0, tomar MarketPrice del acabado correspondiente
            const csvPrice = Number(item.price) || 0;
            let basePrice = csvPrice;
            if (basePrice <= 0) {
              const marketPriceObj =
                product.marketPrices?.find((mp: any) => mp.finishId === finishId) ||
                product.marketPrices?.find((mp: any) => !mp.finishId) ||
                product.marketPrices?.[0];
              basePrice = marketPriceObj ? Number(marketPriceObj.price) : 0;
            }

            // Aplicar reglas de devaluación de la tienda (Estado Físico * Idioma) para el juego correspondiente
            let finalPrice = basePrice;
            if (applyDevaluations && basePrice > 0) {
              const condMult =
                (gameId ? condDevalByGame.get(`${conditionId}_${gameId}`) : undefined) ??
                condDevalFallback.get(conditionId) ??
                1.0;
              const langMult =
                (gameId ? langDevalByGame.get(`${languageId}_${gameId}`) : undefined) ??
                langDevalFallback.get(languageId) ??
                1.0;

              finalPrice = Number((basePrice * condMult * langMult).toFixed(2));
              if (condMult !== 1.0 || langMult !== 1.0) {
                results.devaluedCount++;
              }
            } else {
              finalPrice = Number(basePrice.toFixed(2));
            }

            if (existingItem) {
              await this.prisma.inventoryItem.update({
                where: { id: existingItem.id },
                data: {
                  stock: existingItem.stock + item.quantity,
                  price: finalPrice > 0 ? finalPrice : existingItem.price,
                }
              });
              results.updated++;
            } else {
              if (skuLimit !== -1 && currentCount >= skuLimit) {
                results.errors.push({
                  index: item.originalIndex !== undefined ? item.originalIndex : i,
                  error: `No se pudo añadir. Has alcanzado el límite de ${skuLimit} cartas sincronizadas de tu plan. Actualiza tu suscripción para ampliar tu catálogo.`
                });
                continue;
              }
              await this.prisma.inventoryItem.create({
                data: {
                  storeId: storeId,
                  productId: product.id,
                  price: finalPrice || 0,
                  stock: item.quantity,
                  conditionId: conditionId,
                  languageId: languageId,
                  finishId: finishId || undefined,
                  isPublished: false // Las cargas masivas entran pausadas por defecto
                }
              });
              currentCount++;
              results.added++;
            }
          }
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

        const baseSlug = item['Nombre'].toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-');
        const shortId = randomUUID().substring(0, 8);
        const finalSlug = `${baseSlug}-${shortId}`;

        await this.prisma.product.create({
          data: {
            name: item['Nombre'],
            slug: finalSlug,
            description: item['Descripcion'] || '',
            imageUrl: finalImageUrl,
            categoryId: category.id,
            brandId: finalBrandId,
            externalId: `global-bulk-${Date.now()}-${shortId}`,
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

  async getAdminCategories(isTcg?: boolean) {
    let whereClause: any = undefined;
    if (isTcg !== undefined) {
      whereClause = { isTcg: isTcg };
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
      if (categoryName) {
        const normalized = categoryName.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const terms = Array.from(new Set([categoryName, normalized, categoryName.replace(/é/gi, 'e'), categoryName.replace(/e/gi, 'é')])).filter(Boolean);
        where.product.category = {
          OR: terms.flatMap((term) => [
            { name: { equals: term, mode: 'insensitive' } },
            { slug: { equals: term, mode: 'insensitive' } },
            { name: { contains: term, mode: 'insensitive' } },
            { slug: { contains: term, mode: 'insensitive' } },
          ]),
        };
      }
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
      if (categoryName) {
        const normalized = categoryName.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const terms = Array.from(new Set([categoryName, normalized, categoryName.replace(/é/gi, 'e'), categoryName.replace(/e/gi, 'é')])).filter(Boolean);
        where.product.category = {
          OR: terms.flatMap((term) => [
            { name: { equals: term, mode: 'insensitive' } },
            { slug: { equals: term, mode: 'insensitive' } },
            { name: { contains: term, mode: 'insensitive' } },
            { slug: { contains: term, mode: 'insensitive' } },
          ]),
        };
      }
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

  async findAll(page: number = 1, limit: number = 50, categoryName?: string, expansionName?: string, attributeValue?: string, searchName?: string, storeId?: string, publicOnly: boolean = false, publishState: string = 'all', isTcg?: boolean, buylistStoreId?: string, buylistState: string = 'all', adminCatalogStoreId?: string, inStockOnly: boolean = false, gameNameOrId?: string) {
    const skip = (page - 1) * limit;

    const whereClause: any = { isDeleted: false };

    if (searchName) {
      whereClause.name = { contains: searchName, mode: 'insensitive' };
    }

    if (categoryName) {
      const normalized = categoryName.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const terms = Array.from(new Set([categoryName, normalized, categoryName.replace(/é/gi, 'e'), categoryName.replace(/e/gi, 'é')])).filter(Boolean);
      whereClause.category = {
        ...(whereClause.category || {}),
        OR: terms.flatMap((term) => [
          { name: { equals: term, mode: 'insensitive' } },
          { slug: { equals: term, mode: 'insensitive' } },
          { name: { contains: term, mode: 'insensitive' } },
          { slug: { contains: term, mode: 'insensitive' } },
        ]),
      };
    }

    if (isTcg !== undefined) {
      whereClause.category = {
        ...(whereClause.category || {}),
        isTcg: isTcg,
      };
    }

    // Filtros de inventario
    let isPublishedFilter: any = undefined;
    if (publicOnly) {
      isPublishedFilter = true;
    } else if (publishState === 'published') {
      isPublishedFilter = true;
    } else if (publishState === 'paused') {
      isPublishedFilter = false;
    }

    if (storeId) {
      whereClause.items = { some: { storeId, ...(isPublishedFilter !== undefined ? { isPublished: isPublishedFilter } : {}) } };
    } else if (inStockOnly) {
      whereClause.items = { some: { isPublished: true, stock: { gt: 0 } } };
    } else if (!publicOnly && isPublishedFilter !== undefined && !buylistStoreId) {
      // Legacy behaviour para admin/inventario interno
      whereClause.items = { some: { isPublished: isPublishedFilter } };
    }

    // Filtros de Buylist
    let isBuylistActiveFilter: any = undefined;
    if (buylistState === 'active') {
      isBuylistActiveFilter = true;
    } else if (buylistState === 'paused') {
      isBuylistActiveFilter = false;
    }

    if (buylistStoreId) {
      const buylistCondition: any = { storeId: buylistStoreId };
      if (isBuylistActiveFilter !== undefined) {
        buylistCondition.isActive = isBuylistActiveFilter;
      }

      // Si ya hay un filtro en whereClause (ej: items), lo metemos usando AND o agregamos buyListItems
      whereClause.buyListItems = { some: buylistCondition };
    }

    if (expansionName || attributeValue || gameNameOrId) {
      whereClause.cardDetail = { is: {} };
      if (gameNameOrId) {
        whereClause.cardDetail.is.OR = [
          { gameId: gameNameOrId },
          { gameRel: { slug: gameNameOrId.toLowerCase().trim() } },
          { gameRel: { name: { contains: gameNameOrId, mode: 'insensitive' } } }
        ];
      }
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

    const includeConfig = {
      category: true,
      brand: true,
      cardDetail: {
        include: { gameRel: true }
      },
      marketPrices: {
        include: { finish: true }
      },
      items: {
        where: {
          ...((storeId || adminCatalogStoreId) ? { storeId: storeId || adminCatalogStoreId } : {}),
          ...(isPublishedFilter !== undefined ? { isPublished: isPublishedFilter } : {})
        },
        include: {
          language: true,
          condition: true,
          finish: true,
          store: {
            include: {
              gameExchangeRates: true,
              ...(publicOnly ? {} : { shipping: { where: { isActive: true } } })
            }
          }
        }
      },
      buyListItems: buylistStoreId ? {
        where: {
          storeId: buylistStoreId,
          ...(isBuylistActiveFilter !== undefined ? { isActive: isBuylistActiveFilter } : {})
        },
        include: {
          language: true,
          condition: true
        }
      } : false,
    };

    // Ordenamiento STOCK-FIRST para el catálogo global del Marketplace
    if (publicOnly && !storeId && !inStockOnly) {
      const inStockProducts = await this.prisma.product.findMany({
        where: {
          ...whereClause,
          items: {
            some: {
              isPublished: true,
              stock: { gt: 0 }
            }
          }
        },
        select: { id: true },
        orderBy: { updatedAt: 'desc' }
      });

      const inStockIds = inStockProducts.map(p => p.id);
      const totalInStock = inStockIds.length;

      const targetIds: string[] = [];

      if (skip < totalInStock) {
        const pageInStockIds = inStockIds.slice(skip, skip + limit);
        targetIds.push(...pageInStockIds);
        const remaining = limit - pageInStockIds.length;
        if (remaining > 0) {
          const oosProducts = await this.prisma.product.findMany({
            where: {
              ...whereClause,
              id: { notIn: inStockIds }
            },
            select: { id: true },
            orderBy: { updatedAt: 'desc' },
            take: remaining,
            skip: 0
          });
          targetIds.push(...oosProducts.map(p => p.id));
        }
      } else {
        const oosSkip = skip - totalInStock;
        const oosProducts = await this.prisma.product.findMany({
          where: {
            ...whereClause,
            id: { notIn: inStockIds }
          },
          select: { id: true },
          orderBy: { updatedAt: 'desc' },
          take: limit,
          skip: oosSkip
        });
        targetIds.push(...oosProducts.map(p => p.id));
      }

      const [productsData, total] = await Promise.all([
        targetIds.length > 0
          ? this.prisma.product.findMany({
            where: { id: { in: targetIds } },
            include: includeConfig
          })
          : Promise.resolve([]),
        this.prisma.product.count({ where: whereClause })
      ]);

      const productMap = new Map(productsData.map(p => [p.id, p]));
      const orderedData = targetIds.map(id => productMap.get(id)).filter(Boolean);

      return {
        data: orderedData,
        meta: {
          total,
          totalInStock,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: includeConfig,
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
  async findOne(id: string, adminCatalogStoreId?: string) {
    return this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        brand: true,
        cardDetail: {
          include: { gameRel: true }
        },
        marketPrices: {
          include: { finish: true }
        },
        items: {
          where: adminCatalogStoreId
            ? { storeId: adminCatalogStoreId }
            : { isPublished: true, stock: { gt: 0 } },
          include: {
            condition: true,
            language: true,
            finish: true,
            store: {
              include: {
                subscriptionPlans: { include: { features: true } },
                gameExchangeRates: true,
                shipping: { where: { isActive: true } }
              }
            }
          }
        },
      },
    });
  }

  async findBySlug(slug: string, adminCatalogStoreId?: string) {
    return this.prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        brand: true,
        cardDetail: {
          include: { gameRel: true }
        },
        marketPrices: {
          include: { finish: true }
        },
        items: {
          where: adminCatalogStoreId
            ? { storeId: adminCatalogStoreId }
            : { isPublished: true, stock: { gt: 0 } },
          include: {
            condition: true,
            language: true,
            finish: true,
            store: {
              include: {
                subscriptionPlans: { include: { features: true } },
                gameExchangeRates: true,
                shipping: { where: { isActive: true } }
              }
            }
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

  async updateInventoryItem(
    itemId: string,
    data: { price?: number; stock?: number; isPublished?: boolean },
    userId?: string,
    userRole?: string,
  ) {
    const item = await this.prisma.inventoryItem.findUnique({
      where: { id: itemId },
      include: { store: true },
    });

    if (!item) {
      throw new NotFoundException('Ítem de inventario no encontrado');
    }

    if (userRole !== 'SUPERADMIN' && userId && item.store?.ownerId !== userId) {
      throw new ForbiddenException('No tienes permiso para modificar el inventario de otra tienda');
    }

    return this.prisma.inventoryItem.update({
      where: { id: itemId },
      data,
    });
  }

  async removeInventoryItem(id: string, userId?: string, userRole?: string) {
    const item = await this.prisma.inventoryItem.findUnique({
      where: { id },
      include: {
        store: true,
        product: { include: { category: true, _count: { select: { items: true } } } },
      },
    });

    if (!item) {
      throw new NotFoundException('Ítem de inventario no encontrado');
    }

    if (userRole !== 'SUPERADMIN' && userId && item.store?.ownerId !== userId) {
      throw new ForbiddenException('No tienes permiso para eliminar inventario de otra tienda');
    }

    // Verificar si es el último item de un producto no TCG para evitar dejarlo sin stock
    if (item?.product?.category?.isTcg === false && item.product._count.items <= 1) {
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
      if (user?.store) {
        storeId = storeId || user.store.id;
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

    if (!exists && storeId) {
      const store = await this.prisma.store.findUnique({
        where: { id: storeId },
        include: { subscriptionPlans: true, settings: true }
      });

      // const mpSettingsCount = store?.settings.filter(s => ['MP_ACCESS_TOKEN', 'MP_USER_ID'].includes(s.key)).length || 0;
      // if (mpSettingsCount < 2) {
      //   throw new BadRequestException('Debes vincular tu cuenta de Mercado Pago antes de poder empezar a vender.');
      // }

      const skuLimit = store?.subscriptionPlans?.[0]?.skuLimit ?? -1;
      if (skuLimit !== -1) {
        const currentCount = await this.prisma.inventoryItem.count({ where: { storeId } });
        if (currentCount >= skuLimit) {
          throw new BadRequestException(`Has alcanzado el límite de ${skuLimit} cartas sincronizadas de tu plan. Actualiza tu suscripción para ampliar tu catálogo.`);
        }
      }
    }

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
        finishId: finishId || undefined,
        isPublished: data.isPublished !== undefined ? data.isPublished : true
      }
    });
  }

}