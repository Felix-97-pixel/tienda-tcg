
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

  try {
    const game = 'Singles Magic The Gathering';
    const setId = 'lea';

    const category = await prisma.category.findFirst({
      where: { name: { equals: game, mode: 'insensitive' } }
    });

    if (!category) {
      console.log(`Error: Category ${game} not found`);
      return;
    }

    const defaultLang = await prisma.language.findUnique({ where: { code: 'en' } });
    const defaultCond = await prisma.condition.findUnique({ where: { name: 'near_mint' } });

    console.log('Category ID:', category.id);
    console.log('Default Lang ID:', defaultLang?.id);
    console.log('Default Cond ID:', defaultCond?.id);

    // Test a single card upsert
    const result = await prisma.product.upsert({
      where: { externalId: 'test-card-1' },
      update: {},
      create: {
        externalId: 'test-card-1',
        name: 'Test Card',
        imageUrl: 'http://test.com',
        categoryId: category.id,
        items: {
          create: {
            price: 0,
            stock: 0,
            conditionId: defaultCond!.id,
            languageId: defaultLang!.id
          }
        }
      }
    });

    console.log('Upsert success:', result.id);
  } catch (e) {
    console.error('ERROR DETECTADO:', e);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
