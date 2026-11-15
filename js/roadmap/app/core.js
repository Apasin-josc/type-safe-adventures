// Lógica compartida entre el navegador y Node (XP, niveles, racha, estado de módulos).
(function (root) {
  'use strict';

  const LESSON_XP = 20;
  const QUIZ_Q_XP = 10;
  const HEARTS = 3;      // corazones por lección o quiz
  const POTION_HEAL = 1; // corazones que cura una poción
  const MISSION_XP = 30;  // XP por abrir el cofre de la misión del día
  const TITLES = [
    'Novato del console.log',
    'Aprendiz de Tipos',
    'Domador de Closures',
    'Invocador de Prototipos',
    'Mago del Event Loop',
    'Cazador de Bugs',
    'Leyenda en entrenamiento',
  ];

  function dateStr(d) {
    const p = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  }
  function today() {
    return dateStr(new Date());
  }
  function shift(str, n) {
    const [y, m, d] = str.split('-').map(Number);
    return dateStr(new Date(y, m - 1, d + n));
  }

  function normalize(p) {
    p = p && typeof p === 'object' ? p : {};
    p.version = 1;
    for (const k of ['done', 'quiz', 'hints', 'settings', 'awards', 'achievements', 'missed', 'stats']) {
      if (!p[k] || typeof p[k] !== 'object' || Array.isArray(p[k])) p[k] = {};
    }
    if (!Array.isArray(p.days)) p.days = [];
    if (!Number.isInteger(p.potionsUsed) || p.potionsUsed < 0) p.potionsUsed = 0;
    if (!p.mission || typeof p.mission !== 'object' || !Array.isArray(p.mission.ids)) p.mission = null;
    return p;
  }

  /** Racha: días consecutivos terminando hoy (o ayer, si hoy aún no entrenas). */
  function streak(days, now) {
    const set = new Set(days);
    const t = now || today();
    let cur = set.has(t) ? t : set.has(shift(t, -1)) ? shift(t, -1) : null;
    let n = 0;
    while (cur && set.has(cur)) {
      n++;
      cur = shift(cur, -1);
    }
    return { count: n, doneToday: set.has(t) };
  }

  function bestStreak(days) {
    const sorted = [...new Set(days)].sort();
    let best = 0;
    let run = 0;
    let prev = null;
    for (const d of sorted) {
      run = prev && shift(prev, 1) === d ? run + 1 : 1;
      best = Math.max(best, run);
      prev = d;
    }
    return best;
  }

  const missionsWon = (p) => Object.keys(p.awards).filter((k) => k.startsWith('mission:')).length;

  function quizPass(mod) {
    return Math.ceil(mod.quiz.length * 0.8);
  }

  /** Todos los ítems completables de un módulo. */
  function moduleItems(mod) {
    const items = [];
    mod.lessons.forEach((l, i) =>
      items.push({ id: `${mod.id}/l${i + 1}`, kind: 'lesson', xp: LESSON_XP, title: l.title })
    );
    items.push({ id: `${mod.id}/quiz`, kind: 'quiz', xp: mod.quiz.length * QUIZ_Q_XP, title: 'Quiz' });
    for (const e of mod.exercises) items.push({ id: `${mod.id}/${e.id}`, kind: 'exercise', xp: e.xp, title: e.title });
    for (const e of mod.boss) items.push({ id: `${mod.id}/${e.id}`, kind: 'boss', xp: e.xp, title: e.title });
    return items;
  }

  function moduleState(mod, p) {
    let mobMax = 0, mobHp = 0, bossMax = 0, bossHp = 0, total = 0, done = 0;
    for (const it of moduleItems(mod)) {
      const isDone = Boolean(p.done[it.id]);
      total++;
      if (isDone) done++;
      if (it.kind === 'boss') {
        bossMax += it.xp;
        if (!isDone) bossHp += it.xp;
      } else {
        mobMax += it.xp;
        if (!isDone) mobHp += it.xp;
      }
    }
    return { mobMax, mobHp, bossMax, bossHp, total, done, mobDead: mobHp === 0, cleared: mobHp === 0 && bossHp === 0 };
  }

  function totalXp(course, p) {
    let xp = missionsWon(p) * MISSION_XP;
    for (const mod of course.modules) {
      for (const it of moduleItems(mod)) {
        if (it.kind === 'quiz') xp += Math.min(p.quiz[mod.id] || 0, mod.quiz.length) * QUIZ_Q_XP;
        else if (p.done[it.id]) xp += it.xp;
      }
    }
    return xp;
  }

  // XP acumulada necesaria para llegar al nivel L: 100, 300, 600, 1000, 1500…
  const xpFor = (level) => (100 * level * (level - 1)) / 2;
  function levelInfo(xp) {
    let level = 1;
    while (xp >= xpFor(level + 1)) level++;
    return {
      level,
      title: TITLES[Math.min(level, TITLES.length) - 1],
      base: xpFor(level),
      next: xpFor(level + 1),
    };
  }

  function isUnlocked(course, idx, p) {
    if (idx === 0 || p.settings.free) return true;
    return moduleState(course.modules[idx - 1], p).cleared;
  }

  function frontier(course, p) {
    return course.modules.find((m) => !moduleState(m, p).cleared) || course.modules[course.modules.length - 1];
  }

  /**
   * Pociones: se ganan con cada ejercicio o jefe derrotado, más los premios especiales
   * (lección sin daño, quiz perfecto). Se calculan en vez de guardarse como contador,
   * así un ejercicio pasado desde la terminal (npm run check) también te da su poción.
   */
  function potions(course, p) {
    let earned = Object.keys(p.awards).length;
    for (const mod of course.modules) {
      for (const e of [...mod.exercises, ...mod.boss]) if (p.done[`${mod.id}/${e.id}`]) earned++;
    }
    return Math.max(0, earned - p.potionsUsed);
  }

  /** Marca un ítem como completado hoy. Devuelve true si es nuevo. */
  function markDone(p, id) {
    const t = today();
    if (!p.days.includes(t)) p.days.push(t);
    if (p.done[id]) return false;
    p.done[id] = t;
    return true;
  }

  /** Une dos progresos sin perder nada (por si la app y el CLI escriben a la vez). */
  function merge(a, b) {
    a = normalize(a);
    b = normalize(b);
    const out = normalize({ ...a, ...b });
    out.done = { ...b.done };
    for (const [k, v] of Object.entries(a.done)) if (!out.done[k] || v < out.done[k]) out.done[k] = v;
    out.quiz = { ...a.quiz };
    for (const [k, v] of Object.entries(b.quiz)) out.quiz[k] = Math.max(out.quiz[k] || 0, v);
    out.days = [...new Set([...a.days, ...b.days])].sort();
    out.hints = { ...a.hints, ...b.hints };
    out.awards = { ...a.awards, ...b.awards };
    out.potionsUsed = Math.max(a.potionsUsed, b.potionsUsed);
    out.achievements = { ...b.achievements };
    for (const [k, v] of Object.entries(a.achievements)) if (!out.achievements[k] || v < out.achievements[k]) out.achievements[k] = v;
    out.missed = { ...a.missed, ...b.missed };
    out.stats = { ...a.stats, ...b.stats, bestCombo: Math.max(a.stats.bestCombo || 0, b.stats.bestCombo || 0) };
    const ma = a.mission;
    const mb = b.mission;
    out.mission = !ma ? mb : !mb ? ma : ma.date !== mb.date ? (ma.date > mb.date ? ma : mb) : { ...mb, won: Boolean(ma.won || mb.won) };
    out.settings = { ...a.settings, ...b.settings };
    return out;
  }

  const Core = {
    LESSON_XP, QUIZ_Q_XP, HEARTS, POTION_HEAL, MISSION_XP, potions, bestStreak, missionsWon, today, shift, normalize, streak, quizPass, moduleItems, moduleState,
    totalXp, levelInfo, isUnlocked, frontier, markDone, merge,
  };
  root.Core = Core;
  if (typeof module !== 'undefined' && module.exports) module.exports = Core;
})(typeof window !== 'undefined' ? window : globalThis);
