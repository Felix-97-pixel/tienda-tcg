import { Module } from '@nestjs/common';
import { PriceUpdaterService } from './price-updater.service';
import { PriceUpdaterController } from './price-updater.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { SyncModule } from '../sync/sync.module';

@Module({
  imports: [PrismaModule, SyncModule], 
  controllers: [PriceUpdaterController],
  providers: [PriceUpdaterService],
})
export class PriceUpdaterModule {}