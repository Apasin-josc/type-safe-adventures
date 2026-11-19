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

const TYPES = new Set(['read', 'choice', 'tap', 'number', 'fill', 'order', 'trace', 'search', 'growth', 'halving', 'guess', 'bsearch', 'pointers', 'code', 'classify', 'viz']);
let problems = 0;
const bad = (where, msg) => {
  problems++;
  console.log(`✘ ${where}: ${msg}`);
};
const bilingual = (where, v) => {
  if (v && typeof v === 'object' && !Array.isArray(v) && (!v.es || !v.en)) bad(where, 'le falta es o en');
};
function run(code, fnName, tests, wrap) {
  // Todo (definir y probar) corre dentro de la caja con límite de tiempo, por si hay un loop infinito.
  const ctx = { console: { log() {} }, setTimeout, Promise, __tests: JSON.parse(JSON.stringify(tests)) };
  vm.createContext(ctx);
  const src = `${code}
;globalThis.__fn = ${wrap ? `(${wrap})` : fnName};
globalThis.__out = __tests.map((t) => JSON.stringify(__fn(...t.args)) === JSON.stringify(t.expect));`;
  vm.runInContext(src, ctx, { timeout: 2000 });
  return ctx.__out;
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
      if (s.type === 'viz') {
        if (!Array.isArray(s.frames) || !s.frames.length) bad(w, 'sin cuadros');
        const lines = s.code ? s.code.split('\n').length : 0;
        const PANELS = ['array', 'bars', 'list', 'stack', 'queue', 'intervals', 'graph'];
        (s.frames || []).forEach((f, k) => {
          const fw = `${w} cuadro ${k}`;
          bilingual(fw, f.note);
          if (!f.note) bad(fw, 'sin nota');
          if (f.line != null && !(f.line >= 0 && f.line < lines)) bad(fw, `line ${f.line} fuera del código (${lines} líneas)`);
          if (!PANELS.some((p) => f[p])) bad(fw, 'no dibuja nada');
          for (const p of ['array', 'bars', 'list']) {
            const n = f[p]?.values?.length;
            for (const i of Object.keys(f[p]?.hl || {})) if (!(+i >= 0 && +i < n)) bad(fw, `${p}.hl ${i} fuera de rango`);
            for (const [lab, i] of Object.entries(f[p]?.ptrs || {})) if (!(i >= 0 && i < n)) bad(fw, `${p}.ptrs.${lab} = ${i} fuera de rango`);
          }
          for (const [a, b] of f.list?.links || []) if (!(a >= 0 && a < f.list.values.length) || !(b >= -1 && b < f.list.values.length)) bad(fw, `flecha ${a}→${b} inválida`);
          if (f.graph) {
            if (!s.graph?.nodes) bad(fw, 'falta step.graph.nodes');
            const has = (id) => s.graph?.nodes && String(id) in s.graph.nodes;
            for (const e of f.graph.edges || s.graph?.edges || []) if (!has(e[0]) || !has(e[1])) bad(fw, `arista ${e} con nodo desconocido`);
            for (const k2 of [...Object.keys(f.graph.hl || {}), ...Object.keys(f.graph.labels || {}), ...(f.graph.show || [])]) if (!has(k2)) bad(fw, `nodo ${k2} desconocido`);
          }
        });
      }
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
