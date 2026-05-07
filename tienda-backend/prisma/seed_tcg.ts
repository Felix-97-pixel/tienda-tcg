
import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma';

async function main() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  const languages = [
    { name: 'Spanish', code: 'es' },
    { name: 'English', code: 'en' },
    { name: 'Chinese', code: 'zh_CN' },
    { name: 'Japanese', code: 'ja' },
  ];

  const conditions = [
    'near_mint',
    'poor',
    'played',
    'light_played',
    'good',
    'excellent',
    'mint',
  ];

  try {
    console.log('Seeding languages...');
    for (const lang of languages) {
      await prisma.language.upsert({
        where: { code: lang.code },
        update: {},
        create: lang,
      });
    }

    console.log('Seeding conditions...');
    for (const cond of conditions) {
      await prisma.condition.upsert({
        where: { name: cond },
        update: {},
        create: { name: cond },
      });
    }

    console.log('Seed completed successfully!');
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
