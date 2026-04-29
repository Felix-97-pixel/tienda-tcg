import { Module } from '@nestjs/common';
import { CloudinaryProvider } from './cloudinary.provider';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';

@Module({
  providers: [CloudinaryProvider, UploadService],
  controllers: [UploadController],
  exports: [CloudinaryProvider, UploadService],
})
export class UploadModule {}
