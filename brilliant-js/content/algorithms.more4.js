// Algoritmos con intuición, unidades 7 y 8: los patrones que faltaban para cerrar el módulo de
// entrevistas (sumas prefijo, ventana variable, búsqueda binaria pro, greedy, bits, BST, cuadrículas,
// orden topológico y DP en 2D). Como en more3, las animaciones salen de correr el algoritmo de verdad.
(function () {
  const c = window.COURSES.find((x) => x.id === 'algos');
  c.units.push({ es: 'Más patrones', en: 'More patterns' }, { es: 'El jefe final', en: 'The final boss' });
  const U1 = c.units.length - 2;
  const U2 = c.units.length - 1;
  c.soon = []; // ¡Módulo completo!
  c.blurb = {
    es: 'Todo lo que piden en entrevistas, de arrays a DP en 2D: punteros, ventanas, hash maps, árboles, grafos, heaps, listas, pilas, ordenamiento, tries, Union-Find, Dijkstra, greedy, bits y más. Con animaciones.',
    en: 'Everything interviews ask, from arrays to 2D DP: pointers, windows, hash maps, trees, graphs, heaps, lists, stacks, sorting, tries, Union-Find, Dijkstra, greedy, bits and more. With animations.',
  };

  const T = (es, en) => ({ es, en });
  const range = (a, b, st) => Object.fromEntries(Array.from({ length: Math.max(0, b - a + 1) }, (_, k) => [a + k, st]));
  const bin = (n, w = 4) => n.toString(2).padStart(w, '0');

  // ─────────── Cuadros generados ───────────

  function prefixFrames(nums) {
    const prefix = [0];
    const frames = [{ line: 0, array: { values: nums }, vars: { prefix: [0] }, note: T('<code>prefix[0] = 0</code>: la suma de “nada”.', '<code>prefix[0] = 0</code>: the sum of “nothing”.') }];
    nums.forEach((x, i) => {
      prefix.push(prefix[i] + x);
      frames.push({ line: 2, array: { values: nums, hl: { ...range(0, i - 1, 'good'), [i]: 'cur' } }, vars: { prefix: prefix.slice() }, note: T(`prefix[${i + 1}] = prefix[${i}] + ${x} = ${prefix[i + 1]}: todo lo de la izquierda, sumado.`, `prefix[${i + 1}] = prefix[${i}] + ${x} = ${prefix[i + 1]}: everything on the left, added up.`) });
    });
    const [l, r] = [1, 3];
    frames.push({ line: 4, array: { values: nums, hl: range(l, r, 'good'), ptrs: { l, r } }, vars: { prefix }, note: T(`¿Suma de ${l} a ${r}? <code>prefix[${r + 1}] − prefix[${l}]</code> = ${prefix[r + 1]} − ${prefix[l]} = <b>${prefix[r + 1] - prefix[l]}</b>. Una resta, sin volver a sumar: O(1).`, `Sum from ${l} to ${r}? <code>prefix[${r + 1}] − prefix[${l}]</code> = ${prefix[r + 1]} − ${prefix[l]} = <b>${prefix[r + 1] - prefix[l]}</b>. One subtraction, no re-adding: O(1).`) });
    return frames;
  }

  function subarraySumFrames(nums, k) {
    const seen = { 0: 1 };
    const firstAt = { 0: -1 };
    let sum = 0;
    let count = 0;
    const frames = [{ line: 1, array: { values: nums }, vars: { sum: 0, count: 0, seen: { ...seen } }, note: T(`Buscamos pedazos que sumen <b>${k}</b>. <code>seen</code> cuenta cuántas veces hemos visto cada suma acumulada; empieza con <code>{0: 1}</code>.`, `We want chunks that add up to <b>${k}</b>. <code>seen</code> counts how many times each running sum appeared; it starts as <code>{0: 1}</code>.`) }];
    nums.forEach((x, i) => {
      sum += x;
      const need = sum - k;
      if (seen[need]) {
        count += seen[need];
        frames.push({ line: 4, array: { values: nums, hl: { ...range(firstAt[need] + 1, i, 'good') } }, vars: { sum, need, count, seen: { ...seen } }, note: T(`Suma = ${sum}. Si antes vimos ${need}, lo de en medio suma ${sum} − ${need} = ${k}. ¡Sí lo vimos! count = ${count}.`, `Sum = ${sum}. If we saw ${need} before, what’s in between adds to ${sum} − ${need} = ${k}. We did! count = ${count}.`) });
      } else {
        frames.push({ line: 4, array: { values: nums, hl: { [i]: 'cur' } }, vars: { sum, need, count, seen: { ...seen } }, note: T(`Suma = ${sum}. ¿Vimos ${need} antes? No: ningún pedazo que acabe aquí suma ${k}.`, `Sum = ${sum}. Did we see ${need} before? No: no chunk ending here adds to ${k}.`) });
      }
      seen[sum] = (seen[sum] || 0) + 1;
      if (!(sum in firstAt)) firstAt[sum] = i;
    });
    frames.push({ line: 7, array: { values: nums }, vars: { count }, note: T(`<b>${count}</b> pedazos suman ${k}, en una sola pasada: <b>O(n)</b>. Sin el hash map serían todos los pares: O(n²).`, `<b>${count}</b> chunks add to ${k}, in a single pass: <b>O(n)</b>. Without the hash map it’d be every pair: O(n²).`) });
    return frames;
  }

  function longestUniqueFrames(str) {
    const s = [...str];
    const set = new Set();
    let L = 0;
    let best = 0;
    const frames = [];
    const snap = (line, R, st, note) => frames.push({ line, array: { values: s, hl: { ...range(L, R - (st === 'bad' ? 1 : 0), 'cur'), ...(st === 'bad' ? { [R]: 'bad' } : {}) }, ptrs: { L, R } }, vars: { ventana: s.slice(L, st === 'bad' ? R : R + 1).join(''), best }, note });
    for (let R = 0; R < s.length; R++) {
      while (set.has(s[R])) {
        snap(3, R, 'bad', T(`La <b>${s[R]}</b> ya está en la ventana: encoge por la izquierda (sale la ${s[L]}).`, `<b>${s[R]}</b> is already in the window: shrink from the left (${s[L]} leaves).`));
        set.delete(s[L]);
        L++;
      }
      set.add(s[R]);
      best = Math.max(best, R - L + 1);
      snap(6, R, 'ok', T(`Entra la <b>${s[R]}</b>. Ventana "${s.slice(L, R + 1).join('')}", tamaño ${R - L + 1}. Mejor: ${best}.`, `<b>${s[R]}</b> comes in. Window "${s.slice(L, R + 1).join('')}", size ${R - L + 1}. Best: ${best}.`));
    }
    frames.at(-1).note = T(`${frames.at(-1).note.es} <code>R</code> avanzó n veces y <code>L</code> máximo n: <b>O(n)</b>.`, `${frames.at(-1).note.en} <code>R</code> moved n times and <code>L</code> at most n: <b>O(n)</b>.`);
    return frames;
  }

  function rotatedFrames(nums, target) {
    let lo = 0;
    let hi = nums.length - 1;
    const frames = [];
    const snap = (line, mid, note, found) => frames.push({ line, array: { values: nums, ptrs: { lo, ...(mid >= 0 ? { mid } : {}), hi }, hl: { ...Object.fromEntries(nums.map((_, i) => [i, i < lo || i > hi ? 'dim' : null]).filter(([, v]) => v)), ...(mid >= 0 ? { [mid]: found ? 'good' : 'cmp' } : {}) } }, vars: { target }, note });
    snap(1, -1, T(`Un array ordenado que “giró”. Buscamos el <b>${target}</b>.`, `A sorted array that got “rotated”. We’re looking for <b>${target}</b>.`));
    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2);
      if (nums[mid] === target) {
        snap(4, mid, T(`nums[mid] = ${target}: ¡encontrado en el índice ${mid}! Tiramos la mitad en cada paso: <b>O(log n)</b>.`, `nums[mid] = ${target}: found at index ${mid}! We dropped half each step: <b>O(log n)</b>.`), true);
        break;
      }
      if (nums[lo] <= nums[mid]) {
        const inside = nums[lo] <= target && target < nums[mid];
        snap(6, mid, T(`${nums[lo]} ≤ ${nums[mid]}: la mitad <b>izquierda</b> está ordenada. ¿El ${target} cae entre ${nums[lo]} y ${nums[mid]}? ${inside ? 'Sí → busca a la izquierda.' : 'No → busca a la derecha.'}`, `${nums[lo]} ≤ ${nums[mid]}: the <b>left</b> half is sorted. Is ${target} between ${nums[lo]} and ${nums[mid]}? ${inside ? 'Yes → search left.' : 'No → search right.'}`));
        if (inside) hi = mid - 1;
        else lo = mid + 1;
      } else {
        const inside = nums[mid] < target && target <= nums[hi];
        snap(9, mid, T(`${nums[lo]} > ${nums[mid]}: la mitad <b>derecha</b> está ordenada. ¿El ${target} cae entre ${nums[mid]} y ${nums[hi]}? ${inside ? 'Sí → busca a la derecha.' : 'No → busca a la izquierda.'}`, `${nums[lo]} > ${nums[mid]}: the <b>right</b> half is sorted. Is ${target} between ${nums[mid]} and ${nums[hi]}? ${inside ? 'Yes → search right.' : 'No → search left.'}`));
        if (inside) lo = mid + 1;
        else hi = mid - 1;
      }
    }
    return frames;
  }

  function kadaneFrames(nums) {
    let cur = nums[0];
    let best = nums[0];
    let start = 0;
    let bs = 0;
    let be = 0;
    const frames = [{ line: 0, array: { values: nums, hl: { 0: 'cur' } }, vars: { cur, best }, note: T(`Empezamos con el primero: <code>cur = best = ${nums[0]}</code>.`, `Start with the first: <code>cur = best = ${nums[0]}</code>.`) }];
    for (let i = 1; i < nums.length; i++) {
      const x = nums[i];
      const restart = x > cur + x;
      if (restart) {
        cur = x;
        start = i;
      } else cur += x;
      if (cur > best) {
        best = cur;
        bs = start;
        be = i;
      }
      frames.push({
        line: 2,
        array: { values: nums, hl: { ...range(start, i, 'cur') } },
        vars: { cur, best },
        note: restart
          ? T(`Lo que traías sumaba menos que ${x} solo: <b>tíralo</b> y empieza de nuevo en ${x}.`, `What you had added up to less than ${x} alone: <b>drop it</b> and start over at ${x}.`)
          : T(`Te conviene seguir: cur = ${cur}.${cur === best ? ` ¡Nuevo récord: ${best}!` : ''}`, `Worth continuing: cur = ${cur}.${cur === best ? ` New record: ${best}!` : ''}`),
      });
    }
    frames.push({ line: 5, array: { values: nums, hl: range(bs, be, 'good') }, vars: { best }, note: T(`La mejor racha suma <b>${best}</b>. Ese es el algoritmo de Kadane: una pasada, O(n), y O(1) de memoria.`, `The best streak adds up to <b>${best}</b>. That’s Kadane’s algorithm: one pass, O(n), and O(1) memory.`) });
    return frames;
  }

  function xorFrames(nums) {
    let acc = 0;
    const frames = [{ line: 0, array: { values: nums }, vars: { acc: '0000' }, note: T('Todos vienen en pareja menos uno. Truco: <code>x ^ x = 0</code> y <code>x ^ 0 = x</code>.', 'Every number comes in a pair except one. Trick: <code>x ^ x = 0</code> and <code>x ^ 0 = x</code>.') }];
    nums.forEach((x, i) => {
      const before = acc;
      acc ^= x;
      frames.push({ line: 2, array: { values: nums, hl: { ...range(0, i - 1, 'dim'), [i]: 'cur' } }, vars: { acc: `${bin(before)} ^ ${bin(x)} = ${bin(acc)}`, decimal: acc }, note: T(`acc ^ ${x}: cada bit se prende si es distinto. Las parejas se van cancelando solas.`, `acc ^ ${x}: each bit turns on if they differ. Pairs cancel out by themselves.`) });
    });
    frames.push({ line: 4, array: { values: nums, hl: Object.fromEntries(nums.map((v, i) => [i, v === acc ? 'good' : 'dim'])) }, vars: { acc }, note: T(`Las parejas se cancelaron y quedó el solitario: <b>${acc}</b>. O(n) y sin Set: O(1) de memoria.`, `The pairs cancelled and the lonely one is left: <b>${acc}</b>. O(n) and no Set: O(1) memory.`) });
    return frames;
  }

  function popcountFrames(n) {
    const frames = [];
    let count = 0;
    const bits = (x) => [...bin(x)];
    frames.push({ line: 1, array: { values: bits(n), indices: false, hl: Object.fromEntries(bits(n).map((b, i) => [i, b === '1' ? 'cmp' : null]).filter(([, v]) => v)) }, vars: { n, count }, note: T(`${n} en binario es ${bin(n)}. Contemos los 1 con un truco.`, `${n} in binary is ${bin(n)}. Let’s count the 1s with a trick.`) });
    while (n) {
      const low = bin(n).lastIndexOf('1');
      const m = n & (n - 1);
      count++;
      frames.push({ line: 3, array: { values: bits(m), indices: false, hl: { ...Object.fromEntries(bits(m).map((b, i) => [i, b === '1' ? 'cmp' : null]).filter(([, v]) => v)), [low]: 'bad' } }, vars: { 'n & (n-1)': `${bin(n)} & ${bin(n - 1)} = ${bin(m)}`, count }, note: T('<code>n & (n − 1)</code> apaga el 1 de más a la derecha. Cada vuelta quita un 1.', '<code>n & (n − 1)</code> turns off the rightmost 1. Each round removes one 1.') });
      n = m;
    }
    frames.push({ line: 5, array: { values: bits(0), indices: false }, vars: { count }, note: T(`Llegamos a 0: había <b>${count}</b> unos. Da tantas vueltas como unos haya, no como bits.`, `We reached 0: there were <b>${count}</b> ones. It loops as many times as there are ones, not bits.`) });
    return frames;
  }

  function islandFrames(grid) {
    const g = grid.map((r) => r.slice());
    const R = g.length;
    const C = g[0].length;
    const shown = grid.map((r) => r.map(String));
    const letters = 'ABCDEFG';
    let count = 0;
    const frames = [{ grid: { cells: shown.map((r) => r.slice()), colors: { 1: 'cmp', 0: 'dim' } }, vars: { islas: 0 }, note: T('1 es tierra 🌴, 0 es agua. Recorremos fila por fila buscando tierra que no hayamos visitado.', '1 is land 🌴, 0 is water. We scan row by row looking for land we haven’t visited.') }];
    for (let r = 0; r < R; r++) {
      for (let c2 = 0; c2 < C; c2++) {
        if (g[r][c2] !== 1) continue;
        count++;
        const L = letters[count - 1];
        frames.push({ grid: { cells: shown.map((x) => x.slice()), colors: { 1: 'cmp', 0: 'dim' }, hl: { [`${r},${c2}`]: 'cur' } }, vars: { islas: count }, note: T(`¡Tierra nueva en (${r}, ${c2})! Isla ${L}. Ahora la “hundimos” toda con DFS para no contarla dos veces.`, `New land at (${r}, ${c2})! Island ${L}. Now we “sink” all of it with DFS so we don’t count it twice.`) });
        const stack = [[r, c2]];
        g[r][c2] = 0;
        while (stack.length) {
          const [y, x] = stack.pop();
          shown[y][x] = L;
          const hl = {};
          for (let yy = 0; yy < R; yy++) for (let xx = 0; xx < C; xx++) if (letters.includes(shown[yy][xx])) hl[`${yy},${xx}`] = 'good';
          hl[`${y},${x}`] = 'cur';
          frames.push({ grid: { cells: shown.map((s) => s.slice()), colors: { 1: 'cmp', 0: 'dim' }, hl }, vars: { islas: count }, note: T(`Visita (${y}, ${x}) y mete a sus vecinos de tierra (arriba, abajo, izquierda, derecha).`, `Visit (${y}, ${x}) and push its land neighbors (up, down, left, right).`) });
          for (const [dy, dx] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
            const ny = y + dy;
            const nx = x + dx;
            if (ny >= 0 && ny < R && nx >= 0 && nx < C && g[ny][nx] === 1) {
              g[ny][nx] = 0;
              stack.push([ny, nx]);
            }
          }
        }
      }
    }
    const hl = {};
    for (let y = 0; y < R; y++) for (let x = 0; x < C; x++) if (letters.includes(shown[y][x])) hl[`${y},${x}`] = 'good';
    frames.push({ grid: { cells: shown.map((s) => s.slice()), colors: { 0: 'dim' }, hl }, vars: { islas: count }, note: T(`<b>${count}</b> islas. Cada casilla se visitó una vez: <b>O(filas × columnas)</b>.`, `<b>${count}</b> islands. Each cell was visited once: <b>O(rows × columns)</b>.`) });
    return frames;
  }

  function topoFrames(nodes, edges) {
    const indeg = Object.fromEntries(nodes.map((n) => [n, 0]));
    for (const [, b] of edges) indeg[b]++;
    const queue = nodes.filter((n) => indeg[n] === 0);
    const order = [];
    const frames = [];
    const labels = () => Object.fromEntries(nodes.filter((n) => !order.includes(n)).map((n) => [n, String(indeg[n])]));
    const hl = (cur) => Object.fromEntries(nodes.map((n) => [n, order.includes(n) ? 'good' : n === cur ? 'cur' : queue.includes(n) ? 'cmp' : null]).filter(([, v]) => v));
    frames.push({ line: 2, graph: { labels: labels(), hl: hl() }, queue: { items: queue.slice() }, vars: { orden: [] }, note: T('El número de cada nodo es cuántos requisitos le faltan. Los que tienen <b>0</b> ya se pueden tomar: van a la cola.', 'Each node’s number is how many prerequisites it still needs. The ones with <b>0</b> can be taken now: they go in the queue.') });
    while (queue.length) {
      const u = queue.shift();
      order.push(u);
      const freed = [];
      for (const [a, b] of edges) {
        if (a !== u) continue;
        indeg[b]--;
        if (indeg[b] === 0) {
          queue.push(b);
          freed.push(b);
        }
      }
      frames.push({
        line: 5,
        graph: { labels: labels(), hl: hl(u), ehl: Object.fromEntries(edges.filter(([a]) => a === u).map(([a, b]) => [`${a}-${b}`, 'cur'])) },
        queue: { items: queue.slice() },
        vars: { orden: order.slice() },
        note: freed.length
          ? T(`Sale <b>${u}</b> de la cola. A sus siguientes les falta un requisito menos; ${freed.join(' y ')} ${freed.length > 1 ? 'quedan' : 'queda'} en 0 y ${freed.length > 1 ? 'entran' : 'entra'} a la cola.`, `<b>${u}</b> leaves the queue. Its dependents need one prerequisite fewer; ${freed.join(' and ')} reach${freed.length > 1 ? '' : 'es'} 0 and join the queue.`)
          : T(`Sale <b>${u}</b> de la cola.${edges.some(([a]) => a === u) ? ' A los demás todavía les falta algo.' : ' No desbloquea a nadie.'}`, `<b>${u}</b> leaves the queue.${edges.some(([a]) => a === u) ? ' The others still need something.' : ' It doesn’t unlock anyone.'}`),
      });
    }
    frames.push({ line: 10, graph: { hl: hl() }, queue: { items: [] }, vars: { orden: order }, note: T(`Orden válido: ${order.join(' → ')}. Si al final faltaran nodos, habría un <b>ciclo</b> (nadie llega a 0).`, `A valid order: ${order.join(' → ')}. If some nodes were missing at the end, there’d be a <b>cycle</b> (nobody reaches 0).`) });
    return frames;
  }

  function pathsFrames(R, C) {
    const dp = Array.from({ length: R }, () => Array(C).fill(''));
    const frames = [];
    const snap = (hl, note) => frames.push({ grid: { cells: dp.map((r) => r.slice()), hl }, note });
    for (let j = 0; j < C; j++) dp[0][j] = 1;
    for (let i = 0; i < R; i++) dp[i][0] = 1;
    snap({ ...Object.fromEntries(Array.from({ length: C }, (_, j) => [`0,${j}`, 'good'])), ...Object.fromEntries(Array.from({ length: R }, (_, i) => [`${i},0`, 'good'])) }, T(`Solo puedes ir a la derecha o abajo. A la primera fila y a la primera columna se llega de <b>una</b> sola forma.`, `You can only go right or down. The first row and first column can be reached in just <b>one</b> way.`));
    for (let i = 1; i < R; i++) {
      for (let j = 1; j < C; j++) {
        dp[i][j] = dp[i - 1][j] + dp[i][j - 1];
        snap({ [`${i},${j}`]: 'cur', [`${i - 1},${j}`]: 'cmp', [`${i},${j - 1}`]: 'cmp' }, T(`Llegas desde arriba (${dp[i - 1][j]}) o desde la izquierda (${dp[i][j - 1]}): ${dp[i - 1][j]} + ${dp[i][j - 1]} = <b>${dp[i][j]}</b>.`, `You arrive from above (${dp[i - 1][j]}) or from the left (${dp[i][j - 1]}): ${dp[i - 1][j]} + ${dp[i][j - 1]} = <b>${dp[i][j]}</b>.`));
      }
    }
    snap({ [`${R - 1},${C - 1}`]: 'good' }, T(`<b>${dp[R - 1][C - 1]}</b> caminos distintos a la esquina. Cada casilla se calcula una vez con las dos de antes: O(filas × columnas).`, `<b>${dp[R - 1][C - 1]}</b> different paths to the corner. Each cell is computed once from the two before it: O(rows × columns).`));
    return frames;
  }

  function lcsFrames(a, b) {
    const dp = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
    const frames = [];
    const show = () => dp.map((r, i) => r.map((v, j) => (i === 0 || j === 0 ? 0 : i <= done ? v : '')));
    let done = 0;
    const base = { rows: ['', ...a], cols: ['', ...b] };
    frames.push({ line: 0, grid: { ...base, cells: show(), colors: { 0: 'dim' } }, note: T(`dp[i][j] = la subsecuencia común más larga entre los primeros i de "${a}" y los primeros j de "${b}". Con un texto vacío es 0.`, `dp[i][j] = the longest common subsequence between the first i of "${a}" and the first j of "${b}". With an empty string it’s 0.`) });
    for (let i = 1; i <= a.length; i++) {
      const hl = {};
      for (let j = 1; j <= b.length; j++) {
        if (a[i - 1] === b[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
          hl[`${i},${j}`] = 'good';
        } else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
      done = i;
      const matches = [...b].filter((ch) => ch === a[i - 1]).length;
      frames.push({
        line: 4,
        grid: { ...base, cells: show(), hl: { ...hl, ...Object.fromEntries(Array.from({ length: b.length }, (_, j) => [`${i},${j + 1}`, hl[`${i},${j + 1}`] || 'cur'])) } },
        note: matches
          ? T(`Fila de la <b>${a[i - 1]}</b>: donde las letras coinciden (verde) vale la diagonal + 1. Donde no, el mayor entre arriba e izquierda.`, `Row for <b>${a[i - 1]}</b>: where the letters match (green) it’s the diagonal + 1. Elsewhere, the larger of above and left.`)
          : T(`Fila de la <b>${a[i - 1]}</b>: no coincide con nada, así que cada casilla copia el mayor entre arriba e izquierda.`, `Row for <b>${a[i - 1]}</b>: it matches nothing, so each cell copies the larger of above and left.`),
      });
    }
    frames.push({ line: 6, grid: { ...base, cells: show(), hl: { [`${a.length},${b.length}`]: 'good' } }, note: T(`La esquina dice <b>${dp[a.length][b.length]}</b>. Tabla de (n+1) × (m+1): O(n·m) tiempo y memoria.`, `The corner says <b>${dp[a.length][b.length]}</b>. An (n+1) × (m+1) table: O(n·m) time and memory.`) });
    return frames;
  }

  // ─────────── Datos ───────────
  const islandsGrid = [
    [1, 1, 0, 0, 0],
    [1, 1, 0, 0, 1],
    [0, 0, 1, 0, 1],
    [0, 0, 0, 1, 1],
  ];
  const topoNodes = ['JS', 'DOM', 'Async', 'React', 'Node'];
  const topoEdges = [['JS', 'DOM'], ['JS', 'Async'], ['DOM', 'React'], ['Async', 'React'], ['Async', 'Node']];
  const N = (value, left, right) => ({ value, ...(left ? { left } : {}), ...(right ? { right } : {}) });

  c.lessons.push(
    // ═══════════════ Sumas prefijo ═══════════════
    {
      id: 'prefix-sums',
      unit: U1,
      icon: '📈',
      title: T('Sumas prefijo', 'Prefix sums'),
      blurb: T('Sumar cualquier pedazo con una resta', 'Summing any chunk with one subtraction'),
      steps: [
        {
          type: 'read',
          title: T('Sumar una vez, preguntar mil', 'Add once, ask a thousand times'),
          code: 'const prefix = [0];\nfor (const x of nums) prefix.push(prefix.at(-1) + x);\n// suma de nums[l..r]:\nprefix[r + 1] - prefix[l];',
          body: T(
            '<p>Si te van a preguntar muchas veces “¿cuánto suman los elementos del 2 al 7?”, sumar cada vez cuesta O(n).</p><p>Truco: guarda en <code>prefix[i]</code> la suma de los primeros <code>i</code>. Cualquier pedazo es una resta de dos prefijos: O(1).</p>',
            '<p>If you’ll be asked many times “what do elements 2 through 7 add up to?”, summing each time costs O(n).</p><p>Trick: store in <code>prefix[i]</code> the sum of the first <code>i</code>. Any chunk is a subtraction of two prefixes: O(1).</p>'
          ),
        },
        {
          type: 'viz',
          prompt: T('Mira cómo se arma <code>prefix</code> y cómo contesta una pregunta.', 'Watch <code>prefix</code> get built and answer a question.'),
          code: 'const prefix = [0];\nfor (let i = 0; i < nums.length; i++) {\n  prefix.push(prefix[i] + nums[i]);\n}\nconst sum = prefix[r + 1] - prefix[l];',
          frames: prefixFrames([3, 1, 4, 1, 5]),
        },
        {
          type: 'number',
          prompt: T('Con <code>prefix = [0, 3, 4, 8, 9, 14]</code>, ¿cuánto suman <code>nums[2..4]</code>?', 'With <code>prefix = [0, 3, 4, 8, 9, 14]</code>, what do <code>nums[2..4]</code> add up to?'),
          answer: 10,
          explain: T('<code>prefix[5] − prefix[2]</code> = 14 − 4 = 10. Comprueba: 4 + 1 + 5 = 10.', '<code>prefix[5] − prefix[2]</code> = 14 − 4 = 10. Check: 4 + 1 + 5 = 10.'),
        },
        {
          type: 'viz',
          prompt: T('El clásico: ¿cuántos pedazos seguidos suman <b>k</b>? Sumas prefijo + hash map.', 'The classic: how many contiguous chunks add up to <b>k</b>? Prefix sums + a hash map.'),
          code: 'let sum = 0, count = 0;\nconst seen = { 0: 1 };\nfor (const x of nums) {\n  sum += x;\n  count += seen[sum - k] || 0;\n  seen[sum] = (seen[sum] || 0) + 1;\n}\nreturn count;',
          frames: subarraySumFrames([1, 2, 1, 3], 3),
        },
        {
          type: 'choice',
          prompt: T('¿Para qué empieza <code>seen</code> con <code>{0: 1}</code>?', 'Why does <code>seen</code> start as <code>{0: 1}</code>?'),
          options: [
            T('Para contar los pedazos que empiezan desde el índice 0', 'To count chunks that start at index 0'),
            T('Para que el objeto no esté vacío', 'So the object isn’t empty'),
            T('Para evitar dividir entre cero', 'To avoid dividing by zero'),
          ],
          answer: 0,
          explain: T('Si la suma acumulada ya es k, el pedazo es “desde el principio”: necesitas haber visto la suma 0, la de no tomar nada.', 'If the running sum is already k, the chunk goes “from the start”: you need to have seen sum 0, the sum of taking nothing.'),
        },
        {
          type: 'code',
          prompt: T('Escribe <code>subarraySum(nums, k)</code>: cuántos pedazos seguidos suman exactamente <code>k</code>. Funciona con negativos.', 'Write <code>subarraySum(nums, k)</code>: how many contiguous chunks add up to exactly <code>k</code>. It works with negatives.'),
          fnName: 'subarraySum',
          starter: 'function subarraySum(nums, k) {\n  let sum = 0;\n  let count = 0;\n  const seen = { 0: 1 };\n  for (const x of nums) {\n    \n  }\n  return count;\n}\n',
          tests: [
            { args: [[1, 1, 1], 2], expect: 2 },
            { args: [[1, 2, 3], 3], expect: 2 },
            { args: [[1, -1, 0], 0], expect: 3 },
            { args: [[3], 3], expect: 1 },
            { args: [[1, 2], 5], expect: 0 },
          ],
          hint: T('Suma <code>x</code>, luego suma a <code>count</code> cuántas veces viste <code>sum - k</code>, y al final anota <code>sum</code> en <code>seen</code>. El orden importa.', 'Add <code>x</code>, then add to <code>count</code> how many times you saw <code>sum - k</code>, and finally record <code>sum</code> in <code>seen</code>. The order matters.'),
          solution: 'function subarraySum(nums, k) {\n  let sum = 0;\n  let count = 0;\n  const seen = { 0: 1 };\n  for (const x of nums) {\n    sum += x;\n    count += seen[sum - k] || 0;\n    seen[sum] = (seen[sum] || 0) + 1;\n  }\n  return count;\n}',
          complexity: { time: 'O(n)', space: 'O(n)' },
          explain: T('Con negativos la ventana deslizante no sirve (la suma no crece siempre), pero los prefijos sí. Es LeetCode 560.', 'With negatives a sliding window doesn’t work (the sum doesn’t always grow), but prefixes do. It’s LeetCode 560.'),
        },
      ],
    },

    // ═══════════════ Ventana variable ═══════════════
    {
      id: 'sliding-window-2',
      unit: U1,
      icon: '🐛',
      title: T('Ventana que se estira', 'A window that stretches'),
      blurb: T('Crece por la derecha, encoge por la izquierda', 'Grow on the right, shrink on the left'),
      steps: [
        {
          type: 'read',
          title: T('Como un gusanito', 'Like an inchworm'),
          code: 'let L = 0;\nfor (let R = 0; R < s.length; R++) {\n  // mete s[R]\n  while (/* la ventana ya no sirve */) {\n    // saca s[L]\n    L++;\n  }\n  // aquí la ventana sí sirve: ¿es la mejor?\n}',
          body: T(
            '<p>En la ventana fija el tamaño no cambiaba. Muchas preguntas son “el pedazo <b>más largo</b> que cumpla X”.</p><p>Entonces: <code>R</code> siempre avanza para crecer, y cuando la ventana se rompe, <code>L</code> avanza hasta arreglarla. Como un gusanito.</p>',
            '<p>In the fixed window the size never changed. Many questions are “the <b>longest</b> chunk that satisfies X”.</p><p>So: <code>R</code> always advances to grow, and when the window breaks, <code>L</code> advances until it’s fixed. Like an inchworm.</p>'
          ),
        },
        {
          type: 'viz',
          prompt: T('El texto más largo <b>sin letras repetidas</b> dentro de <code>"pwwkew"</code>.', 'The longest stretch <b>with no repeated letters</b> inside <code>"pwwkew"</code>.'),
          code: 'const set = new Set();\nlet L = 0, best = 0;\nfor (let R = 0; R < s.length; R++) {\n  while (set.has(s[R])) {\n    set.delete(s[L++]);\n  }\n  set.add(s[R]);\n  best = Math.max(best, R - L + 1);\n}',
          frames: longestUniqueFrames('pwwkew').map((f) => ({ ...f, line: f.line === 6 ? 7 : f.line })),
        },
        {
          type: 'choice',
          prompt: T('Hay un <code>while</code> dentro del <code>for</code>. ¿Cuánto cuesta en total?', 'There’s a <code>while</code> inside the <code>for</code>. What does it cost in total?'),
          options: ['O(n)', 'O(n²)', 'O(n log n)'],
          answer: 0,
          explain: T('<code>L</code> y <code>R</code> solo avanzan, nunca regresan: cada uno da máximo n pasos. 2n en total.', '<code>L</code> and <code>R</code> only move forward, never back: each takes at most n steps. 2n in total.'),
        },
        {
          type: 'code',
          prompt: T('Escribe <code>longestUnique(s)</code>: el largo del pedazo más largo sin letras repetidas.', 'Write <code>longestUnique(s)</code>: the length of the longest stretch with no repeated letters.'),
          fnName: 'longestUnique',
          starter: 'function longestUnique(s) {\n  const set = new Set();\n  let L = 0;\n  let best = 0;\n  for (let R = 0; R < s.length; R++) {\n    \n  }\n  return best;\n}\n',
          tests: [
            { args: ['abcabcbb'], expect: 3 },
            { args: ['bbbbb'], expect: 1 },
            { args: ['pwwkew'], expect: 3 },
            { args: ['dvdf'], expect: 3 },
            { args: [''], expect: 0 },
          ],
          hint: T('Mientras <code>s[R]</code> ya esté en el Set, saca <code>s[L]</code> y avanza <code>L</code>. Luego mete <code>s[R]</code> y actualiza <code>best</code> con <code>R - L + 1</code>.', 'While <code>s[R]</code> is already in the Set, remove <code>s[L]</code> and advance <code>L</code>. Then add <code>s[R]</code> and update <code>best</code> with <code>R - L + 1</code>.'),
          solution: 'function longestUnique(s) {\n  const set = new Set();\n  let L = 0;\n  let best = 0;\n  for (let R = 0; R < s.length; R++) {\n    while (set.has(s[R])) {\n      set.delete(s[L]);\n      L++;\n    }\n    set.add(s[R]);\n    best = Math.max(best, R - L + 1);\n  }\n  return best;\n}',
          complexity: { time: 'O(n)', space: 'O(n)' },
          explain: T('Es LeetCode 3, de los más preguntados. Con <code>"dvdf"</code> se ve por qué hay que sacar letras hasta que la repetida se vaya, no solo una.', 'It’s LeetCode 3, one of the most asked. <code>"dvdf"</code> shows why you remove letters until the repeat is gone, not just one.'),
        },
      ],
    },

    // ═══════════════ Búsqueda binaria pro ═══════════════
    {
      id: 'binary-search-2',
      unit: U1,
      icon: '🎚️',
      title: T('Búsqueda binaria pro', 'Binary search, pro level'),
      blurb: T('Arrays girados y buscar la respuesta', 'Rotated arrays and searching the answer'),
      steps: [
        {
          type: 'read',
          title: T('Tirar la mitad', 'Throw away half'),
          code: '[4, 5, 6, 7, 0, 1, 2] // ordenado, pero “girado”',
          body: T(
            '<p>La búsqueda binaria no es solo para arrays ordenados: sirve siempre que puedas decir “la respuesta <b>no</b> está en esta mitad”.</p><p>En un array girado, una de las dos mitades siempre está ordenada. Revisa si el número cae en esa; si no, está en la otra.</p>',
            '<p>Binary search isn’t only for sorted arrays: it works whenever you can say “the answer is <b>not</b> in this half”.</p><p>In a rotated array, one of the two halves is always sorted. Check whether the number falls in that one; if not, it’s in the other.</p>'
          ),
        },
        {
          type: 'viz',
          prompt: T('Buscamos el 0 en un array girado.', 'We search for 0 in a rotated array.'),
          code: 'let lo = 0, hi = nums.length - 1;\nwhile (lo <= hi) {\n  const mid = Math.floor((lo + hi) / 2);\n  if (nums[mid] === target) return mid;\n  if (nums[lo] <= nums[mid]) {\n    // la izquierda está ordenada\n    if (nums[lo] <= target && target < nums[mid]) hi = mid - 1;\n    else lo = mid + 1;\n  } else {\n    // la derecha está ordenada\n    if (nums[mid] < target && target <= nums[hi]) lo = mid + 1;\n    else hi = mid - 1;\n  }\n}\nreturn -1;',
          frames: rotatedFrames([4, 5, 6, 7, 0, 1, 2], 0).map((f) => ({ ...f, line: { 1: 0, 4: 3, 6: 6, 9: 10 }[f.line] })),
        },
        {
          type: 'choice',
          prompt: T('Quieres la raíz cuadrada entera de <code>x</code> sin <code>Math.sqrt</code>. ¿Sobre qué haces búsqueda binaria?', 'You want the integer square root of <code>x</code> without <code>Math.sqrt</code>. What do you binary search over?'),
          options: [
            T('Sobre las respuestas posibles, de 0 a x: ¿<code>mid * mid</code> se pasa o no?', 'Over the possible answers, from 0 to x: does <code>mid * mid</code> overshoot or not?'),
            T('Sobre los dígitos de x', 'Over the digits of x'),
            T('No se puede con búsqueda binaria', 'You can’t use binary search'),
          ],
          answer: 0,
          explain: T('“Buscar la respuesta”: si <code>mid²</code> ya se pasa, todos los mayores también; tiras esa mitad. Es el mismo truco de “velocidad mínima para comer plátanos” y otros clásicos.', '“Searching the answer”: if <code>mid²</code> already overshoots, every bigger one does too; drop that half. It’s the same trick as “minimum banana-eating speed” and other classics.'),
        },
        {
          type: 'code',
          prompt: T('Escribe <code>searchRotated(nums, target)</code>: el índice de <code>target</code> en un array ordenado y girado (sin repetidos), o <code>-1</code>. En O(log n).', 'Write <code>searchRotated(nums, target)</code>: the index of <code>target</code> in a sorted, rotated array (no duplicates), or <code>-1</code>. In O(log n).'),
          fnName: 'searchRotated',
          starter: 'function searchRotated(nums, target) {\n  let lo = 0;\n  let hi = nums.length - 1;\n  while (lo <= hi) {\n    const mid = Math.floor((lo + hi) / 2);\n    if (nums[mid] === target) return mid;\n    // ¿Qué mitad está ordenada? ¿El target cae en ella?\n    break; // ← borra esto cuando muevas lo o hi\n  }\n  return -1;\n}\n',
          tests: [
            { args: [[4, 5, 6, 7, 0, 1, 2], 0], expect: 4 },
            { args: [[4, 5, 6, 7, 0, 1, 2], 3], expect: -1 },
            { args: [[5, 1, 3], 5], expect: 0 },
            { args: [[3, 1], 1], expect: 1 },
            { args: [[1], 0], expect: -1 },
            { args: [[1, 2, 3, 4, 5], 4], expect: 3 },
          ],
          hint: T('Si <code>nums[lo] <= nums[mid]</code>, la izquierda está ordenada: si <code>target</code> cae entre <code>nums[lo]</code> y <code>nums[mid]</code>, <code>hi = mid - 1</code>; si no, <code>lo = mid + 1</code>. Si no, haz lo mismo con la derecha.', 'If <code>nums[lo] <= nums[mid]</code>, the left is sorted: if <code>target</code> falls between <code>nums[lo]</code> and <code>nums[mid]</code>, <code>hi = mid - 1</code>; otherwise <code>lo = mid + 1</code>. Else do the same with the right.'),
          solution: 'function searchRotated(nums, target) {\n  let lo = 0;\n  let hi = nums.length - 1;\n  while (lo <= hi) {\n    const mid = Math.floor((lo + hi) / 2);\n    if (nums[mid] === target) return mid;\n    if (nums[lo] <= nums[mid]) {\n      if (nums[lo] <= target && target < nums[mid]) hi = mid - 1;\n      else lo = mid + 1;\n    } else {\n      if (nums[mid] < target && target <= nums[hi]) lo = mid + 1;\n      else hi = mid - 1;\n    }\n  }\n  return -1;\n}',
          complexity: { time: 'O(log n)', space: 'O(1)' },
          explain: T('Es LeetCode 33. El <code>&lt;=</code> en <code>nums[lo] <= nums[mid]</code> importa cuando <code>lo === mid</code> (quedan dos).', 'It’s LeetCode 33. The <code>&lt;=</code> in <code>nums[lo] <= nums[mid]</code> matters when <code>lo === mid</code> (two left).'),
        },
      ],
    },

    // ═══════════════ Greedy ═══════════════
    {
      id: 'greedy',
      unit: U1,
      icon: '🪙',
      title: T('Greedy: lo mejor ahorita', 'Greedy: the best right now'),
      blurb: T('Cuándo tomar lo que se ve mejor sí funciona', 'When taking what looks best actually works'),
      steps: [
        {
          type: 'read',
          title: T('Agarrar lo mejor de cada paso', 'Grab the best at each step'),
          code: '// Monedas [1, 3, 4], juntar 6:\n// greedy: 4 + 1 + 1  → 3 monedas\n// mejor:  3 + 3      → 2 monedas',
          body: T(
            '<p>Un algoritmo <b>greedy</b> (codicioso) toma la mejor decisión de este momento y nunca se arrepiente.</p><p>Cuando funciona es rapidísimo y simple. Pero no siempre funciona: con las monedas de arriba, ir por la más grande falla. Ahí necesitas programación dinámica.</p>',
            '<p>A <b>greedy</b> algorithm takes the best decision right now and never looks back.</p><p>When it works it’s super fast and simple. But it doesn’t always work: with the coins above, going for the biggest fails. That’s when you need dynamic programming.</p>'
          ),
        },
        {
          type: 'viz',
          prompt: T('El pedazo seguido que <b>más suma</b> (algoritmo de Kadane): en cada paso, ¿sigo o empiezo de nuevo?', 'The contiguous chunk with the <b>largest sum</b> (Kadane’s algorithm): at each step, continue or start over?'),
          code: 'let cur = nums[0], best = nums[0];\nfor (let i = 1; i < nums.length; i++) {\n  cur = Math.max(nums[i], cur + nums[i]);\n  best = Math.max(best, cur);\n}\nreturn best;',
          frames: kadaneFrames([-2, 1, -3, 4, -1, 2, 1, -5, 4]),
        },
        {
          type: 'choice',
          prompt: T('“Jump game”: en <code>[2, 3, 1, 1, 4]</code> cada número dice cuánto puedes saltar como máximo. La idea greedy es…', '“Jump game”: in <code>[2, 3, 1, 1, 4]</code> each number says how far you can jump at most. The greedy idea is…'),
          options: [
            T('Llevar la cuenta de lo más lejos que puedes llegar, y ver si alguna casilla queda fuera', 'Track the farthest you can reach, and see whether some cell is left out'),
            T('Probar todos los caminos de saltos', 'Try every path of jumps'),
            T('Saltar siempre lo máximo', 'Always jump the maximum'),
          ],
          answer: 0,
          why: { 2: T('Saltar lo máximo puede caer en un 0. En <code>[3, 2, 1, 0, 4]</code> todo camino acaba en el 0.', 'Jumping the max can land on a 0. In <code>[3, 2, 1, 0, 4]</code> every path ends on the 0.') },
          explain: T('<code>reach = max(reach, i + nums[i])</code>. Si llegas a una casilla <code>i > reach</code>, no hay forma de pisarla. Una pasada.', '<code>reach = max(reach, i + nums[i])</code>. If you get to a cell <code>i > reach</code>, there’s no way to step on it. One pass.'),
        },
        {
          type: 'code',
          prompt: T('Escribe <code>maxSubarray(nums)</code>: la suma más grande de un pedazo seguido (al menos un número).', 'Write <code>maxSubarray(nums)</code>: the largest sum of a contiguous chunk (at least one number).'),
          fnName: 'maxSubarray',
          starter: 'function maxSubarray(nums) {\n  let cur = nums[0];\n  let best = nums[0];\n  for (let i = 1; i < nums.length; i++) {\n    \n  }\n  return best;\n}\n',
          tests: [
            { args: [[-2, 1, -3, 4, -1, 2, 1, -5, 4]], expect: 6 },
            { args: [[5, 4, -1, 7, 8]], expect: 23 },
            { args: [[-3, -1, -2]], expect: -1 },
            { args: [[1]], expect: 1 },
          ],
          hint: T('<code>cur</code> es la mejor suma que <b>acaba</b> en <code>i</code>: o sigues (<code>cur + nums[i]</code>) o empiezas de nuevo (<code>nums[i]</code>). Luego actualiza <code>best</code>.', '<code>cur</code> is the best sum <b>ending</b> at <code>i</code>: either continue (<code>cur + nums[i]</code>) or start over (<code>nums[i]</code>). Then update <code>best</code>.'),
          solution: 'function maxSubarray(nums) {\n  let cur = nums[0];\n  let best = nums[0];\n  for (let i = 1; i < nums.length; i++) {\n    cur = Math.max(nums[i], cur + nums[i]);\n    best = Math.max(best, cur);\n  }\n  return best;\n}',
          complexity: { time: 'O(n)', space: 'O(1)' },
          explain: T('Con todos negativos, la respuesta es el menos negativo: por eso se empieza con <code>nums[0]</code> y no con 0.', 'With all negatives, the answer is the least negative: that’s why you start with <code>nums[0]</code> and not 0.'),
        },
        {
          type: 'code',
          prompt: T('Escribe <code>canJump(nums)</code>: ¿puedes llegar a la última casilla empezando en la primera?', 'Write <code>canJump(nums)</code>: can you reach the last cell starting at the first?'),
          fnName: 'canJump',
          starter: 'function canJump(nums) {\n  let reach = 0;\n  for (let i = 0; i < nums.length; i++) {\n    \n  }\n  return true;\n}\n',
          tests: [
            { args: [[2, 3, 1, 1, 4]], expect: true },
            { args: [[3, 2, 1, 0, 4]], expect: false },
            { args: [[0]], expect: true },
            { args: [[2, 0, 0]], expect: true },
            { args: [[1, 0, 1]], expect: false },
          ],
          hint: T('Si <code>i > reach</code>, no puedes llegar a <code>i</code>: regresa <code>false</code>. Si no, <code>reach = Math.max(reach, i + nums[i])</code>.', 'If <code>i > reach</code>, you can’t get to <code>i</code>: return <code>false</code>. Otherwise <code>reach = Math.max(reach, i + nums[i])</code>.'),
          solution: 'function canJump(nums) {\n  let reach = 0;\n  for (let i = 0; i < nums.length; i++) {\n    if (i > reach) return false;\n    reach = Math.max(reach, i + nums[i]);\n  }\n  return true;\n}',
          complexity: { time: 'O(n)', space: 'O(1)' },
          explain: T('Es LeetCode 55. La versión con DP también funciona, pero es O(n²); greedy lo baja a O(n).', 'It’s LeetCode 55. The DP version works too, but it’s O(n²); greedy brings it down to O(n).'),
        },
      ],
    },

    // ═══════════════ Bits ═══════════════
    {
      id: 'bits',
      unit: U1,
      icon: '💡',
      title: T('Manipulación de bits', 'Bit manipulation'),
      blurb: T('Ceros, unos y trucos con XOR', 'Zeros, ones and XOR tricks'),
      steps: [
        {
          type: 'read',
          title: T('Foquitos prendidos y apagados', 'Light bulbs on and off'),
          code: '6      // 110\n6 & 3  // 110 & 011 = 010 → 2  (los dos prendidos)\n6 | 3  // 110 | 011 = 111 → 7  (alguno prendido)\n6 ^ 3  // 110 ^ 011 = 101 → 5  (distintos)\n1 << 3 // 1000 → 8           (recorre a la izquierda)',
          body: T(
            '<p>Por dentro, cada número es una fila de foquitos: <b>bits</b> prendidos (1) o apagados (0).</p><p>Los operadores <code>&amp;</code>, <code>|</code>, <code>^</code> y <code>&lt;&lt;</code> trabajan foquito por foquito, y son rapidísimos. En entrevistas salen como trucos elegantes.</p>',
            '<p>Under the hood, every number is a row of light bulbs: <b>bits</b> on (1) or off (0).</p><p>The operators <code>&amp;</code>, <code>|</code>, <code>^</code> and <code>&lt;&lt;</code> work bulb by bulb, and they’re super fast. In interviews they show up as elegant tricks.</p>'
          ),
        },
        {
          type: 'choice',
          prompt: T('¿Cómo sabes si un número es <b>impar</b> con bits?', 'How do you tell if a number is <b>odd</b> with bits?'),
          options: ['<code>(n & 1) === 1</code>', '<code>(n | 1) === 1</code>', '<code>(n ^ 1) === 0</code>'],
          answer: 0,
          explain: T('El bit de más a la derecha vale 1: los impares lo tienen prendido. <code>n & 1</code> apaga todos los demás y te deja solo ese.', 'The rightmost bit is worth 1: odd numbers have it on. <code>n & 1</code> turns off all the others and leaves just that one.'),
        },
        {
          type: 'viz',
          prompt: T('Todos los números vienen en pareja menos uno. Encuéntralo con <b>XOR</b>.', 'Every number comes in a pair except one. Find it with <b>XOR</b>.'),
          code: 'let acc = 0;\nfor (const x of nums) {\n  acc ^= x;\n}\nreturn acc;',
          frames: xorFrames([4, 1, 2, 1, 2]),
        },
        {
          type: 'viz',
          prompt: T('¿Cuántos bits prendidos tiene el 13? Truco: <code>n & (n − 1)</code>.', 'How many bits are on in 13? Trick: <code>n & (n − 1)</code>.'),
          code: 'let count = 0;\n// n = 13\nwhile (n !== 0) {\n  n = n & (n - 1);\n  count++;\n}\nreturn count;',
          frames: popcountFrames(13).map((f) => ({ ...f, line: { 1: 1, 3: 3, 5: 6 }[f.line] })),
        },
        {
          type: 'number',
          prompt: T('¿Cuánto es <code>1 << 4</code>?', 'What is <code>1 << 4</code>?'),
          answer: 16,
          explain: T('Recorrer a la izquierda multiplica por 2 cada vez: 1 → 2 → 4 → 8 → 16. En binario: 10000.', 'Shifting left doubles each time: 1 → 2 → 4 → 8 → 16. In binary: 10000.'),
        },
        {
          type: 'code',
          prompt: T('Escribe <code>singleNumber(nums)</code>: todos aparecen dos veces menos uno. Regresa ese uno, con O(1) de memoria.', 'Write <code>singleNumber(nums)</code>: every number appears twice except one. Return that one, using O(1) memory.'),
          fnName: 'singleNumber',
          starter: 'function singleNumber(nums) {\n  let acc = 0;\n  \n  return acc;\n}\n',
          tests: [
            { args: [[2, 2, 1]], expect: 1 },
            { args: [[4, 1, 2, 1, 2]], expect: 4 },
            { args: [[0, 5, 0]], expect: 5 },
            { args: [[7]], expect: 7 },
          ],
          hint: T('Un <code>for...of</code> que haga <code>acc ^= x</code>. Nada más.', 'A <code>for...of</code> doing <code>acc ^= x</code>. That’s it.'),
          solution: 'function singleNumber(nums) {\n  let acc = 0;\n  for (const x of nums) acc ^= x;\n  return acc;\n}',
          complexity: { time: 'O(n)', space: 'O(1)' },
          explain: T('Con un Set también sale, pero usa O(n) de memoria. El entrevistador pide justo esta versión.', 'A Set works too, but uses O(n) memory. Interviewers ask for exactly this version.'),
        },
        {
          type: 'code',
          prompt: T('Escribe <code>countBits(n)</code>: cuántos bits prendidos tiene <code>n</code> (n ≥ 0).', 'Write <code>countBits(n)</code>: how many bits are on in <code>n</code> (n ≥ 0).'),
          fnName: 'countBits',
          starter: 'function countBits(n) {\n  let count = 0;\n  \n  return count;\n}\n',
          tests: [
            { args: [11], expect: 3 },
            { args: [128], expect: 1 },
            { args: [255], expect: 8 },
            { args: [0], expect: 0 },
          ],
          hint: T('<code>while (n !== 0)</code>: apaga el 1 de la derecha con <code>n = n & (n - 1)</code> y suma uno a <code>count</code>.', '<code>while (n !== 0)</code>: turn off the rightmost 1 with <code>n = n & (n - 1)</code> and add one to <code>count</code>.'),
          solution: 'function countBits(n) {\n  let count = 0;\n  while (n !== 0) {\n    n = n & (n - 1);\n    count++;\n  }\n  return count;\n}',
          complexity: { time: 'O(log n)', space: 'O(1)' },
          explain: T('Un número n tiene unos log₂ n bits, así que nunca da más vueltas que eso. Es LeetCode 191.', 'A number n has about log₂ n bits, so it never loops more than that. It’s LeetCode 191.'),
        },
      ],
    },

    // ═══════════════ BST ═══════════════
    {
      id: 'bst',
      unit: U2,
      icon: '🌲',
      title: T('Árboles de búsqueda (BST)', 'Binary search trees (BST)'),
      blurb: T('Búsqueda binaria hecha árbol', 'Binary search shaped like a tree'),
      steps: [
        {
          type: 'read',
          title: T('Menores a la izquierda', 'Smaller ones on the left'),
          code: '//        8\n//      /   \\\n//     3     10\n//    / \\      \\\n//   1   6      14\n//      / \\    /\n//     4   7  13',
          body: T(
            '<p>Un <b>árbol binario de búsqueda</b> (BST) tiene una regla: todo lo de la izquierda de un nodo es <b>menor</b>, y todo lo de la derecha es <b>mayor</b>.</p><p>Para buscar, comparas y bajas por un solo lado: es búsqueda binaria en forma de árbol. Si está balanceado, cuesta O(log n).</p>',
            '<p>A <b>binary search tree</b> (BST) has one rule: everything to the left of a node is <b>smaller</b>, and everything to the right is <b>bigger</b>.</p><p>To search, you compare and go down one side only: it’s binary search shaped like a tree. If it’s balanced, it costs O(log n).</p>'
          ),
        },
        {
          type: 'viz',
          prompt: T('Buscamos el 7 y luego metemos el 5.', 'We search for 7 and then insert 5.'),
          graph: {
            h: 120,
            nodes: { 8: [50, 0], 3: [25, 34], 10: [75, 34], 1: [12, 68], 6: [38, 68], 14: [88, 68], 4: [28, 100], 7: [50, 100], 13: [78, 100], 5: [38, 128] },
            edges: [[8, 3], [8, 10], [3, 1], [3, 6], [10, 14], [6, 4], [6, 7], [14, 13], [4, 5]],
          },
          frames: [
            { graph: { show: ['8', '3', '10', '1', '6', '14', '4', '7', '13'], hl: { 8: 'cur' } }, note: T('Buscamos el <b>7</b>. Empezamos en la raíz: 7 &lt; 8 → izquierda.', 'We look for <b>7</b>. Start at the root: 7 &lt; 8 → left.') },
            { graph: { show: ['8', '3', '10', '1', '6', '14', '4', '7', '13'], hl: { 8: 'dim', 3: 'cur', 10: 'dim', 14: 'dim', 13: 'dim' }, ehl: { '8-3': 'cur' } }, note: T('7 &gt; 3 → derecha. Todo el lado del 10 ya ni lo vemos.', '7 &gt; 3 → right. We don’t even look at the 10 side.') },
            { graph: { show: ['8', '3', '10', '1', '6', '14', '4', '7', '13'], hl: { 8: 'dim', 3: 'dim', 1: 'dim', 6: 'cur', 10: 'dim', 14: 'dim', 13: 'dim' }, ehl: { '8-3': 'cur', '3-6': 'cur' } }, note: T('7 &gt; 6 → derecha.', '7 &gt; 6 → right.') },
            { graph: { show: ['8', '3', '10', '1', '6', '14', '4', '7', '13'], hl: { 7: 'good' }, ehl: { '8-3': 'good', '3-6': 'good', '6-7': 'good' } }, note: T('¡Ahí está! 4 comparaciones en vez de revisar los 9 nodos.', 'There it is! 4 comparisons instead of checking all 9 nodes.') },
            { graph: { show: ['8', '3', '10', '1', '6', '14', '4', '7', '13'], hl: { 8: 'cur', 3: 'cur', 6: 'cur', 4: 'cur' }, ehl: { '8-3': 'cur', '3-6': 'cur', '6-4': 'cur' } }, note: T('Meter el <b>5</b>: se busca igual. 5 &lt; 8, 5 &gt; 3, 5 &lt; 6, 5 &gt; 4… y la derecha del 4 está vacía.', 'Insert <b>5</b>: search the same way. 5 &lt; 8, 5 &gt; 3, 5 &lt; 6, 5 &gt; 4… and 4’s right is empty.') },
            { graph: { hl: { 5: 'good' }, ehl: { '4-5': 'good' } }, note: T('Ahí se cuelga el 5. La regla se sigue cumpliendo sin mover a nadie.', '5 hangs there. The rule still holds without moving anyone.') },
          ],
        },
        {
          type: 'choice',
          prompt: T('Si recorres un BST <b>en orden</b> (izquierda, nodo, derecha), ¿qué sale?', 'If you traverse a BST <b>in order</b> (left, node, right), what comes out?'),
          options: [T('Los números ordenados de menor a mayor', 'The numbers sorted from smallest to largest'), T('Los números por niveles', 'The numbers level by level'), T('El orden en que se insertaron', 'The order they were inserted')],
          answer: 0,
          explain: T('Primero todo lo menor, luego el nodo, luego todo lo mayor: sale ordenado. Así se resuelve “el k-ésimo más chico”.', 'First everything smaller, then the node, then everything bigger: it comes out sorted. That’s how you solve “the k-th smallest”.'),
        },
        {
          type: 'choice',
          prompt: T('Para validar un BST, ¿basta revisar que cada hijo izquierdo sea menor que su papá y cada derecho mayor?', 'To validate a BST, is it enough to check that each left child is smaller than its parent and each right child bigger?'),
          options: [
            T('No: un nieto puede romper la regla con el abuelo (ej. un 6 a la izquierda del 5, colgando de un 3)', 'No: a grandchild can break the rule with the grandparent (e.g. a 6 on the left of 5, hanging from a 3)'),
            T('Sí, con eso basta', 'Yes, that’s enough'),
          ],
          answer: 0,
          explain: T('Cada nodo tiene un <b>rango</b> permitido que hereda de todos sus ancestros: al bajar a la izquierda, el máximo baja; a la derecha, el mínimo sube.', 'Each node has an allowed <b>range</b> inherited from all its ancestors: going left lowers the max; going right raises the min.'),
        },
        {
          type: 'code',
          prompt: T('Escribe <code>isValidBST(node)</code>: <code>true</code> si el árbol cumple la regla (sin repetidos). Cada nodo es <code>{ value, left, right }</code>.', 'Write <code>isValidBST(node)</code>: <code>true</code> if the tree follows the rule (no duplicates). Each node is <code>{ value, left, right }</code>.'),
          fnName: 'isValidBST',
          starter: 'function isValidBST(node, min = -Infinity, max = Infinity) {\n  if (!node) return true;\n  \n}\n',
          tests: [
            { args: [N(2, N(1), N(3))], expect: true, label: 'isValidBST(2 → [1, 3])' },
            { args: [N(5, N(1), N(4, N(3), N(6)))], expect: false, label: 'isValidBST(5 → [1, 4 → [3, 6]])' },
            { args: [N(5, N(3, null, N(6)), N(7))], expect: false, label: 'isValidBST(5 → [3 → [_, 6], 7])' },
            { args: [N(8, N(3, N(1), N(6)), N(10))], expect: true, label: 'isValidBST(8 → [3 → [1, 6], 10])' },
            { args: [N(2, N(2))], expect: false, label: 'isValidBST(2 → [2, _])' },
            { args: [null], expect: true, label: 'isValidBST(null)' },
          ],
          hint: T('Si <code>node.value</code> no está estrictamente entre <code>min</code> y <code>max</code>, es <code>false</code>. Luego revisa la izquierda con <code>max = node.value</code> y la derecha con <code>min = node.value</code>.', 'If <code>node.value</code> isn’t strictly between <code>min</code> and <code>max</code>, it’s <code>false</code>. Then check the left with <code>max = node.value</code> and the right with <code>min = node.value</code>.'),
          solution: 'function isValidBST(node, min = -Infinity, max = Infinity) {\n  if (!node) return true;\n  if (node.value <= min || node.value >= max) return false;\n  return isValidBST(node.left, min, node.value) && isValidBST(node.right, node.value, max);\n}',
          complexity: { time: 'O(n)', space: 'O(n)' },
          explain: T('El tercer caso es la trampa: el 6 es mayor que su papá (3), pero está a la izquierda del 5. Es LeetCode 98.', 'The third case is the trap: 6 is bigger than its parent (3), but it’s on the left of 5. It’s LeetCode 98.'),
        },
      ],
    },

    // ═══════════════ Cuadrículas ═══════════════
    {
      id: 'grids',
      unit: U2,
      icon: '🏝️',
      title: T('Cuadrículas: contar islas', 'Grids: counting islands'),
      blurb: T('Una matriz también es un grafo', 'A matrix is a graph too'),
      steps: [
        {
          type: 'read',
          title: T('Cada casilla es un nodo', 'Every cell is a node'),
          code: 'const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];\nfor (const [dr, dc] of dirs) {\n  const r2 = r + dr, c2 = c + dc;\n  if (r2 >= 0 && r2 < rows && c2 >= 0 && c2 < cols) {\n    // (r2, c2) es vecino\n  }\n}',
          body: T(
            '<p>Mapas, laberintos, imágenes: muchas preguntas vienen en una <b>cuadrícula</b>. Es un grafo disfrazado: cada casilla es un nodo y sus vecinos son arriba, abajo, izquierda y derecha.</p><p>Con BFS o DFS de la lección de grafos ya puedes recorrerla. Solo cuida no salirte de los bordes.</p>',
            '<p>Maps, mazes, images: many questions come as a <b>grid</b>. It’s a graph in disguise: every cell is a node and its neighbors are up, down, left and right.</p><p>With BFS or DFS from the graphs lesson you can already walk it. Just be careful not to go off the edges.</p>'
          ),
        },
        {
          type: 'viz',
          prompt: T('¿Cuántas islas hay? Cada vez que encontramos tierra nueva, la “hundimos” completa con DFS.', 'How many islands are there? Each time we find new land, we “sink” all of it with DFS.'),
          frames: islandFrames(islandsGrid),
        },
        {
          type: 'choice',
          prompt: T('¿Por qué “hundimos” (marcamos) cada casilla al visitarla?', 'Why do we “sink” (mark) each cell when we visit it?'),
          options: [
            T('Para no volver a contarla ni dar vueltas para siempre entre vecinos', 'So we don’t count it again or bounce between neighbors forever'),
            T('Para que el mapa se vea bonito', 'So the map looks nice'),
            T('Porque JavaScript no deja leer la misma casilla dos veces', 'Because JavaScript won’t let you read the same cell twice'),
          ],
          answer: 0,
          explain: T('Es el <code>visited</code> de los grafos, pero guardado en la misma cuadrícula: cambiar el 1 por 0 cuesta O(1) de memoria extra.', 'It’s the graphs’ <code>visited</code>, but stored in the grid itself: changing the 1 to 0 costs O(1) extra memory.'),
        },
        {
          type: 'code',
          prompt: T('Escribe <code>numIslands(grid)</code>: cuántas islas de 1 hay (conectadas arriba, abajo, izquierda o derecha).', 'Write <code>numIslands(grid)</code>: how many islands of 1s there are (connected up, down, left or right).'),
          fnName: 'numIslands',
          starter: 'function numIslands(grid) {\n  const rows = grid.length;\n  const cols = rows ? grid[0].length : 0;\n  const sink = (r, c) => {\n    // si está fuera o es agua, regresa; si no, márcala con 0 y hunde a sus 4 vecinos\n    \n  };\n  let count = 0;\n  for (let r = 0; r < rows; r++) {\n    for (let c = 0; c < cols; c++) {\n      if (grid[r][c] === 1) {\n        count++;\n        sink(r, c);\n      }\n    }\n  }\n  return count;\n}\n',
          tests: [
            { args: [islandsGrid], expect: 3 },
            { args: [[[1, 1, 1], [0, 1, 0], [1, 1, 1]]], expect: 1 },
            { args: [[[1, 0, 1], [0, 1, 0], [1, 0, 1]]], expect: 5 },
            { args: [[[0, 0], [0, 0]]], expect: 0 },
            { args: [[[1]]], expect: 1 },
          ],
          hint: T('En <code>sink</code>: si <code>r</code> o <code>c</code> se salen, o <code>grid[r][c] !== 1</code>, <code>return</code>. Si no, <code>grid[r][c] = 0</code> y llama a <code>sink</code> con los 4 vecinos.', 'In <code>sink</code>: if <code>r</code> or <code>c</code> go out of bounds, or <code>grid[r][c] !== 1</code>, <code>return</code>. Otherwise <code>grid[r][c] = 0</code> and call <code>sink</code> on the 4 neighbors.'),
          solution: 'function numIslands(grid) {\n  const rows = grid.length;\n  const cols = rows ? grid[0].length : 0;\n  const sink = (r, c) => {\n    if (r < 0 || r >= rows || c < 0 || c >= cols || grid[r][c] !== 1) return;\n    grid[r][c] = 0;\n    sink(r + 1, c);\n    sink(r - 1, c);\n    sink(r, c + 1);\n    sink(r, c - 1);\n  };\n  let count = 0;\n  for (let r = 0; r < rows; r++) {\n    for (let c = 0; c < cols; c++) {\n      if (grid[r][c] === 1) {\n        count++;\n        sink(r, c);\n      }\n    }\n  }\n  return count;\n}',
          complexity: { time: 'O(n)', space: 'O(n)' },
          explain: T('Aquí n es el número de casillas: cada una se visita una vez. Es LeetCode 200, de los más preguntados en FAANG.', 'Here n is the number of cells: each is visited once. It’s LeetCode 200, one of the most asked at FAANG.'),
        },
      ],
    },

    // ═══════════════ Orden topológico ═══════════════
    {
      id: 'topo-sort',
      unit: U2,
      icon: '🧭',
      title: T('Orden topológico', 'Topological sort'),
      blurb: T('¿En qué orden tomo las materias?', 'In what order do I take the classes?'),
      steps: [
        {
          type: 'read',
          title: T('Requisitos', 'Prerequisites'),
          code: "// para tomar React necesitas DOM y Async\nconst edges = [\n  ['JS', 'DOM'], ['JS', 'Async'],\n  ['DOM', 'React'], ['Async', 'React'],\n  ['Async', 'Node'],\n];",
          body: T(
            '<p>Materias con requisitos, tareas que dependen de otras, paquetes de npm: son grafos dirigidos sin ciclos (<b>DAG</b>). Un <b>orden topológico</b> es una fila donde cada cosa va después de sus requisitos.</p><p>Algoritmo de <b>Kahn</b>: cuenta cuántos requisitos le faltan a cada uno; los que tienen 0 se pueden hacer ya.</p>',
            '<p>Classes with prerequisites, tasks that depend on others, npm packages: they’re directed graphs with no cycles (<b>DAG</b>). A <b>topological order</b> is a line where everything comes after its prerequisites.</p><p><b>Kahn’s</b> algorithm: count how many prerequisites each one still needs; the ones at 0 can be done now.</p>'
          ),
        },
        {
          type: 'viz',
          prompt: T('Mira la cola: entra quien ya no debe requisitos.', 'Watch the queue: whoever owes no more prerequisites gets in.'),
          code: 'const indeg = contarRequisitos(edges);\nconst order = [];\nconst queue = nodos.filter((n) => indeg[n] === 0);\nwhile (queue.length) {\n  const u = queue.shift();\n  order.push(u);\n  for (const v of siguientes(u)) {\n    if (--indeg[v] === 0) queue.push(v);\n  }\n}\nreturn order;',
          graph: { h: 64, directed: true, nodes: { JS: [0, 32], DOM: [35, 0], Async: [35, 64], React: [70, 20], Node: [100, 64] }, edges: topoEdges },
          frames: topoFrames(topoNodes, topoEdges),
        },
        {
          type: 'choice',
          prompt: T('Si A necesita a B y B necesita a A, ¿qué pasa con Kahn?', 'If A needs B and B needs A, what happens with Kahn?'),
          options: [
            T('Ninguno llega a 0: el orden sale incompleto y así detectas el ciclo', 'Neither reaches 0: the order comes out incomplete, and that’s how you detect the cycle'),
            T('Se queda en un loop infinito', 'It gets stuck in an infinite loop'),
            T('Los pone en cualquier orden', 'It puts them in any order'),
          ],
          answer: 0,
          explain: T('Si <code>order.length &lt; n</code>, hay un ciclo: es imposible cumplir todos los requisitos. Esa es la pregunta “¿puedes terminar todas las materias?”.', 'If <code>order.length &lt; n</code>, there’s a cycle: it’s impossible to satisfy every prerequisite. That’s the question “can you finish all the courses?”.'),
        },
        {
          type: 'code',
          prompt: T('Escribe <code>canFinish(n, prereqs)</code>: hay materias de 0 a n−1 y cada <code>[a, b]</code> dice que para tomar <code>a</code> necesitas <code>b</code>. ¿Se pueden tomar todas?', 'Write <code>canFinish(n, prereqs)</code>: there are classes 0 to n−1 and each <code>[a, b]</code> says that to take <code>a</code> you need <code>b</code>. Can you take them all?'),
          fnName: 'canFinish',
          starter: 'function canFinish(n, prereqs) {\n  const indeg = Array(n).fill(0);\n  const next = Array.from({ length: n }, () => []);\n  for (const [a, b] of prereqs) {\n    next[b].push(a);\n    indeg[a]++;\n  }\n  const queue = [];\n  for (let i = 0; i < n; i++) if (indeg[i] === 0) queue.push(i);\n  let taken = 0;\n  \n  return taken === n;\n}\n',
          tests: [
            { args: [2, [[1, 0]]], expect: true },
            { args: [2, [[1, 0], [0, 1]]], expect: false },
            { args: [4, [[1, 0], [2, 1], [3, 2]]], expect: true },
            { args: [3, [[0, 1], [1, 2], [2, 0]]], expect: false },
            { args: [3, []], expect: true },
          ],
          hint: T('Mientras haya cola: saca uno, suma a <code>taken</code>, y a cada <code>v</code> de <code>next[u]</code> réstale uno a <code>indeg[v]</code>; si llega a 0, a la cola.', 'While the queue has items: take one out, add to <code>taken</code>, and for each <code>v</code> in <code>next[u]</code> subtract one from <code>indeg[v]</code>; if it hits 0, into the queue.'),
          solution: 'function canFinish(n, prereqs) {\n  const indeg = Array(n).fill(0);\n  const next = Array.from({ length: n }, () => []);\n  for (const [a, b] of prereqs) {\n    next[b].push(a);\n    indeg[a]++;\n  }\n  const queue = [];\n  for (let i = 0; i < n; i++) if (indeg[i] === 0) queue.push(i);\n  let taken = 0;\n  while (queue.length) {\n    const u = queue.shift();\n    taken++;\n    for (const v of next[u]) {\n      indeg[v]--;\n      if (indeg[v] === 0) queue.push(v);\n    }\n  }\n  return taken === n;\n}',
          complexity: { time: 'O(n)', space: 'O(n)' },
          explain: T('Cada materia y cada requisito se tocan una vez: O(V + E). Es LeetCode 207, “Course Schedule”.', 'Every class and every prerequisite is touched once: O(V + E). It’s LeetCode 207, “Course Schedule”.'),
        },
      ],
    },

    // ═══════════════ DP en 2D ═══════════════
    {
      id: 'dp-2d',
      unit: U2,
      icon: '🧩',
      title: T('Programación dinámica en 2D', 'Dynamic programming in 2D'),
      blurb: T('Tablas para caminos y textos', 'Tables for paths and strings'),
      steps: [
        {
          type: 'read',
          title: T('Cuando un índice no alcanza', 'When one index isn’t enough'),
          code: '// dp[i][j] = la respuesta usando\n//   las primeras i filas / letras de a\n//   y las primeras j columnas / letras de b',
          body: T(
            '<p>En la DP de 1D cada casilla dependía de las anteriores en una fila. Cuando el problema tiene <b>dos</b> cosas que avanzan (fila y columna, o dos textos), la tabla es de 2D.</p><p>Misma receta: define qué significa <code>dp[i][j]</code>, llena los bordes y calcula cada casilla con sus vecinas ya resueltas.</p>',
            '<p>In 1D DP each cell depended on earlier ones in a row. When the problem has <b>two</b> things advancing (row and column, or two strings), the table is 2D.</p><p>Same recipe: define what <code>dp[i][j]</code> means, fill the edges and compute each cell from its already-solved neighbors.</p>'
          ),
        },
        {
          type: 'viz',
          prompt: T('¿De cuántas formas llegas de la esquina de arriba a la de abajo, solo yendo → o ↓?', 'How many ways can you get from the top corner to the bottom one, going only → or ↓?'),
          frames: pathsFrames(3, 4),
        },
        {
          type: 'viz',
          prompt: T('La <b>subsecuencia común más larga</b> de <code>"ace"</code> y <code>"abcde"</code> (letras en orden, no necesariamente juntas).', 'The <b>longest common subsequence</b> of <code>"ace"</code> and <code>"abcde"</code> (letters in order, not necessarily adjacent).'),
          code: 'for (let i = 1; i <= a.length; i++) {\n  for (let j = 1; j <= b.length; j++) {\n    if (a[i - 1] === b[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1;\n    else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);\n  }\n}\nreturn dp[a.length][b.length];',
          frames: lcsFrames('ace', 'abcde').map((f) => ({ ...f, line: { 0: 0, 4: 2, 6: 6 }[f.line] })),
        },
        {
          type: 'choice',
          prompt: T('Para dos textos de largo n y m, ¿cuánto cuesta llenar la tabla?', 'For two strings of length n and m, how much does filling the table cost?'),
          options: ['O(n · m)', 'O(n + m)', 'O(2ⁿ)'],
          answer: 0,
          explain: T('Una casilla por par (i, j), cada una en O(1). Sin la tabla, probar todas las subsecuencias sería O(2ⁿ).', 'One cell per pair (i, j), each in O(1). Without the table, trying every subsequence would be O(2ⁿ).'),
        },
        {
          type: 'code',
          prompt: T('Escribe <code>lcs(a, b)</code>: el largo de la subsecuencia común más larga.', 'Write <code>lcs(a, b)</code>: the length of the longest common subsequence.'),
          fnName: 'lcs',
          starter: 'function lcs(a, b) {\n  const dp = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));\n  for (let i = 1; i <= a.length; i++) {\n    for (let j = 1; j <= b.length; j++) {\n      \n    }\n  }\n  return dp[a.length][b.length];\n}\n',
          tests: [
            { args: ['abcde', 'ace'], expect: 3 },
            { args: ['abc', 'abc'], expect: 3 },
            { args: ['abc', 'def'], expect: 0 },
            { args: ['', 'a'], expect: 0 },
            { args: ['bsbininm', 'jmjkbkjkv'], expect: 1 },
          ],
          hint: T('Si <code>a[i - 1] === b[j - 1]</code>, la casilla es la diagonal + 1. Si no, el mayor entre <code>dp[i - 1][j]</code> y <code>dp[i][j - 1]</code>.', 'If <code>a[i - 1] === b[j - 1]</code>, the cell is the diagonal + 1. Otherwise, the larger of <code>dp[i - 1][j]</code> and <code>dp[i][j - 1]</code>.'),
          solution: 'function lcs(a, b) {\n  const dp = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));\n  for (let i = 1; i <= a.length; i++) {\n    for (let j = 1; j <= b.length; j++) {\n      if (a[i - 1] === b[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1;\n      else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);\n    }\n  }\n  return dp[a.length][b.length];\n}',
          complexity: { time: 'O(n²)', space: 'O(n²)' },
          explain: T('Es LeetCode 1143. La misma tabla, con otra regla, resuelve “distancia de edición” (cuántos cambios para convertir un texto en otro).', 'It’s LeetCode 1143. The same table, with another rule, solves “edit distance” (how many changes to turn one string into another).'),
        },
      ],
    }
  );
})();
