import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

async function main() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  console.log('--- Ensuring Defaults Exist ---');
  
  // Languages
  await prisma.language.upsert({ where: { code: 'en' }, update: {}, create: { name: 'English', code: 'en' } });
  await prisma.language.upsert({ where: { code: 'es' }, update: {}, create: { name: 'Spanish', code: 'es' } });

  // Conditions
  await prisma.condition.upsert({ where: { name: 'near_mint' }, update: {}, create: { name: 'near_mint' } });
  await prisma.condition.upsert({ where: { name: 'mint' }, update: {}, create: { name: 'mint' } });
  await prisma.condition.upsert({ where: { name: 'light_played' }, update: {}, create: { name: 'light_played' } });
  
  // Games
  const magicGame = await prisma.game.upsert({ where: { slug: 'magic' }, update: {}, create: { name: 'Magic: The Gathering', slug: 'magic' } });
  const pokemonGame = await prisma.game.upsert({ where: { slug: 'pokemon' }, update: {}, create: { name: 'Pokémon TCG', slug: 'pokemon' } });
  const riftboundGame = await prisma.game.upsert({ where: { slug: 'riftbound' }, update: {}, create: { name: 'Riftbound', slug: 'riftbound' } });

  // Finishes
  const finishes = [
    { name: 'Normal', gameId: magicGame.id },
    { name: 'Foil', gameId: magicGame.id },
    { name: 'Etched Foil', gameId: magicGame.id },
    { name: 'Normal', gameId: pokemonGame.id },
    { name: 'Holo', gameId: pokemonGame.id },
    { name: 'Reverse Holo', gameId: pokemonGame.id },
    { name: 'Normal', gameId: riftboundGame.id },
    { name: 'Foil', gameId: riftboundGame.id },
  ];

  for (const f of finishes) {
    const exists = await prisma.finish.findFirst({ where: { name: f.name, gameId: f.gameId } });
    if (!exists) {
      await prisma.finish.create({ data: f });
    }
  }

  console.log('✅ Defaults ensured');
  
  await prisma.$disconnect();
  await pool.end();
}

main().catch(console.error);
