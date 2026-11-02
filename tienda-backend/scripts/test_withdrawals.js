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
  const { access_token } = await loginRes.json();
  const res = await fetch('http://localhost:3001/api/v1/withdrawals/history', {
    headers: {
      'Authorization': `Bearer ${access_token}`,
      'x-auth-scope': 'admin',
    },
  });
  console.log('withdrawals/history status:', res.status, await res.json());
}

main().catch(console.error);

