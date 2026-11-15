const { test } = require('node:test');
const assert = require('node:assert/strict');
const { EventEmitter } = require('../../tools/load')(__dirname, 'boss-2-event-emitter');

test('emit with no listeners returns false', () => {
  assert.equal(new EventEmitter().emit('nada'), false);
});
test('on + emit calls the listener with the arguments', () => {
  const e = new EventEmitter();
  const got = [];
  e.on('hit', (dmg, type) => got.push([dmg, type]));
  assert.equal(e.emit('hit', 30, 'fire'), true);
  assert.deepEqual(got, [[30, 'fire']]);
});
test('listeners run in registration order', () => {
  const e = new EventEmitter();
  const order = [];
  e.on('x', () => order.push('a'));
  e.on('x', () => order.push('b'));
  e.on('x', () => order.push('c'));
  e.emit('x');
  assert.deepEqual(order, ['a', 'b', 'c']);
});
test('events are independent', () => {
  const e = new EventEmitter();
  let a = 0;
  let b = 0;
  e.on('a', () => a++);
  e.on('b', () => b++);
  e.emit('a');
  e.emit('a');
  assert.equal(a, 2);
  assert.equal(b, 0);
});
test('off removes the listener', () => {
  const e = new EventEmitter();
  let n = 0;
  const fn = () => n++;
  e.on('x', fn);
  e.emit('x');
  e.off('x', fn);
  assert.equal(e.emit('x'), false);
  assert.equal(n, 1);
});
test('off with an unknown listener or event does nothing', () => {
  const e = new EventEmitter();
  let n = 0;
  e.on('x', () => n++);
  e.off('x', () => {});
  e.off('nope', () => {});
  e.emit('x');
  assert.equal(n, 1);
});
test('same listener registered twice runs twice; off removes one registration', () => {
  const e = new EventEmitter();
  let n = 0;
  const fn = () => n++;
  e.on('x', fn);
  e.on('x', fn);
  e.emit('x');
  assert.equal(n, 2);
  e.off('x', fn);
  e.emit('x');
  assert.equal(n, 3);
});
test('once runs only the first time', () => {
  const e = new EventEmitter();
  const got = [];
  e.once('loot', (item) => got.push(item));
  assert.equal(e.emit('loot', 'sword'), true);
  assert.equal(e.emit('loot', 'shield'), false);
  assert.deepEqual(got, ['sword']);
});
test('once does not disturb other listeners', () => {
  const e = new EventEmitter();
  const order = [];
  e.on('x', () => order.push('a'));
  e.once('x', () => order.push('once'));
  e.on('x', () => order.push('b'));
  e.emit('x');
  e.emit('x');
  assert.deepEqual(order, ['a', 'once', 'b', 'a', 'b']);
});
test('a once listener can be removed with off before it fires', () => {
  const e = new EventEmitter();
  let n = 0;
  const fn = () => n++;
  e.once('x', fn);
  e.off('x', fn);
  e.emit('x');
  assert.equal(n, 0);
});
test('on / off / once are chainable', () => {
  const e = new EventEmitter();
  const fn = () => {};
  assert.equal(e.on('x', fn), e);
  assert.equal(e.once('x', fn), e);
  assert.equal(e.off('x', fn), e);
});
test('event names like "constructor" or "toString" are just names', () => {
  const e = new EventEmitter();
  assert.equal(e.emit('constructor'), false);
  assert.equal(e.emit('toString'), false);
  let n = 0;
  e.on('constructor', () => n++);
  assert.equal(e.emit('constructor'), true);
  assert.equal(n, 1);
});
test('emitters are independent', () => {
  const a = new EventEmitter();
  const b = new EventEmitter();
  let n = 0;
  a.on('x', () => n++);
  assert.equal(b.emit('x'), false);
  assert.equal(n, 0);
});
