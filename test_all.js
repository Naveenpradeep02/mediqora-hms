const http = require('http');

function postJson(urlPath, data, token) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    };
    if (token) headers['Authorization'] = 'Bearer ' + token;

    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: urlPath,
      method: 'POST',
      headers
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function putJson(urlPath, data, token) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    };
    if (token) headers['Authorization'] = 'Bearer ' + token;

    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: urlPath,
      method: 'PUT',
      headers
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function getJson(urlPath, token) {
  return new Promise((resolve, reject) => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = 'Bearer ' + token;

    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: urlPath,
      method: 'GET',
      headers
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function runTests() {
  console.log('--- STARTING MEDIQORA HMS FULL DIAGNOSTIC SYSTEM TEST ---\n');

  // Test 1: Super Admin Login
  console.log('1. Testing Super Admin Auth (info@mediqora.in)...');
  const superAdminLogin = await postJson('/api/auth/login', { email: 'info@mediqora.in', password: 'admin123' });
  console.log('   Super Admin Token Received:', superAdminLogin.success ? '✅ SUCCESS' : '❌ FAILED');
  const superToken = superAdminLogin.token;

  // Test 2: Unpause / Activate Primary Hospital Client via Super Admin API
  console.log('\n2. Unpausing Shree Ram Homeo Hospital Client via API...');
  const unpauseRes = await putJson('/api/saas/status', {
    status: 'active',
    plan: '3 Months Plan (Without Email Follow-up)',
    monthlyFee: '12000'
  }, superToken);
  console.log('   Global SaaS Status Unpaused:', unpauseRes.success ? '✅ SUCCESS' : '❌ FAILED');

  // Test 3: Doctor Admin Login
  console.log('\n3. Testing Doctor Admin Auth (dr.selvakumarr@gmail.com)...');
  const doctorLogin = await postJson('/api/auth/login', { email: 'dr.selvakumarr@gmail.com', password: 'admin123' });
  console.log('   Doctor Admin Token Received:', doctorLogin.success ? '✅ SUCCESS' : '❌ FAILED');

  // Test 4: SaaS Status Endpoint
  console.log('\n4. Testing /api/saas/status Endpoint...');
  const saasStatus = await getJson('/api/saas/status', superToken);
  console.log('   Plan Name:', saasStatus.plan);
  console.log('   Subscription Status:', saasStatus.status);
  console.log('   Package Fee:', saasStatus.monthlyFee);
  console.log('   Plan Expiration / Next Billing Date:', saasStatus.nextBillingDate || saasStatus.nextBilling);

  // Test 5: Hospital Clients List
  console.log('\n5. Testing /api/saas/clients Endpoint...');
  const clientsRes = await getJson('/api/saas/clients', superToken);
  console.log('   Hospital Clients Count:', clientsRes.clients ? clientsRes.clients.length : 0);
  if (clientsRes.clients && clientsRes.clients.length > 0) {
    const c = clientsRes.clients[0];
    console.log('   Primary Client ID:', c.client_id);
    console.log('   Hospital Name:', c.hospital_name);
    console.log('   Current Plan:', c.plan_name);
    console.log('   Fee:', c.monthly_fee);
  }

  console.log('\n--- DIAGNOSTIC TEST FINISHED CLEANLY ---');
}

runTests().catch(console.error);
