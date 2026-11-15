/**
 * M4 · BOSS 2 · withLimit                                         (+80 XP)
 *
 * The final boss of Act I, and a real FAANG favorite ("promise pool",
 * "async task scheduler", "run N requests with max concurrency K").
 *
 * You have many tasks (functions that return promises) but the API you are
 * calling only allows `limit` requests at the same time.
 *
 * withLimit(tasks, limit) runs all the tasks with AT MOST `limit` of them
 * running at any moment, and returns a promise that:
 *   - fulfills with the array of results IN THE ORIGINAL ORDER,
 *   - rejects if any task rejects (with that error),
 *   - fulfills with [] if there are no tasks.
 *
 * As soon as one task finishes, the next pending one must start: the pool
 * should stay "full" (exactly `limit` running) while there is work left.
 * Running them in fixed batches of `limit` is NOT enough.
 *
 * Example with limit = 2:
 *   time →   0ms         30ms        60ms
 *   slot 1:  [task A ............]  [task D ....]
 *   slot 2:  [task B ..] [task C ..............]
 *
 * Socratic nudges (read one at a time):
 *   1. Imagine `limit` workers standing in front of one shared to-do list.
 *      What does each worker do in a loop?
 *   2. JS is single-threaded: two workers can never grab the same index
 *      "at the same time" as long as you read and increment it without an
 *      await in between.
 *   3. How do you wait for all the workers to be done?
 *
 * Run:  node --test exercises/m4-async/boss-2-with-limit.test.js
 */
async function withLimit(tasks, limit) {
  // TU CÓDIGO AQUÍ
}

module.exports = { withLimit };
