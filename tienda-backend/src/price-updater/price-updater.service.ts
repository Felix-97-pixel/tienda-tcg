import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service'; // Ajusta la ruta a tu PrismaService
import { getCardPriceCK } from './scraper.util';

@Injectable()
export class PriceUpdaterService {
  private readonly logger = new Logger(PriceUpdaterService.name);

  constructor(private prisma: PrismaService) {}

  // Tarea programada: Todos los días a las 3 AM
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async updateRarePrices() {
    this.logger.log('Iniciando actualización automática de precios...');
    /* 
    // 1. Buscamos solo Raras y Míticas que tengan URL de Card Kingdom
    const cards = await this.prisma.card.findMany({
      where: {
        rarity: { in: ['rare', 'mythic'] },
        ckUrl: { not: null }
      }
    });

    for (const card of cards) {
      this.logger.log(`Actualizando: ${card.name}`);

      // Precio Normal
      const normalPrice = await getCardPriceCK(card.ckUrl);
      
      // Precio Foil (asumiendo la convención de agregar -foil)
      const foilPrice = await getCardPriceCK(`${card.ckUrl}-foil`);

      // 2. Guardamos en DB
      await this.prisma.card.update({
        where: { id: card.id },
        data: {
          priceNormal: normalPrice,
          priceFoil: foilPrice,
          updatedAt: new Date(),
        }
      });
      

      // Pausa de seguridad de 3 segundos para evitar bloqueos
      await new Promise(res => setTimeout(res, 3000));
    }
    */

    this.logger.log('Proceso de actualización terminado.');
  }
}