// Editor de código mínimo, sin dependencias: un <textarea> transparente encima de un <pre>
// resaltado. Ambos usan exactamente la misma fuente y el mismo padding, así que coinciden letra por letra.
(function () {
  'use strict';

  const INDENT = '  ';

  function mount(el, { value = '', onChange = () => {}, onSave = () => {}, onRun = () => {} } = {}) {
    el.classList.add('editor');
    el.innerHTML = `
      <div class="ed-gutter" aria-hidden="true"></div>
      <div class="ed-body">
        <pre class="ed-hl" aria-hidden="true"><code></code></pre>
        <textarea class="ed-input" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off"
          aria-label="Editor de código" wrap="off"></textarea>
      </div>`;
    const ta = el.querySelector('.ed-input');
    const code = el.querySelector('.ed-hl code');
    const pre = el.querySelector('.ed-hl');
    const gutter = el.querySelector('.ed-gutter');
    let lines = 0;
    let touched = false; // ¿ya pusiste el cursor en algún lado?

    function paint() {
      // El \n extra evita que la última línea vacía "brinque" respecto al textarea.
      code.innerHTML = window.Viz.hl(ta.value) + '\n';
      const n = ta.value.split('\n').length;
      if (n !== lines) {
        lines = n;
        gutter.innerHTML = Array.from({ length: n }, (_, i) => `<span>${i + 1}</span>`).join('');
      }
      syncScroll();
    }
    function syncScroll() {
      pre.scrollTop = ta.scrollTop;
      pre.scrollLeft = ta.scrollLeft;
      gutter.scrollTop = ta.scrollTop;
    }

    /** Reemplaza el texto entre start y end y deja el cursor donde digamos (deshacer sigue funcionando). */
    function replace(start, end, text, caretStart, caretEnd = caretStart) {
      ta.setSelectionRange(start, end);
      if (!document.execCommand || !document.execCommand('insertText', false, text)) {
        ta.setRangeText(text, start, end, 'end');
      }
      ta.setSelectionRange(caretStart, caretEnd);
      paint();
      onChange(ta.value);
    }

    const lineStart = (pos) => ta.value.lastIndexOf('\n', pos - 1) + 1;

    ta.addEventListener('keydown', (e) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key === 's') {
        e.preventDefault();
        return onSave();
      }
      if (mod && e.key === 'Enter') {
        e.preventDefault();
        return onRun();
      }
      if (e.key === 'Escape') return ta.blur(); // para poder salir del editor con Tab
      const { selectionStart: s, selectionEnd: end, value } = ta;

      if (e.key === 'Tab') {
        e.preventDefault();
        const from = lineStart(s);
        if (s === end && !e.shiftKey) return replace(s, end, INDENT, s + INDENT.length);
        // Indentar o desindentar todas las líneas seleccionadas.
        const block = value.slice(from, end);
        const out = e.shiftKey
          ? block.replace(/^ {1,2}/gm, '')
          : block.replace(/^/gm, INDENT);
        return replace(from, end, out, from, from + out.length);
      }

      if (e.key === 'Enter' && !mod) {
        e.preventDefault();
        const from = lineStart(s);
        const indent = value.slice(from).match(/^[ \t]*/)[0];
        const before = value[s - 1];
        const after = value[s];
        const opens = before === '{' || before === '[' || before === '(';
        const closes = (before === '{' && after === '}') || (before === '[' && after === ']') || (before === '(' && after === ')');
        if (closes) {
          const text = '\n' + indent + INDENT + '\n' + indent;
          return replace(s, end, text, s + 1 + indent.length + INDENT.length);
        }
        const text = '\n' + indent + (opens ? INDENT : '');
        return replace(s, end, text, s + text.length);
      }

      // Al escribir } en una línea vacía, la desindenta.
      if (e.key === '}' && s === end) {
        const from = lineStart(s);
        const lineSoFar = value.slice(from, s);
        if (/^ +$/.test(lineSoFar) && lineSoFar.length >= INDENT.length) {
          e.preventDefault();
          const text = lineSoFar.slice(INDENT.length) + '}';
          return replace(from, s, text, from + text.length);
        }
      }
    });

    ta.addEventListener('input', () => {
      paint();
      onChange(ta.value);
    });
    ta.addEventListener('scroll', syncScroll);
    ta.addEventListener('focus', () => (touched = true));

    ta.value = value;
    paint();

    return {
      get value() {
        return ta.value;
      },
      set value(v) {
        const pos = ta.selectionStart;
        ta.value = v;
        ta.setSelectionRange(Math.min(pos, v.length), Math.min(pos, v.length));
        paint();
      },
      focus() {
        ta.focus();
      },
      /**
       * Inserta texto (el modo dibujo lo usa). Va donde está tu cursor; si nunca lo pusiste,
       * va justo debajo del comentario "TU CÓDIGO AQUÍ", y si no existe, al final.
       */
      insert(text) {
        let s = ta.selectionStart;
        let e = ta.selectionEnd;
        if (!touched) {
          const m = /^[ \t]*\/\/ *(TU CÓDIGO AQUÍ|YOUR CODE HERE).*$/im.exec(ta.value);
          s = e = m ? m.index + m[0].length : ta.value.length;
        }
        const from = lineStart(s);
        const lineSoFar = ta.value.slice(from, s);
        const indent = lineSoFar.match(/^[ \t]*/)[0];
        text = text.replace(/\n/g, '\n' + indent);
        if (lineSoFar.trim()) text = '\n' + indent + text; // no pegarlo a lo que ya hay en la línea
        ta.setRangeText(text, s, e, 'end');
        touched = true;
        paint();
        onChange(ta.value);
      },
    };
  }

  window.Editor = { mount };
})();
