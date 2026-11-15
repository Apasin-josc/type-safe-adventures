/**
 * M3 · BOSS 1 · MinStack                                          (+80 XP)
 *
 * A real interview classic (LeetCode 155, asked at Amazon, Google, Meta…).
 *
 * Design a stack that also gives you its minimum element, with EVERY
 * operation in O(1) time:
 *
 *   push(value)  → adds a number on top
 *   pop()        → removes and returns the top (undefined if empty)
 *   top()        → returns the top without removing it (undefined if empty)
 *   getMin()     → returns the smallest number currently in the stack
 *                  (undefined if empty)
 *
 * Example:
 *   const s = new MinStack();
 *   s.push(5); s.push(2); s.push(8);
 *   s.getMin();  // 2
 *   s.pop();     // 8
 *   s.pop();     // 2
 *   s.getMin();  // 5   ← the minimum "went back" to 5
 *
 * The whole challenge: after you pop the current minimum, how do you know
 * the previous minimum WITHOUT scanning the whole stack? (Scanning is O(n),
 * and the tests will time out.)
 *
 * Socratic nudge: what if, at every level of the stack, you also remembered
 * "the minimum from here down"?
 *
 * Run:  node --test exercises/m3-this-prototypes/boss-1-min-stack.test.js
 */
class MinStack {
  // TU CÓDIGO AQUÍ
}

module.exports = { MinStack };
