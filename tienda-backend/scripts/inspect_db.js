require('dotenv').config();
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
  const users = await prisma.user.findMany({
    select: { id: true, email: true, role: true, name: true },
  });
  console.log('--- USERS ---');
  console.log(users);

  const companies = await prisma.company.findMany({
    include: {
      stores: {
        select: { id: true, name: true, subdomain: true, isMainBranch: true },
      },
    },
  });
  console.log('--- COMPANIES ---');
  console.log(JSON.stringify(companies, null, 2));

  const storeMembers = await prisma.storeMember.findMany({
    include: {
      user: { select: { email: true } },
      store: { select: { name: true } },
    },
  });
  console.log('--- STORE MEMBERS ---');
  console.log(storeMembers);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

