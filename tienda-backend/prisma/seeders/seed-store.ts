import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = 'store@taptrade.cl';
  const password = '123456';
  const hashedPassword = await bcrypt.hash(password, 10);

  // 1. Create a Store User (ADMIN)
  const storeUser = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      role: 'ADMIN',
    },
    create: {
      email,
      name: 'Tienda Oficial TapTrade',
      password: hashedPassword,
      role: 'ADMIN',
      isVerified: true,
    },
  });

  // 2. Create the Store Profile
  const store = await prisma.store.upsert({
    where: { ownerId: storeUser.id },
    update: {
      name: 'TapTrade Store',
      subdomain: 'taptrade',
    },
    create: {
      ownerId: storeUser.id,
      name: 'TapTrade Store',
      subdomain: 'taptrade',
      logoUrl: 'https://cdn-icons-png.flaticon.com/512/869/869045.png' // A generic store icon
    }
  });

  // 3. Create a Category and Product if missing
  const category = await prisma.category.upsert({
    where: { slug: 'tcg-singles' },
    update: {},
    create: {
      name: 'TCG Singles',
      slug: 'tcg-singles',
      isTcg: true
    }
  });

  const product = await prisma.product.upsert({
    where: { externalId: 'demo-charizard-1' },
    update: {},
    create: {
      externalId: 'demo-charizard-1',
      name: 'Charizard VMAX',
      description: 'Una carta muy poderosa',
      imageUrl: 'https://images.pokemontcg.io/swsh3/20_hires.png',
      categoryId: category.id,
    }
  });

  // 4. Add Inventory Item for this Store
  const condition = await prisma.condition.upsert({
    where: { name: 'NM' },
    update: {},
    create: { name: 'NM' }
  });

  const language = await prisma.language.upsert({
    where: { code: 'es' },
    update: {},
    create: { name: 'Spanish', code: 'es' }
  });

  await prisma.inventoryItem.create({
    data: {
      productId: product.id,
      storeId: store.id,
      stock: 5,
      price: 150000,
      conditionId: condition.id,
      languageId: language.id
    }
  });

  console.log('✅ Demo Store and Inventory created successfully!');
  console.log(`Store URL: http://localhost:3000/store/${store.subdomain}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
