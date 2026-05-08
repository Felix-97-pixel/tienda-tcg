import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';
import { GameType } from '../common/enums/game-type.enum';

interface CardToSync {
  externalId: string;
  name: string;
  image: string;
  expansion: string;
  rarity: string;
  number: string;
  attributes: string[];
}

@Injectable()
export class SyncService {
  constructor(private prisma: PrismaService) { }

  async syncSet(game: string, setId: string) {
    if (game === GameType.POKEMON) {
      return this.syncPokemonSet(game, setId);
    }
    // Por defecto tratamos como Magic u otros que sigan el patrón Scryfall
    return this.syncMtgSet(game, setId);
  }

  private async getSyncDefaults() {
    const [defaultLang, defaultCond] = await Promise.all([
      this.prisma.language.findUnique({ where: { code: 'en' } }),
      this.prisma.condition.findUnique({ where: { name: 'near_mint' } })
    ]);

    if (!defaultLang || !defaultCond) {
      throw new Error("No se encontraron los registros de idioma 'en' o condición 'near_mint'.");
    }

    return { defaultLang, defaultCond };
  }

  private async getCategoryId(game: string) {
    const category = await this.prisma.category.findFirst({
      where: { name: { equals: game, mode: 'insensitive' } }
    });

    if (!category) {
      throw new Error(`La categoría '${game}' no existe.`);
    }

    return category.id;
  }

  /**
   * Sincronización para Magic The Gathering usando Scryfall
   */
  async syncMtgSet(game: string, setId: string) {
    const categoryId = await this.getCategoryId(game);
    const { defaultLang, defaultCond } = await this.getSyncDefaults();

    let totalProcessed = 0;
    let url = `https://api.scryfall.com/cards/search?q=set:${setId}+-is:digital&unique=prints`;
    let hasMore = true;
    const CONCURRENCY_LIMIT = 15;

    while (hasMore) {
      const res = await axios.get(url);
      const data = res.data;

      if (!data.data || data.data.length === 0) {
        hasMore = false;
        break;
      }

      const pageCards: CardToSync[] = data.data.map((c: any) => {
        const attrs: string[] = c.colors || c.card_faces?.[0]?.colors || [];
        if (c.oracle_text?.includes('{E}')) attrs.push('Energy');
        if (c.oracle_text?.toLowerCase().includes('devotion')) attrs.push('Devotion');

        return {
          externalId: c.id,
          name: c.name,
          image: c.image_uris?.normal || c.card_faces?.[0]?.image_uris?.normal || '',
          expansion: c.set_name,
          rarity: c.rarity || 'Common',
          number: c.collector_number,
          attributes: attrs
        };
      });

      totalProcessed += await this.processBatch(pageCards, categoryId, game, defaultLang.id, defaultCond.id, CONCURRENCY_LIMIT);

      if (data.has_more && data.next_page) {
        url = data.next_page;
      } else {
        hasMore = false;
      }
    }

    return { message: `Sincronización de Magic completada`, count: totalProcessed };
  }

  /**
   * Sincronización para Pokemon usando Pokemon TCG API (pokemontcg.io)
   */
  async syncPokemonSet(game: string, setId: string) {
    const categoryId = await this.getCategoryId(game);
    const { defaultLang, defaultCond } = await this.getSyncDefaults();

    let totalProcessed = 0;
    let page = 1;
    const pageSize = 250;
    let hasMore = true;
    const CONCURRENCY_LIMIT = 15;

    while (hasMore) {
      const url = `https://api.pokemontcg.io/v2/cards?q=set.id:${setId}&page=${page}&pageSize=${pageSize}`;
      console.log(`Consultando Pokemon API: Página ${page}`);
      
      const res = await axios.get(url);
      const data = res.data;

      if (!data.data || data.data.length === 0) {
        hasMore = false;
        break;
      }

      const pageCards: CardToSync[] = data.data.map((c: any) => {
        const attrs = c.types ? [...c.types] : [];
        if (c.supertype === 'Energy' && !attrs.includes('Energy')) attrs.push('Energy');

        return {
          externalId: c.id,
          name: c.name,
          image: c.images?.large || c.images?.small || '',
          expansion: c.set.name,
          rarity: c.rarity || 'Common',
          number: c.number,
          attributes: attrs
        };
      });

      totalProcessed += await this.processBatch(pageCards, categoryId, game, defaultLang.id, defaultCond.id, CONCURRENCY_LIMIT);

      if (data.data.length < pageSize) {
        hasMore = false;
      } else {
        page++;
      }
    }

    return { message: `Sincronización de Pokemon completada`, count: totalProcessed };
  }

  /**
   * Procesa un lote de cartas e inserta/actualiza en la base de datos
   */
  private async processBatch(
    cards: CardToSync[],
    categoryId: string,
    gameType: string,
    langId: string,
    condId: string,
    limit: number
  ): Promise<number> {
    let processedInBatch = 0;

    for (let i = 0; i < cards.length; i += limit) {
      const chunk = cards.slice(i, i + limit);

      const results = await Promise.allSettled(
        chunk.map(async (card) => {
          const product = await this.prisma.product.upsert({
            where: { externalId: card.externalId },
            update: { imageUrl: card.image, name: card.name },
            create: {
              externalId: card.externalId,
              name: card.name,
              imageUrl: card.image,
              categoryId: categoryId,
              cardDetail: {
                create: {
                  expansion: card.expansion,
                  rarity: card.rarity,
                  collectorNum: card.number,
                  game: gameType,
                }
              }
            },
            include: { items: true }
          });

          if (product.items.length === 0) {
            await this.prisma.inventoryItem.create({
              data: {
                productId: product.id,
                price: 0,
                stock: 0,
                conditionId: condId,
                languageId: langId
              }
            });
          }

          await this.updateAttributes(card.externalId, card.attributes);
        })
      );

      results.forEach((res) => {
        if (res.status === 'fulfilled') processedInBatch++;
        else console.error('❌ Error procesando carta:', res.reason);
      });
    }

    return processedInBatch;
  }

  private async updateAttributes(externalId: string, attributes: string[]): Promise<void> {
    if (!attributes.length) return;
    await this.prisma.$executeRaw`
      UPDATE "CardDetail"
      SET    attributes = ${attributes}::text[]
      WHERE  "productId" = (
        SELECT id FROM "Product" WHERE "externalId" = ${externalId}
      )
    `;
  }

  /**
   * Obtiene la lista de ediciones de Magic desde MTGJSON
   */
  async getMtgSets() {
    const res = await axios.get('https://mtgjson.com/api/v5/SetList.json');
    const data = res.data?.data || [];
    // Ordenar por fecha descendente
    return data.sort((a: any, b: any) =>
      new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
    );
  }

  /**
   * Obtiene la lista de ediciones de Pokemon desde pokemontcg.io
   */
  async getPokemonSets() {
    const res = await axios.get('https://api.pokemontcg.io/v2/sets');
    const data = res.data?.data || [];
    // Ordenar por fecha descendente
    return data.sort((a: any, b: any) =>
      new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
    );
  }
}
