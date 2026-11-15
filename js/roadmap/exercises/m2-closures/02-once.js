/**
 * M2 · 02 · once                                                  (+40 XP)
 *
 * once(fn) returns a new function that calls `fn` AT MOST one time.
 *   - The first call runs fn with the given arguments and returns its result.
 *   - Every later call does NOT run fn; it returns the first result again.
 *
 * Example:
 *   const init = once((name) => { console.log("loading..."); return "hi " + name; });
 *   init("Link");   // logs "loading...", returns "hi Link"
 *   init("Zelda");  // logs nothing,      returns "hi Link"
 *
 * Question before you code: where do "was it called?" and "the result" live?
 *
 * Run:  node --test exercises/m2-closures/02-once.test.js
 */
function once(fn) {
  // TU CÓDIGO AQUÍ
}

module.exports = { once };
