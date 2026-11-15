const { test } = require('node:test');
const assert = require('node:assert/strict');
const { realType } = require('../../tools/load')(__dirname, '01-real-type');

test('null → "null"', () => assert.equal(realType(null), 'null'));
test('arrays → "array"', () => {
  assert.equal(realType([]), 'array');
  assert.equal(realType([1, 2, 3]), 'array');
});
test('NaN → "nan"', () => {
  assert.equal(realType(NaN), 'nan');
  assert.equal(realType(0 / 0), 'nan');
});
test('numbers that are not NaN → "number"', () => {
  assert.equal(realType(0), 'number');
  assert.equal(realType(-3.5), 'number');
  assert.equal(realType(Infinity), 'number');
});
test('a string that "looks like" NaN is still a string', () => {
  assert.equal(realType('hola'), 'string');
  assert.equal(realType('NaN'), 'string');
});
test('everything else matches typeof', () => {
  assert.equal(realType(undefined), 'undefined');
  assert.equal(realType(true), 'boolean');
  assert.equal(realType({}), 'object');
  assert.equal(realType(() => {}), 'function');
  assert.equal(realType(Symbol('x')), 'symbol');
  assert.equal(realType(10n), 'bigint');
});
