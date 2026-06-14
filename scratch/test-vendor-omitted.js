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

  const res = await fetch('https://techtopiagh-crm.onrender.com/api/v1/finance/vendors', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Tenant-Id': 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: 'Omitted Fields Vendor'
    })
  });

  console.log('Status:', res.status);
  const text = await res.text();
  console.log('Response:', text);
}
test();
