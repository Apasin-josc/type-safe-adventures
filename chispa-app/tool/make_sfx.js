#!/usr/bin/env node
// Sintetiza los sonidos de la app (WAV, 44.1 kHz, mono) en assets/sfx/.  node tool/make_sfx.js
// Todo es síntesis propia: ondas suaves (seno + triángulo) con envolventes cortas, para que suenen
// "chiptune" pero sin chillar.
const fs = require('node:fs');
const path = require('node:path');
const RATE = 44100;
const OUT = path.join(__dirname, '..', 'assets', 'sfx');

const note = (n) => 440 * 2 ** ((n - 69) / 12); // número MIDI → Hz

/** Una nota: frecuencia, inicio y duración en segundos. */
function voice(buf, { f, start, dur, vol = 0.5, type = 'soft', slide = 0, attack = 0.005, release = 0.12, vibrato = 0 }) {
  const s0 = Math.floor(start * RATE);
  const n = Math.floor((dur + release) * RATE);
  let phase = 0;
  for (let i = 0; i < n && s0 + i < buf.length; i++) {
    const t = i / RATE;
    const freq = f * (1 + slide * Math.min(1, t / dur)) * (1 + vibrato * Math.sin(2 * Math.PI * 6 * t));
    phase += (2 * Math.PI * freq) / RATE;
    const sine = Math.sin(phase);
    const tri = (2 / Math.PI) * Math.asin(Math.sin(phase));
    const sq = Math.sign(Math.sin(phase)) * 0.35;
    let w;
    if (type === 'soft') w = 0.7 * sine + 0.3 * tri;
    else if (type === 'chip') w = 0.55 * tri + 0.25 * sq + 0.2 * sine;
    else if (type === 'bell') w = sine + 0.3 * Math.sin(phase * 2.01) * Math.exp(-t * 8) + 0.15 * Math.sin(phase * 3.02) * Math.exp(-t * 12);
    else w = sine;
    let env;
    if (t < attack) env = t / attack;
    else if (t < dur) env = 1 - 0.35 * ((t - attack) / Math.max(1e-6, dur - attack));
    else env = 0.65 * Math.exp(-(t - dur) / (release / 4));
    buf[s0 + i] += w * env * vol;
  }
}

function noise(buf, { start, dur, vol = 0.2, decay = 30 }) {
  const s0 = Math.floor(start * RATE);
  let last = 0;
  for (let i = 0; i < dur * RATE && s0 + i < buf.length; i++) {
    const t = i / RATE;
    last = 0.6 * last + 0.4 * (Math.random() * 2 - 1); // ruido suavizado
    buf[s0 + i] += last * vol * Math.exp(-t * decay);
  }
}

function write(name, seconds, fill) {
  const buf = new Float32Array(Math.ceil(seconds * RATE));
  fill(buf);
  let peak = 0;
  for (const v of buf) peak = Math.max(peak, Math.abs(v));
  const gain = peak > 0 ? 0.85 / peak : 1;
  const data = Buffer.alloc(buf.length * 2);
  for (let i = 0; i < buf.length; i++) {
    // micro fade final para que no truene
    const tail = Math.min(1, (buf.length - i) / 200);
    data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, buf[i] * gain * tail)) * 32767), i * 2);
  }
  const h = Buffer.alloc(44);
  h.write('RIFF', 0);
  h.writeUInt32LE(36 + data.length, 4);
  h.write('WAVEfmt ', 8);
  h.writeUInt32LE(16, 16);
  h.writeUInt16LE(1, 20);
  h.writeUInt16LE(1, 22);
  h.writeUInt32LE(RATE, 24);
  h.writeUInt32LE(RATE * 2, 28);
  h.writeUInt16LE(2, 32);
  h.writeUInt16LE(16, 34);
  h.write('data', 36);
  h.writeUInt32LE(data.length, 40);
  fs.writeFileSync(path.join(OUT, name + '.wav'), Buffer.concat([h, data]));
}

fs.mkdirSync(OUT, { recursive: true });

// Toque suave (elegir una opción, una ficha, un casillero)
write('tap', 0.08, (b) => voice(b, { f: note(84), start: 0, dur: 0.012, release: 0.05, vol: 0.4, type: 'sine' }));

// Acierto: dos notas que suben. Cada acierto seguido (combo) sube un tono más: dopamina.
const scale = [0, 2, 4, 7, 9, 12, 14, 16]; // pentatónica mayor
for (let k = 0; k < 6; k++) {
  const base = 72 + scale[k];
  write(`correct_${k + 1}`, 0.5, (b) => {
    voice(b, { f: note(base), start: 0, dur: 0.07, vol: 0.5, type: 'bell' });
    voice(b, { f: note(base + 7), start: 0.075, dur: 0.12, release: 0.25, vol: 0.55, type: 'bell' });
    if (k >= 3) voice(b, { f: note(base + 12), start: 0.16, dur: 0.1, release: 0.25, vol: 0.35, type: 'bell' });
  });
}

// Fallo: un "bonk" grave y amable (no regaña)
write('wrong', 0.35, (b) => {
  voice(b, { f: note(52), start: 0, dur: 0.12, release: 0.15, vol: 0.6, type: 'soft', slide: -0.18 });
  voice(b, { f: note(47), start: 0.09, dur: 0.12, release: 0.15, vol: 0.45, type: 'soft', slide: -0.12 });
});

// Salto de Salsa: boing que sube
write('hop', 0.4, (b) => voice(b, { f: note(62), start: 0, dur: 0.22, release: 0.12, vol: 0.5, type: 'chip', slide: 0.9 }));

// Aterrizaje: patitas
write('land', 0.18, (b) => {
  noise(b, { start: 0, dur: 0.08, vol: 0.5, decay: 45 });
  voice(b, { f: note(55), start: 0, dur: 0.03, release: 0.06, vol: 0.4, type: 'sine' });
});

// Lección completada: fanfarria chiptune
write('complete', 1.6, (b) => {
  const seq = [
    [72, 0, 0.1], [76, 0.11, 0.1], [79, 0.22, 0.1], [84, 0.33, 0.28],
    [81, 0.66, 0.09], [84, 0.76, 0.09], [88, 0.86, 0.5],
  ];
  for (const [n, s, d] of seq) voice(b, { f: note(n), start: s, dur: d, release: 0.25, vol: 0.45, type: 'chip', vibrato: d > 0.3 ? 0.006 : 0 });
  for (const [n, s, d] of [[48, 0, 0.3], [55, 0.33, 0.3], [60, 0.66, 0.7]]) voice(b, { f: note(n), start: s, dur: d, release: 0.3, vol: 0.35, type: 'soft' });
});

// Racha: chispitas que suben + campana
write('streak', 1.4, (b) => {
  for (let i = 0; i < 8; i++) voice(b, { f: note(79 + scale[i]), start: i * 0.055, dur: 0.05, release: 0.15, vol: 0.3, type: 'bell' });
  voice(b, { f: note(96), start: 0.48, dur: 0.4, release: 0.5, vol: 0.4, type: 'bell', vibrato: 0.004 });
  voice(b, { f: note(84), start: 0.48, dur: 0.4, release: 0.5, vol: 0.35, type: 'bell' });
});

// Desbloquear una lección nueva
write('unlock', 0.6, (b) => {
  voice(b, { f: note(79), start: 0, dur: 0.06, release: 0.1, vol: 0.4, type: 'bell' });
  voice(b, { f: note(86), start: 0.07, dur: 0.06, release: 0.1, vol: 0.4, type: 'bell' });
  voice(b, { f: note(91), start: 0.14, dur: 0.2, release: 0.3, vol: 0.45, type: 'bell' });
});

console.log('Sonidos en', OUT, '→', fs.readdirSync(OUT).join(', '));
