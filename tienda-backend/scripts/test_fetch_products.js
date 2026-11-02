const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function main() {
  const loginRes = await fetch('http://localhost:3001/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'dueno.demo@taptrade.cl',
      password: 'Demo123!',
      captchaToken: 'bypass-local-dev',
    }),
  });
  const loginData = await loginRes.json();
  const token = loginData.access_token;
  const proviId = '78a09ea6-05fc-47f5-b68e-bc185269b3b3';
  const vinaId = '0924eff4-0a0f-46a0-ac8c-f6cffd1eb27b';

  console.log('Testing GET /products with storeId = provi, inventoryOnly = true...');
  const resProvi = await fetch(`http://localhost:3001/api/v1/products?page=1&limit=20&storeId=${proviId}&inventoryOnly=true&isTcg=true`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'x-store-id': proviId,
      'x-auth-scope': 'admin',
    },
  });
  console.log('Provi status:', resProvi.status);
  const dataProvi = await resProvi.json();
  console.log('Provi products count:', dataProvi.data?.length);
  console.log('Provi products:', dataProvi.data?.map(p => ({
    id: p.id,
    name: p.name,
    itemsCount: p.items?.length,
    items: p.items?.map(i => ({ id: i.id, storeId: i.storeId, price: i.price, stock: i.stock })),
  })));

  // Now without header x-store-id or without token
  console.log('\nTesting GET /products with query storeId, without token (public/storefront)...');
  const resPublic = await fetch(`http://localhost:3001/api/v1/products?page=1&limit=20&storeId=${proviId}&isTcg=true`);
  console.log('Public status:', resPublic.status);
  const dataPublic = await resPublic.json();
  console.log('Public products count:', dataPublic.data?.length);
  console.log('Public products:', dataPublic.data?.map(p => ({ id: p.id, name: p.name, itemsCount: p.items?.length })));
}

main().catch(console.error);

