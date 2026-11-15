function promiseAll(items) {
  return new Promise((resolve, reject) => {
    const results = new Array(items.length);
    let pending = items.length;
    if (pending === 0) return resolve([]);

    items.forEach((item, i) => {
      // Promise.resolve trata igual un 42 que una promesa.
      Promise.resolve(item).then((value) => {
        results[i] = value; // cada resultado en SU posición, llegue cuando llegue
        // Contador y no results.length: asignar results[2] ya hace que length sea 3.
        if (--pending === 0) resolve(results);
      }, reject); // el primer rechazo gana; los siguientes se ignoran (una promesa se resuelve una sola vez)
    });
  });
}

module.exports = { promiseAll };
