import { Module } from '@nestjs/common';
import { ExpansionsController } from './expansions.controller';
import { ExpansionsService } from './expansions.service';
import { SyncModule } from '../sync/sync.module';

@Module({
  imports: [SyncModule],
  controllers: [ExpansionsController],
  providers: [ExpansionsService]
})
export class ExpansionsModule { }
