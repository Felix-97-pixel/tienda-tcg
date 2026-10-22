import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PaymentsController } from './payments.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { MercadoPagoProvider } from './providers/mercadopago.provider';
import { WebpayProvider } from './providers/webpay.provider';
import { CommandHandlers } from './commands';
import { QueryHandlers } from './queries';
import { MpOAuthController } from './mp-oauth.controller';
import { ReservationCronService } from './cron/reservation.cron';

import { ShippingModule } from '../shipping/shipping.module';

@Module({
  imports: [PrismaModule, CqrsModule, ShippingModule],
  controllers: [PaymentsController, MpOAuthController],
  providers: [
    MercadoPagoProvider,
    WebpayProvider,
    ReservationCronService,
    ...CommandHandlers,
    ...QueryHandlers,
  ],
})
export class PaymentsModule {}
