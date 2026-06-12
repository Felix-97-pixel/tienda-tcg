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
  const email = 'felix@taptrade.cl';
  const password = '123456';
  
  const hashedPassword = await bcrypt.hash(password, 10);

  const superAdmin = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      role: 'SUPERADMIN',
    },
    create: {
      email,
      name: 'Félix (Super Admin)',
      password: hashedPassword,
      role: 'SUPERADMIN',
      isVerified: true,
    },
  });

  console.log('✅ Super Admin created successfully!');
  console.log(`Email: ${superAdmin.email}`);
  console.log(`Role: ${superAdmin.role}`);
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
