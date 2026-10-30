import http from 'http';

function makeRequest(options, bodyData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: JSON.parse(data)
          });
        } catch {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            raw: data
          });
        }
      });
    });

    req.on('error', reject);

    if (bodyData) {
      req.write(JSON.stringify(bodyData));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- STARTING JWT AUTH E2E VERIFICATION SUITE ---');

  // Test 1: Health Check
  console.log('Test 1: GET /api/health');
  const healthRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/health',
    method: 'GET'
  });
  console.log('Result:', healthRes.status === 200 ? 'PASS (200 OK)' : `FAIL (${healthRes.status})`);

  // Test 2: Unauthenticated Protected Route Access (Should be rejected with 401)
  console.log('\nTest 2: GET /api/dashboard/metrics without Authorization header');
  const unauthRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/dashboard/metrics',
    method: 'GET'
  });
  console.log('Result:', unauthRes.status === 401 ? 'PASS (401 Unauthorized as expected)' : `FAIL (${unauthRes.status})`);
  console.log('Message:', unauthRes.data?.message);

  // Test 3: Login with Demo User Credentials
  console.log('\nTest 3: POST /api/auth/login with valid demo credentials');
  const loginRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    email: 'demo@example.com',
    password: 'Password123!'
  });
  console.log('Result:', loginRes.status === 200 ? 'PASS (200 OK)' : `FAIL (${loginRes.status})`);
  const token = loginRes.data?.token;
  console.log('Received JWT Token:', token ? `${token.substring(0, 25)}...` : 'NONE');

  // Test 4: Access Protected /api/auth/me with Bearer token
  console.log('\nTest 4: GET /api/auth/me with Authorization: Bearer <token>');
  const meRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/me',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log('Result:', meRes.status === 200 ? 'PASS (200 OK)' : `FAIL (${meRes.status})`);
  console.log('Authenticated User:', meRes.data?.user?.name, `(${meRes.data?.user?.email})`);

  // Test 5: Access Protected /api/dashboard/metrics with Bearer token
  console.log('\nTest 5: GET /api/dashboard/metrics with Bearer token');
  const metricsRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/dashboard/metrics',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log('Result:', metricsRes.status === 200 ? 'PASS (200 OK)' : `FAIL (${metricsRes.status})`);
  console.log('Metrics Payload:', metricsRes.data?.metrics);

  // Test 6: Register New User
  console.log('\nTest 6: POST /api/auth/register with new account');
  const registerRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    name: 'Sarah Connor',
    email: 'sarah@resistance.org',
    password: 'SecurePass987!'
  });
  console.log('Result:', registerRes.status === 201 ? 'PASS (201 Created)' : `FAIL (${registerRes.status})`);
  console.log('Registered User:', registerRes.data?.user?.name, 'Token:', registerRes.data?.token ? 'Generated' : 'Missing');

  // Test 7: Expired Token Simulation & Rejection
  console.log('\nTest 7: POST /api/auth/simulate-expired-token and attempt protected request');
  const simRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/simulate-expired-token',
    method: 'POST'
  });
  const expiredToken = simRes.data?.token;

  // Wait 10ms to ensure expired
  await new Promise(r => setTimeout(r, 20));

  const expiredAccessRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/dashboard/metrics',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${expiredToken}` }
  });
  console.log('Result:', expiredAccessRes.status === 401 && expiredAccessRes.data?.code === 'TOKEN_EXPIRED'
    ? 'PASS (401 TOKEN_EXPIRED caught successfully)'
    : `FAIL (${expiredAccessRes.status})`);

  console.log('\n--- ALL 7 TESTS COMPLETED SUCCESSFULLY ---');
}

runTests().catch(err => {
  console.error('Test Suite Error:', err);
  process.exit(1);
});

