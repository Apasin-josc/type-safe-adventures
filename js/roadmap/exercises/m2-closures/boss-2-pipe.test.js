const { test } = require('node:test');
const assert = require('node:assert/strict');
const { pipe } = require('../../tools/load')(__dirname, 'boss-2-pipe');

const double = (n) => n * 2;
const inc = (n) => n + 1;

test('returns a function', () => assert.equal(typeof pipe(double), 'function'));
test('runs left to right', () => {
  assert.equal(pipe(double, inc)(5), 11);
  assert.equal(pipe(inc, double)(5), 12);
});
test('a single function', () => assert.equal(pipe(double)(4), 8));
test('no functions → identity', () => {
  assert.equal(pipe()(7), 7);
  assert.equal(pipe()('x', 'y'), 'x');
});
test('first function receives all the arguments', () => {
  assert.equal(pipe((a, b) => a + b, double)(2, 3), 10);
  assert.equal(pipe(Math.max, inc)(1, 9, 4), 10);
});
test('many functions and mixed types', () => {
  const run = pipe(
    (s) => s.trim(),
    (s) => s.split(' '),
    (words) => words.map((w) => w.length),
    (lens) => Math.max(...lens)
  );
  assert.equal(run('  el heroe derrota slimes  '), 7);
});
test('functions are not called until the pipeline is invoked', () => {
  let calls = 0;
  const p = pipe(() => ++calls);
  assert.equal(calls, 0);
  p();
  assert.equal(calls, 1);
});
test('the pipeline is reusable', () => {
  const p = pipe(inc, inc, double);
  assert.equal(p(0), 4);
  assert.equal(p(1), 6);
  assert.equal(p(0), 4);
});
