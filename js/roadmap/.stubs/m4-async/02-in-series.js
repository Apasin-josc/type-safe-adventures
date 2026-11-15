/**
 * M4 · 02 · inSeries                                              (+40 XP)
 *
 * You receive an array of TASKS. A task is a function that returns a
 * promise when called (calling the function is what starts the work).
 *
 * inSeries(tasks) runs them ONE AFTER ANOTHER: task 2 must not start until
 * task 1 has finished. It returns a promise that fulfills with the array of
 * results, in order.
 *
 * If a task rejects, inSeries rejects with that error and the remaining
 * tasks are never started.
 *
 * Example:
 *   const tasks = [() => fetchUser(1), () => fetchUser(2), () => fetchUser(3)];
 *   const users = await inSeries(tasks);   // [user1, user2, user3]
 *
 * Think first: why do we receive functions instead of promises?
 * (When does the work of `fetchUser(1)` start: when you create the promise,
 * or when you await it?)
 *
 * Run:  node --test exercises/m4-async/02-in-series.test.js
 */
async function inSeries(tasks) {
  // TU CÓDIGO AQUÍ
}

module.exports = { inSeries };
