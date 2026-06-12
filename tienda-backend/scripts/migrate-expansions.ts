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
  console.log("Iniciando migración de Expansiones...");

  // 1. Obtener todas las expansiones únicas de CardDetail
  const uniqueExpansions = await prisma.cardDetail.findMany({
    distinct: ['expansion', 'game'],
    select: {
      expansion: true,
      game: true,
    },
  });

  console.log(`Encontradas ${uniqueExpansions.length} expansiones únicas.`);

  for (const { expansion, game } of uniqueExpansions) {
    if (!expansion) continue;

    console.log(`Procesando: [${game}] ${expansion}`);

    let expRecord = await prisma.expansion.findFirst({
      where: { name: expansion, game: game },
    });

    if (!expRecord) {
      expRecord = await prisma.expansion.create({
        data: {
          name: expansion,
          game: game,
        },
      });
      console.log(`  -> Creada en tabla Expansion: ID ${expRecord.id}`);
    }

    const updateResult = await prisma.cardDetail.updateMany({
      where: {
        expansion: expansion,
        game: game,
        expansionId: null,
      },
      data: {
        expansionId: expRecord.id,
      },
    });

    console.log(`  -> Actualizadas ${updateResult.count} cartas.`);
  }

  console.log("¡Migración completada exitosamente!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
