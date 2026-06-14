import fs from 'fs';
async function run() {
  const res = await fetch('https://techtopiagh-crm.onrender.com/openapi/v1.json');
  const openapi = await res.json();
  fs.writeFileSync('scratch/openapi_remote.json', JSON.stringify(openapi, null, 2), 'utf8');
  console.log('Saved remote OpenAPI spec.');
}
run();
