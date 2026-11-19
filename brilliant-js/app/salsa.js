// Salsa, la galga, para la web: el mismo dibujo y las mismas animaciones que en la app (lib/ui/salsa_painter.dart
// y salsa_face.dart), con Canvas 2D. Atigrada, pecho hondo, cintura metida, orejas de rosa y hocico largo.
(function () {
  'use strict';

  const C = {
    fawn: '#C58A4F',
    fawnLight: '#DDAA72',
    fawnDark: '#94612F',
    brindle: '74,44,20', // rgb, para variar la transparencia
    cream: '241,220,192',
    skin: '217,169,154',
    ink: '#231A1A',
    pink: '234,163,162',
  };
  const skullColors = ['30,20,12', '58,34,16', '107,63,29'];
  const rgba = (rgb, a) => `rgba(${rgb},${a})`;

  // Números al azar con semilla: las rayas salen iguales en cada cuadro y no "bailan".
  function rng(seed) {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function stroke(ctx, color, width) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }

  /** Dibuja en una capa aparte con la misma transformación (como saveLayer) y la pega encima. */
  function layer(ctx, draw) {
    const c = ctx.canvas;
    const off = layer.off || (layer.off = document.createElement('canvas'));
    if (off.width !== c.width || off.height !== c.height) {
      off.width = c.width;
      off.height = c.height;
    }
    const o = off.getContext('2d');
    o.setTransform(1, 0, 0, 1, 0, 0);
    o.clearRect(0, 0, off.width, off.height);
    o.setTransform(ctx.getTransform());
    o.globalCompositeOperation = 'source-over';
    draw(o);
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(off, 0, 0);
    ctx.restore();
  }

  // ═══════════════════════ De lado (caja 126 × 108) ═══════════════════════
  const VW = 126;
  const VH = 108;
  const GROUND = 101;

  function trunk() {
    const p = new Path2D();
    p.moveTo(26, 49);
    p.bezierCurveTo(32, 45, 40, 43, 48, 44);
    p.bezierCurveTo(58, 45, 68, 44, 76, 41);
    p.bezierCurveTo(80, 34, 85, 25, 90, 18);
    p.lineTo(99, 23);
    p.bezierCurveTo(94, 31, 91, 39, 90, 47);
    p.bezierCurveTo(89, 55, 89, 63, 85, 68);
    p.bezierCurveTo(81, 72, 72, 72, 66, 68);
    p.bezierCurveTo(61, 64, 56, 59, 51, 59);
    p.bezierCurveTo(46, 59, 43, 63, 40, 67);
    p.bezierCurveTo(35, 71, 27, 70, 23, 63);
    p.bezierCurveTo(21, 58, 22, 52, 26, 49);
    p.closePath();
    return p;
  }
  const TRUNK = trunk();
  const SNOUT = (() => {
    const p = new Path2D();
    p.moveTo(3, -6);
    p.bezierCurveTo(11, -5.2, 21, -1.8, 26.5, 1.8);
    p.bezierCurveTo(28, 3, 27.5, 5.4, 25.3, 5.9);
    p.bezierCurveTo(18, 7.4, 9, 8.2, 1.5, 7.6);
    p.closePath();
    return p;
  })();

  const lerp = (a, b, t) => a + (b - a) * t;

  function brindle(o, seed, strength) {
    const r = rng(seed);
    const slant = 0.16;
    o.globalCompositeOperation = 'source-atop';
    for (let x = 8; x < VW + 4; x += 2.3 + r() * 1.7) {
      let y = -4 + r() * 6;
      while (y < VH) {
        const len = 4 + r() * 11;
        const w = 0.6 + r() * 0.9;
        const fade = x > 104 && y < 26 ? 0.5 : 1;
        const a = (0.16 + r() * 0.2) * strength * fade;
        const x0 = x + slant * y;
        const wave = -0.8 + r() * 1.6;
        o.beginPath();
        o.moveTo(x0, y);
        o.quadraticCurveTo(x0 + (slant * len) / 2 + wave, y + len / 2, x0 + slant * len, y + len);
        stroke(o, rgba(C.brindle, a), w);
        o.stroke();
        y += len + 1.5 + r() * 5;
      }
    }
    o.globalCompositeOperation = 'source-over';
  }

  function foot(o, x, y, color, width, back) {
    const dir = back ? -1 : 1;
    o.fillStyle = color;
    o.beginPath();
    o.roundRect(back ? x - 6 : x - width / 2, y - width / 2, width / 2 + 6, width * 0.95, width / 2);
    o.fill();
  }

  function hindLeg(o, hip, color, width, tuck, dx = 0) {
    const hock = { x: lerp(hip.x - 8 + dx, hip.x - 17 + dx, tuck), y: lerp(hip.y + 23, hip.y + 13, tuck) };
    const paw = { x: lerp(hip.x - 2 + dx, hip.x - 27 + dx, tuck), y: lerp(GROUND - 1.4, hip.y + 22, tuck) };
    o.beginPath();
    o.moveTo(hip.x + dx, hip.y);
    o.quadraticCurveTo(hip.x - 2 + dx, hip.y + 12, hock.x, hock.y);
    o.lineTo(paw.x, paw.y);
    stroke(o, color, width);
    o.stroke();
    foot(o, paw.x, paw.y, color, width, tuck > 0.5);
  }

  function frontLeg(o, sh, color, width, tuck, dx = 0) {
    const elbow = { x: lerp(sh.x + 1 + dx, sh.x + 12 + dx, tuck), y: lerp(sh.y + 16, sh.y + 9, tuck) };
    const paw = { x: lerp(sh.x + 2 + dx, sh.x + 26 + dx, tuck), y: lerp(GROUND - 1.4, sh.y + 11, tuck) };
    o.beginPath();
    o.moveTo(sh.x + dx, sh.y);
    o.lineTo(elbow.x, elbow.y);
    o.lineTo(paw.x, paw.y);
    stroke(o, color, width);
    o.stroke();
    foot(o, paw.x, paw.y, color, width, false);
  }

  function headTransform(o, p) {
    o.translate(86, 44);
    o.rotate(p.headTilt * 0.4);
    o.translate(-86, -44);
    o.translate(94, 16);
    o.rotate(p.headTilt);
  }

  function headDetails(ctx, p) {
    // oreja de rosa
    ctx.save();
    ctx.translate(-3.5, -5);
    ctx.rotate(-0.15 - 0.75 * p.ear);
    ctx.fillStyle = rgba(C.brindle, 1);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-5.5, -5.5, -12, -4.6, -13, 0);
    ctx.bezierCurveTo(-10, 2, -5.5, 3.6, -1, 4.5);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = rgba(C.pink, 0.4 + 0.5 * p.ear);
    ctx.beginPath();
    ctx.moveTo(-2, 1);
    ctx.bezierCurveTo(-5.5, -2.6, -9, -2.6, -10, 0);
    ctx.bezierCurveTo(-7.5, 1.4, -4.6, 2.3, -2, 2.8);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    // barbilla clara y raya del hocico
    ctx.fillStyle = rgba(C.cream, 1);
    ctx.beginPath();
    ctx.moveTo(2.5, 5);
    ctx.bezierCurveTo(10, 7.2, 18, 7.1, 25, 5.9);
    ctx.bezierCurveTo(18, 9.2, 8.5, 9.6, 1.5, 8);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(8, -4.4);
    ctx.quadraticCurveTo(16, -2.4, 23, 1);
    stroke(ctx, C.fawnLight, 1.1);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(1.2, -5);
    ctx.quadraticCurveTo(4, -6.4, 6.8, -4.6);
    stroke(ctx, rgba(C.cream, 1), 1.4);
    ctx.stroke();
    // nariz
    ctx.fillStyle = C.ink;
    ctx.beginPath();
    ctx.ellipse(26.2, 2.7, 2.3, 1.9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.beginPath();
    ctx.arc(25.6, 1.8, 0.7, 0, Math.PI * 2);
    ctx.fill();
    // boca y lengua
    const m = p.mouthOpen;
    if (m > 0.05) {
      ctx.fillStyle = '#5A2328';
      ctx.beginPath();
      ctx.moveTo(12.5, 5.9);
      ctx.quadraticCurveTo(18, 5.9 + 4 * m, 23.5, 6.2);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#F07F8E';
      ctx.beginPath();
      ctx.moveTo(14.8, 6.6);
      ctx.bezierCurveTo(14.2, 9 + 4 * m, 15.2, 11.2 + 5 * m, 17.5 + 0.4 * m, 11.4 + 5 * m);
      ctx.bezierCurveTo(20, 11.2 + 5 * m, 20.8, 9 + 4 * m, 20, 6.6);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(17.4, 7.4);
      ctx.lineTo(17.6, 8.8 + 4.2 * m);
      stroke(ctx, '#C95668', 0.75);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(13, 5.9);
      ctx.quadraticCurveTo(17.5, 7.6, 22, 6.2);
      stroke(ctx, 'rgba(35,26,26,0.75)', 0.95);
      ctx.stroke();
    }
    // ojo
    ctx.fillStyle = C.ink;
    ctx.beginPath();
    ctx.ellipse(4, -1.8, 2.6, (6.2 * p.blink + 0.4) / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    if (p.blink > 0.5) {
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(5.1, -3.1, 1.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.beginPath();
      ctx.arc(3.2, -0.3, 0.55, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function paintSide(ctx, w, h, p, flip, shadow = true) {
    ctx.save();
    const s = Math.min(w / VW, h / VH);
    ctx.translate((w - VW * s) / 2, h - VH * s);
    ctx.scale(s, s);
    if (flip) {
      ctx.translate(VW, 0);
      ctx.scale(-1, 1);
    }
    const t = p.tuck;
    if (shadow) {
      ctx.fillStyle = 'rgba(0,0,0,0.13)';
      ctx.beginPath();
      ctx.ellipse(57, GROUND + 2.5, (74 - 22 * t) / 2, (6 - 2 * t) / 2, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.translate(0, -p.breath * 0.6);

    layer(ctx, (o) => {
      hindLeg(o, { x: 38, y: 61 }, C.fawnDark, 4.4, t, 5);
      frontLeg(o, { x: 77, y: 63 }, C.fawnDark, 4.2, t, -5);
      brindle(o, 11, 0.8);
    });

    layer(ctx, (o) => {
      o.save();
      o.translate(24.5, 52);
      o.rotate(0.35 * p.tail - 0.15 * t);
      o.beginPath();
      o.moveTo(0, 0);
      o.bezierCurveTo(-8, 5, -12, 16, -11, 30);
      o.bezierCurveTo(-10.5, 34, -7.5, 35, -6.5, 32);
      stroke(o, C.fawn, 3.2);
      o.stroke();
      o.restore();

      o.fillStyle = C.fawn;
      o.fill(TRUNK);
      o.save();
      o.clip(TRUNK);
      o.fillStyle = rgba(C.skin, 0.35);
      o.beginPath();
      o.ellipse(74, 70, 17, 7, 0, 0, Math.PI * 2);
      o.fill();
      o.fillStyle = 'rgba(148,97,47,0.3)';
      o.beginPath();
      o.ellipse(54, 40, 32, 5, 0, 0, Math.PI * 2);
      o.fill();
      const g = o.createLinearGradient(97, 24, 90, 54);
      g.addColorStop(0, rgba(C.cream, 0.85));
      g.addColorStop(1, rgba(C.cream, 0));
      o.beginPath();
      o.moveTo(97, 24);
      o.bezierCurveTo(93, 31, 91, 40, 90.5, 52);
      stroke(o, g, 4.5);
      o.stroke();
      o.restore();
      o.fillStyle = 'rgba(221,170,114,0.28)';
      o.beginPath();
      o.ellipse(33, 58, 9.5, 9, 0, 0, Math.PI * 2);
      o.fill();

      hindLeg(o, { x: 35, y: 63 }, C.fawn, 5, t);
      frontLeg(o, { x: 82, y: 65 }, C.fawn, 4.8, t);

      o.save();
      headTransform(o, p);
      o.fillStyle = C.fawn;
      o.fill(SNOUT);
      o.beginPath();
      o.ellipse(0, 0, 8.75, 8, 0, 0, Math.PI * 2);
      o.fill();
      o.restore();

      brindle(o, 7, 1);
      // cráneo más marcado: rayas gruesas negras y cafés
      o.save();
      headTransform(o, p);
      const r = rng(41);
      o.globalCompositeOperation = 'source-atop';
      for (let x = -8; x < 9; x += 1.8 + r() * 1.6) {
        const y0 = -8 + r() * 3;
        const len = 4 + r() * 6;
        o.beginPath();
        o.moveTo(x, y0);
        o.lineTo(x + 0.8, y0 + len);
        stroke(o, rgba(skullColors[Math.floor(r() * 3)], 0.3 + r() * 0.3), 0.9 + r() * 0.9);
        o.stroke();
      }
      o.restore();
    });

    ctx.save();
    headTransform(ctx, p);
    headDetails(ctx, p);
    ctx.restore();
    ctx.restore();
  }

  // ═══════════════════════ De frente (caja 100 × 112) ═══════════════════════
  const FW = 100;
  const FH = 112;
  const HEAD = (() => {
    const p = new Path2D();
    p.moveTo(50, 14);
    p.bezierCurveTo(62, 14, 72, 20, 73, 32);
    p.bezierCurveTo(74, 42, 70, 52, 64, 62);
    p.bezierCurveTo(60, 70, 58, 80, 57.5, 86);
    p.bezierCurveTo(56, 93, 44, 93, 42.5, 86);
    p.bezierCurveTo(42, 80, 40, 70, 36, 62);
    p.bezierCurveTo(30, 52, 26, 42, 27, 32);
    p.bezierCurveTo(28, 20, 38, 14, 50, 14);
    p.closePath();
    return p;
  })();
  const NECK = (() => {
    const p = new Path2D();
    p.moveTo(41, 58);
    p.lineTo(59, 58);
    p.bezierCurveTo(62, 80, 65, 98, 70, 112);
    p.lineTo(30, 112);
    p.bezierCurveTo(35, 98, 38, 80, 41, 58);
    p.closePath();
    return p;
  })();

  function frontEar(ctx, left, ear) {
    ctx.save();
    if (!left) {
      ctx.translate(100, 0);
      ctx.scale(-1, 1);
    }
    ctx.translate(31, 27);
    ctx.rotate(-0.55 * ear);
    ctx.fillStyle = rgba(C.brindle, 1);
    ctx.beginPath();
    ctx.moveTo(1, -3);
    ctx.bezierCurveTo(-6, -12, -18, -13, -25, -5);
    ctx.bezierCurveTo(-21, -1, -12, 3, -1, 6);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = rgba(C.pink, 0.5 + 0.4 * ear);
    ctx.beginPath();
    ctx.moveTo(-1, -2);
    ctx.bezierCurveTo(-7, -9, -15, -9, -20, -4.5);
    ctx.bezierCurveTo(-16, -2, -9, 1, -2, 3);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function paintFront(ctx, w, h, f) {
    ctx.save();
    const s = Math.min(w / FW, h / FH);
    ctx.translate((w - FW * s) / 2, (h - FH * s) / 2);
    ctx.scale(s, s);
    ctx.translate(50, 100);
    ctx.rotate(f.tilt);
    ctx.translate(-50, -100);
    frontEar(ctx, true, f.ear);
    frontEar(ctx, false, f.ear);
    layer(ctx, (o) => {
      o.fillStyle = C.fawnDark;
      o.fill(NECK);
      o.fillStyle = C.fawn;
      o.fill(HEAD);
      o.globalCompositeOperation = 'source-atop';
      const r = rng(21);
      for (let y = 12; y < FH; y += 2.3 + r() * 1.9) {
        let x = 18 + r() * 5;
        while (x < 84) {
          const len = 3.5 + r() * 8;
          const x1 = x + len;
          const curve = (xx) => 0.0035 * (xx - 50) * (xx - 50) * (y < 70 ? 1 : 0.4);
          const tilt = -0.6 + r() * 1.2;
          o.beginPath();
          o.moveTo(x, y + curve(x));
          o.quadraticCurveTo((x + x1) / 2, y + curve((x + x1) / 2) - 0.6 + tilt, x1, y + curve(x1) + tilt);
          stroke(o, rgba(C.brindle, 0.14 + r() * 0.2), 0.6 + r() * 0.8);
          o.stroke();
          x = x1 + 1.5 + r() * 4;
        }
      }
      const sk = rng(33);
      for (let y = 15; y < 42; y += 2.6 + sk() * 2.2) {
        let x = 26 + sk() * 6;
        while (x < 74) {
          const len = 4 + sk() * 9;
          const x1 = x + len;
          const curve = (xx) => 0.006 * (xx - 50) * (xx - 50);
          const tilt = -0.8 + sk() * 1.6;
          const center = (x + x1) / 2;
          const nearBlaze = Math.abs(center - 50) < 4 && y > 24;
          o.beginPath();
          o.moveTo(x, y + curve(x));
          o.quadraticCurveTo(center, y + curve(center) - 0.8 + tilt, x1, y + curve(x1) + tilt);
          stroke(o, rgba(skullColors[Math.floor(sk() * 3)], (nearBlaze ? 0.15 : 0.32) + sk() * 0.28), 1.2 + sk() * 1.3);
          o.stroke();
          x = x1 + 1.2 + sk() * 3.5;
        }
      }
      o.fillStyle = 'rgba(148,97,47,0.35)';
      for (const cx of [30, 70]) {
        o.beginPath();
        o.ellipse(cx, 40, 6, 13, 0, 0, Math.PI * 2);
        o.fill();
      }
      o.globalCompositeOperation = 'source-over';
    });
    // raya clara del hocico
    const g = ctx.createLinearGradient(50, 24, 50, 80);
    g.addColorStop(0, rgba(C.cream, 0));
    g.addColorStop(1, rgba(C.cream, 0.95));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(50, 24);
    ctx.bezierCurveTo(53, 34, 55, 52, 56, 66);
    ctx.bezierCurveTo(57, 74, 57.5, 82, 56, 88);
    ctx.bezierCurveTo(54, 92, 46, 92, 44, 88);
    ctx.bezierCurveTo(42.5, 82, 43, 74, 44, 66);
    ctx.bezierCurveTo(45, 52, 47, 34, 50, 24);
    ctx.closePath();
    ctx.fill();
    // ojos
    for (const x of [39, 61]) {
      ctx.fillStyle = C.ink;
      ctx.beginPath();
      ctx.ellipse(x, 46, 4.25, (10 * f.blink + 0.6) / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(x + 1.6, 43.5, 1.9, 0, Math.PI * 2);
      ctx.fill();
    }
    // nariz
    ctx.fillStyle = C.ink;
    ctx.beginPath();
    ctx.moveTo(44.5, 80);
    ctx.bezierCurveTo(44.5, 76.5, 55.5, 76.5, 55.5, 80);
    ctx.bezierCurveTo(55.5, 84, 52.5, 86, 50, 86);
    ctx.bezierCurveTo(47.5, 86, 44.5, 84, 44.5, 80);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.beginPath();
    ctx.ellipse(48, 79, 1.7, 0.9, 0, 0, Math.PI * 2);
    ctx.fill();
    // sonrisa y lengüita
    ctx.beginPath();
    ctx.moveTo(45.5, 89.5);
    ctx.quadraticCurveTo(50, 92.5, 55.5, 88.6);
    stroke(ctx, 'rgba(35,26,26,0.8)', 1.2);
    ctx.stroke();
    if (f.tongue > 0.02) {
      const t = f.tongue;
      ctx.fillStyle = '#F07F8E';
      ctx.beginPath();
      ctx.moveTo(49, 90.6);
      ctx.bezierCurveTo(48.4, 93 + 3 * t, 49.6, 95 + 4 * t, 51.6, 95 + 4 * t);
      ctx.bezierCurveTo(53.6, 95 + 4 * t, 54.6, 93 + 3 * t, 54, 90.2);
      ctx.closePath();
      ctx.fill();
    }
    // lentes
    if (f.glasses > 0) {
      ctx.save();
      ctx.translate(0, -48 * (1 - Math.min(1, f.glasses)));
      stroke(ctx, '#111118', 2.2);
      ctx.beginPath();
      ctx.moveTo(28.4, 43);
      ctx.lineTo(23, 38);
      ctx.moveTo(71.6, 43);
      ctx.lineTo(77, 38);
      ctx.stroke();
      const lens = new Path2D();
      lens.roundRect(28, 39.75, 21, 13.5, 5);
      lens.roundRect(51, 39.75, 21, 13.5, 5);
      const lg = ctx.createLinearGradient(0, 40, 0, 54);
      lg.addColorStop(0, '#2B2E45');
      lg.addColorStop(1, '#0E0F18');
      ctx.fillStyle = lg;
      ctx.fill(lens);
      stroke(ctx, '#07070C', 1.6);
      ctx.stroke(lens);
      ctx.beginPath();
      ctx.moveTo(48.6, 44.5);
      ctx.lineTo(51.4, 44.5);
      stroke(ctx, '#07070C', 2.4);
      ctx.stroke();
      stroke(ctx, 'rgba(255,255,255,0.35)', 1.2);
      ctx.beginPath();
      ctx.moveTo(33, 42.5);
      ctx.lineTo(38, 42.5);
      ctx.moveTo(56, 42.5);
      ctx.lineTo(61, 42.5);
      ctx.stroke();
      if (f.glint >= 0 && f.glint <= 1) {
        ctx.save();
        ctx.clip(lens);
        const x = 22 + 60 * f.glint;
        ctx.fillStyle = 'rgba(255,255,255,0.75)';
        ctx.beginPath();
        ctx.moveTo(x, 36);
        ctx.lineTo(x + 6, 36);
        ctx.lineTo(x - 2, 58);
        ctx.lineTo(x - 8, 58);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
      ctx.restore();
    }
    ctx.restore();
  }

  // ═══════════════════════ Animación ═══════════════════════
  const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const bump = (x) => (x <= 0 || x >= 1 ? 0 : Math.sin(Math.PI * x));
  const seg = (t, a, b) => Math.max(0, Math.min(1, (t - a) / (b - a)));

  function setup(canvas, w, h) {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    const ctx = canvas.getContext('2d');
    return { ctx, dpr };
  }

  /** Salsa de lado, viva. Regresa { el, set({ mood, flip }), destroy() }. mood: 'idle' | 'jump' | 'cheer'. */
  function mount(width, { mood = 'idle', flip = false } = {}) {
    const height = (width * VH) / VW;
    const el = document.createElement('canvas');
    el.className = 'salsa';
    el.setAttribute('aria-hidden', 'true');
    const { ctx, dpr } = setup(el, width, height + 20);
    const seed = Math.random() * 10;
    const state = { mood, flip, cheerStart: 0 };
    const t0 = performance.now();
    let raf = 0;
    function pose(t) {
      if (reduce()) return [{ breath: 0, blink: 1, tail: 0, ear: 0.2, tuck: 0, headTilt: 0, mouthOpen: 0 }, 0];
      const tt = t + seed;
      const breath = Math.sin((tt * 2 * Math.PI) / 2.6);
      const bp = tt % 4.3;
      const blink = bp > 4.12 ? 1 - bump((bp - 4.12) / 0.18) : 1;
      const ep = tt % 6.7;
      const ear = ep > 6.2 ? 0.35 * bump((ep - 6.2) / 0.5) : 0;
      if (state.mood === 'jump') return [{ breath: 0, blink: 1, tail: -0.6, ear: 0.7, tuck: 1, headTilt: -0.08, mouthOpen: 0 }, 0];
      if (state.mood === 'cheer') {
        const c = t - state.cheerStart;
        const up = c < 2.7 ? bump((c % 0.9) / 0.9) : 0;
        return [{ breath: breath * 0.5, blink, tail: Math.sin((t * 2 * Math.PI) / 0.32), ear: 0.6 + 0.4 * up, tuck: 0.8 * up, headTilt: -0.12 * up, mouthOpen: 1 }, -18 * up];
      }
      return [{ breath, blink, tail: 0.55 * Math.sin((tt * 2 * Math.PI) / 1.5), ear, tuck: 0, headTilt: 0.04 * Math.sin((tt * 2 * Math.PI) / 5.2), mouthOpen: 0 }, 0];
    }
    function frame(now) {
      const t = (now - t0) / 1000;
      const [p, lift] = pose(t);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, el.width, el.height);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.translate(0, 20 + (lift * width) / 120);
      paintSide(ctx, width, height, p, state.flip, lift === 0);
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    return {
      el,
      set(next) {
        if (next.mood === 'cheer' && state.mood !== 'cheer') state.cheerStart = (performance.now() - t0) / 1000;
        Object.assign(state, next);
      },
      destroy() {
        cancelAnimationFrame(raf);
      },
    };
  }

  /** El festejo de frente: aparece, se pone los lentes, le brillan, levanta las orejas y cae confeti. */
  function celebrate(width, { onClick } = {}) {
    const height = (width * FH) / FW;
    const el = document.createElement('canvas');
    el.className = 'salsa-face';
    el.setAttribute('aria-hidden', 'true');
    const boxW = width * 1.5;
    const { ctx, dpr } = setup(el, boxW, height);
    const t0 = performance.now();
    let clicked = false;
    let raf = 0;
    const colors = ['#FF8A3D', '#F2C14E', '#57CF95', '#8EA2FF', '#FF7F8A', '#FFFFFF'];
    function frame(now) {
      const t = (now - t0) / 1000;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, el.width, el.height);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (reduce()) {
        ctx.translate((boxW - width) / 2, 0);
        paintFront(ctx, width, height, { glasses: 1, glint: -1, ear: 0, blink: 1, tilt: 0, tongue: 0 });
        return;
      }
      if (!clicked && t > 1.05) {
        clicked = true;
        if (onClick) onClick();
      }
      // confeti
      const ct = t - 1.05;
      if (ct > 0 && ct < 3.2) {
        const r = rng(5);
        for (let i = 0; i < 26; i++) {
          const ang = -Math.PI / 2 + (r() - 0.5) * Math.PI * 1.5;
          const speed = 120 + r() * 160;
          const k = boxW / 300;
          const x = boxW / 2 + Math.cos(ang) * speed * ct * k;
          const y = height * 0.42 + Math.sin(ang) * speed * ct * k + 140 * ct * ct;
          ctx.save();
          ctx.globalAlpha = Math.max(0, 1 - ct / 3.2);
          ctx.translate(x, y);
          ctx.rotate(ct * (4 + r() * 6) * (i % 2 ? -1 : 1));
          ctx.fillStyle = colors[i % colors.length];
          if (i % 3 === 0) {
            ctx.beginPath();
            ctx.arc(0, 0, 3, 0, Math.PI * 2);
            ctx.fill();
          } else ctx.fillRect(-4, -2, 8, 4);
          ctx.restore();
        }
      }
      const pop = (() => {
        const x = seg(t, 0, 0.7);
        return x === 0 ? 0 : x === 1 ? 1 : Math.pow(2, -10 * x) * Math.sin(((x * 10 - 0.75) * 2 * Math.PI) / 3) + 1; // elástico
      })();
      const bounce = (x) => {
        const n = 7.5625, d = 2.75;
        if (x < 1 / d) return n * x * x;
        if (x < 2 / d) return n * (x -= 1.5 / d) * x + 0.75;
        if (x < 2.5 / d) return n * (x -= 2.25 / d) * x + 0.9375;
        return n * (x -= 2.625 / d) * x + 0.984375;
      };
      const glasses = bounce(seg(t, 0.45, 1.1));
      const glint = t > 1.25 && t < 1.75 ? seg(t, 1.25, 1.75) : -1;
      const ear = t > 1.05 ? Math.max(0, Math.min(1, 0.6 + 0.4 * Math.sin((t - 1.05) * 9) * Math.exp(-(t - 1.05) * 1.6))) : 0;
      const bob = Math.sin((t * 2 * Math.PI) / 2.4);
      const tilt = t > 1.05 ? -0.09 * Math.exp(-(t - 1.05) * 0.8) + 0.02 * bob : 0;
      const tongue = t > 1.9 ? 1 - Math.pow(1 - seg(t, 1.9, 2.3), 3) : 0;
      ctx.save();
      ctx.translate(boxW / 2, height / 2 + bob * 1.2);
      const sc = 0.3 + 0.7 * pop;
      ctx.scale(sc, sc);
      ctx.translate(-width / 2, -height / 2);
      paintFront(ctx, width, height, { glasses, glint, ear, blink: 1, tilt, tongue });
      ctx.restore();
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    return { el, destroy: () => cancelAnimationFrame(raf) };
  }

  window.Salsa = { mount, celebrate, paintSide, paintFront, VW, VH };
})();
