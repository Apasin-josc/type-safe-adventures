'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');

const ROOT = path.join(__dirname, '..');
const EX_DIR = path.join(ROOT, 'exercises');
const TIMEOUT_MS = 15000;

/** Lista todos los ejercicios: [{ id, module, dir, name, test, boss }] */
function list() {
  const out = [];
  for (const dir of fs.readdirSync(EX_DIR).sort()) {
    const full = path.join(EX_DIR, dir);
    if (!fs.statSync(full).isDirectory()) continue;
    const module = dir.split('-')[0];
    for (const file of fs.readdirSync(full).sort()) {
      if (!file.endsWith('.test.js')) continue;
      const name = file.slice(0, -'.test.js'.length);
      out.push({
        id: `${module}/${name}`,
        module,
        dir,
        name,
        test: path.join(full, file),
        boss: name.startsWith('boss'),
      });
    }
  }
  return out;
}

const stripAnsi = (s) => s.replace(/\x1b\[[0-9;]*m/g, '');

function runOne(ex, { solutions = false, workspace = null } = {}) {
  return new Promise((resolve) => {
    const env = { ...process.env, NODE_OPTIONS: '', FORCE_COLOR: '0' };
    delete env.JSQUEST_SOLUTIONS;
    delete env.NODE_TEST_CONTEXT;
    delete env.JSQUEST_WORKSPACE;
    // Los tests no necesitan tu API key: no se la pasamos al código de los ejercicios.
    delete env.ANTHROPIC_API_KEY;
    delete env.ANTHROPIC_AUTH_TOKEN;
    if (workspace) env.JSQUEST_WORKSPACE = workspace;
    if (solutions) env.JSQUEST_SOLUTIONS = '1';
    const child = spawn(process.execPath, ['--test', '--test-reporter=spec', ex.test], { cwd: ROOT, env });
    let output = '';
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill('SIGKILL');
    }, TIMEOUT_MS);
    child.stdout.on('data', (d) => (output += d));
    child.stderr.on('data', (d) => (output += d));
    child.on('close', (code) => {
      clearTimeout(timer);
      output = stripAnsi(output).trim();
      if (timedOut) {
        output += `\n\n⏱ Se pasó de ${TIMEOUT_MS / 1000}s. ¿Loop infinito o una promesa que nunca se resuelve?`;
      }
      if (output.length > 6000) output = output.slice(0, 6000) + '\n… (salida recortada)';
      resolve({ id: ex.id, pass: code === 0 && !timedOut, output });
    });
  });
}

async function run(exercises, opts) {
  return Promise.all(exercises.map((ex) => runOne(ex, opts)));
}

module.exports = { list, run, ROOT };
