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
    const category = await this.prisma.category.findFirst({
      where: { name: { equals: game, mode: 'insensitive' } }
    });

    if (!category) {
      return { error: `La categoría '${game}' no existe en la base de datos.` };
    }

    const categoryId = category.id;
    const gameType = game; // Usamos el nombre del juego directamente ahora que es String
    let totalProcessed = 0;
    let url = game === GameType.POKEMON
      ? `https://api.pokemontcg.io/v2/cards?q=set.id:${setId}`
      : `https://api.scryfall.com/cards/search?q=set:${setId}+-is:digital&unique=prints`;

    let hasMore = true;
    const CONCURRENCY_LIMIT = 15;

    while (hasMore) {
      const res = await axios.get(url);
      const data = res.data;

      const pageCards: CardToSync[] = data.data.map((c: any) => {
        let attrs: string[] = [];
        if (game === GameType.POKEMON) {
          attrs = c.types ? [...c.types] : [];
          if (c.supertype === 'Energy' && !attrs.includes('Energy')) attrs.push('Energy');
        } else {
          attrs = c.colors || c.card_faces?.[0]?.colors || [];
          if (c.oracle_text?.includes('{E}')) attrs.push('Energy');
          if (c.oracle_text?.toLowerCase().includes('devotion')) attrs.push('Devotion');
        }

        return {
          externalId: c.id,
          name: c.name,
          image: game === GameType.POKEMON
            ? c.images?.large
            : (c.image_uris?.normal || c.card_faces?.[0]?.image_uris?.normal || ''),
          expansion: game === GameType.POKEMON ? c.set.name : c.set_name,
          rarity: c.rarity || 'Common',
          number: game === GameType.POKEMON ? c.number : c.collector_number,
          attributes: attrs
        };
      });

      for (let i = 0; i < pageCards.length; i += CONCURRENCY_LIMIT) {
        const chunk = pageCards.slice(i, i + CONCURRENCY_LIMIT);

        const results = await Promise.allSettled(
          chunk.map(async (card) => {
            await this.prisma.product.upsert({
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
                },
                items: { create: { price: 0, stock: 0, condition: 'New' } }
              }
            });

            await this.updateAttributes(card.externalId, card.attributes);
          })
        );

        results.forEach((res) => {
          if (res.status === 'fulfilled') totalProcessed++;
          else console.error('❌ Carta fallida:', res.reason);
        });
      }

      console.log(`⚡ Lote insertado. Total procesadas hasta ahora: ${totalProcessed}`);

      if (game === GameType.MAGIC && data.has_more) {
        url = data.next_page;
      } else {
        hasMore = false;
      }
    }

    return { message: `Sincronización completada`, count: totalProcessed };
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
}
