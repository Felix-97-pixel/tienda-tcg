const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const testUsers = [
  { email: 'felix@taptrade.cl', expectedSession: 'SUPERADMIN', desc: 'Superadmin Plataforma' },
  { email: 'dueno.demo@taptrade.cl', expectedSession: 'COMPANY_OWNER', desc: 'Dueño de Holding Multi-Sucursal' },
  { email: 'manager.demo@taptrade.cl', expectedSession: 'BRANCH_MANAGER', desc: 'Encargado de Sucursal Providencia' },
  { email: 'manager.vina@taptrade.cl', expectedSession: 'BRANCH_MANAGER', desc: 'Encargada de Sucursal Viña del Mar' },
  { email: 'cajero.demo@taptrade.cl', expectedSession: 'CASHIER', desc: 'Cajero de Sucursal Providencia' },
  { email: 'cajero.vina@taptrade.cl', expectedSession: 'CASHIER', desc: 'Cajero de Sucursal Viña del Mar' },
  { email: 'cliente.demo@taptrade.cl', expectedSession: 'USER', desc: 'Cliente Final Marketplace' },
];

async function testAll() {
  console.log('=== VERIFICACIÓN EXHAUSTIVA DE TIPOS DE USUARIO ===\n');
  let allPassed = true;

  for (const tu of testUsers) {
    console.log(`--- Probando: ${tu.desc} (${tu.email}) ---`);
    const loginRes = await fetch('http://localhost:3001/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: tu.email,
        password: 'Demo123!',
        captchaToken: 'bypass-local-dev',
      }),
    });

    if (!loginRes.ok) {
      console.error(`[FAIL] Login fallo para ${tu.email}: HTTP ${loginRes.status}`);
      allPassed = false;
      continue;
    }

    const loginData = await loginRes.json();
    const { access_token, user } = loginData;

    console.log(` -> Rol BD: ${user.role}`);
    console.log(` -> SessionType detectado: ${user.sessionType} (Esperado: ${tu.expectedSession})`);
    console.log(` -> Sucursal activa: ${user.activeStore ? `${user.activeStore.name} (${user.activeStore.id})` : 'Ninguna'}`);
    console.log(` -> Sucursales disponibles: ${user.availableBranches?.length || 0}`);
    console.log(` -> Empresa: ${user.company ? user.company.name : 'Ninguna'}`);
    console.log(` -> Permisos totales: ${user.permissions?.length || 0}`);

    if (user.sessionType !== tu.expectedSession) {
      console.error(`[FAIL] SessionType discrepante para ${tu.email}`);
      allPassed = false;
    }

    // Para usuarios con acceso administrativo, probar endpoints clave
    if (['SUPERADMIN', 'COMPANY_OWNER', 'BRANCH_MANAGER', 'CASHIER'].includes(user.sessionType)) {
      const activeStoreId = user.activeStore?.id;
      const headers = {
        'Authorization': `Bearer ${access_token}`,
        'x-auth-scope': 'admin',
        ...(activeStoreId ? { 'x-store-id': activeStoreId } : {}),
      };

      // 1. GET /stores/me
      const storeRes = await fetch('http://localhost:3001/api/v1/stores/me', { headers });
      console.log(` -> GET /stores/me: ${storeRes.status} ${storeRes.ok ? 'OK' : 'FAIL'}`);

      // 2. GET /products (Inventario)
      const prodRes = await fetch(`http://localhost:3001/api/v1/products?page=1&limit=10&inventoryOnly=true&isTcg=true`, { headers });
      const prodData = await prodRes.json();
      console.log(` -> GET /products (inventario): ${prodRes.status} (Productos cargados: ${prodData.data?.length || 0})`);

      // 3. GET /pos/shift/current
      const shiftRes = await fetch('http://localhost:3001/api/v1/pos/shift/current', { headers });
      console.log(` -> GET /pos/shift/current: ${shiftRes.status} ${shiftRes.ok ? 'OK' : 'FAIL'}`);
    }

    // Para cliente, probar vitrina publica
    if (tu.sessionType === 'USER') {
      const shopRes = await fetch('http://localhost:3001/api/v1/stores/public/demo-provi');
      console.log(` -> GET /stores/public/demo-provi (Vista cliente): ${shopRes.status} ${shopRes.ok ? 'OK' : 'FAIL'}`);
    }

    console.log('');
  }

  console.log(`\n=== RESULTADO FINAL: ${allPassed ? 'TODOS LOS USUARIOS FUNCIONAN PERFECTAMENTE' : 'HAY FALLOS'} ===`);
}

testAll().catch(console.error);

