// Algoritmos con intuición, unidad 4: grafos, heaps, backtracking y programación dinámica.
// También marca la complejidad de los retos de código (la usa el modo entrevista).
(function () {
  const c = window.COURSES.find((x) => x.id === 'algos');
  c.units.push({ es: 'Grafos y más', en: 'Graphs and beyond' });
  c.soon = [
    { icon: '🧵', title: { es: 'Tries', en: 'Tries' } },
    { icon: '🔗', title: { es: 'Union-Find', en: 'Union-Find' } },
    { icon: '🗺️', title: { es: 'Dijkstra', en: 'Dijkstra' } },
  ];

  const g1 = { A: ['B', 'C'], B: ['D'], C: ['E'], D: [], E: [] };

  c.lessons.push(
    {
      id: 'graphs',
      unit: 3,
      icon: '🕸️',
      title: { es: 'Grafos: BFS y DFS', en: 'Graphs: BFS and DFS' },
      blurb: { es: 'Recorrer redes por niveles o hasta el fondo', en: 'Walking networks level by level or all the way down' },
      steps: [
        {
          type: 'read',
          title: { es: 'Puntos y flechas', en: 'Dots and arrows' },
          code: "const graph = {\n  A: ['B', 'C'],\n  B: ['D'],\n  C: ['E'],\n  D: [],\n  E: [],\n};",
          body: {
            es: '<p>Un <b>grafo</b> son nodos conectados: amigos en una red social, calles de una ciudad, dependencias de npm.</p><p>La forma más común de guardarlo es una <b>lista de vecinos</b>: un objeto donde cada nodo dice a quién apunta.</p>',
            en: '<p>A <b>graph</b> is connected nodes: friends in a social network, city streets, npm dependencies.</p><p>The most common way to store it is an <b>adjacency list</b>: an object where each node says who it points to.</p>',
          },
        },
        {
          type: 'choice',
          prompt: {
            es: '<b>BFS</b> recorre por niveles: primero los vecinos, luego los vecinos de los vecinos. Empezando en A, ¿en qué orden visita?',
            en: '<b>BFS</b> walks level by level: first the neighbors, then the neighbors’ neighbors. Starting at A, in what order does it visit?',
          },
          code: "A → B, C\nB → D\nC → E",
          options: ['<code>A B D C E</code>', '<code>A B C D E</code>', '<code>A C E B D</code>'],
          answer: 1,
          why: {
            0: { es: 'Eso es <b>DFS</b>: se va hasta el fondo por B (llega a D) antes de ver a C.', en: 'That’s <b>DFS</b>: it goes all the way down through B (reaching D) before looking at C.' },
          },
          explain: {
            es: 'Nivel 0: A. Nivel 1: B y C. Nivel 2: D y E. BFS encuentra el camino más corto en grafos sin pesos, por eso sale tanto en entrevistas.',
            en: 'Level 0: A. Level 1: B and C. Level 2: D and E. BFS finds the shortest path in unweighted graphs, which is why it shows up so much in interviews.',
          },
        },
        {
          type: 'choice',
          prompt: { es: 'Para recorrer por niveles, ¿qué estructura usa BFS?', en: 'To walk level by level, what structure does BFS use?' },
          options: [
            { es: 'Una <b>cola</b>: el primero que entra es el primero que sale', en: 'A <b>queue</b>: first in, first out' },
            { es: 'Una <b>pila</b>: el último que entra es el primero que sale', en: 'A <b>stack</b>: last in, first out' },
            { es: 'Un array ordenado', en: 'A sorted array' },
          ],
          answer: 0,
          why: {
            1: { es: 'La pila es de DFS (o la recursión, que es una pila escondida): siempre sigue con lo más nuevo y se va al fondo.', en: 'The stack belongs to DFS (or recursion, a hidden stack): it always continues with the newest and goes deep.' },
          },
          explain: { es: 'Cola → BFS (por niveles). Pila o recursión → DFS (hasta el fondo). Cambiar una por otra cambia el recorrido completo.', en: 'Queue → BFS (by levels). Stack or recursion → DFS (all the way down). Swapping one for the other changes the whole traversal.' },
        },
        {
          type: 'choice',
          prompt: { es: 'B apunta a A y A apunta a B. ¿Para qué sirve el Set <code>visited</code>?', en: 'B points to A and A points to B. What’s the <code>visited</code> Set for?' },
          options: [
            { es: 'Para no dar vueltas para siempre en un ciclo', en: 'So you don’t loop forever in a cycle' },
            { es: 'Para que el recorrido salga ordenado', en: 'So the traversal comes out sorted' },
            { es: 'Para ahorrar memoria', en: 'To save memory' },
          ],
          answer: 0,
          explain: {
            es: 'Sin <code>visited</code>, A manda a B, B manda a A, A manda a B… para siempre. Marcar al agregar a la cola hace que cada nodo entre una sola vez: O(V + E).',
            en: 'Without <code>visited</code>, A sends you to B, B to A, A to B… forever. Marking when you enqueue makes each node enter once: O(V + E).',
          },
        },
        {
          type: 'order',
          prompt: { es: 'Arma <code>bfs(graph, start)</code>: regresa los nodos en el orden en que los visita. Se prueba de verdad.', en: 'Build <code>bfs(graph, start)</code>: return the nodes in the order it visits them. It runs real tests.' },
          pre: 'function bfs(graph, start) {',
          post: '}',
          lines: [
            '  const visited = new Set([start]);',
            '  const queue = [start], order = [];',
            '  while (queue.length) {',
            '    const node = queue.shift();',
            '    order.push(node);',
            '    for (const next of graph[node]) {',
            '      if (!visited.has(next)) { visited.add(next); queue.push(next); }',
            '    }',
            '  }',
            '  return order;',
          ],
          seed: 3,
          fnName: 'bfs',
          tests: [
            { args: [g1, 'A'], expect: ['A', 'B', 'C', 'D', 'E'] },
            { args: [{ A: ['B'], B: ['A'] }, 'A'], expect: ['A', 'B'] },
            { args: [g1, 'C'], expect: ['C', 'E'] },
          ],
          explain: {
            es: '<code>shift()</code> saca el primero de la fila (cola) y <code>push</code> forma a los nuevos al final. La segunda prueba tiene un ciclo: <code>visited</code> lo resolvió.',
            en: '<code>shift()</code> takes the first in line (queue) and <code>push</code> lines up the new ones at the end. The second test has a cycle: <code>visited</code> handled it.',
          },
        },
        {
          type: 'code',
          prompt: {
            es: 'Escribe <code>hasPath(graph, from, to)</code>: <code>true</code> si se puede llegar de <code>from</code> a <code>to</code> siguiendo las flechas. Usa BFS o DFS, como prefieras.',
            en: 'Write <code>hasPath(graph, from, to)</code>: <code>true</code> if you can get from <code>from</code> to <code>to</code> following the arrows. Use BFS or DFS, your choice.',
          },
          fnName: 'hasPath',
          starter: 'function hasPath(graph, from, to) {\n  const visited = new Set();\n  const stack = [from];\n  while (stack.length) {\n    const node = stack.pop();\n    \n  }\n  return false;\n}\n',
          tests: [
            { args: [g1, 'A', 'E'], expect: true },
            { args: [g1, 'B', 'C'], expect: false },
            { args: [{ A: ['B'], B: ['A'], C: [] }, 'A', 'C'], expect: false },
            { args: [g1, 'D', 'D'], expect: true },
          ],
          hint: {
            es: 'Dentro del loop: si <code>node === to</code>, regresa <code>true</code>. Si ya está en <code>visited</code>, <code>continue</code>. Si no, márcalo y mete a sus vecinos: <code>stack.push(...graph[node])</code>.',
            en: 'Inside the loop: if <code>node === to</code>, return <code>true</code>. If it’s already in <code>visited</code>, <code>continue</code>. Otherwise mark it and push its neighbors: <code>stack.push(...graph[node])</code>.',
          },
          solution:
            'function hasPath(graph, from, to) {\n  const visited = new Set();\n  const stack = [from];\n  while (stack.length) {\n    const node = stack.pop();\n    if (node === to) return true;\n    if (visited.has(node)) continue;\n    visited.add(node);\n    stack.push(...graph[node]);\n  }\n  return false;\n}',
          complexity: { time: 'O(n)', space: 'O(n)' },
          explain: {
            es: 'Con una pila es DFS; cambia <code>pop()</code> por <code>shift()</code> y es BFS. Los dos visitan cada nodo y cada flecha una vez: O(V + E).',
            en: 'With a stack it’s DFS; swap <code>pop()</code> for <code>shift()</code> and it’s BFS. Both visit each node and arrow once: O(V + E).',
          },
        },
      ],
    },
    {
      id: 'heaps',
      unit: 3,
      icon: '⛰️',
      title: { es: 'Heaps: el más chico arriba', en: 'Heaps: smallest on top' },
      blurb: { es: 'Sacar el mínimo una y otra vez, rápido', en: 'Grabbing the minimum over and over, fast' },
      steps: [
        {
          type: 'read',
          title: { es: 'Una montaña de prioridades', en: 'A mountain of priorities' },
          code: '        1\n      /   \\\n     3     2\n    / \\\n   7   4\n\nheap = [1, 3, 2, 7, 4]',
          body: {
            es: '<p>En un <b>min-heap</b> cada papá es menor o igual que sus hijos, así que el mínimo siempre está arriba: verlo es O(1), y meter o sacar es O(log n).</p><p>Se guarda en un array: los hijos del índice <code>i</code> están en <code>2i + 1</code> y <code>2i + 2</code>.</p>',
            en: '<p>In a <b>min-heap</b> every parent is less than or equal to its children, so the minimum is always on top: peeking is O(1), and pushing or popping is O(log n).</p><p>It lives in an array: the children of index <code>i</code> are at <code>2i + 1</code> and <code>2i + 2</code>.</p>',
          },
        },
        {
          type: 'choice',
          prompt: { es: 'En <code>[1, 3, 2, 7, 4]</code>, ¿quiénes son los hijos del 3 (índice 1)?', en: 'In <code>[1, 3, 2, 7, 4]</code>, who are the children of 3 (index 1)?' },
          options: ['<code>2</code> y <code>7</code>', '<code>7</code> y <code>4</code>', '<code>1</code> y <code>2</code>'],
          answer: 1,
          explain: { es: 'Índices 2·1 + 1 = 3 y 2·1 + 2 = 4: los valores 7 y 4. Los dos son mayores que 3, como debe ser.', en: 'Indexes 2·1 + 1 = 3 and 2·1 + 2 = 4: the values 7 and 4. Both are greater than 3, as they should be.' },
        },
        {
          type: 'number',
          prompt: { es: '¿Cuál es el índice del papá del índice 5? (Pista: es <code>Math.floor((i - 1) / 2)</code>)', en: 'What’s the parent index of index 5? (Hint: it’s <code>Math.floor((i - 1) / 2)</code>)' },
          answer: 2,
          explain: { es: '(5 − 1) / 2 = 2. Subir de hijo a papá es lo que hace un heap cuando metes un número nuevo.', en: '(5 − 1) / 2 = 2. Climbing from child to parent is what a heap does when you push a new number.' },
        },
        {
          type: 'classify',
          prompt: { es: '¿Cuáles arrays son min-heaps válidos?', en: 'Which arrays are valid min-heaps?' },
          bins: [
            { es: 'Sí es heap', en: 'Valid heap' },
            { es: 'No es heap', en: 'Not a heap' },
          ],
          items: [
            { label: '<code>[1, 3, 2, 7, 4]</code>', bin: 0 },
            { label: '<code>[3, 1, 2]</code>', bin: 1 },
            { label: '<code>[1, 2, 0]</code>', bin: 1 },
            { label: '<code>[2, 2, 2]</code>', bin: 0 },
            { label: '<code>[5]</code>', bin: 0 },
          ],
          explain: {
            es: 'En <code>[3, 1, 2]</code> el papá (3) es mayor que su hijo (1), y en <code>[1, 2, 0]</code> el 0 es menor que su papá. Iguales sí se vale. Ojo: un heap <b>no</b> está ordenado, solo cumple la regla papá ≤ hijos.',
            en: 'In <code>[3, 1, 2]</code> the parent (3) is greater than its child (1), and in <code>[1, 2, 0]</code> the 0 is smaller than its parent. Equal values are fine. Note: a heap is <b>not</b> sorted, it just follows parent ≤ children.',
          },
        },
        {
          type: 'choice',
          prompt: {
            es: 'Quieres los <b>k</b> números más grandes de un array de <b>n</b>. Guardas un min-heap de tamaño k y sacas el mínimo cuando se llena. ¿Complejidad?',
            en: 'You want the <b>k</b> largest numbers of an array of <b>n</b>. You keep a min-heap of size k and pop the minimum when it overflows. Complexity?',
          },
          options: ['O(n log k)', 'O(n²)', 'O(k)'],
          answer: 0,
          explain: {
            es: 'Cada uno de los n números entra a un heap de tamaño k: O(log k) cada vez. Si k es chico, le gana a ordenar todo (O(n log n)). Es el problema "Top K" clásico.',
            en: 'Each of the n numbers goes into a size-k heap: O(log k) each time. When k is small, it beats sorting everything (O(n log n)). It’s the classic "Top K" problem.',
          },
        },
        {
          type: 'code',
          prompt: {
            es: 'Escribe <code>heapPush(heap, x)</code>: mete <code>x</code> al final y súbelo intercambiándolo con su papá mientras sea más chico.',
            en: 'Write <code>heapPush(heap, x)</code>: add <code>x</code> at the end and bubble it up, swapping with its parent while it’s smaller.',
          },
          fnName: 'heapPush',
          wrap: '(items) => { const h = []; for (const x of items) heapPush(h, x); return h; }',
          starter: 'function heapPush(heap, x) {\n  heap.push(x);\n  let i = heap.length - 1;\n  while (i > 0) {\n    const parent = Math.floor((i - 1) / 2);\n    \n  }\n}\n',
          tests: [
            { args: [[5, 3, 8, 1]], expect: [1, 3, 8, 5], label: 'push 5, 3, 8, 1' },
            { args: [[4, 4, 2]], expect: [2, 4, 4], label: 'push 4, 4, 2' },
            { args: [[]], expect: [], label: 'sin push' },
          ],
          hint: {
            es: 'Si <code>heap[parent] &lt;= heap[i]</code>, ya está en su lugar: <code>break</code>. Si no, intercambia (<code>[heap[i], heap[parent]] = [heap[parent], heap[i]]</code>) y sube: <code>i = parent</code>.',
            en: 'If <code>heap[parent] &lt;= heap[i]</code>, it’s in place: <code>break</code>. Otherwise swap (<code>[heap[i], heap[parent]] = [heap[parent], heap[i]]</code>) and climb: <code>i = parent</code>.',
          },
          solution:
            'function heapPush(heap, x) {\n  heap.push(x);\n  let i = heap.length - 1;\n  while (i > 0) {\n    const parent = Math.floor((i - 1) / 2);\n    if (heap[parent] <= heap[i]) break;\n    [heap[i], heap[parent]] = [heap[parent], heap[i]];\n    i = parent;\n  }\n}',
          complexity: { time: 'O(log n)', space: 'O(1)' },
          explain: {
            es: 'El número sube como mucho la altura del árbol: O(log n). JavaScript no trae heap, así que en entrevistas a veces te piden escribir justo esto.',
            en: 'The number climbs at most the height of the tree: O(log n). JavaScript has no built-in heap, so interviews sometimes ask you to write exactly this.',
          },
        },
      ],
    },
    {
      id: 'backtracking',
      unit: 3,
      icon: '🔙',
      title: { es: 'Backtracking', en: 'Backtracking' },
      blurb: { es: 'Probar una opción y, si no, regresar', en: 'Try an option and, if not, step back' },
      more: [],
      steps: [
        {
          type: 'read',
          title: { es: 'Como salir de un laberinto', en: 'Like getting out of a maze' },
          body: {
            es: '<p><b>Backtracking</b> es explorar todas las opciones con recursión: escoges algo, sigues, y al regresar <b>deshaces</b> la elección para probar la siguiente.</p><p>Sirve para generar combinaciones, permutaciones y para resolver sudokus o el problema de las N reinas.</p>',
            en: '<p><b>Backtracking</b> explores every option with recursion: you pick something, keep going, and on the way back you <b>undo</b> the choice to try the next one.</p><p>It generates combinations and permutations and solves sudokus or the N-queens problem.</p>',
          },
        },
        {
          type: 'number',
          prompt: { es: '¿Cuántos subconjuntos tiene <code>[1, 2, 3]</code>? (Cuenta el vacío y el completo.)', en: 'How many subsets does <code>[1, 2, 3]</code> have? (Count the empty one and the full one.)' },
          answer: 8,
          hint: { es: 'Cada número tiene dos opciones: entra o no entra.', en: 'Each number has two options: in or out.' },
          explain: { es: '2 × 2 × 2 = 8: [], [1], [2], [3], [1,2], [1,3], [2,3], [1,2,3]. Con n números son 2ⁿ: por eso el backtracking es lento con n grande.', en: '2 × 2 × 2 = 8: [], [1], [2], [3], [1,2], [1,3], [2,3], [1,2,3]. With n numbers it’s 2ⁿ: that’s why backtracking is slow for large n.' },
        },
        {
          type: 'number',
          prompt: { es: '¿Y cuántas permutaciones (órdenes distintos) tiene <code>\'abc\'</code>?', en: 'And how many permutations (different orders) does <code>\'abc\'</code> have?' },
          answer: 6,
          hint: { es: '3 opciones para la primera letra, 2 para la segunda, 1 para la última.', en: '3 options for the first letter, 2 for the second, 1 for the last.' },
          explain: { es: '3! = 3 × 2 × 1 = 6: abc, acb, bac, bca, cab, cba.', en: '3! = 3 × 2 × 1 = 6: abc, acb, bac, bca, cab, cba.' },
        },
        {
          type: 'choice',
          prompt: { es: '¿Qué hace la línea <code>path.pop()</code>?', en: 'What does the <code>path.pop()</code> line do?' },
          code: 'path.push(nums[i]); // escojo\ngo(i + 1);         // sigo\npath.pop();        // ???\ngo(i + 1);         // pruebo sin él',
          options: [
            { es: 'Deshace la elección para probar el otro camino', en: 'Undoes the choice to try the other path' },
            { es: 'Borra el resultado', en: 'Deletes the result' },
            { es: 'Termina la recursión', en: 'Ends the recursion' },
          ],
          answer: 0,
          explain: {
            es: 'Ese <code>pop</code> es el "back" de backtracking: regresas al estado de antes para que la siguiente opción empiece limpia.',
            en: 'That <code>pop</code> is the "back" in backtracking: you return to the previous state so the next option starts clean.',
          },
        },
        {
          type: 'order',
          prompt: {
            es: 'Arma <code>subsets(nums)</code>. En cada número, primero lo <b>incluye</b> y luego prueba <b>sin</b> él. Se prueba de verdad.',
            en: 'Build <code>subsets(nums)</code>. At each number, first <b>include</b> it, then try <b>without</b> it. It runs real tests.',
          },
          pre: 'function subsets(nums) {\n  const out = [], path = [];\n  function go(i) {',
          post: '  }\n  go(0);\n  return out;\n}',
          lines: [
            '    if (i === nums.length) { out.push([...path]); return; }',
            '    path.push(nums[i]);',
            '    go(i + 1);',
            '    path.pop();',
            '    go(i + 1);',
          ],
          seed: 2,
          fnName: 'subsets',
          tests: [
            { args: [[1, 2]], expect: [[1, 2], [1], [2], []] },
            { args: [[]], expect: [[]] },
            { args: [[7]], expect: [[7], []] },
          ],
          explain: {
            es: 'El caso base guarda una <b>copia</b> (<code>[...path]</code>): si guardaras <code>path</code> directo, todos los resultados serían el mismo array que después se vacía. ¡Las referencias de la unidad de objetos!',
            en: 'The base case stores a <b>copy</b> (<code>[...path]</code>): if you stored <code>path</code> itself, every result would be the same array, later emptied. References from the objects unit!',
          },
        },
        {
          type: 'code',
          prompt: { es: 'Escribe <code>permutations(str)</code>: todos los órdenes posibles de las letras (sin importar el orden del resultado).', en: 'Write <code>permutations(str)</code>: every possible ordering of the letters (result order doesn’t matter).' },
          fnName: 'permutations',
          wrap: '(s) => permutations(s).sort()',
          starter: "function permutations(str) {\n  if (str.length <= 1) return [str];\n  const out = [];\n  for (let i = 0; i < str.length; i++) {\n    const rest = str.slice(0, i) + str.slice(i + 1);\n    \n  }\n  return out;\n}\n",
          tests: [
            { args: ['ab'], expect: ['ab', 'ba'] },
            { args: ['abc'], expect: ['abc', 'acb', 'bac', 'bca', 'cab', 'cba'] },
            { args: ['a'], expect: ['a'] },
          ],
          hint: {
            es: 'Para cada letra <code>str[i]</code>, calcula las permutaciones de <code>rest</code> y pégale la letra al frente: <code>for (const p of permutations(rest)) out.push(str[i] + p);</code>',
            en: 'For each letter <code>str[i]</code>, get the permutations of <code>rest</code> and put the letter in front: <code>for (const p of permutations(rest)) out.push(str[i] + p);</code>',
          },
          solution:
            "function permutations(str) {\n  if (str.length <= 1) return [str];\n  const out = [];\n  for (let i = 0; i < str.length; i++) {\n    const rest = str.slice(0, i) + str.slice(i + 1);\n    for (const p of permutations(rest)) out.push(str[i] + p);\n  }\n  return out;\n}",
          explain: {
            es: 'Escoges la primera letra de todas las formas posibles y resuelves el resto con la misma función. Son n! resultados, así que solo funciona con textos cortos.',
            en: 'You pick the first letter every possible way and solve the rest with the same function. There are n! results, so it only works with short strings.',
          },
        },
      ],
    },
    {
      id: 'dp',
      unit: 3,
      icon: '🧮',
      title: { es: 'Programación dinámica', en: 'Dynamic programming' },
      blurb: { es: 'Recordar lo que ya calculaste', en: 'Remember what you already computed' },
      steps: [
        {
          type: 'read',
          title: { es: 'No hagas dos veces la misma cuenta', en: 'Don’t do the same math twice' },
          body: {
            es: '<p>¿Te acuerdas de <code>fib(40)</code>, que recalculaba lo mismo millones de veces? <b>Programación dinámica</b> es partir el problema en subproblemas que se repiten y <b>guardar</b> cada respuesta.</p><p>Se hace de arriba abajo (recursión + memo) o de abajo arriba (llenando una tabla).</p>',
            en: '<p>Remember <code>fib(40)</code>, recomputing the same thing millions of times? <b>Dynamic programming</b> is splitting a problem into repeating subproblems and <b>storing</b> each answer.</p><p>It goes top-down (recursion + memo) or bottom-up (filling a table).</p>',
          },
        },
        {
          type: 'number',
          prompt: {
            es: 'Subes una escalera de 4 escalones dando pasos de 1 o de 2. ¿De cuántas formas distintas puedes llegar arriba?',
            en: 'You climb a 4-step staircase taking steps of 1 or 2. In how many different ways can you reach the top?',
          },
          answer: 5,
          hint: { es: 'Escríbelas: 1+1+1+1, 1+1+2, 1+2+1, …', en: 'Write them out: 1+1+1+1, 1+1+2, 1+2+1, …' },
          explain: { es: '1+1+1+1, 1+1+2, 1+2+1, 2+1+1 y 2+2: 5 formas.', en: '1+1+1+1, 1+1+2, 1+2+1, 2+1+1 and 2+2: 5 ways.' },
        },
        {
          type: 'choice',
          prompt: { es: 'Para llegar al escalón n, tu último paso fue de 1 o de 2. ¿Qué fórmula cuenta las formas?', en: 'To reach step n, your last step was a 1 or a 2. Which formula counts the ways?' },
          options: ['<code>ways(n) = ways(n - 1) + ways(n - 2)</code>', '<code>ways(n) = ways(n - 1) * 2</code>', '<code>ways(n) = n * 2</code>'],
          answer: 0,
          explain: {
            es: 'Llegas a n desde n − 1 (paso de 1) o desde n − 2 (paso de 2), así que sumas las dos formas. ¡Es Fibonacci disfrazado!',
            en: 'You reach n from n − 1 (a 1-step) or from n − 2 (a 2-step), so you add both counts. It’s Fibonacci in disguise!',
          },
        },
        {
          type: 'trace',
          prompt: { es: 'Llena la tabla de abajo arriba: cada casilla usa las dos anteriores.', en: 'Fill the table bottom-up: each cell uses the two before it.' },
          code: 'const dp = [1, 1];\nfor (let i = 2; i <= 4; i++) {\n  dp[i] = dp[i - 1] + dp[i - 2];\n}',
          frames: [
            { line: 0, vars: { dp: [1, 1] }, note: { es: '0 escalones: 1 forma (no moverte). 1 escalón: 1 forma.', en: '0 steps: 1 way (stay put). 1 step: 1 way.' } },
            { line: 2, vars: { i: 2, dp: [1, 1, 2] } },
            { line: 2, vars: { i: 3, dp: [1, 1, 2, 3] } },
            { line: 2, vars: { i: 4, dp: [1, 1, 2, 3, 5] }, note: { es: '¡5, como contaste a mano! Cada casilla se calcula una vez: O(n).', en: '5, just like you counted by hand! Each cell is computed once: O(n).' } },
          ],
        },
        {
          type: 'choice',
          prompt: { es: 'Con la tabla (o con memo), ¿qué complejidad tiene ahora <code>fib(n)</code>?', en: 'With the table (or memo), what’s the complexity of <code>fib(n)</code> now?' },
          options: ['O(2ⁿ)', 'O(n)', 'O(log n)'],
          answer: 1,
          explain: { es: 'Cada valor de 0 a n se calcula una sola vez: de O(2ⁿ) a O(n). Ese salto es el truco completo de la programación dinámica.', en: 'Each value from 0 to n is computed once: from O(2ⁿ) to O(n). That jump is the whole trick of dynamic programming.' },
        },
        {
          type: 'code',
          prompt: {
            es: 'El clásico "Coin Change". Escribe <code>minCoins(coins, amount)</code>: la menor cantidad de monedas que suman <code>amount</code>, o <code>-1</code> si no se puede.',
            en: 'The classic "Coin Change". Write <code>minCoins(coins, amount)</code>: the fewest coins that add up to <code>amount</code>, or <code>-1</code> if it can’t be done.',
          },
          fnName: 'minCoins',
          starter:
            'function minCoins(coins, amount) {\n  // dp[x] = menos monedas para juntar x\n  const dp = new Array(amount + 1).fill(Infinity);\n  dp[0] = 0;\n  for (let x = 1; x <= amount; x++) {\n    for (const c of coins) {\n      \n    }\n  }\n  return dp[amount] === Infinity ? -1 : dp[amount];\n}\n',
          tests: [
            { args: [[1, 2, 5], 11], expect: 3 },
            { args: [[2], 3], expect: -1 },
            { args: [[1], 0], expect: 0 },
            { args: [[1, 3, 4], 6], expect: 2 },
          ],
          hint: {
            es: 'Si la moneda cabe (<code>c &lt;= x</code>), prueba usarla: <code>dp[x] = Math.min(dp[x], dp[x - c] + 1)</code>.',
            en: 'If the coin fits (<code>c &lt;= x</code>), try using it: <code>dp[x] = Math.min(dp[x], dp[x - c] + 1)</code>.',
          },
          solution:
            'function minCoins(coins, amount) {\n  const dp = new Array(amount + 1).fill(Infinity);\n  dp[0] = 0;\n  for (let x = 1; x <= amount; x++) {\n    for (const c of coins) {\n      if (c <= x) dp[x] = Math.min(dp[x], dp[x - c] + 1);\n    }\n  }\n  return dp[amount] === Infinity ? -1 : dp[amount];\n}',
          explain: {
            es: 'Fíjate en <code>[1, 3, 4]</code> con 6: escoger siempre la moneda más grande daría 4 + 1 + 1 = 3 monedas, pero 3 + 3 = 2. La programación dinámica no se deja engañar porque prueba todo, sin repetir cuentas.',
            en: 'Look at <code>[1, 3, 4]</code> with 6: always picking the largest coin gives 4 + 1 + 1 = 3 coins, but 3 + 3 = 2. Dynamic programming isn’t fooled because it tries everything, without repeating work.',
          },
        },
      ],
    },
  );

  // Complejidad de los retos de código que tienen una respuesta clara (para el modo entrevista).
  const mark = (lessonId, time, space) => {
    const l = c.lessons.find((x) => x.id === lessonId);
    const s = l && l.steps.find((x) => x.type === 'code');
    if (s && !s.complexity) s.complexity = { time, space };
  };
  mark('two-pointers', 'O(n)', 'O(1)');
  mark('sliding-window', 'O(n)', 'O(1)');
  mark('hash-maps', 'O(n)', 'O(n)');
  mark('trees', 'O(n)', 'O(n)');
})();
