function deepClone(value) {
  // Caso recursivo 1: array → clona cada elemento.
  if (Array.isArray(value)) return value.map(deepClone);
  // Caso recursivo 2: objeto (ojo: typeof null también es "object").
  if (value !== null && typeof value === 'object') {
    const copy = {};
    for (const key of Object.keys(value)) copy[key] = deepClone(value[key]);
    return copy;
  }
  // Caso base: primitivo, se copia por valor.
  return value;
}

module.exports = { deepClone };
