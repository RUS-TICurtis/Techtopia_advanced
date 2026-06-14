async function test() {
  const res = await fetch('http://localhost:5000/test-vendor-db');
  const json = await res.json();
  console.log('Result:', json);
}
test();
