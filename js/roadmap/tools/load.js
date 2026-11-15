'use strict';
// Carga tu archivo de ejercicio.
// - JSQUEST_SOLUTIONS=1 carga la solución de referencia (solo lo usa `npm run verify`).
// - JSQUEST_WORKSPACE apunta a la carpeta de ejercicios de otro usuario (modo Wi-Fi con cuentas).
const path = require('node:path');

module.exports = function load(dir, name) {
  let base = dir;
  if (process.env.JSQUEST_SOLUTIONS) base = path.join(__dirname, '..', '.solutions', path.basename(dir));
  else if (process.env.JSQUEST_WORKSPACE) base = path.join(process.env.JSQUEST_WORKSPACE, path.basename(dir));
  return require(path.join(base, name));
};
