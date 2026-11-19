#!/usr/bin/env node
// Revisa que las lecciones estén bien armadas:  node tool/check_content.js
// - respuestas dentro de rango, textos en los dos idiomas, tipos de pantalla conocidos
// - cada solución de código y cada orden de bloques pasa sus pruebas de verdad
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
global.window = global;
const SRC = path.join(__dirname, '..', '..', 'brilliant-js', 'content');
for (const f of fs.readdirSync(SRC).filter((f) => f.endsWith('.js')).sort()) require(path.join(SRC, f));

const TYPES = new Set(['read', 'choice', 'tap', 'number', 'fill', 'order', 'trace', 'search', 'growth', 'halving', 'guess', 'bsearch', 'pointers', 'code', 'classify']);
let problems = 0;
const bad = (where, msg) => {
  problems++;
  console.log(`✘ ${where}: ${msg}`);
};
const bilingual = (where, v) => {
  if (v && typeof v === 'object' && !Array.isArray(v) && (!v.es || !v.en)) bad(where, 'le falta es o en');
};
function run(code, fnName, tests, wrap) {
  const ctx = { console: { log() {} }, setTimeout, Promise };
  vm.createContext(ctx);
  vm.runInContext(code + `\n;globalThis.__fn = ${wrap ? `(${wrap})` : fnName};`, ctx, { timeout: 2000 });
  return tests.map((t) => JSON.stringify(ctx.__fn(...JSON.parse(JSON.stringify(t.args)))) === JSON.stringify(t.expect));
}

for (const c of global.COURSES) {
  bilingual(`${c.id}.title`, c.title);
  for (const l of c.lessons) {
    for (const [i, s] of l.steps.entries()) {
      const w = `${c.id}/${l.id}#${i} (${s.type})`;
      if (!TYPES.has(s.type)) bad(w, 'tipo desconocido');
      for (const k of ['title', 'prompt', 'explain', 'hint', 'body']) bilingual(`${w}.${k}`, s[k]);
      if (s.type === 'choice' && !(s.answer >= 0 && s.answer < s.options.length)) bad(w, 'answer fuera de rango');
      if (s.type === 'classify') s.items.forEach((it, j) => it.bin >= 0 && it.bin < s.bins.length || bad(w, `item ${j} sin bin válido`));
      if (s.type === 'fill' && s.answers.some((a) => !s.chips.includes(a))) bad(w, 'una respuesta no está en las fichas');
      if (s.type === 'code') {
        try {
          const ok = run(s.solution, s.fnName, s.tests, s.wrap);
          if (!ok.every(Boolean)) bad(w, `la solución falla pruebas: ${ok.map((x) => (x ? '✓' : '✗')).join('')}`);
          const starter = (() => { try { return run(s.starter, s.fnName, s.tests, s.wrap).every(Boolean); } catch { return false; } })();
          if (starter) bad(w, '¡el código inicial ya pasa todas las pruebas!');
        } catch (e) {
          bad(w, 'la solución no corre: ' + e.message);
        }
      }
      if (s.type === 'order' && s.tests) {
        const src = [s.pre, ...s.lines, s.post].filter(Boolean).join('\n');
        try {
          if (!run(src, s.fnName, s.tests, s.wrap).every(Boolean)) bad(w, 'el orden correcto falla pruebas');
        } catch (e) {
          bad(w, 'el orden correcto no corre: ' + e.message);
        }
      }
    }
  }
  console.log(`${c.id}: ${c.lessons.length} lecciones, ${c.lessons.reduce((n, l) => n + l.steps.length, 0)} pantallas`);
}
console.log(problems ? `\n${problems} problema(s)` : '\nTodo bien ✓');
process.exit(problems ? 1 : 0);
