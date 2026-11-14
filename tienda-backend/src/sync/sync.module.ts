import { Module } from '@nestjs/common';
import { SyncService } from './sync.service';
import { SyncController } from './sync.controller';
import { MagicService } from './magic.service';
import { ScrydexService } from './scrydex.service';
import { LocalPriceIndexService } from './local-price-index.service';

import { PriceSchedulerService } from './price-scheduler.service';

@Module({
  providers: [SyncService, MagicService, ScrydexService, LocalPriceIndexService, PriceSchedulerService],
  controllers: [SyncController],
  exports: [SyncService, MagicService, ScrydexService, LocalPriceIndexService, PriceSchedulerService]
})
export class SyncModule {}
