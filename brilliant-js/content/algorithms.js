// Curso 1: Algoritmos con intuición. Todo es datos: cada pantalla es un objeto con su "type"
// (ver app/widgets.js). Los textos van en { es, en }; el código es el mismo en los dos idiomas.
window.COURSES = window.COURSES || [];
window.COURSES.push({
  id: 'algos',
  title: { es: 'Algoritmos con intuición', en: 'Algorithms by intuition' },
  blurb: {
    es: 'Arrays, contar pasos, búsqueda binaria y dos punteros: las ideas que más salen en entrevistas, entendidas tocando en lugar de memorizando.',
    en: 'Arrays, counting steps, binary search and two pointers: the ideas interviews ask about most, understood by poking at them instead of memorizing.',
  },
  soon: [
    { icon: '🪟', title: { es: 'Ventana deslizante', en: 'Sliding window' } },
    { icon: '🗝️', title: { es: 'Hash maps', en: 'Hash maps' } },
    { icon: '🪆', title: { es: 'Recursión', en: 'Recursion' } },
    { icon: '🌳', title: { es: 'Árboles', en: 'Trees' } },
  ],
  lessons: [
    // ═══════════════════════ 1 · Arrays ═══════════════════════
    {
      id: 'arrays',
      icon: '🗄️',
      title: { es: 'Una fila de casilleros', en: 'A row of lockers' },
      blurb: { es: 'Índices, length y por qué todo empieza en 0', en: 'Indexes, length and why everything starts at 0' },
      steps: [
        {
          type: 'read',
          title: { es: 'Un array es una fila de casilleros', en: 'An array is a row of lockers' },
          code: "const food = ['🍕', '🍔', '🌮', '🍣'];",
          array: ['🍕', '🍔', '🌮', '🍣'],
          body: {
            es: '<p>Cada casillero tiene un número: su <b>índice</b>. El primero es el <b>0</b>, no el 1.</p><p>Para abrir un casillero escribes el nombre del array y el índice entre corchetes: <code>food[0]</code> es 🍕.</p>',
            en: '<p>Every locker has a number: its <b>index</b>. The first one is <b>0</b>, not 1.</p><p>To open a locker you write the array’s name and the index in brackets: <code>food[0]</code> is 🍕.</p>',
          },
        },
        {
          type: 'tap',
          prompt: { es: '¿Qué hay en <code>food[2]</code>? Toca su casillero.', en: 'What’s in <code>food[2]</code>? Tap its locker.' },
          values: ['🍕', '🍔', '🌮', '🍣'],
          indices: false,
          answer: 2,
          why: {
            1: { es: 'Ese es <code>food[1]</code>. Cuenta desde 0: 🍕 es el 0, 🍔 es el 1…', en: 'That’s <code>food[1]</code>. Count from 0: 🍕 is 0, 🍔 is 1…' },
            3: { es: 'Contaste desde 1. En JavaScript el primero es el 0, así que el 2 es el <b>tercero</b>.', en: 'You counted from 1. In JavaScript the first one is 0, so index 2 is the <b>third</b> one.' },
          },
          explain: {
            es: '<code>food[0]</code> es 🍕, <code>food[1]</code> es 🍔 y <code>food[2]</code> es 🌮. El índice dice cuántos casilleros te <b>saltas</b> desde el inicio.',
            en: '<code>food[0]</code> is 🍕, <code>food[1]</code> is 🍔 and <code>food[2]</code> is 🌮. The index says how many lockers you <b>skip</b> from the start.',
          },
        },
        {
          type: 'choice',
          prompt: { es: '¿Qué vale <code>nums.length</code>?', en: 'What is <code>nums.length</code>?' },
          code: 'const nums = [10, 20, 30, 40];\nnums.length',
          options: ['<code>3</code>', '<code>4</code>', '<code>40</code>', '<code>5</code>'],
          answer: 1,
          why: {
            0: { es: '3 es el índice del <b>último</b> elemento, no la cantidad de elementos.', en: '3 is the index of the <b>last</b> element, not how many elements there are.' },
            2: { es: '<code>length</code> cuenta casilleros; no lee lo que hay dentro.', en: '<code>length</code> counts lockers; it doesn’t read what’s inside them.' },
          },
          explain: {
            es: '<code>length</code> cuenta cuántos elementos hay: 4. Como empiezas en 0, el último índice siempre es <code>length - 1</code>.',
            en: '<code>length</code> counts the elements: 4. Since you start at 0, the last index is always <code>length - 1</code>.',
          },
        },
        {
          type: 'tap',
          prompt: { es: 'Toca el casillero de <code>nums[nums.length - 1]</code>.', en: 'Tap the locker for <code>nums[nums.length - 1]</code>.' },
          code: 'const nums = [7, 2, 9, 4, 6];',
          values: [7, 2, 9, 4, 6],
          indices: false,
          answer: 4,
          hint: { es: 'Primero calcula <code>nums.length</code>, luego réstale 1.', en: 'First work out <code>nums.length</code>, then subtract 1.' },
          explain: {
            es: '<code>length</code> es 5, así que es <code>nums[4]</code>: el último. Es la forma estándar de leer el final de un array, sin importar su tamaño.',
            en: '<code>length</code> is 5, so it’s <code>nums[4]</code>: the last one. It’s the standard way to read the end of an array, whatever its size.',
          },
        },
        {
          type: 'choice',
          prompt: { es: '¿Qué pasa al leer un casillero que no existe?', en: 'What happens when you read a locker that doesn’t exist?' },
          code: 'const nums = [10, 20, 30, 40];\nnums[4]',
          options: ['<code>40</code>', '<code>undefined</code>', { es: 'Un error', en: 'An error' }, '<code>null</code>'],
          answer: 1,
          why: {
            0: { es: 'El 40 vive en <code>nums[3]</code>. <code>nums[4]</code> sería un quinto casillero.', en: '40 lives at <code>nums[3]</code>. <code>nums[4]</code> would be a fifth locker.' },
            2: {
              es: 'En otros lenguajes, sí. JavaScript no se queja: te da <code>undefined</code> en silencio, y por eso estos bugs se esconden tan bien.',
              en: 'In other languages, yes. JavaScript doesn’t complain: it quietly gives you <code>undefined</code>, which is why these bugs hide so well.',
            },
          },
          explain: {
            es: 'Leer fuera del array da <code>undefined</code>, sin error. Si un loop te devuelve un <code>undefined</code> misterioso al final, casi siempre es esto.',
            en: 'Reading past the end gives <code>undefined</code>, no error. If a loop hands you a mystery <code>undefined</code> at the end, it’s almost always this.',
          },
        },
        {
          type: 'fill',
          prompt: { es: 'Completa el loop para recorrer todo el array sin salirte.', en: 'Fill in the loop so it walks the whole array without going past the end.' },
          code: 'for (let i = 0; i [[0]] nums.length; i++) {\n  console.log(nums[i]);\n}',
          chips: ['<', '<=', '>'],
          answers: ['<'],
          hint: {
            es: 'Piensa en la última vuelta. Con <code>&lt;=</code>, ¿cuánto vale <code>i</code> al final, y existe ese casillero?',
            en: 'Think about the last lap. With <code>&lt;=</code>, what is <code>i</code> at the end, and does that locker exist?',
          },
          explain: {
            es: 'Con <code>&lt;</code>, <code>i</code> llega hasta <code>length - 1</code>, el último casillero. Con <code>&lt;=</code> daría una vuelta de más y leería <code>undefined</code>.',
            en: 'With <code>&lt;</code>, <code>i</code> goes up to <code>length - 1</code>, the last locker. With <code>&lt;=</code> it would take one extra lap and read <code>undefined</code>.',
          },
        },
        {
          type: 'trace',
          prompt: { es: 'Avanza paso a paso y mira cómo cambian <code>i</code> y <code>total</code>.', en: 'Step through it and watch <code>i</code> and <code>total</code> change.' },
          code: 'const nums = [3, 1, 4];\nlet total = 0;\nfor (let i = 0; i < nums.length; i++) {\n  total = total + nums[i];\n}',
          array: [3, 1, 4],
          frames: [
            { line: 0, vars: {} },
            { line: 1, vars: { total: 0 } },
            { line: 2, vars: { total: 0, i: 0 }, note: { es: '<code>0 &lt; 3</code>: entra al loop.', en: '<code>0 &lt; 3</code>: into the loop.' } },
            { line: 3, vars: { total: 3, i: 0 }, note: { es: '<code>total = 0 + nums[0]</code>', en: '<code>total = 0 + nums[0]</code>' } },
            { line: 2, vars: { total: 3, i: 1 } },
            { line: 3, vars: { total: 4, i: 1 }, note: { es: '<code>total = 3 + nums[1]</code>', en: '<code>total = 3 + nums[1]</code>' } },
            { line: 2, vars: { total: 4, i: 2 } },
            { line: 3, vars: { total: 8, i: 2 }, note: { es: '<code>total = 4 + nums[2]</code>', en: '<code>total = 4 + nums[2]</code>' } },
            { line: 2, vars: { total: 8, i: 3 }, note: { es: '<code>3 &lt; 3</code> es falso: el loop termina.', en: '<code>3 &lt; 3</code> is false: the loop ends.' } },
          ],
        },
        {
          type: 'number',
          prompt: { es: 'Sin correrlo: con este array, ¿cuánto vale <code>total</code> al final?', en: 'Without running it: with this array, what is <code>total</code> at the end?' },
          code: 'const nums = [5, 5, 5, 5];\nlet total = 0;\nfor (let i = 0; i < nums.length; i++) {\n  total = total + nums[i];\n}',
          answer: 20,
          hint: { es: 'El loop da una vuelta por casillero y en cada una suma lo que hay dentro.', en: 'The loop takes one lap per locker and adds what’s inside each time.' },
          explain: { es: 'Cuatro vueltas, cada una suma 5: <code>total</code> termina en 20.', en: 'Four laps, each adding 5: <code>total</code> ends at 20.' },
        },
      ],
    },

    // ═══════════════════════ 2 · Contar pasos ═══════════════════════
    {
      id: 'steps',
      icon: '👣',
      title: { es: 'Contar pasos', en: 'Counting steps' },
      blurb: { es: 'La intuición detrás de Big O', en: 'The intuition behind Big O' },
      steps: [
        {
          type: 'read',
          title: { es: 'No medimos segundos', en: 'We don’t measure seconds' },
          body: {
            es: '<p>Cuánto tarda un programa depende de la compu. Para comparar <b>ideas</b>, contamos <b>pasos</b>: cuántas veces hay que mirar un casillero.</p><p>Y lo que importa es cómo crecen los pasos cuando el problema crece.</p>',
            en: '<p>How long a program takes depends on the computer. To compare <b>ideas</b>, we count <b>steps</b>: how many times you have to look in a locker.</p><p>And what matters is how the steps grow as the problem grows.</p>',
          },
        },
        {
          type: 'search',
          prompt: { es: 'Hay 8 cartas boca abajo, en desorden. Encuentra el <b>42</b>.', en: 'There are 8 face-down cards in no particular order. Find the <b>42</b>.' },
          values: [17, 42, 8, 23, 4, 15, 16, 99],
          target: 42,
        },
        {
          type: 'choice',
          prompt: { es: 'Con 8 cartas en desorden, en el <b>peor caso</b>, ¿cuántas tienes que voltear?', en: 'With 8 shuffled cards, in the <b>worst case</b>, how many do you have to flip?' },
          options: ['1', '4', '7', '8'],
          answer: 3,
          why: {
            0: { es: 'Con suerte, sí. Pero el peor caso es que esté al final.', en: 'With luck, yes. But the worst case is that it’s at the end.' },
            1: { es: 'Eso es más o menos el caso <b>promedio</b>. El peor caso es peor.', en: 'That’s roughly the <b>average</b> case. The worst case is worse.' },
            2: { es: 'Si las primeras 7 no eran, todavía tienes que voltear la última para ver el 42.', en: 'If the first 7 weren’t it, you still have to flip the last one to see the 42.' },
          },
          explain: {
            es: 'En el peor caso el 42 está en la última carta, o no está: miras las <b>n</b>. Eso es <b>O(n)</b>, tiempo lineal: el doble de cartas, el doble de trabajo.',
            en: 'In the worst case 42 is the last card, or not there at all: you look at all <b>n</b>. That’s <b>O(n)</b>, linear time: twice the cards, twice the work.',
          },
        },
        {
          type: 'growth',
          prompt: { es: 'Mueve n o dale a <b>×2</b>. ¿Qué le pasa a cada fila cuando n se duplica?', en: 'Move n or hit <b>×2</b>. What happens to each row when n doubles?' },
          start: 10,
        },
        {
          type: 'choice',
          prompt: { es: 'Con <code>n = 4</code>, ¿cuánto vale <code>count</code> al final?', en: 'With <code>n = 4</code>, what is <code>count</code> at the end?' },
          code: 'let count = 0;\nfor (let i = 0; i < n; i++) {\n  for (let j = 0; j < n; j++) {\n    count++;\n  }\n}',
          options: ['4', '8', '16', '10'],
          answer: 2,
          why: {
            0: { es: 'Ese es solo el loop de afuera. El de adentro corre completo en <b>cada</b> vuelta del de afuera.', en: 'That’s just the outer loop. The inner one runs in full on <b>every</b> lap of the outer one.' },
            1: { es: 'Eso pasaría si los loops fueran uno <b>después</b> del otro. Aquí uno va <b>dentro</b> del otro.', en: 'That would be the loops running one <b>after</b> the other. Here one is <b>inside</b> the other.' },
          },
          explain: {
            es: 'Por cada una de las 4 vueltas de <code>i</code>, <code>j</code> da 4 vueltas: 4 × 4 = 16. Un loop dentro de otro sobre lo mismo es <b>O(n²)</b>.',
            en: 'For each of the 4 laps of <code>i</code>, <code>j</code> takes 4 laps: 4 × 4 = 16. A loop inside another over the same data is <b>O(n²)</b>.',
          },
        },
        {
          type: 'choice',
          prompt: {
            es: '<b>Two Sum</b> por fuerza bruta compara cada par de números una vez. Con 1,000 números, ¿cuántas comparaciones hace, más o menos?',
            en: 'Brute-force <b>Two Sum</b> compares every pair of numbers once. With 1,000 numbers, roughly how many comparisons is that?',
          },
          code: 'for (let i = 0; i < n; i++) {\n  for (let j = i + 1; j < n; j++) {\n    if (nums[i] + nums[j] === target) return [i, j];\n  }\n}',
          options: ['~1,000', '~500,000', '~1,000,000', '~10'],
          answer: 1,
          why: {
            0: { es: 'Eso sería un solo loop. Aquí hay uno dentro de otro.', en: 'That would be a single loop. Here one is inside the other.' },
            2: {
              es: 'Casi: eso contaría cada par dos veces (a con b y b con a). Como <code>j</code> empieza en <code>i + 1</code>, cada par se compara una sola vez.',
              en: 'Close: that would count every pair twice (a with b and b with a). Since <code>j</code> starts at <code>i + 1</code>, each pair is compared once.',
            },
          },
          explain: {
            es: 'Hay unos n²/2 pares: 1,000 × 1,000 / 2 = 500,000. Sigue siendo <b>O(n²)</b>: dividir entre 2 no cambia cómo crece. En la lección 4 lo bajas a ~1,000 pasos.',
            en: 'There are about n²/2 pairs: 1,000 × 1,000 / 2 = 500,000. Still <b>O(n²)</b>: halving doesn’t change how it grows. In lesson 4 you’ll get it down to ~1,000 steps.',
          },
        },
      ],
    },

    // ═══════════════════════ 3 · Búsqueda binaria ═══════════════════════
    {
      id: 'binary',
      icon: '🔎',
      title: { es: 'Partir a la mitad', en: 'Cut it in half' },
      blurb: { es: 'Búsqueda binaria y O(log n)', en: 'Binary search and O(log n)' },
      steps: [
        {
          type: 'guess',
          prompt: {
            es: 'Pensé un número del 1 al 100. Adivínalo: después de cada intento te digo si es más alto o más bajo. Intenta usar pocos intentos.',
            en: 'I picked a number from 1 to 100. Guess it: after each try I’ll tell you if it’s higher or lower. Try to use as few guesses as you can.',
          },
          min: 1,
          max: 100,
        },
        {
          type: 'choice',
          prompt: { es: '¿Cuál es el mejor <b>primer</b> intento?', en: 'What’s the best <b>first</b> guess?' },
          options: ['1', '25', '50', '75'],
          answer: 2,
          why: {
            0: { es: 'Si fallas, solo descartaste un número. Quedan 99.', en: 'If you miss, you only ruled out one number. 99 are left.' },
            1: { es: 'Si el número es más alto, te quedan 75 por revisar. Con 50, en el peor caso te quedan 50.', en: 'If it’s higher, 75 are left to check. With 50, the worst case leaves 50.' },
            3: { es: 'Si el número es más bajo, te quedan 74. Con 50, en el peor caso te quedan 50.', en: 'If it’s lower, 74 are left. With 50, the worst case leaves 50.' },
          },
          explain: {
            es: 'Con 50, te digan "más alto" o "más bajo", descartas la mitad. Partir a la mitad en cada paso es la <b>búsqueda binaria</b>.',
            en: 'With 50, whether you hear "higher" or "lower", you rule out half. Cutting in half every step is <b>binary search</b>.',
          },
        },
        {
          type: 'halving',
          prompt: { es: 'Mueve n. ¿Cuántas veces hay que partir a la mitad hasta quedarte con un solo número?', en: 'Move n. How many times do you halve before a single number is left?' },
          start: 7,
        },
        {
          type: 'number',
          prompt: {
            es: 'Con la mejor estrategia, ¿cuántas preguntas necesitas <b>como máximo</b> para encontrar un número entre 1,024?',
            en: 'With the best strategy, what’s the <b>most</b> questions you need to find one number among 1,024?',
          },
          answer: 10,
          hint: { es: '¿Cuántas veces puedes dividir 1,024 entre 2 hasta llegar a 1?', en: 'How many times can you divide 1,024 by 2 before reaching 1?' },
          explain: {
            es: '1,024 → 512 → 256 → … → 1 son 10 mitades, porque 2¹⁰ = 1,024. Eso es <b>O(log n)</b>: con un millón de números bastan 20 preguntas.',
            en: '1,024 → 512 → 256 → … → 1 is 10 halvings, because 2¹⁰ = 1,024. That’s <b>O(log n)</b>: a million numbers takes just 20 questions.',
          },
        },
        {
          type: 'choice',
          prompt: { es: 'Quieres usar búsqueda binaria para encontrar el 7 en este array. ¿Qué pasa?', en: 'You want to use binary search to find 7 in this array. What happens?' },
          code: '[3, 9, 1, 7, 5]',
          options: [
            { es: 'Funciona igual', en: 'It works just the same' },
            { es: 'Puede fallar: el array no está ordenado', en: 'It can fail: the array isn’t sorted' },
            { es: 'Funciona, pero más lento', en: 'It works, but slower' },
          ],
          answer: 1,
          why: {
            0: {
              es: 'Prueba: el medio es el 1. 7 es mayor, así que te vas a la derecha… y el 7 nunca aparece, porque estaba en otro lado.',
              en: 'Try it: the middle is 1. 7 is bigger, so you go right… and 7 never shows up, because it was somewhere else.',
            },
          },
          explain: {
            es: 'Partir a la mitad solo sirve si al ver el medio sabes de qué lado está lo que buscas. Para eso el array tiene que estar <b>ordenado</b>.',
            en: 'Halving only works if looking at the middle tells you which side your target is on. For that, the array has to be <b>sorted</b>.',
          },
        },
        {
          type: 'bsearch',
          prompt: { es: 'Este array sí está ordenado. Busca el <b>23</b> tocando siempre el casillero del medio de lo que queda.', en: 'This array is sorted. Find <b>23</b> by always tapping the middle box of what’s left.' },
          values: [2, 5, 8, 12, 16, 23, 38, 45, 56, 67, 72, 81, 88, 91, 99],
          target: 23,
        },
        {
          type: 'order',
          prompt: {
            es: 'Arma la búsqueda binaria tocando los bloques en orden. Cuando la compruebes, la vamos a correr con pruebas de verdad.',
            en: 'Build binary search by tapping the blocks in order. When you check it, it runs against real tests.',
          },
          pre: 'function search(arr, target) {',
          post: '}',
          lines: [
            '  let lo = 0, hi = arr.length - 1;',
            '  while (lo <= hi) {',
            '    const mid = Math.floor((lo + hi) / 2);',
            '    if (arr[mid] === target) return mid;',
            '    if (arr[mid] < target) lo = mid + 1;',
            '    else hi = mid - 1;',
            '  }',
            '  return -1;',
          ],
          seed: 11,
          fnName: 'search',
          tests: [
            { args: [[1, 3, 5, 7, 9, 11], 7], expect: 3 },
            { args: [[1, 3, 5], 4], expect: -1 },
            { args: [[2], 2], expect: 0 },
            { args: [[], 5], expect: -1 },
            { args: [[1, 2, 3, 4, 5, 6, 7, 8], 1], expect: 0 },
            { args: [[1, 2, 3, 4, 5, 6, 7, 8], 8], expect: 7 },
          ],
          explain: {
            es: '<code>lo</code> y <code>hi</code> marcan el rango que todavía puede tener la respuesta. Cada vuelta mira el medio y tira la mitad que ya no sirve. Si el rango se vacía (<code>lo &gt; hi</code>), no estaba: <code>-1</code>.',
            en: '<code>lo</code> and <code>hi</code> mark the range that could still hold the answer. Each lap checks the middle and throws away the useless half. If the range empties out (<code>lo &gt; hi</code>), it wasn’t there: <code>-1</code>.',
          },
        },
      ],
    },

    // ═══════════════════════ 4 · Dos punteros ═══════════════════════
    {
      id: 'two-pointers',
      icon: '🎯',
      title: { es: 'Dos punteros', en: 'Two pointers' },
      blurb: { es: 'De O(n²) a O(n) con un dedo en cada punta', en: 'From O(n²) to O(n) with a finger on each end' },
      steps: [
        {
          type: 'read',
          title: { es: 'El problema', en: 'The problem' },
          array: [1, 3, 4, 6, 8, 11],
          body: {
            es: '<p>En un array <b>ordenado</b>, encuentra dos números que sumen un objetivo, por ejemplo 10.</p><p>La fuerza bruta prueba todos los pares: O(n²). Pero el orden te da pistas gratis. Pon un dedo en cada punta y míralo tú.</p>',
            en: '<p>In a <b>sorted</b> array, find two numbers that add up to a target, say 10.</p><p>Brute force tries every pair: O(n²). But the ordering gives you free clues. Put a finger on each end and see for yourself.</p>',
          },
        },
        {
          type: 'pointers',
          prompt: {
            es: 'Encuentra dos números que sumen <b>10</b>. Mueve <b>L</b> a la derecha o <b>R</b> a la izquierda, uno a la vez.',
            en: 'Find two numbers that add up to <b>10</b>. Move <b>L</b> right or <b>R</b> left, one at a time.',
          },
          values: [1, 3, 4, 6, 8, 11],
          target: 10,
        },
        {
          type: 'choice',
          prompt: { es: 'L apunta al 1 y R al 11: la suma es 12 y buscas 10. ¿Qué haces?', en: 'L points at 1 and R at 11: the sum is 12 and you want 10. What do you do?' },
          options: [
            { es: 'Mover L a la derecha', en: 'Move L right' },
            { es: 'Mover R a la izquierda', en: 'Move R left' },
            { es: 'Mover los dos', en: 'Move both' },
          ],
          answer: 1,
          why: {
            0: { es: 'Mover L cambia el 1 por un número más grande: la suma sube todavía más.', en: 'Moving L swaps 1 for a bigger number: the sum goes up even more.' },
            2: { es: 'Mover L hace subir la suma, justo lo contrario de lo que necesitas.', en: 'Moving L makes the sum go up, the opposite of what you need.' },
          },
          explain: {
            es: 'Necesitas que la suma baje, y solo baja si cambias el 11 por algo más chico. Además el 11 queda descartado para siempre: ni con el número más chico (1) llega a 10.',
            en: 'You need the sum to drop, and it only drops if you swap 11 for something smaller. And 11 is out for good: even with the smallest number (1) it can’t make 10.',
          },
        },
        {
          type: 'choice',
          prompt: { es: '¿Cuántos pasos hace dos punteros en el peor caso, con n números?', en: 'How many steps does two pointers take in the worst case, with n numbers?' },
          options: ['O(log n)', 'O(n)', 'O(n²)'],
          answer: 1,
          why: {
            0: { es: 'Eso sería si cada paso tirara la mitad. Aquí cada paso tira <b>un</b> número.', en: 'That would mean each step throws away half. Here each step throws away <b>one</b> number.' },
            2: { es: 'Los punteros nunca regresan, así que no se prueban todos los pares.', en: 'The pointers never go back, so you never try every pair.' },
          },
          explain: {
            es: 'Cada paso mueve un puntero y nunca regresan: entre los dos recorren el array una vez. Con 1,000 números son ~1,000 pasos, contra ~500,000 de la fuerza bruta.',
            en: 'Each step moves one pointer and they never go back: together they walk the array once. With 1,000 numbers that’s ~1,000 steps, versus ~500,000 for brute force.',
          },
        },
        {
          type: 'code',
          prompt: {
            es: 'Ahora tú. Escribe <code>pairSum(arr, target)</code>: recibe un array ordenado y regresa los índices <code>[i, j]</code> de dos números que sumen <code>target</code>, o <code>null</code> si no hay. Las pruebas corren aquí mismo, en tu dispositivo.',
            en: 'Your turn. Write <code>pairSum(arr, target)</code>: it takes a sorted array and returns the indexes <code>[i, j]</code> of two numbers that add up to <code>target</code>, or <code>null</code> if there are none. The tests run right here, on your device.',
          },
          fnName: 'pairSum',
          starter: 'function pairSum(arr, target) {\n  let left = 0;\n  let right = arr.length - 1;\n  \n}\n',
          tests: [
            { args: [[1, 3, 4, 6, 8, 11], 10], expect: [2, 3] },
            { args: [[2, 7, 11, 15], 9], expect: [0, 1] },
            { args: [[-3, 0, 4, 5], 2], expect: [0, 3] },
            { args: [[1, 2, 3], 100], expect: null },
            { args: [[5], 10], expect: null },
            { args: [[], 1], expect: null },
          ],
          hint: {
            es: 'Mientras <code>left &lt; right</code>: si la suma es igual, regresa <code>[left, right]</code>; si es menor, <code>left++</code>; si es mayor, <code>right--</code>. Al salir del loop, <code>null</code>.',
            en: 'While <code>left &lt; right</code>: if the sum matches, return <code>[left, right]</code>; if it’s smaller, <code>left++</code>; if bigger, <code>right--</code>. After the loop, <code>null</code>.',
          },
          solution:
            'function pairSum(arr, target) {\n  let left = 0;\n  let right = arr.length - 1;\n  while (left < right) {\n    const sum = arr[left] + arr[right];\n    if (sum === target) return [left, right];\n    if (sum < target) left++;\n    else right--;\n  }\n  return null;\n}',
          explain: {
            es: 'Ya resolviste un problema de entrevista en O(n). Este mismo patrón sale en 3Sum, Container With Most Water y Valid Palindrome.',
            en: 'You just solved an interview problem in O(n). The same pattern shows up in 3Sum, Container With Most Water and Valid Palindrome.',
          },
        },
      ],
    },
  ],
});
