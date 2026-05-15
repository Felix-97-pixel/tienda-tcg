import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const finishes = [
    { name: 'Normal', game: 'Magic' },
    { name: 'Foil', game: 'Magic' },
    { name: 'Etched Foil', game: 'Magic' },
    { name: 'Glossy Foil', game: 'Magic' },
    { name: 'Normal', game: 'Pokemon' },
    { name: 'Holofoil', game: 'Pokemon' },
    { name: 'Reverse Holofoil', game: 'Pokemon' },
    { name: 'Unlimited Holofoil', game: 'Pokemon' },
    { name: 'Normal', game: 'Riftbound' },
    { name: 'Foil', game: 'Riftbound' }
  ];

  for (const finish of finishes) {
    await prisma.finish.upsert({
      where: { name_game: { name: finish.name, game: finish.game } },
      update: {},
      create: finish,
    });
  }

  console.log('Finishes seeded successfully!');
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
