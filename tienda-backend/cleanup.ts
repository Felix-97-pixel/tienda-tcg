import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Iniciando limpieza de inventario global...');
  const result = await prisma.inventoryItem.deleteMany({
    where: { storeId: null }
  });
  console.log(`¡Limpieza completada! Se borraron ${result.count} filas basura de InventoryItem.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
