import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const categories = await prisma.category.findMany();
  const brands = await prisma.brand.findMany();
  const conditions = await prisma.condition.findMany();
  const languages = await prisma.language.findMany();
  const games = await prisma.game.findMany();
  const finishes = await prisma.finish.findMany();
  const settings = await prisma.globalSetting.findMany();

  console.log(JSON.stringify({
    categories,
    brands,
    conditions,
    languages,
    games,
    finishes,
    settings
  }, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
