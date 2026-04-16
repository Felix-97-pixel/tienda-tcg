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

  try {
    await prisma.inventoryItem.deleteMany();
    await prisma.cardDetail.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();

    await prisma.category.create({
      data: { name: 'Singles TCG', slug: 'singles-tcg' }
    });

    await prisma.category.create({
      data: { name: 'Singles Magic The Gathering', slug: 'singles-magic' },
    });

    await prisma.category.create({
      data: { name: 'Singles Pokemon', slug: 'singles-pokemon' },
    });

    console.log('✅ Seed exitoso');
  } catch (e) {
    console.error('❌ Error:', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();