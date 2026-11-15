// La escena de aventura: tu héroe en pixel art contra el mob del módulo.
// Los sprites son matrices de caracteres; cada letra es un color de la paleta.
(function () {
  'use strict';

  const SPRITES = {
    hero: [
      '...hhhh.....',
      '..hhhhhh....',
      '..hhssss..w.',
      '..hsksks..w.',
      '..ssssss..w.',
      '...tttt...w.',
      '..tttttt.ggg',
      '.sttttttssg.',
      '.s.tttt.....',
      '...tbbt.....',
      '...p..p.....',
      '...p..p.....',
      '..bb..bb....',
    ],
    slime: [
      '....gggg....',
      '..gggggggg..',
      '.gglggggggg.',
      '.ggkggggkgg.',
      'gggkggggkggg',
      'gggggmmggggg',
      'gggggggggggg',
      '.dddddddddd.',
    ],
    ghost: [
      '...wwww...',
      '..wwwwww..',
      '.wwwwwwww.',
      '.wkkwwkkw.',
      '.wkkwwkkw.',
      '.wwwwwwww.',
      '.wwwmmwww.',
      '.wwwwwwww.',
      '.wwwwwwww.',
      '.w.ww.ww.w',
    ],
    mimic: [
      '.bbbbbbbbbb.',
      'bbybbbbbbybb',
      'bbkbbbbbbkbb',
      'byyyyyyyyyyb',
      'bwrwrwrwrwrb',
      'brrrrrrrrrrb',
      'brwrwrwrwrwb',
      'byyyyyyyyyyb',
      'bbbbbbbbbbbb',
    ],
    imp: [
      'r........r',
      'rr.rrrr.rr',
      '.rrrrrrrr.',
      '.rkrrrrkr.',
      '.rrrrrrrr.',
      '.rrwwwwrr.',
      '..rrrrrr..',
      '.rrrrrrrr.',
      'r.rrrrrr.r',
      '..rr..rr..',
      '..rr..rr..',
    ],
    crown: ['y.y.y.y', 'yyyyyyy', 'yryyyry'],
    star: ['...y...', '..yyy..', 'yyyyyyy', '.yyyyy.', '..yyy..', '.yy.yy.', 'yy...yy'],
  };

  const PAL = {
    h: '#5b3a1e', s: '#f2c9a0', k: '#1b1b2b', b: '#3b2a1a', p: '#2d3a5c', w: '#eef3ff', g: '#ffd166',
    y: '#ffd166', r: '#d9435f', m: '#7a1f3a', l: '#d8ffe0', d: '#3f9d5d',
  };
  // Paletas por mob (pisan las letras base).
  const MOB_PAL = {
    slime: { g: '#6fdc8c', d: '#3f9d5d', m: '#1f5c38', l: '#d8ffe0' },
    ghost: { w: '#d9d4ff', m: '#4b3f8f', k: '#2a2350' },
    mimic: { b: '#8a5a2b', y: '#ffd166', r: '#b3243f', w: '#fff6e0' },
    imp: { r: '#ff6b4a', w: '#ffe9d6', k: '#3a0d0d' },
  };
  // El héroe cambia de túnica al subir de nivel.
  const TIERS = ['#4caf6a', '#4caf6a', '#3d8bfd', '#3d8bfd', '#b46bff', '#e5484d', '#ffb224'];

  const THEMES = {
    m1: { sky: ['#6cc5f5', '#a8e0ff'], ground: '#5fb86a', dirt: '#3f8a4c', deco: 'clouds' },
    m2: { sky: ['#1a1433', '#33265c'], ground: '#4a4070', dirt: '#352c54', deco: 'stars' },
    m3: { sky: ['#22201f', '#3a332e'], ground: '#6b5a48', dirt: '#4a3d30', deco: 'bricks' },
    m4: { sky: ['#3a0f12', '#7a2318'], ground: '#5a2a22', dirt: '#3d1a15', deco: 'embers' },
  };

  const W = 320;
  const H = 110;
  const GROUND = 88;
  const HERO_X = 58;
  const MOB_X = 232;

  let ctx, hud, floats;
  let scene = { theme: 'm1', mob: null, tier: 0, cleared: false };
  const anim = { attack: null, miss: null, flash: -1e9, heroFlash: -1e9, death: null, ko: null, heal: -1e9 };
  let heroDown = false; // K.O.: el héroe se queda tirado hasta que reintentes
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function drawSprite(rows, pal, x, y, scale, opts = {}) {
    const { alpha = 1, white = false } = opts;
    ctx.globalAlpha = alpha;
    for (let r = 0; r < rows.length; r++) {
      for (let c = 0; c < rows[r].length; c++) {
        const ch = rows[r][c];
        if (ch === '.') continue;
        ctx.fillStyle = white ? '#ffffff' : pal[ch] || '#ff00ff';
        ctx.fillRect(Math.round(x + c * scale), Math.round(y + r * scale), scale, scale);
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawBackground(now) {
    const th = THEMES[scene.theme] || THEMES.m1;
    ctx.fillStyle = th.sky[0];
    ctx.fillRect(0, 0, W, 50);
    ctx.fillStyle = th.sky[1];
    ctx.fillRect(0, 50, W, GROUND - 50);

    if (th.deco === 'clouds') {
      ctx.fillStyle = '#ffffff';
      const drift = (now / 400) % (W + 60);
      for (const [bx, by] of [[40, 14], [170, 26], [280, 10]]) {
        const x = ((bx + drift) % (W + 60)) - 30;
        ctx.fillRect(Math.round(x), by, 26, 5);
        ctx.fillRect(Math.round(x) + 5, by - 4, 14, 4);
      }
    } else if (th.deco === 'stars') {
      for (let i = 0; i < 26; i++) {
        const x = (i * 53) % W;
        const y = (i * 29) % 60;
        ctx.fillStyle = Math.floor(now / 500 + i) % 4 === 0 ? '#ffffff' : '#8f86c9';
        ctx.fillRect(x, y, 1, 1);
      }
      ctx.fillStyle = '#f5f0c8';
      ctx.fillRect(262, 12, 12, 12);
      ctx.fillStyle = th.sky[0];
      ctx.fillRect(266, 10, 10, 10);
    } else if (th.deco === 'bricks') {
      ctx.fillStyle = '#2e2925';
      for (let y = 6; y < GROUND; y += 14) {
        for (let x = (y / 14) % 2 ? 0 : 14; x < W; x += 28) ctx.fillRect(x, y, 26, 1);
      }
      for (const tx of [96, 288]) {
        ctx.fillStyle = '#5a4630';
        ctx.fillRect(tx, 42, 3, 12);
        ctx.fillStyle = Math.floor(now / 160) % 2 ? '#ffb224' : '#ff7a3d';
        ctx.fillRect(tx - 1, 36, 5, 6);
      }
    } else if (th.deco === 'embers') {
      for (let i = 0; i < 16; i++) {
        const x = (i * 71 + Math.floor(now / 90)) % W;
        const y = GROUND - ((now / 40 + i * 37) % GROUND);
        ctx.fillStyle = i % 2 ? '#ffb224' : '#ff6b4a';
        ctx.fillRect(x, Math.round(y), 1, 1);
      }
      ctx.fillStyle = '#2a0b0d';
      ctx.fillRect(0, 62, W, GROUND - 62);
      ctx.fillStyle = '#4a1512';
      for (let x = 0; x < W; x += 40) ctx.fillRect(x + 8, 54, 24, 8);
    }

    ctx.fillStyle = th.ground;
    ctx.fillRect(0, GROUND, W, 4);
    ctx.fillStyle = th.dirt;
    ctx.fillRect(0, GROUND + 4, W, H - GROUND - 4);
    ctx.fillStyle = th.ground;
    for (let x = 6; x < W; x += 22) ctx.fillRect(x, GROUND + 9 + ((x / 22) % 2) * 5, 4, 1);
  }

  function drawHeroLying(pal, scale, p, now) {
    const rows = SPRITES.hero;
    const blink = p < 1 && Math.floor(now / 70) % 2;
    ctx.globalAlpha = p < 1 ? (blink ? 0.3 : 1) : 0.55;
    // Rotar 90°: cada (r, c) pasa a (x = r, y = ancho - c). Queda con la cabeza a la izquierda.
    const w = rows[0].length;
    const baseY = GROUND - w * scale * 0.42;
    const sink = p * 3;
    for (let r = 0; r < rows.length; r++) {
      for (let c = 0; c < w; c++) {
        const ch = rows[r][c];
        if (ch === '.') continue;
        ctx.fillStyle = pal[ch];
        const x = HERO_X - 6 + r * scale;
        const y = baseY + sink + (c - w / 2) * scale * 0.42;
        ctx.fillRect(Math.round(x), Math.round(y), scale, Math.max(1, Math.round(scale * 0.42)));
      }
    }
    ctx.globalAlpha = 1;
    if (p >= 1) {
      // Estrellitas de mareo.
      for (let k = 0; k < 3; k++) {
        const a = now / 300 + (k * Math.PI * 2) / 3;
        ctx.fillStyle = '#ffd166';
        ctx.fillRect(Math.round(HERO_X + 4 + Math.cos(a) * 10), Math.round(GROUND - 26 + Math.sin(a) * 3), 2, 2);
      }
    }
  }

  const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
  // 0 → 1 → 0 a lo largo de una animación de embestida.
  const lunge = (p) => (p < 0.4 ? ease(p / 0.4) : p < 0.6 ? 1 : 1 - ease((p - 0.6) / 0.4));

  function frame(now) {
    drawBackground(now);
    const bob = reduced ? 0 : Math.floor(now / 420) % 2;

    // ── Héroe ──
    let heroDx = 0;
    if (anim.attack) {
      const p = Math.min((now - anim.attack.start) / 520, 1);
      heroDx = lunge(p) * 128;
      if (p >= 0.4 && !anim.attack.hit) {
        anim.attack.hit = true;
        anim.flash = now;
        if (anim.attack.label) float(anim.attack.label, anim.attack.kind, MOB_X + (anim.attack.kind === 'dmg' ? 14 : -20), 30);
        if (anim.attack.onHit) anim.attack.onHit();
      }
      if (p >= 1) anim.attack = null;
    }
    const heroPal = { ...PAL, t: TIERS[Math.min(scene.tier, TIERS.length - 1)] };
    const heroScale = 3;
    const heroY = GROUND - SPRITES.hero.length * heroScale - bob;
    const victory = scene.cleared && !heroDown && !reduced ? Math.abs(Math.sin(now / 260)) * 5 : 0;
    if ((anim.ko && now >= anim.ko.start) || heroDown) {
      // Cae: parpadea, se hunde y queda acostado y transparente.
      const p = anim.ko ? Math.min((now - anim.ko.start) / 800, 1) : 1;
      if (anim.ko && p >= 1) {
        const done = anim.ko.then;
        anim.ko = null;
        heroDown = true;
        if (done) done();
      }
      drawHeroLying(heroPal, heroScale, p, now);
    } else {
      drawSprite(SPRITES.hero, heroPal, HERO_X + heroDx, heroY - victory, heroScale, {
        white: now - anim.heroFlash < 180,
      });
    }
    // Brillitos verdes al tomar poción.
    const hp = (now - anim.heal) / 700;
    if (hp >= 0 && hp < 1) {
      ctx.fillStyle = '#7dffa1';
      for (let k = 0; k < 8; k++) {
        const x = HERO_X - 4 + ((k * 7) % 40);
        const y = GROUND - 8 - hp * 40 - ((k * 13) % 18);
        if (Math.floor(now / 80 + k) % 2) ctx.fillRect(Math.round(x), Math.round(y), 2, 2);
      }
    }
    // Tajo de la espada al golpear.
    if (now - anim.flash < 140) {
      ctx.fillStyle = '#ffffff';
      for (let k = 0; k < 6; k++) ctx.fillRect(MOB_X - 10 + k * 3, 52 + k * 4, 5, 2);
    }

    // ── Mob ──
    const mob = scene.mob;
    if (mob) {
      const rows = SPRITES[mob.sprite] || SPRITES.slime;
      const scale = mob.boss ? 5 : 3;
      const mw = rows[0].length * scale;
      let mx = MOB_X - (mob.boss ? mw / 3 : 0);
      let alpha = 1;
      let sink = 0;
      if (anim.miss) {
        const p = Math.min((now - anim.miss.start) / 520, 1);
        mx -= lunge(p) * 120;
        if (p >= 0.4 && !anim.miss.hit) {
          anim.miss.hit = true;
          anim.heroFlash = now;
          float(anim.miss.label || '¡Bloqueado!', 'miss', HERO_X + 10, 28);
        }
        if (p >= 1) anim.miss = null;
      }
      if (anim.death) {
        const p = Math.min((now - anim.death.start) / 700, 1);
        alpha = Math.floor(p * 10) % 2 ? 0.25 : 1 - p * 0.6;
        sink = p * 10;
        if (p >= 1) {
          const done = anim.death.then;
          anim.death = null;
          if (done) done();
        }
      }
      const shake = now - anim.flash < 220 && !reduced ? (Math.floor(now / 30) % 2 ? 2 : -2) : 0;
      const floaty = mob.sprite === 'ghost' && !reduced ? Math.round(Math.sin(now / 380) * 3) - 6 : 0;
      const mobBob = reduced ? 0 : Math.floor(now / 520) % 2;
      const my = GROUND - rows.length * scale + mobBob + sink + floaty;
      const pal = { ...PAL, ...(MOB_PAL[mob.sprite] || {}) };
      drawSprite(rows, pal, mx + shake, my, scale, { alpha, white: now - anim.flash < 110 });
      if (mob.boss) {
        const cs = 3;
        const cx = mx + shake + (mw - SPRITES.crown[0].length * cs) / 2;
        drawSprite(SPRITES.crown, PAL, cx, my - SPRITES.crown.length * cs - 1, cs, { alpha });
      }
    } else if (scene.cleared) {
      const sy = 44 + (reduced ? 0 : Math.round(Math.sin(now / 300) * 3));
      drawSprite(SPRITES.star, PAL, MOB_X + 6, sy, 4);
    }

    requestAnimationFrame(frame);
  }

  function float(text, kind, x, y) {
    if (!floats) return;
    const el = document.createElement('span');
    el.className = `float ${kind}`;
    el.textContent = text;
    el.style.left = `${(x / W) * 100}%`;
    el.style.top = `${(y / H) * 100}%`;
    floats.appendChild(el);
    setTimeout(() => el.remove(), 1300);
  }

  function renderHud() {
    if (!hud) return;
    const mob = scene.mob;
    if (!mob) {
      hud.innerHTML = scene.cleared ? '<div class="hud-name">⭐ Zona despejada</div>' : '';
      return;
    }
    const pct = mob.max ? Math.max(0, Math.round((mob.hp / mob.max) * 100)) : 0;
    hud.innerHTML = `<div class="hud-name">${mob.boss ? '👑 ' : ''}${Viz.esc(mob.name)}</div>
      <div class="hud-bar ${mob.boss ? 'boss' : ''}"><i style="width:${pct}%"></i></div>
      <div class="hud-hp">HP ${mob.hp} / ${mob.max}</div>`;
  }

  const Game = {
    init(canvas, hudEl, floatsEl) {
      ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      hud = hudEl;
      floats = floatsEl;
      requestAnimationFrame(frame);
    },
    /** Cambia la escena. Si `death` es true, el mob anterior muere antes del cambio. */
    setScene(next, { death = false } = {}) {
      const apply = () => {
        scene = next;
        renderHud();
      };
      if (death && scene.mob && !reduced) anim.death = { start: performance.now(), then: apply };
      else apply();
    },
    /** Ataque del héroe. kind: 'dmg' (daño real), 'hit' (acierto) o 'combo'. */
    attack(label, onHit, { kind = 'dmg' } = {}) {
      if (reduced || !scene.mob || heroDown) {
        if (label) float(label, kind, MOB_X + (kind === 'dmg' ? 14 : -20), 30);
        if (onHit) onHit();
        return;
      }
      // Si ya va un ataque en curso, el nuevo lo reemplaza pero respeta su callback pendiente.
      if (anim.attack && !anim.attack.hit && anim.attack.onHit) anim.attack.onHit();
      anim.attack = { start: performance.now(), label, onHit, kind, hit: false };
    },
    miss(label) {
      if (reduced || !scene.mob) return float(label || '¡Bloqueado!', 'miss', HERO_X + 10, 28);
      anim.miss = { start: performance.now(), label, hit: false };
    },
    say(label, kind = 'combo') {
      float(label, kind, MOB_X - 24, 16);
    },
    xp(label) {
      float(label, 'xp', HERO_X + 10, 20);
    },
    /** El héroe cae. Llama a `then` cuando termina la animación. */
    knockout(then) {
      float('K.O.', 'miss', HERO_X + 6, 22);
      if (reduced) {
        heroDown = true;
        if (then) then();
        return;
      }
      anim.ko = { start: performance.now() + 450, then }; // espera a que termine el golpe del mob
    },
    revive() {
      anim.ko = null;
      heroDown = false;
    },
    heal(label) {
      anim.heal = performance.now();
      float(label, 'heal', HERO_X + 10, 24);
    },
    /** Dibuja un sprite completo en un canvas chiquito (íconos de la barra lateral). */
    drawIcon(canvas, name) {
      const rows = SPRITES[name] || SPRITES.slime;
      const size = Math.max(rows.length, rows[0].length);
      canvas.width = size;
      canvas.height = size;
      const c = canvas.getContext('2d');
      const pal = { ...PAL, ...(MOB_PAL[name] || {}) };
      const ox = Math.floor((size - rows[0].length) / 2);
      const oy = size - rows.length;
      rows.forEach((row, r) =>
        [...row].forEach((ch, x) => {
          if (ch === '.') return;
          c.fillStyle = pal[ch] || '#ff00ff';
          c.fillRect(ox + x, oy + r, 1, 1);
        })
      );
    },
    /** Retrato del héroe (cabeza y hombros) para el perfil. */
    drawAvatar(canvas, tier) {
      const c = canvas.getContext('2d');
      const pal = { ...PAL, t: TIERS[Math.min(tier, TIERS.length - 1)] };
      c.fillStyle = '#1d2540';
      c.fillRect(0, 0, 9, 9);
      for (let r = 0; r < 8; r++) {
        for (let x = 0; x < 9; x++) {
          const ch = SPRITES.hero[r][x + 1];
          if (ch === '.' || ch === 'w' || ch === 'g') continue;
          c.fillStyle = pal[ch];
          c.fillRect(x, r + 1, 1, 1);
        }
      }
    },
    SPRITES,
  };

  window.Game = Game;
})();
