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

  const catRes = await fetch('https://techtopiagh-crm.onrender.com/api/v1/finance/vendor-categories', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Tenant-Id': 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
    }
  });
  const categories = await catRes.json();
  const categoryId = categories[0]?.id;
  console.log('Using Category ID:', categoryId);

  const payload = {
    categoryId: categoryId,
    vendorId: null,
    budgetId: null,
    projectId: null,
    opportunityId: null,
    expenseDate: new Date().toISOString(),
    amount: 120.50,
    currency: 'GHS',
    description: 'Test Expense from Diagnostic Script'
  };

  const res = await fetch('https://techtopiagh-crm.onrender.com/api/v1/finance/expenses', {
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
