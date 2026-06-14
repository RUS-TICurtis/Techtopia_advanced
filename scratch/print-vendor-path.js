import fs from 'fs';
const openapi = JSON.parse(fs.readFileSync('scratch/openapi.json', 'utf8'));
console.log(JSON.stringify(openapi.paths['/api/v1/finance/vendors'], null, 2));
