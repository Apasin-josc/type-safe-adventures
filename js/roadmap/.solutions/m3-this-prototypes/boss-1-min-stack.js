// Idea: cada nivel del stack guarda su valor Y "el mínimo de aquí para abajo".
// Así, al hacer pop, el mínimo anterior ya está guardado en el nuevo tope.
class MinStack {
  #items = []; // cada elemento: { value, min }

  push(value) {
    const top = this.#items[this.#items.length - 1];
    const min = top === undefined ? value : Math.min(value, top.min);
    this.#items.push({ value, min });
  }

  pop() {
    const top = this.#items.pop();
    return top === undefined ? undefined : top.value;
  }

  top() {
    const top = this.#items[this.#items.length - 1];
    return top === undefined ? undefined : top.value;
  }

  getMin() {
    const top = this.#items[this.#items.length - 1];
    return top === undefined ? undefined : top.min;
  }
}

module.exports = { MinStack };
