/**
 * M2 · 01 · createCounter                                         (+40 XP)
 *
 * createCounter(start = 0) returns an object with four methods:
 *   increment()  → adds 1 and returns the new value
 *   decrement()  → subtracts 1 and returns the new value
 *   reset()      → goes back to `start` and returns it
 *   value()      → returns the current value
 *
 * The count must be PRIVATE: there must be no way to change it from
 * outside except through those methods (no `counter.count` property).
 * Each counter is independent from the others.
 *
 * Example:
 *   const c = createCounter(5);
 *   c.increment();  // 6
 *   c.increment();  // 7
 *   c.decrement();  // 6
 *   c.reset();      // 5
 *
 * Run:  node --test exercises/m2-closures/01-create-counter.test.js
 */
function createCounter(start = 0) {
  // TU CÓDIGO AQUÍ
}

module.exports = { createCounter };
