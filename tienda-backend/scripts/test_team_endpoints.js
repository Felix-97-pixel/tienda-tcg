const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function testTeam() {
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
  const proviId = '78a09ea6-05fc-47f5-b68e-bc185269b3b3';
  const companyId = '5a9a4127-1372-448b-942e-239816882090';

  console.log('Testing GET /stores/' + proviId + '/users...');
  const res1 = await fetch(`http://localhost:3001/api/v1/stores/${proviId}/users`, {
    headers: {
      'Authorization': `Bearer ${access_token}`,
      'x-auth-scope': 'admin',
    },
  });
  console.log('Store users status:', res1.status, await res1.json());

  console.log('Testing GET /stores/companies/' + companyId + '/users...');
  const res2 = await fetch(`http://localhost:3001/api/v1/stores/companies/${companyId}/users`, {
    headers: {
      'Authorization': `Bearer ${access_token}`,
      'x-auth-scope': 'admin',
    },
  });
  console.log('Company users status:', res2.status, await res2.json());
}

testTeam().catch(console.error);

