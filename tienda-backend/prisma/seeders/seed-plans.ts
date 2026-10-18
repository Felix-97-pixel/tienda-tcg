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

  // 2. Crear Planes (Modelo SaaS: 0% Comisión)
  const plansData = [
    {
      name: 'Plan Starter',
      description: 'Para tiendas pequeñas y emprendedores. Catálogo de hasta 1.500 cartas para optimizar recursos.',
      price: 1.5,
      skuLimit: 1500,
      commissionRate: 0.0,
      isStandard: true
    },
    {
      name: 'Plan Store',
      description: 'Para tiendas en crecimiento que necesitan gestión sólida y catálogo medio.',
      price: 3.5,
      skuLimit: 7500,
      commissionRate: 0.0,
      isStandard: true
    },
    {
      name: 'Plan Mega Store',
      description: 'Para tiendas consolidadas con inventarios medianos a grandes.',
      price: 7.0,
      skuLimit: 30000,
      commissionRate: 0.0,
      isStandard: true
    },
    {
      name: 'Plan Enterprise',
      description: 'Operación a gran escala sin restricciones. Tarifa regular 15 UF.',
      price: 15.0,
      skuLimit: -1,
      commissionRate: 0.0,
      isStandard: true
    },
    {
      name: 'Plan Enterprise (Oferta)',
      description: 'Tarifa preferencial para cuentas enterprise negociadas (7.5 UF/mes).',
      price: 7.5,
      skuLimit: -1,
      commissionRate: 0.0,
      isStandard: false
    },
    {
      name: 'Plan Pioneras (Oferta)',
      description: 'Tarifa preferencial para tiendas pioneras (Early Adopters) rebajada a 5 UF/mes.',
      price: 5.0,
      skuLimit: 20000,
      commissionRate: 0.0,
      isStandard: false
    }
  ];

  for (const p of plansData) {
    await prisma.subscriptionPlan.upsert({
      where: { name: p.name },
      update: { 
        description: p.description, 
        price: p.price,
        skuLimit: p.skuLimit,
        commissionRate: p.commissionRate,
        isStandard: p.isStandard
      },
      create: p
    });
  }

  console.log('--- Seeding de Planes y Features Completado ---');
}
