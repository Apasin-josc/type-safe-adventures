async function inSeries(tasks) {
  const results = [];
  // for...of + await: cada vuelta espera a que termine la tarea anterior.
  // (Con forEach o map arrancarían todas a la vez.)
  for (const task of tasks) {
    results.push(await task());
  }
  return results;
}

module.exports = { inSeries };
