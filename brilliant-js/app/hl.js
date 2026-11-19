// Resaltado de sintaxis mínimo para JavaScript (sin dependencias).
(function () {
  'use strict';
  const KW = new Set(
    'const let var function return if else for while do break continue new typeof instanceof of in true false null undefined class this switch case default throw try catch finally async await'.split(' ')
  );
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

  function hl(src) {
    const re = /(\/\/[^\n]*)|('(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*"|`(?:\\.|[^`\\])*`)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_$][\w$]*)/g;
    let out = '';
    let last = 0;
    let m;
    while ((m = re.exec(src))) {
      out += esc(src.slice(last, m.index));
      const tok = m[0];
      if (m[1]) out += `<span class="c">${esc(tok)}</span>`;
      else if (m[2]) out += `<span class="s">${esc(tok)}</span>`;
      else if (m[3]) out += `<span class="n">${tok}</span>`;
      else out += KW.has(tok) ? `<span class="k">${tok}</span>` : esc(tok);
      last = re.lastIndex;
    }
    return out + esc(src.slice(last));
  }

  window.Viz = { hl, esc };
})();
