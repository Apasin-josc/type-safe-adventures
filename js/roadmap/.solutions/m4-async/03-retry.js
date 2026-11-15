async function retry(fn, attempts) {
  let lastError;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn(); // el `await` es clave: sin él, el catch no atrapa el rechazo
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}

module.exports = { retry };
