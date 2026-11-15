#!/usr/bin/env node
'use strict';
// Administra las cuentas del modo Wi-Fi. Solo se usa desde la terminal de esta computadora.
//   npm run user -- add <nombre>      crea una cuenta (el primero es el dueño)
//   npm run user -- passwd <nombre>   cambia su contraseña (y cierra sus sesiones)
//   npm run user -- remove <nombre>   borra la cuenta (su carpeta users/<nombre>/ se queda)
//   npm run user -- list
const readline = require('node:readline');
const auth = require('./auth');

/** Pide la contraseña sin mostrarla. Si la entrada no es una terminal, lee una línea tal cual. */
function askPassword(prompt) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: process.stdin.isTTY });
    if (process.stdin.isTTY) {
      process.stdout.write(prompt);
      rl._writeToOutput = () => {}; // no hace eco de lo que escribes
      rl.question('', (answer) => {
        rl.close();
        process.stdout.write('\n');
        resolve(answer);
      });
    } else {
      rl.once('line', (line) => {
        rl.close();
        resolve(line);
      });
    }
  });
}

(async () => {
  const [cmd, name] = process.argv.slice(2);
  try {
    if (cmd === 'list') {
      const users = auth.list();
      if (!users.length) console.log('No hay usuarios. Crea el tuyo:  npm run user -- add <nombre>');
      for (const u of users) console.log(`  ${u.name}${u.owner ? '  (dueño: usa progress.json y exercises/)' : `  (users/${u.name}/)`}`);
    } else if (cmd === 'add' || cmd === 'passwd') {
      if (!name) throw new Error(`Falta el nombre:  npm run user -- ${cmd} <nombre>`);
      const password = await askPassword('Contraseña (mínimo 8 caracteres): ');
      const u = auth.setPassword(name, password, { create: cmd === 'add' });
      console.log(cmd === 'add' ? `✔ Usuario "${u.name}" creado${u.owner ? ' (dueño)' : ''}.` : `✔ Contraseña de "${u.name}" cambiada.`);
    } else if (cmd === 'remove') {
      auth.remove(String(name || '').toLowerCase());
      console.log(`✔ Usuario "${name}" borrado.`);
    } else {
      console.log('Uso:  npm run user -- add|passwd|remove <nombre>   ·   npm run user -- list');
    }
  } catch (err) {
    console.error('✘ ' + err.message);
    process.exit(1);
  }
})();
