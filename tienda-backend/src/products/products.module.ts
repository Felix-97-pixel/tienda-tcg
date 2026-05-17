import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { UploadModule } from '../upload/upload.module';
import { SyncModule } from '../sync/sync.module';

@Module({
  imports: [PrismaModule, UploadModule, SyncModule],
  controllers: [ProductsController],
  providers: [ProductsService], 
  exports: [ProductsService]
})
export class ProductsModule {}