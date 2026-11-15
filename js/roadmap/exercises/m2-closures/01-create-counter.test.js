const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createCounter } = require('../../tools/load')(__dirname, '01-create-counter');

test('starts at 0 by default', () => assert.equal(createCounter().value(), 0));
test('increment / decrement return the new value', () => {
  const c = createCounter(5);
  assert.equal(c.increment(), 6);
  assert.equal(c.increment(), 7);
  assert.equal(c.decrement(), 6);
  assert.equal(c.value(), 6);
});
test('reset goes back to start', () => {
  const c = createCounter(10);
  c.increment();
  c.increment();
  assert.equal(c.reset(), 10);
  assert.equal(c.value(), 10);
});
test('counters are independent', () => {
  const a = createCounter();
  const b = createCounter(100);
  a.increment();
  a.increment();
  b.decrement();
  assert.equal(a.value(), 2);
  assert.equal(b.value(), 99);
});
test('the count is private', () => {
  const c = createCounter(3);
  for (const key of Object.keys(c)) {
    assert.equal(typeof c[key], 'function', `"${key}" expone estado; solo debe haber métodos`);
  }
  c.count = 999;
  c.value_ = 999;
  assert.equal(c.value(), 3);
});
test('methods work when detached from the object', () => {
  const { increment, value } = createCounter();
  increment();
  increment();
  assert.equal(value(), 2);
});
