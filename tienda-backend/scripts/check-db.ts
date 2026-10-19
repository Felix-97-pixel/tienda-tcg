import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      store: {
        select: {
          id: true,
          name: true,
          balance: true,
        },
      },
    },
  });

  const productsCount = await prisma.product.count();
  const inventory = await prisma.inventoryItem.findMany({
    take: 5,
    include: { product: true, store: true },
  });
  const ordersCount = await prisma.order.count();
  const recentOrders = await prisma.order.findMany({
    take: 3,
    orderBy: { createdAt: 'desc' },
    include: {
      vendorOrders: true,
      payment: true,
    },
  });

  console.log('--- DB SUMMARY ---');
  console.log('USERS:', JSON.stringify(users, null, 2));
  console.log('PRODUCTS COUNT:', productsCount);
  console.log(
    'INVENTORY ITEMS:',
    JSON.stringify(
      inventory.map((i) => ({
        id: i.id,
        name: i.product?.name,
        store: i.store?.name,
        storeId: i.storeId,
        price: i.price,
        stock: i.stock,
      })),
      null,
      2,
    ),
  );
  console.log('ORDERS COUNT:', ordersCount);
  console.log('RECENT ORDERS:', JSON.stringify(recentOrders, null, 2));
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
