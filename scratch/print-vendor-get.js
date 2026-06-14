import fs from 'fs';
const openapi = JSON.parse(fs.readFileSync('scratch/openapi_remote.json', 'utf8'));

const getVendorsResponse = openapi.paths['/api/v1/finance/vendors'].get.responses['200'];
console.log(JSON.stringify(getVendorsResponse, null, 2));
