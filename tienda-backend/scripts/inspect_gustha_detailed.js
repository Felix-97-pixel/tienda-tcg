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
  const gusthaItems = await prisma.inventoryItem.findMany({
    where: { productId: '7f6f3d49-a13a-488c-b1b6-46d24e572c72' },
    include: { store: true },
  });
  console.log('Gustha inventory items in DB:', gusthaItems);

  // Check all inventory items across all stores
  const allItems = await prisma.inventoryItem.findMany({
    include: { store: true, product: { select: { id: true, name: true } } },
  });
  console.log('Total inventory items across ALL stores:', allItems.length);
  for (const item of allItems) {
    console.log(`- Store: "${item.store?.name}" (${item.storeId}) -> Product: "${item.product?.name}" (Stock: ${item.stock}, Price: ${item.price}, isPublished: ${item.isPublished})`);
  }
}

main().catch(console.error).finally(async () => {
  await prisma.$disconnect();
  await pool.end();
});

