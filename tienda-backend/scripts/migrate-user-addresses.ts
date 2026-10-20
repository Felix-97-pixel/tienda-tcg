import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🔄 Sincronizando direcciones existentes de usuarios a la nueva tabla Address...');
  
  const users = await prisma.user.findMany({
    where: {
      address: { not: null },
    },
    include: {
      addresses: true,
    },
  });

  console.log(`Encontrados ${users.length} usuarios con dirección en perfil.`);

  let createdCount = 0;
  for (const user of users) {
    if (user.addresses.length === 0 && user.address) {
      await prisma.address.create({
        data: {
          userId: user.id,
          alias: 'Predeterminada',
          name: user.name || 'Destinatario',
          phone: user.phone || '+56 9 0000 0000',
          address: user.address,
          city: user.city || user.cityCode || 'Santiago Centro',
          cityCode: user.cityCode || 'SANTIAGO',
          regionCode: user.regionCode || 'RM',
          isDefault: true,
        },
      });
      createdCount++;
      console.log(`✅ Creada dirección inicial para usuario ${user.email} (${user.name})`);
    }
  }

  console.log(`🎉 Migración finalizada: ${createdCount} direcciones migradas.`);
}

main()
  .catch((e) => {
    console.error('❌ Error en migración:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
