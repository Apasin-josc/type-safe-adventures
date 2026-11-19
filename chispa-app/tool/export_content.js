#!/usr/bin/env node
// Copia los cursos de brilliant-js/content/*.js a assets/courses/*.json para que la app los lea.
// Correr después de editar una lección:  node tool/export_content.js
const fs = require('node:fs');
const path = require('node:path');
const SRC = path.join(__dirname, '..', '..', 'brilliant-js', 'content');
const OUT = path.join(__dirname, '..', 'assets', 'courses');
global.window = global;
for (const f of fs.readdirSync(SRC).filter((f) => f.endsWith('.js')).sort()) require(path.join(SRC, f));
fs.mkdirSync(OUT, { recursive: true });
const ids = [];
for (const c of global.COURSES) {
  fs.writeFileSync(path.join(OUT, `${c.id}.json`), JSON.stringify(c, null, 1) + '\n');
  ids.push(c.id);
}
fs.writeFileSync(path.join(OUT, 'index.json'), JSON.stringify(ids) + '\n');
console.log(`Exportados: ${ids.join(', ')}`);
