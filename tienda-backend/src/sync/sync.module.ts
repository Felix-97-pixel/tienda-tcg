import { Module } from '@nestjs/common';
import { SyncService } from './sync.service';
import { SyncController } from './sync.controller';
import { MagicService } from './magic.service';
import { PokemonService } from './pokemon.service';
import { RiftboundService } from './riftbound.service';
import { ScrydexService } from './scrydex.service';

@Module({
  providers: [SyncService, MagicService, PokemonService, RiftboundService, ScrydexService],
  controllers: [SyncController],
  exports: [SyncService, MagicService, PokemonService, RiftboundService, ScrydexService]
})
export class SyncModule {}
