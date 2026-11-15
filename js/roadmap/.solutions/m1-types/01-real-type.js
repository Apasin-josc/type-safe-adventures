function realType(x) {
  if (x === null) return 'null';
  if (Array.isArray(x)) return 'array';
  if (Number.isNaN(x)) return 'nan'; // Number.isNaN no hace coerción: "NaN" (string) da false
  return typeof x;
}

module.exports = { realType };
