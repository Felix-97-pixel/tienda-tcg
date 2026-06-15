import { Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Clase Base para cualquier Proveedor de TCG.
 * Define el flujo estándar que deben seguir todos los juegos.
 */
export abstract class TcgProvider {
  protected readonly logger: Logger;
  public onProgress?: (game: string, current: number, total: number, type: 'import' | 'price') => void;

  constructor(
    protected readonly gameName: string,
    protected readonly prisma: PrismaService,
  ) {
    this.logger = new Logger(`TcgProvider:${gameName}`);
  }

  // --- MÉTODOS QUE CADA JUEGO DEBE IMPLEMENTAR ---

  /** Obtener datos de la API externa (Scryfall, PokemonTCG, Riftcodex, etc.) */
  abstract fetchExternalSet(setId: string): Promise<any[]>;

  abstract mapToProduct(externalCard: any, categoryId: string): any;

  /** Obtiene la lista de todos los sets posibles para este juego para sincronización masiva */
  abstract fetchAllSets(): Promise<{id: string, name: string}[]>;

  /** Lógica específica de actualización de precios para este juego */
  abstract updateGamePrices(expansionName: string): Promise<{ updated: number; errors: number }>;

  /** Busca o crea un producto en la BD para la subida masiva según la lógica específica del juego */
  abstract findProductForBulkUpload(itemData: any, categoryId: string): Promise<any>;

  // --- MÉTODOS COMPARTIDOS (Lógica común) ---

  /**
   * Define qué variantes de inventario se deben crear para una carta.
   * Por defecto crea Normal y Foil.
   */
  getExpectedVariants(rawCard: any): string[] {
    return ['Normal', 'Foil'];
  }

  /**
   * Obtiene el gameId oficial configurado en Settings.
   */
  protected async getGameId(): Promise<string> {
    const configKey = `${this.gameName}_sync_game_id`;
    const setting = await this.prisma.globalSetting.findUnique({ where: { key: configKey } });
    if (!setting || !setting.value) {
      throw new Error(`El Juego (Game ID) no está configurado para el destino '${this.gameName}'. Ve a Configuración -> Destinos de Sincronización.`);
    }
    return setting.value;
  }

  /**
   * Flujo estándar de importación de un Set.
   */
  async syncSet(setId: string, categoryName: string) {
    this.logger.log(`Iniciando sincronización del set: ${setId}`);

    try {
      const categoryId = await this.getCategoryId(categoryName);
      const gameId = await this.getGameId();
      const { defaultLang, defaultCond } = await this.getSyncDefaults();
      const externalCards = await this.fetchExternalSet(setId);

      this.logger.log(`Se obtuvieron ${externalCards.length} cartas de la API.`);

      // Pre-cargar todos los finishes de este juego para resolver IDs rápido
      const allFinishes = await this.prisma.finish.findMany({ where: { gameId: gameId } });
      const finishMap = new Map(allFinishes.map(f => [f.name, f.id]));

      let totalProcessed = 0;
      for (const card of externalCards) {
        const productData = this.mapToProduct(card, categoryId);
        const expectedVariantNames = this.getExpectedVariants(card);

        let expansionRecord = await this.prisma.expansion.findFirst({
          where: { name: productData.expansion, gameId: gameId }
        });

        if (!expansionRecord) {
          expansionRecord = await this.prisma.expansion.create({
            data: {
              name: productData.expansion,
              gameId: gameId,
              externalId: setId // setId es usualmente el slug de la API
            }
          });
        } else if (!expansionRecord.externalId && setId) {
          // Si existía sin externalId (ej. migración), lo actualizamos
          expansionRecord = await this.prisma.expansion.update({
            where: { id: expansionRecord.id },
            data: { externalId: setId }
          });
        }


        await this.prisma.product.upsert({
          where: { externalId: productData.externalId },
          update: {
            name: productData.name,
            imageUrl: productData.image,
            description: productData.description,
            cardDetail: {
              update: {
                expansion: productData.expansion,
                expansionId: expansionRecord.id,
                rarity: productData.rarity,
                collectorNum: productData.number,
                gameId: gameId,
                attributes: productData.attributes
              }
            }
          },
          create: {
            externalId: productData.externalId,
            name: productData.name,
            imageUrl: productData.image,
            description: productData.description,
            categoryId: categoryId,
            cardDetail: {
              create: {
                expansion: productData.expansion,
                expansionId: expansionRecord.id,
                rarity: productData.rarity,
                collectorNum: productData.number,
                gameId: gameId,
                attributes: productData.attributes
              }
            }
          }
        });

        totalProcessed++;
        this.onProgress?.(this.gameName, totalProcessed, externalCards.length, 'import');
      }

      this.logger.log(`Sincronización finalizada: ${totalProcessed} productos procesados.`);
      return { total: totalProcessed };
    } catch (error) {
      this.logger.error(`Error sincronizando set ${setId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Elimina los items de inventario que quedaron con precio 0 después de una sincronización.
   * Esto limpia la base de datos de variantes que no existen en el mercado.
   */
  protected async cleanEmptyInventory(expansionName: string) {
    this.logger.log(`Limpiando inventario vacío para expansión: ${expansionName}...`);

    const result = await this.prisma.inventoryItem.deleteMany({
      where: {
        price: 0,
        stock: 0,
        storeId: null, // SOLO limpiar inventario maestro vacío
        product: {
          cardDetail: {
            expansion: { equals: expansionName, mode: 'insensitive' },
            gameId: await this.getGameId()
          }
        }
      }
    });

    this.logger.log(`Se eliminaron ${result.count} variantes sin precio para ${expansionName}.`);
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
