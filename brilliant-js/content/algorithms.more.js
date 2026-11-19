// Algoritmos con intuición, unidades 2 y 3: patrones de entrevista, recursión y árboles.
(function () {
  const c = window.COURSES.find((x) => x.id === 'algos');
  c.units = [
    { es: 'Primeros pasos', en: 'First steps' },
    { es: 'Patrones', en: 'Patterns' },
    { es: 'Recursión y árboles', en: 'Recursion and trees' },
  ];
  c.blurb = {
    es: 'Arrays, contar pasos, búsqueda binaria, dos punteros, ventana deslizante, hash maps, recursión y árboles: las ideas que más salen en entrevistas, entendidas tocando en lugar de memorizando.',
    en: 'Arrays, counting steps, binary search, two pointers, sliding window, hash maps, recursion and trees: the ideas interviews ask about most, understood by poking at them instead of memorizing.',
  };
  c.soon = [
    { icon: '🕸️', title: { es: 'Grafos: BFS y DFS', en: 'Graphs: BFS and DFS' } },
    { icon: '⛰️', title: { es: 'Heaps', en: 'Heaps' } },
    { icon: '🔙', title: { es: 'Backtracking', en: 'Backtracking' } },
    { icon: '🧮', title: { es: 'Programación dinámica', en: 'Dynamic programming' } },
  ];

  const tree = { value: 1, left: { value: 2, left: { value: 4 } }, right: { value: 3 } };

  c.lessons.push(
    // ═══════════════════════ Unidad 2 · Patrones ═══════════════════════
    {
      id: 'sliding-window',
      unit: 1,
      icon: '🪟',
      title: { es: 'Ventana deslizante', en: 'Sliding window' },
      blurb: { es: 'No vuelvas a sumar lo que ya sumaste', en: 'Don’t re-add what you already added' },
      steps: [
        {
          type: 'read',
          title: { es: 'El problema', en: 'The problem' },
          array: [2, 1, 5, 1, 3, 2],
          body: {
            es: '<p>¿Cuál es la suma más grande de <b>3 números seguidos</b>?</p><p>La fuerza bruta suma cada grupo de 3 desde cero. Pero fíjate: de un grupo al siguiente solo cambian dos números, <b>uno que entra y otro que sale</b>.</p>',
            en: '<p>What’s the largest sum of <b>3 consecutive numbers</b>?</p><p>Brute force adds every group of 3 from scratch. But look: from one group to the next only two numbers change, <b>one coming in and one going out</b>.</p>',
          },
        },
        {
          type: 'choice',
          prompt: { es: 'La ventana se recorre un lugar a la derecha. ¿Cómo actualizas la suma?', en: 'The window moves one spot to the right. How do you update the sum?' },
          options: [
            { es: 'Sumo los 3 números otra vez', en: 'Add all 3 numbers again' },
            { es: 'Sumo el que entra y resto el que sale', en: 'Add the one coming in, subtract the one going out' },
            { es: 'Solo sumo el que entra', en: 'Only add the one coming in' },
          ],
          answer: 1,
          why: {
            0: { es: 'Funciona, pero repite trabajo: dos de esos tres ya estaban sumados.', en: 'It works, but it repeats work: two of those three were already added.' },
            2: { es: 'Así la ventana crecería sin parar. El de la izquierda tiene que salir.', en: 'That way the window would keep growing. The one on the left has to leave.' },
          },
          explain: { es: '<code>sum = sum + entra - sale</code>: dos operaciones, sin importar qué tan grande sea la ventana.', en: '<code>sum = sum + incoming - outgoing</code>: two operations, no matter how big the window is.' },
        },
        {
          type: 'trace',
          prompt: { es: 'Avanza y mira cómo la ventana se desliza con <code>k = 3</code>.', en: 'Step through and watch the window slide with <code>k = 3</code>.' },
          code: 'let sum = 2 + 1 + 5;\nlet best = sum;\nfor (let i = 3; i < nums.length; i++) {\n  sum = sum + nums[i] - nums[i - 3];\n  best = Math.max(best, sum);\n}',
          array: [2, 1, 5, 1, 3, 2],
          frames: [
            { line: 0, vars: { sum: 8 }, note: { es: 'La primera ventana: 2 + 1 + 5.', en: 'The first window: 2 + 1 + 5.' } },
            { line: 1, vars: { sum: 8, best: 8 } },
            { line: 3, vars: { i: 3, sum: 7, best: 8 }, note: { es: 'Entra el 1, sale el 2: 8 + 1 − 2 = 7.', en: 'In comes 1, out goes 2: 8 + 1 − 2 = 7.' } },
            { line: 4, vars: { i: 3, sum: 7, best: 8 } },
            { line: 3, vars: { i: 4, sum: 9, best: 8 }, note: { es: 'Entra el 3, sale el 1: 7 + 3 − 1 = 9.', en: 'In comes 3, out goes 1: 7 + 3 − 1 = 9.' } },
            { line: 4, vars: { i: 4, sum: 9, best: 9 }, note: { es: '¡Nuevo récord!', en: 'New record!' } },
            { line: 3, vars: { i: 5, sum: 6, best: 9 }, note: { es: 'Entra el 2, sale el 5: 9 + 2 − 5 = 6.', en: 'In comes 2, out goes 5: 9 + 2 − 5 = 6.' } },
            { line: 4, vars: { i: 5, sum: 6, best: 9 }, note: { es: 'La mejor fue 9 (5 + 1 + 3).', en: 'The best was 9 (5 + 1 + 3).' } },
          ],
        },
        {
          type: 'number',
          prompt: { es: 'Con <code>k = 2</code>, ¿cuál es la suma más grande de dos seguidos?', en: 'With <code>k = 2</code>, what’s the largest sum of two in a row?' },
          code: '[4, 2, 7, 1, 8]',
          answer: 9,
          hint: { es: 'Las ventanas son 4+2, 2+7, 7+1 y 1+8.', en: 'The windows are 4+2, 2+7, 7+1 and 1+8.' },
          explain: { es: '6, 9, 8 y 9: la mejor es 9 (aparece dos veces).', en: '6, 9, 8 and 9: the best is 9 (it shows up twice).' },
        },
        {
          type: 'choice',
          prompt: { es: 'Con <code>n</code> números, ¿cuántos pasos hace la ventana?', en: 'With <code>n</code> numbers, how many steps does the window take?' },
          options: ['O(n)', 'O(n · k)', 'O(n²)'],
          answer: 0,
          why: {
            1: { es: 'Eso es la fuerza bruta: suma <code>k</code> números en cada una de las <code>n</code> posiciones.', en: 'That’s brute force: it adds <code>k</code> numbers at each of the <code>n</code> positions.' },
          },
          explain: {
            es: 'Cada número entra una vez y sale una vez: O(n). El mismo truco resuelve "el substring más largo sin repetidos" y muchos más.',
            en: 'Each number comes in once and goes out once: O(n). The same trick solves "longest substring without repeats" and many more.',
          },
        },
        {
          type: 'code',
          prompt: {
            es: 'Escribe <code>maxWindowSum(nums, k)</code>: la suma más grande de <code>k</code> números seguidos, o <code>null</code> si hay menos de <code>k</code> números.',
            en: 'Write <code>maxWindowSum(nums, k)</code>: the largest sum of <code>k</code> consecutive numbers, or <code>null</code> if there are fewer than <code>k</code>.',
          },
          fnName: 'maxWindowSum',
          starter: 'function maxWindowSum(nums, k) {\n  if (nums.length < k) return null;\n  let sum = 0;\n  for (let i = 0; i < k; i++) sum += nums[i];\n  let best = sum;\n  \n  return best;\n}\n',
          tests: [
            { args: [[2, 1, 5, 1, 3, 2], 3], expect: 9 },
            { args: [[4, 2, 7, 1, 8], 2], expect: 9 },
            { args: [[5], 1], expect: 5 },
            { args: [[1, 2], 3], expect: null },
            { args: [[-1, -2, -3], 2], expect: -3 },
          ],
          hint: {
            es: 'Desde <code>i = k</code> hasta el final: <code>sum += nums[i] - nums[i - k]</code> y <code>best = Math.max(best, sum)</code>.',
            en: 'From <code>i = k</code> to the end: <code>sum += nums[i] - nums[i - k]</code> and <code>best = Math.max(best, sum)</code>.',
          },
          solution:
            'function maxWindowSum(nums, k) {\n  if (nums.length < k) return null;\n  let sum = 0;\n  for (let i = 0; i < k; i++) sum += nums[i];\n  let best = sum;\n  for (let i = k; i < nums.length; i++) {\n    sum += nums[i] - nums[i - k];\n    best = Math.max(best, sum);\n  }\n  return best;\n}',
          explain: {
            es: 'Fíjate en la prueba con negativos: por eso <code>best</code> empieza con la primera ventana y no con 0.',
            en: 'Look at the test with negatives: that’s why <code>best</code> starts with the first window and not with 0.',
          },
        },
      ],
    },
    {
      id: 'hash-maps',
      unit: 1,
      icon: '🗝️',
      title: { es: 'Hash maps: buscar en un paso', en: 'Hash maps: lookup in one step' },
      blurb: { es: 'Cambia memoria por velocidad', en: 'Trade memory for speed' },
      steps: [
        {
          type: 'read',
          title: { es: 'El casillero con nombre', en: 'The named locker' },
          body: {
            es: '<p>En un array, para saber si está el 42 tienes que revisar casillero por casillero: O(n).</p><p>Un <b>hash map</b> (en JavaScript, <code>Map</code>, <code>Set</code> u objeto) calcula directo en qué casillero va cada llave, así que buscar toma <b>un paso</b> en promedio: O(1).</p>',
            en: '<p>In an array, to know if 42 is there you check locker by locker: O(n).</p><p>A <b>hash map</b> (in JavaScript, a <code>Map</code>, <code>Set</code> or object) computes which locker each key goes in, so a lookup takes <b>one step</b> on average: O(1).</p>',
          },
        },
        {
          type: 'classify',
          prompt: { es: '¿Un paso o recorre todo?', en: 'One step or walks everything?' },
          bins: [
            { es: 'Un paso · O(1)', en: 'One step · O(1)' },
            { es: 'Recorre · O(n)', en: 'Walks · O(n)' },
          ],
          items: [
            { label: '<code>map.get(key)</code>', bin: 0 },
            { label: '<code>array.includes(x)</code>', bin: 1 },
            { label: '<code>set.has(x)</code>', bin: 0 },
            { label: '<code>obj[key]</code>', bin: 0 },
            { label: '<code>array.indexOf(x)</code>', bin: 1 },
          ],
          explain: {
            es: 'Si en una entrevista ves <code>includes</code> o <code>indexOf</code> dentro de un loop, casi siempre puedes cambiarlo por un <code>Set</code> y bajar de O(n²) a O(n).',
            en: 'If in an interview you see <code>includes</code> or <code>indexOf</code> inside a loop, you can almost always swap in a <code>Set</code> and go from O(n²) to O(n).',
          },
        },
        {
          type: 'choice',
          prompt: { es: 'Contar letras con un objeto. ¿Qué vale <code>count.s</code>?', en: 'Counting letters with an object. What is <code>count.s</code>?' },
          code: "const count = {};\nfor (const ch of 'salsa') {\n  count[ch] = (count[ch] ?? 0) + 1;\n}\ncount.s",
          options: ['<code>1</code>', '<code>2</code>', '<code>5</code>'],
          answer: 1,
          explain: {
            es: '"salsa" tiene dos s. Este patrón de "contar frecuencias" resuelve anagramas, el elemento más común y "¿hay repetidos?".',
            en: '"salsa" has two s’s. This "count frequencies" pattern solves anagrams, the most common element and "are there duplicates?".',
          },
        },
        {
          type: 'choice',
          prompt: {
            es: 'Two Sum en un array <b>desordenado</b>: buscas dos números que sumen 10. Vas en el 7. ¿Qué buscas en el Map de los que ya viste?',
            en: 'Two Sum on an <b>unsorted</b> array: you want two numbers that add up to 10. You’re at 7. What do you look up in the Map of numbers you’ve seen?',
          },
          options: ['<code>7</code>', '<code>3</code>', '<code>17</code>', '<code>10</code>'],
          answer: 1,
          why: {
            0: { es: 'El 7 es el que tienes. Necesitas a su pareja: el que sumado a 7 da 10.', en: '7 is the one you have. You need its partner: the one that adds to 7 to make 10.' },
          },
          explain: {
            es: 'Buscas el <b>complemento</b>: <code>target - x</code>, o sea 10 − 7 = 3. Si ya lo viste, terminaste; si no, guardas el 7 y sigues. Una sola vuelta: O(n).',
            en: 'You look up the <b>complement</b>: <code>target - x</code>, so 10 − 7 = 3. If you’ve seen it, you’re done; if not, store 7 and keep going. A single pass: O(n).',
          },
        },
        {
          type: 'code',
          prompt: {
            es: 'El problema #1 de LeetCode. Escribe <code>twoSum(nums, target)</code>: regresa los índices <code>[i, j]</code> (con <code>i &lt; j</code>) de dos números que sumen <code>target</code>, o <code>null</code>. El array no está ordenado.',
            en: 'LeetCode problem #1. Write <code>twoSum(nums, target)</code>: return the indexes <code>[i, j]</code> (with <code>i &lt; j</code>) of two numbers that add up to <code>target</code>, or <code>null</code>. The array isn’t sorted.',
          },
          fnName: 'twoSum',
          starter: 'function twoSum(nums, target) {\n  const seen = new Map(); // número → índice\n  for (let j = 0; j < nums.length; j++) {\n    \n  }\n  return null;\n}\n',
          tests: [
            { args: [[2, 7, 11, 15], 9], expect: [0, 1] },
            { args: [[3, 2, 4], 6], expect: [1, 2] },
            { args: [[3, 3], 6], expect: [0, 1] },
            { args: [[1, 2], 7], expect: null },
          ],
          hint: {
            es: 'En cada <code>j</code>: <code>const need = target - nums[j]</code>. Si <code>seen.has(need)</code>, regresa <code>[seen.get(need), j]</code>. Si no, <code>seen.set(nums[j], j)</code>.',
            en: 'At each <code>j</code>: <code>const need = target - nums[j]</code>. If <code>seen.has(need)</code>, return <code>[seen.get(need), j]</code>. Otherwise <code>seen.set(nums[j], j)</code>.',
          },
          solution:
            'function twoSum(nums, target) {\n  const seen = new Map();\n  for (let j = 0; j < nums.length; j++) {\n    const need = target - nums[j];\n    if (seen.has(need)) return [seen.get(need), j];\n    seen.set(nums[j], j);\n  }\n  return null;\n}',
          explain: {
            es: 'Fíjate en <code>[3, 3]</code>: por eso se busca <b>antes</b> de guardar, para que un número no se empareje consigo mismo. Ya lo resolviste de tres formas: fuerza bruta, dos punteros y hash map.',
            en: 'Look at <code>[3, 3]</code>: that’s why you look up <b>before</b> storing, so a number doesn’t pair with itself. You’ve now solved it three ways: brute force, two pointers and a hash map.',
          },
        },
      ],
    },

    // ═══════════════════════ Unidad 3 · Recursión y árboles ═══════════════════════
    {
      id: 'recursion',
      unit: 2,
      icon: '🪆',
      title: { es: 'Recursión', en: 'Recursion' },
      blurb: { es: 'Una función que se llama a sí misma, con freno', en: 'A function that calls itself, with brakes' },
      steps: [
        {
          type: 'read',
          title: { es: 'Muñecas rusas', en: 'Russian dolls' },
          code: 'function fact(n) {\n  if (n <= 1) return 1;     // el freno\n  return n * fact(n - 1);   // una muñeca más chica\n}',
          body: {
            es: '<p>Una función <b>recursiva</b> resuelve un problema pidiéndose a sí misma uno más chico, como abrir muñecas rusas.</p><p>Siempre necesita dos cosas: el <b>caso base</b> (la muñeca que ya no se abre) y un paso que <b>se acerque</b> a él.</p>',
            en: '<p>A <b>recursive</b> function solves a problem by asking itself for a smaller one, like opening Russian dolls.</p><p>It always needs two things: the <b>base case</b> (the doll that doesn’t open) and a step that <b>gets closer</b> to it.</p>',
          },
        },
        {
          type: 'trace',
          prompt: { es: 'Sigue a <code>fact(3)</code>: primero baja abriendo muñecas y luego sube multiplicando.', en: 'Follow <code>fact(3)</code>: first it goes down opening dolls, then it comes back up multiplying.' },
          code: 'function fact(n) {\n  if (n <= 1) return 1;\n  return n * fact(n - 1);\n}',
          frames: [
            { line: 1, vars: { pila: 'fact(3)', n: 3 } },
            { line: 2, vars: { pila: 'fact(3)', n: 3 }, note: { es: 'Necesita <code>fact(2)</code> antes de poder multiplicar.', en: 'It needs <code>fact(2)</code> before it can multiply.' } },
            { line: 1, vars: { pila: 'fact(3) → fact(2)', n: 2 } },
            { line: 2, vars: { pila: 'fact(3) → fact(2)', n: 2 } },
            { line: 1, vars: { pila: 'fact(3) → fact(2) → fact(1)', n: 1 }, note: { es: '¡Caso base! Regresa 1 sin llamar a nadie.', en: 'Base case! Returns 1 without calling anyone.' } },
            { line: 2, vars: { pila: 'fact(3) → fact(2)', n: 2, regresa: 2 }, note: { es: 'Sube: 2 × 1 = 2.', en: 'Going up: 2 × 1 = 2.' } },
            { line: 2, vars: { pila: 'fact(3)', n: 3, regresa: 6 }, note: { es: 'Sube: 3 × 2 = 6. ¡Listo!', en: 'Going up: 3 × 2 = 6. Done!' } },
          ],
        },
        {
          type: 'number',
          prompt: { es: '¿Qué regresa <code>sum(4)</code>?', en: 'What does <code>sum(4)</code> return?' },
          code: 'function sum(n) {\n  if (n === 0) return 0;\n  return n + sum(n - 1);\n}\nsum(4)',
          answer: 10,
          hint: { es: '4 + sum(3) = 4 + 3 + sum(2) = …', en: '4 + sum(3) = 4 + 3 + sum(2) = …' },
          explain: { es: '4 + 3 + 2 + 1 + 0 = 10.', en: '4 + 3 + 2 + 1 + 0 = 10.' },
        },
        {
          type: 'choice',
          prompt: { es: 'Se te olvidó el caso base. ¿Qué pasa?', en: 'You forgot the base case. What happens?' },
          code: 'function down(n) {\n  return down(n - 1);\n}\ndown(3)',
          options: [
            { es: 'Se queda pensando para siempre', en: 'It thinks forever' },
            { es: 'Error: se llena la pila de llamadas', en: 'Error: the call stack overflows' },
            { es: 'Regresa <code>undefined</code>', en: 'It returns <code>undefined</code>' },
          ],
          answer: 1,
          why: {
            0: { es: 'Un <code>while (true)</code> sí se quedaría para siempre, pero cada llamada recursiva ocupa memoria en la pila, y la pila tiene límite.', en: 'A <code>while (true)</code> would run forever, but each recursive call takes stack memory, and the stack has a limit.' },
          },
          explain: {
            es: 'Truena con <code>RangeError: Maximum call stack size exceeded</code>, el famoso "stack overflow". Siempre revisa tu caso base primero.',
            en: 'It crashes with <code>RangeError: Maximum call stack size exceeded</code>, the famous "stack overflow". Always check your base case first.',
          },
        },
        {
          type: 'choice',
          prompt: { es: '<code>fib(40)</code> así tarda muchísimo. ¿Por qué?', en: '<code>fib(40)</code> like this takes forever. Why?' },
          code: 'function fib(n) {\n  if (n < 2) return n;\n  return fib(n - 1) + fib(n - 2);\n}',
          options: [
            { es: 'Recalcula los mismos valores muchísimas veces', en: 'It recomputes the same values over and over' },
            { es: 'La recursión es lenta en JavaScript', en: 'Recursion is slow in JavaScript' },
            { es: 'Porque 40 es un número muy grande', en: 'Because 40 is a very big number' },
          ],
          answer: 0,
          explain: {
            es: '<code>fib(40)</code> pide <code>fib(39)</code> y <code>fib(38)</code>, pero <code>fib(39)</code> también pide <code>fib(38)</code>… El árbol de llamadas crece como O(2ⁿ). Si guardas cada resultado (<b>memoización</b>), baja a O(n). Esa es la puerta a la programación dinámica.',
            en: '<code>fib(40)</code> asks for <code>fib(39)</code> and <code>fib(38)</code>, but <code>fib(39)</code> also asks for <code>fib(38)</code>… The call tree grows like O(2ⁿ). If you store each result (<b>memoization</b>), it drops to O(n). That’s the door to dynamic programming.',
          },
        },
        {
          type: 'code',
          prompt: {
            es: 'Escribe <code>flatten(arr)</code>: aplana arrays anidados a cualquier profundidad. <code>[1, [2, [3]]]</code> → <code>[1, 2, 3]</code>.',
            en: 'Write <code>flatten(arr)</code>: flatten nested arrays to any depth. <code>[1, [2, [3]]]</code> → <code>[1, 2, 3]</code>.',
          },
          fnName: 'flatten',
          starter: 'function flatten(arr) {\n  const out = [];\n  for (const item of arr) {\n    \n  }\n  return out;\n}\n',
          tests: [
            { args: [[1, [2, [3, [4]]]]], expect: [1, 2, 3, 4] },
            { args: [[]], expect: [] },
            { args: [[[1, 2], [3]]], expect: [1, 2, 3] },
            { args: [[1, 2, 3]], expect: [1, 2, 3] },
          ],
          hint: {
            es: 'Si <code>Array.isArray(item)</code>, aplánalo con la misma función y mete sus elementos: <code>out.push(...flatten(item))</code>. Si no, <code>out.push(item)</code>.',
            en: 'If <code>Array.isArray(item)</code>, flatten it with the same function and add its elements: <code>out.push(...flatten(item))</code>. Otherwise <code>out.push(item)</code>.',
          },
          solution:
            'function flatten(arr) {\n  const out = [];\n  for (const item of arr) {\n    if (Array.isArray(item)) out.push(...flatten(item));\n    else out.push(item);\n  }\n  return out;\n}',
          explain: {
            es: 'El caso base está escondido: un número no se vuelve a llamar. La recursión brilla cuando el problema tiene forma de muñecas rusas, como los arrays anidados… y los árboles.',
            en: 'The base case is hidden: a number doesn’t call again. Recursion shines when the problem is shaped like Russian dolls, like nested arrays… and trees.',
          },
        },
      ],
    },
    {
      id: 'trees',
      unit: 2,
      icon: '🌳',
      title: { es: 'Árboles', en: 'Trees' },
      blurb: { es: 'Nodos, hijos y recorridos con recursión', en: 'Nodes, children and traversals with recursion' },
      steps: [
        {
          type: 'read',
          title: { es: 'Un árbol de cabeza', en: 'An upside-down tree' },
          code: 'const tree = {\n  value: 1,\n  left: { value: 2, left: { value: 4 } },\n  right: { value: 3 },\n};',
          body: {
            es: '<p>Un árbol binario es un nodo con un valor y hasta dos hijos: <code>left</code> y <code>right</code>. La <b>raíz</b> va arriba (es un árbol de cabeza) y los nodos sin hijos son <b>hojas</b>.</p><p>Cada hijo es, a su vez, un árbol más chico: por eso la recursión les queda perfecta.</p>',
            en: '<p>A binary tree is a node with a value and up to two children: <code>left</code> and <code>right</code>. The <b>root</b> is at the top (it’s an upside-down tree) and nodes without children are <b>leaves</b>.</p><p>Each child is itself a smaller tree: that’s why recursion fits them perfectly.</p>',
          },
        },
        {
          type: 'choice',
          prompt: { es: '¿Cuántos niveles tiene ese árbol?', en: 'How many levels does that tree have?' },
          code: '      1\n     / \\\n    2   3\n   /\n  4',
          options: ['<code>2</code>', '<code>3</code>', '<code>4</code>'],
          answer: 1,
          why: {
            2: { es: 'Hay 4 <b>nodos</b>, pero los niveles se cuentan hacia abajo: 1 → 2 → 4.', en: 'There are 4 <b>nodes</b>, but levels are counted downward: 1 → 2 → 4.' },
          },
          explain: { es: 'El camino más largo de la raíz a una hoja es 1 → 2 → 4: 3 niveles. A eso se le llama la <b>profundidad</b> del árbol.', en: 'The longest path from the root to a leaf is 1 → 2 → 4: 3 levels. That’s called the tree’s <b>depth</b>.' },
        },
        {
          type: 'choice',
          prompt: {
            es: 'Recorrido <b>preorden</b>: primero el nodo, luego todo lo de la izquierda, luego la derecha. ¿En qué orden visita?',
            en: '<b>Preorder</b> traversal: first the node, then everything on the left, then the right. In what order does it visit?',
          },
          code: '      1\n     / \\\n    2   3\n   /\n  4',
          options: ['<code>1 2 3 4</code>', '<code>1 2 4 3</code>', '<code>4 2 3 1</code>'],
          answer: 1,
          why: {
            0: { es: 'Eso es por niveles (BFS). Preorden termina <b>toda</b> la rama izquierda (2 y su hijo 4) antes de ir al 3.', en: 'That’s level by level (BFS). Preorder finishes the <b>whole</b> left branch (2 and its child 4) before going to 3.' },
          },
          explain: { es: '1, luego su izquierda completa (2, luego el 4), y al final la derecha (3). Así recorre DFS.', en: '1, then its whole left side (2, then 4), and finally the right side (3). That’s how DFS walks.' },
        },
        {
          type: 'order',
          prompt: {
            es: 'Arma <code>sumTree(node)</code>: la suma de todos los valores del árbol. Se prueba de verdad.',
            en: 'Build <code>sumTree(node)</code>: the sum of every value in the tree. It runs real tests.',
          },
          pre: 'function sumTree(node) {',
          post: '}',
          lines: ['  if (!node) return 0;', '  const left = sumTree(node.left);', '  const right = sumTree(node.right);', '  return node.value + left + right;'],
          seed: 9,
          fnName: 'sumTree',
          tests: [
            { args: [tree], expect: 10 },
            { args: [null], expect: 0 },
            { args: [{ value: 5 }], expect: 5 },
          ],
          explain: {
            es: 'El caso base es el nodo vacío (<code>null</code>): vale 0. Cada nodo suma su valor más lo que le regresan sus dos subárboles.',
            en: 'The base case is the empty node (<code>null</code>): it’s worth 0. Each node adds its value to what its two subtrees return.',
          },
        },
        {
          type: 'code',
          prompt: {
            es: 'LeetCode 104. Escribe <code>maxDepth(node)</code>: cuántos niveles tiene el árbol (un árbol vacío tiene 0).',
            en: 'LeetCode 104. Write <code>maxDepth(node)</code>: how many levels the tree has (an empty tree has 0).',
          },
          fnName: 'maxDepth',
          starter: 'function maxDepth(node) {\n  if (!node) return 0;\n  \n}\n',
          tests: [
            { args: [tree], expect: 3 },
            { args: [null], expect: 0 },
            { args: [{ value: 1 }], expect: 1 },
            { args: [{ value: 1, right: { value: 2, right: { value: 3, right: { value: 4 } } } }], expect: 4 },
          ],
          hint: {
            es: 'Igual que <code>sumTree</code>, pero en lugar de sumar los dos lados, te quedas con el más profundo: <code>1 + Math.max(maxDepth(node.left), maxDepth(node.right))</code>.',
            en: 'Like <code>sumTree</code>, but instead of adding both sides, keep the deeper one: <code>1 + Math.max(maxDepth(node.left), maxDepth(node.right))</code>.',
          },
          solution: 'function maxDepth(node) {\n  if (!node) return 0;\n  return 1 + Math.max(maxDepth(node.left), maxDepth(node.right));\n}',
          explain: {
            es: 'Dos líneas y resolviste un problema real de entrevista. La plantilla "caso base + combinar lo que regresan los hijos" resuelve la mayoría de los problemas de árboles.',
            en: 'Two lines and you solved a real interview problem. The "base case + combine what the children return" template solves most tree problems.',
          },
        },
      ],
    },
  );
})();
