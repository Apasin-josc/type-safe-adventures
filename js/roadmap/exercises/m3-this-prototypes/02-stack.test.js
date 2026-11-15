const { test } = require('node:test');
const assert = require('node:assert/strict');
const { Stack } = require('../../tools/load')(__dirname, '02-stack');

test('starts empty', () => {
  const s = new Stack();
  assert.equal(s.size, 0);
  assert.equal(s.isEmpty(), true);
  assert.equal(s.pop(), undefined);
  assert.equal(s.peek(), undefined);
});
test('push returns the new size', () => {
  const s = new Stack();
  assert.equal(s.push('a'), 1);
  assert.equal(s.push('b'), 2);
  assert.equal(s.size, 2);
  assert.equal(s.isEmpty(), false);
});
test('LIFO order', () => {
  const s = new Stack();
  s.push(1);
  s.push(2);
  s.push(3);
  assert.equal(s.pop(), 3);
  assert.equal(s.pop(), 2);
  s.push(4);
  assert.equal(s.pop(), 4);
  assert.equal(s.pop(), 1);
  assert.equal(s.pop(), undefined);
  assert.equal(s.size, 0);
});
test('peek does not remove', () => {
  const s = new Stack();
  s.push('x');
  assert.equal(s.peek(), 'x');
  assert.equal(s.peek(), 'x');
  assert.equal(s.size, 1);
});
test('size is a getter, not a method', () => {
  const s = new Stack();
  s.push(1);
  assert.equal(typeof s.size, 'number');
});
test('stacks are independent', () => {
  const a = new Stack();
  const b = new Stack();
  a.push(1);
  assert.equal(b.size, 0);
});
test('storage is private (#field)', () => {
  const s = new Stack();
  s.push(1);
  assert.deepEqual(Object.keys(s), [], 'no debe haber propiedades públicas en la instancia');
});
test('methods live on the prototype, shared by every instance', () => {
  assert.equal(new Stack().push, new Stack().push);
  assert.ok(Object.hasOwn(Stack.prototype, 'push'));
});
