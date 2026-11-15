/**
 * M4 · BOSS 1 · promiseAll                                        (+80 XP)
 *
 * "Implement Promise.all" is one of the most asked JavaScript interview
 * questions. Your turn.
 *
 * promiseAll(items) receives an array whose elements can be promises OR
 * plain values, and returns a promise that:
 *   - fulfills with an array of all the results, IN THE ORIGINAL ORDER
 *     (not in the order they finished),
 *   - rejects as soon as ANY of them rejects, with that same error,
 *   - fulfills with [] right away if the array is empty.
 *
 * Everything runs in parallel: total time ≈ the slowest item, not the sum.
 *
 * Example:
 *   await promiseAll([wait(30, "a"), 42, wait(10, "c")])   // ["a", 42, "c"]
 *
 * Rule: no Promise.all / Promise.allSettled inside.
 *
 * Questions to answer before coding:
 *   1. Results arrive in any order. How do you put each one in its slot?
 *   2. How do you know when ALL of them have arrived? (careful: checking
 *      results.length will trick you. Why?)
 *   3. How do you treat a plain value like 42 the same way as a promise?
 *
 * Run:  node --test exercises/m4-async/boss-1-promise-all.test.js
 */
function promiseAll(items) {
  // TU CÓDIGO AQUÍ
}

module.exports = { promiseAll };
