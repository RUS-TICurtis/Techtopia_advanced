import fs from 'fs';
const openapi = JSON.parse(fs.readFileSync('scratch/openapi_remote.json', 'utf8'));

console.log('Keys in paths:');
for (const p of Object.keys(openapi.paths)) {
  if (p.toLowerCase().includes('vendor')) {
    console.log(p);
  }
}

console.log('\nKeys in schemas:');
for (const s of Object.keys(openapi.components?.schemas || {})) {
  if (s.toLowerCase().includes('vendor')) {
    console.log(s, JSON.stringify(openapi.components.schemas[s], null, 2));
  }
}
