/**
 * M1 · 02 · sameValue                                             (+40 XP)
 *
 * `===` has two famous blind spots:
 *   NaN === NaN   // false  (but they ARE the same value)
 *   +0 === -0     // true   (but they are NOT the same value)
 *
 * Write sameValue(a, b) that behaves like `===` but fixes both:
 *   sameValue(NaN, NaN)   // true
 *   sameValue(0, -0)      // false
 *   sameValue(1, 1)       // true
 *   sameValue("1", 1)     // false
 *   sameValue([], [])     // false (different references)
 *
 * Rule: do NOT use Object.is (that's the built-in you are re-creating).
 *
 * Run:  node --test exercises/m1-types/02-same-value.test.js
 */
function sameValue(a, b) {
  // TU CÓDIGO AQUÍ
}

module.exports = { sameValue };
