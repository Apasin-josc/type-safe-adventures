const { test } = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('../../tools/load')(__dirname, '02-once');

test('returns a function', () => assert.equal(typeof once(() => 1), 'function'));
test('fn is not called until the wrapper is called', () => {
  let calls = 0;
  once(() => calls++);
  assert.equal(calls, 0);
});
test('calls fn only once', () => {
  let calls = 0;
  const f = once(() => ++calls);
  f();
  f();
  f();
  assert.equal(calls, 1);
});
test('passes arguments and returns the first result forever', () => {
  const f = once((a, b) => a + b);
  assert.equal(f(1, 2), 3);
  assert.equal(f(10, 20), 3);
  assert.equal(f(), 3);
});
test('works when the first result is falsy', () => {
  let calls = 0;
  const f = once(() => {
    calls++;
    return 0;
  });
  assert.equal(f(), 0);
  assert.equal(f(), 0);
  assert.equal(calls, 1);
  let calls2 = 0;
  const g = once(() => {
    calls2++;
  });
  g();
  g();
  assert.equal(calls2, 1, 'si fn regresa undefined, igual solo se llama una vez');
});
test('each once() is independent', () => {
  const a = once((x) => x);
  const b = once((x) => x);
  assert.equal(a('a'), 'a');
  assert.equal(b('b'), 'b');
});
