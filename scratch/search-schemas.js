import fs from 'fs';
const openapi = JSON.parse(fs.readFileSync('scratch/openapi_remote.json', 'utf8'));

const keys = Object.keys(openapi.components?.schemas || {});
console.log('All schemas:');
console.log(keys.filter(k => k.toLowerCase().includes('vendor')));
