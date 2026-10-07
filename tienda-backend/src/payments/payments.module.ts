import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PaymentsController } from './payments.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { MercadoPagoProvider } from './providers/mercadopago.provider';
import { CommandHandlers } from './commands';
import { QueryHandlers } from './queries';
import { MpOAuthController } from './mp-oauth.controller';
import { ReservationCronService } from './cron/reservation.cron';

@Module({
  imports: [PrismaModule, CqrsModule],
  controllers: [PaymentsController, MpOAuthController],
  providers: [
    MercadoPagoProvider,
    ReservationCronService,
    ...CommandHandlers,
    ...QueryHandlers,
  ],
})
export class PaymentsModule {}
