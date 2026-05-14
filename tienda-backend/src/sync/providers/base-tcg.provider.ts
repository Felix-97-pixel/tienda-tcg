import { Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Clase Base para cualquier Proveedor de TCG.
 * Define el flujo estándar que deben seguir todos los juegos.
 */
export abstract class TcgProvider {
  protected readonly logger: Logger;
  public onProgress?: (game: string, current: number, total: number) => void;

  constructor(
    protected readonly gameName: string,
    protected readonly prisma: PrismaService,
  ) {
    this.logger = new Logger(`TcgProvider:${gameName}`);
  }

  // --- MÉTODOS QUE CADA JUEGO DEBE IMPLEMENTAR ---

  /** Obtener datos de la API externa (Scryfall, PokemonTCG, Riftcodex, etc.) */
  abstract fetchExternalSet(setId: string): Promise<any[]>;

  /** Formatear los datos externos al modelo de nuestra base de datos */
  abstract mapToProduct(externalCard: any, categoryId: string): any;

  /** Lógica específica de actualización de precios para este juego */
  abstract updateGamePrices(expansionName: string): Promise<{ updated: number; errors: number }>;

  // --- MÉTODOS COMPARTIDOS (Lógica común) ---

  /**
   * Flujo estándar de importación de un Set.
   */
  async syncSet(setId: string, gameType: string) {
    this.logger.log(`Iniciando sincronización del set: ${setId}`);

    try {
      const categoryId = await this.getCategoryId(gameType);
      const { defaultLang, defaultCond } = await this.getSyncDefaults();
      const externalCards = await this.fetchExternalSet(setId);

      this.logger.log(`Se obtuvieron ${externalCards.length} cartas de la API.`);

      let totalProcessed = 0;
      const CONCURRENCY_LIMIT = 15;

      // Procesamos por lotes para no saturar la DB
      for (let i = 0; i < externalCards.length; i += CONCURRENCY_LIMIT) {
        const chunk = externalCards.slice(i, i + CONCURRENCY_LIMIT);

        const results = await Promise.allSettled(
          chunk.map(async (card) => {
            const productData = this.mapToProduct(card, categoryId);

            // 1. Intentar encontrar producto existente
            let existingProduct = await this.prisma.product.findUnique({
              where: { externalId: productData.externalId },
              include: { items: true }
            });

            // 2. Upsert del Producto
            const product = await this.prisma.product.upsert({
              where: { id: existingProduct?.id || 'non-existent-uuid' },
              update: {
                externalId: productData.externalId,
                imageUrl: productData.image,
                name: productData.name
              },
              create: {
                externalId: productData.externalId,
                name: productData.name,
                imageUrl: productData.image,
                categoryId: categoryId,
                cardDetail: {
                  create: {
                    expansion: productData.expansion,
                    rarity: productData.rarity,
                    collectorNum: productData.number,
                    game: gameType,
                    attributes: productData.attributes
                  }
                }
              },
              include: { items: true }
            });

            // 3. Asegurar variantes Normal y Foil
            await this.ensureInventoryItems(product.id, defaultLang.id, defaultCond.id, product.items);

            // 4. Actualizar Atributos (si es necesario)
            if (productData.attributes?.length) {
              await this.updateAttributes(product.id, productData.attributes);
            }
          })
        );

        results.forEach((res) => {
          if (res.status === 'fulfilled') totalProcessed++;
          else this.logger.error(`Error procesando carta: ${res.reason}`);
        });
      }

      this.logger.log(`Sincronización finalizada: ${totalProcessed} productos procesados.`);
      return { success: true, count: totalProcessed };
    } catch (error) {
      this.logger.error(`Error sincronizando set ${setId}: ${error.message}`);
      throw error;
    }
  }

  private async ensureInventoryItems(productId: string, langId: string, condId: string, existingItems: any[]) {
    const hasNormal = existingItems.some(item => !item.isFoil);
    const hasFoil = existingItems.some(item => item.isFoil);

    if (!hasNormal) {
      await this.prisma.inventoryItem.create({
        data: { productId, languageId: langId, conditionId: condId, isFoil: false, price: 0, stock: 0 }
      });
    }

    if (!hasFoil) {
      await this.prisma.inventoryItem.create({
        data: { productId, languageId: langId, conditionId: condId, isFoil: true, price: 0, stock: 0 }
      });
    }
  }

  private async updateAttributes(productId: string, attributes: string[]) {
    await this.prisma.$executeRaw`
      UPDATE "CardDetail" SET attributes = ${attributes}::text[] WHERE "productId" = ${productId}
    `;
  }

  private async getSyncDefaults() {
    const [defaultLang, defaultCond] = await Promise.all([
      this.prisma.language.findUnique({ where: { code: 'en' } }),
      this.prisma.condition.findUnique({ where: { name: 'near_mint' } })
    ]);
    if (!defaultLang || !defaultCond) throw new Error("Defaults missing");
    return { defaultLang, defaultCond };
  }

  private async getCategoryId(game: string) {
    const category = await this.prisma.category.findFirst({
      where: { name: { equals: game, mode: 'insensitive' } }
    });
    if (!category) throw new Error(`Category ${game} not found`);
    return category.id;
  }
}
