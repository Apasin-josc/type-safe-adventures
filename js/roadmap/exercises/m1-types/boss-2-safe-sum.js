/**
 * M1 · BOSS 2 · safeSum                                           (+80 XP)
 *
 * You receive an array with ANYTHING inside (dirty data from an API).
 * Return the sum of everything that is "really" a number.
 *
 * What counts:
 *   - finite numbers:               1, -2.5, 0
 *   - strings holding a number:     "2", " 3.5 ", "1e2"   (surrounding spaces OK)
 *
 * What does NOT count (ignore it, never throw):
 *   - NaN, Infinity, -Infinity
 *   - "" and strings with only spaces, "abc", "12px"
 *   - booleans, null, undefined, arrays, objects
 *
 * An empty array sums to 0.
 *
 * Example:
 *   safeSum([1, "2", " 3.5 ", "abc", null, true, NaN])  // 6.5
 *
 * Careful: coercion is full of traps here. What do Number(""), Number(null),
 * Number(true) and Number([5]) return? Try them in the console first.
 *
 * Run:  node --test exercises/m1-types/boss-2-safe-sum.test.js
 */
function safeSum(values) {
  // TU CÓDIGO AQUÍ
}

module.exports = { safeSum };
