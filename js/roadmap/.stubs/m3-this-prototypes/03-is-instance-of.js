/**
 * M3 · 03 · isInstanceOf                                          (+40 XP)
 *
 * Re-create the `instanceof` operator.
 *
 * isInstanceOf(obj, Class) returns true if Class.prototype appears anywhere
 * in the prototype chain of obj. Otherwise false.
 *
 *   - Primitives (5, "hi", true, null, undefined) are never instances → false.
 *
 * Example:
 *   class Mob {}
 *   class Slime extends Mob {}
 *   const s = new Slime();
 *   isInstanceOf(s, Slime)    // true
 *   isInstanceOf(s, Mob)      // true
 *   isInstanceOf(s, Object)   // true
 *   isInstanceOf(s, Array)    // false
 *
 * Rule: do NOT use `instanceof` or `isPrototypeOf` inside your function.
 * Tool you need: Object.getPrototypeOf(x).
 *
 * Notice anything? Walking the prototype chain until you hit null is exactly
 * how you will traverse a linked list in Act III.
 *
 * Run:  node --test exercises/m3-this-prototypes/03-is-instance-of.test.js
 */
function isInstanceOf(obj, Class) {
  // TU CÓDIGO AQUÍ
}

module.exports = { isInstanceOf };
