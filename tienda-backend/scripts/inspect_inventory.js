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
  const items = await prisma.inventoryItem.findMany({
    where: { product: { name: { contains: 'Gustha' } } },
    include: { store: true, product: true },
  });
  console.log('Gustha inventory items:', items.map(i => ({ id: i.id, store: i.store.name, storeId: i.storeId, price: i.price, stock: i.stock })));

  // All stores in DB
  const stores = await prisma.store.findMany({ select: { id: true, name: true, subdomain: true, isMainBranch: true, companyId: true, ownerId: true } });
  console.log('All stores:', stores);
}

main().catch(console.error).finally(async () => {
  await prisma.$disconnect();
  await pool.end();
});
