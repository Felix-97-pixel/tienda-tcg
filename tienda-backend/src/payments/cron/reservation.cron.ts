import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReservationCronService {
  private readonly logger = new Logger(ReservationCronService.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async releaseExpiredReservations() {
    const expired = await this.prisma.stockReservation.findMany({
      where: { expiresAt: { lte: new Date() } }
    });

    if (expired.length > 0) {
      this.logger.log(`Liberando ${expired.length} reservas de stock vencidas.`);

      for (const res of expired) {
        await this.prisma.inventoryItem.update({
          where: { id: res.inventoryItemId },
          data: { reservedStock: { decrement: res.quantity } }
        });
      }

      await this.prisma.stockReservation.deleteMany({
        where: { id: { in: expired.map(r => r.id) } }
      });
    }
  }
}
