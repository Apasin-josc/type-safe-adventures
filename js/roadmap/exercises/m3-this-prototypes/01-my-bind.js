/**
 * M3 · 01 · myBind                                                (+40 XP)
 *
 * Re-create Function.prototype.bind as a standalone function.
 *
 * myBind(fn, context, ...presetArgs) returns a new function that, when
 * called, runs `fn` with:
 *   - `this` set to `context`
 *   - presetArgs first, followed by whatever arguments the caller passes
 * and returns whatever fn returns.
 *
 * Example:
 *   function greet(greeting, mark) { return greeting + ", " + this.name + mark; }
 *   const link = { name: "Link" };
 *   myBind(greet, link)("Hey", "!")        // "Hey, Link!"
 *   myBind(greet, link, "Hola")("?")       // "Hola, Link?"
 *
 * Rule: do NOT use .bind inside your function. (call / apply are fine.)
 *
 * Run:  node --test exercises/m3-this-prototypes/01-my-bind.test.js
 */
function myBind(fn, context, ...presetArgs) {
  // TU CÓDIGO AQUÍ
}

module.exports = { myBind };
