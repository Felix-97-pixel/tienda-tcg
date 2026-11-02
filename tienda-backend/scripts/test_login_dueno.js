const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const jwt = require('jsonwebtoken');

async function testLogin() {
  const res = await fetch('http://localhost:3001/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'dueno.demo@taptrade.cl',
      password: 'Demo123!',
      captchaToken: 'bypass-local-dev',
    }),
  });
  console.log('Status:', res.status);
  const data = await res.json();
  console.log('Login result:', JSON.stringify(data, null, 2));

  if (data.access_token) {
    const decoded = jwt.decode(data.access_token);
    console.log('Decoded JWT:', decoded);

    // Also test GET /stores/me with this token
    const storeRes = await fetch('http://localhost:3001/api/v1/stores/me', {
      headers: {
        'Authorization': `Bearer ${data.access_token}`,
        'x-store-id': data.user.activeStore?.id,
      },
    });
    console.log('GET /stores/me status:', storeRes.status);
    const storeData = await storeRes.json();
    console.log('GET /stores/me body preview:', {
      id: storeData.id,
      name: storeData.name,
      featuresCount: storeData.features?.length,
      subscriptionPlansCount: storeData.subscriptionPlans?.length,
    });
  }
}

testLogin().catch(console.error);

