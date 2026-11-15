/**
 * M4 · 03 · retry                                                 (+40 XP)
 *
 * Networks fail. retry(fn, attempts) calls the async function `fn` until
 * it succeeds, at most `attempts` times in total.
 *
 *   - If a call fulfills, retry fulfills with that value right away
 *     (no more calls).
 *   - If a call rejects and there are attempts left, call fn again.
 *   - If every attempt rejects, retry rejects with the LAST error.
 *
 * `attempts` is always >= 1.
 *
 * Example:
 *   const data = await retry(() => fetchFlakyApi(), 3);
 *
 * Run:  node --test exercises/m4-async/03-retry.test.js
 */
async function retry(fn, attempts) {
  // TU CÓDIGO AQUÍ
}

module.exports = { retry };
