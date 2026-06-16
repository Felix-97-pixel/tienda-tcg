import { Controller, Post, Delete, Body, UseInterceptors, UploadedFile, UseGuards, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('upload')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Query('folder') folder: string = 'general'
  ) {
    const result = await this.uploadService.uploadImage(file, `tienda/${folder}`);
    return {
      url: result.secure_url,
    };
  }

  @Delete('image')
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  async deleteImage(@Body('url') url: string) {
    if (!url) {
      return { success: false, message: 'URL is required' };
    }
    const result = await this.uploadService.deleteImage(url);
    return { success: true, result };
  }
}
