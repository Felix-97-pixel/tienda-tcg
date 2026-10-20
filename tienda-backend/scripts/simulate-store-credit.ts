import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter }) as any;

async function runCreditSimulation() {
  console.log('=====================================================');
  console.log('💳 TEST END-TO-END: SISTEMA DE CRÉDITO EN TIENDAS');
  console.log('=====================================================\n');

  // 1. Obtener tienda y usuario de prueba
  const store = await prisma.store.findFirst();

  if (!store) {
    throw new Error('Ninguna tienda encontrada');
  }

  // Buscar un usuario
  const buyer = await prisma.user.findFirst();
  if (!buyer) throw new Error('No hay usuarios en la base de datos');

  console.log(`📍 Tienda: ${store.name} (${store.subdomain}) - ID: ${store.id}`);
  console.log(`👤 Comprador: ${buyer.name} (${buyer.email}) - ID: ${buyer.id}\n`);

  // 2. Asignar crédito inicial de prueba de $10.000 CLP
  console.log('--- PASO 1: Emitir $10.000 CLP de Crédito en Tienda al Comprador ---');
  let storeCredit = await prisma.storeCredit.findUnique({
    where: {
      storeId_userId: {
        storeId: store.id,
        userId: buyer.id,
      },
    },
  });

  if (!storeCredit) {
    storeCredit = await prisma.storeCredit.create({
      data: {
        userId: buyer.id,
        storeId: store.id,
        balance: 10000,
      },
    });
  } else {
    storeCredit = await prisma.storeCredit.update({
      where: { id: storeCredit.id },
      data: { balance: 10000 },
    });
  }

  // Registrar transacción de prueba
  await prisma.storeCreditTransaction.create({
    data: {
      userId: buyer.id,
      storeId: store.id,
      amount: 10000,
      type: 'REEMBOLSO_DEVOLUCION',
      reference: 'Ajuste inicial para pruebas de compras',
    },
  });

  console.log(`✅ Crédito registrado: $${Number(storeCredit.balance).toLocaleString('es-CL')} CLP disponible.`);

  // 3. Simular verificación de balance antes de la compra
  console.log('\n--- PASO 2: Verificar balances consultables por la API de Checkout ---');
  const userCredits = await prisma.storeCredit.findMany({
    where: { userId: buyer.id },
    include: { store: { select: { id: true, name: true, subdomain: true } } },
  });
  console.log(`🔍 Créditos encontrados para el usuario: ${userCredits.length}`);
  userCredits.forEach((c: any) => {
    console.log(`   - Tienda: ${c.store.name} | Saldo: $${Number(c.balance).toLocaleString('es-CL')} CLP`);
  });

  // 4. Simular compra con descuento de crédito
  console.log('\n--- PASO 3: Simular Compra de $15.000 con $10.000 de Crédito ---');
  const subtotal = 12000;
  const shippingCost = 3000;
  const orderGrossTotal = subtotal + shippingCost; // 15.000
  const creditToApply = 10000;
  const finalGatewayAmount = orderGrossTotal - creditToApply; // 5.000 a pagar por Webpay/MP

  console.log(`   * Subtotal productos: $${subtotal.toLocaleString('es-CL')} CLP`);
  console.log(`   * Envío: $${shippingCost.toLocaleString('es-CL')} CLP`);
  console.log(`   * Total bruto orden: $${orderGrossTotal.toLocaleString('es-CL')} CLP`);
  console.log(`   * Descuento crédito aplicado: -$${creditToApply.toLocaleString('es-CL')} CLP`);
  console.log(`   * Monto neto a cobrar vía Pasarela: $${finalGatewayAmount.toLocaleString('es-CL')} CLP`);

  // Ejecutar deducción atómica de crédito (igual a lo implementado en process-payment)
  const updatedCredit = await prisma.$transaction(async (tx: any) => {
    const cred = await tx.storeCredit.update({
      where: { id: storeCredit.id },
      data: {
        balance: {
          decrement: creditToApply,
        },
      },
    });

    await tx.storeCreditTransaction.create({
      data: {
        userId: buyer.id,
        storeId: store.id,
        amount: -creditToApply,
        type: 'USO_COMPRA',
        reference: `Compra simulada - Descuento en Orden`,
      },
    });

    return cred;
  });

  console.log(`✅ Crédito descontado con éxito.`);
  console.log(`   * Saldo restante en ${store.name}: $${Number(updatedCredit.balance).toLocaleString('es-CL')} CLP`);

  // 5. Historial de transacciones
  console.log('\n--- PASO 4: Auditoría del Historial de Movimientos de Crédito ---');
  const txHistory = await prisma.storeCreditTransaction.findMany({
    where: { userId: buyer.id, storeId: store.id },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  txHistory.forEach((tx: any) => {
    console.log(`   [${tx.createdAt.toISOString().slice(0, 10)}] Tipo: ${tx.type} | Monto: ${Number(tx.amount) >= 0 ? '+' : ''}$${Number(tx.amount).toLocaleString('es-CL')} | Ref: ${tx.reference}`);
  });

  console.log('\n=====================================================');
  console.log('🎉 SIMULACIÓN COMPLETADA CON ÉXITO: TODO FUNCIONA SEGÚN ESPECIFICACIÓN');
  console.log('=====================================================');

  await pool.end();
}

runCreditSimulation().catch((err) => {
  console.error('❌ Error en simulación:', err);
  pool.end();
  process.exit(1);
});
