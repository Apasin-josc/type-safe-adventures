// Visualizador paso a paso: código a la izquierda, paneles (stack, colas, memoria) a la derecha.
(function () {
  'use strict';

  const esc = (s) =>
    String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

  const TOKEN =
    /(\/\*[\s\S]*?(?:\*\/|$)|\/\/[^\n]*)|("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\.)*`?)|\b(const|let|var|function|return|if|else|for|while|of|in|new|class|extends|super|this|typeof|instanceof|async|await|throw|try|catch|static|null|undefined|true|false|NaN)\b|\b(\d+(?:\.\d+)?n?)\b/g;

  /** Resaltado de sintaxis mínimo para JS. Devuelve HTML seguro. */
  function hl(code) {
    let out = '';
    let last = 0;
    let m;
    TOKEN.lastIndex = 0;
    while ((m = TOKEN.exec(code))) {
      out += esc(code.slice(last, m.index));
      const cls = m[1] ? 'c' : m[2] ? 's' : m[3] ? 'k' : 'n';
      out += `<span class="t-${cls}">${esc(m[0])}</span>`;
      last = TOKEN.lastIndex;
    }
    return out + esc(code.slice(last));
  }

  function mount(el, spec) {
    const t = window.I18n ? window.I18n.t : (k) => k;
    const lines = spec.code.split('\n');
    let i = 0;
    let timer = null;

    el.classList.add('viz');
    el.innerHTML = `
      <div class="viz-main">
        <pre class="viz-code">${lines
          .map((l, n) => `<div class="viz-line" data-n="${n + 1}"><span class="ln">${n + 1}</span><span>${hl(l) || ' '}</span></div>`)
          .join('')}</pre>
        <div class="viz-panels">${spec.panels
          .map((p) => `<div class="viz-panel"><h5>${esc(p.title)}</h5><div class="viz-items ${p.kind || 'list'}" data-key="${p.key}"></div></div>`)
          .join('')}</div>
      </div>
      <p class="viz-note" aria-live="polite"></p>
      <div class="viz-controls">
        <button type="button" data-act="first" title="${t('viz_reset')}">⏮</button>
        <button type="button" data-act="prev">${t('viz_prev')}</button>
        <span class="viz-count"></span>
        <button type="button" data-act="next" class="primary">${t('viz_next')}</button>
        <button type="button" data-act="play">${t('viz_auto')}</button>
      </div>`;

    const note = el.querySelector('.viz-note');
    const count = el.querySelector('.viz-count');
    const btn = (a) => el.querySelector(`[data-act="${a}"]`);
    const text = (item) => (typeof item === 'string' ? item : item.t);

    function render() {
      const step = spec.steps[i];
      const prev = i > 0 ? spec.steps[i - 1] : { s: {} };
      el.querySelectorAll('.viz-line').forEach((ln) => ln.classList.toggle('on', Number(ln.dataset.n) === step.line));
      for (const p of spec.panels) {
        const box = el.querySelector(`.viz-items[data-key="${p.key}"]`);
        const items = step.s[p.key] || [];
        const before = new Set((prev.s[p.key] || []).map(text));
        box.innerHTML = items.length
          ? items
              .map((item) => {
                const t = text(item);
                const cls = ['chip'];
                if (!before.has(t)) cls.push('new');
                if (item.hl) cls.push('hl');
                if (item.x) cls.push('miss');
                return `<div class="${cls.join(' ')}">${esc(t)}</div>`;
              })
              .join('')
          : `<div class="chip empty">${t('viz_empty')}</div>`;
      }
      note.textContent = step.note;
      count.textContent = `${i + 1} / ${spec.steps.length}`;
      btn('prev').disabled = i === 0;
      btn('first').disabled = i === 0;
      btn('next').disabled = i === spec.steps.length - 1;
    }

    function stop() {
      clearInterval(timer);
      timer = null;
      btn('play').textContent = t('viz_auto');
    }

    el.querySelector('.viz-controls').addEventListener('click', (e) => {
      const act = e.target.dataset.act;
      if (!act) return;
      if (act === 'play') {
        if (timer) return stop();
        if (i === spec.steps.length - 1) i = 0;
        btn('play').textContent = t('viz_pause');
        render();
        timer = setInterval(() => {
          if (i >= spec.steps.length - 1 || !el.isConnected) return stop();
          i++;
          render();
        }, 2200);
        return;
      }
      stop();
      if (act === 'next') i = Math.min(i + 1, spec.steps.length - 1);
      if (act === 'prev') i = Math.max(i - 1, 0);
      if (act === 'first') i = 0;
      render();
    });

    render();
  }

  window.Viz = { mount, hl, esc };
})();
