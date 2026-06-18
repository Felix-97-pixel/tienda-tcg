import { PrismaClient } from '@prisma/client';
import { seedCore } from './seeders/seed-core';
import { seedGamesTcg } from './seeders/seed-games-tcg';
import { seedSettings } from './seeders/seed-settings';
import { seedSuperAdmin } from './seeders/seed-superadmin';
import { seedStoreDevaluations } from './seeders/seed-devaluations';
import { seedPlansAndFeatures } from './seeders/seed-plans';

import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Iniciando Seeding Maestro de la Base de Datos...');

  try {
    // 1. Datos Base Independientes
    await seedCore(prisma);

    // 2. Datos de TCG (Juegos, Categorías, Marcas, Acabados)
    // Dependen de que la tabla Game exista
    await seedGamesTcg(prisma);

    // 3. Configuraciones Globales
    // Dependen de que los Juegos ya existan para capturar sus IDs
    await seedSettings(prisma);

    // 4. Usuario SuperAdmin por defecto
    await seedSuperAdmin(prisma);

    // 5. Devaluaciones por defecto de las tiendas
    await seedStoreDevaluations(prisma);

    // 6. Planes de Suscripción y Features B2B
    await seedPlansAndFeatures(prisma);

    console.log('✅ Seeding Maestro completado exitosamente.');
  } catch (error) {
    console.error('❌ Error durante el Seeding:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();