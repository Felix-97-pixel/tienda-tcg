const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Testing dueno.demo@taptrade.cl state...');
  const user = await prisma.user.findUnique({
    where: { email: 'dueno.demo@taptrade.cl' },
    include: {
      stores: true,
      companies: true,
      storeMemberships: {
        include: { store: true },
      },
      companyMemberships: true,
    },
  });

  console.log('User found:', {
    id: user?.id,
    name: user?.name,
    role: user?.role,
    storesCount: user?.stores.length,
    companiesCount: user?.companies.length,
    storeMembershipsCount: user?.storeMemberships.length,
  });

  // Test getStoreByOwner logic
  const requestedStoreId = user?.stores[0]?.id;
  console.log('Testing store lookup for requestedStoreId:', requestedStoreId);

  let store = await prisma.store.findFirst({
    where: {
      id: requestedStoreId,
      OR: [
        { ownerId: user.id },
        { members: { some: { userId: user.id } } },
        { company: { ownerId: user.id } },
        { company: { members: { some: { userId: user.id } } } },
      ],
    },
    include: {
      subscriptionPlans: true,
      originRegion: true,
      originCommune: true,
      company: {
        include: {
          stores: {
            orderBy: { createdAt: 'asc' },
          },
        },
      },
    },
  });

  console.log('Store found:', store?.name, 'isMainBranch:', store?.isMainBranch);

  // Check store features
  const storeFeatures = await prisma.storeFeature.findMany({
    where: { storeId: store.id },
    include: { feature: true },
  });
  console.log('StoreFeatures:', storeFeatures);
}

main()
  .catch((e) => console.error('Error:', e))
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

