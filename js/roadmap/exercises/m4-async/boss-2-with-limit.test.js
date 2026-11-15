const { test } = require('node:test');
const assert = require('node:assert/strict');
const { withLimit } = require('../../tools/load')(__dirname, 'boss-2-with-limit');

const wait = (ms, v) => new Promise((r) => setTimeout(() => r(v), ms));

// Crea tareas que registran cuántas corren a la vez.
const tracker = () => {
  const t = { running: 0, max: 0, started: 0 };
  t.task = (ms, value) => async () => {
    t.started++;
    t.running++;
    t.max = Math.max(t.max, t.running);
    await wait(ms);
    t.running--;
    return value;
  };
  return t;
};

test('no tasks → []', async () => {
  assert.deepEqual(await withLimit([], 3), []);
});
test('results in the original order', async () => {
  const t = tracker();
  const tasks = [t.task(30, 'a'), t.task(5, 'b'), t.task(20, 'c'), t.task(1, 'd'), t.task(10, 'e')];
  assert.deepEqual(await withLimit(tasks, 2), ['a', 'b', 'c', 'd', 'e']);
});
test('never exceeds the limit', async () => {
  const t = tracker();
  const tasks = Array.from({ length: 10 }, (_, i) => t.task(5 + (i % 3) * 5, i));
  await withLimit(tasks, 3);
  assert.ok(t.max <= 3, `llegaron a correr ${t.max} a la vez`);
  assert.equal(t.started, 10);
});
test('actually uses the whole limit (it is parallel, not serial)', async () => {
  const t = tracker();
  const tasks = Array.from({ length: 8 }, (_, i) => t.task(10, i));
  await withLimit(tasks, 4);
  assert.equal(t.max, 4);
});
test('limit 1 behaves like running in series', async () => {
  const t = tracker();
  const tasks = [t.task(5, 1), t.task(5, 2), t.task(5, 3)];
  assert.deepEqual(await withLimit(tasks, 1), [1, 2, 3]);
  assert.equal(t.max, 1);
});
test('limit bigger than the number of tasks', async () => {
  const t = tracker();
  const tasks = [t.task(5, 'x'), t.task(5, 'y')];
  assert.deepEqual(await withLimit(tasks, 10), ['x', 'y']);
  assert.equal(t.max, 2);
});
test('a free slot is refilled immediately (pool, not batches)', async () => {
  // limit 2: A tarda 80ms, B/C/D tardan 20ms.
  // Con un pool: B, C y D pasan por el segundo slot mientras A sigue → ~80ms.
  // Con lotes [A,B] [C,D]: ~100ms, y C no arranca hasta que A termina.
  const startTimes = {};
  const t0 = performance.now();
  const make = (name, ms) => async () => {
    startTimes[name] = performance.now() - t0;
    await wait(ms);
    return name;
  };
  await withLimit([make('A', 80), make('B', 20), make('C', 20), make('D', 20)], 2);
  assert.ok(startTimes.C < 60, `C arrancó a los ${Math.round(startTimes.C)}ms: debió arrancar cuando B terminó (~20ms)`);
  assert.ok(startTimes.D < 75, `D arrancó a los ${Math.round(startTimes.D)}ms: debió arrancar cuando C terminó (~40ms)`);
});
test('rejects if a task rejects', async () => {
  const t = tracker();
  const boom = async () => {
    await wait(5);
    throw new Error('boom');
  };
  await assert.rejects(withLimit([t.task(10, 1), boom, t.task(10, 3)], 2), /boom/);
});
test('tasks are not started before withLimit is called', async () => {
  const t = tracker();
  const tasks = [t.task(1, 1), t.task(1, 2)];
  assert.equal(t.started, 0);
  await withLimit(tasks, 2);
  assert.equal(t.started, 2);
});
