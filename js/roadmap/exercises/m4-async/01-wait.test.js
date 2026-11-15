const { test } = require('node:test');
const assert = require('node:assert/strict');
const { wait } = require('../../tools/load')(__dirname, '01-wait');

test('returns a promise', () => {
  assert.ok(wait(1) instanceof Promise);
});
test('fulfills with the given value', async () => {
  assert.equal(await wait(5, 'hi'), 'hi');
  assert.deepEqual(await wait(5, { a: 1 }), { a: 1 });
  assert.equal(await wait(5), undefined);
});
test('waits at least ms', async () => {
  const start = performance.now();
  await wait(60);
  const elapsed = performance.now() - start;
  assert.ok(elapsed >= 55, `solo esperó ${Math.round(elapsed)}ms`);
  assert.ok(elapsed < 400, `esperó demasiado: ${Math.round(elapsed)}ms`);
});
test('does not block: code after the call runs first', async () => {
  const order = [];
  const p = wait(10).then(() => order.push('wait'));
  order.push('sync');
  await p;
  assert.deepEqual(order, ['sync', 'wait']);
});
test('shorter waits finish first', async () => {
  const order = [];
  await Promise.all([
    wait(40, 'slow').then((v) => order.push(v)),
    wait(5, 'fast').then((v) => order.push(v)),
  ]);
  assert.deepEqual(order, ['fast', 'slow']);
});
