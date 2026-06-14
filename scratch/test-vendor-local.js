async function test() {
  const loginUrl = 'http://localhost:5000/api/v1/auth/login';
  const credentials = { email: 'admin@techtopia.com', password: 'Admin123!' };
  
  const loginRes = await fetch(loginUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  const data = await loginRes.json();
  const token = data.accessToken;

  // Let's call POST /api/v1/finance/vendors on localhost
  const body = {
    name: 'Acme Corp Local ' + Date.now(),
    registrationNumber: '535135',
    taxIdentificationNumber: '23516',
    email: 'acme@corp.roadrunner',
    phone: '+23355384453',
    website: 'https://vendor.com',
    address: 'Swedru',
    country: 'Ghana',
    city: 'Accra'
  };

  const res = await fetch('http://localhost:5000/api/v1/finance/vendors', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Tenant-Id': 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  console.log('Status:', res.status);
  const text = await res.text();
  console.log('Response:', text);
}
test();
