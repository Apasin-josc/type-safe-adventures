#!/usr/bin/env node
'use strict';
// Servidor local de JS Quest.
// Sirve la app, guarda tu progreso en progress.json y corre los tests cuando "atacas".
//   npm start      → solo esta computadora (127.0.0.1), sin contraseña.
//   npm run wifi   → también tu celular o iPad en la misma red, con usuario y contraseña.
const http = require('node:http');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { exec } = require('node:child_process');

const ROOT = __dirname;
// .env (opcional): ANTHROPIC_API_KEY=... para leer tu letra en el modo dibujo. No pisa lo que ya esté en el entorno.
try {
  for (const line of fs.readFileSync(path.join(ROOT, '.env'), 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, '$2');
  }
} catch {}

const checker = require('./tools/checker');
const auth = require('./tools/auth');
const scribe = require('./tools/transcribe');
const Core = require('./app/core');

const LAN = process.argv.includes('--wifi') || process.env.JSQUEST_LAN === '1';
const HOST = LAN ? '0.0.0.0' : '127.0.0.1';
const PORT = Number(process.env.PORT) || 4321;
// JSQUEST_PROGRESS permite probar la app sin tocar tu progreso real.
const PROGRESS = process.env.JSQUEST_PROGRESS || path.join(ROOT, 'progress.json');
const USERS_DIR = process.env.JSQUEST_USERS_DIR || path.join(ROOT, 'users');
const COOKIE = 'jsq_session';
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

function readProgress(file) {
  try {
    return Core.normalize(JSON.parse(fs.readFileSync(file, 'utf8')));
  } catch {
    return Core.normalize({});
  }
}
function writeFileAtomic(file, text) {
  const tmp = file + '.tmp';
  fs.writeFileSync(tmp, text);
  fs.renameSync(tmp, file);
}
const writeProgress = (file, p) => writeFileAtomic(file, JSON.stringify(p, null, 2) + '\n');

function json(res, code, body, headers = {}) {
  res.writeHead(code, { 'Content-Type': MIME['.json'], 'Cache-Control': 'no-store', ...headers });
  res.end(JSON.stringify(body));
}

function readBody(req, max = 1e6) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > max) {
        reject(new Error('body demasiado grande'));
        req.destroy();
      }
    });
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

// ───────────────────────── Quién eres y dónde vive lo tuyo ─────────────────────────
const isLoopback = (addr) => addr === '127.0.0.1' || addr === '::1' || addr === '::ffff:127.0.0.1';

function lanAddresses() {
  const out = [];
  for (const list of Object.values(os.networkInterfaces())) {
    for (const i of list || []) if (i.family === 'IPv4' && !i.internal) out.push(i.address);
  }
  return out;
}

function cookieToken(req) {
  const m = (req.headers.cookie || '').match(new RegExp(`(?:^|;\\s*)${COOKIE}=([A-Za-z0-9_-]+)`));
  return m ? m[1] : null;
}

const prepared = new Set();
/** La carpeta de un usuario que no es el dueño: su progreso y su copia de los ejercicios. */
function workspaceOf(name) {
  const dir = path.join(USERS_DIR, name);
  const exDir = path.join(dir, 'exercises');
  if (!prepared.has(name)) {
    for (const ex of checker.list()) {
      const dest = path.join(exDir, ex.dir, ex.name + '.js');
      if (fs.existsSync(dest)) continue;
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.copyFileSync(path.join(ROOT, '.stubs', ex.dir, ex.name + '.js'), dest);
    }
    const progress = path.join(dir, 'progress.json');
    if (!fs.existsSync(progress)) {
      const p = Core.normalize({});
      p.settings.name = name.toUpperCase();
      writeProgress(progress, p);
    }
    prepared.add(name);
  }
  return { progress: path.join(dir, 'progress.json'), exDir, workspace: exDir };
}

/**
 * Decide con qué cuenta llega la petición.
 * - Desde esta misma computadora: eres el dueño, sin contraseña (como siempre).
 * - Desde la red (solo en modo Wi-Fi): hace falta una sesión iniciada.
 */
function whoIs(req) {
  if (isLoopback(req.socket.remoteAddress)) {
    return { user: auth.ownerName(), owner: true, login: false, progress: PROGRESS, exDir: path.join(ROOT, 'exercises'), workspace: null };
  }
  const user = auth.sessionUser(cookieToken(req));
  if (!user) return null;
  if (user === auth.ownerName()) {
    return { user, owner: true, login: true, progress: PROGRESS, exDir: path.join(ROOT, 'exercises'), workspace: null };
  }
  return { user, owner: false, login: true, ...workspaceOf(user) };
}

// Límite de lecturas de letra por usuario, para cuidar tu API key.
const scribeHits = new Map();
function scribeAllowed(user) {
  const now = Date.now();
  const hits = (scribeHits.get(user) || []).filter((t) => now - t < 60000);
  if (hits.length >= 20) return false;
  hits.push(now);
  scribeHits.set(user, hits);
  return true;
}

// ───────────────────────── API ─────────────────────────
async function login(req, res) {
  const ip = req.socket.remoteAddress;
  const wait = auth.lockedFor(ip);
  if (wait) return json(res, 429, { error: 'locked', wait });
  const body = await readBody(req, 2000);
  const user = auth.verify(body.name, body.password);
  auth.noteLogin(ip, Boolean(user));
  if (!user) return json(res, 401, { error: 'bad_login' });
  const s = auth.createSession(user);
  // HttpOnly: el JavaScript de la página no puede leerla. SameSite=Strict: otros sitios no pueden usarla.
  return json(res, 200, { ok: true }, { 'Set-Cookie': `${COOKIE}=${s.token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${s.maxAge}` });
}

async function api(req, res, url, me) {
  const route = `${req.method} ${url.pathname}`;

  if (route === 'GET /api/me') {
    return json(res, 200, { user: me.user, owner: me.owner, login: me.login, wifi: LAN, draw: scribe.status() });
  }

  if (route === 'POST /api/logout') {
    auth.endSession(cookieToken(req));
    return json(res, 200, { ok: true }, { 'Set-Cookie': `${COOKIE}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0` });
  }

  if (route === 'GET /api/progress') return json(res, 200, readProgress(me.progress));

  if (route === 'POST /api/progress') {
    const body = await readBody(req);
    if (!body || typeof body !== 'object' || Array.isArray(body)) return json(res, 400, { error: 'progreso inválido' });
    const merged = Core.merge(readProgress(me.progress), body);
    writeProgress(me.progress, merged);
    return json(res, 200, merged);
  }

  if (route === 'POST /api/check') {
    const body = await readBody(req);
    const all = checker.list();
    const picked = all.filter((ex) => (body.id ? ex.id === body.id : body.module ? ex.module === body.module : true));
    if (!picked.length) return json(res, 404, { error: 'no encontré ese ejercicio' });
    const results = await checker.run(picked, { workspace: me.workspace });
    return json(res, 200, { results });
  }

  // Editor del navegador: leer y guardar SOLO los archivos de ejercicio conocidos (nada de rutas libres).
  if (route === 'GET /api/file' || route === 'PUT /api/file') {
    const body = req.method === 'PUT' ? await readBody(req) : null;
    const id = req.method === 'PUT' ? body && body.id : url.searchParams.get('id');
    const ex = checker.list().find((e) => e.id === id);
    if (!ex) return json(res, 404, { error: 'no existe ese ejercicio' });
    const file = path.join(me.exDir, ex.dir, ex.name + '.js');
    if (req.method === 'GET') return json(res, 200, { code: fs.readFileSync(file, 'utf8') });
    if (typeof body.code !== 'string') return json(res, 400, { error: 'code debe ser texto' });
    writeFileAtomic(file, body.code);
    return json(res, 200, { ok: true });
  }

  if (route === 'GET /api/solution') {
    const id = url.searchParams.get('id');
    const ex = checker.list().find((e) => e.id === id);
    if (!ex) return json(res, 404, { error: 'no existe' });
    if (!readProgress(me.progress).done[id]) return json(res, 403, { error: 'Primero derrota el ejercicio 😉' });
    const file = path.join(ROOT, '.solutions', ex.dir, ex.name + '.js');
    return json(res, 200, { code: fs.readFileSync(file, 'utf8') });
  }

  // Modo dibujo: recibe la foto de tu letra y devuelve el texto. Solo viaja la imagen, nunca el enunciado.
  if (route === 'POST /api/transcribe') {
    const body = await readBody(req, 3e6);
    const m = typeof body.image === 'string' && body.image.match(/^data:image\/png;base64,([A-Za-z0-9+/]+=*)$/);
    if (!m) return json(res, 400, { error: 'fail' });
    if (!scribeAllowed(me.user || 'local')) return json(res, 429, { error: 'rate' });
    try {
      return json(res, 200, { text: await scribe.transcribe(m[1]) });
    } catch (err) {
      if (err instanceof scribe.TranscribeError) return json(res, err.http, { error: err.code });
      throw err;
    }
  }

  return json(res, 404, { error: 'ruta desconocida' });
}

function serveStatic(req, res, url) {
  let rel;
  try {
    rel = decodeURIComponent(url.pathname);
  } catch {
    res.writeHead(400).end();
    return;
  }
  if (rel === '/') rel = '/index.html';
  const file = path.normalize(path.join(ROOT, rel));
  const parts = path.relative(ROOT, file).split(path.sep);
  // Solo se sirve la app: nada de archivos ocultos, cuentas, progreso ni código de ejercicios.
  const hidden = parts.some((p) => p.startsWith('.')) || !(['app', 'content'].includes(parts[0]) || rel === '/index.html');
  if (!file.startsWith(ROOT + path.sep) || hidden || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('404');
    return;
  }
  res.writeHead(200, {
    'Content-Type': MIME[path.extname(file)] || 'application/octet-stream',
    'Cache-Control': 'no-store',
  });
  fs.createReadStream(file).pipe(res);
}

const server = http.createServer(async (req, res) => {
  try {
    // El Host y el Origin deben ser esta misma computadora: así otra página web no puede hablarle a este servidor.
    const local = isLoopback(req.socket.remoteAddress);
    const host = (req.headers.host || '').replace(/:\d+$/, '').toLowerCase();
    const okHosts = local ? ['localhost', '127.0.0.1'] : lanAddresses();
    const origin = req.headers.origin;
    if (!okHosts.includes(host) || (origin && origin !== `http://${req.headers.host}`)) {
      res.writeHead(403).end();
      return;
    }
    const url = new URL(req.url, `http://${HOST}:${PORT}`);

    if (req.method === 'POST' && url.pathname === '/api/login') return await login(req, res);

    const me = whoIs(req);
    if (!me) {
      // Sin sesión: la API responde 401 y cualquier página muestra el login (que no depende de nada más).
      if (url.pathname.startsWith('/api/')) return json(res, 401, { error: 'login' });
      res.writeHead(200, { 'Content-Type': MIME['.html'], 'Cache-Control': 'no-store' });
      fs.createReadStream(path.join(ROOT, 'login.html')).pipe(res);
      return;
    }

    if (url.pathname.startsWith('/api/')) return await api(req, res, url, me);
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405).end();
      return;
    }
    serveStatic(req, res, url);
  } catch (err) {
    json(res, 500, { error: String((err && err.message) || err) });
  }
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\nEl puerto ${PORT} ya está en uso. ¿Ya tienes JS Quest abierto? Prueba: PORT=4322 npm start\n`);
    process.exit(1);
  }
  throw err;
});

if (LAN && !auth.list().length) {
  console.error('\nEl modo Wi-Fi necesita al menos un usuario con contraseña. Crea el tuyo primero:\n\n  npm run user -- add <tu-nombre>\n');
  process.exit(1);
}

server.listen(PORT, HOST, () => {
  // 127.0.0.1 y no "localhost": si otro programa ocupa el mismo puerto en IPv6, el navegador se iría con él.
  const url = `http://127.0.0.1:${PORT}`;
  console.log(`\n  ⚔️  JS Quest corriendo en ${url}`);
  if (LAN) {
    const ips = lanAddresses();
    console.log('\n  📱 Modo Wi-Fi: desde tu celular o iPad (misma red) abre:');
    for (const ip of ips) console.log(`       http://${ip}:${PORT}`);
    if (!ips.length) console.log('       (no encontré una red: ¿está prendido el Wi-Fi?)');
    console.log(`     Usuarios: ${auth.list().map((u) => u.name).join(', ')}`);
    console.log('     Úsalo en la red de tu casa: la conexión no va cifrada.');
  }
  const draw = scribe.status();
  if (draw === 'nokey') console.log('\n  ✍️  Modo dibujo apagado: falta ANTHROPIC_API_KEY (ponla en un archivo .env aquí mismo).');
  if (draw === 'nosdk') console.log('\n  ✍️  Modo dibujo apagado: corre `npm install` una vez.');
  console.log('\n  (Ctrl+C para salir)\n');
  if (!process.env.NO_OPEN) {
    const cmd = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start ""' : 'xdg-open';
    exec(`${cmd} ${url}`, () => {});
  }
});
