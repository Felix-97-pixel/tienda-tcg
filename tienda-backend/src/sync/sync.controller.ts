import { Controller, Post, Body } from '@nestjs/common';
import { SyncService } from './sync.service';

@Controller('sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Post('set')
  async syncSet(
    @Body() body: { game: string; setId: string }
  ) {
    return this.syncService.syncSet(body.game, body.setId);
  }
}
