// Las piezas interactivas de cada pantalla. Cada tipo recibe (step, ctx) y regresa:
//   el          el elemento a mostrar
//   check()     (opcional) → { ok, msg } o una promesa de eso. Sin check, la pantalla es de explorar.
//   feedback(ok) / reveal()   (opcionales) para pintar acierto, error o la respuesta correcta.
// ctx: { t, tx, setReady(bool) }. La pantalla habilita el botón de abajo cuando el widget dice ready.
(function () {
  'use strict';
  const { hl, esc } = window.Viz;

  const h = (html) => {
    const tpl = document.createElement('template');
    tpl.innerHTML = html.trim();
    return tpl.content.firstElementChild;
  };
  const codeBlock = (src) => `<pre class="code">${hl(src)}</pre>`;
  const fmtNum = (n) => n.toLocaleString('en-US');
  const show = (v) => (v === null ? 'null' : JSON.stringify(v));
  const callText = (fnName, args, label, tx) => (label ? (tx ? tx(label) : label) : `${fnName}(${args.map(show).join(', ')})`);

  function shuffle(list, seed = Date.now()) {
    const a = list.slice();
    let s = seed % 2147483647 || 1;
    for (let i = a.length - 1; i > 0; i--) {
      s = (s * 16807) % 2147483647;
      const j = s % (i + 1);
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /** Una fila de casilleros. onTap(i) los vuelve botones. */
  function arrayView(values, { indices = true, onTap = null } = {}) {
    const el = h(`<div class="arr"></div>`);
    el.style.maxWidth = `${values.length * 72}px`; // pocos casilleros no se estiran a todo lo ancho
    const tag = onTap ? 'button' : 'div';
    const cells = values.map((v, i) => {
      const c = h(`<${tag} ${onTap ? 'type="button"' : ''} class="cell"><span class="v">${esc(String(v))}</span>${
        indices ? `<span class="i">${i}</span>` : ''
      }</${tag}>`);
      if (onTap) c.addEventListener('click', () => onTap(i));
      el.appendChild(c);
      return c;
    });
    return {
      el,
      cells,
      set(i, cls, on = true) {
        if (cells[i]) cells[i].classList.toggle(cls, on);
      },
      clear(cls) {
        cells.forEach((c) => c.classList.remove(cls));
      },
      value(i, v) {
        cells[i].querySelector('.v').textContent = String(v);
      },
    };
  }

  // ─────────────── Leer ───────────────
  function read(step, ctx) {
    const el = h(`<div class="w-read"></div>`);
    if (step.code) el.insertAdjacentHTML('beforeend', codeBlock(step.code));
    if (step.array) el.appendChild(arrayView(step.array, { indices: step.indices !== false }).el);
    if (step.body) el.insertAdjacentHTML('beforeend', `<div class="prose">${ctx.tx(step.body)}</div>`);
    ctx.setReady(true);
    return { el };
  }

  // ─────────────── Opción múltiple ───────────────
  function choice(step, ctx) {
    const el = h(`<div class="w-choice">${step.code ? codeBlock(step.code) : ''}<div class="opts" role="radiogroup"></div></div>`);
    const box = el.querySelector('.opts');
    let sel = null;
    let locked = false;
    const btns = step.options.map((o, i) => {
      const b = h(`<button type="button" class="opt" role="radio" aria-checked="false">${ctx.tx(o)}</button>`);
      b.addEventListener('click', () => {
        if (locked) return;
        sel = i;
        btns.forEach((x, j) => {
          x.classList.toggle('sel', j === i);
          x.classList.remove('bad');
          x.setAttribute('aria-checked', String(j === i));
        });
        ctx.setReady(true);
      });
      box.appendChild(b);
      return b;
    });
    return {
      el,
      check: () => ({ ok: sel === step.answer, msg: step.why && ctx.tx(step.why[sel]) }),
      feedback(ok) {
        btns[sel].classList.add(ok ? 'good' : 'bad');
        if (ok) locked = true;
      },
      reveal() {
        locked = true;
        btns[step.answer].classList.add('good');
      },
    };
  }

  // ─────────────── Tocar un casillero ───────────────
  function tap(step, ctx) {
    const el = h(`<div class="w-tap">${step.code ? codeBlock(step.code) : ''}</div>`);
    let sel = null;
    let locked = false;
    const arr = arrayView(step.values, {
      indices: step.indices !== false,
      onTap: (i) => {
        if (locked) return;
        sel = i;
        arr.clear('sel');
        arr.clear('bad');
        arr.set(i, 'sel');
        ctx.setReady(true);
      },
    });
    el.appendChild(arr.el);
    return {
      el,
      check: () => ({ ok: sel === step.answer, msg: step.why && ctx.tx(step.why[sel]) }),
      feedback(ok) {
        arr.set(sel, ok ? 'good' : 'bad');
        if (ok) locked = true;
      },
      reveal() {
        locked = true;
        arr.set(step.answer, 'good');
      },
    };
  }

  // ─────────────── Escribir un número ───────────────
  function number(step, ctx) {
    const el = h(`<div class="w-number">${step.code ? codeBlock(step.code) : ''}
      <input class="num" type="text" inputmode="numeric" autocomplete="off" aria-label="${ctx.t('answer')}" placeholder="${ctx.t('answer')}" /></div>`);
    const input = el.querySelector('input');
    input.addEventListener('input', () => ctx.setReady(input.value.trim() !== ''));
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && input.value.trim()) ctx.submit();
    });
    return {
      el,
      check: () => {
        const n = Number(input.value.replace(/[,\s]/g, ''));
        return { ok: n === step.answer, msg: step.hint && ctx.tx(step.hint) };
      },
      feedback(ok) {
        input.classList.toggle('good', ok);
        input.classList.toggle('bad', !ok);
        if (ok) input.readOnly = true;
      },
      reveal() {
        input.value = fmtNum(step.answer);
        input.readOnly = true;
        input.classList.remove('bad');
        input.classList.add('good');
      },
    };
  }

  // ─────────────── Completar huecos con fichas ───────────────
  function fill(step, ctx) {
    const parts = step.code.split(/\[\[(\d+)\]\]/);
    const slotsCount = (parts.length - 1) / 2;
    const filled = Array(slotsCount).fill(null);
    let html = '';
    parts.forEach((p, i) => {
      html += i % 2 ? `<button type="button" class="slot" data-slot="${p}">&nbsp;</button>` : hl(p);
    });
    const el = h(`<div class="w-fill"><pre class="code">${html}</pre><div class="chips"></div></div>`);
    const slots = [...el.querySelectorAll('.slot')];
    const chipBox = el.querySelector('.chips');
    let locked = false;
    function paint() {
      slots.forEach((s, i) => {
        s.textContent = filled[i] === null ? ' ' : step.chips[filled[i]];
        s.classList.toggle('empty', filled[i] === null);
        s.classList.remove('bad');
      });
      chipBox.querySelectorAll('.chip').forEach((c, i) => (c.disabled = filled.includes(i)));
      ctx.setReady(filled.every((f) => f !== null));
    }
    step.chips.forEach((c, i) => {
      const b = h(`<button type="button" class="chip"><code>${esc(c)}</code></button>`);
      b.addEventListener('click', () => {
        if (locked) return;
        const empty = filled.indexOf(null);
        if (empty === -1) return;
        filled[empty] = i;
        paint();
      });
      chipBox.appendChild(b);
    });
    slots.forEach((s, i) =>
      s.addEventListener('click', () => {
        if (locked) return;
        filled[i] = null;
        paint();
      })
    );
    paint();
    const right = () => filled.map((f) => step.chips[f]).every((c, i) => c === step.answers[i]);
    return {
      el,
      check: () => ({ ok: right(), msg: step.hint && ctx.tx(step.hint) }),
      feedback(ok) {
        slots.forEach((s, i) => s.classList.add(step.chips[filled[i]] === step.answers[i] ? 'good' : 'bad'));
        if (ok) locked = true;
      },
      reveal() {
        locked = true;
        step.answers.forEach((a, i) => (filled[i] = step.chips.indexOf(a)));
        paint();
        slots.forEach((s) => s.classList.add('good'));
      },
    };
  }

  // ─────────────── Ordenar bloques de código (con pruebas de verdad) ───────────────
  function order(step, ctx) {
    const bank = shuffle(step.lines.map((_, i) => i), step.seed || 7);
    const built = [];
    const el = h(`<div class="w-order">
      <p class="label">${ctx.t('your_code')}</p>
      <div class="built code">${step.pre ? `<div class="fixed">${hl(step.pre)}</div>` : ''}<div class="slots"></div>${
        step.post ? `<div class="fixed">${hl(step.post)}</div>` : ''
      }</div>
      <p class="label">${ctx.t('blocks')}</p>
      <div class="bank"></div>
    </div>`);
    const slotBox = el.querySelector('.slots');
    const bankBox = el.querySelector('.bank');
    let locked = false;
    const lineEl = (i) => {
      const b = h(`<button type="button" class="line"><code>${hl(step.lines[i])}</code></button>`);
      return b;
    };
    function paint() {
      slotBox.innerHTML = built.length ? '' : `<p class="empty-hint">${ctx.t('tap_blocks')}</p>`;
      built.forEach((i, pos) => {
        const b = lineEl(i);
        b.addEventListener('click', () => {
          if (locked) return;
          built.splice(pos, 1);
          bank.push(i);
          paint();
        });
        slotBox.appendChild(b);
      });
      bankBox.innerHTML = '';
      bank.forEach((i, pos) => {
        const b = lineEl(i);
        b.addEventListener('click', () => {
          if (locked) return;
          bank.splice(pos, 1);
          built.push(i);
          paint();
        });
        bankBox.appendChild(b);
      });
      ctx.setReady(bank.length === 0);
    }
    paint();
    const source = () => [step.pre, ...built.map((i) => step.lines[i]), step.post].filter(Boolean).join('\n');
    return {
      el,
      async check() {
        if (!step.tests) return { ok: built.every((v, i) => v === i) };
        const r = await window.Runner.run(source(), step.fnName, step.tests, 2000, step.wrap || '');
        if (r.error) return { ok: false, msg: ctx.t('order_broken') };
        const passed = r.results.filter((x) => x.ok).length;
        return { ok: passed === r.results.length, msg: ctx.t('tests_passed', passed, r.results.length) };
      },
      feedback(ok) {
        el.querySelector('.built').classList.toggle('good', ok);
        el.querySelector('.built').classList.toggle('bad', !ok);
        if (ok) locked = true;
      },
      reveal() {
        locked = true;
        built.length = 0;
        bank.length = 0;
        step.lines.forEach((_, i) => built.push(i));
        paint();
        el.querySelector('.built').classList.remove('bad');
        el.querySelector('.built').classList.add('good');
      },
    };
  }

  // ─────────────── Seguir el código paso a paso ───────────────
  function trace(step, ctx) {
    const lines = step.code.split('\n');
    const el = h(`<div class="w-trace">
      <pre class="code lines">${lines.map((l) => `<div class="ln">${hl(l) || ' '}</div>`).join('')}</pre>
      <div class="trace-arr"></div>
      <div class="vars" aria-live="polite"></div>
      <p class="note"></p>
      <div class="trace-nav">
        <button type="button" class="btn ghost" data-d="-1">◀ ${ctx.t('prev')}</button>
        <span class="count"></span>
        <button type="button" class="btn ghost" data-d="1">${ctx.t('step')} ▶</button>
      </div>
    </div>`);
    const lns = [...el.querySelectorAll('.ln')];
    const arr = step.array ? arrayView(step.array) : null;
    if (arr) el.querySelector('.trace-arr').appendChild(arr.el);
    let k = 0;
    function paint() {
      const f = step.frames[k];
      lns.forEach((l, i) => l.classList.toggle('on', i === f.line));
      const vars = Object.entries(f.vars || {});
      el.querySelector('.vars').innerHTML = vars.length
        ? vars.map(([n, v]) => `<span class="var"><code>${esc(n)}</code><b>${esc(show(v))}</b></span>`).join('')
        : `<span class="muted">${ctx.t('no_vars')}</span>`;
      el.querySelector('.note').innerHTML = f.note ? ctx.tx(f.note) : '';
      el.querySelector('.count').textContent = `${k + 1} / ${step.frames.length}`;
      el.querySelector('[data-d="-1"]').disabled = k === 0;
      el.querySelector('[data-d="1"]').disabled = k === step.frames.length - 1;
      if (arr) {
        arr.clear('sel');
        if (f.vars && typeof f.vars.i === 'number') arr.set(f.vars.i, 'sel');
      }
      if (k === step.frames.length - 1) ctx.setReady(true);
    }
    el.querySelectorAll('[data-d]').forEach((b) =>
      b.addEventListener('click', () => {
        k = Math.max(0, Math.min(step.frames.length - 1, k + Number(b.dataset.d)));
        paint();
      })
    );
    paint();
    return { el };
  }

  // ─────────────── Cartas boca abajo (búsqueda lineal) ───────────────
  function search(step, ctx) {
    const values = shuffle(step.values);
    const el = h(`<div class="w-search"><div class="cards"></div><p class="status" aria-live="polite"></p></div>`);
    const box = el.querySelector('.cards');
    const status = el.querySelector('.status');
    let flips = 0;
    let found = false;
    values.forEach((v) => {
      const c = h(`<button type="button" class="card" aria-label="?"><span>?</span></button>`);
      c.addEventListener('click', () => {
        if (found || c.classList.contains('open')) return;
        flips++;
        c.classList.add('open');
        c.querySelector('span').textContent = v;
        c.setAttribute('aria-label', String(v));
        if (v === step.target) {
          found = true;
          c.classList.add('good');
          status.innerHTML = ctx.t('search_found', flips, values.length);
          ctx.setReady(true);
        } else {
          status.textContent = ctx.t('search_flips', flips);
        }
      });
      box.appendChild(c);
    });
    status.textContent = ctx.t('search_flips', 0);
    return { el };
  }

  // ─────────────── Cómo crecen n, n² y log n ───────────────
  function growth(step, ctx) {
    const MAX = 100;
    const el = h(`<div class="w-growth">
      <label class="slider"><span>n = <b class="nval"></b></span><input type="range" min="1" max="${MAX}" value="${step.start || 10}" /></label>
      <div class="rows"></div>
      <div class="growth-actions"><button type="button" class="btn ghost dbl">${ctx.t('double_n')}</button></div>
      <p class="note" aria-live="polite"></p>
    </div>`);
    const input = el.querySelector('input');
    const rows = [
      { key: 'log', label: 'log₂ n', f: (n) => Math.max(1, Math.ceil(Math.log2(n))) },
      { key: 'lin', label: 'n', f: (n) => n },
      { key: 'quad', label: 'n²', f: (n) => n * n },
    ];
    const box = el.querySelector('.rows');
    rows.forEach((r) => {
      r.el = h(`<div class="grow-row ${r.key}"><span class="g-label">${r.label}</span><div class="g-bar"><i></i></div><b class="g-val"></b></div>`);
      box.appendChild(r.el);
    });
    function paint(prev) {
      const n = Number(input.value);
      el.querySelector('.nval').textContent = n;
      rows.forEach((r) => {
        const v = r.f(n);
        r.el.querySelector('i').style.width = `${Math.max(1.5, (v / (MAX * MAX)) * 100)}%`;
        r.el.querySelector('.g-val').textContent = fmtNum(v);
      });
      el.querySelector('.dbl').disabled = n * 2 > MAX;
      if (prev) {
        el.querySelector('.note').innerHTML = ctx.t(
          'double_note',
          prev,
          n,
          rows[0].f(n) - rows[0].f(prev),
          rows[2].f(n) / rows[2].f(prev)
        );
      }
    }
    input.addEventListener('input', () => paint());
    el.querySelector('.dbl').addEventListener('click', () => {
      const prev = Number(input.value);
      input.value = String(prev * 2);
      paint(prev);
    });
    paint();
    ctx.setReady(true);
    return { el };
  }

  // ─────────────── Partir a la mitad ───────────────
  function halving(step, ctx) {
    const el = h(`<div class="w-halving">
      <label class="slider"><span>n = <b class="nval"></b></span><input type="range" min="3" max="20" value="${step.start || 5}" /></label>
      <div class="chain"></div>
      <p class="big"><b class="cuts"></b></p>
    </div>`);
    const input = el.querySelector('input');
    function paint() {
      const k = Number(input.value);
      const n = 2 ** k;
      el.querySelector('.nval').textContent = fmtNum(n);
      const seq = [];
      for (let v = n; v >= 1; v /= 2) seq.push(fmtNum(v));
      const shown = seq.length > 8 ? [...seq.slice(0, 4), '…', ...seq.slice(-3)] : seq;
      el.querySelector('.chain').innerHTML = shown.map((s) => `<span class="${s === '…' ? 'gap' : 'chip-n'}">${s}</span>`).join('<span class="arrow">→</span>');
      el.querySelector('.cuts').innerHTML = ctx.t('halvings', k, fmtNum(n));
    }
    input.addEventListener('input', paint);
    paint();
    ctx.setReady(true);
    return { el };
  }

  // ─────────────── Adivina el número ───────────────
  function guess(step, ctx) {
    const lo0 = step.min || 1;
    const hi0 = step.max || 100;
    const secret = lo0 + Math.floor(Math.random() * (hi0 - lo0 + 1));
    let lo = lo0;
    let hi = hi0;
    let tries = 0;
    let won = false;
    const el = h(`<div class="w-guess">
      <div class="range-bar" aria-hidden="true"><i class="alive"></i></div>
      <p class="range-text"></p>
      <form class="guess-form">
        <input class="num" type="text" inputmode="numeric" autocomplete="off" aria-label="${ctx.t('your_guess')}" placeholder="${lo0}–${hi0}" />
        <button type="submit" class="btn">${ctx.t('guess_btn')}</button>
      </form>
      <p class="status" aria-live="polite"></p>
      <div class="history"></div>
    </div>`);
    const input = el.querySelector('input');
    const status = el.querySelector('.status');
    function paint() {
      const alive = el.querySelector('.alive');
      alive.style.left = `${((lo - lo0) / (hi0 - lo0 + 1)) * 100}%`;
      alive.style.width = `${((hi - lo + 1) / (hi0 - lo0 + 1)) * 100}%`;
      el.querySelector('.range-text').innerHTML = ctx.t('guess_range', lo, hi);
    }
    el.querySelector('form').addEventListener('submit', (e) => {
      e.preventDefault();
      if (won) return;
      const g = Number(input.value);
      if (!Number.isInteger(g) || g < lo0 || g > hi0) {
        status.textContent = ctx.t('guess_invalid', lo0, hi0);
        return;
      }
      tries++;
      input.value = '';
      let tag;
      if (g === secret) {
        won = true;
        lo = hi = g;
        tag = 'good';
        status.innerHTML = ctx.t('guess_won', g, tries);
        input.disabled = true;
        ctx.setReady(true);
        el.querySelector('.range-text').hidden = true;
      } else if (g < secret) {
        lo = Math.max(lo, g + 1);
        tag = 'up';
        status.innerHTML = ctx.t('guess_higher', g);
      } else {
        hi = Math.min(hi, g - 1);
        tag = 'down';
        status.innerHTML = ctx.t('guess_lower', g);
      }
      el.querySelector('.history').insertAdjacentHTML('beforeend', `<span class="h-chip ${tag}">${g}${tag === 'up' ? ' ⬆' : tag === 'down' ? ' ⬇' : ' ✓'}</span>`);
      paint();
      if (!won) input.focus();
    });
    paint();
    return { el };
  }

  // ─────────────── Búsqueda binaria a mano ───────────────
  function bsearch(step, ctx) {
    const v = step.values;
    let lo = 0;
    let hi = v.length - 1;
    let looks = 0;
    let done = false;
    const el = h(`<div class="w-bsearch"><p class="lohi"></p><div class="arrbox"></div><p class="status" aria-live="polite"></p></div>`);
    const status = el.querySelector('.status');
    const arr = arrayView(v, {
      onTap: (i) => {
        if (done || i < lo || i > hi) return;
        const mid = Math.floor((lo + hi) / 2);
        if (i !== mid) {
          status.innerHTML = ctx.t('bs_not_mid', lo, hi, mid);
          return;
        }
        looks++;
        arr.set(i, 'seen');
        if (v[i] === step.target) {
          done = true;
          arr.set(i, 'good');
          status.innerHTML = ctx.t('bs_found', step.target, looks, v.length);
          ctx.setReady(true);
        } else if (v[i] < step.target) {
          status.innerHTML = ctx.t('bs_go_right', v[i], step.target);
          lo = mid + 1;
        } else {
          status.innerHTML = ctx.t('bs_go_left', v[i], step.target);
          hi = mid - 1;
        }
        paint();
      },
    });
    el.querySelector('.arrbox').appendChild(arr.el);
    function paint() {
      arr.cells.forEach((c, i) => c.classList.toggle('dim', i < lo || i > hi));
      el.querySelector('.lohi').innerHTML = done
        ? ''
        : `<code>lo = ${lo}</code> · <code>hi = ${hi}</code> · <span class="muted">${ctx.t('bs_looks', looks)}</span>`;
    }
    paint();
    status.innerHTML = ctx.t('bs_start', step.target);
    return { el };
  }

  // ─────────────── Dos punteros ───────────────
  function pointers(step, ctx) {
    const v = step.values;
    let L;
    let R;
    let moves;
    let done;
    const el = h(`<div class="w-pointers">
      <div class="arrbox"></div>
      <p class="sum" aria-live="polite"></p>
      <div class="ptr-actions">
        <button type="button" class="btn ghost" data-m="L">L →</button>
        <button type="button" class="btn ghost" data-m="R">← R</button>
        <button type="button" class="btn ghost" data-m="reset">↺ ${ctx.t('reset')}</button>
      </div>
      <p class="status"></p>
    </div>`);
    const arr = arrayView(v);
    el.querySelector('.arrbox').appendChild(arr.el);
    function reset() {
      L = 0;
      R = v.length - 1;
      moves = 0;
      done = false;
      el.querySelector('.status').innerHTML = '';
      paint();
    }
    function paint() {
      arr.cells.forEach((c, i) => {
        c.classList.toggle('ptr-l', i === L);
        c.classList.toggle('ptr-r', i === R);
        c.classList.toggle('dim', i < L || i > R);
        c.classList.remove('good');
      });
      const s = v[L] + v[R];
      const cmp = s === step.target ? '=' : s < step.target ? '<' : '>';
      el.querySelector('.sum').innerHTML =
        L < R ? `<code>${v[L]} + ${v[R]} = <b>${s}</b></code> <span class="cmp">${cmp} ${step.target}</span>` : '';
      if (L < R && s === step.target) {
        done = true;
        arr.set(L, 'good');
        arr.set(R, 'good');
        el.querySelector('.status').innerHTML = ctx.t('ptr_found', moves);
        ctx.setReady(true);
      } else if (L >= R) {
        el.querySelector('.status').innerHTML = ctx.t('ptr_crossed');
      }
      el.querySelector('[data-m="L"]').disabled = done || L >= R;
      el.querySelector('[data-m="R"]').disabled = done || L >= R;
    }
    el.querySelectorAll('[data-m]').forEach((b) =>
      b.addEventListener('click', () => {
        const m = b.dataset.m;
        if (m === 'reset') return reset();
        if (done) return;
        moves++;
        if (m === 'L') L++;
        else R--;
        paint();
      })
    );
    reset();
    return { el };
  }

  // ─────────────── Escribir código (las pruebas corren en tu navegador) ───────────────
  function code(step, ctx) {
    const el = h(`<div class="w-code">
      <div class="editor-host"></div>
      <div class="code-actions"><button type="button" class="btn ghost run">▶ ${ctx.t('run')}</button><span class="run-status"></span></div>
      <p class="label">${ctx.t('tests')}</p>
      <ul class="tests">${step.tests
        .map((tc) => `<li><code>${esc(callText(step.fnName, tc.args, tc.label, ctx.tx))}</code> <span class="arrow">→</span> <code>${esc(show(tc.expect))}</code><span class="got"></span></li>`)
        .join('')}</ul>
      <div class="logs" hidden><p class="label">console.log</p><pre class="out"></pre></div>
      <div class="solution" hidden><p class="label">${ctx.t('solution')}</p>${codeBlock(step.solution || '')}</div>
    </div>`);
    const ed = window.Editor.mount(el.querySelector('.editor-host'), {
      value: step.starter || '',
      onRun: () => runTests(),
      onSave: () => {},
    });
    const items = [...el.querySelectorAll('.tests li')];
    const runBtn = el.querySelector('.run');
    const runStatus = el.querySelector('.run-status');

    async function runTests() {
      runBtn.disabled = true;
      runStatus.textContent = ctx.t('running');
      const r = await window.Runner.run(ed.value, step.fnName, step.tests, 2000, step.wrap || '');
      runBtn.disabled = false;
      const logs = el.querySelector('.logs');
      logs.hidden = !(r.logs && r.logs.length);
      if (r.logs) logs.querySelector('.out').textContent = r.logs.slice(0, 50).join('\n');
      items.forEach((li) => {
        li.className = '';
        li.querySelector('.got').textContent = '';
      });
      if (r.error) {
        const msg = r.error === 'timeout' ? ctx.t('err_timeout') : r.error === 'nofn' ? ctx.t('err_nofn', step.fnName) : ctx.t('err_syntax', r.detail || '');
        runStatus.textContent = msg;
        return { ok: false, msg: esc(msg) };
      }
      let firstBad = null;
      r.results.forEach((res, i) => {
        items[i].className = res.ok ? 'ok' : 'ko';
        if (!res.ok) {
          items[i].querySelector('.got').textContent = `  ${ctx.t('got')} ${res.got}`;
          if (firstBad === null) firstBad = i;
        }
      });
      const passed = r.results.filter((x) => x.ok).length;
      runStatus.textContent = ctx.t('tests_passed', passed, r.results.length);
      if (passed === r.results.length) return { ok: true };
      const tc = step.tests[firstBad];
      return {
        ok: false,
        msg: `${ctx.t('tests_passed', passed, r.results.length)}<br><code>${esc(callText(step.fnName, tc.args, tc.label, ctx.tx))}</code> ${ctx.t('should_be')} <code>${esc(
          show(tc.expect)
        )}</code>, ${ctx.t('got')} <code>${esc(r.results[firstBad].got)}</code>.${step.hint ? `<br>${ctx.tx(step.hint)}` : ''}`,
      };
    }
    runBtn.addEventListener('click', runTests);
    ctx.setReady(true);
    return {
      el,
      check: runTests,
      reveal() {
        el.querySelector('.solution').hidden = false;
      },
      retryable: true,
    };
  }

  // ─────────────── Clasificar: cada valor a su caja ───────────────
  function classify(step, ctx) {
    const picked = step.items.map(() => null);
    let locked = false;
    const el = h(`<div class="w-classify"></div>`);
    const rows = step.items.map((it, i) => {
      const row = h(`<div class="cls-row"><div class="cls-label">${ctx.tx(it.label)}</div><div class="cls-bins"></div></div>`);
      const box = row.querySelector('.cls-bins');
      step.bins.forEach((b, j) => {
        const btn = h(`<button type="button" class="cls-bin">${ctx.tx(b)}</button>`);
        btn.addEventListener('click', () => {
          if (locked) return;
          picked[i] = j;
          box.querySelectorAll('.cls-bin').forEach((x, k) => x.classList.toggle('on', k === j));
          rows.forEach((r) => r.classList.remove('good', 'bad'));
          ctx.setReady(picked.every((x) => x !== null));
        });
        box.appendChild(btn);
      });
      el.appendChild(row);
      return row;
    });
    const wrong = () => step.items.filter((it, i) => picked[i] !== it.bin).length;
    return {
      el,
      check: () => ({
        ok: wrong() === 0,
        msg: ctx.t('classify_wrong', wrong()),
      }),
      feedback(ok) {
        rows.forEach((r, i) => r.classList.add(picked[i] === step.items[i].bin ? 'good' : 'bad'));
        if (ok) locked = true;
      },
      reveal() {
        locked = true;
        rows.forEach((r, i) => {
          picked[i] = step.items[i].bin;
          r.querySelectorAll('.cls-bin').forEach((x, k) => x.classList.toggle('on', k === picked[i]));
          r.classList.remove('bad');
          r.classList.add('good');
        });
      },
    };
  }

  window.Widgets = { read, choice, tap, number, fill, order, trace, search, growth, halving, guess, bsearch, pointers, code, classify };
})();
