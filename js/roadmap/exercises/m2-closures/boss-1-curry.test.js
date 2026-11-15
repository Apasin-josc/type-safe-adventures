const { test } = require('node:test');
const assert = require('node:assert/strict');
const { curry } = require('../../tools/load')(__dirname, 'boss-1-curry');

const add3 = (a, b, c) => a + b + c;

test('all arguments at once', () => assert.equal(curry(add3)(1, 2, 3), 6));
test('one at a time', () => assert.equal(curry(add3)(1)(2)(3), 6));
test('any grouping', () => {
  assert.equal(curry(add3)(1, 2)(3), 6);
  assert.equal(curry(add3)(1)(2, 3), 6);
});
test('intermediate steps are functions', () => {
  const c = curry(add3);
  assert.equal(typeof c(1), 'function');
  assert.equal(typeof c(1)(2), 'function');
});
test('partials are reusable and independent', () => {
  const c = curry(add3);
  const add1 = c(1);
  assert.equal(add1(2)(3), 6);
  assert.equal(add1(10)(10), 21);
  const add1and2 = add1(2);
  assert.equal(add1and2(3), 6);
  assert.equal(add1and2(30), 33);
  assert.equal(c(5)(5)(5), 15);
});
test('works with other arities', () => {
  assert.equal(curry((a) => a * 2)(21), 42);
  assert.equal(curry((a, b) => a * b)(6)(7), 42);
  assert.equal(curry((a, b, c, d) => [a, b, c, d].join(''))('a')('b', 'c')('d'), 'abcd');
});
test('a function with no parameters is called right away', () => {
  assert.equal(curry(() => 'listo')(), 'listo');
});
