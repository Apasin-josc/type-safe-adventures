class Stack {
  #items = [];

  push(value) {
    this.#items.push(value);
    return this.#items.length;
  }

  pop() {
    return this.#items.pop(); // Array.pop ya regresa undefined si está vacío
  }

  peek() {
    return this.#items[this.#items.length - 1];
  }

  isEmpty() {
    return this.#items.length === 0;
  }

  get size() {
    return this.#items.length;
  }
}

module.exports = { Stack };
