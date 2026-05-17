import { Module } from '@nestjs/common';
import { PriceUpdaterController } from './price-updater.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { SyncModule } from '../sync/sync.module';

@Module({
  imports: [PrismaModule, SyncModule], 
  controllers: [PriceUpdaterController],
})
export class PriceUpdaterModule {}