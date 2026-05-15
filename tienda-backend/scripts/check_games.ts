import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const games = await prisma.cardDetail.findMany({ select: { game: true }, distinct: ['game'] });
  console.log(games);
}

main().finally(async () => { await prisma.$disconnect(); await pool.end(); });
