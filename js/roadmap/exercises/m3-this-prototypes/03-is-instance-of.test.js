const { test } = require('node:test');
const assert = require('node:assert/strict');
const { isInstanceOf } = require('../../tools/load')(__dirname, '03-is-instance-of');

class Mob {}
class Slime extends Mob {}
class KingSlime extends Slime {}
class Hero {}

test('direct instance', () => {
  assert.equal(isInstanceOf(new Mob(), Mob), true);
  assert.equal(isInstanceOf(new Hero(), Mob), false);
});
test('inherited through the chain', () => {
  const king = new KingSlime();
  assert.equal(isInstanceOf(king, KingSlime), true);
  assert.equal(isInstanceOf(king, Slime), true);
  assert.equal(isInstanceOf(king, Mob), true);
  assert.equal(isInstanceOf(king, Object), true);
  assert.equal(isInstanceOf(king, Hero), false);
});
test('a parent is not an instance of the child', () => {
  assert.equal(isInstanceOf(new Mob(), Slime), false);
});
test('built-ins', () => {
  assert.equal(isInstanceOf([], Array), true);
  assert.equal(isInstanceOf([], Object), true);
  assert.equal(isInstanceOf({}, Array), false);
  assert.equal(isInstanceOf(() => {}, Function), true);
  assert.equal(isInstanceOf(new Map(), Map), true);
});
test('primitives are never instances', () => {
  assert.equal(isInstanceOf(5, Number), false);
  assert.equal(isInstanceOf('hi', String), false);
  assert.equal(isInstanceOf(true, Boolean), false);
  assert.equal(isInstanceOf(null, Object), false);
  assert.equal(isInstanceOf(undefined, Object), false);
});
test('objects with no prototype', () => {
  assert.equal(isInstanceOf(Object.create(null), Object), false);
});
test('works with Object.create chains', () => {
  function Animal() {}
  const dog = Object.create(Animal.prototype);
  const puppy = Object.create(dog);
  assert.equal(isInstanceOf(puppy, Animal), true);
});
test('does not use instanceof / isPrototypeOf', () => {
  assert.ok(!/\binstanceof\b|isPrototypeOf/.test(isInstanceOf.toString()), 'recorre la cadena a mano');
});
