const { test } = require('node:test');
const assert = require('node:assert/strict');
const { deepClone } = require('../../tools/load')(__dirname, '03-deep-clone');

test('primitives come back as-is', () => {
  assert.equal(deepClone(5), 5);
  assert.equal(deepClone('hola'), 'hola');
  assert.equal(deepClone(null), null);
  assert.equal(deepClone(undefined), undefined);
  assert.equal(deepClone(true), true);
});
test('copies a flat array', () => {
  const a = [1, 2, 3];
  const b = deepClone(a);
  assert.deepEqual(b, a);
  assert.notEqual(b, a);
  assert.ok(Array.isArray(b));
});
test('copies a flat object', () => {
  const a = { x: 1, y: 'dos' };
  const b = deepClone(a);
  assert.deepEqual(b, a);
  assert.notEqual(b, a);
  assert.ok(!Array.isArray(b));
});
test('nested structures are fully independent', () => {
  const original = { hp: 10, items: [{ name: 'potion', tags: ['heal'] }], pos: { x: 1, y: [2, 3] } };
  const copy = deepClone(original);
  assert.deepEqual(copy, original);
  copy.items[0].name = 'elixir';
  copy.items[0].tags.push('rare');
  copy.pos.y[0] = 99;
  assert.equal(original.items[0].name, 'potion');
  assert.deepEqual(original.items[0].tags, ['heal']);
  assert.deepEqual(original.pos.y, [2, 3]);
});
test('a grid (array of arrays) gets independent rows', () => {
  const grid = [[0, 0], [0, 0]];
  const copy = deepClone(grid);
  copy[0][0] = 1;
  assert.deepEqual(grid, [[0, 0], [0, 0]]);
});
test('keeps null and undefined values inside', () => {
  const copy = deepClone({ a: null, b: undefined, c: [undefined, null] });
  assert.ok('b' in copy, 'la key con undefined debe seguir existiendo');
  assert.equal(copy.a, null);
  assert.equal(copy.c.length, 2);
  assert.equal(copy.c[0], undefined);
  assert.equal(copy.c[1], null);
});
test('no structuredClone / JSON shortcuts', () => {
  assert.ok(!/structuredClone|JSON\s*\./.test(deepClone.toString()), 'a mano, con recursión 💪');
});
