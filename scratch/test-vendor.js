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

  const testPayload = async (body, description) => {
    const res = await fetch('https://techtopiagh-crm.onrender.com/api/v1/finance/vendors', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Tenant-Id': 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    console.log(`--- Test: ${description} ---`);
    console.log('Status:', res.status);
    const text = await res.text();
    console.log('Response:', text);
  };

  const rand = () => Math.floor(Math.random() * 100000000);

  // Variant 1: All values null (except name and country/city)
  await testPayload({
    name: 'Null Vendor ' + rand(),
    registrationNumber: null,
    taxIdentificationNumber: null,
    email: null,
    phone: null,
    website: null,
    address: null,
    country: 'Ghana',
    city: 'Accra'
  }, 'All optional fields null');

  // Variant 2: Unique strings
  await testPayload({
    name: 'Unique Vendor ' + rand(),
    registrationNumber: 'REG-' + rand(),
    taxIdentificationNumber: 'TIN-' + rand(),
    email: `vendor-${rand()}@example.com`,
    phone: `+233${rand()}`,
    website: `https://vendor-${rand()}.com`,
    address: 'Swedru',
    country: 'Ghana',
    city: 'Accra'
  }, 'All optional fields unique values');
}
test();
