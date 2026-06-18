import { Module } from '@nestjs/common';
import { StoreCreditController } from './store-credit.controller';
import { StoreCreditService } from './store-credit.service';
import { StoresModule } from '../stores/stores.module';

@Module({
  imports: [StoresModule],
  controllers: [StoreCreditController],
  providers: [StoreCreditService]
})
export class StoreCreditModule {}
