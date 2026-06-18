import { Module } from '@nestjs/common';
import { BuylistController } from './buylist.controller';
import { BuylistService } from './buylist.service';
import { StoresModule } from '../stores/stores.module';

@Module({
  imports: [StoresModule],
  controllers: [BuylistController],
  providers: [BuylistService]
})
export class BuylistModule {}
