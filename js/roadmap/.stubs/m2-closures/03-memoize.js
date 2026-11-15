/**
 * M2 · 03 · memoize                                               (+40 XP)
 *
 * memoize(fn) returns a function that caches results by arguments:
 *   - If it was already called with the same arguments, return the cached
 *     result WITHOUT calling fn again.
 *   - Otherwise call fn, store the result, return it.
 *
 * Arguments will always be primitives (numbers, strings, booleans).
 *
 * Example:
 *   let calls = 0;
 *   const slowSquare = (n) => { calls++; return n * n; };
 *   const fast = memoize(slowSquare);
 *   fast(4);  // 16  (calls = 1)
 *   fast(4);  // 16  (calls = 1, came from the cache)
 *   fast(5);  // 25  (calls = 2)
 *
 * Watch out:
 *   - (1, 23) and (12, 3) are different calls. How will you build the key?
 *   - A cached result can be 0, "" or undefined. Is `if (cache[key])` enough?
 *
 * This is the heart of dynamic programming (top-down). You will use it a LOT.
 *
 * Run:  node --test exercises/m2-closures/03-memoize.test.js
 */
function memoize(fn) {
  // TU CÓDIGO AQUÍ
}

module.exports = { memoize };
