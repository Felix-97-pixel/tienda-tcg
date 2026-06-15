import { PrismaClient } from '@prisma/client';

export async function seedSettings(prisma: PrismaClient) {
  console.log('--- Seeding Global Settings ---');

  const magic = await prisma.game.findUnique({ where: { name: 'Magic: The Gathering' } });
  const pokemon = await prisma.game.findUnique({ where: { name: 'Pokémon' } });
  const riftbound = await prisma.game.findUnique({ where: { name: 'Riftbound' } });

  const settingsData = [
    { key: 'mtg_sync_game_id', value: magic?.id || '' },
    { key: 'pokemon_sync_game_id', value: pokemon?.id || '' },
    { key: 'riftbound_sync_game_id', value: riftbound?.id || '' },
    // Destinos por defecto
    { key: 'mtg_sync_destination', value: 'Singles Magic The Gathering' },
    { key: 'pokemon_sync_destination', value: 'Singles Pokemon' },
    { key: 'riftbound_sync_destination', value: 'Singles Riftbound' },
  ];

  for (const setting of settingsData) {
    if (!setting.value) continue; // Si no encontró el juego, lo saltamos
    await prisma.globalSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: { key: setting.key, value: setting.value },
    });
  }
}
