const { test } = require('node:test');
const assert = require('node:assert/strict');
const { myBind } = require('../../tools/load')(__dirname, '01-my-bind');

function greet(greeting, mark) {
  return `${greeting}, ${this.name}${mark}`;
}
const link = { name: 'Link' };
const zelda = { name: 'Zelda' };

test('returns a function without calling fn', () => {
  let calls = 0;
  const bound = myBind(() => calls++, {});
  assert.equal(typeof bound, 'function');
  assert.equal(calls, 0);
});
test('sets this', () => {
  assert.equal(myBind(greet, link)('Hey', '!'), 'Hey, Link!');
  assert.equal(myBind(greet, zelda)('Hey', '!'), 'Hey, Zelda!');
});
test('preset arguments go first', () => {
  assert.equal(myBind(greet, link, 'Hola')('?'), 'Hola, Link?');
  assert.equal(myBind(greet, link, 'Hola', '...')(), 'Hola, Link...');
});
test('the bound this wins even if called as a method of another object', () => {
  const other = { name: 'Ganon', greet: myBind(greet, link) };
  assert.equal(other.greet('Hey', '!'), 'Hey, Link!');
});
test('fixes the "lost this" problem', () => {
  const counter = {
    n: 0,
    inc() {
      this.n++;
      return this.n;
    },
  };
  const inc = myBind(counter.inc, counter);
  inc();
  inc();
  assert.equal(counter.n, 2);
});
test('reusable', () => {
  const add = function (a, b) {
    return this.base + a + b;
  };
  const f = myBind(add, { base: 100 }, 1);
  assert.equal(f(2), 103);
  assert.equal(f(10), 111);
});
test('does not use .bind', () => {
  assert.ok(!/\.\s*bind\s*\(/.test(myBind.toString()), 'sin .bind, usa call o apply');
});
