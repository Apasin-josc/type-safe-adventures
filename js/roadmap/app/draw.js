// Modo dibujo: escribe tu código a mano (dedo, pluma o mouse) y se transcribe a texto.
// La hoja guarda los trazos como listas de puntos, así "deshacer" es quitar el último trazo.
(function () {
  'use strict';

  const INK_WIDTH = 2.6; // grosor del trazo, en pixeles CSS
  const MAX_SIDE = 1568; // lado máximo de la imagen que se manda a leer

  /**
   * Abre la hoja. opts:
   *   t(key, ...args)        textos traducidos
   *   onText(text)           qué hacer con la transcripción
   *   send(dataUrl) → text   manda la imagen a leer (lanza Error con .code si falla)
   *   notice                 mensaje fijo si el modo dibujo no está disponible (deshabilita "leer")
   */
  function open({ t, onText, send, notice = '' }) {
    const sheet = document.createElement('div');
    sheet.className = 'draw-sheet';
    sheet.setAttribute('role', 'dialog');
    sheet.setAttribute('aria-modal', 'true');
    sheet.setAttribute('aria-label', t('draw_title'));
    sheet.innerHTML = `
      <div class="draw-box">
        <div class="draw-bar">
          <strong>${t('draw_title')}</strong>
          <span class="draw-hint">${t('draw_hint')}</span>
          <button type="button" class="btn ghost" data-act="close" aria-label="${t('draw_close')}">✕</button>
        </div>
        <div class="draw-pad"><canvas></canvas></div>
        <p class="draw-msg" role="status"></p>
        <div class="draw-actions">
          <button type="button" class="btn ghost" data-act="undo">↩ ${t('draw_undo')}</button>
          <button type="button" class="btn ghost" data-act="clear">🗑 ${t('draw_clear')}</button>
          <button type="button" class="btn primary" data-act="send">${t('draw_send')}</button>
        </div>
      </div>`;
    document.body.appendChild(sheet);

    const pad = sheet.querySelector('.draw-pad');
    const canvas = sheet.querySelector('canvas');
    const ctx = canvas.getContext('2d');
    const msg = sheet.querySelector('.draw-msg');
    const sendBtn = sheet.querySelector('[data-act="send"]');
    const strokes = []; // cada trazo: [{x, y}, …] en pixeles CSS
    let live = null; // el trazo que se está dibujando
    let penSeen = false; // si usas pluma, ignoramos la palma de la mano
    let busy = false;

    function setMsg(text, bad = false) {
      msg.textContent = text;
      msg.classList.toggle('bad', bad);
    }
    if (notice) {
      setMsg(notice, true);
      sendBtn.disabled = true;
    }

    function drawStroke(c, pts, scale = 1, dx = 0, dy = 0) {
      if (!pts.length) return;
      c.beginPath();
      c.moveTo((pts[0].x - dx) * scale, (pts[0].y - dy) * scale);
      if (pts.length === 1) c.lineTo((pts[0].x - dx) * scale + 0.01, (pts[0].y - dy) * scale); // un punto (el de la i, el ;)
      // Curvas por los puntos medios: el trazo sale suave aunque el dedo vaya rápido.
      for (let i = 1; i < pts.length; i++) {
        const mx = (pts[i - 1].x + pts[i].x) / 2;
        const my = (pts[i - 1].y + pts[i].y) / 2;
        c.quadraticCurveTo((pts[i - 1].x - dx) * scale, (pts[i - 1].y - dy) * scale, (mx - dx) * scale, (my - dy) * scale);
      }
      const last = pts[pts.length - 1];
      c.lineTo((last.x - dx) * scale, (last.y - dy) * scale);
      c.stroke();
    }

    function paint() {
      const dpr = window.devicePixelRatio || 1;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = INK_WIDTH;
      ctx.strokeStyle = getComputedStyle(pad).color;
      for (const s of strokes) drawStroke(ctx, s);
      if (live) drawStroke(ctx, live);
    }

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      const r = pad.getBoundingClientRect();
      canvas.width = Math.round(r.width * dpr);
      canvas.height = Math.round(r.height * dpr);
      paint();
    }

    const point = (e) => {
      const r = canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };

    canvas.addEventListener('pointerdown', (e) => {
      if (busy || (e.pointerType === 'mouse' && e.button !== 0)) return;
      if (e.pointerType === 'pen') penSeen = true;
      if (penSeen && e.pointerType === 'touch') return;
      if (live) return; // un segundo dedo no empieza otro trazo
      e.preventDefault();
      canvas.setPointerCapture(e.pointerId);
      live = [point(e)];
      live.id = e.pointerId;
      paint();
    });
    canvas.addEventListener('pointermove', (e) => {
      if (!live || live.id !== e.pointerId) return;
      const events = e.getCoalescedEvents ? e.getCoalescedEvents() : [];
      for (const ev of events.length ? events : [e]) live.push(point(ev));
      paint();
    });
    function finish(e) {
      if (!live || live.id !== e.pointerId) return;
      strokes.push(live);
      live = null;
      if (!notice) setMsg('');
      paint();
    }
    canvas.addEventListener('pointerup', finish);
    canvas.addEventListener('pointercancel', finish);

    /** La imagen que se manda: tinta negra sobre blanco, recortada a lo que escribiste. */
    function exportPng() {
      let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      for (const s of strokes) {
        for (const p of s) {
          x0 = Math.min(x0, p.x); y0 = Math.min(y0, p.y);
          x1 = Math.max(x1, p.x); y1 = Math.max(y1, p.y);
        }
      }
      const padPx = 24;
      x0 -= padPx; y0 -= padPx; x1 += padPx; y1 += padPx;
      const w = x1 - x0;
      const h = y1 - y0;
      const scale = Math.min(2, MAX_SIDE / Math.max(w, h));
      const out = document.createElement('canvas');
      out.width = Math.max(1, Math.round(w * scale));
      out.height = Math.max(1, Math.round(h * scale));
      const c = out.getContext('2d');
      c.fillStyle = '#fff';
      c.fillRect(0, 0, out.width, out.height);
      c.strokeStyle = '#000';
      c.lineCap = 'round';
      c.lineJoin = 'round';
      c.lineWidth = INK_WIDTH * scale;
      for (const s of strokes) drawStroke(c, s, scale, x0, y0);
      return out.toDataURL('image/png');
    }

    async function submit() {
      if (busy || sendBtn.disabled) return;
      if (!strokes.length) return setMsg(t('draw_empty'), true);
      busy = true;
      sendBtn.disabled = true;
      sendBtn.textContent = t('draw_reading');
      setMsg('');
      try {
        const text = await send(exportPng());
        if (!text.trim()) {
          setMsg(t('draw_err_nothing'), true);
        } else {
          close();
          onText(text);
          return;
        }
      } catch (err) {
        setMsg(t('draw_err_' + (err.code || 'fail')), true);
      }
      busy = false;
      sendBtn.disabled = false;
      sendBtn.textContent = t('draw_send');
    }

    function close() {
      window.removeEventListener('resize', resize);
      document.removeEventListener('keydown', onKey);
      sheet.remove();
    }
    function onKey(e) {
      if (e.key === 'Escape') close();
      else if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        strokes.pop();
        paint();
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') submit();
    }

    sheet.addEventListener('click', (e) => {
      const act = e.target.closest('[data-act]');
      if (!act) return;
      if (act.dataset.act === 'close') close();
      if (busy) return;
      if (act.dataset.act === 'undo') strokes.pop();
      if (act.dataset.act === 'clear') strokes.length = 0;
      if (act.dataset.act === 'send') return submit();
      paint();
    });
    window.addEventListener('resize', resize);
    document.addEventListener('keydown', onKey);
    resize();
    sheet.querySelector('[data-act="close"]').focus();

    return { close };
  }

  window.Draw = { open };
})();
