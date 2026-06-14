import fs from 'fs';
const openapi = JSON.parse(fs.readFileSync('scratch/openapi_remote.json', 'utf8'));

// Print all schemas containing Vendor in their name
for (const [name, schema] of Object.entries(openapi.components.schemas)) {
  if (name.includes('Vendor')) {
    console.log(`Schema: ${name}`);
    console.log(JSON.stringify(schema, null, 2));
    console.log('-----------------------------------');
  }
}
