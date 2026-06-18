import { PrismaClient } from '@prisma/client';

export async function seedPlansAndFeatures(prisma: PrismaClient) {
  console.log('--- Iniciando Seeding de Funciones (Features) y Planes ---');

  // 1. Crear Features (Addons)
  const featuresData = [
    {
      key: 'addon:estadisticas',
      name: 'Estadísticas Detalladas',
      description: 'Paneles avanzados para analizar ventas y tendencias.',
      price: 0.5
    },
    {
      key: 'addon:buylist',
      name: 'Buylist Automatizada',
      description: 'Portal para comprar cartas a tus clientes.',
      price: 1.0
    },
    {
      key: 'addon:radar',
      name: 'Radar de Demanda',
      description: 'Visualiza wishlists de jugadores.',
      price: 0.5
    }
  ];

  for (const f of featuresData) {
    await prisma.feature.upsert({
      where: { key: f.key },
      update: { name: f.name, description: f.description, price: f.price },
      create: f
    });
  }

  // 2. Crear Planes
  const plansData = [
    {
      name: 'Plan Dealer',
      description: 'Para vendedores serios que se mueven en torneos.',
      price: 1.5,
      skuLimit: 3000,
      commissionRate: 0.065
    },
    {
      name: 'Plan Store',
      description: 'Para tiendas en crecimiento que necesitan gestión sólida.',
      price: 3.5,
      skuLimit: 15000,
      commissionRate: 0.055
    },
    {
      name: 'Plan Mega Store',
      description: 'Para tiendas consolidadas con inventarios inmensos.',
      price: 7.0,
      skuLimit: 60000,
      commissionRate: 0.040
    },
    {
      name: 'Plan Enterprise',
      description: 'Operación a gran escala sin restricciones.',
      price: 15.0,
      skuLimit: -1,
      commissionRate: 0.030
    }
  ];

  for (const p of plansData) {
    await prisma.subscriptionPlan.upsert({
      where: { name: p.name },
      update: { 
        description: p.description, 
        price: p.price,
        skuLimit: p.skuLimit,
        commissionRate: p.commissionRate
      },
      create: p
    });
  }

  console.log('--- Seeding de Planes y Features Completado ---');
}
