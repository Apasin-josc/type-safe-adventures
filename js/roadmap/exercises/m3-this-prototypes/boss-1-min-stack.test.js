const { test } = require('node:test');
const assert = require('node:assert/strict');
const { MinStack } = require('../../tools/load')(__dirname, 'boss-1-min-stack');

test('empty stack', () => {
  const s = new MinStack();
  assert.equal(s.pop(), undefined);
  assert.equal(s.top(), undefined);
  assert.equal(s.getMin(), undefined);
});
test('the example from the statement', () => {
  const s = new MinStack();
  s.push(5);
  s.push(2);
  s.push(8);
  assert.equal(s.getMin(), 2);
  assert.equal(s.top(), 8);
  assert.equal(s.pop(), 8);
  assert.equal(s.pop(), 2);
  assert.equal(s.getMin(), 5);
  assert.equal(s.top(), 5);
});
test('duplicate minimums', () => {
  const s = new MinStack();
  s.push(2);
  s.push(1);
  s.push(1);
  assert.equal(s.getMin(), 1);
  s.pop();
  assert.equal(s.getMin(), 1, 'todavía queda otro 1 en el stack');
  s.pop();
  assert.equal(s.getMin(), 2);
});
test('negative numbers and zero', () => {
  const s = new MinStack();
  s.push(0);
  assert.equal(s.getMin(), 0);
  s.push(-3);
  s.push(7);
  assert.equal(s.getMin(), -3);
  s.pop();
  s.pop();
  assert.equal(s.getMin(), 0);
});
test('works again after being emptied', () => {
  const s = new MinStack();
  s.push(1);
  s.pop();
  assert.equal(s.getMin(), undefined);
  s.push(9);
  assert.equal(s.getMin(), 9);
});
test('random operations match a brute-force stack', () => {
  const s = new MinStack();
  const ref = [];
  let seed = 42;
  const rand = () => (seed = (seed * 1103515245 + 12345) % 2147483648);
  for (let i = 0; i < 2000; i++) {
    if (rand() % 3 === 0 && ref.length) {
      assert.equal(s.pop(), ref.pop());
    } else {
      const v = (rand() % 200) - 100;
      s.push(v);
      ref.push(v);
    }
    assert.equal(s.top(), ref[ref.length - 1]);
    assert.equal(s.getMin(), ref.length ? Math.min(...ref) : undefined);
  }
});
test('getMin is O(1): 150,000 pushes + getMin must be fast', () => {
  const s = new MinStack();
  const N = 150000;
  const start = performance.now();
  s.push(-1);
  for (let i = 0; i < N; i++) {
    s.push(i);
    if (s.getMin() !== -1) assert.fail('mínimo incorrecto');
  }
  for (let i = 0; i < N; i++) {
    s.pop();
    if (s.getMin() !== -1) assert.fail('mínimo incorrecto');
  }
  const ms = performance.now() - start;
  assert.ok(ms < 1500, `tardó ${Math.round(ms)}ms: getMin o pop parecen ser O(n)`);
});
