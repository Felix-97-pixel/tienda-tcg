import { PrismaClient } from '@prisma/client';

export async function seedStoreDevaluations(prisma: PrismaClient) {
  console.log('--- Seeding Store Devaluations ---');

  const stores = await prisma.store.findMany();
  const conditions = await prisma.condition.findMany();

  const defaultMultipliers: Record<string, number> = {
    'near_mint': 1.0,
    'lightly_played': 0.8,
    'moderately_played': 0.6,
    'heavily_played': 0.4,
    'damaged': 0.2
  };

  let count = 0;

  for (const store of stores) {
    for (const condition of conditions) {
      const multiplier = defaultMultipliers[condition.name] || 1.0;
      
      await prisma.storeConditionDevaluation.upsert({
        where: {
          storeId_conditionId: {
            storeId: store.id,
            conditionId: condition.id
          }
        },
        update: {}, // Si ya existe, no lo tocamos
        create: {
          storeId: store.id,
          conditionId: condition.id,
          multiplier: multiplier
        }
      });
      count++;
    }
  }

  console.log(`✅ Default devaluations created for existing stores (${count} records).`);
}
