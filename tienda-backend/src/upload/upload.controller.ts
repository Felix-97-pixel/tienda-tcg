import {
  Controller,
  Post,
  Delete,
  Body,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Query,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  BadRequestException,
} from '@nestjs/common';
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
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5 MB max
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/i }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Query('folder') folder: string = 'general',
  ) {
    // Sanitizar folder para prevenir path traversal
    const safeFolder = folder.replace(/[^a-zA-Z0-9_-]/g, '') || 'general';
    const result = await this.uploadService.uploadImage(file, `tienda/${safeFolder}`);
    return {
      url: result.secure_url,
    };
  }

  @Delete('image')
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  async deleteImage(@Body('url') url: string) {
    if (!url || typeof url !== 'string') {
      throw new BadRequestException('URL válida es requerida');
    }
    // Validar que la URL pertenezca a Cloudinary y al subdirectorio tienda
    if (!url.includes('res.cloudinary.com') || !url.includes('/tienda/')) {
      throw new BadRequestException('Solo se permite eliminar imágenes alojadas en la plataforma');
    }
    const result = await this.uploadService.deleteImage(url);
    return { success: true, result };
  }
}
