import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PaymentsController } from './payments.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { WebpayProvider } from './providers/webpay.provider';
import { CommandHandlers } from './commands';
import { QueryHandlers } from './queries';

@Module({
  imports: [PrismaModule, CqrsModule],
  controllers: [PaymentsController],
  providers: [
    WebpayProvider,
    ...CommandHandlers,
    ...QueryHandlers,
  ],
})
export class PaymentsModule {}
