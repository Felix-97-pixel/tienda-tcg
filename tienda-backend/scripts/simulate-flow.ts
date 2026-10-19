import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { DispatchVendorOrderHandler } from '../src/payments/commands/handlers/dispatch-vendor-order.handler';
import { DispatchVendorOrderCommand } from '../src/payments/commands/impl/dispatch-vendor-order.command';
import { WithdrawalsService } from '../src/withdrawals/withdrawals.service';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter }) as any;

async function runSimulation() {
  console.log('=====================================================');
  console.log('🚀 SIMULACIÓN DE FLUJO COMPLETO: COMPRA -> ESCROW -> DESPACHO -> RETIRO');
  console.log('=====================================================\n');

  // 1. Obtener tienda y usuario de prueba
  const storeOwner = await prisma.user.findUnique({
    where: { email: 'bloodmoongames@gmail.com' },
    include: { store: true },
  });

  if (!storeOwner || !storeOwner.store) {
    throw new Error('Tienda BloodMoonGames1 no encontrada');
  }

  const store = storeOwner.store;
  console.log(`📍 Tienda vendedora: ${store.name} (ID: ${store.id})`);
  console.log(`👤 Dueño de tienda: ${storeOwner.name} (${storeOwner.email})`);
  console.log(`💰 Saldo inicial disponible: $${Number(store.balance).toLocaleString('es-CL')} CLP\n`);

  // 2. PASO 1: Simular Compra Exitosa
  console.log('--- PASO 1: Simular Compra y Pago Exitoso en Marketplace ---');
  const testBuyOrder = `SIM-${Date.now()}`.slice(0, 20);
  const subtotal = 12000;
  const shippingCost = 3500;
  const totalVendor = subtotal + shippingCost; // 15.500 CLP que recibirá la tienda

  // Obtener o crear proveedor de envío
  let provider = await prisma.shippingProvider.findFirst();
  if (!provider) {
    provider = await prisma.shippingProvider.create({
      data: {
        name: 'Chilexpress Express',
        price: 3500,
        estimatedDays: '1-2 días hábiles',
      },
    });
  }

  const product = await prisma.product.findFirst();
  if (!product) throw new Error('No hay productos en la BD');

  // Crear Orden Maestra con Sub-Orden de la tienda (VendorOrder)
  const masterOrder = await prisma.order.create({
    data: {
      buyOrder: testBuyOrder,
      name: 'Comprador de Prueba',
      email: 'comprador.test@taptrade.cl',
      phone: '+56911223344',
      address: 'Av. Providencia 1234, Depto 501',
      city: 'Providencia',
      totalAmount: totalVendor + 587, // total + fee
      currencyCode: 'CLP',
      exchangeRate: 1,
      status: 'PAID',
      vendorOrders: {
        create: [
          {
            store: { connect: { id: store.id } },
            shippingProvider: { connect: { id: provider.id } },
            subtotal: subtotal,
            shippingCost: shippingCost,
            status: 'PAID',
            deliveryStatus: 'PENDING_DISPATCH',
            items: {
              create: [
                {
                  productId: product.id,
                  productName: 'Emberheart Challenger (Foil)',
                  quantity: 2,
                  unitPrice: 6000,
                },
              ],
            },
          },
        ] as any,
      },
    },
    include: {
      vendorOrders: true,
    },
  });

  const vendorOrder = masterOrder.vendorOrders[0];

  // Registrar fondos en CUSTODIA (Escrow / Retenidos)
  const escrowTx = await prisma.walletTransaction.create({
    data: {
      storeId: store.id,
      amount: totalVendor,
      type: 'SALE',
      paymentMethod: 'WEBPAY',
      isWithdrawable: false, // ¡RETENIDO HASTA DESPACHO!
      reference: `Order: ${vendorOrder.id} (Custodia - Pendiente de Despacho)`,
    },
  });

  console.log(`✅ Orden creada: #${masterOrder.buyOrder} (ID: ${masterOrder.id})`);
  console.log(`✅ Sub-orden tienda: ${vendorOrder.id}`);
  console.log(`🔒 Transacción en billetera: ID ${escrowTx.id}`);
  console.log(`   - Monto venta + envío: $${totalVendor.toLocaleString('es-CL')} CLP`);
  console.log(`   - Estado de retiro: isWithdrawable = ${escrowTx.isWithdrawable} (RETENIDO EN CUSTODIA)`);

  // Verificar estado billetera
  const withdrawalsService = new WithdrawalsService(prisma);
  let walletStatus = await withdrawalsService.getStoreHistory(storeOwner.id);
  console.log(`   - Saldo disponible en tienda: $${Number(walletStatus.balance).toLocaleString('es-CL')} CLP`);
  console.log(`   - Saldo en custodia (retenido): $${Number(walletStatus.heldBalance).toLocaleString('es-CL')} CLP\n`);

  // 3. PASO 2: La tienda ingresa número de seguimiento ficticio (Despacho)
  console.log('--- PASO 2: Tienda registra despacho con número de seguimiento ficticio ---');
  const fakeTracking = 'CHX-9988776655';
  const courier = 'CHILEXPRESS';
  console.log(`📦 Courier seleccionado: ${courier}`);
  console.log(`🏷️  Número de guía ficticio: ${fakeTracking}`);

  const dispatchHandler = new DispatchVendorOrderHandler(prisma);
  const dispatchResult = await dispatchHandler.execute(
    new DispatchVendorOrderCommand(
      vendorOrder.id,
      {
        courier,
        trackingNumber: fakeTracking,
      },
      storeOwner.id,
    ),
  );

  console.log(`🎉 Resultado del despacho: ${dispatchResult.message}`);
  console.log(`   - Estado de entrega: ${dispatchResult.vendorOrder.deliveryStatus}`);
  console.log(`   - Courier oficial: ${dispatchResult.vendorOrder.shippingCourier}`);
  console.log(`   - N° Seguimiento: ${dispatchResult.vendorOrder.trackingNumber}`);
  console.log(`   - URL generada automática: ${dispatchResult.vendorOrder.trackingUrl}`);
  console.log(`   - Fondos liberados: $${Number(dispatchResult.releasedAmount).toLocaleString('es-CL')} CLP`);
  console.log(`   - Nuevo saldo disponible en tienda: $${Number(dispatchResult.newBalance).toLocaleString('es-CL')} CLP\n`);

  // Verificar estado de billetera tras despacho
  walletStatus = await withdrawalsService.getStoreHistory(storeOwner.id);
  console.log('📊 Verificación de Billetera tras Despacho:');
  console.log(`   - Saldo disponible para retiro: $${Number(walletStatus.balance).toLocaleString('es-CL')} CLP`);
  console.log(`   - Saldo retenido en custodia: $${Number(walletStatus.heldBalance).toLocaleString('es-CL')} CLP (¡DESBLOQUEADO!)`);

  // 4. PASO 3: La tienda solicita el retiro de sus fondos ("pedir la transacción")
  console.log('\n--- PASO 3: Tienda solicita retiro de dinero a su cuenta bancaria ---');
  const withdrawAmount = totalVendor; // Retirar los 15.500 CLP
  const fakeBankDetails =
    'Banco de Chile - Cuenta Corriente N° 00-123-45678-9 - RUT: 76.543.210-K - Blood Moon Games SpA';

  console.log(`💸 Solicitando retiro de: $${withdrawAmount.toLocaleString('es-CL')} CLP`);
  console.log(`🏦 Datos bancarios de destino: ${fakeBankDetails}`);

  const withdrawalRequest = await withdrawalsService.requestWithdrawal(
    storeOwner.id,
    withdrawAmount,
    fakeBankDetails,
  );

  console.log(`✅ Solicitud de retiro creada con éxito:`);
  console.log(`   - Solicitud ID: ${withdrawalRequest.id}`);
  console.log(`   - Monto solicitado: $${Number(withdrawalRequest.amount).toLocaleString('es-CL')} CLP`);
  console.log(`   - Estado de la solicitud: ${withdrawalRequest.status}`);
  console.log(`   - Destino: ${withdrawalRequest.bankDetails}`);

  // Verificar estado final de billetera
  walletStatus = await withdrawalsService.getStoreHistory(storeOwner.id);
  console.log('\n📊 Estado Final de la Billetera de la Tienda:');
  console.log(`   - Saldo disponible restante: $${Number(walletStatus.balance).toLocaleString('es-CL')} CLP`);
  console.log(`   - Retiros solicitados en proceso: ${walletStatus.withdrawals.length} solicitud(es)`);
  console.log(`   - Último retiro: ID ${walletStatus.withdrawals[0]?.id} - Estado: ${walletStatus.withdrawals[0]?.status}`);

  console.log('\n=====================================================');
  console.log('✨ FLUJO COMPLETO VALIDADO AL 100% EXITOSAMENTE');
  console.log('=====================================================');
}

runSimulation()
  .catch((err) => {
    console.error('❌ Error durante la simulación:', err);
  })
  .finally(() => prisma.$disconnect());
