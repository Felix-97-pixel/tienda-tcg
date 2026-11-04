import { PrismaClient } from '@prisma/client';

export async function seedPlansAndFeatures(prisma: PrismaClient) {
  console.log('--- Iniciando Seeding de Planes SaaS ---');

  // Planes (Modelo SaaS Puro: 0% Comisión por Venta)
  const plansData = [
    {
      name: 'Plan Starter',
      description: 'Para tiendas pequeñas y dealers independientes. Catálogo total de hasta 1.500 SKUs.',
      price: 1.50,
      skuLimit: 1500,
      commissionRate: 0.0,
      isStandard: true
    },
    {
      name: 'Plan Store',
      description: 'Para tiendas en crecimiento que necesitan gestión sólida y catálogo de hasta 6.000 SKUs.',
      price: 3.50,
      skuLimit: 6000,
      commissionRate: 0.0,
      isStandard: true
    },
    {
      name: 'Plan Mega Store',
      description: 'Para tiendas consolidadas con catálogo medio a grande de hasta 18.000 SKUs.',
      price: 6.50,
      skuLimit: 18000,
      commissionRate: 0.0,
      isStandard: true
    },
    {
      name: 'Plan Enterprise',
      description: 'Operación a gran escala y cadenas con catálogo ilimitado de SKUs.',
      price: 11.50,
      skuLimit: -1,
      commissionRate: 0.0,
      isStandard: true
    },
    {
      name: 'Plan Enterprise (Oferta)',
      description: 'Tarifa preferencial para cuentas enterprise negociadas (7.50 UF/mes).',
      price: 7.50,
      skuLimit: -1,
      commissionRate: 0.0,
      isStandard: false
    },
    {
      name: 'Plan Pioneras (Oferta)',
      description: 'Tarifa preferencial para tiendas pioneras (Early Adopters) rebajada a 5.00 UF/mes.',
      price: 5.00,
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

  console.log('--- Seeding de Planes SaaS Completado ---');
}
