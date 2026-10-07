import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ 
  connectionString,
  ssl: { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD') // remove accents
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

async function main() {
  console.log('Fetching products without slugs...');
  const products = await prisma.product.findMany({
    where: { slug: null },
    select: { id: true, name: true, externalId: true }
  });

  console.log(`Found ${products.length} products to update.`);
  let count = 0;

  for (const p of products) {
    const baseSlug = slugify(p.name);
    const shortId = p.externalId ? p.externalId.split('-')[0].substring(0, 8) : p.id.substring(0, 8);
    let finalSlug = `${baseSlug}-${shortId}`;

    try {
      await prisma.product.update({
        where: { id: p.id },
        data: { slug: finalSlug }
      });
    } catch (e: any) {
      if (e.code === 'P2002') { // Unique constraint failed
        // Retry with a random substring
        finalSlug = `${baseSlug}-${shortId}-${Math.random().toString(36).substring(2, 6)}`;
        await prisma.product.update({
          where: { id: p.id },
          data: { slug: finalSlug }
        });
      } else {
        throw e;
      }
    }
    count++;
    if (count % 500 === 0) console.log(`Updated ${count}/${products.length}...`);
  }

  console.log('Finished updating all products with slugs.');
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
