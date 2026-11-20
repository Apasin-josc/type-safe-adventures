// SauceCode (web): la app. Pinta el camino de lecciones, reproduce cada lección pantalla por pantalla
// y guarda tu progreso en este navegador.
(function () {
  'use strict';
  const { esc } = window.Viz;
  const COURSES = window.COURSES;
  const Widgets = window.Widgets;
  const app = document.getElementById('app');
  const KEY = 'chispa-progress';

  const T = {
    es: {
      tagline: 'JavaScript con intuición: tocas, pruebas y entiendes.',
      course: 'Curso',
      lessons_done: (a, b) => `${a} de ${b} lecciones`,
      start: 'Empezar',
      review: 'Repasar',
      locked: 'Termina la anterior',
      soon: 'Próximamente',
      unit: 'Unidad',
      lesson: 'Lección',
      screens: 'pantallas',
      soon_badge: 'Pronto',
      pop_soon: 'Esta lección viene pronto. ¡Sigue practicando mientras!',
      pop_locked: (name) => `Termina «${name}» para desbloquearla.`,
      saved_here: 'Tu progreso se guarda en este navegador.',
      streak: (n) => (n === 1 ? '1 día de racha' : `${n} días seguidos`),
      streak_label: 'Racha',
      check: 'Comprobar',
      next: 'Continuar',
      retry: 'Intentar de nuevo',
      see_solution: 'Ver la solución',
      hint_btn: '🐾 Pista',
      hint_choice: 'Olfateé y taché una opción que no es. 🐾',
      hint_tap: 'Taché las casillas que seguro no son. 🐾',
      hint_num: (d, first) => `Te digo un secreto: tiene ${d} cifras y empieza con ${first}. 🐾`,
      hint_num_even: 'Te digo un secreto: es un número par de una sola cifra. 🐾',
      hint_num_odd: 'Te digo un secreto: es un número impar de una sola cifra. 🐾',
      hint_neg: 'Te digo un secreto: es negativo. 🐾',
      hint_fill: 'Puse una ficha en su lugar. ¡Las demás te tocan a ti! 🐾',
      hint_classify: (item, bin) => `${item} va en «${bin}». Las demás te tocan a ti. 🐾`,
      hint_order: 'Acomodé el siguiente bloque. ¡Sigue tú! 🐾',
      hint_none: 'Esta es de dos opciones: si te digo una, te digo la respuesta. ¡Confía en tu instinto! 🐾',
      review_banner: (a, b) => `REPASANDO · PANTALLA ${a} DE ${b}`,
      review_back: 'Volver a donde ibas',
      review_next: 'Siguiente ▶',
      review_prev: 'Pantalla anterior',
      praise: ['¡Exacto!', '¡Bien visto!', '¡Eso es!', '¡Correcto!'],
      wrong: 'No exactamente',
      wrong_generic: 'Revisa tu respuesta y vuelve a intentarlo.',
      reveal_title: 'Mira por qué',
      exit: 'Salir de la lección',
      done_title: 'Lección completada',
      first_try: 'Al primer intento',
      back: 'Volver al camino',
      next_lesson: 'Siguiente lección',
      continue_where: 'Seguir donde ibas',
      course_done: '¡Terminaste el curso! Viene más contenido pronto.',
      answer: 'Tu respuesta',
      your_code: 'Tu código',
      blocks: 'Bloques',
      tap_blocks: 'Toca los bloques de abajo en el orden correcto.',
      order_broken: 'Ese orden ni siquiera corre. Revisa que cada <code>{</code> se cierre después de lo que va dentro.',
      tests_passed: (a, b) => `Pasan ${a} de ${b} pruebas.`,
      prev: 'Atrás',
      step: 'Paso',
      play: 'Ver',
      viz_stack: 'PILA',
      viz_queue: 'COLA',
      viz_empty: '(vacía)',
      viz_front: 'frente',
      viz_result: 'RESULTADO',
      no_vars: 'Todavía no hay variables.',
      search_flips: (n) => `Volteadas: ${n}`,
      search_found: (n, total) => `¡Ahí está! Volteaste <b>${n}</b> de ${total}.`,
      double_n: '×2 duplicar n',
      double_note: (a, b, logPlus, quadX) =>
        `n pasó de ${a} a ${b}: <b>n</b> se duplicó, <b>n²</b> se multiplicó por ${quadX} y <b>log₂ n</b> solo subió ${logPlus}.`,
      halvings: (k, n) => `${k} mitades para ir de ${n} a 1`,
      your_guess: 'Tu intento',
      guess_btn: 'Adivinar',
      guess_range: (lo, hi) => `Todavía puede ser cualquiera entre <b>${lo}</b> y <b>${hi}</b>.`,
      guess_invalid: (lo, hi) => `Escribe un número entero entre ${lo} y ${hi}.`,
      guess_higher: (g) => `<b>${g}</b> es muy bajo: el número es <b>más alto</b> ⬆`,
      guess_lower: (g) => `<b>${g}</b> es muy alto: el número es <b>más bajo</b> ⬇`,
      guess_won: (g, n) => `¡Era <b>${g}</b>! Lo lograste en <b>${n}</b> ${n === 1 ? 'intento' : 'intentos'}.`,
      bs_start: (t) => `Buscas el <b>${t}</b>. Toca el casillero del medio.`,
      bs_not_mid: (lo, hi, mid) => `Ese no es el medio. Con <code>lo = ${lo}</code> y <code>hi = ${hi}</code>, el medio es <code>Math.floor((${lo} + ${hi}) / 2) = ${mid}</code>.`,
      bs_go_right: (v, t) => `${v} es menor que ${t}: todo lo de la izquierda queda descartado.`,
      bs_go_left: (v, t) => `${v} es mayor que ${t}: todo lo de la derecha queda descartado.`,
      bs_found: (t, n, total) => `¡Encontraste el ${t} mirando solo <b>${n}</b> de ${total} casilleros!`,
      bs_looks: (n) => `miradas: ${n}`,
      reset: 'Reiniciar',
      ptr_found: (n) => `¡Pareja encontrada en <b>${n}</b> ${n === 1 ? 'movimiento' : 'movimientos'}!`,
      ptr_crossed: 'Los punteros se cruzaron sin encontrar la pareja: algún movimiento la descartó. Dale a reiniciar y piensa qué suma necesitas antes de mover.',
      run: 'Ejecutar',
      running: 'Corriendo…',
      tests: 'Pruebas',
      got: 'salió',
      should_be: 'debería dar',
      solution: 'Una solución',
      err_timeout: 'Se tardó más de 2 segundos: ¿un loop que nunca termina?',
      err_nofn: (f) => `No encontré la función ${f}. ¿Le cambiaste el nombre?`,
      err_syntax: (d) => `Tu código tiene un error de sintaxis: ${d}`,
      theme: 'Cambiar tema',
      classify_wrong: (n) => `Tienes ${n} mal. Las que están en rojo van en la otra caja.`,
      read_more: 'Para leer más',
    },
    en: {
      tagline: 'JavaScript by intuition: poke at it, test it, get it.',
      course: 'Course',
      lessons_done: (a, b) => `${a} of ${b} lessons`,
      start: 'Start',
      review: 'Review',
      locked: 'Finish the previous one',
      soon: 'Coming soon',
      unit: 'Unit',
      lesson: 'Lesson',
      screens: 'screens',
      soon_badge: 'Soon',
      pop_soon: 'This lesson is coming soon. Keep practicing meanwhile!',
      pop_locked: (name) => `Finish “${name}” to unlock it.`,
      saved_here: 'Your progress is saved in this browser.',
      streak: (n) => `${n}-day streak`,
      streak_label: 'Streak',
      check: 'Check',
      next: 'Continue',
      retry: 'Try again',
      see_solution: 'See the solution',
      hint_btn: '🐾 Hint',
      hint_choice: 'I sniffed out one option that’s wrong and crossed it out. 🐾',
      hint_tap: 'I crossed out the cells that definitely aren’t it. 🐾',
      hint_num: (d, first) => `Here’s a secret: it has ${d} digits and starts with ${first}. 🐾`,
      hint_num_even: 'Here’s a secret: it’s an even, single-digit number. 🐾',
      hint_num_odd: 'Here’s a secret: it’s an odd, single-digit number. 🐾',
      hint_neg: 'Here’s a secret: it’s negative. 🐾',
      hint_fill: 'I put one chip in its place. The rest are up to you! 🐾',
      hint_classify: (item, bin) => `${item} goes in “${bin}”. The rest are up to you. 🐾`,
      hint_order: 'I placed the next block. Your turn! 🐾',
      hint_none: 'This one has two options: if I tell you one, I tell you the answer. Trust your gut! 🐾',
      review_banner: (a, b) => `REVIEWING · SCREEN ${a} OF ${b}`,
      review_back: 'Back to where I was',
      review_next: 'Next ▶',
      review_prev: 'Previous screen',
      praise: ['Exactly!', 'Nice!', 'That’s it!', 'Correct!'],
      wrong: 'Not quite',
      wrong_generic: 'Look at your answer again and give it another go.',
      reveal_title: 'Here’s why',
      exit: 'Leave lesson',
      done_title: 'Lesson complete',
      first_try: 'On the first try',
      back: 'Back to the path',
      next_lesson: 'Next lesson',
      continue_where: 'Pick up where you left off',
      course_done: 'You finished the course! More is coming soon.',
      answer: 'Your answer',
      your_code: 'Your code',
      blocks: 'Blocks',
      tap_blocks: 'Tap the blocks below in the right order.',
      order_broken: 'That order doesn’t even run. Check that every <code>{</code> closes after what goes inside it.',
      tests_passed: (a, b) => `${a} of ${b} tests pass.`,
      prev: 'Back',
      step: 'Step',
      play: 'Play',
      viz_stack: 'STACK',
      viz_queue: 'QUEUE',
      viz_empty: '(empty)',
      viz_front: 'front',
      viz_result: 'RESULT',
      no_vars: 'No variables yet.',
      search_flips: (n) => `Flipped: ${n}`,
      search_found: (n, total) => `There it is! You flipped <b>${n}</b> of ${total}.`,
      double_n: '×2 double n',
      double_note: (a, b, logPlus, quadX) =>
        `n went from ${a} to ${b}: <b>n</b> doubled, <b>n²</b> grew ${quadX}× and <b>log₂ n</b> only went up by ${logPlus}.`,
      halvings: (k, n) => `${k} halvings to get from ${n} down to 1`,
      your_guess: 'Your guess',
      guess_btn: 'Guess',
      guess_range: (lo, hi) => `It could still be anything from <b>${lo}</b> to <b>${hi}</b>.`,
      guess_invalid: (lo, hi) => `Type a whole number from ${lo} to ${hi}.`,
      guess_higher: (g) => `<b>${g}</b> is too low: the number is <b>higher</b> ⬆`,
      guess_lower: (g) => `<b>${g}</b> is too high: the number is <b>lower</b> ⬇`,
      guess_won: (g, n) => `It was <b>${g}</b>! You got it in <b>${n}</b> ${n === 1 ? 'guess' : 'guesses'}.`,
      bs_start: (t) => `You’re looking for <b>${t}</b>. Tap the middle box.`,
      bs_not_mid: (lo, hi, mid) => `That’s not the middle. With <code>lo = ${lo}</code> and <code>hi = ${hi}</code>, the middle is <code>Math.floor((${lo} + ${hi}) / 2) = ${mid}</code>.`,
      bs_go_right: (v, t) => `${v} is less than ${t}: everything on the left is ruled out.`,
      bs_go_left: (v, t) => `${v} is greater than ${t}: everything on the right is ruled out.`,
      bs_found: (t, n, total) => `You found ${t} looking at only <b>${n}</b> of ${total} boxes!`,
      bs_looks: (n) => `looks: ${n}`,
      reset: 'Reset',
      ptr_found: (n) => `Pair found in <b>${n}</b> ${n === 1 ? 'move' : 'moves'}!`,
      ptr_crossed: 'The pointers crossed without finding the pair: one of the moves threw it away. Hit reset and think about which sum you need before moving.',
      run: 'Run',
      running: 'Running…',
      tests: 'Tests',
      got: 'got',
      should_be: 'should return',
      solution: 'One solution',
      err_timeout: 'It took more than 2 seconds: a loop that never ends?',
      err_nofn: (f) => `I couldn’t find the function ${f}. Did you rename it?`,
      err_syntax: (d) => `Your code has a syntax error: ${d}`,
      theme: 'Toggle theme',
      classify_wrong: (n) => `You have ${n} wrong. The red ones belong in the other box.`,
      read_more: 'Read more',
    },
  };

  // ───────────── Progreso ─────────────
  function loadP() {
    let p = null;
    try {
      p = JSON.parse(localStorage.getItem(KEY));
    } catch {}
    p = p && typeof p === 'object' ? p : {};
    return { done: p.done || {}, days: Array.isArray(p.days) ? p.days : [], lang: p.lang, hop: p.hop };
  }
  const P = loadP();
  function saveP() {
    try {
      localStorage.setItem(KEY, JSON.stringify(P));
    } catch {}
  }
  const dayKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  function streak() {
    const set = new Set(P.days);
    const d = new Date();
    if (!set.has(dayKey(d))) d.setDate(d.getDate() - 1);
    let n = 0;
    while (set.has(dayKey(d))) {
      n++;
      d.setDate(d.getDate() - 1);
    }
    return n;
  }

  let lang = P.lang === 'es' || P.lang === 'en' ? P.lang : (navigator.language || 'es').toLowerCase().startsWith('es') ? 'es' : 'en';
  const t = (k, ...a) => {
    const v = T[lang][k] !== undefined ? T[lang][k] : T.es[k];
    return typeof v === 'function' ? v(...a) : v;
  };
  const tx = (v) => (v && typeof v === 'object' && !Array.isArray(v) && 'es' in v ? (v[lang] !== undefined ? v[lang] : v.es) : v);

  // ───────────── Tema e idioma ─────────────
  function setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem('chispa-theme', theme);
    } catch {}
  }

  // Las Salsas animadas que hay en pantalla (se apagan al cambiar de pantalla).
  let live = [];
  function clearSalsas() {
    live.forEach((x) => x.destroy());
    live = [];
  }

  // ───────────── La mascota (vieja chispita, ya no se usa en pantalla) ─────────────
  // Chispa: una chispita con patas. Es un SVG para que se vea nítida en cualquier pantalla.
  function mascotSvg(cls = '') {
    return `<svg class="mascot ${cls}" viewBox="0 0 64 74" aria-hidden="true">
      <ellipse class="m-shadow" cx="32" cy="71" rx="15" ry="3" />
      <ellipse class="m-foot" cx="25" cy="65" rx="5" ry="3.4" />
      <ellipse class="m-foot" cx="39" cy="65" rx="5" ry="3.4" />
      <path class="m-body" d="M32 3 C39 19 45 25 61 32 C45 39 39 45 32 62 C25 45 19 39 3 32 C19 25 25 19 32 3 Z" />
      <path class="m-shine" d="M32 10 C34.5 18 37 21 41 24" />
      <circle class="m-cheek" cx="22.5" cy="37" r="3" />
      <circle class="m-cheek" cx="41.5" cy="37" r="3" />
      <ellipse class="m-eye" cx="27" cy="31" rx="3.1" ry="3.9" />
      <ellipse class="m-eye" cx="37" cy="31" rx="3.1" ry="3.9" />
      <circle class="m-glint" cx="28.1" cy="29.6" r="1.1" />
      <circle class="m-glint" cx="38.1" cy="29.6" r="1.1" />
      <path class="m-smile" d="M28.5 38.5 Q32 41.5 35.5 38.5" />
    </svg>`;
  }

  // ───────────── Camino de lecciones ─────────────
  function renderHome({ focus = true } = {}) {
    clearSalsas();
    document.body.classList.remove('in-lesson');
    document.documentElement.lang = lang;
    const st = streak();
    app.innerHTML = `
      <header class="bar">
        <a class="logo" href="#/">Sauce<span class="spark">Code</span></a>
        <span class="streak ${st ? 'on' : ''}" title="${esc(t('streak', st))}">🔥 ${st}</span>
        <button type="button" class="lang" aria-label="ES / EN"><span class="${lang === 'es' ? 'on' : ''}">ES</span><span class="${lang === 'en' ? 'on' : ''}">EN</span></button>
        <button type="button" class="theme" aria-label="${t('theme')}">${document.documentElement.dataset.theme === 'dark' ? '☀️' : '🌙'}</button>
      </header>
      <main class="home">
        ${COURSES.map((c) => [...Array(unitCount(c)).keys()].map((u) => renderUnit(c, u)).join('')).join('')}
        <p class="foot">${t('saved_here')}</p>
      </main>`;
    app.querySelector('.lang').addEventListener('click', () => {
      lang = lang === 'es' ? 'en' : 'es';
      P.lang = lang;
      saveP();
      renderHome({ focus: false });
    });
    app.querySelector('.theme').addEventListener('click', () => {
      setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
      renderHome({ focus: false });
    });
    layoutMap.focused = false;
    app.querySelectorAll('.map').forEach((el) => layoutMap(COURSES.find((c) => c.id === el.dataset.course), el, { focus }));
  }

  const unitCount = (c) => Math.max(1, ...c.lessons.map((l) => (l.unit || 0) + 1));
  const unitOf = (l) => l.unit || 0;

  function renderUnit(c, n) {
    const mine = c.lessons.filter((l) => unitOf(l) === n);
    const doneCount = mine.filter((l) => P.done[`${c.id}/${l.id}`]).length;
    const unitName = c.units ? c.units[n] : n === 0 ? c.unit : null;
    return `<section class="unit">
      <div class="unit-banner"${c.colors ? ` style="background:linear-gradient(135deg, ${c.colors[0]}, ${c.colors[1]});box-shadow:0 5px 0 ${c.colors[2]}"` : ''}>
        <p class="unit-kicker">${t('unit')} ${n + 1}${unitName ? ` · ${tx(unitName)}` : ''}</p>
        <h1>${tx(c.title)}</h1>
        <div class="unit-progress"><div class="progress"><i style="width:${(doneCount / mine.length) * 100}%"></i></div><span>${doneCount}/${mine.length}</span></div>
      </div>
      ${n === 0 ? `<p class="blurb">${tx(c.blurb)}</p>` : ''}
      <div class="map" data-course="${c.id}" data-unit="${n}"></div>
    </section>`;
  }

  const mapListeners = {}; // para no acumular listeners al repintar
  const GAP = 132; // distancia vertical entre paradas
  const TOP = 120;

  /** Dibuja el camino: necesita el ancho real de la pantalla, por eso se arma ya insertado. */
  function layoutMap(c, el, { focus = false } = {}) {
    const unit = Number(el.dataset.unit || 0);
    const last = unit === unitCount(c) - 1;
    const mine = c.lessons.map((l, i) => i).filter((i) => unitOf(c.lessons[i]) === unit);
    const items = [
      ...mine.map((i) => {
        const l = c.lessons[i];
        const key = `${c.id}/${l.id}`;
        const done = Boolean(P.done[key]);
        const open = i === 0 || Boolean(P.done[`${c.id}/${c.lessons[i - 1].id}`]);
        return { kind: 'lesson', l, i, done, open, state: done ? 'done' : open ? 'open' : 'locked' };
      }),
      ...(last ? c.soon || [] : []).map((s) => ({ kind: 'soon', s, state: 'soon' })),
    ];
    const firstOpen = c.lessons.findIndex((l) => !P.done[`${c.id}/${l.id}`]);
    const hereGlobal = firstOpen === -1 ? c.lessons.length - 1 : firstOpen;
    // Salsa solo se para en el tramo de su unidad; los índices de aquí son locales.
    const here = mine.indexOf(hereGlobal);
    const unitDone = mine.every((i) => P.done[`${c.id}/${c.lessons[i].id}`]);
    const roadUpTo = here >= 0 ? here : unitDone ? mine.length - 1 : 0;
    const W = el.clientWidth;
    const amp = Math.min(92, W * 0.24);
    const pos = items.map((_, i) => ({ x: Math.round(W / 2 + Math.sin(i * 1.1) * amp), y: TOP + i * GAP }));
    const H = pos[pos.length - 1].y + 90;
    el.style.height = `${H}px`;

    const pathThrough = (pts) =>
      pts.length < 2
        ? ''
        : `M ${pts[0].x} ${pts[0].y} ` +
          pts
            .slice(1)
            .map((p, k) => `C ${pts[k].x} ${pts[k].y + GAP * 0.55} ${p.x} ${p.y - GAP * 0.55} ${p.x} ${p.y}`)
            .join(' ');

    const nodes = items
      .map((it, i) => {
        const p = pos[i];
        const current = it.kind === 'lesson' && it.i === hereGlobal && firstOpen !== -1;
        const icon = it.kind === 'lesson' ? it.l.icon : it.s.icon;
        const title = it.kind === 'lesson' ? tx(it.l.title) : tx(it.s.title);
        const badge = it.state === 'done' ? '<span class="nb ok">✓</span>' : it.state === 'locked' || it.state === 'soon' ? '<span class="nb lock">🔒</span>' : '';
        const right = p.x < W / 2 + 4; // la etiqueta va del lado con más espacio
        const room = right ? W - p.x - 58 : p.x - 58;
        const sub =
          it.state === 'done'
            ? `✓ ${P.done[`${c.id}/${it.l.id}`].acc}%`
            : it.state === 'soon'
              ? t('soon_badge')
              : current
                ? t('start')
                : '';
        return `<button type="button" class="mnode ${it.state} ${current ? 'current' : ''}" data-i="${i}"
            style="left:${p.x}px;top:${p.y}px" aria-label="${esc(title)}">
            <span class="mn-face" aria-hidden="true">${icon}</span>${badge}</button>
          <div class="mlabel ${right ? 'r' : 'l'} ${it.state}" style="top:${p.y}px;${right ? `left:${p.x + (current ? 64 : 52)}px` : `right:${W - p.x + (current ? 64 : 52)}px`};max-width:${Math.max(90, Math.min(170, room))}px">
            <b>${title}</b>${sub ? `<small>${sub}</small>` : ''}</div>`;
      })
      .join('');

    el.innerHTML = `
      <svg class="road" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" aria-hidden="true">
        <path class="road-base" d="${pathThrough(pos)}" />
        <path class="road-lane" d="${pathThrough(pos)}" />
        <path class="road-done" d="${pathThrough(pos.slice(0, roadUpTo + 1))}" />
      </svg>
      ${nodes}
      ${here >= 0 ? '<div class="mascot-wrap"></div>' : ''}
      <div class="mpop" hidden></div>`;

    // Salsa se para encima de su lección. Si acabas de terminar una, salta a la siguiente.
    const wrap = el.querySelector('.mascot-wrap');
    const SW = 92;
    const salsa = wrap ? window.Salsa.mount(SW) : null;
    if (salsa) {
      wrap.appendChild(salsa.el);
      live.push(salsa);
    }
    const place = (x, y) => {
      if (wrap) wrap.style.transform = `translate(${x - SW / 2}px, ${y - 44 - (SW * window.Salsa.VH) / window.Salsa.VW + 10 - 20}px)`;
    };
    const fromLocal = P.hop && P.hop.course === c.id ? mine.indexOf(P.hop.from) : -1;
    const hop = here >= 0 && fromLocal >= 0 && P.hop.to === hereGlobal ? P.hop : null;
    const target = pos[Math.max(0, here)];
    // Mira hacia la siguiente parada.
    if (salsa && here + 1 < pos.length) salsa.set({ flip: pos[here + 1].x < target.x - 1 });
    if (hop && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const from = pos[fromLocal];
      place(from.x, from.y);
      setTimeout(() => {
        salsa.set({ mood: 'jump', flip: target.x < from.x - 1 });
        const t0 = performance.now();
        const D = 900;
        (function frame(now) {
          const k = Math.min(1, (now - t0) / D);
          const e = k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2;
          place(from.x + (target.x - from.x) * e, from.y + (target.y - from.y) * e - Math.sin(Math.PI * k) * 90);
          if (k < 1) requestAnimationFrame(frame);
          else salsa.set({ mood: 'idle', flip: here + 1 < pos.length ? pos[here + 1].x < target.x - 1 : false });
        })(t0);
      }, 450);
    } else {
      place(target.x, target.y);
    }
    if (P.hop && P.hop.course === c.id) {
      delete P.hop;
      saveP();
    }

    // Solo se centra el primer tramo donde está Salsa (si no, el último en dibujarse ganaría).
    if (focus && here >= 0 && !layoutMap.focused) {
      layoutMap.focused = true;
      const top = el.getBoundingClientRect().top + window.scrollY + target.y - innerHeight / 2;
      window.scrollTo(0, Math.max(0, top));
    }

    // Tocar una parada abre su tarjeta.
    const lk = `${c.id}#${unit}`;
    if (mapListeners[lk]) mapListeners[lk].abort();
    const ac = (mapListeners[lk] = new AbortController());
    const pop = el.querySelector('.mpop');
    let openIdx = null;
    function closePop() {
      pop.hidden = true;
      openIdx = null;
    }
    el.addEventListener('click', (e) => {
      const btn = e.target.closest('.mnode');
      if (!btn) return;
      e.stopPropagation();
      const i = Number(btn.dataset.i);
      if (openIdx === i) return closePop();
      openIdx = i;
      const it = items[i];
      const p = pos[i];
      let html;
      if (it.kind === 'soon') {
        html = `<b>${tx(it.s.title)}</b><p>${t('pop_soon')}</p>`;
      } else {
        const meta = it.done
          ? `${t('first_try')}: <b>${P.done[`${c.id}/${it.l.id}`].acc}%</b>`
          : `${it.l.steps.length} ${t('screens')}`;
        html = `<p class="pop-kicker">${t('lesson')} ${it.i + 1}</p><b>${tx(it.l.title)}</b><p>${tx(it.l.blurb)}</p><p class="pop-meta">${meta}</p>${
          it.open
            ? `<a class="btn primary" href="#/c/${c.id}/${it.l.id}">${it.done ? t('review') : t('start')}</a>`
            : `<p class="pop-lock">🔒 ${t('pop_locked', tx(c.lessons[it.i - 1].title))}</p>`
        }`;
      }
      pop.innerHTML = `<i class="pop-arrow"></i>${html}`;
      pop.hidden = false;
      const w = Math.min(300, W - 16);
      const left = Math.max(8, Math.min(W - w - 8, p.x - w / 2));
      pop.style.width = `${w}px`;
      pop.style.left = `${left}px`;
      pop.style.top = `${p.y + 50}px`;
      pop.querySelector('.pop-arrow').style.left = `${p.x - left - 9}px`;
      const a = pop.querySelector('a');
      if (a) a.focus({ preventScroll: true });
    });
    document.addEventListener(
      'click',
      (e) => {
        if (!pop.hidden && !pop.contains(e.target)) closePop();
      },
      { signal: ac.signal }
    );
    document.addEventListener(
      'keydown',
      (e) => {
        if (e.key === 'Escape') closePop();
      },
      { signal: ac.signal }
    );
  }

  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (!document.body.classList.contains('in-lesson')) {
        app.querySelectorAll('.map').forEach((el) => layoutMap(COURSES.find((c) => c.id === el.dataset.course), el));
      }
    }, 150);
  });

  // ───────────── Una lección, pantalla por pantalla ─────────────
  function playLesson(course, lesson) {
    clearSalsas();
    document.body.classList.add('in-lesson');
    const total = lesson.steps.length;
    let idx = 0;
    let graded = 0;
    let firstTry = 0;
    let attempts = 0;
    let w = null;
    let hinted = false; // con pista, la pantalla ya no cuenta "a la primera"
    let reviewing = null; // índice de la pantalla anterior que estás repasando
    let rw = null; // su widget

    app.innerHTML = `
      <div class="lesson">
        <header class="lesson-bar">
          <a class="close" href="#/" aria-label="${t('exit')}">✕</a>
          <button type="button" class="back" hidden aria-label="${t('review_prev')}" title="${t('review_prev')}">‹</button>
          <div class="steps" role="progressbar" aria-valuemin="0" aria-valuemax="${total}">${lesson.steps.map(() => '<i></i>').join('')}</div>
        </header>
        <main class="stage"></main>
        <footer class="lesson-foot">
          <div class="foot-row live-row"><button type="button" class="btn ghost hint" hidden>${t('hint_btn')}</button><button type="button" class="btn primary go"></button></div>
          <div class="foot-row review-row" hidden><button type="button" class="btn ghost rv-next">${t('review_next')}</button><button type="button" class="btn primary rv-back">${t('review_back')}</button></div>
        </footer>
        <div class="sheet" hidden role="status" aria-live="assertive">
          <div class="sheet-in">
            <p class="sheet-title"></p>
            <div class="sheet-body"></div>
            <div class="sheet-actions"></div>
          </div>
        </div>
      </div>`;
    const stage = app.querySelector('.stage');
    const go = app.querySelector('.go');
    const sheet = app.querySelector('.sheet');
    const bars = [...app.querySelectorAll('.steps i')];
    const hintBtn = app.querySelector('.hint');
    const backBtn = app.querySelector('.back');
    const liveRow = app.querySelector('.live-row');
    const reviewRow = app.querySelector('.review-row');
    let liveEl = null;

    // Flecha de regresar, barras tocables y botones de abajo según dónde estés.
    function nav() {
      const busy = !sheet.hidden;
      backBtn.hidden = busy || (reviewing ?? idx) === 0 || idx >= total;
      bars.forEach((b, i) => {
        b.classList.toggle('rv', i === reviewing);
        b.classList.toggle('tappable', !busy && i < idx);
      });
      liveRow.hidden = reviewing !== null;
      reviewRow.hidden = reviewing === null;
      reviewRow.querySelector('.rv-next').hidden = reviewing === null || reviewing + 1 >= idx;
    }

    function closeReview() {
      if (rw && rw.destroy) rw.destroy();
      rw = null;
      const old = stage.querySelector('.step.review');
      if (old) old.remove();
      if (liveEl) liveEl.hidden = false;
      reviewing = null;
      nav();
    }

    /** Repasar una pantalla que ya pasaste, con la respuesta a la vista. La actual se queda tal cual. */
    function openReview(i) {
      if (i < 0 || i >= idx || !sheet.hidden) return;
      closeReview();
      const step = lesson.steps[i];
      const div = document.createElement('div');
      div.className = 'step review';
      div.innerHTML = `<p class="review-banner">${t('review_banner', i + 1, total)}</p>
        ${step.title ? `<h2>${tx(step.title)}</h2>` : ''}
        ${step.prompt ? `<div class="prompt">${tx(step.prompt)}</div>` : ''}`;
      rw = Widgets[step.type](step, { t, tx, setReady() {}, submit() {} });
      div.appendChild(rw.el);
      if (rw.reveal) rw.reveal();
      liveEl.hidden = true;
      stage.appendChild(div);
      reviewing = i;
      nav();
      window.scrollTo(0, 0);
    }

    /** Salsa trae una pista: tacha una opción, acomoda una pieza o te da una idea. */
    function useHint() {
      const msg = w.sniff ? w.sniff() : null;
      hinted = msg !== null;
      hintBtn.hidden = true;
      const bubble = document.createElement('div');
      bubble.className = 'hint-bubble';
      bubble.innerHTML = `<div class="hb-salsa"></div><div class="hb-text">${msg || t('hint_none')}</div>`;
      const pup = window.Salsa.mount(62);
      bubble.querySelector('.hb-salsa').appendChild(pup.el);
      live.push(pup);
      liveEl.appendChild(bubble);
      bubble.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    hintBtn.addEventListener('click', useHint);
    backBtn.addEventListener('click', () => openReview((reviewing ?? idx) - 1));
    reviewRow.querySelector('.rv-next').addEventListener('click', () => openReview(reviewing + 1));
    reviewRow.querySelector('.rv-back').addEventListener('click', closeReview);
    bars.forEach((b, i) =>
      b.addEventListener('click', () => {
        if (i < idx) openReview(i);
        else if (i === idx && reviewing !== null) closeReview();
      })
    );

    const ctx = {
      t,
      tx,
      setReady(r) {
        if (sheet.hidden) go.disabled = !r;
        ctx.ready = r;
      },
      submit: () => !go.disabled && go.click(),
    };

    function showStep() {
      const step = lesson.steps[idx];
      attempts = 0;
      hinted = false;
      reviewing = null;
      rw = null;
      ctx.ready = false;
      bars.forEach((b, i) => b.classList.toggle('on', i < idx + 1));
      app.querySelector('.steps').setAttribute('aria-valuenow', String(idx + 1));
      stage.innerHTML = `<div class="step">
        ${step.title ? `<h2>${tx(step.title)}</h2>` : ''}
        ${step.prompt ? `<div class="prompt">${tx(step.prompt)}</div>` : ''}
      </div>`;
      go.disabled = true;
      w = Widgets[step.type](step, ctx);
      liveEl = stage.firstElementChild;
      liveEl.appendChild(w.el);
      go.textContent = w.check ? t('check') : t('next');
      hintBtn.hidden = !(w.check && w.sniff);
      nav();
      go.disabled = !ctx.ready;
      stage.scrollTop = 0;
      window.scrollTo(0, 0);
    }

    function openSheet(kind, title, body, actions) {
      sheet.hidden = false;
      sheet.className = `sheet ${kind}`;
      sheet.querySelector('.sheet-title').textContent = title;
      sheet.querySelector('.sheet-body').innerHTML = body || '';
      const box = sheet.querySelector('.sheet-actions');
      box.innerHTML = '';
      actions.forEach(([label, fn, cls]) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = `btn ${cls || 'primary'}`;
        b.textContent = label;
        b.addEventListener('click', fn);
        box.appendChild(b);
      });
      go.hidden = true;
      liveRow.classList.add('sheet-open');
      nav();
      box.lastElementChild.focus();
    }
    function closeSheet() {
      sheet.hidden = true;
      go.hidden = false;
      liveRow.classList.remove('sheet-open');
      go.disabled = !ctx.ready;
      nav();
    }

    function next() {
      closeSheet();
      idx++;
      if (idx >= total) {
        backBtn.hidden = true;
        return finish();
      }
      showStep();
    }

    async function onGo() {
      if (!w.check) return next();
      const step = lesson.steps[idx];
      go.disabled = true;
      const r = await w.check();
      attempts++;
      if (attempts === 1) graded++;
      const explain = tx(step.explain) || '';
      if (r.ok) {
        if (attempts === 1 && !hinted) firstTry++;
        if (w.feedback) w.feedback(true);
        const praise = t('praise');
        return openSheet('good', praise[Math.floor(Math.random() * praise.length)], explain, [[t('next'), next]]);
      }
      if (w.feedback) w.feedback(false);
      const msg = r.msg || tx(step.hint) || t('wrong_generic');
      const retry = [t('retry'), closeSheet, w.retryable ? 'ghost' : 'primary'];
      if (w.retryable) {
        // Código: reintentos sin límite; desde el segundo fallo puedes ver una solución.
        const acts = [retry];
        if (attempts >= 2) {
          acts.push([
            t('see_solution'),
            () => {
              if (w.reveal) w.reveal();
              openSheet('reveal', t('reveal_title'), explain, [[t('next'), next]]);
            },
          ]);
        }
        return openSheet('bad', t('wrong'), msg, acts);
      }
      if (attempts < 2) return openSheet('bad', t('wrong'), msg, [retry]);
      if (w.reveal) w.reveal();
      return openSheet('reveal', t('reveal_title'), `${r.msg ? `<p>${r.msg}</p>` : ''}${explain}`, [[t('next'), next]]);
    }
    go.addEventListener('click', onGo);

    function finish() {
      const acc = graded ? Math.round((firstTry / graded) * 100) : 100;
      const key = `${course.id}/${lesson.id}`;
      const prev = P.done[key];
      P.done[key] = { acc: prev ? Math.max(prev.acc, acc) : acc, at: Date.now() };
      const today = dayKey(new Date());
      if (!P.days.includes(today)) P.days.push(today);
      saveP();
      const i = course.lessons.indexOf(lesson);
      const nextL = course.lessons[i + 1];
      if (nextL && !prev) P.hop = { course: course.id, from: i, to: i + 1 };
      saveP();
      // A dónde seguir: la primera lección sin terminar (si repasabas una vieja, te regresa a donde ibas).
      const goL = course.lessons.find((l) => !P.done[`${course.id}/${l.id}`]);
      const goLabel = goL && course.lessons.indexOf(goL) === i + 1 ? `${t('next_lesson')} →` : goL ? `${t('continue_where')}: ${goL.icon} ${tx(goL.title)} →` : '';
      bars.forEach((b) => b.classList.add('on'));
      app.querySelector('.lesson-foot').hidden = true;
      stage.innerHTML = `<div class="finish">
        <div class="finish-mascot"></div>
        <h2>${t('done_title')}</h2>
        <p class="finish-name">${lesson.icon} ${tx(lesson.title)}</p>
        <div class="stats">
          <div><b>${acc}%</b><span>${t('first_try')}</span></div>
          <div><b>🔥 ${streak()}</b><span>${t('streak_label')}</span></div>
        </div>
        ${goL ? '' : `<p class="prose">${t('course_done')}</p>`}
        ${
          lesson.more && lesson.more.length
            ? `<div class="read-more"><b>📖 ${t('read_more')}</b>${lesson.more
                .map((m) => `<a href="${esc(m.url)}" target="_blank" rel="noopener">${tx(m.title)} <small>${esc(new URL(m.url).host)} ↗</small></a>`)
                .join('')}</div>`
            : ''
        }
        <div class="finish-actions">
          ${goL ? `<a class="btn primary" href="#/c/${course.id}/${goL.id}">${goLabel}</a>` : ''}
          <a class="btn ${goL ? 'ghost' : 'primary'}" href="#/">${t('back')}</a>
        </div>
      </div>`;
      const fest = window.Salsa.celebrate(190);
      stage.querySelector('.finish-mascot').appendChild(fest.el);
      live.push(fest);
    }

    showStep();
  }

  // ───────────── Rutas ─────────────
  function route() {
    const m = location.hash.match(/^#\/c\/([\w-]+)\/([\w-]+)/);
    if (m) {
      const course = COURSES.find((c) => c.id === m[1]);
      const lesson = course && course.lessons.find((l) => l.id === m[2]);
      const i = course ? course.lessons.indexOf(lesson) : -1;
      const open = i === 0 || (i > 0 && P.done[`${course.id}/${course.lessons[i - 1].id}`]);
      if (lesson && open) return playLesson(course, lesson);
      location.hash = '#/';
      return;
    }
    renderHome();
  }

  // El navegador no debe restaurar el scroll por su cuenta: nosotros centramos el camino en tu lección.
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.addEventListener('hashchange', route);
  route();
})();
