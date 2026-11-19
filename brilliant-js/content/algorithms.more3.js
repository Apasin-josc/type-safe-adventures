// Algoritmos con intuición, unidades 5 y 6: listas ligadas, pilas y colas, ordenar, intervalos,
// tries, Union-Find y Dijkstra. Las animaciones ("viz") no se escriben a mano: este archivo corre el
// algoritmo de verdad y guarda cada paso como un cuadro, así lo que ves es justo lo que hace el código.
(function () {
  const c = window.COURSES.find((x) => x.id === 'algos');
  c.units.push({ es: 'Listas, pilas y orden', en: 'Lists, stacks and sorting' }, { es: 'Grafos pro', en: 'Graphs, pro level' });
  const U1 = c.units.length - 2;
  const U2 = c.units.length - 1;
  c.soon = [
    { icon: '🧮', title: { es: 'Manipulación de bits', en: 'Bit manipulation' } },
    { icon: '🧭', title: { es: 'Orden topológico', en: 'Topological sort' } },
  ];
  c.blurb = {
    es: 'De arrays a Dijkstra: dos punteros, hash maps, recursión, árboles, grafos, heaps, DP, listas, pilas, ordenamiento, tries y Union-Find. Con animaciones para ver cada idea.',
    en: 'From arrays to Dijkstra: two pointers, hash maps, recursion, trees, graphs, heaps, DP, lists, stacks, sorting, tries and Union-Find. With animations to see every idea.',
  };

  const T = (es, en) => ({ es, en });
  const nul = (i) => (i < 0 ? 'null' : undefined);
  const clean = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined));

  // ─────────── Cuadros generados ───────────

  /** Voltear una lista ligada: prev, curr, next y las flechas cambiando. */
  function reverseFrames(values) {
    const next = values.map((_, i) => (i + 1 < values.length ? i + 1 : -1));
    const links = () => next.map((b, a) => [a, b]);
    const frames = [];
    let prev = -1;
    let curr = 0;
    const push = (line, extra, note, ptrNext) =>
      frames.push({
        line,
        list: { values, links: links(), ptrs: clean({ prev: prev >= 0 ? prev : undefined, curr: curr >= 0 ? curr : undefined, next: ptrNext >= 0 ? ptrNext : undefined }), ...extra },
        vars: clean({ prev: nul(prev), curr: nul(curr), next: ptrNext === -1 ? 'null' : undefined }),
        note,
      });
    push(2, {}, T('<code>prev</code> empieza en <code>null</code> y <code>curr</code> en la cabeza.', '<code>prev</code> starts at <code>null</code> and <code>curr</code> at the head.'), undefined);
    let first = true;
    while (curr !== -1) {
      const nx = next[curr];
      const nv = nx < 0 ? 'null' : values[nx];
      push(4, {}, first ? T('Guarda el siguiente <b>antes</b> de tocar la flecha, o pierdes el resto de la lista.', 'Save the next node <b>before</b> touching the arrow, or you lose the rest of the list.') : T(`Guarda <code>next</code> = ${nv}.`, `Save <code>next</code> = ${nv}.`), nx);
      next[curr] = prev;
      const pv = next[curr] < 0 ? 'null' : values[next[curr]];
      push(5, { hl: { [curr]: 'cmp' } }, first ? T('Voltea la flecha: ahora apunta hacia atrás.', 'Flip the arrow: now it points backwards.') : T(`Voltea la flecha: ${values[curr]} → ${pv}.`, `Flip the arrow: ${values[curr]} → ${pv}.`), nx);
      prev = curr;
      curr = nx;
      push(7, {}, first ? T('Avanzan los dos: <code>prev</code> al que acabas de voltear y <code>curr</code> al siguiente.', 'Both move forward: <code>prev</code> to the node you just flipped, <code>curr</code> to the next one.') : curr < 0 ? T('<code>curr</code> llegó a <code>null</code>: ya no hay más vagones.', '<code>curr</code> reached <code>null</code>: no more cars.') : T('Avanzan <code>prev</code> y <code>curr</code>.', '<code>prev</code> and <code>curr</code> move forward.'), undefined);
      first = false;
    }
    frames.push({
      line: 9,
      list: { values, links: links(), ptrs: { prev }, hl: Object.fromEntries(values.map((_, i) => [i, 'good'])) },
      note: T('¡Volteada! La nueva cabeza es <code>prev</code>. Una sola pasada: <b>O(n)</b> tiempo y <b>O(1)</b> espacio extra.', 'Flipped! The new head is <code>prev</code>. A single pass: <b>O(n)</b> time and <b>O(1)</b> extra space.'),
    });
    return frames;
  }

  /** Tortuga y liebre en una lista con ciclo. */
  function cycleFrames(values, loopTo) {
    const next = values.map((_, i) => (i + 1 < values.length ? i + 1 : loopTo));
    const links = next.map((b, a) => [a, b]);
    const f = (line, slow, fast, note, hl) => ({ line, list: { values, links, ptrs: { slow, fast }, hl }, note });
    const frames = [f(0, 0, 0, T('La tortuga (<code>slow</code>) avanza 1 y la liebre (<code>fast</code>) avanza 2. Si hay un ciclo, la liebre la alcanza por detrás, como en una pista de carreras.', 'The tortoise (<code>slow</code>) moves 1 and the hare (<code>fast</code>) moves 2. If there’s a cycle, the hare laps it from behind, like on a race track.'))];
    let s = 0;
    let q = 0;
    for (let k = 0; k < 50; k++) {
      s = next[s];
      q = next[next[q]];
      if (s === q) {
        frames.push(f(4, s, q, T(`¡Se encontraron en el ${values[s]}! Hay ciclo. Sin ciclo, la liebre habría llegado a <code>null</code>. <b>O(n)</b> tiempo y <b>O(1)</b> espacio: ni un Set.`, `They met at ${values[s]}! There’s a cycle. Without one, the hare would have reached <code>null</code>. <b>O(n)</b> time and <b>O(1)</b> space: not even a Set.`), { [s]: 'good' }));
        break;
      }
      frames.push(f(3, s, q, T(`<code>slow</code> va en el ${values[s]} y <code>fast</code> en el ${values[q]}.`, `<code>slow</code> is at ${values[s]} and <code>fast</code> at ${values[q]}.`)));
    }
    return frames;
  }

  /** Paréntesis balanceados con una pila. */
  function parensFrames(str) {
    const pairs = { ')': '(', ']': '[', '}': '{' };
    const chars = [...str];
    const stack = [];
    const frames = [];
    const arr = (i, st) => ({ values: chars, indices: false, hl: Object.fromEntries(chars.map((_, j) => [j, j < i ? 'good' : j === i ? st : 'dim'])) });
    frames.push({ line: 1, array: arr(-1), stack: { items: [] }, note: T('Recorremos el texto una vez, con una pila vacía.', 'We walk the text once, with an empty stack.') });
    chars.forEach((ch, i) => {
      if (!pairs[ch]) {
        stack.push(ch);
        frames.push({ line: 3, array: arr(i, 'cur'), stack: { items: stack.slice() }, note: i === 0 ? T(`<code>${ch}</code> abre: a la pila, a esperar a su pareja.`, `<code>${ch}</code> opens: onto the stack, waiting for its partner.`) : T(`<code>${ch}</code> abre: a la pila.`, `<code>${ch}</code> opens: onto the stack.`) });
      } else {
        const top = stack.pop();
        frames.push({ line: 4, array: arr(i, 'cur'), stack: { items: stack.slice() }, note: T(`<code>${ch}</code> cierra: saca el tope (<code>${top}</code>). ¡Son pareja!`, `<code>${ch}</code> closes: pop the top (<code>${top}</code>). They match!`) });
      }
    });
    frames.push({ line: 6, array: arr(chars.length), stack: { items: [] }, note: T('Terminamos con la pila vacía: todo cerró en orden → <code>true</code>. Lo último que abrió es lo primero que cierra: eso es una <b>pila</b>.', 'We ended with an empty stack: everything closed in order → <code>true</code>. The last thing opened is the first to close: that’s a <b>stack</b>.') });
    return frames;
  }

  /** Siguiente mayor con pila monótona. */
  function nextGreaterFrames(nums) {
    const res = nums.map(() => -1);
    const stack = [];
    const frames = [];
    const snap = (line, i, note, extra = {}) =>
      frames.push({
        line,
        array: { values: nums, ptrs: i >= 0 && i < nums.length ? { i } : {}, hl: Object.fromEntries(nums.map((_, j) => [j, res[j] !== -1 ? 'good' : stack.includes(j) ? 'cmp' : j === i ? 'cur' : null]).filter(([, v]) => v)), ...extra },
        stack: { items: stack.map((j) => nums[j]) },
        vars: { res: res.slice() },
        note,
      });
    snap(1, -1, T('Todos empiezan en <code>-1</code> (“nadie mayor”). La pila guarda a los que siguen <b>esperando</b> a alguien mayor.', 'Everyone starts at <code>-1</code> (“no one bigger”). The stack keeps the ones still <b>waiting</b> for someone bigger.'));
    nums.forEach((v, i) => {
      while (stack.length && v > nums[stack.at(-1)]) {
        const j = stack.pop();
        res[j] = v;
        snap(4, i, T(`${v} es mayor que ${nums[j]}: ¡el ${nums[j]} ya encontró a su siguiente mayor! Sale de la pila.`, `${v} is bigger than ${nums[j]}: ${nums[j]} found its next greater! It leaves the stack.`));
      }
      stack.push(i);
      snap(6, i, T(`${v} entra a la pila a esperar a alguien mayor.`, `${v} goes onto the stack to wait for someone bigger.`));
    });
    snap(8, -1, T('Los que se quedaron en la pila nunca encontraron mayor: se quedan en <code>-1</code>. Cada número entra y sale <b>una</b> vez: O(n).', 'The ones left on the stack never found anyone bigger: they stay at <code>-1</code>. Each number goes in and out <b>once</b>: O(n).'));
    return frames;
  }

  /** Merge sort de abajo hacia arriba: pedacitos de 1 que se van juntando. */
  function mergeSortFrames(input) {
    let groups = input.map((x) => [x]);
    const frames = [];
    const flat = () => groups.flat();
    const gapsOf = () => {
      const out = [];
      let n = 0;
      for (const g of groups.slice(0, -1)) out.push((n += g.length) - 1);
      return out;
    };
    frames.push({ bars: { values: flat(), gaps: gapsOf() }, note: T('Primero <b>divide</b> hasta tener pedacitos de 1. Un solo número ya está ordenado.', 'First <b>split</b> until you have pieces of 1. A single number is already sorted.') });
    while (groups.length > 1) {
      const nextGroups = [];
      for (let i = 0; i < groups.length; i += 2) {
        if (i + 1 >= groups.length) {
          nextGroups.push(groups[i]);
          continue;
        }
        const a = groups[i];
        const b = groups[i + 1];
        const m = [...a, ...b].sort((x, y) => x - y);
        nextGroups.push(m);
        const before = nextGroups.reduce((n, g) => n + g.length, 0) - m.length;
        const cur = [...nextGroups, ...groups.slice(i + 2)];
        const vals = cur.flat();
        let n = 0;
        const gaps = [];
        for (const g of cur.slice(0, -1)) gaps.push((n += g.length) - 1);
        frames.push({
          bars: { values: vals, gaps, hl: Object.fromEntries(m.map((_, k) => [before + k, 'good'])) },
          note: T(`Junta [${a.join(', ')}] y [${b.join(', ')}] → [${m.join(', ')}]. Como los dos ya venían ordenados, basta ir tomando el más chico de los dos frentes.`, `Merge [${a.join(', ')}] and [${b.join(', ')}] → [${m.join(', ')}]. Since both were already sorted, just keep taking the smaller of the two fronts.`),
        });
      }
      groups = nextGroups;
    }
    frames.at(-1).note = T('¡Ordenado! Cada nivel recorre los n números y hay log₂ n niveles: <b>O(n log n)</b>, siempre, sin importar cómo venga el array.', 'Sorted! Each level walks all n numbers and there are log₂ n levels: <b>O(n log n)</b>, always, no matter how the array comes in.');
    return frames;
  }

  /** Juntar dos arrays ordenados con dos punteros (el corazón de merge sort). */
  function mergeFrames(a, b) {
    const values = [...a, ...b];
    const out = [];
    let i = 0;
    let j = 0;
    const frames = [];
    const snap = (line, note) =>
      frames.push({
        line,
        bars: {
          values,
          gaps: [a.length - 1],
          ptrs: clean({ i: i < a.length ? i : undefined, j: j < b.length ? a.length + j : undefined }),
          hl: Object.fromEntries(values.map((_, k) => [k, (k < a.length ? k < i : k - a.length < j) ? 'dim' : (k === i || k === a.length + j) ? 'cmp' : null]).filter(([, v]) => v)),
        },
        vars: { out: out.slice() },
        note,
      });
    snap(2, T('Dos mitades ya ordenadas. <code>i</code> mira el frente de la izquierda y <code>j</code> el de la derecha.', 'Two already-sorted halves. <code>i</code> watches the left front and <code>j</code> the right one.'));
    while (i < a.length && j < b.length) {
      if (a[i] <= b[j]) {
        out.push(a[i++]);
        snap(4, T(`${a[i - 1]} ≤ ${b[j]}: el ${a[i - 1]} se va a <code>out</code> y avanza <code>i</code>.`, `${a[i - 1]} ≤ ${b[j]}: ${a[i - 1]} goes to <code>out</code> and <code>i</code> moves.`));
      } else {
        out.push(b[j++]);
        snap(5, T(`${b[j - 1]} &lt; ${a[i]}: el ${b[j - 1]} se va a <code>out</code> y avanza <code>j</code>.`, `${b[j - 1]} &lt; ${a[i]}: ${b[j - 1]} goes to <code>out</code> and <code>j</code> moves.`));
      }
    }
    out.push(...a.slice(i), ...b.slice(j));
    i = a.length;
    j = b.length;
    snap(7, T('Una mitad se acabó: lo que sobra de la otra ya está ordenado, se pega al final. Cada número se mueve una vez: <b>O(n)</b>.', 'One half ran out: what’s left of the other is already sorted, so it goes at the end. Each number moves once: <b>O(n)</b>.'));
    return frames;
  }

  /** Partición de quicksort (Lomuto): el pivote al final. */
  function partitionFrames(input) {
    const arr = input.slice();
    const hi = arr.length - 1;
    const pivot = arr[hi];
    const frames = [];
    let i = 0;
    const snap = (line, j, note, done = false) =>
      frames.push({
        line,
        bars: {
          values: arr.slice(),
          ptrs: clean({ i, j: j >= 0 && j < hi ? j : undefined }),
          hl: Object.fromEntries(
            arr.map((_, k) => [k, done && k === i ? 'good' : k === hi && !done ? 'pivot' : k < i ? 'good' : k === j ? 'cmp' : null]).filter(([, v]) => v)
          ),
        },
        vars: { pivot },
        note,
      });
    snap(1, -1, T(`El pivote es el último: <b>${pivot}</b>. Meta: los menores a la izquierda, los mayores a la derecha.`, `The pivot is the last one: <b>${pivot}</b>. Goal: smaller ones on the left, bigger ones on the right.`));
    for (let j = 0; j < hi; j++) {
      if (arr[j] < pivot) {
        [arr[i], arr[j]] = [arr[j], arr[i]];
        i++;
        snap(4, j, T(`${arr[i - 1]} &lt; ${pivot}: va a la zona de los menores (intercambia con la posición <code>i</code>) y <code>i</code> avanza.`, `${arr[i - 1]} &lt; ${pivot}: it goes to the small zone (swap with position <code>i</code>) and <code>i</code> moves.`));
      } else {
        snap(3, j, T(`${arr[j]} ≥ ${pivot}: se queda donde está.`, `${arr[j]} ≥ ${pivot}: it stays put.`));
      }
    }
    [arr[i], arr[hi]] = [arr[hi], arr[i]];
    snap(8, -1, T(`El pivote va a la posición <code>i</code>: el ${pivot} ya quedó en su lugar <b>final</b>. Ahora se repite lo mismo en cada lado.`, `The pivot goes to position <code>i</code>: ${pivot} is now in its <b>final</b> place. Now repeat on each side.`), true);
    return frames;
  }

  /** Juntar intervalos que se empalman. */
  function intervalFrames(items) {
    const out = [items[0].slice()];
    const frames = [];
    const snap = (line, k, note) => frames.push({ line, intervals: { items, merged: out.map((x) => x.slice()), hl: Object.fromEntries(items.map((_, i) => [i, i === k ? 'cur' : i < k ? 'dim' : null]).filter(([, v]) => v)) }, note });
    snap(1, 0, T(`Ya vienen ordenados por inicio. El primero, [${items[0].join(', ')}], arranca el resultado.`, `They’re already sorted by start. The first one, [${items[0].join(', ')}], starts the result.`));
    for (let k = 1; k < items.length; k++) {
      const [s, e] = items[k];
      const last = out.at(-1);
      if (s <= last[1]) {
        const before = last[1];
        last[1] = Math.max(last[1], e);
        snap(4, k, T(`[${s}, ${e}] empieza en ${s} ≤ ${before}, antes de que acabe el último: se empalman. Estira el final a ${last[1]}.`, `[${s}, ${e}] starts at ${s} ≤ ${before}, before the last one ends: they overlap. Stretch the end to ${last[1]}.`));
      } else {
        out.push([s, e]);
        snap(5, k, T(`[${s}, ${e}] empieza en ${s} > ${last[1]}: hay un hueco. Es un intervalo nuevo.`, `[${s}, ${e}] starts at ${s} > ${last[1]}: there’s a gap. It’s a new interval.`));
      }
    }
    frames.at(-1).note = T(`${frames.at(-1).note.es} Listo: solo comparamos cada uno con <b>el último</b> del resultado. Lo caro fue ordenar: O(n log n).`, `${frames.at(-1).note.en} Done: we only compared each one with <b>the last</b> result. The expensive part was sorting: O(n log n).`);
    return frames;
  }

  /** Dijkstra sencillo (busca el más cercano escaneando), con cada relajación. */
  function dijkstraFrames(graph, start) {
    const dist = { [start]: 0 };
    const done = new Set();
    const frames = [];
    const labels = () => Object.fromEntries(Object.keys(graph).map((n) => [n, n in dist ? String(dist[n]) : '∞']));
    const hl = (cur) => Object.fromEntries(Object.keys(graph).map((n) => [n, done.has(n) ? 'good' : n === cur ? 'cur' : null]).filter(([, v]) => v));
    frames.push({ line: 0, graph: { labels: labels(), hl: hl(start) }, note: T(`${start} está a 0 de sí mismo. Todos los demás empiezan en ∞: todavía no sabemos llegar.`, `${start} is 0 away from itself. Everyone else starts at ∞: we don’t know how to get there yet.`) });
    for (;;) {
      let u = null;
      for (const n of Object.keys(dist)) if (!done.has(n) && (u === null || dist[n] < dist[u])) u = n;
      if (u === null) break;
      done.add(u);
      frames.push({ line: 4, graph: { labels: labels(), hl: hl(u) }, note: T(`De los que faltan, el más cercano es <b>${u}</b> (${dist[u]}). Su distancia ya es <b>final</b>: ningún otro camino puede ser más corto.`, `Of the ones left, the closest is <b>${u}</b> (${dist[u]}). Its distance is now <b>final</b>: no other path can be shorter.`) });
      for (const [v, w] of graph[u]) {
        if (done.has(v)) continue;
        const old = v in dist ? dist[v] : Infinity;
        const cand = dist[u] + w;
        const better = cand < old;
        if (better) dist[v] = cand;
        frames.push({
          line: 7,
          graph: { labels: labels(), hl: { ...hl(u), [v]: better ? 'cmp' : null }, ehl: { [`${u}-${v}`]: better ? 'cmp' : 'bad' } },
          note: better
            ? T(`${u} → ${v}: ${dist[u]} + ${w} = ${cand}, mejor que ${old === Infinity ? '∞' : old}. ${v} ahora vale ${cand}.`, `${u} → ${v}: ${dist[u]} + ${w} = ${cand}, better than ${old === Infinity ? '∞' : old}. ${v} is now ${cand}.`)
            : T(`${u} → ${v}: ${dist[u]} + ${w} = ${cand}, no mejora el ${old}. Se queda igual.`, `${u} → ${v}: ${dist[u]} + ${w} = ${cand}, doesn’t beat ${old}. No change.`),
        });
      }
    }
    frames.push({ line: 10, graph: { labels: labels(), hl: hl(null) }, note: T('¡Listo! Cada número es la distancia más corta desde ' + start + '. Así funciona el GPS de tu cel (con un heap para ir más rápido).', 'Done! Each number is the shortest distance from ' + start + '. That’s how your phone’s GPS works (with a heap to go faster).') });
    return frames;
  }

  // ─────────── Datos de los ejemplos ───────────
  const wg = { A: [['B', 4], ['C', 1]], B: [['D', 1]], C: [['B', 2], ['D', 5], ['E', 8]], D: [['E', 3]], E: [] };
  const wgEdges = Object.entries(wg).flatMap(([a, list]) => list.map(([b, w]) => [a, b, w]));

  const listWrap = (fn) =>
    `(arr) => { let head = null; for (let i = arr.length - 1; i >= 0; i--) head = { val: arr[i], next: head }; const out = []; let n = ${fn}(head); for (let k = 0; n && k < 1000; k++) { out.push(n.val); n = n.next; } return out; }`;

  c.lessons.push(
    // ═══════════════ Listas ligadas ═══════════════
    {
      id: 'linked-lists',
      unit: U1,
      icon: '🚂',
      title: T('Listas ligadas', 'Linked lists'),
      blurb: T('Vagones conectados con flechas', 'Train cars linked by arrows'),
      steps: [
        {
          type: 'read',
          title: T('Vagones de tren', 'Train cars'),
          code: "const c = { val: 9, next: null };\nconst b = { val: 3, next: c };\nconst a = { val: 7, next: b };\n// a → b → c → null",
          body: T(
            '<p>Un array guarda todo junto, en casillas seguidas. Una <b>lista ligada</b> es como un tren: cada vagón (nodo) tiene su valor y una flecha <code>next</code> al siguiente.</p><p>El último apunta a <code>null</code>. Solo conoces la <b>cabeza</b> (el primero); para llegar a los demás, sigues las flechas.</p>',
            '<p>An array keeps everything together, in consecutive slots. A <b>linked list</b> is like a train: each car (node) has its value and a <code>next</code> arrow to the following one.</p><p>The last one points to <code>null</code>. You only know the <b>head</b> (the first); to reach the rest, you follow the arrows.</p>'
          ),
        },
        {
          type: 'viz',
          prompt: T('Mira cómo se recorre: <code>curr</code> salta de flecha en flecha. Dale <b>▶ Ver</b> o ve paso a paso.', 'Watch how it’s walked: <code>curr</code> hops from arrow to arrow. Tap <b>▶ Play</b> or go step by step.'),
          code: 'let curr = head;\nwhile (curr !== null) {\n  console.log(curr.val);\n  curr = curr.next;\n}',
          frames: [
            ...[7, 3, 9, 4].map((v, i, a) => ({
              line: i === 0 ? 0 : 3,
              list: { values: a, ptrs: { curr: i }, hl: { [i]: 'cur' } },
              vars: { log: a.slice(0, i) },
              note: i === 0 ? T('Empezamos en la cabeza.', 'We start at the head.') : i === 3 ? T('Para llegar al 4.º vagón tuvimos que pasar por los 3 anteriores.', 'To reach the 4th car we had to go through the 3 before it.') : T(`Sigue la flecha: ahora <code>curr</code> es el ${v}.`, `Follow the arrow: <code>curr</code> is now ${v}.`),
            })),
            { line: 1, list: { values: [7, 3, 9, 4] }, vars: { log: [7, 3, 9, 4], curr: 'null' }, note: T('<code>curr</code> llegó a <code>null</code>: se acabó. No hay <code>lista[3]</code> instantáneo como en un array: llegar al k-ésimo cuesta <b>O(n)</b>.', '<code>curr</code> reached <code>null</code>: done. There’s no instant <code>list[3]</code> like in an array: reaching the k-th costs <b>O(n)</b>.') },
          ],
        },
        {
          type: 'choice',
          prompt: T('Entonces, ¿qué hace <b>mejor</b> una lista ligada que un array?', 'So what does a linked list do <b>better</b> than an array?'),
          options: [
            T('Leer el elemento en la posición k', 'Read the element at position k'),
            T('Meter un elemento al <b>principio</b>', 'Insert an element at the <b>start</b>'),
            T('Búsqueda binaria', 'Binary search'),
          ],
          answer: 1,
          why: {
            0: T('Al revés: el array lo hace en O(1); la lista tiene que caminar k flechas.', 'The other way around: the array does it in O(1); the list has to walk k arrows.'),
            2: T('La búsqueda binaria necesita saltar a la mitad en O(1), y la lista no puede.', 'Binary search needs to jump to the middle in O(1), and a list can’t.'),
          },
          explain: T(
            'Con <code>unshift</code> el array recorre a <b>todos</b> una casilla: O(n). La lista solo crea un nodo que apunta a la cabeza vieja: <code>{ val, next: head }</code>, O(1).',
            'With <code>unshift</code> the array shifts <b>everyone</b> one slot: O(n). The list just creates a node pointing to the old head: <code>{ val, next: head }</code>, O(1).'
          ),
        },
        {
          type: 'viz',
          prompt: T('El clásico de entrevista: <b>voltear una lista</b>. Fíjate cómo cada flecha se da la vuelta.', 'The interview classic: <b>reverse a list</b>. Watch each arrow turn around.'),
          code: 'function reverseList(head) {\n  let prev = null;\n  let curr = head;\n  while (curr !== null) {\n    const next = curr.next;\n    curr.next = prev;\n    prev = curr;\n    curr = next;\n  }\n  return prev;\n}',
          frames: reverseFrames([1, 2, 3, 4]),
        },
        {
          type: 'choice',
          prompt: T('¿Por qué guardamos <code>next</code> <b>antes</b> de hacer <code>curr.next = prev</code>?', 'Why do we save <code>next</code> <b>before</b> doing <code>curr.next = prev</code>?'),
          options: [
            T('Porque al voltear la flecha perdemos el camino al resto de la lista', 'Because flipping the arrow loses the path to the rest of the list'),
            T('Para ahorrar memoria', 'To save memory'),
            T('Porque JavaScript no deja cambiar <code>next</code> dos veces', 'Because JavaScript won’t let you change <code>next</code> twice'),
          ],
          answer: 0,
          explain: T('La flecha era el único camino al siguiente vagón. Si la volteas sin guardarlo, el resto del tren queda perdido en memoria.', 'The arrow was the only path to the next car. If you flip it without saving it, the rest of the train is lost in memory.'),
        },
        {
          type: 'viz',
          prompt: T('¿Y si la lista tiene un <b>ciclo</b>? Truco de tortuga y liebre (algoritmo de Floyd).', 'What if the list has a <b>cycle</b>? The tortoise and hare trick (Floyd’s algorithm).'),
          code: 'let slow = head, fast = head;\nwhile (fast && fast.next) {\n  slow = slow.next;\n  fast = fast.next.next;\n  if (slow === fast) return true;\n}\nreturn false;',
          frames: cycleFrames([1, 2, 3, 4, 5, 6], 2),
        },
        {
          type: 'code',
          prompt: T(
            'Ahora tú: escribe <code>reverseList(head)</code>. Cada nodo es <code>{ val, next }</code>; regresa la nueva cabeza. (Las pruebas arman la lista desde un array y la leen de regreso.)',
            'Your turn: write <code>reverseList(head)</code>. Each node is <code>{ val, next }</code>; return the new head. (The tests build the list from an array and read it back.)'
          ),
          fnName: 'reverseList',
          wrap: listWrap('reverseList'),
          starter: 'function reverseList(head) {\n  let prev = null;\n  let curr = head;\n  \n  return prev;\n}\n',
          tests: [
            { args: [[1, 2, 3, 4]], expect: [4, 3, 2, 1], label: 'reverseList(1 → 2 → 3 → 4)' },
            { args: [[5, 9]], expect: [9, 5], label: 'reverseList(5 → 9)' },
            { args: [[1]], expect: [1], label: 'reverseList(1)' },
            { args: [[]], expect: [], label: 'reverseList(null)' },
          ],
          hint: T('Un <code>while (curr !== null)</code> con cuatro líneas: guarda <code>next</code>, voltea <code>curr.next</code> hacia <code>prev</code>, y avanza <code>prev</code> y <code>curr</code>.', 'A <code>while (curr !== null)</code> with four lines: save <code>next</code>, flip <code>curr.next</code> to <code>prev</code>, then move <code>prev</code> and <code>curr</code>.'),
          solution: 'function reverseList(head) {\n  let prev = null;\n  let curr = head;\n  while (curr !== null) {\n    const next = curr.next;\n    curr.next = prev;\n    prev = curr;\n    curr = next;\n  }\n  return prev;\n}',
          complexity: { time: 'O(n)', space: 'O(1)' },
          explain: T('Una pasada y solo tres variables: O(n) tiempo, O(1) espacio. Sale muchísimo en entrevistas, y también la versión recursiva.', 'One pass and just three variables: O(n) time, O(1) space. It comes up a lot in interviews, and so does the recursive version.'),
        },
      ],
    },

    // ═══════════════ Pilas y colas ═══════════════
    {
      id: 'stacks-queues',
      unit: U1,
      icon: '🥞',
      title: T('Pilas y colas', 'Stacks and queues'),
      blurb: T('El último en llegar vs. el primero en la fila', 'Last one in vs. first in line'),
      steps: [
        {
          type: 'read',
          title: T('Hotcakes y tortillería', 'Pancakes and a checkout line'),
          code: "const stack = [];\nstack.push('a');\nstack.push('b');\nstack.pop(); // 'b': el último que entró\n\nconst queue = [];\nqueue.push('a');\nqueue.push('b');\nqueue.shift(); // 'a': el primero que llegó",
          body: T(
            '<p>Una <b>pila</b> (stack) es como una torre de hotcakes: pones arriba y sacas de arriba. El último que entra es el primero que sale (LIFO).</p><p>Una <b>cola</b> (queue) es la fila de la tortillería: llegas al final y atienden al del frente. El primero que llega es el primero que sale (FIFO).</p><p>En JS los dos son arrays. Ojo: <code>shift()</code> recorre a todos (O(n)); en colas grandes se usa un índice para el frente.</p>',
            '<p>A <b>stack</b> is like a pile of pancakes: you add on top and take from the top. Last in, first out (LIFO).</p><p>A <b>queue</b> is a checkout line: you join at the back and the front gets served. First in, first out (FIFO).</p><p>In JS both are arrays. Careful: <code>shift()</code> moves everyone (O(n)); for big queues you keep an index for the front.</p>'
          ),
        },
        {
          type: 'classify',
          prompt: T('¿Pila o cola?', 'Stack or queue?'),
          bins: [T('Pila 🥞', 'Stack 🥞'), T('Cola 🧍🧍🧍', 'Queue 🧍🧍🧍')],
          items: [
            { label: T('Ctrl+Z (deshacer)', 'Ctrl+Z (undo)'), bin: 0 },
            { label: T('Imprimir documentos en orden de llegada', 'Printing documents in arrival order'), bin: 1 },
            { label: T('El botón “Atrás” del navegador', 'The browser’s “Back” button'), bin: 0 },
            { label: T('BFS: recorrer un grafo por niveles', 'BFS: walking a graph by levels'), bin: 1 },
            { label: T('Las funciones que se van llamando (call stack)', 'Functions calling functions (the call stack)'), bin: 0 },
            { label: T('Mensajes de un chat, en el orden en que llegan', 'Chat messages, in the order they arrive'), bin: 1 },
          ],
          explain: T('Si lo más nuevo es lo que importa primero (deshacer, atrás), es pila. Si hay que respetar el turno, es cola.', 'If the newest thing matters first (undo, back), it’s a stack. If turns must be respected, it’s a queue.'),
        },
        {
          type: 'viz',
          prompt: T('Pregunta de entrevista: ¿los paréntesis de <code>([]{})</code> están bien cerrados? Mira la pila.', 'Interview question: are the brackets in <code>([]{})</code> properly closed? Watch the stack.'),
          code: "const pairs = { ')': '(', ']': '[', '}': '{' };\nconst stack = [];\nfor (const ch of s) {\n  if (!pairs[ch]) stack.push(ch);\n  else if (stack.pop() !== pairs[ch]) return false;\n}\nreturn stack.length === 0;",
          frames: parensFrames('([]{})'),
        },
        {
          type: 'choice',
          prompt: T('Con ese código, ¿qué regresa para <code>"(()"</code>?', 'With that code, what does it return for <code>"(()"</code>?'),
          options: [
            '<code>true</code>',
            T('<code>false</code>: al final queda un <code>(</code> en la pila', '<code>false</code>: a <code>(</code> is left on the stack'),
            T('Truena con un error', 'It crashes with an error'),
          ],
          answer: 1,
          explain: T('Todos los que cerraron encontraron pareja, pero un <code>(</code> se quedó esperando. Por eso la última línea revisa <code>stack.length === 0</code>.', 'Every closing bracket found its partner, but one <code>(</code> was left waiting. That’s why the last line checks <code>stack.length === 0</code>.'),
        },
        {
          type: 'viz',
          prompt: T('Un truco poderoso: la <b>pila monótona</b>. Para cada número, ¿quién es el siguiente mayor a su derecha?', 'A powerful trick: the <b>monotonic stack</b>. For each number, who’s the next bigger one to its right?'),
          code: 'const res = nums.map(() => -1);\nconst stack = []; // índices esperando\nfor (let i = 0; i < nums.length; i++) {\n  while (stack.length && nums[i] > nums[stack.at(-1)]) {\n    res[stack.pop()] = nums[i];\n  }\n  stack.push(i);\n}\nreturn res;',
          frames: nextGreaterFrames([2, 1, 5, 3, 6]),
        },
        {
          type: 'choice',
          prompt: T('Hay un <code>while</code> dentro de un <code>for</code>. ¿Por qué es O(n) y no O(n²)?', 'There’s a <code>while</code> inside a <code>for</code>. Why is it O(n) and not O(n²)?'),
          options: [
            T('Porque cada índice entra a la pila una vez y sale máximo una vez', 'Because each index enters the stack once and leaves at most once'),
            T('Porque el <code>while</code> nunca se repite', 'Because the <code>while</code> never repeats'),
            T('Sí es O(n²), pero con números chicos no se nota', 'It is O(n²), but with small numbers you can’t tell'),
          ],
          answer: 0,
          explain: T('Cuenta el trabajo total, no por vuelta: n entradas + máximo n salidas = 2n. Este análisis (“amortizado”) es justo lo que te piden explicar en una entrevista.', 'Count the total work, not per iteration: n pushes + at most n pops = 2n. This (“amortized”) analysis is exactly what interviewers ask you to explain.'),
        },
        {
          type: 'code',
          prompt: T('Escribe <code>isValid(s)</code>: <code>true</code> si todos los <code>() [] {}</code> abren y cierran en orden.', 'Write <code>isValid(s)</code>: <code>true</code> if every <code>() [] {}</code> opens and closes in order.'),
          fnName: 'isValid',
          starter: "function isValid(s) {\n  const pairs = { ')': '(', ']': '[', '}': '{' };\n  const stack = [];\n  for (const ch of s) {\n    \n  }\n  return stack.length === 0;\n}\n",
          tests: [
            { args: ['()[]{}'], expect: true },
            { args: ['{[]}'], expect: true },
            { args: ['([)]'], expect: false },
            { args: ['(('], expect: false },
            { args: [')'], expect: false },
            { args: [''], expect: true },
          ],
          hint: T('Si <code>ch</code> abre (no está en <code>pairs</code>), mételo a la pila. Si cierra, saca el tope y compáralo con <code>pairs[ch]</code>; si no coincide, regresa <code>false</code>.', 'If <code>ch</code> opens (it’s not in <code>pairs</code>), push it. If it closes, pop the top and compare it with <code>pairs[ch]</code>; if they don’t match, return <code>false</code>.'),
          solution: "function isValid(s) {\n  const pairs = { ')': '(', ']': '[', '}': '{' };\n  const stack = [];\n  for (const ch of s) {\n    if (!pairs[ch]) stack.push(ch);\n    else if (stack.pop() !== pairs[ch]) return false;\n  }\n  return stack.length === 0;\n}",
          complexity: { time: 'O(n)', space: 'O(n)' },
          explain: T('Con <code>")"</code> la pila está vacía: <code>pop()</code> da <code>undefined</code>, que no es <code>"("</code>, y regresa <code>false</code> sin tronar.', 'With <code>")"</code> the stack is empty: <code>pop()</code> gives <code>undefined</code>, which isn’t <code>"("</code>, so it returns <code>false</code> without crashing.'),
        },
        {
          type: 'code',
          prompt: T('Ahora la pila monótona: <code>nextGreater(nums)</code> regresa, para cada número, el siguiente mayor a su derecha (o <code>-1</code>).', 'Now the monotonic stack: <code>nextGreater(nums)</code> returns, for each number, the next bigger one to its right (or <code>-1</code>).'),
          fnName: 'nextGreater',
          starter: 'function nextGreater(nums) {\n  const res = nums.map(() => -1);\n  const stack = [];\n  for (let i = 0; i < nums.length; i++) {\n    \n    stack.push(i);\n  }\n  return res;\n}\n',
          tests: [
            { args: [[2, 1, 5, 3, 6]], expect: [5, 5, 6, 6, -1] },
            { args: [[4, 3, 2, 1]], expect: [-1, -1, -1, -1] },
            { args: [[1, 2, 3]], expect: [2, 3, -1] },
            { args: [[3, 3]], expect: [-1, -1] },
            { args: [[]], expect: [] },
          ],
          hint: T('Antes del <code>push</code>: mientras la pila tenga algo y <code>nums[i]</code> sea mayor que el número del tope, saca ese índice y guárdale <code>nums[i]</code> en <code>res</code>.', 'Before the <code>push</code>: while the stack has something and <code>nums[i]</code> is bigger than the top’s number, pop that index and store <code>nums[i]</code> in <code>res</code>.'),
          solution: 'function nextGreater(nums) {\n  const res = nums.map(() => -1);\n  const stack = [];\n  for (let i = 0; i < nums.length; i++) {\n    while (stack.length && nums[i] > nums[stack.at(-1)]) {\n      res[stack.pop()] = nums[i];\n    }\n    stack.push(i);\n  }\n  return res;\n}',
          complexity: { time: 'O(n)', space: 'O(n)' },
          explain: T('Este patrón resuelve “temperaturas diarias”, “el histograma más grande” y otros clásicos de LeetCode.', 'This pattern solves “daily temperatures”, “largest rectangle in a histogram” and other LeetCode classics.'),
        },
      ],
    },

    // ═══════════════ Ordenar ═══════════════
    {
      id: 'sorting',
      unit: U1,
      icon: '📊',
      title: T('Ordenar: merge y quick', 'Sorting: merge and quick'),
      blurb: T('Divide, conquista y junta', 'Divide, conquer and merge'),
      steps: [
        {
          type: 'read',
          title: T('¿Por qué ordenar?', 'Why sort?'),
          code: "[10, 9, 1].sort();               // [1, 10, 9] 😱\n[10, 9, 1].sort((a, b) => a - b); // [1, 9, 10] ✓",
          body: T(
            '<p>Con datos ordenados se abren un montón de trucos: búsqueda binaria, dos punteros, juntar intervalos.</p><p>Ojo con JavaScript: <code>sort()</code> sin nada compara como <b>texto</b>, y <code>"10"</code> va antes que <code>"9"</code>. Para números, siempre <code>(a, b) => a - b</code>.</p><p>Por dentro, los buenos algoritmos de ordenar son <b>O(n log n)</b>. Vamos a ver los dos famosos.</p>',
            '<p>Sorted data unlocks a bunch of tricks: binary search, two pointers, merging intervals.</p><p>Careful with JavaScript: a bare <code>sort()</code> compares as <b>text</b>, and <code>"10"</code> comes before <code>"9"</code>. For numbers, always <code>(a, b) => a - b</code>.</p><p>Under the hood, good sorting algorithms are <b>O(n log n)</b>. Let’s see the two famous ones.</p>'
          ),
        },
        {
          type: 'choice',
          prompt: T('¿Qué da <code>[25, 100, 3].sort()</code>?', 'What does <code>[25, 100, 3].sort()</code> give?'),
          options: ['<code>[3, 25, 100]</code>', '<code>[100, 25, 3]</code>', '<code>[25, 100, 3]</code>'],
          answer: 1,
          why: { 0: T('Eso daría con <code>(a, b) => a - b</code>. Sin función compara texto.', 'That’s what you get with <code>(a, b) => a - b</code>. Without a function it compares text.') },
          explain: T('Como texto: <code>"100"</code> &lt; <code>"25"</code> &lt; <code>"3"</code>, porque compara el primer carácter: 1 &lt; 2 &lt; 3.', 'As text: <code>"100"</code> &lt; <code>"25"</code> &lt; <code>"3"</code>, because it compares the first character: 1 &lt; 2 &lt; 3.'),
        },
        {
          type: 'viz',
          prompt: T('<b>Merge sort</b>: parte en pedacitos y júntalos ya ordenados.', '<b>Merge sort</b>: split into tiny pieces and merge them back sorted.'),
          frames: mergeSortFrames([5, 2, 4, 1, 6, 3]),
        },
        {
          type: 'viz',
          prompt: T('El corazón de merge sort: juntar dos mitades ordenadas con <b>dos punteros</b>.', 'The heart of merge sort: merging two sorted halves with <b>two pointers</b>.'),
          code: 'function merge(a, b) {\n  const out = [];\n  let i = 0, j = 0;\n  while (i < a.length && j < b.length) {\n    if (a[i] <= b[j]) out.push(a[i++]);\n    else out.push(b[j++]);\n  }\n  return [...out, ...a.slice(i), ...b.slice(j)];\n}',
          frames: mergeFrames([1, 2, 4, 5], [3, 6]),
        },
        {
          type: 'viz',
          prompt: T('<b>Quicksort</b>: escoge un pivote y acomoda a los menores de un lado y a los mayores del otro.', '<b>Quicksort</b>: pick a pivot and put the smaller ones on one side and the bigger ones on the other.'),
          code: 'const pivot = arr[hi];\nlet i = lo;\nfor (let j = lo; j < hi; j++) {\n  if (arr[j] < pivot) {\n    [arr[i], arr[j]] = [arr[j], arr[i]];\n    i++;\n  }\n}\n[arr[i], arr[hi]] = [arr[hi], arr[i]];',
          frames: partitionFrames([4, 7, 2, 6, 1, 5]),
        },
        {
          type: 'choice',
          prompt: T('Quicksort suele ser O(n log n). ¿Cuándo se vuelve <b>O(n²)</b>?', 'Quicksort is usually O(n log n). When does it become <b>O(n²)</b>?'),
          options: [
            T('Cuando el array ya viene ordenado y siempre escoges el último como pivote', 'When the array is already sorted and you always pick the last one as pivot'),
            T('Cuando hay números negativos', 'When there are negative numbers'),
            T('Nunca: siempre es O(n log n)', 'Never: it’s always O(n log n)'),
          ],
          answer: 0,
          explain: T('Si el pivote siempre es el más grande, cada partición solo quita un número: n + (n−1) + … = O(n²). Por eso se escoge el pivote al azar. Merge sort no tiene ese problema, pero usa O(n) de memoria extra.', 'If the pivot is always the biggest, each partition removes just one number: n + (n−1) + … = O(n²). That’s why pivots are picked at random. Merge sort doesn’t have this problem, but it uses O(n) extra memory.'),
        },
        {
          type: 'number',
          prompt: T('Con merge sort, ¿cuántos niveles de “partir a la mitad” hay para 16 números (16 → 8 → … → 1)?', 'With merge sort, how many levels of “split in half” are there for 16 numbers (16 → 8 → … → 1)?'),
          answer: 4,
          explain: T('16 → 8 → 4 → 2 → 1: cuatro niveles, que es log₂ 16. En cada nivel se tocan los 16 números: 16 × 4.', '16 → 8 → 4 → 2 → 1: four levels, which is log₂ 16. Each level touches all 16 numbers: 16 × 4.'),
        },
        {
          type: 'code',
          prompt: T('Escribe <code>merge(a, b)</code>: junta dos arrays <b>ya ordenados</b> en uno ordenado, sin usar <code>sort</code>.', 'Write <code>merge(a, b)</code>: combine two <b>already sorted</b> arrays into one sorted array, without using <code>sort</code>.'),
          fnName: 'merge',
          starter: 'function merge(a, b) {\n  const out = [];\n  let i = 0;\n  let j = 0;\n  \n  return out;\n}\n',
          tests: [
            { args: [[1, 3, 5], [2, 4]], expect: [1, 2, 3, 4, 5] },
            { args: [[4, 5, 6], [1, 2, 3]], expect: [1, 2, 3, 4, 5, 6] },
            { args: [[1, 1], [1]], expect: [1, 1, 1] },
            { args: [[], [7]], expect: [7] },
            { args: [[], []], expect: [] },
          ],
          hint: T('Mientras queden en los dos, mete el más chico de <code>a[i]</code> y <code>b[j]</code> y avanza ese puntero. Al final, pega lo que sobre: <code>a.slice(i)</code> y <code>b.slice(j)</code>.', 'While both have items left, push the smaller of <code>a[i]</code> and <code>b[j]</code> and move that pointer. At the end, append the leftovers: <code>a.slice(i)</code> and <code>b.slice(j)</code>.'),
          solution: 'function merge(a, b) {\n  const out = [];\n  let i = 0;\n  let j = 0;\n  while (i < a.length && j < b.length) {\n    if (a[i] <= b[j]) out.push(a[i++]);\n    else out.push(b[j++]);\n  }\n  return [...out, ...a.slice(i), ...b.slice(j)];\n}',
          complexity: { time: 'O(n)', space: 'O(n)' },
          explain: T('Con esto ya tienes merge sort: <code>mergeSort(arr)</code> parte a la mitad, se llama a sí mismo con cada lado y regresa <code>merge(izq, der)</code>.', 'With this you have merge sort: <code>mergeSort(arr)</code> splits in half, calls itself on each side and returns <code>merge(left, right)</code>.'),
        },
      ],
    },

    // ═══════════════ Intervalos ═══════════════
    {
      id: 'intervals',
      unit: U1,
      icon: '📅',
      title: T('Intervalos', 'Intervals'),
      blurb: T('Juntas que se empalman en el calendario', 'Overlapping meetings on the calendar'),
      steps: [
        {
          type: 'read',
          title: T('Tu calendario', 'Your calendar'),
          code: 'const juntas = [[9, 10], [9.5, 11], [13, 14]];\n// [inicio, fin]',
          body: T(
            '<p>Un <b>intervalo</b> es un par <code>[inicio, fin]</code>: una junta, una reservación, un turno.</p><p>Dos se <b>empalman</b> si uno empieza antes de que acabe el otro. El truco de casi todos estos problemas: <b>ordénalos por inicio</b> y recórrelos una vez.</p>',
            '<p>An <b>interval</b> is a pair <code>[start, end]</code>: a meeting, a booking, a shift.</p><p>Two of them <b>overlap</b> if one starts before the other ends. The trick behind almost all of these problems: <b>sort by start</b> and walk them once.</p>'
          ),
        },
        {
          type: 'choice',
          prompt: T('Al juntar intervalos, ¿<code>[1, 4]</code> y <code>[4, 6]</code> se empalman?', 'When merging intervals, do <code>[1, 4]</code> and <code>[4, 6]</code> overlap?'),
          options: [T('Sí: comparten el 4, quedan como <code>[1, 6]</code>', 'Yes: they share 4, so they become <code>[1, 6]</code>'), T('No: uno acaba justo donde empieza el otro', 'No: one ends exactly where the other starts')],
          answer: 0,
          explain: T('En el problema clásico (LeetCode 56) tocarse cuenta: la condición es <code>inicio ≤ finDelÚltimo</code>. En otros problemas (salas de juntas) no cuenta; lee bien el enunciado y pregunta en la entrevista.', 'In the classic problem (LeetCode 56) touching counts: the condition is <code>start ≤ lastEnd</code>. In other problems (meeting rooms) it doesn’t; read carefully and ask in the interview.'),
        },
        {
          type: 'viz',
          prompt: T('Mira cómo se juntan. Arriba van los originales; abajo, el resultado.', 'Watch them merge. The originals are on top; the result is below.'),
          code: 'intervals.sort((a, b) => a[0] - b[0]);\nconst out = [intervals[0]];\nfor (const [s, e] of intervals.slice(1)) {\n  const last = out.at(-1);\n  if (s <= last[1]) last[1] = Math.max(last[1], e);\n  else out.push([s, e]);\n}\nreturn out;',
          axis: [0, 18],
          frames: intervalFrames([[1, 3], [2, 6], [8, 10], [9, 12], [15, 18]]),
        },
        {
          type: 'choice',
          prompt: T('¿Por qué hay que <b>ordenar primero</b>?', 'Why do we have to <b>sort first</b>?'),
          options: [
            T('Para que los que se empalman queden juntos y baste comparar con el último', 'So overlapping ones end up next to each other and comparing with the last one is enough'),
            T('Porque el resultado tiene que salir ordenado, nada más', 'Just because the result has to come out sorted'),
            T('No hace falta, es para que se vea bonito', 'It isn’t needed, it just looks nicer'),
          ],
          answer: 0,
          explain: T('Sin ordenar tendrías que comparar cada par: O(n²). Ordenado, una pasada basta: O(n log n) en total, por el sort.', 'Without sorting you’d compare every pair: O(n²). Sorted, one pass is enough: O(n log n) total, because of the sort.'),
        },
        {
          type: 'choice',
          prompt: T('Juntas <code>[[0, 30], [5, 10], [15, 20]]</code>. ¿Puede una persona ir a todas?', 'Meetings <code>[[0, 30], [5, 10], [15, 20]]</code>. Can one person attend all of them?'),
          options: [T('Sí', 'Yes'), T('No: <code>[0, 30]</code> choca con las otras dos', 'No: <code>[0, 30]</code> clashes with the other two')],
          answer: 1,
          explain: T('Ordenadas por inicio, revisa cada una contra la anterior: si alguna empieza antes de que acabe la anterior, hay choque. Mismo truco, otra pregunta.', 'Sorted by start, check each one against the previous: if one starts before the previous ends, there’s a clash. Same trick, different question.'),
        },
        {
          type: 'code',
          prompt: T('Escribe <code>mergeIntervals(intervals)</code>: junta los que se empalman y regresa la lista ordenada. Puede venir desordenada.', 'Write <code>mergeIntervals(intervals)</code>: merge the overlapping ones and return the sorted list. It may come unsorted.'),
          fnName: 'mergeIntervals',
          starter: 'function mergeIntervals(intervals) {\n  const sorted = [...intervals].sort((a, b) => a[0] - b[0]);\n  const out = [];\n  for (const [s, e] of sorted) {\n    \n  }\n  return out;\n}\n',
          tests: [
            { args: [[[1, 3], [2, 6], [8, 10], [15, 18]]], expect: [[1, 6], [8, 10], [15, 18]] },
            { args: [[[1, 4], [4, 5]]], expect: [[1, 5]] },
            { args: [[[8, 10], [1, 4], [0, 2]]], expect: [[0, 4], [8, 10]] },
            { args: [[[1, 10], [2, 3]]], expect: [[1, 10]] },
            { args: [[[5, 6]]], expect: [[5, 6]] },
          ],
          hint: T('Mira el último de <code>out</code>. Si no hay, o si <code>s</code> es mayor que su fin, mete <code>[s, e]</code>. Si no, estira su fin a <code>Math.max(fin, e)</code>.', 'Look at the last item in <code>out</code>. If there isn’t one, or if <code>s</code> is greater than its end, push <code>[s, e]</code>. Otherwise stretch its end to <code>Math.max(end, e)</code>.'),
          solution: 'function mergeIntervals(intervals) {\n  const sorted = [...intervals].sort((a, b) => a[0] - b[0]);\n  const out = [];\n  for (const [s, e] of sorted) {\n    const last = out.at(-1);\n    if (!last || s > last[1]) out.push([s, e]);\n    else last[1] = Math.max(last[1], e);\n  }\n  return out;\n}',
          complexity: { time: 'O(n log n)', space: 'O(n)' },
          explain: T('El <code>Math.max</code> importa: con <code>[1, 10]</code> y <code>[2, 3]</code>, el fin se queda en 10, no baja a 3.', 'The <code>Math.max</code> matters: with <code>[1, 10]</code> and <code>[2, 3]</code>, the end stays at 10, it doesn’t drop to 3.'),
        },
      ],
    },

    // ═══════════════ Tries ═══════════════
    {
      id: 'tries',
      unit: U2,
      icon: '🔤',
      title: T('Tries', 'Tries'),
      blurb: T('El árbol detrás del autocompletar', 'The tree behind autocomplete'),
      steps: [
        {
          type: 'read',
          title: T('Autocompletar', 'Autocomplete'),
          code: "// Cada nodo es un objeto: { letra: nodoHijo, end: true? }\nconst root = { c: { a: { r: { end: true } } } }; // 'car'",
          body: T(
            '<p>Cuando escribes “ca” y tu cel sugiere “casa”, “carro”, “café”, por dentro hay un <b>trie</b>: un árbol donde cada paso es una letra.</p><p>Las palabras que empiezan igual <b>comparten el camino</b>. Al final de cada palabra hay una marca ✓ (<code>end: true</code>).</p>',
            '<p>When you type “ca” and your phone suggests “cat”, “car”, “cake”, under the hood there’s a <b>trie</b>: a tree where every step is a letter.</p><p>Words that start the same <b>share the path</b>. Each word’s last letter carries a ✓ mark (<code>end: true</code>).</p>'
          ),
        },
        {
          type: 'viz',
          prompt: T('Metemos <code>car</code>, <code>cat</code>, <code>cup</code> y <code>do</code>, y luego buscamos.', 'We insert <code>car</code>, <code>cat</code>, <code>cup</code> and <code>do</code>, then search.'),
          graph: {
            h: 78,
            nodes: { root: [50, 0], c: [30, 26], ca: [15, 52], car: [4, 78], cat: [26, 78], cu: [45, 52], cup: [45, 78], d: [75, 26], do: [75, 52] },
            names: { root: '·', c: 'c', ca: 'a', car: 'r', cat: 't', cu: 'u', cup: 'p', d: 'd', do: 'o' },
            edges: [['root', 'c'], ['c', 'ca'], ['ca', 'car'], ['ca', 'cat'], ['c', 'cu'], ['cu', 'cup'], ['root', 'd'], ['d', 'do']],
          },
          frames: [
            { graph: { show: ['root'] }, note: T('Empezamos con una raíz vacía.', 'We start with an empty root.') },
            { graph: { show: ['root', 'c', 'ca', 'car'], hl: { c: 'cur', ca: 'cur', car: 'good' }, ehl: { 'root-c': 'cur', 'c-ca': 'cur', 'ca-car': 'cur' }, labels: { car: '✓' } }, note: T('<code>insert("car")</code>: no hay nada, se crean c → a → r. La r se marca ✓: ahí acaba una palabra.', '<code>insert("car")</code>: nothing exists, so c → a → r get created. The r gets ✓: a word ends there.') },
            { graph: { show: ['root', 'c', 'ca', 'car', 'cat'], hl: { c: 'cur', ca: 'cur', cat: 'good' }, ehl: { 'root-c': 'cur', 'c-ca': 'cur', 'ca-cat': 'cur' }, labels: { car: '✓', cat: '✓' } }, note: T('<code>insert("cat")</code>: “ca” ya existe, lo reutiliza. Solo se crea la t.', '<code>insert("cat")</code>: “ca” already exists, so it’s reused. Only the t is created.') },
            { graph: { show: ['root', 'c', 'ca', 'car', 'cat', 'cu', 'cup'], hl: { c: 'cur', cu: 'cur', cup: 'good' }, ehl: { 'root-c': 'cur', 'c-cu': 'cur', 'cu-cup': 'cur' }, labels: { car: '✓', cat: '✓', cup: '✓' } }, note: T('<code>insert("cup")</code>: comparte la c y abre una rama nueva.', '<code>insert("cup")</code>: shares the c and opens a new branch.') },
            { graph: { hl: { d: 'cur', do: 'good' }, ehl: { 'root-d': 'cur', 'd-do': 'cur' }, labels: { car: '✓', cat: '✓', cup: '✓', do: '✓' } }, note: T('<code>insert("do")</code>: otra primera letra, otra rama desde la raíz.', '<code>insert("do")</code>: a different first letter, a different branch from the root.') },
            { graph: { hl: { c: 'cur', ca: 'cmp' }, ehl: { 'root-c': 'cur', 'c-ca': 'cur' }, labels: { car: '✓', cat: '✓', cup: '✓', do: '✓' } }, note: T('<code>search("ca")</code>: el camino existe, pero la a no tiene ✓ → <code>false</code>. En cambio <code>startsWith("ca")</code> → <code>true</code>.', '<code>search("ca")</code>: the path exists, but the a has no ✓ → <code>false</code>. But <code>startsWith("ca")</code> → <code>true</code>.') },
            { graph: { hl: { c: 'cur' }, ehl: { 'root-c': 'cur' }, labels: { car: '✓', cat: '✓', cup: '✓', do: '✓' } }, note: T('<code>search("cow")</code>: después de la c no hay o → <code>false</code> en 2 pasos, sin revisar ninguna otra palabra.', '<code>search("cow")</code>: after the c there’s no o → <code>false</code> in 2 steps, without checking any other word.') },
          ],
        },
        {
          type: 'choice',
          prompt: T('Un trie tiene un millón de palabras. Buscar una palabra de L letras, ¿cuánto cuesta?', 'A trie holds a million words. How much does searching a word with L letters cost?'),
          options: ['O(L)', T('O(n), con n = número de palabras', 'O(n), with n = number of words'), 'O(log n)'],
          answer: 0,
          explain: T('Das un paso por letra, y ya. No importa si hay mil o un millón de palabras. Por eso el autocompletar es instantáneo.', 'One step per letter, that’s it. It doesn’t matter whether there are a thousand or a million words. That’s why autocomplete is instant.'),
        },
        {
          type: 'choice',
          prompt: T('¿Qué diferencia hay entre <code>search("car")</code> y <code>startsWith("car")</code>?', 'What’s the difference between <code>search("car")</code> and <code>startsWith("car")</code>?'),
          options: [
            T('<code>search</code> pide que la última letra tenga ✓; <code>startsWith</code> solo que el camino exista', '<code>search</code> needs the last letter to have ✓; <code>startsWith</code> only needs the path to exist'),
            T('Ninguna, son lo mismo', 'None, they’re the same'),
            T('<code>startsWith</code> recorre todo el trie', '<code>startsWith</code> walks the whole trie'),
          ],
          answer: 0,
          explain: T('Los dos caminan igual letra por letra. Solo cambia la pregunta del final: ¿hay ✓ aquí?', 'Both walk letter by letter the same way. Only the final question changes: is there a ✓ here?'),
        },
        {
          type: 'code',
          prompt: T('Completa la clase <code>Trie</code>: <code>insert</code> ya está; escribe <code>search</code> y <code>startsWith</code>. (Una ayuda: <code>walk(s)</code> regresa el nodo donde acaba <code>s</code>, o <code>null</code>.)', 'Complete the <code>Trie</code> class: <code>insert</code> is done; write <code>search</code> and <code>startsWith</code>. (A helper: <code>walk(s)</code> returns the node where <code>s</code> ends, or <code>null</code>.)'),
          fnName: 'Trie',
          wrap: "(ops) => { const t = new Trie(); return ops.map(([op, w]) => { const r = t[op](w); return op === 'insert' ? null : r; }); }",
          starter:
            'class Trie {\n  constructor() {\n    this.root = {};\n  }\n  insert(word) {\n    let node = this.root;\n    for (const ch of word) {\n      node[ch] = node[ch] || {};\n      node = node[ch];\n    }\n    node.end = true;\n  }\n  walk(s) {\n    let node = this.root;\n    \n    return node;\n  }\n  search(word) {\n    \n  }\n  startsWith(prefix) {\n    \n  }\n}\n',
          tests: [
            { args: [[['insert', 'car'], ['search', 'car'], ['search', 'ca'], ['startsWith', 'ca']]], expect: [null, true, false, true], label: T('insert car → search car, search ca, startsWith ca', 'insert car → search car, search ca, startsWith ca') },
            { args: [[['insert', 'apple'], ['insert', 'app'], ['search', 'app'], ['startsWith', 'apx'], ['search', 'apple']]], expect: [null, null, true, false, true], label: T('insert apple, app → search app, startsWith apx, search apple', 'insert apple, app → search app, startsWith apx, search apple') },
            { args: [[['search', 'a'], ['insert', 'a'], ['search', 'a'], ['search', 'ab']]], expect: [false, null, true, false], label: T('search a, insert a, search a, search ab', 'search a, insert a, search a, search ab') },
          ],
          hint: T('En <code>walk</code>: por cada letra, si <code>node[ch]</code> no existe regresa <code>null</code>; si existe, baja. Luego <code>search</code> es “<code>walk</code> no es null y tiene <code>end</code>”, y <code>startsWith</code> es “<code>walk</code> no es null”.', 'In <code>walk</code>: for each letter, if <code>node[ch]</code> doesn’t exist return <code>null</code>; if it does, go down. Then <code>search</code> is “<code>walk</code> isn’t null and has <code>end</code>”, and <code>startsWith</code> is “<code>walk</code> isn’t null”.'),
          solution:
            'class Trie {\n  constructor() {\n    this.root = {};\n  }\n  insert(word) {\n    let node = this.root;\n    for (const ch of word) {\n      node[ch] = node[ch] || {};\n      node = node[ch];\n    }\n    node.end = true;\n  }\n  walk(s) {\n    let node = this.root;\n    for (const ch of s) {\n      if (!node[ch]) return null;\n      node = node[ch];\n    }\n    return node;\n  }\n  search(word) {\n    const node = this.walk(word);\n    return node !== null && node.end === true;\n  }\n  startsWith(prefix) {\n    return this.walk(prefix) !== null;\n  }\n}',
          explain: T('En entrevistas sale como “implementa un Trie” (LeetCode 208) y como base de “busca palabras en una sopa de letras”.', 'In interviews it shows up as “implement a Trie” (LeetCode 208) and as the base of “word search II”.'),
        },
      ],
    },

    // ═══════════════ Union-Find ═══════════════
    {
      id: 'union-find',
      unit: U2,
      icon: '🤝',
      title: T('Union-Find', 'Union-Find'),
      blurb: T('Grupos que se juntan, y quién es el jefe', 'Groups that merge, and who’s the boss'),
      steps: [
        {
          type: 'read',
          title: T('¿Quién es tu jefe?', 'Who’s your boss?'),
          code: 'const parent = [0, 1, 2, 3, 4, 5]; // cada quien es su propio jefe\n\nfunction find(x) {\n  while (parent[x] !== x) x = parent[x];\n  return x;\n}\n\nfunction union(a, b) {\n  parent[find(a)] = find(b);\n}',
          body: T(
            '<p><b>Union-Find</b> lleva la cuenta de grupos que se van juntando: amigos de amigos, islas conectadas, computadoras en la misma red.</p><p>Cada quien apunta a un “jefe” (<code>parent</code>). <code>find(x)</code> sube de jefe en jefe hasta el de hasta arriba. <code>union(a, b)</code> pone al jefe de un grupo a reportarle al jefe del otro.</p>',
            '<p><b>Union-Find</b> keeps track of groups that keep merging: friends of friends, connected islands, computers on the same network.</p><p>Everyone points to a “boss” (<code>parent</code>). <code>find(x)</code> climbs from boss to boss up to the top one. <code>union(a, b)</code> makes one group’s boss report to the other group’s boss.</p>'
          ),
        },
        {
          type: 'viz',
          prompt: T('Las flechas apuntan al jefe. Mira cómo se forman los grupos.', 'Arrows point to the boss. Watch the groups form.'),
          graph: {
            h: 70,
            directed: true,
            nodes: { 0: [30, 70], 1: [15, 35], 2: [45, 35], 3: [30, 0], 4: [82, 35], 5: [82, 0] },
            edges: [],
          },
          frames: [
            { graph: { edges: [] }, vars: { parent: [0, 1, 2, 3, 4, 5] }, note: T('Al inicio cada quien es su propio grupo: su propio jefe.', 'At first everyone is their own group: their own boss.') },
            { graph: { edges: [[0, 1]], hl: { 0: 'cur', 1: 'good' }, ehl: { '0-1': 'cmp' } }, vars: { parent: [1, 1, 2, 3, 4, 5] }, note: T('<code>union(0, 1)</code>: el jefe de 0 (él mismo) ahora le reporta a 1.', '<code>union(0, 1)</code>: 0’s boss (itself) now reports to 1.') },
            { graph: { edges: [[0, 1], [2, 3]], hl: { 2: 'cur', 3: 'good' }, ehl: { '2-3': 'cmp' } }, vars: { parent: [1, 1, 3, 3, 4, 5] }, note: T('<code>union(2, 3)</code>: otro grupo de dos.', '<code>union(2, 3)</code>: another group of two.') },
            { graph: { edges: [[0, 1], [2, 3], [1, 3]], hl: { 1: 'cur', 3: 'good' }, ehl: { '1-3': 'cmp' } }, vars: { parent: [1, 3, 3, 3, 4, 5] }, note: T('<code>union(1, 3)</code>: se juntan los <b>jefes</b>: 1 ahora le reporta a 3. ¡Dos grupos se volvieron uno!', '<code>union(1, 3)</code>: the <b>bosses</b> merge: 1 now reports to 3. Two groups became one!') },
            { graph: { edges: [[0, 1], [2, 3], [1, 3], [4, 5]], hl: { 4: 'cur', 5: 'good' }, ehl: { '4-5': 'cmp' } }, vars: { parent: [1, 3, 3, 3, 5, 5] }, note: T('<code>union(4, 5)</code>: y un grupo aparte.', '<code>union(4, 5)</code>: and a separate group.') },
            { graph: { edges: [[0, 1], [2, 3], [1, 3], [4, 5]], hl: { 0: 'cur', 1: 'cur', 3: 'good' }, ehl: { '0-1': 'cur', '1-3': 'cur' } }, vars: { parent: [1, 3, 3, 3, 5, 5] }, note: T('<code>find(0)</code>: sube 0 → 1 → 3. El jefe del grupo es 3.', '<code>find(0)</code>: climbs 0 → 1 → 3. The group’s boss is 3.') },
            { graph: { edges: [[0, 3], [2, 3], [1, 3], [4, 5]], hl: { 0: 'cur', 3: 'good' }, ehl: { '0-3': 'good' } }, vars: { parent: [3, 3, 3, 3, 5, 5] }, note: T('<b>Compresión de caminos</b>: de paso, 0 apunta directo a 3. La próxima vez es un solo salto. Así casi todo cuesta O(1).', '<b>Path compression</b>: along the way, 0 points straight to 3. Next time it’s a single hop. That makes almost everything O(1).') },
            { graph: { edges: [[0, 3], [2, 3], [1, 3], [4, 5]], hl: { 0: 'cmp', 2: 'cmp', 3: 'good', 4: 'bad', 5: 'bad' } }, vars: { parent: [3, 3, 3, 3, 5, 5] }, note: T('¿0 y 2 están conectados? <code>find(0) === find(2)</code> → 3 y 3: <b>sí</b>. ¿0 y 4? 3 y 5: <b>no</b>. Hay 2 grupos.', 'Are 0 and 2 connected? <code>find(0) === find(2)</code> → 3 and 3: <b>yes</b>. 0 and 4? 3 and 5: <b>no</b>. There are 2 groups.') },
          ],
        },
        {
          type: 'choice',
          prompt: T('¿Qué regresa <code>find(x)</code>?', 'What does <code>find(x)</code> return?'),
          options: [T('El jefe (la raíz) del grupo de <code>x</code>', 'The boss (root) of <code>x</code>’s group'), T('El papá directo de <code>x</code>', '<code>x</code>’s direct parent'), T('Cuántos hay en el grupo', 'How many are in the group')],
          answer: 0,
          explain: T('Dos elementos están en el mismo grupo si y solo si tienen el mismo jefe. Esa es toda la magia.', 'Two elements are in the same group if and only if they have the same boss. That’s all the magic.'),
        },
        {
          type: 'choice',
          prompt: T('¿Para cuál de estos <b>no</b> usarías Union-Find?', 'Which of these would you <b>not</b> use Union-Find for?'),
          options: [
            T('Contar cuántos grupos de amigos hay', 'Counting how many friend groups there are'),
            T('Saber si una calle nueva cierra un ciclo', 'Knowing whether a new street closes a cycle'),
            T('Encontrar el camino más corto entre dos ciudades', 'Finding the shortest path between two cities'),
          ],
          answer: 2,
          explain: T('Union-Find sabe <b>si</b> están conectados, no <b>cómo</b> llegar. Para el camino más corto: BFS o Dijkstra.', 'Union-Find knows <b>whether</b> things are connected, not <b>how</b> to get there. For shortest paths: BFS or Dijkstra.'),
        },
        {
          type: 'code',
          prompt: T('Escribe <code>countGroups(n, edges)</code>: hay <code>n</code> personas (0 a n−1) y cada <code>[a, b]</code> en <code>edges</code> dice que son amigos. ¿Cuántos grupos hay?', 'Write <code>countGroups(n, edges)</code>: there are <code>n</code> people (0 to n−1) and each <code>[a, b]</code> in <code>edges</code> says they’re friends. How many groups are there?'),
          fnName: 'countGroups',
          starter: 'function countGroups(n, edges) {\n  const parent = Array.from({ length: n }, (_, i) => i);\n  const find = (x) => {\n    while (parent[x] !== x) x = parent[x];\n    return x;\n  };\n  let groups = n;\n  for (const [a, b] of edges) {\n    \n  }\n  return groups;\n}\n',
          tests: [
            { args: [5, [[0, 1], [1, 2], [3, 4]]], expect: 2 },
            { args: [4, [[0, 1], [2, 3], [1, 2]]], expect: 1 },
            { args: [3, []], expect: 3 },
            { args: [5, [[0, 1], [0, 1], [1, 0]]], expect: 4 },
            { args: [1, []], expect: 1 },
          ],
          hint: T('Busca los jefes de <code>a</code> y de <code>b</code>. Si son distintos, únelos (<code>parent[ra] = rb</code>) y resta un grupo. Si son el mismo, ya eran amigos: no cambia nada.', 'Find the bosses of <code>a</code> and <code>b</code>. If they’re different, join them (<code>parent[ra] = rb</code>) and subtract one group. If they’re the same, they were already friends: nothing changes.'),
          solution: 'function countGroups(n, edges) {\n  const parent = Array.from({ length: n }, (_, i) => i);\n  const find = (x) => {\n    while (parent[x] !== x) x = parent[x];\n    return x;\n  };\n  let groups = n;\n  for (const [a, b] of edges) {\n    const ra = find(a);\n    const rb = find(b);\n    if (ra !== rb) {\n      parent[ra] = rb;\n      groups--;\n    }\n  }\n  return groups;\n}',
          explain: T('Cada unión real quita un grupo. Las amistades repetidas no cuentan dos veces porque ya tienen el mismo jefe. (Si <code>ra === rb</code> al agregar una arista, ¡acabas de encontrar un ciclo!)', 'Each real union removes one group. Repeated friendships don’t count twice because they already share a boss. (If <code>ra === rb</code> when adding an edge, you just found a cycle!)'),
        },
      ],
    },

    // ═══════════════ Dijkstra ═══════════════
    {
      id: 'dijkstra',
      unit: U2,
      icon: '🗺️',
      title: T('Dijkstra', 'Dijkstra'),
      blurb: T('El camino más corto cuando las calles tienen distancia', 'Shortest paths when streets have distances'),
      steps: [
        {
          type: 'read',
          title: T('Calles con kilómetros', 'Streets with kilometers'),
          code: "const graph = {\n  A: [['B', 4], ['C', 1]],\n  B: [['D', 1]],\n  C: [['B', 2], ['D', 5], ['E', 8]],\n  D: [['E', 3]],\n  E: [],\n};",
          body: T(
            '<p>BFS encuentra el camino con <b>menos calles</b>. Pero si cada calle tiene distancia (un <b>peso</b>), el de menos calles puede ser el más largo.</p><p><b>Dijkstra</b>: siempre toma el lugar más cercano que todavía no terminas, y desde ahí <b>relaja</b> a sus vecinos: “¿llegar por aquí es más corto que lo que tenía?”.</p>',
            '<p>BFS finds the path with the <b>fewest streets</b>. But if each street has a distance (a <b>weight</b>), the one with fewest streets may be the longest.</p><p><b>Dijkstra</b>: always take the closest place you haven’t finished yet, and from there <b>relax</b> its neighbors: “is getting there through here shorter than what I had?”.</p>'
          ),
        },
        {
          type: 'choice',
          prompt: T('Con ese grafo, ¿cuál es el camino más corto de A a D?', 'With that graph, what’s the shortest path from A to D?'),
          options: ['A → B → D (5)', 'A → C → B → D (4)', 'A → C → D (6)'],
          answer: 1,
          why: { 0: T('Ese tiene menos calles (lo que encontraría BFS), pero suma 4 + 1 = 5.', 'That one has fewer streets (what BFS would find), but it adds up to 4 + 1 = 5.') },
          explain: T('1 + 2 + 1 = 4. Dar la vuelta por C sale más corto, aunque sean más calles.', '1 + 2 + 1 = 4. Going around through C is shorter, even with more streets.'),
        },
        {
          type: 'viz',
          prompt: T('Ahora mira a Dijkstra resolverlo. El número de cada lugar es la mejor distancia conocida desde A.', 'Now watch Dijkstra solve it. Each place’s number is the best known distance from A.'),
          code: 'const dist = { A: 0 }; // los demás: ∞\nconst done = new Set();\nwhile (faltan lugares) {\n  // el más cercano sin terminar\n  const u = masCercano(dist, done);\n  done.add(u);\n  for (const [v, w] of graph[u]) {\n    dist[v] = Math.min(dist[v] ?? Infinity, dist[u] + w);\n  }\n}\nreturn dist;',
          graph: { h: 62, directed: true, nodes: { A: [0, 30], B: [40, 0], C: [40, 62], D: [75, 18], E: [100, 52] }, edges: wgEdges },
          frames: dijkstraFrames(wg, 'A'),
        },
        {
          type: 'choice',
          prompt: T('Dijkstra falla si hay calles con distancia <b>negativa</b>. ¿Por qué?', 'Dijkstra fails if some streets have <b>negative</b> distance. Why?'),
          options: [
            T('Porque da por terminado un lugar, y luego un camino negativo podría hacerlo más corto', 'Because it marks a place as finished, and later a negative path could make it shorter'),
            T('Porque <code>Math.min</code> no funciona con negativos', 'Because <code>Math.min</code> doesn’t work with negatives'),
            T('No falla, funciona igual', 'It doesn’t fail, it works the same'),
          ],
          answer: 0,
          explain: T('Su promesa es “el más cercano ya es final, nada lo puede mejorar”. Con negativos esa promesa se rompe. Para eso existe Bellman-Ford.', 'Its promise is “the closest one is final, nothing can improve it”. Negative weights break that promise. That’s what Bellman-Ford is for.'),
        },
        {
          type: 'choice',
          prompt: T('Buscar “el más cercano” revisando todos es O(n) cada vez. ¿Qué estructura lo hace en O(log n)?', 'Finding “the closest one” by checking everyone is O(n) each time. What structure does it in O(log n)?'),
          options: [T('Un heap (cola de prioridad)', 'A heap (priority queue)'), T('Una pila', 'A stack'), T('Un Set', 'A Set')],
          answer: 0,
          explain: T('El min-heap siempre tiene al más chico arriba: sacarlo y meter nuevos cuesta O(log n). Dijkstra con heap: O((V + E) log V). ¡Lo que viste en la lección de heaps!', 'A min-heap always has the smallest on top: taking it out and adding new ones costs O(log n). Dijkstra with a heap: O((V + E) log V). What you saw in the heaps lesson!'),
        },
        {
          type: 'code',
          prompt: T('Escribe <code>shortestPath(graph, start, end)</code>: la distancia más corta, o <code>-1</code> si no se puede llegar. Usa la versión sencilla: busca al más cercano revisando todos.', 'Write <code>shortestPath(graph, start, end)</code>: the shortest distance, or <code>-1</code> if you can’t get there. Use the simple version: find the closest by checking them all.'),
          fnName: 'shortestPath',
          starter: 'function shortestPath(graph, start, end) {\n  const dist = { [start]: 0 };\n  const done = new Set();\n  while (true) {\n    let u = null;\n    // 1. Busca en dist el nodo sin terminar con menor distancia\n    \n    if (u === null) break;\n    done.add(u);\n    // 2. Relaja a sus vecinos: graph[u] es una lista de [vecino, peso]\n    \n  }\n  return end in dist ? dist[end] : -1;\n}\n',
          tests: [
            { args: [wg, 'A', 'D'], expect: 4 },
            { args: [wg, 'A', 'E'], expect: 7 },
            { args: [wg, 'C', 'E'], expect: 6 },
            { args: [wg, 'B', 'B'], expect: 0 },
            { args: [wg, 'E', 'A'], expect: -1 },
          ],
          hint: T('1: <code>for (const n in dist)</code>, si no está en <code>done</code> y es menor que <code>dist[u]</code> (o <code>u</code> es null), <code>u = n</code>. 2: por cada <code>[v, w]</code>, si <code>dist[u] + w</code> es menor que <code>dist[v] ?? Infinity</code>, actualízalo.', '1: <code>for (const n in dist)</code>, if it’s not in <code>done</code> and smaller than <code>dist[u]</code> (or <code>u</code> is null), <code>u = n</code>. 2: for each <code>[v, w]</code>, if <code>dist[u] + w</code> is less than <code>dist[v] ?? Infinity</code>, update it.'),
          solution: 'function shortestPath(graph, start, end) {\n  const dist = { [start]: 0 };\n  const done = new Set();\n  while (true) {\n    let u = null;\n    for (const n in dist) {\n      if (!done.has(n) && (u === null || dist[n] < dist[u])) u = n;\n    }\n    if (u === null) break;\n    done.add(u);\n    for (const [v, w] of graph[u]) {\n      if (dist[u] + w < (dist[v] ?? Infinity)) dist[v] = dist[u] + w;\n    }\n  }\n  return end in dist ? dist[end] : -1;\n}',
          complexity: { time: 'O(n²)', space: 'O(n)' },
          explain: T('Revisar a todos para hallar al más cercano hace esta versión O(V²). Con un heap baja a O((V + E) log V): esa es la que te van a pedir mejorar en la entrevista.', 'Checking everyone to find the closest makes this version O(V²). With a heap it drops to O((V + E) log V): that’s the improvement interviewers will ask for.'),
        },
      ],
    }
  );
})();
