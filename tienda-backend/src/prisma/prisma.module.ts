import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Esto hace que no tengas que importar PrismaModule en cada archivo
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}