import fs from 'fs';
import path from 'path';

const targetDir = path.resolve('src/lib/es-toolkit-compat');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const shims = [
  { name: 'get', source: '../../../node_modules/es-toolkit/dist/compat/object/get.mjs' },
  { name: 'isPlainObject', source: '../../../node_modules/es-toolkit/dist/compat/predicate/isPlainObject.mjs' },
  { name: 'last', source: '../../../node_modules/es-toolkit/dist/compat/array/last.mjs' },
  { name: 'maxBy', source: '../../../node_modules/es-toolkit/dist/compat/math/maxBy.mjs' },
  { name: 'minBy', source: '../../../node_modules/es-toolkit/dist/compat/math/minBy.mjs' },
  { name: 'omit', source: '../../../node_modules/es-toolkit/dist/compat/object/omit.mjs' },
  { name: 'range', source: '../../../node_modules/es-toolkit/dist/compat/math/range.mjs' },
  { name: 'sortBy', source: '../../../node_modules/es-toolkit/dist/compat/array/sortBy.mjs' },
  { name: 'sumBy', source: '../../../node_modules/es-toolkit/dist/compat/math/sumBy.mjs' },
  { name: 'throttle', source: '../../../node_modules/es-toolkit/dist/compat/function/throttle.mjs' },
  { name: 'uniqBy', source: '../../../node_modules/es-toolkit/dist/compat/array/uniqBy.mjs' }
];

shims.forEach(shim => {
  const content = `export { ${shim.name} as default } from '${shim.source}';\n`;
  const filePath = path.join(targetDir, `${shim.name}.js`);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Created shim for ${shim.name} at ${filePath}`);
});
