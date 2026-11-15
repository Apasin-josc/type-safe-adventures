const { test } = require('node:test');
const assert = require('node:assert/strict');
const { retry } = require('../../tools/load')(__dirname, '03-retry');

// Falla `failures` veces y luego resuelve "ok".
const flaky = (failures) => {
  const fn = async () => {
    fn.calls++;
    if (fn.calls <= failures) throw new Error(`fallo ${fn.calls}`);
    return 'ok';
  };
  fn.calls = 0;
  return fn;
};

test('succeeds on the first try: one call only', async () => {
  const fn = flaky(0);
  assert.equal(await retry(fn, 3), 'ok');
  assert.equal(fn.calls, 1);
});
test('retries until it works', async () => {
  const fn = flaky(2);
  assert.equal(await retry(fn, 5), 'ok');
  assert.equal(fn.calls, 3);
});
test('succeeds exactly on the last allowed attempt', async () => {
  const fn = flaky(2);
  assert.equal(await retry(fn, 3), 'ok');
  assert.equal(fn.calls, 3);
});
test('gives up after `attempts` and rejects with the last error', async () => {
  const fn = flaky(10);
  await assert.rejects(retry(fn, 3), /fallo 3/);
  assert.equal(fn.calls, 3);
});
test('attempts = 1 means no retries', async () => {
  const fn = flaky(1);
  await assert.rejects(retry(fn, 1), /fallo 1/);
  assert.equal(fn.calls, 1);
});
test('waits for each attempt to finish before the next one', async () => {
  let running = 0;
  let maxRunning = 0;
  let calls = 0;
  const fn = async () => {
    calls++;
    running++;
    maxRunning = Math.max(maxRunning, running);
    await new Promise((r) => setTimeout(r, 10));
    running--;
    if (calls < 3) throw new Error('todavía no');
    return 'listo';
  };
  assert.equal(await retry(fn, 5), 'listo');
  assert.equal(maxRunning, 1);
});
