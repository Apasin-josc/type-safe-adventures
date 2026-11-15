/**
 * M1 · 03 · deepClone                                             (+40 XP)
 *
 * Spread (`[...a]`, `{...o}`) only copies ONE level. Write a real deep copy.
 *
 * deepClone(value) returns a copy where no array or plain object is shared
 * with the original, at any depth.
 *   - Primitives (numbers, strings, null, undefined…) are returned as-is.
 *   - Arrays stay arrays, plain objects stay plain objects.
 *   - You only need to support arrays and plain objects (no Date, Map, etc).
 *
 * Example:
 *   const original = { hp: 10, items: [{ name: "potion" }] };
 *   const copy = deepClone(original);
 *   copy.items[0].name = "elixir";
 *   original.items[0].name  // still "potion"
 *
 * Rule: no structuredClone, no JSON.parse(JSON.stringify(...)).
 *
 * Run:  node --test exercises/m1-types/03-deep-clone.test.js
 */
function deepClone(value) {
  // TU CÓDIGO AQUÍ
}

module.exports = { deepClone };
