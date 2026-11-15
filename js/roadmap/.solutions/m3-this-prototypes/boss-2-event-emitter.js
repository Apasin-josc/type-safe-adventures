class EventEmitter {
  // Map y no objeto: así "constructor" o "toString" son nombres de evento normales.
  #listeners = new Map(); // event → [{ fn, once }]

  #add(event, fn, once) {
    if (!this.#listeners.has(event)) this.#listeners.set(event, []);
    this.#listeners.get(event).push({ fn, once });
    return this;
  }

  on(event, listener) {
    return this.#add(event, listener, false);
  }

  once(event, listener) {
    return this.#add(event, listener, true);
  }

  off(event, listener) {
    const list = this.#listeners.get(event);
    if (list) {
      const i = list.findIndex((entry) => entry.fn === listener);
      if (i !== -1) list.splice(i, 1);
    }
    return this;
  }

  emit(event, ...args) {
    const list = this.#listeners.get(event);
    if (!list || list.length === 0) return false;
    // Iteramos sobre una copia: los `once` se quitan de la lista real mientras recorremos.
    for (const entry of [...list]) {
      if (entry.once) {
        const i = list.indexOf(entry);
        if (i !== -1) list.splice(i, 1);
      }
      entry.fn(...args);
    }
    return true;
  }
}

module.exports = { EventEmitter };
