function safeSum(values) {
  let total = 0;
  for (const v of values) {
    if (typeof v === 'number') {
      if (Number.isFinite(v)) total += v;
    } else if (typeof v === 'string' && v.trim() !== '') {
      // El filtro por typeof evita las trampas: Number(null) → 0, Number(true) → 1,
      // Number([5]) → 5. Y el trim evita Number("") → 0.
      const n = Number(v);
      if (Number.isFinite(n)) total += n;
    }
  }
  return total;
}

module.exports = { safeSum };
