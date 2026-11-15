const { test } = require('node:test');
const assert = require('node:assert/strict');
const { inSeries } = require('../../tools/load')(__dirname, '02-in-series');

const wait = (ms, v) => new Promise((r) => setTimeout(() => r(v), ms));

test('empty list → []', async () => {
  assert.deepEqual(await inSeries([]), []);
});
test('results come back in order', async () => {
  const tasks = [() => wait(20, 'a'), () => wait(5, 'b'), () => wait(10, 'c')];
  assert.deepEqual(await inSeries(tasks), ['a', 'b', 'c']);
});
test('never runs two tasks at the same time', async () => {
  let running = 0;
  let maxRunning = 0;
  const log = [];
  const make = (name, ms) => async () => {
    running++;
    maxRunning = Math.max(maxRunning, running);
    log.push(`start ${name}`);
    await wait(ms);
    log.push(`end ${name}`);
    running--;
    return name;
  };
  await inSeries([make('a', 15), make('b', 5), make('c', 10)]);
  assert.equal(maxRunning, 1, 'hubo tareas corriendo en paralelo');
  assert.deepEqual(log, ['start a', 'end a', 'start b', 'end b', 'start c', 'end c']);
});
test('works with tasks that return plain values', async () => {
  assert.deepEqual(await inSeries([() => 1, async () => 2, () => wait(1, 3)]), [1, 2, 3]);
});
test('rejects on the first failure and does not start the rest', async () => {
  let started = 0;
  const ok = async () => {
    started++;
    return 'ok';
  };
  const boom = async () => {
    started++;
    throw new Error('boom');
  };
  await assert.rejects(inSeries([ok, boom, ok, ok]), /boom/);
  await wait(10);
  assert.equal(started, 2);
});
