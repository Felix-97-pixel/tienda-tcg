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
  const u = await prisma.user.findUnique({
    where: { email: 'dueno.demo@taptrade.cl' },
    include: {
      companyMemberships: {
        include: { company: { include: { stores: true } } },
      },
      companies: {
        include: { stores: true },
      },
      storeMemberships: {
        include: { store: true },
      },
      stores: true,
    },
  });
  console.log('User dueno.demo:', {
    id: u.id,
    email: u.email,
    companies: u.companies.map(c => ({ id: c.id, name: c.name, stores: c.stores.map(s => s.name) })),
    companyMemberships: u.companyMemberships,
    storeMemberships: u.storeMemberships.map(sm => ({ store: sm.store.name, role: sm.role })),
  });
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

