// JS Quest: la app. Pinta el curso (content/act1.js), guarda progreso y mueve el juego.
(function () {
  'use strict';
  const { Core, Game, Viz, I18n, Sfx, Editor, Draw } = window;
  const ACHIEVEMENTS = window.ACHIEVEMENTS || [];
  const { t } = I18n;
  const COURSES = { es: window.COURSE, en: window.COURSE_EN || window.COURSE };
  let COURSE = COURSES[I18n.lang];
  const { esc, hl } = Viz;
  const $ = (sel, root = document) => root.querySelector(sel);
  const view = $('#view');

  let P = Core.normalize({}); // progreso
  // Al cambiar de idioma se repinta la pantalla. La vista activa deja aquí cómo "fotografiarse"
  // (snapshot) o cómo repintarse tal cual (rerender), para que no pierdas tu lugar.
  let current = null; // { snapshot() } | { rerender() } | null
  let resume = null; // la foto que la siguiente vista debe restaurar
  let mode = 'file'; // 'server' (npm start) o 'file' (doble clic)
  let ME = { user: null, login: false, draw: 'nosdk' }; // con qué cuenta entraste y si hay modo dibujo

  // ───────────────────────── Guardado ─────────────────────────
  async function load() {
    if (location.protocol.startsWith('http')) {
      try {
        const res = await fetch('api/progress');
        if (res.status === 401) return location.reload(); // la sesión venció: el servidor mostrará el login
        if (res.ok) {
          P = Core.normalize(await res.json());
          mode = 'server';
          try {
            ME = await (await fetch('api/me')).json();
          } catch {}
          return;
        }
      } catch {}
    }
    let raw = null;
    try {
      raw = JSON.parse(localStorage.getItem('jsquest-progress'));
    } catch {}
    P = Core.normalize(raw);
  }

  function save() {
    if (mode === 'server') {
      fetch('api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(P),
      })
        .then((res) => {
          if (!res.ok) throw new Error(res.status);
        })
        .catch(() => toast(t('save_failed'), 'bad'));
      return;
    }
    try {
      localStorage.setItem('jsquest-progress', JSON.stringify(P));
    } catch {}
  }

  // ───────────────────────── Helpers ─────────────────────────
  const modById = (id) => COURSE.modules.find((m) => m.id === id);
  const modIndex = (mod) => COURSE.modules.indexOf(mod);
  const unlocked = (mod) => Core.isUnlocked(COURSE, modIndex(mod), P);
  const exercisePath = (mod, ex) => `exercises/${mod.dir}/${ex.id}.js`;
  const heroName = () => P.settings.name || t('hero_default');

  // ───────────────────────── Tema claro / oscuro ─────────────────────────
  // Se guarda en progress.json (para que te siga entre navegadores) y en localStorage
  // (para aplicarlo al instante al cargar, antes de que llegue el progreso).
  const systemTheme = () =>
    window.matchMedia && matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';

  function applyTheme(theme, animate = false) {
    const root = document.documentElement;
    if (animate) {
      root.classList.add('theme-anim');
      setTimeout(() => root.classList.remove('theme-anim'), 400);
    }
    root.dataset.theme = theme;
    const btn = $('#theme');
    btn.textContent = theme === 'dark' ? '☀️' : '🌙';
    btn.title = t('theme_to', theme === 'dark');
    btn.setAttribute('aria-label', btn.title);
  }

  function initTheme() {
    let stored = null;
    try {
      stored = localStorage.getItem('jsquest-theme');
    } catch {}
    const chosen = P.settings.theme || stored;
    applyTheme(chosen === 'light' || chosen === 'dark' ? chosen : systemTheme());

    $('#theme').addEventListener('click', () => {
      const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      applyTheme(theme, true);
      P.settings.theme = theme;
      try {
        localStorage.setItem('jsquest-theme', theme);
      } catch {}
      save();
    });

    // Mientras no elijas uno a mano, sigue al sistema (por ejemplo, el modo noche de macOS).
    if (window.matchMedia) {
      matchMedia('(prefers-color-scheme: light)').addEventListener('change', () => {
        if (!P.settings.theme) applyTheme(systemTheme(), true);
      });
    }
  }

  // ───────────────────────── Idioma (ES / EN) ─────────────────────────
  // Igual que el tema: se guarda en progress.json y en localStorage.
  const levelTitle = (level) => {
    const titles = t('titles');
    return titles[Math.min(level, titles.length) - 1];
  };

  /** Textos fijos del HTML: data-i18n (texto), data-i18n-title y data-i18n-label (aria-label). */
  function applyStaticText() {
    document.querySelectorAll('[data-i18n]').forEach((el) => (el.textContent = t(el.dataset.i18n)));
    document.querySelectorAll('[data-i18n-title]').forEach((el) => (el.title = t(el.dataset.i18nTitle)));
    document.querySelectorAll('[data-i18n-label]').forEach((el) => el.setAttribute('aria-label', t(el.dataset.i18nLabel)));
    const btn = $('#lang');
    btn.querySelectorAll('[data-l]').forEach((s) => s.classList.toggle('on', s.dataset.l === I18n.lang));
    btn.title = t('lang_to');
    btn.setAttribute('aria-label', t('lang_to'));
    const theme = $('#theme');
    if (theme.textContent) theme.title = t('theme_to', document.documentElement.dataset.theme === 'dark');
    if ($('#sound').textContent) paintSound();
  }

  function setLang(lang, { persist = true } = {}) {
    I18n.set(lang);
    COURSE = COURSES[I18n.lang];
    applyStaticText();
    if (!persist) return;
    P.settings.lang = I18n.lang;
    try {
      localStorage.setItem('jsquest-lang', I18n.lang);
    } catch {}
    save();
    const main = $('#main');
    const top = main.scrollTop;
    const winTop = window.scrollY;
    refreshHeader();
    if (current && current.rerender) {
      current.rerender();
    } else {
      resume = current && current.snapshot ? current.snapshot() : null;
      route({ keepScroll: true });
      resume = null;
    }
    main.scrollTop = top;
    window.scrollTo(0, winTop);
  }

  function initLang() {
    const chosen = P.settings.lang;
    setLang(chosen === 'es' || chosen === 'en' ? chosen : I18n.lang, { persist: false });
    $('#lang').addEventListener('click', () => setLang(I18n.lang === 'es' ? 'en' : 'es'));
  }

  // ───────────────────────── Sonido ─────────────────────────
  function paintSound() {
    const btn = $('#sound');
    btn.textContent = Sfx.muted ? '🔇' : '🔊';
    btn.title = Sfx.muted ? t('sound_unmute') : t('sound_mute');
    btn.setAttribute('aria-label', btn.title);
  }

  function initSound() {
    let stored = null;
    try {
      stored = localStorage.getItem('jsquest-sound');
    } catch {}
    Sfx.setMuted(P.settings.sound === false || (P.settings.sound === undefined && stored === 'off'));
    paintSound();
    $('#sound').addEventListener('click', () => {
      Sfx.setMuted(!Sfx.muted);
      P.settings.sound = !Sfx.muted;
      try {
        localStorage.setItem('jsquest-sound', Sfx.muted ? 'off' : 'on');
      } catch {}
      save();
      paintSound();
      Sfx.play('coin');
    });
  }

  function toast(text, kind = '') {
    const el = document.createElement('div');
    el.className = `toast ${kind}`;
    el.textContent = text;
    $('#toasts').appendChild(el);
    setTimeout(() => el.classList.add('out'), 3600);
    setTimeout(() => el.remove(), 4100);
  }

  function copyButton(text) {
    return `<button type="button" class="copy" data-copy="${esc(text)}" title="${t('copy')}">⧉</button>`;
  }

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-copy]');
    if (!btn) return;
    const done = () => {
      btn.textContent = '✔';
      setTimeout(() => (btn.textContent = '⧉'), 1200);
    };
    try {
      navigator.clipboard.writeText(btn.dataset.copy).then(done, () => {});
    } catch {}
  });

  // ───────────────────────── Header y escena ─────────────────────────
  function refreshHeader() {
    const xp = Core.totalXp(COURSE, P);
    const lvl = Core.levelInfo(xp);
    const st = Core.streak(P.days);
    $('#hero-label').textContent = heroName();
    $('#lvl-badge').textContent = levelTitle(lvl.level);
    $('#lvl-num').textContent = lvl.level;
    Game.drawAvatar($('#avatar'), lvl.level - 1);
    const step = nextStep(Core.frontier(COURSE, P));
    $('#play').href = step.href;
    $('#play').title = `${step.kind}: ${step.label}`;
    $('#week').innerHTML = weekStrip();
    renderSide();
    $('#xp-fill').style.width = `${Math.round(((xp - lvl.base) / (lvl.next - lvl.base)) * 100)}%`;
    $('#xp-text').textContent = `${xp} / ${lvl.next} XP`;
    const streakEl = $('#streak');
    streakEl.textContent = `🔥 ${st.count}`;
    streakEl.classList.toggle('cold', !st.doneToday);
    streakEl.title = st.doneToday
      ? t('streak_title_done', st.count)
      : st.count
        ? t('streak_title_pending', st.count)
        : t('streak_title_none');
    $('#mode').innerHTML = mode === 'server' ? t('mode_server') : t('mode_file');
    $('#free-mode').checked = Boolean(P.settings.free);
  }

  let sceneMod = null;
  function sceneFor(mod) {
    const st = Core.moduleState(mod, P);
    const tier = Core.levelInfo(Core.totalXp(COURSE, P)).level - 1;
    let mob = null;
    if (!st.mobDead) mob = { sprite: mod.mob.sprite, name: mod.mob.name, hp: Math.max(0, st.mobHp - pending), max: st.mobMax };
    else if (!st.cleared) mob = { sprite: mod.mob.sprite, name: mod.bossMob.name, hp: st.bossHp, max: st.bossMax, boss: true };
    return { theme: mod.id, mob, tier, cleared: st.cleared };
  }
  function refreshScene(opts) {
    Game.setScene(sceneFor(sceneMod || Core.frontier(COURSE, P)), opts);
  }

  // ───────────────────────── Corazones y pociones ─────────────────────────
  // Un "run" es un intento de lección o quiz: empiezas con Core.HEARTS corazones.
  // Fallar una predicción o pregunta quita uno; en 0 caes y repites desde el inicio.
  let run = null; // { hearts, hurt, dead, onKO }
  // Daño "en vivo": cada acierto le baja vida al mob mientras haces una lección o quiz.
  // Si caes o te sales, se regenera; al completar, el daño se vuelve permanente (gain).
  let pending = 0;

  const HEART = ['.##.##.', '#######', '#######', '.#####.', '..###..', '...#...'];
  function heartSvg(full) {
    let rects = '';
    HEART.forEach((row, y) =>
      [...row].forEach((ch, x) => {
        if (ch !== '#') return;
        const shine = full && ((x === 1 && y === 1) || (x === 2 && y === 1) || (x === 1 && y === 2));
        rects += `<rect x="${x}" y="${y}" width="1" height="1" fill="${full ? (shine ? '#ffc4d0' : '#ff4d6d') : '#2b1520'}"/>`;
      })
    );
    return `<svg class="heart ${full ? '' : 'empty'}" viewBox="0 0 7 6" aria-hidden="true">${rects}</svg>`;
  }

  function renderHeroHud() {
    const n = Core.potions(COURSE, P);
    const canDrink = run && !run.dead && run.hearts < Core.HEARTS && n > 0;
    const hp = run ? run.hearts : Core.HEARTS;
    const hearts = `<div class="hearts ${run ? '' : 'idle'}" role="img" aria-label="${t('hearts_label', hp, Core.HEARTS)}">${Array.from({ length: Core.HEARTS }, (_, i) => heartSvg(i < hp)).join('')}</div>`;
    const why = !run
      ? t('potion_why_norun')
      : run.hearts >= Core.HEARTS
        ? t('potion_why_full')
        : n === 0
          ? t('potion_why_none')
          : t('potion_why_drink', Core.POTION_HEAL);
    const comboBadge = combo >= 2 ? `<span class="combo-badge">COMBO x${combo}</span>` : '';
    $('#hud-hero').innerHTML = `${hearts}${comboBadge}<button type="button" class="potion" id="potion" ${canDrink ? '' : 'aria-disabled="true"'} title="${why}">🧪<b>×${n}</b></button>`;
  }

  // ───────────────────────── Combo y preguntas falladas ─────────────────────────
  let combo = 0; // aciertos seguidos (predicciones, quiz y misión); se pierde al fallar

  /** Cada respuesta pasa por aquí. key identifica la pregunta (para la misión de repaso). */
  function answered(right, key, { track = true, dmg = 0, practice = false } = {}) {
    if (right && practice) {
      Sfx.play('hit');
      Game.attack('✔', null, { kind: 'hit' });
      renderHeroHud();
      return;
    }
    if (right) {
      combo++;
      if (combo > (P.stats.bestCombo || 0)) {
        P.stats.bestCombo = combo;
        save();
      }
      const milestone = combo === 3 || combo === 5 || combo === 10 || (combo > 10 && combo % 5 === 0);
      Sfx.play(milestone ? 'combo' : 'hit');
      const comboKind = milestone ? 'combo big' : 'combo';
      if (dmg > 0 && sceneMod && !Core.moduleState(sceneMod, P).mobDead) {
        pending += dmg;
        Game.attack(`-${dmg}`, () => refreshScene(), { kind: 'dmg' });
        if (combo >= 3) Game.say(`COMBO x${combo}!`, comboKind);
      } else {
        Game.attack(combo >= 3 ? `COMBO x${combo}!` : '✔', null, { kind: combo >= 3 ? comboKind : 'hit' });
      }
    } else {
      combo = 0;
      if (track && key) {
        P.missed[key] = { box: 0, due: Core.shift(Core.today(), 1) };
        save();
      }
      hurt();
    }
    renderHeroHud();
    checkAchievements();
  }

  // ───────────────────────── Logros ─────────────────────────
  function checkAchievements(ctx = {}) {
    const fresh = ACHIEVEMENTS.filter((a) => {
      if (P.achievements[a.id]) return false;
      try {
        return a.test({ p: P, course: COURSE, Core, ctx });
      } catch {
        return false;
      }
    });
    if (!fresh.length) return;
    for (const a of fresh) P.achievements[a.id] = Core.today();
    save();
    fresh.forEach((a, i) =>
      setTimeout(() => {
        toast(t('ach_toast', a.icon, a.t[I18n.lang] || a.t.es), 'achievement');
        Sfx.play('achievement');
      }, 900 + i * 800)
    );
  }

  function startRun(onKO) {
    run = { hearts: Core.HEARTS, hurt: 0, dead: false, onKO };
    if (pending) {
      pending = 0;
      refreshScene();
    }
    view.classList.remove('ko-lock');
    Game.revive();
    renderHeroHud();
  }

  function endRun() {
    run = null;
    if (pending) {
      pending = 0; // el mob se regenera
      refreshScene();
    }
    view.classList.remove('ko-lock');
    Game.revive();
    renderHeroHud();
  }

  function hurt() {
    if (!run || run.dead) return;
    run.hearts--;
    run.hurt++;
    Sfx.play('bonk');
    Game.miss('-1 ❤');
    renderHeroHud();
    if (run.hearts > 0) return;
    run.dead = true;
    view.classList.add('ko-lock');
    const onKO = run.onKO;
    setTimeout(() => Sfx.play('ko'), 450);
    Game.knockout(() => onKO && onKO());
  }

  function drinkPotion() {
    if (!run || run.dead) return;
    if (run.hearts >= Core.HEARTS) return toast(t('potion_full_toast'));
    if (Core.potions(COURSE, P) <= 0) return toast(t('potion_none_toast'), 'bad');
    P.potionsUsed++;
    save();
    run.hearts = Math.min(Core.HEARTS, run.hearts + Core.POTION_HEAL);
    Sfx.play('potion');
    Game.heal(`+${Core.POTION_HEAL} ❤`);
    renderHeroHud();
  }

  /** Pantalla de K.O.: reemplaza la lección o el quiz. */
  function knockoutCard(mod, what, retry) {
    view.classList.remove('ko-lock');
    if (pending) {
      Game.say(`+${pending}`, 'heal'); // el mob se cura lo que le habías quitado
      pending = 0;
      refreshScene();
    }
    view.innerHTML = `<a class="back" href="#/m/${mod.id}">← ${esc(mod.title)}</a>
      <section class="card result ko knocked">
        <div class="ko-title">K.O.</div>
        <h1>${t('ko_title')}</h1>
        <p>${esc(t('ko_body', mod.mob.name, what))}</p>
        <p class="hint-line">${t('ko_tip')}</p>
        <div class="actions">
          <button type="button" class="btn primary" id="retry">${t('retry')}</button>
          <a class="btn" href="#/m/${mod.id}">${t('back_module')}</a>
        </div>
      </section>`;
    $('#retry').addEventListener('click', retry);
    $('#main').scrollTo(0, 0);
    current = null;
  }

  /** Aplica un cambio de progreso y dispara todo el festejo: ataque, XP, racha, nivel. */
  function gain(mod, apply, potionReason = '') {
    const pend = pending; // daño que ya se vio en vivo
    pending = 0;
    const potions0 = Core.potions(COURSE, P);
    const xp0 = Core.totalXp(COURSE, P);
    const lvl0 = Core.levelInfo(xp0).level;
    const st0 = Core.moduleState(mod, P);
    const streak0 = Core.streak(P.days);

    apply();
    const today = Core.today();
    if (!P.days.includes(today)) P.days.push(today);
    save();

    const xp1 = Core.totalXp(COURSE, P);
    const lvl1 = Core.levelInfo(xp1);
    const st1 = Core.moduleState(mod, P);
    const damage = st0.mobHp + st0.bossHp - (st1.mobHp + st1.bossHp);
    const mobDied = !st0.mobDead && st1.mobDead;
    const cleared = !st0.cleared && st1.cleared;

    refreshHeader();
    if (damage - pend > 0 && sceneMod === mod) {
      Game.attack(`-${damage - pend}`, () => refreshScene({ death: mobDied || cleared }));
    } else if (damage > 0 && sceneMod === mod) {
      refreshScene({ death: mobDied || cleared });
    } else {
      refreshScene();
    }
    if (mobDied || cleared) setTimeout(() => Sfx.play('victory'), 300);
    else if (xp1 > xp0) Sfx.play('coin');
    if (lvl1.level > lvl0) setTimeout(() => Sfx.play('levelup'), 650);
    if (xp1 > xp0) {
      Game.xp(`+${xp1 - xp0} XP`);
      toast(`+${xp1 - xp0} XP`, 'xp');
    }
    if (!streak0.doneToday) toast(t('streak_toast', Core.streak(P.days).count), 'streak');
    if (cleared) {
      const next = COURSE.modules[modIndex(mod) + 1];
      toast(t('boss_down', mod.bossMob.name, next && next.zone), 'big');
    } else if (mobDied) {
      toast(t('mob_down', mod.mob.name, mod.bossMob.name), 'big');
    }
    if (lvl1.level > lvl0) toast(t('level_up', lvl1.level, levelTitle(lvl1.level)), 'level');
    const newPotions = Core.potions(COURSE, P) - potions0;
    if (newPotions > 0) toast(t('potion_toast', newPotions, potionReason), 'potion');
    renderHeroHud();
    checkAchievements({ gained: true });
  }

  // ───────────────────────── Barra lateral, actos y racha ─────────────────────────
  function weekStrip() {
    const st = Core.streak(P.days);
    const today = Core.today();
    const names = t('week_days');
    let dots = '';
    for (let i = 6; i >= 0; i--) {
      const d = Core.shift(today, -i);
      const [y, m, day] = d.split('-').map(Number);
      const on = P.days.includes(d);
      dots += `<div class="day ${on ? 'on' : ''} ${i === 0 ? 'today' : ''}"><span>${names[new Date(y, m - 1, day).getDay()]}</span><i>${on ? '🔥' : ''}</i></div>`;
    }
    const msg = st.doneToday ? t('week_done', st.count) : st.count ? t('week_danger', st.count) : t('week_none');
    return `<div class="week">${dots}</div><p>${msg}</p>`;
  }

  /** Lo siguiente que toca en un módulo: lección → quiz → ejercicio → jefe. */
  function nextStep(mod) {
    const base = `#/m/${mod.id}`;
    const li = mod.lessons.findIndex((_, i) => !P.done[`${mod.id}/l${i + 1}`]);
    if (li !== -1) return { href: `${base}/l/${li + 1}`, kind: t('kind_lesson'), label: mod.lessons[li].title, xp: Core.LESSON_XP };
    if (!P.done[`${mod.id}/quiz`]) return { href: `${base}/q`, kind: t('kind_quiz'), label: t('quiz_label'), xp: mod.quiz.length * Core.QUIZ_Q_XP };
    const ex = mod.exercises.find((e) => !P.done[`${mod.id}/${e.id}`]);
    if (ex) return { href: `${base}/e/${ex.id}`, kind: t('kind_exercise'), label: ex.title, xp: ex.xp };
    const boss = mod.boss.find((e) => !P.done[`${mod.id}/${e.id}`]);
    if (boss) return { href: `${base}/e/${boss.id}`, kind: t('kind_boss'), label: boss.title, xp: boss.xp };
    return { href: base, kind: t('kind_cleared'), label: mod.zone, xp: 0 };
  }

  function renderSide() {
    const front = Core.frontier(COURSE, P);
    const active = sceneMod || front;
    const mission = getMission();
    const onMission = location.hash.startsWith('#/mission');
    const mState = !mission ? 'none' : mission.won ? 'won' : 'ready';
    const missionHtml = `<a class="zone mission ${mState} ${onMission ? 'active' : ''}" href="#/mission">
        ${mState === 'ready' ? '<i class="pip"></i>' : ''}
        <span class="zone-icon">🧰</span>
        <span class="zone-text"><b>${t('mission_side')}</b><small>${t(`mission_side_${mState}`)}</small></span>
        <span class="zone-state">${mState === 'won' ? '✔' : mState === 'ready' ? '!' : ''}</span>
      </a>`;
    $('#zones').innerHTML = missionHtml + COURSE.modules
      .map((mod) => {
        const st = Core.moduleState(mod, P);
        const open = unlocked(mod);
        const cls = ['zone', st.cleared ? 'cleared' : open ? 'open' : 'locked'];
        if (mod === active && /^#\/(m\/|$)|^$/.test(location.hash || '')) cls.push('active');
        const inner = `<span class="zone-icon"><canvas data-sprite="${mod.mob.sprite}"></canvas></span>
          <span class="zone-text"><b>${esc(mod.zone)}</b><small>${esc(mod.title)}</small></span>
          <span class="zone-state">${st.cleared ? '⭐' : open ? `${st.done}/${st.total}` : '🔒'}</span>`;
        return open
          ? `<a class="${cls.join(' ')}" href="#/m/${mod.id}">${mod === front && !st.cleared ? '<i class="pip"></i>' : ''}${inner}</a>`
          : `<div class="${cls.join(' ')}" title="${t('locked_title')}">${inner}</div>`;
      })
      .join('');
    $('#zones')
      .querySelectorAll('canvas[data-sprite]')
      .forEach((c) => Game.drawIcon(c, c.dataset.sprite));

    $('#acts').innerHTML = COURSE.acts
      .map((act) => {
        const [short, name] = act.title.split(' · ');
        return act.locked
          ? `<button type="button" class="tab locked" data-act="${act.id}" title="${esc(name)}">${esc(short)} 🔒</button>`
          : `<a class="tab on" href="#/" title="${esc(name)}">${esc(short)}</a>`;
      })
      .join('');
  }

  // ───────────────────────── Vista: módulo ─────────────────────────
  function row({ href, icon, title, meta, done, locked }) {
    const cls = `row ${done ? 'done' : ''} ${locked ? 'locked' : ''}`;
    const inner = `<span class="row-icon">${done ? '✔' : locked ? '🔒' : icon}</span><span class="row-title">${title}</span><span class="row-meta">${meta}</span>`;
    return locked ? `<div class="${cls}">${inner}</div>` : `<a class="${cls}" href="${href}">${inner}</a>`;
  }

  function renderModule(mod) {
    const st = Core.moduleState(mod, P);
    const bossOpen = st.mobDead || P.settings.free;
    const best = P.quiz[mod.id] || 0;
    const step = nextStep(mod);
    const boss = mod.boss.find((e) => !P.done[`${mod.id}/${e.id}`]);
    const card = (href, cls, kicker, title, meta) =>
      href
        ? `<a class="tile ${cls}" href="${href}"><span class="tile-kicker">${kicker}</span><strong>${title}</strong><span class="tile-meta">${meta}</span></a>`
        : `<div class="tile ${cls}"><span class="tile-kicker">${kicker}</span><strong>${title}</strong><span class="tile-meta">${meta}</span></div>`;
    let html = `<p class="lead">${esc(mod.tagline)}</p><div class="tiles">`;
    html += st.cleared
      ? card(null, 'done', t('tile_cleared_kicker'), t('tile_cleared_title'), t('tile_cleared_meta'))
      : card(step.href, 'primary', t('tile_next', step.kind), esc(step.label), `+${step.xp} XP`);
    html += card(
      `#/m/${mod.id}/q`,
      P.done[`${mod.id}/quiz`] ? 'done' : '',
      '🧠 Quiz',
      best ? t('quiz_best', best, mod.quiz.length) : t('quiz_n', mod.quiz.length),
      P.done[`${mod.id}/quiz`] ? t('quiz_passed') : t('quiz_pass_with', Core.quizPass(mod))
    );
    html += card(
      bossOpen && boss ? `#/m/${mod.id}/e/${boss.id}` : null,
      !boss ? 'done' : bossOpen ? 'boss' : 'locked',
      t('boss_kicker'),
      esc(mod.bossMob.name),
      !boss ? t('boss_defeated') : bossOpen ? t('boss_appeared') : esc(t('boss_first', mod.mob.name))
    );
    html += '</div>';

    html += `<h2>${t('h_lessons')}</h2><div class="rows">`;
    mod.lessons.forEach((l, i) => {
      html += row({
        href: `#/m/${mod.id}/l/${i + 1}`,
        icon: i + 1,
        title: esc(l.title),
        meta: `+${Core.LESSON_XP} XP`,
        done: P.done[`${mod.id}/l${i + 1}`],
      });
    });
    html += '</div>';

    html += `<h2>${t('h_quiz')}</h2><div class="rows">`;
    html += row({
      href: `#/m/${mod.id}/q`,
      icon: '?',
      title: esc(t('quiz_row_title', mod.quiz.length)),
      meta: best ? t('quiz_row_best', best, mod.quiz.length) : t('quiz_row_xp', mod.quiz.length * Core.QUIZ_Q_XP),
      done: P.done[`${mod.id}/quiz`],
    });
    html += `</div><p class="hint-line">${t('quiz_need', Core.quizPass(mod), mod.quiz.length)}</p>`;

    html += `<h2>${t('h_exercises')}</h2><div class="rows">`;
    for (const ex of mod.exercises) {
      html += row({
        href: `#/m/${mod.id}/e/${ex.id}`,
        icon: '{ }',
        title: `<code>${esc(ex.title)}</code>`,
        meta: `+${ex.xp} XP`,
        done: P.done[`${mod.id}/${ex.id}`],
      });
    }
    html += '</div>';

    html += `<h2>${esc(t('h_boss', mod.bossMob.name))}</h2><div class="rows">`;
    for (const ex of mod.boss) {
      html += row({
        href: `#/m/${mod.id}/e/${ex.id}`,
        icon: '☠',
        title: `<code>${esc(ex.title)}</code>`,
        meta: `+${ex.xp} XP`,
        done: P.done[`${mod.id}/${ex.id}`],
        locked: !bossOpen,
      });
    }
    html += '</div>';
    if (!bossOpen) html += `<p class="hint-line">${esc(t('boss_hint', mod.mob.name))}</p>`;

    if (mode === 'server') {
      html += `<div class="actions"><button type="button" id="run-all" class="btn">${t('run_all')}</button></div><div id="run-all-out"></div>`;
    }
    view.innerHTML = html;

    const runAll = $('#run-all');
    if (runAll) {
      runAll.addEventListener('click', async () => {
        runAll.disabled = true;
        runAll.textContent = t('running_tests');
        try {
          const { results } = await check({ module: mod.id });
          const fresh = results.filter((r) => r.pass && !P.done[r.id]);
          gain(mod, () => fresh.forEach((r) => Core.markDone(P, r.id)));
          renderModule(mod);
          $('#run-all-out').innerHTML = `<div class="card results">${results
            .map((r) => `<div class="${r.pass ? 'ok' : 'ko'}">${r.pass ? '✔' : '✘'} ${esc(r.id.split('/')[1])}</div>`)
            .join('')}</div>`;
        } catch (err) {
          runAll.disabled = false;
          runAll.textContent = t('run_all');
          toast(String(err.message || err), 'bad');
        }
      });
    }
  }

  async function check(body) {
    const res = await fetch('api/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || t('check_failed'));
    return data;
  }

  // ───────────────────────── Vista: lección ─────────────────────────
  function tagged(cls, tag, body) {
    const el = document.createElement('section');
    el.className = `step ${cls}`;
    el.innerHTML = `${tag ? `<div class="tag">${tag}</div>` : ''}${body}`;
    return el;
  }

  /** Botones de opción. Con `preset` (índice) se pintan ya contestados, sin disparar onAnswer. */
  function optionButtons(q, onAnswer, preset = null) {
    const wrap = document.createElement('div');
    wrap.className = 'opts';
    const mark = (i) =>
      [...wrap.children].forEach((c, j) => {
        c.disabled = true;
        if (j === q.answer) c.classList.add('right');
        else if (j === i) c.classList.add('wrong');
      });
    q.options.forEach((opt, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'opt';
      b.textContent = opt;
      b.addEventListener('click', () => {
        mark(i);
        onAnswer(i === q.answer, i);
      });
      wrap.appendChild(b);
    });
    if (preset !== null && preset !== undefined) mark(preset);
    return wrap;
  }

  /** Qué opción quedó elegida en un bloque ya contestado (o null). */
  function chosenOption(el) {
    const opts = [...el.querySelectorAll('.opt')];
    if (!opts.length || !opts[0].disabled) return null;
    const wrong = opts.findIndex((o) => o.classList.contains('wrong'));
    return wrong >= 0 ? wrong : opts.findIndex((o) => o.classList.contains('right'));
  }

  function restoreRun(snap) {
    if (!run || !snap || snap.hearts === undefined) return;
    run.hearts = snap.hearts;
    run.hurt = snap.hurt;
    pending = snap.pending || 0;
    refreshScene();
    renderHeroHud();
  }

  function buildStep(step, unlock, onAnswer = () => {}, prior = {}) {
    switch (step.type) {
      case 'predict': {
        const el = tagged('predict', t('tag_predict'), `<p class="q">${step.q}</p><pre class="code">${hl(step.code)}</pre>`);
        const why = document.createElement('div');
        why.className = 'why';
        why.hidden = true;
        const showWhy = (right) => {
          why.hidden = false;
          why.classList.add(right ? 'ok' : 'ko');
          why.innerHTML = `<strong>${right ? t('right_exact') : t('wrong_was', esc(step.options[step.answer]))}</strong> ${step.why}`;
        };
        el.appendChild(
          optionButtons(
            step,
            (right) => {
              showWhy(right);
              onAnswer(right);
              unlock();
            },
            prior.choice
          )
        );
        el.appendChild(why);
        if (prior.choice !== null && prior.choice !== undefined) showWhy(prior.choice === step.answer);
        return el;
      }
      case 'think': {
        const el = tagged(
          'think',
          t('tag_think'),
          `<p class="q">${step.q}</p>
           <textarea rows="3" placeholder="${t('think_placeholder')}"></textarea>
           <button type="button" class="btn ghost">${t('think_compare')}</button>
           <div class="why" hidden></div>`
        );
        const reveal = () => {
          const why = $('.why', el);
          why.hidden = false;
          why.innerHTML = step.a;
          const btn = $('button', el);
          if (btn) btn.remove();
        };
        $('button', el).addEventListener('click', () => {
          reveal();
          unlock();
        });
        if (prior.text) $('textarea', el).value = prior.text;
        if (prior.revealed) reveal();
        return el;
      }
      case 'text':
        return tagged('text', '', step.html);
      case 'code':
        return tagged('codeblock', '', `${step.caption ? `<p>${step.caption}</p>` : ''}<pre class="code">${hl(step.code)}</pre>`);
      case 'analogy':
        return tagged('analogy', `🎮 ${esc(step.title)}`, `<p>${step.html}</p>`);
      case 'dsa':
        return tagged('dsa', t('tag_dsa'), step.html);
      case 'viz': {
        const el = tagged('vizstep', `🎬 ${esc(step.title)}`, '<div></div>');
        Viz.mount(el.lastElementChild, step.spec);
        return el;
      }
      case 'links':
        return tagged(
          'links',
          t('tag_links'),
          `<ul>${step.items.map((l) => `<li><a href="${esc(l.u)}" target="_blank" rel="noopener">${esc(l.t)} ↗</a></li>`).join('')}</ul>`
        );
      default:
        return tagged('text', '', '');
    }
  }

  function renderLesson(mod, idx) {
    const lesson = mod.lessons[idx];
    if (!lesson) return renderModule(mod);
    const id = `${mod.id}/l${idx + 1}`;
    const gates = (s) => s.type === 'predict' || s.type === 'think';

    view.innerHTML = `<a class="back" href="#/m/${mod.id}">← ${esc(mod.title)}</a>
      <p class="kicker">${t('lesson_kicker', idx + 1, mod.lessons.length)}</p>
      <h1>${esc(lesson.title)}</h1>
      <div class="progress-dots"></div>
      <div class="steps"></div>
      <div class="lesson-nav"></div>`;
    const stepsEl = $('.steps', view);
    const nav = $('.lesson-nav', view);
    const dots = $('.progress-dots', view);
    let shown = 0;
    let locked = false;

    function updateNav() {
      dots.innerHTML = lesson.steps.map((_, i) => `<i class="${i < shown ? 'on' : ''}"></i>`).join('');
      nav.innerHTML = '';
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn primary';
      if (locked) {
        btn.textContent = t('answer_to_continue');
        btn.disabled = true;
      } else if (shown < lesson.steps.length) {
        btn.textContent = t('continue');
        btn.addEventListener('click', showNext);
      } else if (!P.done[id]) {
        btn.textContent = t('complete_lesson', Core.LESSON_XP);
        btn.addEventListener('click', () => {
          const flawless = run && run.hurt === 0;
          gain(
            mod,
            () => {
              Core.markDone(P, id);
              if (flawless) P.awards[`${id}:flawless`] = Core.today();
            },
            flawless ? t('reason_flawless') : ''
          );
          endRun();
          updateNav();
        });
      } else {
        const next = mod.lessons[idx + 1];
        const a = document.createElement('a');
        a.className = 'btn primary';
        a.href = next ? `#/m/${mod.id}/l/${idx + 2}` : `#/m/${mod.id}`;
        a.textContent = next ? t('next_lesson', next.title) : t('lessons_done_go');
        nav.innerHTML = `<span class="done-note">${t('lesson_done')}</span>`;
        nav.appendChild(a);
        return;
      }
      nav.appendChild(btn);
    }

    // El paso nuevo aparece donde estaba el botón: no movemos el scroll por ti.
    function showNext(prior = {}) {
      const step = lesson.steps[shown];
      const key = `${mod.id}/l${idx + 1}/${shown}`;
      const answeredAlready = (prior.choice !== null && prior.choice !== undefined) || prior.revealed;
      locked = gates(step) && !answeredAlready;
      const el = buildStep(
        step,
        () => {
          locked = false;
          updateNav();
        },
        (right) => answered(right, key, { dmg: right ? lessonDmg() : 0 }),
        prior
      );
      stepsEl.appendChild(el);
      shown++;
      updateNav();
    }

    const snap = resume && resume.kind === 'lesson' && resume.id === id ? resume : null;
    const predictCount = lesson.steps.filter((st) => st.type === 'predict').length;
    let correctSoFar = snap
      ? snap.steps.filter((p, i) => lesson.steps[i] && lesson.steps[i].type === 'predict' && p.choice === lesson.steps[i].answer).length
      : 0;
    const lessonDmg = () => {
      if (P.done[id] || !predictCount) return 0;
      correctSoFar++;
      const share = (k) => Math.round((Core.LESSON_XP * Math.min(k, predictCount)) / predictCount);
      return share(correctSoFar) - share(correctSoFar - 1);
    };
    current = {
      snapshot: () => ({
        kind: 'lesson',
        id,
        steps: [...stepsEl.children].map((el) => {
          const ta = el.querySelector('textarea');
          if (ta) return { text: ta.value, revealed: !el.querySelector('.why').hidden };
          return { choice: chosenOption(el) };
        }),
        hearts: run ? run.hearts : undefined,
        hurt: run ? run.hurt : undefined,
        pending,
      }),
    };

    if (P.done[id]) {
      // Repaso: todo visible de una vez (conserva lo que ya hubieras contestado).
      lesson.steps.forEach((step, i) => stepsEl.appendChild(buildStep(step, () => {}, () => {}, (snap && snap.steps[i]) || {})));
      shown = lesson.steps.length;
      updateNav();
    } else {
      startRun(() => knockoutCard(mod, t('ko_what_lesson'), () => renderLesson(mod, idx)));
      if (snap && snap.steps.length) {
        restoreRun(snap);
        snap.steps.forEach((prior) => showNext(prior));
      } else {
        showNext();
      }
    }
  }

  // ───────────────────────── Vista: quiz ─────────────────────────
  function renderQuiz(mod) {
    const total = mod.quiz.length;
    const pass = Core.quizPass(mod);
    const snap = resume && resume.kind === 'quiz' && resume.mod === mod.id ? resume : null;
    const practice = (P.quiz[mod.id] || 0) >= total; // ya sacaste 5/5: repetirlo no da nada
    let i = snap ? snap.i : 0;
    let score = snap ? snap.score : 0;
    startRun(() => knockoutCard(mod, t('ko_what_quiz'), () => renderQuiz(mod)));
    restoreRun(snap);
    current = {
      snapshot: () => ({ kind: 'quiz', mod: mod.id, i, score, choice: chosenOption(view), hearts: run && run.hearts, hurt: run && run.hurt, pending }),
    };

    function question(preset = null) {
      const q = mod.quiz[i];
      view.innerHTML = `<a class="back" href="#/m/${mod.id}">← ${esc(mod.title)}</a>
        <p class="kicker">${t('quiz_kicker', i + 1, total, score)}${practice ? ` · <span class="practice-tag">${t('practice_tag')}</span>` : ''}</p>
        <section class="step predict"><p class="q">${q.q}</p><pre class="code">${hl(q.code)}</pre></section>`;
      const step = $('.step', view);
      const why = document.createElement('div');
      why.className = 'why';
      why.hidden = true;
      const after = (right) => {
        why.hidden = false;
        why.classList.add(right ? 'ok' : 'ko');
        why.innerHTML = `<strong>${right ? t('right_correct') : t('wrong_was', esc(q.options[q.answer]))}</strong> ${q.why}`;
        if (run && run.dead) return; // caíste: se ve la explicación y luego llega el K.O.
        const next = document.createElement('button');
        next.type = 'button';
        next.className = 'btn primary';
        next.textContent = i + 1 < total ? t('next') : t('see_result');
        next.addEventListener('click', () => {
          i++;
          if (i < total) question();
          else result();
        });
        step.appendChild(next);
      };
      step.appendChild(
        optionButtons(
          q,
          (right) => {
            if (right) score++;
            answered(right, `${mod.id}/q/${i}`, { dmg: right && !P.done[`${mod.id}/quiz`] ? Core.QUIZ_Q_XP : 0, practice });
            after(right);
          },
          preset
        )
      );
      step.appendChild(why);
      if (preset !== null) after(preset === q.answer);
    }

    function result() {
      const best = P.quiz[mod.id] || 0;
      const passed = score >= pass;
      const perfect = score === total;
      gain(
        mod,
        () => {
          if (score > best) P.quiz[mod.id] = score;
          if (passed) Core.markDone(P, `${mod.id}/quiz`);
          if (perfect && !P.awards[`${mod.id}/quiz:perfect`]) P.awards[`${mod.id}/quiz:perfect`] = Core.today();
        },
        perfect ? t('reason_perfect') : ''
      );
      endRun();
      if (!passed) Game.miss(t('almost'));
      const paint = () => {
      const m = modById(mod.id);
      view.innerHTML = `<a class="back" href="#/m/${m.id}">← ${esc(m.title)}</a>
        <section class="card result ${passed ? 'ok' : 'ko'}">
          <div class="score">${score} / ${total}</div>
          <h1>${passed ? t('quiz_passed_h') : t('quiz_not_yet')}</h1>
          <p>${passed ? (perfect ? t('quiz_perfect_msg') : t('quiz_pass_msg')) : t('quiz_fail_msg', pass, total)}</p>
          <div class="actions">
            <button type="button" class="btn" id="again">${t('retry_plain')}</button>
            <a class="btn primary" href="#/m/${mod.id}">${t('back_module')}</a>
          </div>
        </section>`;
      $('#again').addEventListener('click', () => renderQuiz(modById(mod.id)));
      };
      paint();
      current = { rerender: paint };
    }

    question(snap ? snap.choice : null);
  }

  // ───────────────────────── Vista: ejercicio ─────────────────────────
  /** Lee la salida de node --test y saca la lista de tests de primer nivel con ✔ / ✖. */
  function parseTests(output) {
    const tests = [];
    for (const line of output.split('\n')) {
      if (/^ℹ /.test(line)) break; // empieza el resumen
      const m = line.match(/^([✔✖]) (.*?) \([\d.]+ms\)$/);
      if (m && !/\.test\.js$/.test(m[2])) tests.push({ pass: m[1] === '✔', name: m[2] });
    }
    return tests;
  }

  /** Separa el comentario /** ... *\/ del inicio (el enunciado) del código. */
  function splitDoc(code) {
    const m = code.match(/^\/\*\*[\s\S]*?\*\/\n?/);
    return m ? { head: m[0], body: code.slice(m[0].length) } : { head: '', body: code };
  }

  /** Convierte el enunciado del comentario en HTML: párrafos, listas y bloques de ejemplo. */
  function renderStatement(head) {
    const lines = head
      .replace(/^\/\*\*\n?/, '')
      .replace(/\s*\*\/\n?$/, '')
      .split('\n')
      .map((l) => l.replace(/^ ?\*( |$)/, ''));
    const inline = (txt) => esc(txt).replace(/`([^`]+)`/g, '<code>$1</code>');
    const out = [];
    let para = [];
    let code = [];
    let list = [];
    const flush = () => {
      if (para.length) out.push(`<p>${inline(para.join(' '))}</p>`);
      if (code.length) out.push(`<pre class="code">${hl(code.join('\n'))}</pre>`);
      if (list.length) out.push(`<ul>${list.map((x) => `<li>${inline(x)}</li>`).join('')}</ul>`);
      para = [];
      code = [];
      list = [];
    };
    lines.forEach((line, i) => {
      if (i === 0 && /^M\d+ · /.test(line)) return; // título: ya está arriba
      if (/^Run:/.test(line)) return; // el comando va en la consola
      if (!line.trim()) return flush();
      const bullet = line.match(/^ {0,4}- (.*)/);
      if (bullet) {
        if (para.length || code.length) flush();
        return list.push(bullet[1]);
      }
      if (/^ {2,}/.test(line)) {
        if (list.length && /^ {4,}/.test(line)) return (list[list.length - 1] += ' ' + line.trim()); // continuación de un punto
        if (para.length || list.length) flush();
        return code.push(line.replace(/^ {2}/, ''));
      }
      if (code.length || list.length) flush();
      if (/^[A-Z][\w ,'()]*:$/.test(line.trim()) && line.length < 48) {
        flush();
        return out.push(`<h4>${inline(line.trim())}</h4>`);
      }
      para.push(line.trim());
    });
    flush();
    return out.join('');
  }

  // La escena se "muda" arriba del enunciado en la vista de ejercicio y regresa al salir.
  function placeScene(target) {
    const scene = $('.scene');
    const home = $('#main');
    if (target) target.prepend(scene);
    else if (scene.parentElement !== home) home.prepend(scene);
  }

  function renderExercise(mod, exId) {
    const isBoss = mod.boss.some((e) => e.id === exId);
    const ex = [...mod.exercises, ...mod.boss].find((e) => e.id === exId);
    if (!ex) return renderModule(mod);
    const id = `${mod.id}/${ex.id}`;
    const path = exercisePath(mod, ex);
    const testCmd = `node --test ${path.replace(/\.js$/, '.test.js')}`;
    if (isBoss && !Core.moduleState(mod, P).mobDead && !P.settings.free) {
      toast(t('boss_first_toast', mod.mob.name), 'bad');
      return renderModule(mod);
    }
    const snap = resume && resume.kind === 'exercise' && resume.id === id ? resume : null;
    const server = mode === 'server';

    if (!server) {
      // Sin servidor no podemos leer ni guardar archivos: vista simple de antes.
      view.innerHTML = `<a class="back" href="#/m/${mod.id}">← ${esc(mod.title)}</a>
        <p class="kicker">${isBoss ? t('kicker_boss') : t('kicker_ex')} · +${ex.xp} XP</p>
        <h1><code>${esc(ex.title)}</code></h1>
        <p class="lead">${ex.brief}</p>
        <section class="card">
          <ol class="how">
            <li>${t('how_1')}<div class="file"><code>${esc(path)}</code>${copyButton(path)}</div></li>
            <li>${t('how_2')}</li>
            <li>${t('how_3')}</li>
          </ol>
          <div class="notice">${t('file_notice')}</div>
          <div class="actions"><button type="button" class="btn" id="manual">${t('manual_pass')}</button></div>
          <p class="hint-line">${t('from_terminal')} <code>${esc(testCmd)}</code>${copyButton(testCmd)}</p>
        </section>`;
      $('#manual').addEventListener('click', () => gain(mod, () => Core.markDone(P, id)));
      return;
    }

    document.body.classList.add('workspace');
    view.innerHTML = `<div class="ws">
      <section class="ws-left">
        <div class="ws-scene"></div>
        <div class="ws-head">
          <a class="back" href="#/m/${mod.id}">← ${esc(mod.title)}</a>
          <p class="kicker">${isBoss ? t('kicker_boss') : t('kicker_ex')} · +${ex.xp} XP</p>
          <h1><code>${esc(ex.title)}</code> <span id="done-badge"></span></h1>
        </div>
        <div class="ws-tabs" role="tablist">
          <button type="button" role="tab" class="ws-tab on" data-tab="desc">${t('tab_desc')}</button>
          <button type="button" role="tab" class="ws-tab" data-tab="hints">${t('tab_hints')} <span id="hint-count"></span></button>
          <button type="button" role="tab" class="ws-tab" data-tab="sol">${t('tab_solution')}</button>
        </div>
        <div class="ws-pane" data-pane="desc">
          <p class="lead">${ex.brief}</p>
          ${t('stmt_note') ? `<p class="hint-line">${t('stmt_note')}</p>` : ''}
          <div class="statement" id="statement"><p class="hint-line">${t('ed_loading')}</p></div>
        </div>
        <div class="ws-pane" data-pane="hints" hidden>
          <p class="hint-line">${t('hints_rule')}</p>
          <div id="hint-list"></div>
          <button type="button" class="btn ghost" id="more-hint"></button>
        </div>
        <div class="ws-pane" data-pane="sol" hidden>
          <div id="sol-locked"><p class="hint-line">🔒 ${t('solution_locked')}</p></div>
          <div id="sol-open" hidden>
            <p class="hint-line">${t('solution_rule')}</p>
            <button type="button" class="btn ghost" id="show-solution">${t('see_solution')}</button>
            <pre class="code" id="solution" hidden></pre>
          </div>
        </div>
      </section>

      <section class="ws-right">
        <div class="ide-bar">
          <span class="ide-file"><code>${esc(path)}</code>${copyButton(path)}</span>
          <span class="ide-status" id="ide-status">${t('ed_loading')}</span>
          <button type="button" class="btn ghost" id="ide-draw">${t('draw_btn')}</button>
          <button type="button" class="btn ghost" id="ide-save">${t('ed_save')}</button>
          <button type="button" class="btn primary" id="attack">${t('attack')}</button>
        </div>
        <div id="editor" class="editor-host"></div>
        <div class="console">
          <div class="console-head"><strong>${t('console_h')}</strong><span id="verdict"></span></div>
          <div class="console-body">
            <p class="hint-line" id="console-empty">${t('console_empty')}</p>
            <ul class="test-list" id="test-list"></ul>
            <details class="raw" id="raw" hidden><summary>${t('raw_output')}</summary><pre class="output" id="output"></pre></details>
            <p class="hint-line ide-alt">${t('ed_keys')}<br />${t('ed_vscode_label')} <code>${esc(path)}</code> · ${t('from_terminal')} <code>${esc(testCmd)}</code>${copyButton(testCmd)}</p>
          </div>
        </div>
      </section>
    </div>`;
    placeScene($('.ws-scene'));

    // Pestañas
    view.querySelector('.ws-tabs').addEventListener('click', (e) => {
      const tab = e.target.closest('[data-tab]');
      if (!tab) return;
      view.querySelectorAll('.ws-tab').forEach((b) => b.classList.toggle('on', b === tab));
      view.querySelectorAll('.ws-pane').forEach((p) => (p.hidden = p.dataset.pane !== tab.dataset.tab));
    });

    // Pistas
    const hintList = $('#hint-list');
    const moreHint = $('#more-hint');
    function paintHints() {
      const n = Math.min(P.hints[id] || 0, ex.hints.length);
      hintList.innerHTML = ex.hints
        .slice(0, n)
        .map((h, i) => `<div class="hint"><b>${i + 1}</b><span>${h}</span></div>`)
        .join('');
      moreHint.hidden = n >= ex.hints.length;
      moreHint.textContent = n === 0 ? t('hint_first') : t('hint_n', n + 1, ex.hints.length);
      $('#hint-count').textContent = `${n}/${ex.hints.length}`;
    }
    moreHint.addEventListener('click', () => {
      P.hints[id] = (P.hints[id] || 0) + 1;
      save();
      paintHints();
    });
    paintHints();

    // Estado "hecho" y solución
    function paintDone() {
      const done = Boolean(P.done[id]);
      $('#done-badge').innerHTML = done ? `<span class="badge ok">${t('defeated_badge')}</span>` : '';
      $('#sol-locked').hidden = done;
      $('#sol-open').hidden = !done;
    }
    $('#show-solution').addEventListener('click', async (e) => {
      try {
        const res = await fetch(`api/solution?id=${encodeURIComponent(id)}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        const pre = $('#solution');
        pre.innerHTML = hl(data.code);
        pre.hidden = false;
        e.target.remove();
      } catch (err) {
        toast(String(err.message || err), 'bad');
      }
    });
    paintDone();

    // ── Editor con guardado automático (el enunciado se guarda intacto arriba de tu código) ──
    let ed = null;
    let head = '';
    let dirty = false;
    let timer = null;
    const statusEl = $('#ide-status');
    const setStatus = (key) => {
      statusEl.textContent = t(key);
      statusEl.dataset.state = key;
    };
    const fullCode = () => head + ed.value;

    async function persist({ keepalive = false } = {}) {
      clearTimeout(timer);
      if (!ed || !dirty) return true;
      dirty = false;
      setStatus('ed_saving');
      try {
        const res = await fetch('api/file', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, code: fullCode() }),
          keepalive,
        });
        if (!res.ok) throw new Error(res.status);
        if (statusEl.isConnected) setStatus('ed_saved');
        return true;
      } catch {
        dirty = true;
        if (statusEl.isConnected) setStatus('ed_error');
        return false;
      }
    }

    async function loadFile() {
      const res = await fetch(`api/file?id=${encodeURIComponent(id)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data.code;
    }

    function applyFile(code) {
      const parts = splitDoc(code);
      head = parts.head;
      $('#statement').innerHTML = head ? renderStatement(head) : '';
      return parts.body;
    }

    const attackBtn = $('#attack');
    async function attack() {
      if (attackBtn.disabled) return;
      attackBtn.disabled = true;
      attackBtn.textContent = t('running_tests');
      const verdict = $('#verdict');
      const list = $('#test-list');
      try {
        if (!(await persist())) throw new Error(t('ed_error'));
        const { results } = await check({ id });
        const r = results[0];
        const tests = parseTests(r.output);
        const passed = tests.filter((x) => x.pass).length;
        $('#console-empty').hidden = true;
        list.innerHTML = tests
          .map((x) => `<li class="${x.pass ? 'ok' : 'ko'}">${x.pass ? '✔' : '✖'} ${esc(x.name)}</li>`)
          .join('');
        $('#output').textContent = r.output;
        $('#raw').hidden = r.pass;
        if (r.pass) {
          const fresh = !P.done[id];
          gain(mod, () => Core.markDone(P, id));
          verdict.innerHTML = `<span class="verdict ok">${t('verdict_ok', fresh)} · ${t('tests_passed', passed, tests.length)}</span>`;
        } else {
          gain(mod, () => {}); // intentar también cuenta para la racha
          Game.miss(t('blocked'));
          Sfx.play('blocked');
          verdict.innerHTML = `<span class="verdict ko">${tests.length ? t('tests_passed', passed, tests.length) : t('verdict_crash')}</span>`;
          $('#raw').open = !tests.length || passed === 0; // error de sintaxis o todo rojo: muestra el detalle
        }
        paintDone();
      } catch (err) {
        toast(String(err.message || err), 'bad');
      }
      if (attackBtn.isConnected) {
        attackBtn.disabled = false;
        attackBtn.textContent = t('attack');
      }
    }
    attackBtn.addEventListener('click', attack);
    $('#ide-save').addEventListener('click', () => {
      dirty = true;
      persist();
    });

    // Modo dibujo: escribes a mano, Claude lo pasa a texto (solo ve tu dibujo, no el enunciado) y cae en el editor.
    $('#ide-draw').addEventListener('click', () => {
      if (!ed) return;
      Draw.open({
        t,
        notice: ME.draw === 'ok' ? '' : t('draw_off_' + ME.draw),
        send: async (image) => {
          const res = await fetch('api/transcribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image }),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) throw Object.assign(new Error('transcribe'), { code: data.error || 'fail' });
          return data.text || '';
        },
        onText: (text) => {
          ed.insert(text);
          toast(t('draw_inserted'));
        },
      });
    });

    current = {
      snapshot: () => ({ kind: 'exercise', id, code: ed ? fullCode() : null, dirty }),
      flush: () => persist({ keepalive: true }),
      // Si editaste el archivo en VS Code y regresas, se actualiza aquí (solo si no hay cambios sin guardar).
      onFocus: async () => {
        if (!ed || dirty) return;
        try {
          const code = await loadFile();
          if (code !== fullCode()) ed.value = applyFile(code);
        } catch {}
      },
    };

    (async () => {
      let code;
      try {
        code = snap && snap.code !== null ? snap.code : await loadFile();
      } catch (err) {
        setStatus('ed_error');
        return toast(String(err.message || err), 'bad');
      }
      if (!statusEl.isConnected) return; // ya te fuiste a otra pantalla
      ed = Editor.mount($('#editor'), {
        value: applyFile(code),
        onChange: () => {
          dirty = true;
          setStatus('ed_unsaved');
          clearTimeout(timer);
          timer = setTimeout(persist, 800);
        },
        onSave: () => {
          dirty = true;
          persist();
        },
        onRun: attack,
      });
      if (snap && snap.dirty) {
        dirty = true;
        persist();
      } else {
        setStatus('ed_saved');
      }
    })();
  }

  // ───────────────────────── Misión del día (repaso espaciado) ─────────────────────────
  // Cada pregunta tiene una llave: "m1/l3/0" (predicción 0 de la lección 3) o "m1/q/2" (quiz, pregunta 2).
  // Las que fallas entran a P.missed en la caja 0. Acertarlas en una misión las sube de caja y las
  // espacia (2 días, luego 5); en la caja 3 se dan por dominadas. Fallarlas las regresa a la caja 0.
  const REVIEW_GAP = [1, 2, 5];
  const MISSION_SIZE = 3;

  function itemByKey(key) {
    const [mid, kind, a, b] = key.split('/');
    const mod = modById(mid);
    if (!mod) return null;
    if (kind === 'q') {
      const q = mod.quiz[Number(a)];
      return q ? { mod, src: `${mod.title} · Quiz`, q } : null;
    }
    const li = Number(kind.slice(1)) - 1;
    const lesson = mod.lessons[li];
    const step = lesson && lesson.steps[Number(a)];
    return step && step.type === 'predict' && b === undefined ? { mod, src: `${mod.title} · ${lesson.title}`, q: step } : null;
  }

  /** Preguntas que ya viste: las de lecciones y quizzes completados. */
  function seenKeys() {
    const keys = [];
    for (const mod of COURSE.modules) {
      mod.lessons.forEach((l, li) => {
        if (!P.done[`${mod.id}/l${li + 1}`]) return;
        l.steps.forEach((st, si) => st.type === 'predict' && keys.push(`${mod.id}/l${li + 1}/${si}`));
      });
      if (P.quiz[mod.id]) mod.quiz.forEach((_, qi) => keys.push(`${mod.id}/q/${qi}`));
    }
    return keys;
  }

  function seededShuffle(arr, seed) {
    let h = 2166136261;
    for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
    const rand = () => ((h = Math.imul(h ^ (h >>> 15), 2246822507) ^ Math.imul(h ^ (h >>> 13), 3266489909)) >>> 0) / 4294967296;
    const out = [...arr];
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  /** La misión de hoy: primero las falladas que ya tocan, luego relleno con preguntas vistas. */
  function getMission() {
    const today = Core.today();
    if (P.mission && P.mission.date === today) return P.mission;
    const due = Object.entries(P.missed)
      .filter(([k, v]) => v.due <= today && itemByKey(k))
      .sort((a, b) => a[1].due.localeCompare(b[1].due))
      .map(([k]) => k);
    const ids = due.slice(0, MISSION_SIZE);
    for (const k of seededShuffle(seenKeys(), today)) {
      if (ids.length >= MISSION_SIZE) break;
      if (!ids.includes(k)) ids.push(k);
    }
    if (!ids.length) return null;
    P.mission = { date: today, ids, won: false };
    save();
    return P.mission;
  }

  function reviewResult(key, right) {
    const today = Core.today();
    const entry = P.missed[key];
    if (!right) {
      P.missed[key] = { box: 0, due: Core.shift(today, 1) };
    } else if (entry) {
      const box = entry.box + 1;
      if (box >= REVIEW_GAP.length) delete P.missed[key];
      else P.missed[key] = { box, due: Core.shift(today, REVIEW_GAP[box]) };
    }
    save();
  }

  const CHEST = {
    closed: ['............', '............', '..bbbbbbbb..', '.byyyyyyyyb.', 'bbbbbbbbbbbb', 'byyyykkyyyyb', 'bbbbbyybbbbb', 'bbbbbbbbbbbb', 'byyyyyyyyyyb', 'bbbbbbbbbbbb'],
    open: ['.bbbbbbbbbb.', '.byyyyyyyyb.', '..bbbbbbbb..', '...w....w...', '.wwwwwwwwww.', 'wywwywywwyww', 'bbbbbbbbbbbb', 'bbbbbyybbbbb', 'byyyyyyyyyyb', 'bbbbbbbbbbbb'],
  };
  function chestSvg(kind) {
    const pal = { b: '#8a5a2b', y: '#ffd166', k: '#1b1b2b', w: '#fff6c0' };
    let rects = '';
    CHEST[kind].forEach((row, y) =>
      [...row].forEach((ch, x) => {
        if (ch !== '.') rects += `<rect x="${x}" y="${y}" width="1" height="1" fill="${pal[ch]}"/>`;
      })
    );
    return `<svg class="chest ${kind}" viewBox="0 0 12 10" aria-hidden="true">${rects}</svg>`;
  }

  function renderMission() {
    const m = getMission();
    const front = Core.frontier(COURSE, P);
    if (!m) {
      view.innerHTML = `<h1>${t('mission_h')}</h1>
        <section class="card"><p>${t('mission_empty')}</p>
        <div class="actions"><a class="btn primary" href="${nextStep(front).href}">${t('continue_btn')}</a></div></section>`;
      return;
    }
    const items = m.ids.map((k) => ({ key: k, ...itemByKey(k) })).filter((x) => x.q);
    const snap = resume && resume.kind === 'mission' && resume.date === m.date ? resume : null;
    let i = snap ? snap.i : 0;
    let score = snap ? snap.score : 0;
    startRun(() => knockoutCard(front, t('ko_what_mission'), () => renderMission()));
    restoreRun(snap);
    current = {
      snapshot: () => ({ kind: 'mission', date: m.date, i, score, choice: chosenOption(view), hearts: run && run.hearts, hurt: run && run.hurt }),
    };

    function question(preset = null) {
      const it = items[i];
      const missedBefore = Boolean(P.missed[it.key]);
      view.innerHTML = `<p class="kicker">${t('mission_kicker', i + 1, items.length)}</p>
        <p class="mission-src">${esc(t('mission_from', it.src))}${missedBefore ? ` · <span class="tag-missed">${t('mission_missed_tag')}</span>` : ''}</p>
        <section class="step predict"><p class="q">${it.q.q}</p><pre class="code">${hl(it.q.code)}</pre></section>`;
      const step = $('.step', view);
      const why = document.createElement('div');
      why.className = 'why';
      why.hidden = true;
      const after = (right) => {
        why.hidden = false;
        why.classList.add(right ? 'ok' : 'ko');
        why.innerHTML = `<strong>${right ? t('right_correct') : t('wrong_was', esc(it.q.options[it.q.answer]))}</strong> ${it.q.why}`;
        if (run && run.dead) return;
        const next = document.createElement('button');
        next.type = 'button';
        next.className = 'btn primary';
        next.textContent = i + 1 < items.length ? t('next') : t('see_result');
        next.addEventListener('click', () => {
          i++;
          if (i < items.length) question();
          else result();
        });
        step.appendChild(next);
      };
      step.appendChild(
        optionButtons(
          it.q,
          (right) => {
            if (right) score++;
            reviewResult(it.key, right);
            answered(right, it.key, { track: false });
            after(right);
          },
          preset
        )
      );
      step.appendChild(why);
      if (preset !== null) after(preset === it.q.answer);
    }

    function result() {
      endRun();
      const all = score === items.length;
      if (all && !m.won) {
        m.won = true;
        gain(front, () => (P.awards[`mission:${m.date}`] = Core.today()), t('reason_mission'));
        const paintChest = (opened) => {
        view.innerHTML = `<section class="card result ok chest-card">
            <div class="chest-wrap ${opened ? 'opened static' : ''}">${chestSvg(opened ? 'open' : 'closed')}</div>
            <h1>${t('mission_won_h')}</h1>
            <div class="loot"><span>+${Core.MISSION_XP} XP</span><span>+1 🧪</span></div>
            <p>${t('mission_won_p')}</p>
            <div class="actions"><a class="btn primary" href="${nextStep(front).href}">${t('continue_btn')}</a></div>
          </section>`;
        };
        paintChest(false);
        current = { rerender: () => paintChest(true) };
        setTimeout(() => {
          const wrap = $('.chest-wrap');
          if (!wrap) return;
          wrap.innerHTML = chestSvg('open');
          wrap.classList.add('opened');
          Sfx.play('chest');
        }, 700);
        return;
      }
      if (all) Sfx.play('coin');
      const paint = () => {
      view.innerHTML = `<section class="card result ${all ? 'ok' : 'ko'}">
          <div class="score">${score} / ${items.length}</div>
          <h1>${all ? t('mission_replay_h') : t('quiz_not_yet')}</h1>
          <p>${all ? t('mission_replay_p') : t('mission_fail_p')}</p>
          <div class="actions">
            <button type="button" class="btn" id="again">${t('retry_plain')}</button>
            <a class="btn primary" href="${nextStep(front).href}">${t('continue_btn')}</a>
          </div>
        </section>`;
      $('#again').addEventListener('click', () => renderMission());
      };
      paint();
      current = { rerender: paint };
    }

    question(snap ? snap.choice : null);
  }

  // ───────────────────────── Perfil y vitrina de logros ─────────────────────────
  function renderProfile() {
    current = { rerender: renderProfile };
    const xp = Core.totalXp(COURSE, P);
    const lvl = Core.levelInfo(xp);
    const unlockedCount = ACHIEVEMENTS.filter((a) => P.achievements[a.id]).length;
    const stat = (label, value) => `<div class="stat-card"><b>${value}</b><span>${label}</span></div>`;
    view.innerHTML = `<section class="profile-head">
        <div class="avatar big"><canvas id="avatar-big" width="9" height="9"></canvas><b>${lvl.level}</b></div>
        <div>
          <h1>${esc(heroName())}</h1>
          <p class="lead">${esc(levelTitle(lvl.level))}</p>
          <button type="button" class="btn ghost" id="rename">${t('profile_rename')}</button>
        </div>
      </section>
      <div class="stat-grid">
        ${stat(t('st_level'), lvl.level)}
        ${stat('XP', xp)}
        ${stat(t('st_streak'), t('days_n', Core.streak(P.days).count))}
        ${stat(t('st_best_streak'), t('days_n', Core.bestStreak(P.days)))}
        ${stat(t('st_combo'), `x${P.stats.bestCombo || 0}`)}
        ${stat(t('st_potions'), `🧪 ${Core.potions(COURSE, P)}`)}
        ${stat(t('st_missions'), `🧰 ${Core.missionsWon(P)}`)}
        ${stat(t('st_ach'), `${unlockedCount} / ${ACHIEVEMENTS.length}`)}
      </div>
      <h2>${t('h_medals')}</h2>
      <div class="medals">${ACHIEVEMENTS.map((a) => {
        const when = P.achievements[a.id];
        return `<div class="medal ${when ? 'on' : 'off'}">
          <span class="medal-icon">${when ? a.icon : '🔒'}</span>
          <strong>${esc(a.t[I18n.lang] || a.t.es)}</strong>
          <small>${esc(a.d[I18n.lang] || a.d.es)}</small>
          <em>${when ? t('ach_unlocked_on', when) : t('ach_locked')}</em>
        </div>`;
      }).join('')}</div>`;
    Game.drawAvatar($('#avatar-big'), lvl.level - 1);
    $('#rename').addEventListener('click', () => {
      const name = prompt(t('hero_prompt'), heroName());
      if (name && name.trim()) {
        P.settings.name = name.trim().slice(0, 16);
        save();
        refreshHeader();
        renderProfile();
      }
    });
  }

  // ───────────────────────── Router ─────────────────────────
  function route({ keepScroll = false } = {}) {
    const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
    let mod = parts[0] === 'm' ? modById(parts[1]) : null;
    if (current && current.flush) current.flush(); // no pierdas código sin guardar al cambiar de pantalla
    current = null;
    document.body.classList.remove('workspace');
    placeScene(null);
    if (!keepScroll) {
      $('#main').scrollTo(0, 0);
      window.scrollTo(0, 0);
    }

    if (parts[0] === 'mission' || parts[0] === 'profile') {
      endRun();
      sceneMod = Core.frontier(COURSE, P);
      document.body.classList.add('focus');
      $('#banner').innerHTML = '';
      refreshScene();
      renderSide();
      return parts[0] === 'mission' ? renderMission() : renderProfile();
    }

    if (mod && !unlocked(mod)) {
      toast(t('zone_locked'), 'bad');
      location.hash = '#/';
      return;
    }
    if (!mod) mod = Core.frontier(COURSE, P);
    endRun();
    const hub = !parts[2];
    sceneMod = mod;
    document.body.classList.toggle('focus', !hub);
    $('#banner').innerHTML = hub ? `<span class="banner-kicker">${esc(mod.zone)}</span><h1>${esc(mod.title)}</h1>` : '';
    refreshScene();
    renderSide();
    if (parts[2] === 'l') return renderLesson(mod, Number(parts[3]) - 1);
    if (parts[2] === 'q') return renderQuiz(mod);
    if (parts[2] === 'e') return renderExercise(mod, parts[3]);
    renderModule(mod);
  }

  // ───────────────────────── Arranque ─────────────────────────
  async function start() {
    await load();
    initTheme();
    initLang();
    initSound();
    Game.init($('#scene'), $('#hud-mob'), $('#floats'));
    $('#hud-hero').addEventListener('click', (e) => {
      if (e.target.closest('#potion')) drinkPotion();
    });
    refreshHeader();

    $('#hero-name').addEventListener('click', () => (location.hash = '#/profile'));
    $('#acts').addEventListener('click', (e) => {
      const tab = e.target.closest('[data-act]');
      if (!tab) return;
      const act = COURSE.acts.find((a) => a.id === tab.dataset.act);
      toast(t('act_soon', act.title, act.planned.join(', ')));
    });
    const logout = $('#logout');
    if (ME.login) {
      logout.hidden = false;
      logout.addEventListener('click', async () => {
        if (current && current.flush) await current.flush();
        await fetch('api/logout', { method: 'POST' }).catch(() => {});
        location.reload();
      });
    }
    $('#free-mode').addEventListener('change', (e) => {
      P.settings.free = e.target.checked;
      save();
      route();
    });

    // Si corriste `npm run check` en la terminal, al volver a la pestaña se refleja aquí.
    window.addEventListener('beforeunload', () => current && current.flush && current.flush());
    window.addEventListener('focus', async () => {
      if (mode !== 'server') return;
      if (current && current.onFocus) current.onFocus();
      try {
        const res = await fetch('api/progress');
        if (!res.ok) return;
        const before = Object.keys(P.done).length;
        P = Core.merge(P, await res.json());
        refreshHeader();
        refreshScene();
        // Solo re-pintamos el mapa o la lista del módulo: una lección o quiz a medias no se toca.
        const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
        if (Object.keys(P.done).length !== before && parts.length <= 2) route();
      } catch {}
    });

    window.addEventListener('hashchange', route);
    route();
    checkAchievements(); // por si ya cumplías alguno con tu progreso anterior
  }

  start();
})();
