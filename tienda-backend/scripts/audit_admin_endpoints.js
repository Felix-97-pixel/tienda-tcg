const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function runAudit() {
  // 1. Login as dueno.demo
  const loginRes = await fetch('http://localhost:3001/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'dueno.demo@taptrade.cl',
      password: 'Demo123!',
      captchaToken: 'bypass-local-dev',
    }),
  });

  if (!loginRes.ok) {
    console.error('Login failed:', loginRes.status, await loginRes.text());
    return;
  }

  const { access_token, user } = await loginRes.json();
  const proviId = '78a09ea6-05fc-47f5-b68e-bc185269b3b3';
  const vinaId = '0924eff4-0a0f-46a0-ac8c-f6cffd1eb27b';

  console.log('Logged in as:', user.email, 'sessionType:', user.sessionType);

  const endpoints = [
    // Stores
    { name: 'GET /stores/me (Provi)', url: 'http://localhost:3001/api/v1/stores/me', storeId: proviId },
    { name: 'GET /stores/me (Viña)', url: 'http://localhost:3001/api/v1/stores/me', storeId: vinaId },
    { name: 'GET /stores/me/exchange-rates', url: 'http://localhost:3001/api/v1/stores/me/exchange-rates', storeId: proviId },
    { name: 'GET /stores/me/devaluations', url: 'http://localhost:3001/api/v1/stores/me/devaluations', storeId: proviId },
    { name: 'GET /stores/me/games', url: 'http://localhost:3001/api/v1/stores/me/games', storeId: proviId },
    { name: 'GET /stores/me/shipping', url: 'http://localhost:3001/api/v1/stores/me/shipping', storeId: proviId },

    // Products / Catalog
    { name: 'GET /products (Inventory Provi)', url: `http://localhost:3001/api/v1/products?page=1&limit=20&storeId=${proviId}&inventoryOnly=true&isTcg=true`, storeId: proviId },
    { name: 'GET /products (Inventory Viña)', url: `http://localhost:3001/api/v1/products?page=1&limit=20&storeId=${vinaId}&inventoryOnly=true&isTcg=true`, storeId: vinaId },
    { name: 'GET /products/meta/categories/admin', url: 'http://localhost:3001/api/v1/products/meta/categories/admin?isTcg=true', storeId: proviId },
    { name: 'GET /products/meta/languages', url: 'http://localhost:3001/api/v1/products/meta/languages', storeId: proviId },
    { name: 'GET /products/meta/conditions', url: 'http://localhost:3001/api/v1/products/meta/conditions', storeId: proviId },
    { name: 'GET /products/meta/finishes', url: 'http://localhost:3001/api/v1/products/meta/finishes', storeId: proviId },

    // Buylist
    { name: 'GET /buylist/me (Provi)', url: 'http://localhost:3001/api/v1/buylist/me', storeId: proviId },
    { name: 'GET /buylist/me (Viña)', url: 'http://localhost:3001/api/v1/buylist/me', storeId: vinaId },

    // POS & Shifts
    { name: 'GET /pos/shift/current (Provi)', url: 'http://localhost:3001/api/v1/pos/shift/current', storeId: proviId },
    { name: 'GET /pos/shift/current (Viña)', url: 'http://localhost:3001/api/v1/pos/shift/current', storeId: vinaId },
    { name: 'GET /pos/transactions-ledger (Provi)', url: 'http://localhost:3001/api/v1/pos/transactions-ledger', storeId: proviId },
    { name: 'GET /pos/catalog-cache', url: 'http://localhost:3001/api/v1/pos/catalog-cache', storeId: proviId },

    // Orders & Vendor Orders
    { name: 'GET /payments/vendor-orders (Provi)', url: `http://localhost:3001/api/v1/payments/vendor-orders?page=1&limit=20`, storeId: proviId },
    { name: 'GET /payments/vendor-orders (Viña)', url: `http://localhost:3001/api/v1/payments/vendor-orders?page=1&limit=20`, storeId: vinaId },

    // Sales & Analytics
    { name: 'GET /payments/stats (Provi)', url: 'http://localhost:3001/api/v1/payments/stats', storeId: proviId },
    { name: 'GET /payments/stats (Viña)', url: 'http://localhost:3001/api/v1/payments/stats', storeId: vinaId },
    { name: 'GET /payments/reports/advanced (Provi)', url: 'http://localhost:3001/api/v1/payments/reports/advanced', storeId: proviId },

    // Wallet / Holding
    { name: 'GET /wallet/me', url: 'http://localhost:3001/api/v1/wallet/me', storeId: proviId },
    { name: 'GET /companies/me', url: 'http://localhost:3001/api/v1/companies/me', storeId: proviId },

    // Team & Members
    { name: 'GET /stores/me/members (Provi)', url: 'http://localhost:3001/api/v1/stores/me/members', storeId: proviId },
    { name: 'GET /stores/me/members (Viña)', url: 'http://localhost:3001/api/v1/stores/me/members', storeId: vinaId },

    // Store Credit
    { name: 'GET /store-credit/history', url: 'http://localhost:3001/api/v1/store-credit/history', storeId: proviId },

    // Coupons
    { name: 'GET /coupons', url: 'http://localhost:3001/api/v1/coupons', storeId: proviId },

    // Currencies
    { name: 'GET /currencies', url: 'http://localhost:3001/api/v1/currencies', storeId: proviId },

    // Wishlist
    { name: 'GET /wishlist/stats', url: 'http://localhost:3001/api/v1/wishlist/stats', storeId: proviId },
  ];

  console.log(`\nStarting endpoint audit (${endpoints.length} endpoints)...`);

  for (const ep of endpoints) {
    try {
      const res = await fetch(ep.url, {
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'x-store-id': ep.storeId,
          'x-auth-scope': 'admin',
        },
      });

      if (res.ok) {
        console.log(`[PASS ${res.status}] ${ep.name}`);
      } else {
        const text = await res.text();
        console.error(`[FAIL ${res.status}] ${ep.name} -> ${text.slice(0, 150)}`);
      }
    } catch (err) {
      console.error(`[ERROR] ${ep.name} -> ${err.message}`);
    }
  }
}

runAudit().catch(console.error);

