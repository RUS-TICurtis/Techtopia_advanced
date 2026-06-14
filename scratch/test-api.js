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

  // Probe without api/v1 prefix
  const paths = [
    '/finance/expenses/categories',
    '/finance/expense-categories',
    '/finance/categories',
    '/api/v1/finance/expenses/categories'
  ];

  for (const path of paths) {
    try {
      const res = await fetch(`https://techtopiagh-crm.onrender.com${path}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Tenant-Id': 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
        }
      });
      console.log(`Path ${path} status: ${res.status}`);
      if (res.ok) {
        const body = await res.json();
        console.log(`Path ${path} categories (first 2):`, JSON.stringify(body.slice(0, 2), null, 2));
      }
    } catch (err) {
      console.log(`Path ${path} error:`, err.message);
    }
  }
}
test();
