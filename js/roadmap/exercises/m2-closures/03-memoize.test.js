const { test } = require('node:test');
const assert = require('node:assert/strict');
const { memoize } = require('../../tools/load')(__dirname, '03-memoize');

const counted = (fn) => {
  const wrapped = (...args) => {
    wrapped.calls++;
    return fn(...args);
  };
  wrapped.calls = 0;
  return wrapped;
};

test('returns correct results', () => {
  const sq = memoize((n) => n * n);
  assert.equal(sq(4), 16);
  assert.equal(sq(5), 25);
  assert.equal(sq(4), 16);
});
test('does not call fn again for repeated arguments', () => {
  const fn = counted((n) => n * 2);
  const m = memoize(fn);
  m(1);
  m(1);
  m(1);
  m(2);
  m(2);
  assert.equal(fn.calls, 2);
});
test('multiple arguments', () => {
  const fn = counted((a, b) => a + b);
  const m = memoize(fn);
  assert.equal(m(1, 2), 3);
  assert.equal(m(1, 2), 3);
  assert.equal(m(2, 1), 3);
  assert.equal(fn.calls, 2);
});
test('(1, 23) and (12, 3) do not collide', () => {
  const fn = counted((a, b) => `${a}|${b}`);
  const m = memoize(fn);
  assert.equal(m(1, 23), '1|23');
  assert.equal(m(12, 3), '12|3');
  assert.equal(fn.calls, 2);
});
test('1 and "1" are different arguments', () => {
  const fn = counted((x) => typeof x);
  const m = memoize(fn);
  assert.equal(m(1), 'number');
  assert.equal(m('1'), 'string');
});
test('caches falsy results too', () => {
  const zero = counted(() => 0);
  const m = memoize(zero);
  m(7);
  m(7);
  assert.equal(zero.calls, 1, 'el resultado 0 también debe salir del caché');
  const undef = counted(() => undefined);
  const m2 = memoize(undef);
  m2(7);
  m2(7);
  assert.equal(undef.calls, 1, 'el resultado undefined también debe salir del caché');
});
test('each memoized function has its own cache', () => {
  const a = memoize((n) => n + 1);
  const b = memoize((n) => n + 100);
  assert.equal(a(1), 2);
  assert.equal(b(1), 101);
});
test('makes recursive fibonacci fast', () => {
  const fib = memoize((n) => (n < 2 ? n : fib(n - 1) + fib(n - 2)));
  assert.equal(fib(60), 1548008755920);
});
