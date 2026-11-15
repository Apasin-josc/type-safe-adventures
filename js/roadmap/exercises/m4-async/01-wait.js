/**
 * M4 · 01 · wait                                                  (+40 XP)
 *
 * setTimeout uses callbacks. Wrap it in a promise so it can be awaited.
 *
 * wait(ms, value) returns a promise that fulfills with `value` after
 * (at least) `ms` milliseconds.
 *
 * Example:
 *   await wait(500);                 // pauses this async function ~500ms
 *   const x = await wait(100, "hi"); // x === "hi"
 *
 * You will reuse this helper in every other exercise of the module.
 *
 * Run:  node --test exercises/m4-async/01-wait.test.js
 */
function wait(ms, value) {
  // TU CÓDIGO AQUÍ
}

module.exports = { wait };
