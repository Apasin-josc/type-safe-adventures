'use strict';
// Cuentas y sesiones para el modo Wi-Fi (`npm run wifi`).
// - users.json guarda SOLO el hash (scrypt) de cada contraseña, nunca la contraseña.
// - Las cuentas se crean desde la terminal de la Mac (`npm run user -- add nombre`): no hay registro abierto,
//   porque quien tiene cuenta puede correr código en esta computadora (eso son los tests).
// - El primer usuario es el dueño: usa progress.json y exercises/ de siempre. Los demás tienen su
//   propia carpeta en users/<nombre>/.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const ROOT = path.join(__dirname, '..');
const USERS_FILE = process.env.JSQUEST_USERS || path.join(ROOT, 'users.json');
const SESSIONS_FILE = USERS_FILE.replace(/[^/\\]+$/, '.sessions.json');
const SESSION_DAYS = 30;
const NAME_RE = /^[a-z0-9][a-z0-9_-]{1,19}$/;
const MIN_PASSWORD = 8;

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}
function writeJson(file, data) {
  const tmp = file + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2) + '\n', { mode: 0o600 });
  fs.renameSync(tmp, file);
}

const readUsers = () => readJson(USERS_FILE, { users: {} }).users || {};
const hashPassword = (password, salt) => crypto.scryptSync(password, salt, 64).toString('hex');

function list() {
  return Object.entries(readUsers()).map(([name, u]) => ({ name, owner: Boolean(u.owner), created: u.created }));
}
function ownerName() {
  const o = list().find((u) => u.owner);
  return o ? o.name : null;
}

function setPassword(name, password, { create = false } = {}) {
  name = String(name || '').toLowerCase();
  if (!NAME_RE.test(name)) throw new Error('El nombre debe tener 2 a 20 caracteres: letras minúsculas, números, - o _.');
  if (typeof password !== 'string' || password.length < MIN_PASSWORD) {
    throw new Error(`La contraseña debe tener al menos ${MIN_PASSWORD} caracteres.`);
  }
  const users = readUsers();
  if (create && users[name]) throw new Error(`Ya existe el usuario "${name}".`);
  if (!create && !users[name]) throw new Error(`No existe el usuario "${name}".`);
  const salt = crypto.randomBytes(16).toString('hex');
  users[name] = {
    ...(users[name] || { owner: Object.keys(users).length === 0, created: new Date().toISOString() }),
    salt,
    hash: hashPassword(password, salt),
  };
  writeJson(USERS_FILE, { users });
  if (!create) dropSessions(name); // cambiar la contraseña cierra las sesiones abiertas
  return { name, owner: users[name].owner };
}

function remove(name) {
  const users = readUsers();
  if (!users[name]) throw new Error(`No existe el usuario "${name}".`);
  if (users[name].owner) throw new Error('No puedes borrar al dueño.');
  delete users[name];
  writeJson(USERS_FILE, { users });
  dropSessions(name);
}

/** Devuelve el nombre si la contraseña es correcta, o null. Tarda lo mismo exista o no el usuario. */
function verify(name, password) {
  name = String(name || '').toLowerCase();
  const u = readUsers()[name];
  const salt = u ? u.salt : '00000000000000000000000000000000';
  const got = Buffer.from(hashPassword(String(password || ''), salt), 'hex');
  const want = u ? Buffer.from(u.hash, 'hex') : Buffer.alloc(64);
  const ok = crypto.timingSafeEqual(got, want) && Boolean(u);
  return ok ? name : null;
}

// ── Sesiones: el navegador guarda un token al azar; aquí solo guardamos su huella (sha256). ──
const digest = (token) => crypto.createHash('sha256').update(token).digest('hex');
function readSessions() {
  const all = readJson(SESSIONS_FILE, {});
  const now = Date.now();
  for (const k of Object.keys(all)) if (!all[k] || all[k].exp < now) delete all[k];
  return all;
}
function createSession(user) {
  const token = crypto.randomBytes(32).toString('base64url');
  const all = readSessions();
  all[digest(token)] = { user, exp: Date.now() + SESSION_DAYS * 864e5 };
  writeJson(SESSIONS_FILE, all);
  return { token, maxAge: SESSION_DAYS * 86400 };
}
function sessionUser(token) {
  if (!token || typeof token !== 'string' || token.length > 100) return null;
  const s = readSessions()[digest(token)];
  if (!s || !readUsers()[s.user]) return null;
  return s.user;
}
function endSession(token) {
  if (!token) return;
  const all = readSessions();
  delete all[digest(token)];
  writeJson(SESSIONS_FILE, all);
}
function dropSessions(user) {
  const all = readSessions();
  for (const k of Object.keys(all)) if (all[k].user === user) delete all[k];
  writeJson(SESSIONS_FILE, all);
}

// ── Freno contra adivinar contraseñas: tras 5 fallos seguidos desde una IP, la espera se va duplicando. ──
const fails = new Map(); // ip → { n, until }
function lockedFor(ip) {
  const f = fails.get(ip);
  return f && f.until > Date.now() ? Math.ceil((f.until - Date.now()) / 1000) : 0;
}
function noteLogin(ip, ok) {
  if (ok) return fails.delete(ip);
  const f = fails.get(ip) || { n: 0, until: 0 };
  f.n += 1;
  if (f.n >= 5) f.until = Date.now() + Math.min(30000 * 2 ** (f.n - 5), 15 * 60000);
  fails.set(ip, f);
}

module.exports = {
  ROOT,
  list,
  ownerName,
  setPassword,
  remove,
  verify,
  createSession,
  sessionUser,
  endSession,
  lockedFor,
  noteLogin,
  NAME_RE,
};
