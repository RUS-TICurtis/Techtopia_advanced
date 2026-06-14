async function test() {
  const loginUrl = 'https://techtopiagh-crm.onrender.com/api/v1/auth/login';
  const credentials = { email: 'admin@techtopia.com', password: 'Admin123!' };
  
  const loginRes = await fetch(loginUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  const data = await loginRes.json();
  const token = data.accessToken;

  const payload = {
    name: 'Diagnostic Budget Q3',
    description: 'Direct API test budget',
    type: 'Quarterly',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    totalAmount: 50000.00
  };

  const res = await fetch('https://techtopiagh-crm.onrender.com/api/v1/finance/budgets', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Tenant-Id': 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  console.log('Status:', res.status);
  const resText = await res.text();
  console.log('Response:', resText);
}
test();
