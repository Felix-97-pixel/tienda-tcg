import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { SyncService } from './sync.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('sync')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class SyncController {
  constructor(private readonly syncService: SyncService) { }
  //Invoke-RestMethod -Method POST -Uri "http://localhost:3001/sync/set" -ContentType "application/json" -Body '{"game": "Singles Magic The Gathering", "setId": "tla"}'
  @Post('set')
  async syncSet(
    @Body() body: { game: string; setId: string }
  ) {
    return this.syncService.syncSet(body.game, body.setId);
  }
}
