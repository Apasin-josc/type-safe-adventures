const { test } = require('node:test');
const assert = require('node:assert/strict');
const { sameValue } = require('../../tools/load')(__dirname, '02-same-value');

test('behaves like === for normal values', () => {
  assert.equal(sameValue(1, 1), true);
  assert.equal(sameValue('a', 'a'), true);
  assert.equal(sameValue(1, 2), false);
  assert.equal(sameValue('1', 1), false);
  assert.equal(sameValue(null, undefined), false);
  assert.equal(sameValue(null, null), true);
  assert.equal(sameValue(undefined, undefined), true);
  assert.equal(sameValue(true, 1), false);
});
test('NaN is the same value as NaN', () => {
  assert.equal(sameValue(NaN, NaN), true);
  assert.equal(sameValue(NaN, 0 / 0), true);
  assert.equal(sameValue(NaN, 1), false);
  assert.equal(sameValue(NaN, 'NaN'), false);
  assert.equal(sameValue(NaN, undefined), false);
});
test('+0 and -0 are different values', () => {
  assert.equal(sameValue(0, -0), false);
  assert.equal(sameValue(-0, 0), false);
  assert.equal(sameValue(0, 0), true);
  assert.equal(sameValue(-0, -0), true);
});
test('objects compare by reference', () => {
  const o = {};
  assert.equal(sameValue(o, o), true);
  assert.equal(sameValue({}, {}), false);
  assert.equal(sameValue([], []), false);
});
test('does not use Object.is', () => {
  assert.ok(!/Object\s*\.\s*is\b/.test(sameValue.toString()), 'sin Object.is, ese es el chiste 😄');
});
