#!/usr/bin/env node
'use strict';
// `npm run check`        → corre todos tus ejercicios y actualiza progress.json
// `npm run check -- m2`  → solo el módulo m2
// `npm run verify`       → (mantenimiento) corre los tests contra las soluciones de referencia
const fs = require('node:fs');
const path = require('node:path');
const checker = require('./tools/checker');
const Core = require('./app/core');
require('./content/act1');
const COURSE = globalThis.COURSE;

const args = process.argv.slice(2);
const solutions = args.includes('--solutions');
const filter = args.find((a) => !a.startsWith('--'));
const PROGRESS = path.join(__dirname, 'progress.json');

const c = (code, s) => (process.stdout.isTTY ? `\x1b[${code}m${s}\x1b[0m` : s);

(async () => {
  const picked = checker.list().filter((ex) => !filter || ex.module === filter || ex.id === filter);
  if (!picked.length) {
    console.error(`No encontré ejercicios para "${filter}".`);
    process.exit(1);
  }
  console.log(c(2, `\nCorriendo ${picked.length} tests${solutions ? ' contra las soluciones de referencia' : ''}…\n`));
  const results = await checker.run(picked, { solutions });

  let last = '';
  for (const r of results) {
    const [mod, name] = r.id.split('/');
    if (mod !== last) {
      const m = COURSE.modules.find((x) => x.id === mod);
      console.log(c(1, `${mod.toUpperCase()} · ${m ? m.title : ''}`));
      last = mod;
    }
    console.log(`  ${r.pass ? c(32, '✔') : c(31, '✘')} ${name}`);
  }
  const passed = results.filter((r) => r.pass);
  console.log(`\n${passed.length}/${results.length} superados.`);

  if (solutions) process.exit(passed.length === results.length ? 0 : 1);

  let p;
  try {
    p = Core.normalize(JSON.parse(fs.readFileSync(PROGRESS, 'utf8')));
  } catch {
    p = Core.normalize({});
  }
  const fresh = passed.filter((r) => Core.markDone(p, r.id));
  if (fresh.length) {
    fs.writeFileSync(PROGRESS, JSON.stringify(p, null, 2) + '\n');
    console.log(c(33, `\n⚔️  Nuevos derrotados: ${fresh.map((r) => r.id).join(', ')}`));
  }
  const xp = Core.totalXp(COURSE, p);
  const lvl = Core.levelInfo(xp);
  const st = Core.streak(p.days);
  console.log(`\nNivel ${lvl.level} · ${lvl.title} · ${xp} XP · 🔥 racha de ${st.count} día(s) · 🧪 ${Core.potions(COURSE, p)} poción(es)`);
  if (results.length === 1 && !results[0].pass) console.log('\n' + results[0].output);
  else if (passed.length < results.length) {
    console.log(c(2, '\nPara ver el detalle de uno:  node --test exercises/<carpeta>/<archivo>.test.js'));
  }
  console.log('');
})();
