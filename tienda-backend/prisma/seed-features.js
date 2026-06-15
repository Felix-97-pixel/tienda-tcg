const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const defaultFeatures = [
    { key: 'game:magic', name: 'Magic: The Gathering', description: 'Acceso a cartas y catálogo de Magic', price: 0 },
    { key: 'game:riftbound', name: 'Riftbound', description: 'Acceso a cartas y catálogo de Riftbound', price: 0 },
    { key: 'module:statistics', name: 'Módulo de Estadísticas', description: 'Acceso avanzado a gráficas de ventas y reportes', price: 5000 },
    { key: 'module:non_tcg', name: 'Productos Non-TCG', description: 'Venta de carpetas, folios y accesorios', price: 2000 },
  ];

  console.log('Seeding default features...');
  for (const feature of defaultFeatures) {
    await prisma.feature.upsert({
      where: { key: feature.key },
      update: { name: feature.name, description: feature.description, price: feature.price },
      create: feature,
    });
  }

  // Create a default FREE plan
  const freePlan = await prisma.subscriptionPlan.upsert({
    where: { name: 'Free' },
    update: {},
    create: {
      name: 'Free',
      description: 'Plan gratuito con acceso a MTG',
      price: 0,
      features: {
        connect: [{ key: 'game:magic' }]
      }
    }
  });

  console.log('Default features and Free plan seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
