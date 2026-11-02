const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const p = await prisma.product.findMany({
    where: { name: { contains: 'Gustha' } },
  });
  console.log('Products matching Gustha:', p.map(x => ({ id: x.id, name: x.name, storeId: x.storeId })));
}

main().catch(console.error).finally(async () => {
  await prisma.$disconnect();
  await pool.end();
});

