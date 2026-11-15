function curry(fn) {
  return function curried(...args) {
    // ¿Ya juntamos suficientes? Llama a la función original.
    if (args.length >= fn.length) return fn(...args);
    // Si no, regresa una función que recuerda `args` (closure) y espera más.
    // Cada parcial crea un array nuevo, por eso son independientes entre sí.
    return (...more) => curried(...args, ...more);
  };
}

module.exports = { curry };
