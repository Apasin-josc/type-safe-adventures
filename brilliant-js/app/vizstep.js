// Visualizador ("viz"): ver una estructura cambiar paso a paso. Es el mismo formato que dibuja la
// app del iPhone (lib/steps/viz.dart): cada cuadro trae su línea de código, variables, una nota y
// los paneles que quiera: array, bars, list, stack, queue, intervals o graph.
(function () {
  'use strict';
  const { hl, esc } = window.Viz;
  const SVG = 'http://www.w3.org/2000/svg';
  const show = (v) => (typeof v === 'string' ? v : v === null ? 'null' : JSON.stringify(v));
  const stOf = (m, k) => (m ? m[String(k)] || null : null);
  const ptrsOf = (m) => {
    const out = {};
    for (const [label, i] of Object.entries(m || {})) if (typeof i === 'number' && i >= 0) out[i] = out[i] ? `${out[i]}, ${label}` : label;
    return out;
  };
  const h = (html) => {
    const tpl = document.createElement('template');
    tpl.innerHTML = html.trim();
    return tpl.content.firstElementChild;
  };
  const svg = (tag, attrs = {}, text) => {
    const el = document.createElementNS(SVG, tag);
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    if (text != null) el.textContent = text;
    return el;
  };

  // ─────────── Paneles ───────────
  function arrayPanel(a) {
    const ptrs = ptrsOf(a.ptrs);
    const el = h(`<div class="arr vz-arr${Object.keys(ptrs).length ? ' has-ptr' : ''}"></div>`);
    el.style.maxWidth = `${a.values.length * 72}px`;
    a.values.forEach((v, i) => {
      const st = stOf(a.hl, i);
      const cls = { cur: 'sel', good: 'good', bad: 'bad', cmp: 'ptr', pivot: 'ptr', dim: 'dim' }[st] || '';
      el.appendChild(h(`<div class="cell ${cls}">${ptrs[i] ? `<span class="vz-ptr">${esc(ptrs[i])}</span>` : ''}<span class="v">${esc(String(v))}</span>${a.indices === false ? '' : `<span class="i">${i}</span>`}</div>`));
    });
    return el;
  }

  function barsPanel(b) {
    const top = Math.max(1, ...b.values);
    const ptrs = ptrsOf(b.ptrs);
    const gaps = new Set(b.gaps || []);
    const el = h('<div class="vz-bars"></div>');
    b.values.forEach((v, i) => {
      const st = stOf(b.hl, i) || '';
      el.appendChild(h(`<div class="vz-bar ${st}"><span class="vz-ptr">${esc(ptrs[i] || '')}</span><i style="height:${14 + (106 * v) / top}px"></i><b>${esc(String(v))}</b></div>`));
      if (gaps.has(i) && i < b.values.length - 1) el.appendChild(h('<span class="vz-gap"></span>'));
    });
    return el;
  }

  function stackPanel(s, max, t) {
    const el = h(`<div class="vz-stack"><small>${t('viz_stack')}</small><div class="vz-tube" style="min-height:${Math.max(1, max) * 38 + 10}px"></div>${s.items.length ? '' : `<small class="vz-empty">${t('viz_empty')}</small>`}</div>`);
    const tube = el.querySelector('.vz-tube');
    for (let i = s.items.length - 1; i >= 0; i--) {
      const st = stOf(s.hl, i) || (i === s.items.length - 1 ? 'cur' : '');
      tube.appendChild(h(`<div class="vz-box ${st}">${esc(String(s.items[i]))}</div>`));
    }
    return el;
  }

  function queuePanel(q, t) {
    const el = h(`<div class="vz-queue"><small>${t('viz_queue')}</small><div class="vz-lane"></div><small>${q.items.length ? `↑ ${t('viz_front')}` : t('viz_empty')}</small></div>`);
    const lane = el.querySelector('.vz-lane');
    q.items.forEach((v, i) => lane.appendChild(h(`<div class="vz-box ${stOf(q.hl, i) || (i === 0 ? 'cur' : '')}">${esc(String(v))}</div>`)));
    return el;
  }

  function intervalsPanel(m, axis, t) {
    const all = [...m.items, ...(m.merged || [])];
    const lo = axis ? axis[0] : Math.min(0, ...all.map((e) => e[0]));
    const hi = axis ? axis[1] : Math.max(1, ...all.map((e) => e[1]));
    const pct = (v) => ((v - lo) / (hi - lo)) * 100;
    const bar = (e, st) => `<div class="vz-iv ${st || ''}" style="left:${pct(e[0])}%;width:max(26px, ${pct(e[1]) - pct(e[0])}%)">${e[0]}–${e[1]}</div>`;
    const step = Math.max(1, Math.ceil((hi - lo) / 9));
    const ticks = [];
    for (let v = lo; v <= hi; v += step) ticks.push(`<span style="left:${pct(v)}%">${v}</span>`);
    return h(`<div class="vz-intervals">
      ${m.items.map((e, i) => `<div class="vz-row">${bar(e, stOf(m.hl, i))}</div>`).join('')}
      <div class="vz-axis">${ticks.join('')}</div>
      ${m.merged && m.merged.length ? `<small class="vz-result">${t('viz_result')}</small><div class="vz-row">${m.merged.map((e) => bar(e, 'good')).join('')}</div>` : ''}
    </div>`);
  }

  function gridPanel(g) {
    const nCols = g.cells.length ? g.cells[0].length : 0;
    const el = h(`<div class="vz-grid${g.rows ? ' has-rows' : ''}" style="--cols:${nCols}"></div>`);
    if (g.cols) {
      if (g.rows) el.appendChild(h('<span class="vz-gl"></span>'));
      for (let c = 0; c < nCols; c++) el.appendChild(h(`<span class="vz-gl">${esc(String(g.cols[c] ?? ''))}</span>`));
    }
    g.cells.forEach((row, r) => {
      if (g.rows) el.appendChild(h(`<span class="vz-gl">${esc(String(g.rows[r] ?? ''))}</span>`));
      row.forEach((v, c) => {
        const st = stOf(g.hl, `${r},${c}`) || (g.colors && g.colors[String(v)]) || '';
        el.appendChild(h(`<div class="vz-gc ${st}">${v == null ? '' : esc(String(v))}</div>`));
      });
    });
    return el;
  }

  function listPanel(m) {
    const values = m.values;
    const n = values.length;
    const links = m.links || values.map((_, i) => [i, i + 1 < n ? i + 1 : -1]);
    const ptrs = ptrsOf(m.ptrs);
    const W = 360;
    const bw = Math.min(52, (W - (n - 1) * 26) / n);
    const gap = n === 1 ? 0 : Math.min(44, (W - n * bw) / (n - 1));
    const x0 = (W - (n * bw + (n - 1) * gap)) / 2;
    const left = (i) => x0 + i * (bw + gap);
    const y0 = 44;
    const bh = 38;
    const el = svg('svg', { viewBox: `0 0 ${W} 132`, class: 'vz-svg', role: 'img' });
    const defs = svg('defs');
    const mk = svg('marker', { id: 'vz-head', viewBox: '0 0 10 10', refX: '9', refY: '5', markerWidth: '9', markerHeight: '9', markerUnits: 'userSpaceOnUse', orient: 'auto-start-reverse' });
    mk.appendChild(svg('path', { d: 'M0,0 L10,5 L0,10 z', class: 'vz-headfill' }));
    defs.appendChild(mk);
    el.appendChild(defs);
    const path = (d) => el.appendChild(svg('path', { d, class: 'vz-link', 'marker-end': 'url(#vz-head)' }));
    for (const [a, b] of links) {
      if (a >= n) continue;
      if (b < 0) {
        const x = left(a) + bw * 0.3;
        path(`M${x},${y0 + bh} L${x},${y0 + bh + 16}`);
        el.appendChild(svg('text', { x, y: y0 + bh + 30, class: 'vz-null' }, 'null'));
      } else if (b === a + 1) path(`M${left(a) + bw},${y0 + bh / 2} L${left(b) - 1},${y0 + bh / 2}`);
      else if (b < a) {
        const sx = left(a) + bw * 0.25;
        const ex = left(b) + bw * 0.75;
        path(`M${sx},${y0 + bh} Q${(sx + ex) / 2},${y0 + bh + 30 + 6 * (a - b)} ${ex},${y0 + bh + 2}`);
      } else if (b > a + 1) {
        const sx = left(a) + bw * 0.75;
        const ex = left(b) + bw * 0.25;
        path(`M${sx},${y0} Q${(sx + ex) / 2},${y0 - 24} ${ex},${y0 - 2}`);
      }
    }
    values.forEach((v, i) => {
      const st = stOf(m.hl, i) || '';
      const g = svg('g', { class: `vz-node ${st}` });
      g.appendChild(svg('rect', { x: left(i), y: y0, width: bw, height: bh, rx: 9 }));
      g.appendChild(svg('text', { x: left(i) + bw / 2, y: y0 + bh / 2 + 1 }, String(v)));
      el.appendChild(g);
      if (ptrs[i]) {
        const cx = left(i) + bw / 2;
        el.appendChild(svg('text', { x: cx, y: 14, class: 'vz-ptrtext' }, ptrs[i]));
        el.appendChild(svg('path', { d: `M${cx},22 L${cx},${y0 - 9}`, class: 'vz-ptrline' }));
        el.appendChild(svg('path', { d: `M${cx - 4},${y0 - 9} L${cx + 4},${y0 - 9} L${cx},${y0 - 3} z`, class: 'vz-ptrhead' }));
      }
    });
    return el;
  }

  function graphPanel(spec, f) {
    const H = spec.h || 60;
    const W = 360;
    const r = 17;
    const height = Math.min(300, (W * H) / 100) + 20;
    const sx = (W - 2 * r - 8) / 100;
    const sy = (height - 20 - 2 * r - 4) / H;
    const at = (id) => {
      const p = spec.nodes[id];
      return [r + 4 + p[0] * sx, r + 2 + p[1] * sy];
    };
    const show = f.show ? new Set(f.show.map(String)) : null;
    const visible = (id) => String(id) in spec.nodes && (!show || show.has(String(id)));
    const el = svg('svg', { viewBox: `0 0 ${W} ${height}`, class: 'vz-svg', role: 'img' });
    const defs = svg('defs');
    for (const st of ['', 'cur', 'good', 'cmp', 'bad', 'dim']) {
      const mk = svg('marker', { id: `vz-gh${st}`, viewBox: '0 0 10 10', refX: '9', refY: '5', markerWidth: '10', markerHeight: '10', markerUnits: 'userSpaceOnUse', orient: 'auto' });
      mk.appendChild(svg('path', { d: 'M0,0 L10,5 L0,10 z', class: `vz-ghead ${st}` }));
      defs.appendChild(mk);
    }
    el.appendChild(defs);
    for (const e of f.edges || spec.edges) {
      const [a, b, w] = [String(e[0]), String(e[1]), e[2]];
      if (!visible(a) || !visible(b)) continue;
      const st = (f.ehl && (f.ehl[`${a}-${b}`] || (!spec.directed && f.ehl[`${b}-${a}`]))) || '';
      const [ax, ay] = at(a);
      const [bx, by] = at(b);
      const len = Math.hypot(bx - ax, by - ay) || 1;
      const ux = (bx - ax) / len;
      const uy = (by - ay) / len;
      const end = r + (spec.directed ? 2 : 0);
      el.appendChild(svg('line', { x1: ax + ux * r, y1: ay + uy * r, x2: bx - ux * end, y2: by - uy * end, class: `vz-edge ${st}`, ...(spec.directed ? { 'marker-end': `url(#vz-gh${st})` } : {}) }));
      if (w != null) {
        const g = svg('g', { class: `vz-w ${st}` });
        g.appendChild(svg('rect', { x: (ax + bx) / 2 - 9, y: (ay + by) / 2 - 9, width: 18, height: 18, rx: 8 }));
        g.appendChild(svg('text', { x: (ax + bx) / 2, y: (ay + by) / 2 + 1 }, String(w)));
        el.appendChild(g);
      }
    }
    for (const id of Object.keys(spec.nodes)) {
      if (!visible(id)) continue;
      const [cx, cy] = at(id);
      const g = svg('g', { class: `vz-gnode ${stOf(f.hl, id) || ''}` });
      g.appendChild(svg('circle', { cx, cy, r }));
      const name = String((spec.names && spec.names[id]) || id);
      const fs = name.length <= 2 ? 14 : name.length === 3 ? 12 : name.length === 4 ? 10.5 : 9;
      g.appendChild(svg('text', { x: cx, y: cy + 1, style: `font-size:${fs}px` }, name));
      el.appendChild(g);
      const lab = f.labels && f.labels[id];
      if (lab != null) {
        const lg = svg('g', { class: 'vz-glabel' });
        const wpx = Math.max(18, String(lab).length * 8 + 10);
        lg.appendChild(svg('rect', { x: cx - wpx / 2, y: cy + r + 2, width: wpx, height: 16, rx: 8 }));
        lg.appendChild(svg('text', { x: cx, y: cy + r + 10.5 }, String(lab)));
        el.appendChild(lg);
      }
    }
    return el;
  }

  // ─────────── La pantalla ───────────
  function viz(step, ctx) {
    const frames = step.frames;
    const lines = step.code ? step.code.split('\n') : null;
    const stackMax = Math.max(0, ...frames.map((f) => (f.stack ? f.stack.items.length : 0)));
    const el = h(`<div class="w-viz">
      ${lines ? `<pre class="code lines">${lines.map((l) => `<div class="ln">${hl(l) || ' '}</div>`).join('')}</pre>` : ''}
      <div class="vz-stage" aria-live="polite"></div>
      <div class="vars"></div>
      <p class="vz-note"></p>
      <div class="vz-dots">${frames.map(() => '<i></i>').join('')}</div>
      <div class="vz-nav">
        <button type="button" class="btn ghost" data-d="-1" aria-label="${esc(ctx.t('prev'))}">◀</button>
        <button type="button" class="btn ghost" data-play></button>
        <button type="button" class="btn ghost" data-d="1">${ctx.t('step')} ▶</button>
      </div>
    </div>`);
    const lns = [...el.querySelectorAll('.ln')];
    const dots = [...el.querySelectorAll('.vz-dots i')];
    const stage = el.querySelector('.vz-stage');
    const playBtn = el.querySelector('[data-play]');
    let k = 0;
    let timer = null;
    let barsEl = null;

    function stop() {
      clearInterval(timer);
      timer = null;
    }
    function go(d, manual = true) {
      if (manual) stop();
      k = Math.max(0, Math.min(frames.length - 1, k + d));
      if (k === frames.length - 1) stop();
      paint();
    }

    function paint() {
      const f = frames[k];
      lns.forEach((l, i) => l.classList.toggle('on', i === f.line));
      // Las barras se reutilizan para que su altura se anime al cambiar de cuadro.
      const keepBars = f.bars && barsEl && barsEl.childElementCount === barsPanel(f.bars).childElementCount;
      const nextBars = f.bars ? barsPanel(f.bars) : null;
      if (keepBars) {
        [...nextBars.children].forEach((nb, i) => {
          const ob = barsEl.children[i];
          ob.className = nb.className;
          if (nb.tagName === 'DIV') {
            ob.querySelector('.vz-ptr').textContent = nb.querySelector('.vz-ptr').textContent;
            ob.querySelector('i').style.height = nb.querySelector('i').style.height;
            ob.querySelector('b').textContent = nb.querySelector('b').textContent;
          }
        });
      }
      const parts = [];
      if (f.array) parts.push(arrayPanel(f.array));
      if (f.bars) parts.push(keepBars ? barsEl : (barsEl = nextBars));
      if (f.list) parts.push(listPanel(f.list));
      if (f.stack || f.queue) {
        const row = h('<div class="vz-sq"></div>');
        if (f.stack) row.appendChild(stackPanel(f.stack, stackMax, ctx.t));
        if (f.queue) row.appendChild(queuePanel(f.queue, ctx.t));
        parts.push(row);
      }
      if (f.intervals) parts.push(intervalsPanel(f.intervals, step.axis, ctx.t));
      if (f.graph) parts.push(graphPanel(step.graph, f.graph));
      if (f.grid) parts.push(gridPanel(f.grid));
      stage.replaceChildren(...parts);
      const vars = Object.entries(f.vars || {});
      el.querySelector('.vars').innerHTML = vars.map(([n, v]) => `<span class="var"><code>${esc(n)}</code><b>${esc(show(v))}</b></span>`).join('');
      el.querySelector('.vars').hidden = !vars.length;
      el.querySelector('.vz-note').innerHTML = f.note ? ctx.tx(f.note) : '';
      dots.forEach((d, i) => {
        d.classList.toggle('on', i <= k);
        d.classList.toggle('now', i === k);
      });
      el.querySelector('[data-d="-1"]').disabled = k === 0;
      el.querySelector('[data-d="1"]').disabled = k === frames.length - 1;
      playBtn.textContent = timer ? '⏸' : `▶ ${ctx.t('play')}`;
      if (k === frames.length - 1) ctx.setReady(true);
    }

    el.querySelectorAll('[data-d]').forEach((b) => b.addEventListener('click', () => go(Number(b.dataset.d))));
    playBtn.addEventListener('click', () => {
      if (timer) {
        stop();
        return paint();
      }
      if (k === frames.length - 1) k = 0;
      // Si ya te fuiste de esta pantalla, el Play se detiene solo.
      timer = setInterval(() => (el.isConnected ? go(1, false) : stop()), 1600);
      paint();
    });
    paint();
    return { el, destroy: stop };
  }

  window.Widgets.viz = viz;
})();
