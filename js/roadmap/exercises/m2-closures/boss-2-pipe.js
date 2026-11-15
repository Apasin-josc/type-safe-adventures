/**
 * M2 · BOSS 2 · pipe                                              (+80 XP)
 *
 * pipe(...fns) returns ONE function that runs the given functions from
 * left to right: the output of each is the input of the next.
 *
 *   pipe(f, g, h)(x)  is the same as  h(g(f(x)))
 *
 * Details:
 *   - The FIRST function may receive several arguments; the rest receive one.
 *   - pipe() with no functions returns a function that returns its first
 *     argument untouched (identity).
 *   - The returned function is reusable.
 *
 * Example:
 *   const double = (n) => n * 2;
 *   const inc = (n) => n + 1;
 *   pipe(double, inc)(5)                    // 11
 *   pipe(inc, double)(5)                    // 12
 *   pipe((a, b) => a + b, double)(2, 3)     // 10
 *   pipe()(7)                               // 7
 *
 * Extra challenge once it passes: can you write it with reduce?
 *
 * Run:  node --test exercises/m2-closures/boss-2-pipe.test.js
 */
function pipe(...fns) {
  // TU CÓDIGO AQUÍ
}

module.exports = { pipe };
