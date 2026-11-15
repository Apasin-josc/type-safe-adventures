const { test } = require('node:test');
const assert = require('node:assert/strict');
const { safeSum } = require('../../tools/load')(__dirname, 'boss-2-safe-sum');

test('empty array → 0', () => assert.equal(safeSum([]), 0));
test('plain numbers', () => {
  assert.equal(safeSum([1, 2, 3]), 6);
  assert.equal(safeSum([-2.5, 2.5, 10]), 10);
});
test('numeric strings count', () => {
  assert.equal(safeSum(['1', '2', '3']), 6);
  assert.equal(safeSum([' 3.5 ', '-1.5']), 2);
  assert.equal(safeSum(['1e2']), 100);
});
test('the result is a number, not a concatenated string', () => {
  assert.equal(typeof safeSum(['1', '2']), 'number');
  assert.equal(safeSum([1, '2', 3]), 6);
});
test('ignores NaN and infinities', () => {
  assert.equal(safeSum([1, NaN, 2]), 3);
  assert.equal(safeSum([1, Infinity, -Infinity]), 1);
});
test('ignores empty and non-numeric strings', () => {
  assert.equal(safeSum(['', '   ', 'abc', '12px', 5]), 5);
});
test('ignores booleans, null and undefined', () => {
  assert.equal(safeSum([true, false, null, undefined, 7]), 7);
});
test('ignores arrays and objects', () => {
  assert.equal(safeSum([[5], [], {}, { n: 1 }, 2]), 2);
});
test('the example from the statement', () => {
  assert.equal(safeSum([1, '2', ' 3.5 ', 'abc', null, true, NaN]), 6.5);
});
