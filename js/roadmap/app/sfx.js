// Efectos de sonido 8-bit generados con Web Audio. No hay archivos de audio: cada sonido
// es una secuencia de notas con osciladores de onda cuadrada, triangular o ruido.
(function () {
  'use strict';

  let ctx = null;
  let master = null;
  let muted = false;

  function audio() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.22;
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  /** Una nota: frecuencia (Hz), cuándo empieza (s desde ahora), duración, forma de onda y volumen. */
  function tone(freq, at, dur, { type = 'square', vol = 0.5, slide = null } = {}) {
    const t0 = ctx.currentTime + at;
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slide) osc.frequency.exponentialRampToValueAtTime(slide, t0 + dur);
    env.gain.setValueAtTime(0.0001, t0);
    env.gain.exponentialRampToValueAtTime(vol, t0 + 0.008);
    env.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(env).connect(master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  /** Ráfaga de ruido (golpes, explosiones). */
  function noise(at, dur, vol = 0.35) {
    const t0 = ctx.currentTime + at;
    const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ctx.createBufferSource();
    const env = ctx.createGain();
    src.buffer = buf;
    env.gain.value = vol;
    src.connect(env).connect(master);
    src.start(t0);
  }

  const N = { C5: 523, D5: 587, E5: 659, G5: 784, A5: 880, B5: 988, C6: 1047, E6: 1319, G6: 1568, C4: 262, G4: 392 };

  const SOUNDS = {
    // Acierto: espadazo corto.
    hit() {
      noise(0, 0.05, 0.25);
      tone(660, 0, 0.09, { slide: 1320, vol: 0.35 });
    },
    // Fallo: "bonk" grave.
    bonk() {
      tone(220, 0, 0.2, { type: 'triangle', slide: 90, vol: 0.6 });
      tone(110, 0.02, 0.18, { vol: 0.25 });
    },
    // Test fallido: zumbido doble, más suave que un golpe.
    blocked() {
      tone(180, 0, 0.08, { vol: 0.25 });
      tone(150, 0.1, 0.12, { vol: 0.25 });
    },
    // XP: monedita.
    coin() {
      tone(N.B5, 0, 0.07, { vol: 0.3 });
      tone(N.E6, 0.07, 0.16, { vol: 0.3 });
    },
    // Combo: dos notas agudas rápidas.
    combo() {
      tone(N.C6, 0, 0.06, { vol: 0.3 });
      tone(N.G6, 0.06, 0.12, { vol: 0.3 });
      noise(0, 0.04, 0.15);
    },
    // Subir de nivel: arpegio + nota larga.
    levelup() {
      [N.C5, N.E5, N.G5, N.C6].forEach((f, i) => tone(f, i * 0.08, 0.1, { vol: 0.35 }));
      tone(N.E6, 0.32, 0.35, { vol: 0.3 });
      tone(N.C6, 0.32, 0.35, { type: 'triangle', vol: 0.3 });
    },
    // Poción: burbujas.
    potion() {
      [520, 700, 900, 1150].forEach((f, i) => tone(f, i * 0.06, 0.08, { type: 'sine', slide: f * 1.3, vol: 0.4 }));
    },
    // K.O.: caída larga.
    ko() {
      tone(440, 0, 0.7, { slide: 70, vol: 0.4 });
      noise(0.05, 0.3, 0.2);
    },
    // Mob derrotado: mini fanfarria.
    victory() {
      noise(0, 0.12, 0.3);
      [N.G4, N.C5, N.E5, N.G5].forEach((f, i) => tone(f, 0.08 + i * 0.07, 0.09, { vol: 0.3 }));
      tone(N.C6, 0.4, 0.3, { vol: 0.3 });
    },
    // Cofre: crujido + brillitos.
    chest() {
      noise(0, 0.15, 0.3);
      tone(N.C4, 0, 0.12, { type: 'triangle', vol: 0.4 });
      [N.E5, N.G5, N.C6, N.E6, N.G6].forEach((f, i) => tone(f, 0.18 + i * 0.06, 0.12, { type: 'triangle', vol: 0.3 }));
    },
    // Logro desbloqueado.
    achievement() {
      [N.G5, N.C6, N.E6, N.G6].forEach((f, i) => tone(f, i * 0.09, 0.14, { type: 'triangle', vol: 0.4 }));
      tone(N.C6, 0.36, 0.4, { vol: 0.2 });
    },
  };

  window.Sfx = {
    play(name) {
      if (muted || !SOUNDS[name]) return;
      try {
        if (!audio()) return;
        SOUNDS[name]();
      } catch {}
    },
    get muted() {
      return muted;
    },
    setMuted(value) {
      muted = Boolean(value);
    },
  };
})();
