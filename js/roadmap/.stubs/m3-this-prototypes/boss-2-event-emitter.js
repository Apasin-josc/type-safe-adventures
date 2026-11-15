/**
 * M3 · BOSS 2 · EventEmitter                                      (+80 XP)
 *
 * The classic JavaScript interview design question: build a tiny pub/sub.
 *
 * class EventEmitter:
 *   on(event, listener)    → registers listener for that event name.
 *                            Returns `this` (so calls can be chained).
 *   off(event, listener)   → removes ONE registration of that listener.
 *                            Does nothing if it is not registered. Returns `this`.
 *   once(event, listener)  → like on(), but the listener is removed
 *                            automatically after its first call. Returns `this`.
 *   emit(event, ...args)   → calls every listener of that event, in the order
 *                            they were registered, passing args.
 *                            Returns true if there was at least one listener,
 *                            false otherwise.
 *
 * Example:
 *   const game = new EventEmitter();
 *   const log = (dmg) => console.log("hit for", dmg);
 *   game.on("hit", log);
 *   game.emit("hit", 30);    // logs "hit for 30" → true
 *   game.off("hit", log);
 *   game.emit("hit", 30);    // logs nothing → false
 *
 * Design questions to answer BEFORE coding:
 *   1. What structure maps an event name to its listeners? Object or Map? Why?
 *      (remember what happened with visto["constructor"] in the lesson)
 *   2. The same function can be registered twice. Then it runs twice.
 *   3. How does a `once` listener know it has to remove itself?
 *
 * Run:  node --test exercises/m3-this-prototypes/boss-2-event-emitter.test.js
 */
class EventEmitter {
  // TU CÓDIGO AQUÍ
}

module.exports = { EventEmitter };
