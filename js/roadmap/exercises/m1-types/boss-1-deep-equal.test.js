const { test } = require('node:test');
const assert = require('node:assert/strict');
const { deepEqual } = require('../../tools/load')(__dirname, 'boss-1-deep-equal');

const yes = (a, b) => assert.equal(deepEqual(a, b), true);
const no = (a, b) => assert.equal(deepEqual(a, b), false);

test('primitives', () => {
  yes(1, 1);
  yes('a', 'a');
  yes(null, null);
  yes(undefined, undefined);
  no(1, 2);
  no(1, '1');
  no(0, false);
  no(null, undefined);
  no('', 0);
});
test('NaN equals NaN', () => {
  yes(NaN, NaN);
  yes([NaN], [NaN]);
  no(NaN, 0);
});
test('arrays', () => {
  yes([], []);
  yes([1, 2, 3], [1, 2, 3]);
  no([1, 2, 3], [1, 2]);
  no([1, 2], [1, 2, 3]);
  no([1, 2, 3], [3, 2, 1]);
  yes([1, [2, [3, [4]]]], [1, [2, [3, [4]]]]);
  no([1, [2, [3, [4]]]], [1, [2, [3, [5]]]]);
});
test('objects', () => {
  yes({}, {});
  yes({ a: 1, b: 2 }, { b: 2, a: 1 });
  no({ a: 1 }, { a: 2 });
  no({ a: 1 }, { a: 1, b: 2 });
  no({ a: 1, b: 2 }, { a: 1 });
  yes({ a: { b: { c: [1, 2] } } }, { a: { b: { c: [1, 2] } } });
  no({ a: { b: { c: [1, 2] } } }, { a: { b: { c: [1, 3] } } });
});
test('same number of keys but different keys', () => {
  no({ a: undefined }, { b: undefined });
  no({ a: 1, b: 2 }, { a: 1, c: 2 });
});
test('array vs object, null vs object', () => {
  no([1], { 0: 1 });
  no([], {});
  no(null, {});
  no({}, null);
  no([], null);
  no({ a: null }, { a: {} });
});
test('mixed nesting', () => {
  const a = { party: [{ name: 'Cloud', hp: 100 }, { name: 'Tifa', hp: 90 }], gold: 500 };
  const b = { gold: 500, party: [{ hp: 100, name: 'Cloud' }, { hp: 90, name: 'Tifa' }] };
  yes(a, b);
  b.party[1].hp = 91;
  no(a, b);
});
