async function withLimit(tasks, limit) {
  const results = new Array(tasks.length);
  let next = 0; // índice compartido: la "lista de pendientes"

  // Cada worker toma la siguiente tarea libre hasta que no quede ninguna.
  async function worker() {
    while (next < tasks.length) {
      const i = next++; // leer + incrementar sin await en medio: nadie más toma la misma
      results[i] = await tasks[i]();
    }
  }

  const workers = Array.from({ length: Math.min(limit, tasks.length) }, () => worker());
  await Promise.all(workers); // si un worker falla, esto rechaza con ese error
  return results;
}

module.exports = { withLimit };
