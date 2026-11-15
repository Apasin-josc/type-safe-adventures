function once(fn) {
  let called = false; // una bandera aparte: el resultado podría ser falsy
  let result;
  return function (...args) {
    if (!called) {
      called = true;
      result = fn(...args);
    }
    return result;
  };
}

module.exports = { once };
