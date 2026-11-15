function createCounter(start = 0) {
  let count = start; // vive en el closure: nadie de afuera puede tocarla
  return {
    increment: () => ++count,
    decrement: () => --count,
    reset: () => (count = start),
    value: () => count,
  };
}

module.exports = { createCounter };
