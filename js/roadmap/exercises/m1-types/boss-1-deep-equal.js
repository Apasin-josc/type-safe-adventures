/**
 * M1 · BOSS 1 · deepEqual                                         (+80 XP)
 *
 * `[1, 2] === [1, 2]` is false, because === compares references.
 * Write deepEqual(a, b) that compares by STRUCTURE and VALUE.
 *
 * Rules:
 *   - Primitives: equal if a === b. Also, NaN equals NaN.
 *   - Arrays: same length and every element deepEqual, in order.
 *   - Plain objects: same set of own keys and every value deepEqual
 *     (key order does not matter).
 *   - An array is never equal to a non-array ([1] vs {0: 1} → false).
 *   - null only equals null.
 *   - You only need to support primitives, arrays and plain objects.
 *
 * Examples:
 *   deepEqual([1, [2, 3]], [1, [2, 3]])              // true
 *   deepEqual({ a: 1, b: { c: 2 } }, { b: { c: 2 }, a: 1 })  // true
 *   deepEqual({ a: 1 }, { a: 1, b: 2 })              // false
 *   deepEqual(1, "1")                                // false
 *
 * Think first: what is the base case? what is the recursive case?
 *
 * Run:  node --test exercises/m1-types/boss-1-deep-equal.test.js
 */
function deepEqual(a, b) {
  // TU CÓDIGO AQUÍ
}

module.exports = { deepEqual };
