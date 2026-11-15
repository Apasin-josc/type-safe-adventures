function memoize(fn) {
  const cache = new Map();
  return function (...args) {
    // JSON.stringify distingue [1, 23] de [12, 3] y también 1 de "1".
    const key = JSON.stringify(args);
    // .has() en vez de `if (cache.get(key))`: un resultado 0 o undefined también cuenta.
    if (!cache.has(key)) cache.set(key, fn(...args));
    return cache.get(key);
  };
}

module.exports = { memoize };
