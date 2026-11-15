const { test } = require('node:test');
const assert = require('node:assert/strict');
const { promiseAll } = require('../../tools/load')(__dirname, 'boss-1-promise-all');

const wait = (ms, v) => new Promise((r) => setTimeout(() => r(v), ms));
const fail = (ms, msg) => new Promise((_, rej) => setTimeout(() => rej(new Error(msg)), ms));

test('returns a promise', () => {
  assert.ok(promiseAll([]) instanceof Promise);
});
test('empty array → []', async () => {
  assert.deepEqual(await promiseAll([]), []);
});
test('keeps the original order even if they finish in another order', async () => {
  assert.deepEqual(await promiseAll([wait(30, 'a'), wait(5, 'b'), wait(15, 'c')]), ['a', 'b', 'c']);
});
test('the last item finishing first does not end things early', async () => {
  assert.deepEqual(await promiseAll([wait(30, 'slow'), wait(20, 'mid'), wait(1, 'fast')]), ['slow', 'mid', 'fast']);
});
test('accepts plain values mixed with promises', async () => {
  assert.deepEqual(await promiseAll([1, wait(5, 2), 'tres', null, Promise.resolve(5)]), [1, 2, 'tres', null, 5]);
});
test('only plain values', async () => {
  assert.deepEqual(await promiseAll([1, 2, 3]), [1, 2, 3]);
});
test('rejects with the first error', async () => {
  await assert.rejects(promiseAll([wait(30, 'a'), fail(10, 'boom'), wait(5, 'c')]), /boom/);
});
test('rejects early, without waiting for the slow ones', async () => {
  const start = performance.now();
  await assert.rejects(promiseAll([wait(300, 'slow'), fail(10, 'early')]), /early/);
  assert.ok(performance.now() - start < 200, 'debe rechazar en cuanto falla una');
});
test('runs in parallel (time ≈ slowest, not the sum)', async () => {
  const start = performance.now();
  await promiseAll([wait(50), wait(50), wait(50), wait(50)]);
  assert.ok(performance.now() - start < 150);
});
test('does not use Promise.all / allSettled', () => {
  assert.ok(!/Promise\s*\.\s*all/.test(promiseAll.toString()), 'a mano 💪');
});
