/**
 * M2 · BOSS 1 · curry                                             (+80 XP)
 *
 * curry(fn) returns a "curried" version of fn: you can pass its arguments
 * all at once, one by one, or in any grouping. When it has received as many
 * arguments as fn declares (fn.length), it calls fn and returns the result.
 *
 * Example:
 *   const add3 = (a, b, c) => a + b + c;
 *   const c = curry(add3);
 *   c(1, 2, 3)   // 6
 *   c(1)(2)(3)   // 6
 *   c(1, 2)(3)   // 6
 *   c(1)(2, 3)   // 6
 *
 * Partial applications must be reusable and independent:
 *   const add1 = c(1);
 *   add1(2)(3)    // 6
 *   add1(10)(10)  // 21   (the previous call did not "use up" add1)
 *
 * Hint to think about: every time you receive too few arguments, you return
 * a new function that REMEMBERS the ones collected so far. Remembers… how?
 *
 * Run:  node --test exercises/m2-closures/boss-1-curry.test.js
 */
function curry(fn) {
  // TU CÓDIGO AQUÍ
}

module.exports = { curry };
