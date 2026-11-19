// Corre tu código en un Web Worker: si escribes un loop infinito, se corta a los 2 segundos
// y la página sigue viva. El worker se crea desde un Blob, así funciona hasta con doble clic (file://).
(function () {
  'use strict';
  const SRC = `
self.onmessage = (e) => {
  const { code, fnName, tests, wrap } = e.data;
  const logs = [];
  const fmt = (v) => {
    if (v === undefined) return 'undefined';
    try { return JSON.stringify(v); } catch { return String(v); }
  };
  console.log = (...a) => logs.push(a.map((x) => (typeof x === 'string' ? x : fmt(x))).join(' '));
  let fn;
  try {
    fn = new Function(code + '\\n;return typeof ' + fnName + ' === "function" ? ' + fnName + ' : undefined;')();
  } catch (err) {
    self.postMessage({ error: 'syntax', detail: String(err && err.message || err), logs });
    return;
  }
  if (typeof fn !== 'function') {
    self.postMessage({ error: 'nofn', logs });
    return;
  }
  if (wrap) {
    try {
      fn = new Function(code + '\\n;return (' + wrap + ');')();
    } catch (err) {
      self.postMessage({ error: 'syntax', detail: String(err && err.message || err), logs });
      return;
    }
  }
  const results = tests.map((t) => {
    try {
      const got = fn(...structuredClone(t.args));
      return { ok: fmt(got) === fmt(t.expect), got: fmt(got) };
    } catch (err) {
      return { ok: false, got: 'Error: ' + (err && err.message || err) };
    }
  });
  self.postMessage({ results, logs });
};`;
  const url = URL.createObjectURL(new Blob([SRC], { type: 'text/javascript' }));

  /** Resuelve con { results } o { error: 'syntax' | 'nofn' | 'timeout', detail }. Nunca rechaza. */
  function run(code, fnName, tests, ms = 2000, wrap = '') {
    return new Promise((resolve) => {
      const w = new Worker(url);
      const timer = setTimeout(() => {
        w.terminate();
        resolve({ error: 'timeout' });
      }, ms);
      w.onmessage = (e) => {
        clearTimeout(timer);
        w.terminate();
        resolve(e.data);
      };
      w.onerror = (e) => {
        e.preventDefault();
        clearTimeout(timer);
        w.terminate();
        resolve({ error: 'syntax', detail: e.message });
      };
      w.postMessage({ code, fnName, tests, wrap });
    });
  }

  window.Runner = { run };
})();
