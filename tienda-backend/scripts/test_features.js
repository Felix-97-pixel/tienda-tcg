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
  const storeId = '78a09ea6-05fc-47f5-b68e-bc185269b3b3';
  const store = await prisma.store.findUnique({
    where: { id: storeId },
    include: {
      subscriptionPlans: { include: { features: true } },
      customFeatures: true,
      gameExchangeRates: true,
    },
  });
  console.log('Store found:', store?.name);
  console.log('subscriptionPlans:', store?.subscriptionPlans);
  console.log('customFeatures:', store?.customFeatures);

  const planFeatures = store.subscriptionPlans?.flatMap(p => p.features.map(f => f.key)) || [];
  const customFeats = store.customFeatures?.map(f => f.key) || [];
  const features = Array.from(new Set([...planFeatures, ...customFeats]));
  console.log('Calculated features:', features);
}

main()
  .catch((e) => console.error('Error:', e))
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

