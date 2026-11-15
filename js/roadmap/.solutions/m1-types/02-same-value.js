function sameValue(a, b) {
  // NaN es el único valor que no es igual a sí mismo.
  if (a !== a && b !== b) return true;
  // +0 y -0 son === pero 1/+0 es Infinity y 1/-0 es -Infinity.
  if (a === 0 && b === 0) return 1 / a === 1 / b;
  return a === b;
}

module.exports = { sameValue };
