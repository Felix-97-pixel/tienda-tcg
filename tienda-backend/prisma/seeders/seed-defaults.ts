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
  
  // Finishes
  const finishes = [
    { name: 'Normal', game: 'Magic' },
    { name: 'Foil', game: 'Magic' },
    { name: 'Etched Foil', game: 'Magic' },
    { name: 'Normal', game: 'Pokemon' },
    { name: 'Holo', game: 'Pokemon' },
    { name: 'Reverse Holo', game: 'Pokemon' },
    { name: 'Normal', game: 'Riftbound' },
    { name: 'Foil', game: 'Riftbound' },
  ];

  for (const f of finishes) {
    const exists = await prisma.finish.findFirst({ where: { name: f.name, game: f.game } });
    if (!exists) {
      await prisma.finish.create({ data: f });
    }
  }

  console.log('✅ Defaults ensured');
  
  await prisma.$disconnect();
  await pool.end();
}

main().catch(console.error);
