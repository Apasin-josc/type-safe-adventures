/**
 * M1 · 01 · realType                                              (+40 XP)
 *
 * `typeof` lies sometimes. Write a function that tells the truth.
 *
 * realType(x) returns:
 *   - "null"  when x is null
 *   - "array" when x is an array
 *   - "nan"   when x is NaN
 *   - otherwise, exactly what `typeof x` returns
 *
 * Examples:
 *   realType(null)       // "null"
 *   realType([1, 2])     // "array"
 *   realType(NaN)        // "nan"
 *   realType(42)         // "number"
 *   realType(() => {})   // "function"
 *
 * Run:  node --test exercises/m1-types/01-real-type.test.js
 */
function realType(x) {
  // TU CÓDIGO AQUÍ
}

module.exports = { realType };
