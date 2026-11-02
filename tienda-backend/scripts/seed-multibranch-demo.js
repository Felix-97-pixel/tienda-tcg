const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('--- INICIANDO SEMILLADO MULTI-SUCURSAL ---');

  const defaultPasswordHash = await bcrypt.hash('Demo123!', 10);

  // 1. USUARIOS
  console.log('1. Creando / actualizando usuarios de prueba...');
  const usersData = [
    {
      email: 'felix@taptrade.cl',
      name: 'Félix (Super Admin)',
      role: 'SUPERADMIN',
    },
    {
      email: 'superadmin@example.com',
      name: 'Super Admin Vault',
      role: 'SUPERADMIN',
    },
    {
      email: 'dueno.demo@taptrade.cl',
      name: 'Rodrigo Dueño Demo',
      role: 'ADMIN',
    },
    {
      email: 'manager.demo@taptrade.cl',
      name: 'Matías Encargado Provi',
      role: 'ADMIN',
    },
    {
      email: 'manager.vina@taptrade.cl',
      name: 'Camila Encargada Viña',
      role: 'ADMIN',
    },
    {
      email: 'cajero.demo@taptrade.cl',
      name: 'Ignacio Cajero Provi',
      role: 'ADMIN',
    },
    {
      email: 'cajero.vina@taptrade.cl',
      name: 'Diego Cajero Viña',
      role: 'ADMIN',
    },
    {
      email: 'cliente.demo@taptrade.cl',
      name: 'Felipe Comprador TCG',
      role: 'USER',
    },
  ];

  const createdUsers = {};
  for (const u of usersData) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        name: u.name,
        role: u.role,
        password: defaultPasswordHash,
        isVerified: true,
      },
      create: {
        email: u.email,
        name: u.name,
        role: u.role,
        password: defaultPasswordHash,
        isVerified: true,
      },
    });
    createdUsers[u.email] = user;
    console.log(` -> Usuario ${u.email} listo (Rol: ${u.role})`);
  }

  // 2. HOLDING / COMPAÑÍA
  console.log('2. Configurando TapTrade Demo Holding...');
  const holding = await prisma.company.upsert({
    where: { id: '5a9a4127-1372-448b-942e-239816882090' },
    update: {
      name: 'TapTrade Demo Holding',
      rut: '77.890.123-K',
      ownerId: createdUsers['dueno.demo@taptrade.cl'].id,
      balance: '450000',
      extraBranchesCount: 1,
    },
    create: {
      id: '5a9a4127-1372-448b-942e-239816882090',
      name: 'TapTrade Demo Holding',
      rut: '77.890.123-K',
      ownerId: createdUsers['dueno.demo@taptrade.cl'].id,
      balance: '450000',
      extraBranchesCount: 1,
    },
  });

  // 3. SUCURSAL 1: DEMO MATRIZ PROVIDENCIA
  console.log('3. Configurando Demo Matriz Providencia...');
  const proviStore = await prisma.store.upsert({
    where: { id: '78a09ea6-05fc-47f5-b68e-bc185269b3b3' },
    update: {
      name: 'Demo Matriz Providencia',
      subdomain: 'demo-provi',
      companyId: holding.id,
      ownerId: createdUsers['dueno.demo@taptrade.cl'].id,
      isMainBranch: true,
      address: 'Av. Providencia 2124, Local 42, Providencia, Santiago',
      pickupEnabled: true,
      pickupAddress: 'Av. Providencia 2124, Local 42, Santiago',
      pickupSchedule: 'Lunes a Viernes 11:00 a 19:30 hrs',
    },
    create: {
      id: '78a09ea6-05fc-47f5-b68e-bc185269b3b3',
      name: 'Demo Matriz Providencia',
      subdomain: 'demo-provi',
      companyId: holding.id,
      ownerId: createdUsers['dueno.demo@taptrade.cl'].id,
      isMainBranch: true,
      address: 'Av. Providencia 2124, Local 42, Providencia, Santiago',
      pickupEnabled: true,
      pickupAddress: 'Av. Providencia 2124, Local 42, Santiago',
      pickupSchedule: 'Lunes a Viernes 11:00 a 19:30 hrs',
    },
  });

  // 4. SUCURSAL 2: DEMO VIÑA DEL MAR
  console.log('4. Configurando Demo Viña del Mar...');
  const vinaStore = await prisma.store.upsert({
    where: { id: '0924eff4-0a0f-46a0-ac8c-f6cffd1eb27b' },
    update: {
      name: 'Demo Viña del Mar',
      subdomain: 'demo-vina',
      companyId: holding.id,
      ownerId: createdUsers['dueno.demo@taptrade.cl'].id,
      isMainBranch: false,
      address: 'Calle Valparaíso 542, Viña del Mar',
      pickupEnabled: true,
      pickupAddress: 'Calle Valparaíso 542, Viña del Mar',
      pickupSchedule: 'Lunes a Sábado 12:00 a 20:00 hrs',
    },
    create: {
      id: '0924eff4-0a0f-46a0-ac8c-f6cffd1eb27b',
      name: 'Demo Viña del Mar',
      subdomain: 'demo-vina',
      companyId: holding.id,
      ownerId: createdUsers['dueno.demo@taptrade.cl'].id,
      isMainBranch: false,
      address: 'Calle Valparaíso 542, Viña del Mar',
      pickupEnabled: true,
      pickupAddress: 'Calle Valparaíso 542, Viña del Mar',
      pickupSchedule: 'Lunes a Sábado 12:00 a 20:00 hrs',
    },
  });

  // 5. ASIGNACIÓN DE ROLES (CompanyMember & StoreMember)
  console.log('5. Asignando membresías corporativas y de sucursal...');
  await prisma.companyMember.upsert({
    where: {
      companyId_userId: {
        companyId: holding.id,
        userId: createdUsers['dueno.demo@taptrade.cl'].id,
      },
    },
    update: { role: 'OWNER' },
    create: {
      companyId: holding.id,
      userId: createdUsers['dueno.demo@taptrade.cl'].id,
      role: 'OWNER',
    },
  });
  console.log(' -> CompanyMember OWNER configurado para dueno.demo@taptrade.cl');

  const memberships = [
    // Providencia
    { storeId: proviStore.id, userEmail: 'dueno.demo@taptrade.cl', role: 'BRANCH_MANAGER' },
    { storeId: proviStore.id, userEmail: 'manager.demo@taptrade.cl', role: 'BRANCH_MANAGER' },
    { storeId: proviStore.id, userEmail: 'cajero.demo@taptrade.cl', role: 'CASHIER' },
    // Viña del Mar
    { storeId: vinaStore.id, userEmail: 'dueno.demo@taptrade.cl', role: 'BRANCH_MANAGER' },
    { storeId: vinaStore.id, userEmail: 'manager.vina@taptrade.cl', role: 'BRANCH_MANAGER' },
    { storeId: vinaStore.id, userEmail: 'cajero.vina@taptrade.cl', role: 'CASHIER' },
  ];

  for (const m of memberships) {
    const u = createdUsers[m.userEmail];
    await prisma.storeMember.upsert({
      where: {
        storeId_userId: {
          storeId: m.storeId,
          userId: u.id,
        },
      },
      update: { role: m.role },
      create: {
        storeId: m.storeId,
        userId: u.id,
        role: m.role,
      },
    });
    console.log(` -> Membresía: ${m.userEmail} es ${m.role} en ${m.storeId === proviStore.id ? 'Providencia' : 'Viña'}`);
  }

  // 6. METADATOS AUXILIARES
  const langEn = await prisma.language.findFirst({ where: { code: 'en' } });
  const langEs = await prisma.language.findFirst({ where: { code: 'es' } });
  const condNM = await prisma.condition.findFirst({ where: { name: 'near_mint' } });
  const condLP = await prisma.condition.findFirst({ where: { name: 'light_played' } });
  const finishNormal = await prisma.finish.findFirst({ where: { name: 'Normal' } });
  const finishFoil = await prisma.finish.findFirst({ where: { name: 'Foil' } });

  // 7. PRODUCTOS DIFERENCIADOS POR SUCURSAL
  console.log('7. Limpiando y poblando inventario físico diferenciado...');
  await prisma.inventoryItem.deleteMany({
    where: { storeId: { in: [proviStore.id, vinaStore.id] } },
  });

  // A. Providencia
  // Counterspell NM Foil -> 15.00 USD, 4 stock
  await prisma.inventoryItem.create({
    data: {
      storeId: proviStore.id,
      productId: '013f6f80-245e-474d-a014-d6880c8357bd', // Counterspell
      languageId: langEn.id,
      conditionId: condNM.id,
      finishId: finishFoil.id,
      price: 15.0,
      stock: 4,
      isPublished: true,
    },
  });

  // Counterspell NM Spanish Normal -> 4.50 USD, 12 stock
  await prisma.inventoryItem.create({
    data: {
      storeId: proviStore.id,
      productId: '013f6f80-245e-474d-a014-d6880c8357bd', // Counterspell
      languageId: langEs.id,
      conditionId: condNM.id,
      finishId: finishNormal.id,
      price: 4.5,
      stock: 12,
      isPublished: true,
    },
  });

  // Arcane Signet NM English Normal -> 2.80 USD, 8 stock
  await prisma.inventoryItem.create({
    data: {
      storeId: proviStore.id,
      productId: '000229d4-df57-4e62-b3e8-c3891ad74f92', // Arcane Signet
      languageId: langEn.id,
      conditionId: condNM.id,
      finishId: finishNormal.id,
      price: 2.8,
      stock: 8,
      isPublished: true,
    },
  });

  // Lotus Blossom NM English Normal -> 25.00 USD, 2 stock
  await prisma.inventoryItem.create({
    data: {
      storeId: proviStore.id,
      productId: '01a22628-9ae7-4a54-815f-3af90d8a48b1', // Lotus Blossom
      languageId: langEn.id,
      conditionId: condNM.id,
      finishId: finishNormal.id,
      price: 25.0,
      stock: 2,
      isPublished: true,
    },
  });
  console.log(' -> Providencia: 4 variantes de inventario creadas.');

  // B. Viña del Mar
  // Counterspell LP English Normal -> 3.50 USD, 2 stock (Diferente estado, precio y stock que Provi)
  await prisma.inventoryItem.create({
    data: {
      storeId: vinaStore.id,
      productId: '013f6f80-245e-474d-a014-d6880c8357bd', // Counterspell
      languageId: langEn.id,
      conditionId: condLP.id,
      finishId: finishNormal.id,
      price: 3.5,
      stock: 2,
      isPublished: true,
    },
  });

  // Charizard NM English Holofoil -> 250.00 USD, 1 stock (Exclusiva de Viña del Mar)
  await prisma.inventoryItem.create({
    data: {
      storeId: vinaStore.id,
      productId: '01cb3510-04c4-49ff-856b-ccffe9ca69eb', // Charizard
      languageId: langEn.id,
      conditionId: condNM.id,
      finishId: finishFoil ? finishFoil.id : finishNormal.id,
      price: 250.0,
      stock: 1,
      isPublished: true,
    },
  });

  // Myr Battlesphere NM English Normal -> 5.00 USD, 5 stock
  await prisma.inventoryItem.create({
    data: {
      storeId: vinaStore.id,
      productId: '00006bf6-4597-44be-aa88-1aa65d75d1a0', // Myr Battlesphere
      languageId: langEn.id,
      conditionId: condNM.id,
      finishId: finishNormal.id,
      price: 5.0,
      stock: 5,
      isPublished: true,
    },
  });
  console.log(' -> Viña del Mar: 3 variantes de inventario creadas.');

  // 8. BUYLIST (COMPRA DE CARTAS)
  console.log('8. Poblando solicitudes de Buylist diferenciadas...');
  await prisma.buyListItem.deleteMany({
    where: { storeId: { in: [proviStore.id, vinaStore.id] } },
  });

  // Provi busca Counterspell
  await prisma.buyListItem.create({
    data: {
      storeId: proviStore.id,
      productId: '013f6f80-245e-474d-a014-d6880c8357bd',
      languageId: langEn.id,
      conditionId: condNM.id,
      cashPrice: 2500,
      creditPrice: 3500,
      quantityWanted: 10,
      isActive: true,
    },
  });

  // Viña busca Charizard
  await prisma.buyListItem.create({
    data: {
      storeId: vinaStore.id,
      productId: '01cb3510-04c4-49ff-856b-ccffe9ca69eb',
      languageId: langEn.id,
      conditionId: condNM.id,
      cashPrice: 180000,
      creditPrice: 220000,
      quantityWanted: 2,
      isActive: true,
    },
  });

  // 9. TURNOS DE CAJA POS
  console.log('9. Configurando turnos de caja POS...');
  // Cerrar turnos previos de estas tiendas
  await prisma.cashShift.updateMany({
    where: { storeId: { in: [proviStore.id, vinaStore.id] }, status: 'OPEN' },
    data: { status: 'CLOSED', closedAt: new Date() },
  });

  // Providencia: Turno ABIERTO
  await prisma.cashShift.create({
    data: {
      storeId: proviStore.id,
      cashierName: 'Ignacio Cajero Provi',
      initialCash: 50000,
      status: 'OPEN',
      openedAt: new Date(),
    },
  });

  // Viña del Mar: Turno CERRADO del día de ayer
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  await prisma.cashShift.create({
    data: {
      storeId: vinaStore.id,
      cashierName: 'Diego Cajero Viña',
      initialCash: 40000,
      actualCash: 120000,
      difference: 0,
      status: 'CLOSED',
      openedAt: yesterday,
      closedAt: new Date(yesterday.getTime() + 8 * 60 * 60 * 1000),
      notes: 'Arqueo de caja cuadrado turno anterior',
    },
  });

  // 10. CRÉDITO DE TIENDA (STORE CREDIT) PARA EL CLIENTE DE PRUEBA
  console.log('10. Asignando Store Credit al cliente de prueba...');
  const clienteUser = createdUsers['cliente.demo@taptrade.cl'];
  await prisma.storeCredit.upsert({
    where: {
      storeId_userId: {
        userId: clienteUser.id,
        storeId: proviStore.id,
      },
    },
    update: { balance: 25000 },
    create: {
      userId: clienteUser.id,
      storeId: proviStore.id,
      balance: 25000,
    },
  });

  await prisma.storeCredit.upsert({
    where: {
      storeId_userId: {
        userId: clienteUser.id,
        storeId: vinaStore.id,
      },
    },
    update: { balance: 10000 },
    create: {
      userId: clienteUser.id,
      storeId: vinaStore.id,
      balance: 10000,
    },
  });

  console.log('--- SEMILLADO MULTI-SUCURSAL COMPLETADO CON ÉXITO ---');
}

main()
  .catch((e) => {
    console.error('Error durante el semillado:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
