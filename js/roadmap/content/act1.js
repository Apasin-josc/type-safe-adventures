// ACTO I · JavaScript por dentro
// Todo el contenido del curso vive aquí como datos. La app (app/app.js) solo lo pinta.
//
// Tipos de paso en una lección:
//   predict → pregunta "¿qué imprime?" ANTES de explicar (método socrático)
//   think   → pregunta abierta; escribes tu respuesta y luego comparas
//   text    → explicación
//   code    → ejemplo de código
//   analogy → analogía geek
//   viz     → animación paso a paso
//   dsa     → por qué importa en entrevistas
//   links   → para investigar por tu cuenta
(function (root) {
  'use strict';

  const MDN = 'https://developer.mozilla.org/en-US/docs/';
  const JSI = 'https://javascript.info/';

  // ───────────────────────────── M1 · TIPOS ─────────────────────────────
  const m1 = {
    id: 'm1',
    dir: 'm1-types',
    title: 'Tipos y coerción',
    tagline: 'Lo que JavaScript hace con tus valores cuando no estás viendo.',
    zone: 'Pradera de los Tipos',
    mob: { sprite: 'slime', name: 'Slime NaN' },
    bossMob: { name: 'Rey Slime de la Coerción' },
    lessons: [
      {
        title: 'typeof y los 7 primitivos',
        steps: [
          {
            type: 'predict',
            q: 'Antes de leer nada: ¿qué imprime esto?',
            code: 'console.log(typeof null);',
            options: ['"null"', '"object"', '"undefined"', 'TypeError'],
            answer: 1,
            why: 'Es un bug de la primera versión de JavaScript (1995) que nunca se pudo arreglar porque rompería millones de sitios. <code>null</code> NO es un objeto, pero <code>typeof</code> miente. Por eso se compara directo: <code>x === null</code>.',
          },
          {
            type: 'text',
            html: `<p>JavaScript tiene <strong>7 tipos primitivos</strong>. Todo lo demás es un objeto.</p>
<table>
<tr><th>Primitivo</th><th>Ejemplo</th><th>typeof</th></tr>
<tr><td>string</td><td><code>"hola"</code></td><td><code>"string"</code></td></tr>
<tr><td>number</td><td><code>42</code>, <code>3.14</code>, <code>NaN</code>, <code>Infinity</code></td><td><code>"number"</code></td></tr>
<tr><td>bigint</td><td><code>10n</code></td><td><code>"bigint"</code></td></tr>
<tr><td>boolean</td><td><code>true</code></td><td><code>"boolean"</code></td></tr>
<tr><td>undefined</td><td><code>undefined</code></td><td><code>"undefined"</code></td></tr>
<tr><td>symbol</td><td><code>Symbol("id")</code></td><td><code>"symbol"</code></td></tr>
<tr><td>null</td><td><code>null</code></td><td><code>"object"</code> 🐛</td></tr>
</table>
<p>Los objetos (arrays, funciones, fechas, Map, Set…) dan <code>"object"</code>, excepto las funciones, que dan <code>"function"</code>.</p>
<p>Los primitivos son <strong>inmutables</strong>: no puedes cambiar un string, solo crear otro. Guárdate ese dato, vuelve en la lección 3.</p>`,
          },
          {
            type: 'predict',
            q: 'NaN significa "Not a Number". Entonces…',
            code: 'console.log(typeof NaN);\nconsole.log(NaN === NaN);',
            options: ['"NaN" y true', '"number" y true', '"number" y false', '"undefined" y false'],
            answer: 2,
            why: '<code>NaN</code> es un valor del tipo number: es lo que regresan las operaciones numéricas que fallan (<code>0 / 0</code>, <code>Number("abc")</code>). Y es el <strong>único valor de JS que no es igual a sí mismo</strong>. Para detectarlo: <code>Number.isNaN(x)</code>.',
          },
          {
            type: 'code',
            caption: 'Los chequeos confiables que sí vas a usar:',
            code: `x === null              // ¿es null?
Array.isArray(x)        // ¿es un array? (typeof [] da "object")
Number.isNaN(x)         // ¿es NaN?
Number.isInteger(x)     // ¿es un entero?
typeof x === "function" // ¿se puede llamar?`,
          },
          {
            type: 'think',
            q: 'Te pasan un valor <code>x</code> que puede ser un array o un objeto normal. <code>typeof</code> da "object" para ambos. ¿Cómo los distingues y por qué crees que <code>typeof</code> no alcanza?',
            a: '<code>Array.isArray(x)</code>. Un array ES un objeto (con keys "0", "1", "2"… y una propiedad <code>length</code> especial), por eso <code>typeof</code> no ve la diferencia. Esto va a salir literal en tu primer ejercicio.',
          },
          {
            type: 'analogy',
            title: 'Tu party de RPG',
            html: 'Los 7 primitivos son las <strong>clases base</strong> del juego: guerrero, mago, arquero… cada personaje es de una sola clase y no puede cambiar. Los objetos son el <strong>inventario</strong>: una bolsa donde metes de todo, incluidas otras bolsas. Y <code>typeof null</code> es ese NPC bugueado que dice ser mercader pero no vende nada: todos saben que está roto y nadie lo puede parchar.',
          },
          {
            type: 'dsa',
            html: `<p>Tres trampas del tipo number que salen en entrevistas:</p>
<ul>
<li><strong>Todos los números son decimales de 64 bits.</strong> <code>0.1 + 0.2</code> da <code>0.30000000000000004</code>. Nunca compares decimales con <code>===</code>.</li>
<li><strong>No hay división entera.</strong> <code>7 / 2</code> es <code>3.5</code>. Para el punto medio en binary search: <code>Math.floor((lo + hi) / 2)</code>.</li>
<li><strong>El módulo conserva el signo.</strong> <code>-7 % 3</code> es <code>-1</code>, no <code>2</code>. Para índices circulares: <code>((i % n) + n) % n</code>.</li>
</ul>
<p>Y el entero más grande seguro es <code>Number.MAX_SAFE_INTEGER</code> (2<sup>53</sup> − 1). Más allá necesitas <code>BigInt</code>.</p>`,
          },
          {
            type: 'links',
            items: [
              { t: 'javascript.info · Data types', u: JSI + 'types' },
              { t: 'MDN · typeof', u: MDN + 'Web/JavaScript/Reference/Operators/typeof' },
              { t: 'MDN · Number.isNaN', u: MDN + 'Web/JavaScript/Reference/Global_Objects/Number/isNaN' },
            ],
          },
        ],
      },
      {
        title: 'Coerción: == contra ===',
        steps: [
          {
            type: 'predict',
            q: 'Mismo string, mismo número, distinto operador:',
            code: 'console.log("5" + 2);\nconsole.log("5" - 2);',
            options: ['7 y 3', '"52" y 3', '"52" y "3"', '"52" y NaN'],
            answer: 1,
            why: 'El <code>+</code> tiene dos trabajos: sumar y concatenar. Si <strong>cualquiera</strong> de los dos lados es string, concatena. El <code>-</code> solo sabe restar, así que convierte ambos lados a número.',
          },
          {
            type: 'text',
            html: `<p><strong>Coerción</strong> es cuando JS convierte un valor de un tipo a otro por su cuenta. Reglas que cubren casi todo:</p>
<ul>
<li><code>+</code> con un string en cualquier lado → convierte el otro a string y concatena.</li>
<li><code>- * / %</code> y las comparaciones <code>&lt; &gt;</code> → convierten a número.</li>
<li><code>if (x)</code>, <code>!x</code>, <code>&amp;&amp;</code>, <code>||</code> → convierten a boolean.</li>
<li><code>==</code> → si los tipos son distintos, convierte (casi siempre a número) y luego compara.</li>
<li><code>===</code> → <strong>nunca</strong> convierte. Tipos distintos, <code>false</code> y ya.</li>
</ul>`,
          },
          {
            type: 'predict',
            q: 'Con las reglas de arriba, intenta deducirlo:',
            code: 'console.log([] == false);\nconsole.log(null == 0);',
            options: ['true y true', 'false y false', 'true y false', 'false y true'],
            answer: 2,
            why: '<code>[]</code> se convierte a <code>""</code>, luego a <code>0</code>; <code>false</code> también a <code>0</code>. Iguales. Pero <code>null</code> es un caso especial: con <code>==</code> solo es igual a <code>undefined</code> (y a sí mismo), a nada más. Moraleja: usa <code>===</code> siempre y no memorices esta tabla.',
          },
          {
            type: 'text',
            html: `<p>Solo hay <strong>8 valores falsy</strong>. Apréndetelos, porque todo lo demás es truthy:</p>
<p class="big-code"><code>false</code> · <code>0</code> · <code>-0</code> · <code>0n</code> · <code>""</code> · <code>null</code> · <code>undefined</code> · <code>NaN</code></p>`,
          },
          {
            type: 'predict',
            q: '¿Qué letras se imprimen?',
            code: 'if ([]) console.log("A");\nif ("0") console.log("B");\nif (0) console.log("C");\nif ({}) console.log("D");',
            options: ['Solo D', 'A, B y D', 'A y D', 'B y D'],
            answer: 1,
            why: 'Un array vacío y un objeto vacío son truthy (no están en la lista de 8). El string <code>"0"</code> también: no es el string vacío. Solo el número <code>0</code> es falsy.',
          },
          {
            type: 'predict',
            q: 'Esta te va a morder en una entrevista si no la conoces:',
            code: 'console.log([10, 9, 1].sort());',
            options: ['[1, 9, 10]', '[1, 10, 9]', '[10, 9, 1]', 'TypeError'],
            answer: 1,
            why: '<code>sort()</code> sin argumentos convierte todo a <strong>string</strong> y ordena alfabéticamente: "10" va antes que "9" porque "1" &lt; "9". Para números siempre pasa el comparador: <code>arr.sort((a, b) =&gt; a - b)</code>.',
          },
          {
            type: 'analogy',
            title: '== es un Ditto',
            html: 'El <code>==</code> es como un Ditto: antes de pelear, <strong>se transforma</strong> para parecerse al rival, y a veces el resultado es rarísimo. El <code>===</code> es el escáner de la Pokédex: te dice exactamente qué es cada cosa y no acepta disfraces.',
          },
          {
            type: 'dsa',
            html: `<p>El bug de coerción número uno en problemas de algoritmos:</p>
<pre><code>const index = arr.indexOf(x);
if (!index) { /* "no lo encontré" */ }   // ❌ index 0 es falsy</code></pre>
<p>Lo mismo con <code>if (map[key])</code> cuando el valor guardado es <code>0</code>, o con <code>count || 1</code>. Compara explícito (<code>index === -1</code>, <code>map.has(key)</code>) y usa <code>??</code> en vez de <code>||</code> cuando 0 es un valor válido:</p>
<pre><code>0 || 5    // 5   (0 es falsy)
0 ?? 5    // 0   (?? solo salta con null y undefined)</code></pre>`,
          },
          {
            type: 'links',
            items: [
              { t: 'javascript.info · Type conversions', u: JSI + 'type-conversions' },
              { t: 'javascript.info · Comparisons', u: JSI + 'comparison' },
              { t: 'MDN · Equality comparisons and sameness', u: MDN + 'Web/JavaScript/Guide/Equality_comparisons_and_sameness' },
              { t: 'MDN · Array.prototype.sort', u: MDN + 'Web/JavaScript/Reference/Global_Objects/Array/sort' },
            ],
          },
        ],
      },
      {
        title: 'Valor contra referencia',
        steps: [
          {
            type: 'predict',
            q: 'Nunca tocamos a directamente. ¿O sí?',
            code: 'const a = [1, 2];\nconst b = a;\nb.push(3);\nconsole.log(a.length);',
            options: ['2', '3', 'undefined', 'TypeError: a es const'],
            answer: 1,
            why: '<code>b = a</code> no copió el array: copió <strong>la referencia</strong>. Las dos variables apuntan al mismo array. Y <code>const</code> solo impide re-asignar la variable, no modificar el objeto al que apunta.',
          },
          {
            type: 'viz',
            title: 'Míralo en memoria',
            spec: {
              code: 'let x = 10;\nlet y = x;\ny = 20;\nconst a = [1, 2];\nconst b = a;\nb.push(3);\nconsole.log(x, a.length);',
              panels: [
                { key: 'vars', title: 'Variables' },
                { key: 'heap', title: 'Heap (objetos)' },
                { key: 'out', title: 'Output' },
              ],
              steps: [
                { line: 1, note: 'Un primitivo se guarda directo en la variable.', s: { vars: ['x = 10'] } },
                { line: 2, note: 'y recibe una COPIA del valor. Son dos 10 distintos.', s: { vars: ['x = 10', 'y = 10'] } },
                { line: 3, note: 'Cambiar y no afecta a x.', s: { vars: ['x = 10', { t: 'y = 20', hl: true }] } },
                { line: 4, note: 'El array vive en el heap. La variable a solo guarda su dirección (#1).', s: { vars: ['x = 10', 'y = 20', 'a = → #1'], heap: ['#1  [1, 2]'] } },
                { line: 5, note: 'b copia la dirección, no el array. Ahora dos variables apuntan a #1.', s: { vars: ['x = 10', 'y = 20', 'a = → #1', 'b = → #1'], heap: ['#1  [1, 2]'] } },
                { line: 6, note: 'push modifica el array #1. Como a apunta al mismo, también lo "ve".', s: { vars: ['x = 10', 'y = 20', 'a = → #1', 'b = → #1'], heap: [{ t: '#1  [1, 2, 3]', hl: true }] } },
                { line: 7, note: 'x sigue en 10 (copia por valor). a.length es 3 (misma referencia).', s: { vars: ['x = 10', 'y = 20', 'a = → #1', 'b = → #1'], heap: ['#1  [1, 2, 3]'], out: ['10 3'] } },
              ],
            },
          },
          {
            type: 'predict',
            q: 'Ahora con funciones. Fíjate bien en la diferencia entre las dos:',
            code: 'function reset(arr) { arr = []; }\nfunction clear(arr) { arr.length = 0; }\n\nconst nums = [1, 2, 3];\nreset(nums);\nconsole.log(nums.length);\nclear(nums);\nconsole.log(nums.length);',
            options: ['0 y 0', '3 y 0', '3 y 3', '0 y 3'],
            answer: 1,
            why: 'Al llamar una función, el parámetro recibe una copia <strong>de la referencia</strong>. <code>reset</code> re-asigna su variable local a un array nuevo: afuera no pasa nada. <code>clear</code> modifica el array original a través de la referencia: afuera sí se nota.',
          },
          {
            type: 'code',
            caption: 'Cómo copiar de verdad:',
            code: `const copia = [...original];          // copia superficial (1 nivel)
const copia2 = original.slice();      // igual
const obj2 = { ...obj };              // superficial para objetos
const profunda = structuredClone(x);  // copia profunda (todos los niveles)`,
          },
          {
            type: 'predict',
            q: 'La trampa clásica al crear una matriz. ¿Qué imprime?',
            code: 'const grid = new Array(2).fill([]);\ngrid[0].push("X");\nconsole.log(grid[1].length);',
            options: ['0', '1', 'undefined', 'TypeError'],
            answer: 1,
            why: '<code>fill([])</code> crea <strong>un solo</strong> array y pone la misma referencia en todas las casillas. Todas las "filas" son la misma. La forma correcta: <code>Array.from({ length: 2 }, () =&gt; [])</code>, que ejecuta la función una vez por fila.',
          },
          {
            type: 'analogy',
            title: 'El save file compartido',
            html: 'Copiar un primitivo es <strong>fotocopiar</strong> tu hoja de personaje: cada quien raya la suya. Copiar una referencia es darle a tu amigo <strong>la contraseña de tu partida en la nube</strong>: si él suelta a tu Charizard, tú también lo perdiste, porque nunca hubo dos partidas.',
          },
          {
            type: 'think',
            q: '<code>[1, 2] === [1, 2]</code> da <code>false</code>. Explica por qué con tus palabras. Y luego: si en un problema de grid quieres guardar coordenadas visitadas en un <code>Set</code>, ¿sirve hacer <code>visited.add([r, c])</code>?',
            a: 'Son dos arrays distintos en el heap; <code>===</code> compara direcciones, no contenido. Por lo mismo, un <code>Set</code> de arrays nunca encuentra duplicados: <code>visited.has([0, 1])</code> siempre es <code>false</code>. El truco estándar es convertir a un primitivo: <code>visited.add(r + "," + c)</code>.',
          },
          {
            type: 'dsa',
            html: `<p>Esta lección es probablemente la que más bugs te va a ahorrar en entrevistas:</p>
<ul>
<li>Matrices con <code>fill([])</code> que comparten filas.</li>
<li>En backtracking, guardar <code>result.push(path)</code> en vez de <code>result.push([...path])</code>: al final todas las respuestas son el mismo array vacío.</li>
<li>Modificar el input sin querer (<code>sort</code>, <code>reverse</code> y <code>splice</code> mutan el array original).</li>
</ul>`,
          },
          {
            type: 'links',
            items: [
              { t: 'javascript.info · Object references and copying', u: JSI + 'object-copy' },
              { t: 'MDN · structuredClone', u: MDN + 'Web/API/Window/structuredClone' },
              { t: 'MDN · Array.from', u: MDN + 'Web/JavaScript/Reference/Global_Objects/Array/from' },
            ],
          },
        ],
      },
    ],
    quiz: [
      {
        q: '¿Qué imprime?',
        code: 'console.log(1 + "2" + 3);',
        options: ['6', '"123"', '"33"', '"15"'],
        answer: 1,
        why: 'Se evalúa de izquierda a derecha: <code>1 + "2"</code> es <code>"12"</code>, y <code>"12" + 3</code> es <code>"123"</code>.',
      },
      {
        q: '¿Qué imprime?',
        code: 'console.log(0.1 + 0.2 === 0.3);',
        options: ['true', 'false', 'NaN', 'TypeError'],
        answer: 1,
        why: 'Los decimales binarios no pueden representar 0.1 exacto. La suma da 0.30000000000000004.',
      },
      {
        q: '¿Qué imprime?',
        code: 'console.log(-7 % 3);',
        options: ['2', '-1', '1', '-2'],
        answer: 1,
        why: 'En JS el resultado de <code>%</code> lleva el signo del dividendo. Para un módulo siempre positivo: <code>((a % n) + n) % n</code>.',
      },
      {
        q: '¿Cuántas keys tiene el objeto?',
        code: 'const m = {};\nm[1] = "a";\nm["1"] = "b";\nconsole.log(Object.keys(m).length);',
        options: ['2', '1', '0', 'TypeError'],
        answer: 1,
        why: 'Las keys de un objeto siempre son strings: <code>m[1]</code> y <code>m["1"]</code> son la misma. Un <code>Map</code> sí distingue <code>1</code> de <code>"1"</code>.',
      },
      {
        q: '¿Qué imprime?',
        code: 'const a = { n: 1, tags: ["x"] };\nconst b = { ...a };\nb.n = 2;\nb.tags.push("y");\nconsole.log(a.n, a.tags.length);',
        options: ['1 1', '2 2', '1 2', '2 1'],
        answer: 2,
        why: 'El spread copia un solo nivel. <code>n</code> es un primitivo (copia independiente), pero <code>tags</code> es una referencia compartida.',
      },
    ],
    exercises: [
      {
        id: '01-real-type',
        title: 'realType',
        xp: 40,
        brief: 'Escribe la versión honesta de <code>typeof</code>: que distinga <code>null</code>, arrays y <code>NaN</code>.',
        hints: [
          'El orden de tus <code>if</code> importa: revisa primero los tres casos especiales y deja <code>typeof</code> para el final.',
          'En la lección 1 viste un chequeo confiable para cada caso especial. Son tres líneas.',
          'Ojo con <code>isNaN("hola")</code> global: convierte antes de revisar y da <code>true</code>. Usa <code>Number.isNaN</code>, que no convierte.',
        ],
      },
      {
        id: '02-same-value',
        title: 'sameValue',
        xp: 40,
        brief: 'Un <code>===</code> mejorado: que <code>NaN</code> sea igual a <code>NaN</code> y que <code>+0</code> y <code>-0</code> sean distintos. Sin usar <code>Object.is</code>.',
        hints: [
          'Resuelve cada punto ciego por separado y deja <code>a === b</code> para todo lo demás.',
          '¿Cuál es el único valor que no es igual a sí mismo? Eso te da una forma de detectarlo sin funciones.',
          'Para los ceros: ¿cuánto vale <code>1 / 0</code>? ¿Y <code>1 / -0</code>?',
        ],
      },
      {
        id: '03-deep-clone',
        title: 'deepClone',
        xp: 40,
        brief: 'Una copia profunda de arrays y objetos anidados, a mano. Tu primera función recursiva del curso.',
        hints: [
          'Piensa en tres casos: es un array, es un objeto, o es un primitivo. ¿Cuál de los tres es el caso base?',
          'Para clonar un array: crea uno nuevo donde cada elemento sea el clon del elemento original. ¿Qué función sabe clonar un elemento?',
          'Cuidado con <code>typeof null</code>. Revisa <code>null</code> antes de tratar algo como objeto.',
        ],
      },
    ],
    boss: [
      {
        id: 'boss-1-deep-equal',
        title: 'deepEqual',
        xp: 80,
        brief: 'Compara dos valores por estructura y contenido, a cualquier profundidad.',
        hints: [
          'Empieza por lo fácil: si <code>a === b</code>, ya terminaste. Después descarta todo lo que no sean dos objetos.',
          'Dos objetos son iguales si tienen la misma cantidad de keys y, para cada key de uno, el otro la tiene con un valor deepEqual.',
          'Un test compara <code>{ a: undefined }</code> con <code>{ b: undefined }</code>. Comparar <code>a[key]</code> con <code>b[key]</code> no basta: revisa que la key exista en el otro.',
        ],
      },
      {
        id: 'boss-2-safe-sum',
        title: 'safeSum',
        xp: 80,
        brief: 'Suma solo lo que de verdad es un número en un array lleno de basura. Todas las trampas de coerción juntas.',
        hints: [
          'No conviertas todo con <code>Number()</code> a ciegas. Abre la consola y prueba <code>Number("")</code>, <code>Number(null)</code>, <code>Number(true)</code> y <code>Number([5])</code>.',
          'Filtra por <code>typeof</code> primero: solo te interesan dos tipos. Con eso desaparecen casi todas las trampas.',
          'Para los strings: descarta los vacíos (después de quitar espacios) y luego verifica que el número sea finito con <code>Number.isFinite</code>.',
        ],
      },
    ],
  };

  // ───────────────────────────── M2 · CLOSURES ─────────────────────────────
  const m2 = {
    id: 'm2',
    dir: 'm2-closures',
    title: 'Scope y closures',
    tagline: 'Dónde viven tus variables y por qué una función recuerda cosas.',
    zone: 'Cripta del Scope',
    mob: { sprite: 'ghost', name: 'Fantasma Undefined' },
    bossMob: { name: 'Espectro del Closure' },
    lessons: [
      {
        title: 'var, let, const y el hoisting',
        steps: [
          {
            type: 'predict',
            q: 'Usamos x antes de declararla:',
            code: 'console.log(x);\nvar x = 5;',
            options: ['5', 'undefined', 'ReferenceError', 'null'],
            answer: 1,
            why: 'Antes de ejecutar, el motor registra todas las declaraciones del scope. A eso le dicen <strong>hoisting</strong>. Una <code>var</code> se registra y además se inicializa en <code>undefined</code>; la asignación (<code>= 5</code>) se queda en su línea.',
          },
          {
            type: 'predict',
            q: 'Mismo código, pero con let:',
            code: 'console.log(y);\nlet y = 5;',
            options: ['5', 'undefined', 'ReferenceError', 'null'],
            answer: 2,
            why: '<code>let</code> y <code>const</code> también se registran al inicio, pero <strong>no se inicializan</strong>. Desde el inicio del bloque hasta su línea están en la <em>Temporal Dead Zone</em>: existen, pero tocarlas lanza <code>ReferenceError</code>. Es a propósito: te avisa del bug en vez de darte un <code>undefined</code> silencioso.',
          },
          {
            type: 'text',
            html: `<table>
<tr><th></th><th>Scope</th><th>Antes de su línea</th><th>¿Re-asignable?</th></tr>
<tr><td><code>var</code></td><td>la función entera</td><td><code>undefined</code></td><td>sí</td></tr>
<tr><td><code>let</code></td><td>el bloque <code>{ }</code></td><td>ReferenceError (TDZ)</td><td>sí</td></tr>
<tr><td><code>const</code></td><td>el bloque <code>{ }</code></td><td>ReferenceError (TDZ)</td><td>no</td></tr>
<tr><td><code>function f() {}</code></td><td>la función entera</td><td>ya funciona completa</td><td>sí</td></tr>
</table>`,
          },
          {
            type: 'predict',
            q: 'Dos formas de crear funciones. ¿Qué pasa al correr esto?',
            code: 'saludar();\nfunction saludar() { console.log("hola"); }\n\ndespedir();\nconst despedir = () => console.log("bye");',
            options: ['"hola" y "bye"', '"hola" y luego ReferenceError', 'ReferenceError sin imprimir nada', '"hola" y luego TypeError'],
            answer: 1,
            why: 'Una <em>function declaration</em> se sube completa, con todo y cuerpo. <code>despedir</code> es una <code>const</code> que guarda una función: sigue las reglas de <code>const</code> y está en la TDZ.',
          },
          {
            type: 'code',
            caption: 'Scope de bloque contra scope de función:',
            code: `function demo() {
  if (true) {
    var a = 1;   // vive en toda la función
    let b = 2;   // vive solo dentro de este if
  }
  console.log(a);  // 1
  console.log(b);  // ReferenceError: b is not defined
}`,
          },
          {
            type: 'analogy',
            title: 'Fog of war',
            html: 'Al entrar a un scope, el motor ya tiene el <strong>mapa completo</strong> con todas las variables marcadas. Las <code>var</code> son zonas ya exploradas pero vacías (<code>undefined</code>). Las <code>let</code> y <code>const</code> están bajo <strong>niebla de guerra</strong>: sabes que hay algo, pero no puedes entrar hasta que tu personaje llegue a esa línea.',
          },
          {
            type: 'think',
            q: 'Si <code>let</code> lanza error donde <code>var</code> te daba <code>undefined</code>… ¿por qué eso es una <em>mejora</em>?',
            a: 'Porque usar una variable antes de asignarla casi siempre es un bug. Un <code>undefined</code> silencioso viaja por tu programa y explota lejos, tres funciones después. Un <code>ReferenceError</code> explota justo en la línea del problema.',
          },
          {
            type: 'dsa',
            html: '<p>Regla para entrevistas: <strong><code>const</code> por defecto, <code>let</code> cuando vayas a re-asignar</strong> (contadores, punteros, acumuladores) y <code>var</code> nunca. El entrevistador lo lee como señal de que escribes JS moderno, y además te evita el bug de la lección 3.</p>',
          },
          {
            type: 'links',
            items: [
              { t: 'javascript.info · The old "var"', u: JSI + 'var' },
              { t: 'MDN · let (y la Temporal Dead Zone)', u: MDN + 'Web/JavaScript/Reference/Statements/let' },
              { t: 'MDN · Hoisting', u: MDN + 'Glossary/Hoisting' },
            ],
          },
        ],
      },
      {
        title: 'Call stack y scope léxico',
        steps: [
          {
            type: 'predict',
            q: 'mostrar() se llama desde dentro de envolver(). ¿Cuál nombre ve?',
            code: 'const nombre = "global";\n\nfunction mostrar() {\n  console.log(nombre);\n}\n\nfunction envolver() {\n  const nombre = "local";\n  mostrar();\n}\n\nenvolver();',
            options: ['"local"', '"global"', 'undefined', 'ReferenceError'],
            answer: 1,
            why: 'JavaScript tiene <strong>scope léxico</strong>: una función busca sus variables en el lugar donde fue <em>escrita</em>, no desde donde fue <em>llamada</em>. <code>mostrar</code> está escrita en el scope global, así que ve el <code>nombre</code> global.',
          },
          {
            type: 'text',
            html: `<p>Dos conceptos que se confunden mucho:</p>
<ul>
<li><strong>Scope chain</strong> (dónde busco variables): se decide al <em>escribir</em> el código. Función → la que la envuelve → … → global.</li>
<li><strong>Call stack</strong> (quién llamó a quién): se arma al <em>ejecutar</em>. Cada llamada apila un <em>frame</em> con sus variables locales; al hacer <code>return</code>, el frame se quita.</li>
</ul>`,
          },
          {
            type: 'viz',
            title: 'El call stack en acción',
            spec: {
              code: 'function cuadrado(n) {\n  return n * n;\n}\nfunction sumaCuadrados(a, b) {\n  const x = cuadrado(a);\n  const y = cuadrado(b);\n  return x + y;\n}\nconsole.log(sumaCuadrados(2, 3));',
              panels: [
                { key: 'stack', title: 'Call stack', kind: 'stack' },
                { key: 'vars', title: 'Variables del frame de arriba' },
                { key: 'out', title: 'Output' },
              ],
              steps: [
                { line: 9, note: 'Para imprimir, primero hay que calcular sumaCuadrados(2, 3).', s: { stack: ['global'] } },
                { line: 4, note: 'Nueva llamada: se apila un frame con sus parámetros.', s: { stack: ['global', 'sumaCuadrados(2, 3)'], vars: ['a = 2', 'b = 3'] } },
                { line: 5, note: 'Para calcular x hay que llamar a cuadrado(2). sumaCuadrados se queda en pausa.', s: { stack: ['global', 'sumaCuadrados(2, 3)', 'cuadrado(2)'], vars: ['n = 2'] } },
                { line: 2, note: 'cuadrado regresa 4. Su frame está por desaparecer.', s: { stack: ['global', 'sumaCuadrados(2, 3)', 'cuadrado(2)'], vars: ['n = 2', { t: 'return 4', hl: true }] } },
                { line: 5, note: 'Pop. Volvemos justo donde nos quedamos, ahora con x = 4.', s: { stack: ['global', 'sumaCuadrados(2, 3)'], vars: ['a = 2', 'b = 3', { t: 'x = 4', hl: true }] } },
                { line: 6, note: 'Otra llamada: un frame NUEVO de cuadrado, con su propia n.', s: { stack: ['global', 'sumaCuadrados(2, 3)', 'cuadrado(3)'], vars: ['n = 3'] } },
                { line: 6, note: 'Regresa 9 y se quita.', s: { stack: ['global', 'sumaCuadrados(2, 3)'], vars: ['a = 2', 'b = 3', 'x = 4', { t: 'y = 9', hl: true }] } },
                { line: 7, note: 'sumaCuadrados regresa 13.', s: { stack: ['global', 'sumaCuadrados(2, 3)'], vars: ['a = 2', 'b = 3', 'x = 4', 'y = 9', { t: 'return 13', hl: true }] } },
                { line: 9, note: 'Stack de vuelta en global. Se imprime el resultado.', s: { stack: ['global'], out: ['13'] } },
              ],
            },
          },
          {
            type: 'predict',
            q: '¿Y si una función se llama a sí misma sin parar?',
            code: 'function f() {\n  return f();\n}\nf();',
            options: ['Se queda colgado para siempre', 'RangeError: Maximum call stack size exceeded', 'Regresa undefined', 'SyntaxError'],
            answer: 1,
            why: 'Cada llamada apila un frame y ninguno se quita. El stack tiene un límite (alrededor de 10,000 frames, depende del motor) y al pasarlo truena: el famoso <em>stack overflow</em>.',
          },
          {
            type: 'analogy',
            title: 'La pila de Magic',
            html: 'Si juegas Magic ya lo sabes: los hechizos van a <strong>la pila</strong> y se resuelven del último al primero. Lanzas un hechizo, te responden con otro, respondes a ese… y el último en entrar es el primero en resolverse. Eso es LIFO, y es exactamente lo que hace el call stack con las llamadas a funciones.',
          },
          {
            type: 'dsa',
            html: `<p>Por qué te importa para DSA:</p>
<ul>
<li><strong>Recursión = usar el call stack como estructura de datos.</strong> Todo DFS recursivo se puede escribir con un stack explícito.</li>
<li><strong>La recursión cuesta memoria.</strong> Si la profundidad máxima es <em>d</em>, el espacio es O(d) aunque no crees ni un array. Te lo van a preguntar.</li>
<li><strong>Listas o árboles muy profundos</strong> (100,000 nodos en línea) revientan el stack. La respuesta de entrevista: "lo puedo hacer iterativo".</li>
</ul>`,
          },
          {
            type: 'links',
            items: [
              { t: 'javascript.info · Recursion and stack', u: JSI + 'recursion' },
              { t: 'MDN · Call stack', u: MDN + 'Glossary/Call_stack' },
              { t: 'MDN · Closures (sección Lexical scoping)', u: MDN + 'Web/JavaScript/Guide/Closures' },
            ],
          },
        ],
      },
      {
        title: 'Closures: funciones con mochila',
        steps: [
          {
            type: 'predict',
            q: 'El bug más famoso de JavaScript. ¿Qué imprime?',
            code: 'for (var i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 0);\n}',
            options: ['0 1 2', '3 3 3', '2 2 2', '0 0 0'],
            answer: 1,
            why: 'Con <code>var</code> hay <strong>una sola</strong> variable <code>i</code> para todo el loop. Los tres callbacks no guardaron una copia del valor: guardaron acceso a <em>esa misma</em> variable. Cuando por fin corren, el loop ya terminó e <code>i</code> vale 3.',
          },
          {
            type: 'think',
            q: 'Si cambias <code>var</code> por <code>let</code>, imprime <code>0 1 2</code>. Con lo que sabes de scope de bloque, ¿por qué crees que cambia?',
            a: 'Con <code>let</code>, cada vuelta del loop crea una variable <code>i</code> <strong>nueva</strong> (una por bloque). Cada callback queda atado a la suya: una vale 0, otra 1, otra 2.',
          },
          {
            type: 'text',
            html: '<p>Un <strong>closure</strong> es una función junto con el acceso a las variables del lugar donde fue creada. La función se lleva ese entorno a donde vaya, incluso cuando la función externa ya terminó.</p><p>Importante: guarda acceso a <strong>las variables</strong>, no una foto de sus valores. Si la variable cambia, el closure ve el cambio.</p>',
          },
          {
            type: 'viz',
            title: 'Un closure paso a paso',
            spec: {
              code: 'function crearContador() {\n  let cuenta = 0;\n  return function () {\n    cuenta++;\n    return cuenta;\n  };\n}\nconst contar = crearContador();\ncontar();\ncontar();',
              panels: [
                { key: 'stack', title: 'Call stack', kind: 'stack' },
                { key: 'env', title: '🎒 Entornos vivos' },
                { key: 'out', title: 'Valores regresados' },
              ],
              steps: [
                { line: 8, note: 'Llamamos a crearContador. Se apila su frame.', s: { stack: ['global', 'crearContador()'] } },
                { line: 2, note: 'Su variable local vive en el entorno de ESTA llamada.', s: { stack: ['global', 'crearContador()'], env: ['Entorno #1 { cuenta: 0 }'] } },
                { line: 3, note: 'Se crea una función nueva. Nace con un link al Entorno #1: esa es su mochila.', s: { stack: ['global', 'crearContador()'], env: ['Entorno #1 { cuenta: 0 }', { t: 'función anónima → 🎒 #1', hl: true }] } },
                { line: 8, note: 'crearContador terminó y salió del stack. Pero su entorno NO se borra: contar todavía lo necesita.', s: { stack: ['global'], env: ['Entorno #1 { cuenta: 0 }', 'contar → 🎒 #1'] } },
                { line: 9, note: 'Llamamos a contar. Busca cuenta: no es suya, la saca de su mochila.', s: { stack: ['global', 'contar()'], env: ['Entorno #1 { cuenta: 0 }', 'contar → 🎒 #1'] } },
                { line: 4, note: 'Modifica la variable ORIGINAL dentro del entorno.', s: { stack: ['global', 'contar()'], env: [{ t: 'Entorno #1 { cuenta: 1 }', hl: true }, 'contar → 🎒 #1'], out: ['1'] } },
                { line: 10, note: 'Segunda llamada: mismo entorno, la cuenta sigue donde se quedó.', s: { stack: ['global', 'contar()'], env: [{ t: 'Entorno #1 { cuenta: 2 }', hl: true }, 'contar → 🎒 #1'], out: ['1', '2'] } },
              ],
            },
          },
          {
            type: 'predict',
            q: 'Usando el crearContador de la animación:',
            code: 'const a = crearContador();\nconst b = crearContador();\na();\na();\nconsole.log(b());',
            options: ['3', '1', '2', '0'],
            answer: 1,
            why: 'Cada <strong>llamada</strong> a <code>crearContador</code> crea un entorno nuevo con su propia <code>cuenta</code>. <code>a</code> y <code>b</code> cargan mochilas distintas.',
          },
          {
            type: 'analogy',
            title: 'El aventurero y su inventario',
            html: 'Una función es un aventurero que nace en una aldea (la función externa). Al salir, <strong>se lleva su mochila</strong> con todo lo que había a su alcance. La aldea puede quedar vacía (la función externa ya terminó), pero mientras el aventurero siga vivo, su mochila también. Y si dos aventureros salen de dos visitas distintas a la aldea, cada uno lleva su propia mochila.',
          },
          {
            type: 'dsa',
            html: `<p>Vas a usar closures en casi todos los problemas, aunque no los nombres:</p>
<pre><code>function subsets(nums) {
  const result = [];              // ← vive en el closure

  function dfs(start, path) {     // helper interno
    result.push([...path]);       // lo modifica sin recibirlo como parámetro
    for (let i = start; i &lt; nums.length; i++) {
      dfs(i + 1, [...path, nums[i]]);
    }
  }

  dfs(0, []);
  return result;
}</code></pre>
<p>Ese patrón (función externa con el estado, helper recursivo adentro) es el esqueleto de backtracking, DFS y memoización. Lo vas a escribir cientos de veces.</p>`,
          },
          {
            type: 'links',
            items: [
              { t: 'javascript.info · Variable scope, closure', u: JSI + 'closure' },
              { t: 'MDN · Closures', u: MDN + 'Web/JavaScript/Guide/Closures' },
            ],
          },
        ],
      },
    ],
    quiz: [
      {
        q: '¿Qué imprime?',
        code: 'let x = 1;\n{\n  let x = 2;\n}\nconsole.log(x);',
        options: ['2', '1', 'undefined', 'SyntaxError'],
        answer: 1,
        why: 'La <code>x</code> de adentro vive solo en ese bloque y tapa a la de afuera mientras dura. Al salir, sigue la <code>x</code> original.',
      },
      {
        q: '¿Qué imprime?',
        code: 'function f() {\n  if (true) {\n    var a = 1;\n    let b = 2;\n  }\n  console.log(typeof a, typeof b);\n}\nf();',
        options: ['"number" "number"', '"number" "undefined"', '"undefined" "undefined"', 'ReferenceError'],
        answer: 1,
        why: '<code>a</code> es <code>var</code>: vive en toda la función. <code>b</code> no existe fuera del <code>if</code>, y <code>typeof</code> de algo que no existe da <code>"undefined"</code> sin lanzar error.',
      },
      {
        q: '¿Qué imprime?',
        code: 'const fns = [];\nfor (let i = 0; i < 3; i++) {\n  fns.push(() => i * 2);\n}\nconsole.log(fns[2]());',
        options: ['6', '4', '2', '0'],
        answer: 1,
        why: 'Con <code>let</code> cada vuelta tiene su propia <code>i</code>. La tercera función cerró sobre <code>i = 2</code>.',
      },
      {
        q: '¿Qué imprime?',
        code: 'function make() {\n  let n = 0;\n  return { inc: () => ++n, get: () => n };\n}\nconst c = make();\nc.inc();\nc.inc();\nconsole.log(c.get(), c.n);',
        options: ['2 2', '2 undefined', '0 undefined', '2 0'],
        answer: 1,
        why: '<code>n</code> vive en el closure, no es una propiedad del objeto. Así se hacían las variables privadas antes de que existiera <code>#</code>.',
      },
      {
        q: 'factorial(n) recursivo no crea arrays ni objetos. ¿Cuánto espacio usa?',
        code: 'function factorial(n) {\n  if (n <= 1) return 1;\n  return n * factorial(n - 1);\n}',
        options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
        answer: 1,
        why: 'Hay n frames apilados al mismo tiempo antes de que el primero pueda regresar. El call stack también cuenta como memoria.',
      },
    ],
    exercises: [
      {
        id: '01-create-counter',
        title: 'createCounter',
        xp: 40,
        brief: 'Un contador con estado privado de verdad, usando solo closures.',
        hints: [
          'Es casi la animación de la lección 3, pero regresando un objeto con varias funciones en vez de una sola.',
          'Todas las funciones del objeto pueden compartir la misma variable del closure.',
          'Para <code>reset</code> necesitas recordar el valor inicial. ¿Dónde sigue disponible <code>start</code> después de que <code>createCounter</code> termina?',
        ],
      },
      {
        id: '02-once',
        title: 'once',
        xp: 40,
        brief: 'Envuelve una función para que solo pueda ejecutarse una vez.',
        hints: [
          'Necesitas recordar dos cosas entre llamadas: si ya se llamó y qué regresó.',
          'Esas dos cosas son variables en el closure de la función que regresas.',
          'No uses el resultado como bandera (<code>if (!result)</code>): ¿qué pasa si la función regresa <code>0</code> o <code>undefined</code>? Lo viste en el módulo 1.',
        ],
      },
      {
        id: '03-memoize',
        title: 'memoize',
        xp: 40,
        brief: 'Caché automático para cualquier función. La base de la programación dinámica top-down.',
        hints: [
          'El caché vive en el closure: una estructura que mapea argumentos → resultado.',
          'Los argumentos llegan como array (<code>...args</code>). Necesitas convertirlos en UNA key que distinga <code>(1, 23)</code> de <code>(12, 3)</code> y <code>1</code> de <code>"1"</code>. <code>args.join("")</code> no sirve. ¿Qué función convierte cualquier valor a un string sin ambigüedad?',
          'Para saber si algo está en caché, pregunta si la key <strong>existe</strong> (<code>Map.has</code>), no si su valor es truthy.',
        ],
      },
    ],
    boss: [
      {
        id: 'boss-1-curry',
        title: 'curry',
        xp: 80,
        brief: 'Convierte <code>f(a, b, c)</code> en algo que acepta <code>f(a)(b)(c)</code>, <code>f(a, b)(c)</code> y cualquier combinación.',
        hints: [
          '<code>fn.length</code> te dice cuántos parámetros declara una función. Ese es tu criterio para saber si ya tienes suficientes.',
          'La función que regresas recibe <code>...args</code>. Si ya hay suficientes, llama a <code>fn</code>. Si no, regresa OTRA función que espere más.',
          'Esa otra función junta los argumentos viejos con los nuevos y vuelve a hacer la misma pregunta. "La misma pregunta" suena a recursión: dale nombre a tu función interna para poder llamarla.',
        ],
      },
      {
        id: 'boss-2-pipe',
        title: 'pipe',
        xp: 80,
        brief: 'Encadena funciones: la salida de una es la entrada de la siguiente.',
        hints: [
          'Hazlo primero con un <code>for</code> normal: una variable <code>resultado</code> que vas pasando por cada función.',
          'La primera función es especial porque recibe todos los argumentos. Las demás reciben un solo valor.',
          'El caso sin funciones merece su propio <code>if</code> al inicio.',
        ],
      },
    ],
  };

  // ───────────────────────────── M3 · THIS Y PROTOTIPOS ─────────────────────────────
  const m3 = {
    id: 'm3',
    dir: 'm3-this-prototypes',
    title: 'this, prototipos y clases',
    tagline: 'El modelo de objetos real de JavaScript, y cómo construir estructuras de datos con él.',
    zone: 'Mazmorra de los Prototipos',
    mob: { sprite: 'mimic', name: 'Mímico this' },
    bossMob: { name: 'Gran Mímico Heredado' },
    lessons: [
      {
        title: 'this: depende de quién llama',
        steps: [
          {
            type: 'predict',
            q: 'La misma función, llamada de dos formas:',
            code: '"use strict";\nconst heroe = {\n  nombre: "Link",\n  saludar() { return "Soy " + this.nombre; },\n};\n\nconst f = heroe.saludar;\n\nconsole.log(heroe.saludar());\nconsole.log(f());',
            options: ['"Soy Link" dos veces', '"Soy Link" y luego TypeError', '"Soy Link" y "Soy undefined"', 'TypeError sin imprimir nada'],
            answer: 1,
            why: '<code>this</code> no se decide donde escribes la función, sino <strong>en el momento de llamarla</strong>. <code>heroe.saludar()</code> tiene un objeto antes del punto: ese es <code>this</code>. <code>f()</code> no tiene nada antes del punto: <code>this</code> es <code>undefined</code> y leerle <code>.nombre</code> truena. (Sin modo estricto, <code>this</code> sería el objeto global y verías "Soy undefined".)',
          },
          {
            type: 'text',
            html: `<p>Para saber cuánto vale <code>this</code>, mira <strong>cómo se llamó</strong> la función. Cuatro reglas, en orden de prioridad:</p>
<table>
<tr><th>Forma de llamar</th><th>this es…</th></tr>
<tr><td><code>new Fn()</code></td><td>el objeto nuevo recién creado</td></tr>
<tr><td><code>fn.call(obj)</code> · <code>fn.apply(obj)</code> · <code>fn.bind(obj)</code></td><td><code>obj</code>, el que tú digas</td></tr>
<tr><td><code>obj.fn()</code></td><td><code>obj</code>, lo que está antes del punto</td></tr>
<tr><td><code>fn()</code></td><td><code>undefined</code> (modo estricto) o el objeto global</td></tr>
</table>
<p>Y una excepción: las <strong>arrow functions no tienen <code>this</code> propio</strong>. Usan el <code>this</code> del lugar donde fueron escritas, como cualquier otra variable de un closure.</p>`,
          },
          {
            type: 'predict',
            q: 'Aquí hay una arrow function dentro de un método:',
            code: 'const equipo = {\n  nombre: "Party",\n  miembros: ["Cloud", "Tifa"],\n  listar() {\n    return this.miembros.map((m) => m + " @ " + this.nombre);\n  },\n};\nconsole.log(equipo.listar()[0]);',
            options: ['"Cloud @ undefined"', '"Cloud @ Party"', 'TypeError', '"Cloud @ equipo"'],
            answer: 1,
            why: 'La arrow no tiene <code>this</code> propio, así que usa el de <code>listar</code>, que es <code>equipo</code>. Si en su lugar pusieras <code>function (m) { … }</code>, esa función tendría su propio <code>this</code> (<code>undefined</code>) y tronaría. Por eso los callbacks casi siempre se escriben como arrows.',
          },
          {
            type: 'code',
            caption: 'Controlar this a mano:',
            code: `function atacar(arma, bonus) {
  return this.nombre + " ataca con " + arma + " +" + bonus;
}
const link = { nombre: "Link" };

atacar.call(link, "espada", 5);      // argumentos sueltos
atacar.apply(link, ["espada", 5]);   // argumentos en array
const atacarLink = atacar.bind(link, "espada");  // NO la llama: regresa una función nueva
atacarLink(5);                       // "Link ataca con espada +5"`,
          },
          {
            type: 'predict',
            q: 'bind contra call. ¿Quién gana?',
            code: 'function quien() { return this.n; }\nconst a = { n: 1 };\nconst b = { n: 2 };\n\nconst g = quien.bind(a);\nconsole.log(g.call(b));',
            options: ['2', '1', 'undefined', 'TypeError'],
            answer: 1,
            why: 'Un <code>bind</code> es permanente: la función que regresa ignora cualquier intento posterior de cambiarle el <code>this</code>.',
          },
          {
            type: 'analogy',
            title: 'El arma y quien la empuña',
            html: 'Una función normal es una <strong>espada tirada en el suelo</strong>: su daño depende de quién la levante en ese momento (<code>this</code> = quien la llama). <code>bind</code> es encantarla para que solo responda a un dueño. Y una arrow function es un <strong>item soulbound</strong>: quedó ligada al lugar donde se forjó y no se puede transferir.',
          },
          {
            type: 'dsa',
            html: `<p>El bug típico al escribir clases en una entrevista:</p>
<pre><code>class Grafo {
  visitar(nodo) { this.vistos.add(nodo); }
  recorrer(nodos) {
    nodos.forEach(this.visitar);            // ❌ se pierde this
    nodos.forEach((n) =&gt; this.visitar(n));  // ✅
  }
}</code></pre>
<p>Pasar <code>this.metodo</code> como callback lo separa de su objeto, igual que <code>const f = heroe.saludar</code>.</p>`,
          },
          {
            type: 'links',
            items: [
              { t: 'javascript.info · Object methods, "this"', u: JSI + 'object-methods' },
              { t: 'javascript.info · Function binding', u: JSI + 'bind' },
              { t: 'MDN · this', u: MDN + 'Web/JavaScript/Reference/Operators/this' },
            ],
          },
        ],
      },
      {
        title: 'La cadena de prototipos',
        steps: [
          {
            type: 'predict',
            q: 'Tú nunca definiste push en tu array. Entonces…',
            code: 'const arr = [1, 2];\nconsole.log(arr.hasOwnProperty("push"));\nconsole.log("push" in arr);',
            options: ['true y true', 'false y true', 'false y false', 'true y false'],
            answer: 1,
            why: '<code>push</code> no vive en tu array: vive en <code>Array.prototype</code>, un objeto que todos los arrays comparten. <code>hasOwnProperty</code> solo mira el objeto mismo; <code>in</code> sube por toda la cadena.',
          },
          {
            type: 'text',
            html: '<p>Cada objeto tiene un link oculto a otro objeto: su <strong>prototipo</strong>. Cuando lees <code>obj.algo</code>:</p><ol><li>¿<code>obj</code> lo tiene? Listo.</li><li>Si no, ¿lo tiene su prototipo?</li><li>Si no, ¿el prototipo del prototipo?</li><li>… hasta llegar a <code>null</code>. Ahí el resultado es <code>undefined</code>.</li></ol><p>Eso es toda la "herencia" de JavaScript. No hay copias: hay una cadena de búsqueda.</p>',
          },
          {
            type: 'viz',
            title: 'Buscando propiedades en la cadena',
            spec: {
              code: 'const animal = { come() { return "ñam"; } };\nconst perro = Object.create(animal);\nperro.ladra = () => "guau";\n\nperro.ladra();\nperro.come();\nperro.toString();\nperro.vuela();',
              panels: [
                { key: 'chain', title: 'Cadena de prototipos', kind: 'chain' },
                { key: 'out', title: 'Resultado' },
              ],
              steps: [
                { line: 1, note: 'Un objeto normal. Su prototipo es Object.prototype.', s: { chain: ['animal { come }', 'Object.prototype { toString, hasOwnProperty… }', 'null'] } },
                { line: 2, note: 'Object.create(animal) crea un objeto vacío cuyo prototipo es animal.', s: { chain: [{ t: 'perro { }', hl: true }, 'animal { come }', 'Object.prototype { toString, hasOwnProperty… }', 'null'] } },
                { line: 3, note: 'Escribir SIEMPRE crea la propiedad en el objeto mismo, nunca en el prototipo.', s: { chain: [{ t: 'perro { ladra }', hl: true }, 'animal { come }', 'Object.prototype { toString, hasOwnProperty… }', 'null'] } },
                { line: 5, note: 'ladra está en perro. Encontrada a la primera.', s: { chain: [{ t: 'perro { ladra } ✔', hl: true }, 'animal { come }', 'Object.prototype { toString, hasOwnProperty… }', 'null'], out: ['"guau"'] } },
                { line: 6, note: 'come no está en perro. Subimos un nivel: está en animal.', s: { chain: [{ t: 'perro { ladra } ✘', x: true }, { t: 'animal { come } ✔', hl: true }, 'Object.prototype { toString, hasOwnProperty… }', 'null'], out: ['"guau"', '"ñam"'] } },
                { line: 7, note: 'toString: ni perro ni animal. Dos niveles arriba, en Object.prototype.', s: { chain: [{ t: 'perro { ladra } ✘', x: true }, { t: 'animal { come } ✘', x: true }, { t: 'Object.prototype { toString… } ✔', hl: true }, 'null'], out: ['"guau"', '"ñam"', '"[object Object]"'] } },
                { line: 8, note: 'vuela no está en ningún nivel. Llegamos a null: perro.vuela es undefined, y llamar undefined() truena.', s: { chain: [{ t: 'perro { ladra } ✘', x: true }, { t: 'animal { come } ✘', x: true }, { t: 'Object.prototype ✘', x: true }, { t: 'null → undefined', hl: true }], out: ['"guau"', '"ñam"', '"[object Object]"', 'TypeError: perro.vuela is not a function'] } },
              ],
            },
          },
          {
            type: 'predict',
            q: 'Leer sube por la cadena. ¿Y escribir?',
            code: 'const base = { hp: 100 };\nconst mob = Object.create(base);\nmob.hp -= 30;\nconsole.log(base.hp, mob.hp);',
            options: ['70 70', '100 70', '100 100', '70 100'],
            answer: 1,
            why: '<code>mob.hp -= 30</code> es <code>mob.hp = mob.hp - 30</code>. La lectura sube y encuentra 100 en <code>base</code>; la escritura crea una propiedad <code>hp</code> nueva en <code>mob</code>. A partir de ahí <code>mob.hp</code> tapa a la de <code>base</code>.',
          },
          {
            type: 'predict',
            q: 'Usas un objeto como "set" de palabras ya vistas. Llega la palabra "constructor":',
            code: 'const visto = {};\nconst palabra = "constructor";\nconsole.log(visto[palabra] ? "ya la vi" : "nueva");',
            options: ['"nueva"', '"ya la vi"', 'undefined', 'TypeError'],
            answer: 1,
            why: '<code>visto</code> está vacío, pero <code>visto["constructor"]</code> sube por la cadena y encuentra <code>Object.prototype.constructor</code>, que es truthy. Este bug es real y por eso existe <code>Map</code>: no tiene keys heredadas.',
          },
          {
            type: 'analogy',
            title: 'Buscando un hechizo',
            html: 'Necesitas un hechizo. Primero revisas <strong>tu grimorio</strong>. Si no está, vas a la <strong>biblioteca de tu gremio</strong>. Si tampoco, al <strong>Archivo Real</strong>, donde está lo que todos los magos saben. Si ahí no aparece, el hechizo no existe (<code>undefined</code>). Nadie te copió los libros: solo sabes dónde ir a buscar.',
          },
          {
            type: 'dsa',
            html: `<p>Dos cosas para llevarte:</p>
<ul>
<li><strong>Usa <code>Map</code> y <code>Set</code> como hash map y hash set</strong>, no objetos. Aceptan cualquier tipo de key, no tienen keys heredadas, y tienen <code>.size</code>.</li>
<li><strong>La cadena de prototipos es una linked list.</strong> Cada objeto apunta al siguiente y el último apunta a <code>null</code>. En tu ejercicio 3 la vas a recorrer con un <code>while</code>, igual que recorrerás listas enlazadas en el Acto III.</li>
</ul>`,
          },
          {
            type: 'links',
            items: [
              { t: 'javascript.info · Prototypal inheritance', u: JSI + 'prototype-inheritance' },
              { t: 'MDN · Inheritance and the prototype chain', u: MDN + 'Web/JavaScript/Guide/Inheritance_and_the_prototype_chain' },
              { t: 'MDN · Map', u: MDN + 'Web/JavaScript/Reference/Global_Objects/Map' },
            ],
          },
        ],
      },
      {
        title: 'Clases: azúcar sobre prototipos',
        steps: [
          {
            type: 'predict',
            q: 'JavaScript tiene la palabra class. ¿Qué es una clase por dentro?',
            code: 'class Mob {}\nconsole.log(typeof Mob);',
            options: ['"class"', '"function"', '"object"', '"undefined"'],
            answer: 1,
            why: 'Una clase es una función constructora con sintaxis más limpia. Sus métodos se guardan en <code>Mob.prototype</code> y cada instancia apunta ahí por la cadena que ya conoces. No hay magia nueva.',
          },
          {
            type: 'code',
            caption: 'Todo lo que necesitas de clases para DSA, en un ejemplo:',
            code: `class Mob {
  #hp;                         // campo privado: solo accesible dentro de la clase
  static total = 0;            // pertenece a la clase, no a las instancias

  constructor(nombre, hp) {    // corre con cada new
    this.nombre = nombre;
    this.#hp = hp;
    Mob.total++;
  }

  get vivo() {                 // getter: se usa como propiedad, mob.vivo
    return this.#hp > 0;
  }

  recibir(dmg) {               // método: vive en Mob.prototype
    this.#hp -= dmg;
    return this;               // regresar this permite encadenar
  }
}

class Jefe extends Mob {       // Jefe.prototype → Mob.prototype → Object.prototype
  constructor(nombre) {
    super(nombre, 500);        // llama al constructor del padre (obligatorio antes de usar this)
  }
  recibir(dmg) {
    return super.recibir(dmg / 2);   // llama al método del padre
  }
}`,
          },
          {
            type: 'predict',
            q: 'Con herencia:',
            code: 'class A {\n  hola() { return "A"; }\n}\nclass B extends A {\n  hola() { return super.hola() + "B"; }\n}\nconst b = new B();\nconsole.log(b.hola(), b instanceof A);',
            options: ['"B" true', '"AB" true', '"AB" false', '"BA" true'],
            answer: 1,
            why: '<code>super.hola()</code> ejecuta la versión del padre y luego se le concatena "B". Y <code>instanceof</code> revisa si <code>A.prototype</code> aparece en algún punto de la cadena de <code>b</code>: sí, un nivel arriba de <code>B.prototype</code>.',
          },
          {
            type: 'predict',
            q: 'El mismo problema de la lección 1, ahora con clases:',
            code: 'class Contador {\n  n = 0;\n  inc() { this.n++; }\n}\nconst c = new Contador();\nconst inc = c.inc;\ninc();',
            options: ['c.n pasa a valer 1', 'No pasa nada', 'TypeError', 'c.n pasa a ser NaN'],
            answer: 2,
            why: 'El cuerpo de una clase siempre corre en modo estricto. Al separar el método de su objeto, <code>this</code> es <code>undefined</code> y <code>this.n++</code> truena. Las clases no cambian las reglas de <code>this</code>.',
          },
          {
            type: 'think',
            q: 'Te piden implementar una lista enlazada en una entrevista. Antes de escribir código: ¿qué clases necesitas y qué propiedades tendría cada una?',
            a: 'Dos clases. <code>Node</code> con <code>value</code> y <code>next</code> (que empieza en <code>null</code>). Y <code>LinkedList</code> con <code>head</code> (el primer nodo, o <code>null</code> si está vacía) y normalmente <code>size</code>. Así empieza casi toda estructura de datos: una clase chiquita para el nodo y otra que administra los nodos.',
          },
          {
            type: 'analogy',
            title: 'La receta de crafteo',
            html: 'Una clase es la <strong>receta</strong>; <code>new</code> es craftear un item con ella. Cada item tiene sus propios stats (propiedades de instancia), pero todos comparten las mismas habilidades, que viven una sola vez en el recetario (<code>prototype</code>). Mil espadas, una sola copia del método <code>atacar</code>.',
          },
          {
            type: 'dsa',
            html: '<p>En entrevistas vas a escribir clases para: <code>ListNode</code>, <code>TreeNode</code>, <code>Stack</code>, <code>Queue</code>, <code>MinStack</code>, <code>LRUCache</code>, <code>Trie</code>, <code>UnionFind</code>, <code>MinHeap</code>. JavaScript no trae heap ni queue eficiente de fábrica, así que saber armarlas rápido con <code>class</code> es parte del examen. Tus dos jefes de este módulo son justo eso.</p>',
          },
          {
            type: 'links',
            items: [
              { t: 'javascript.info · Class basic syntax', u: JSI + 'class' },
              { t: 'MDN · Classes', u: MDN + 'Web/JavaScript/Reference/Classes' },
              { t: 'MDN · Private properties', u: MDN + 'Web/JavaScript/Reference/Classes/Private_properties' },
            ],
          },
        ],
      },
    ],
    quiz: [
      {
        q: '¿Qué imprime?',
        code: '"use strict";\nfunction f() { return typeof this; }\nconsole.log(f(), f.call(5));',
        options: ['"object" "object"', '"undefined" "number"', '"undefined" "object"', 'TypeError'],
        answer: 1,
        why: 'Llamada suelta en modo estricto: <code>this</code> es <code>undefined</code>. Con <code>call(5)</code>, <code>this</code> es exactamente el 5 que pasaste.',
      },
      {
        q: '¿Qué imprime?',
        code: 'const o = {\n  n: 1,\n  f() { return () => this.n; },\n};\nconst g = o.f();\nconsole.log(g.call({ n: 2 }));',
        options: ['2', '1', 'undefined', 'TypeError'],
        answer: 1,
        why: 'La arrow tomó el <code>this</code> de <code>f</code> en el momento en que se creó (<code>o</code>). A una arrow no se le puede cambiar el <code>this</code> ni con <code>call</code>.',
      },
      {
        q: '¿Qué hay al final de toda cadena de prototipos?',
        code: 'console.log(Object.getPrototypeOf(Object.prototype));',
        options: ['undefined', 'null', 'Object', '{}'],
        answer: 1,
        why: '<code>Object.prototype</code> es el último eslabón. Su prototipo es <code>null</code>, y ahí se detiene toda búsqueda.',
      },
      {
        q: '¿Qué imprime?',
        code: 'class P {\n  static crear() { return new P(); }\n}\nconst p = P.crear();\nconsole.log(typeof p.crear);',
        options: ['"function"', '"undefined"', '"object"', 'TypeError'],
        answer: 1,
        why: 'Un método <code>static</code> vive en la clase misma (<code>P.crear</code>), no en <code>P.prototype</code>. Las instancias no lo ven.',
      },
      {
        q: '¿Qué imprime?',
        code: 'function Mob() {}\nMob.prototype.hp = 10;\nconst a = new Mob();\nconst b = new Mob();\na.hp = 5;\nconsole.log(b.hp);',
        options: ['5', '10', 'undefined', '15'],
        answer: 1,
        why: 'Escribir <code>a.hp</code> crea una propiedad propia en <code>a</code>. El prototipo no cambió, así que <code>b</code> sigue leyendo 10 de ahí.',
      },
    ],
    exercises: [
      {
        id: '01-my-bind',
        title: 'myBind',
        xp: 40,
        brief: 'Re-implementa <code>bind</code> para entender de una vez por todas cómo se controla <code>this</code>.',
        hints: [
          '<code>bind</code> no llama a la función: regresa una función nueva que la llamará después.',
          'Dentro de esa función nueva necesitas llamar a <code>fn</code> eligiendo su <code>this</code>. Viste dos métodos que hacen justo eso.',
          'Los argumentos finales son los fijados primero y los nuevos después. <code>apply</code> los recibe como un solo array.',
        ],
      },
      {
        id: '02-stack',
        title: 'Stack',
        xp: 40,
        brief: 'Tu primera estructura de datos como clase, con campo privado y getter.',
        hints: [
          'Por dentro puedes usar un array normal: <code>push</code> y <code>pop</code> de array ya trabajan por el final en O(1).',
          'El campo privado se declara arriba en el cuerpo de la clase: <code>#items = [];</code> y se usa como <code>this.#items</code>.',
          '<code>size</code> debe ser un getter: <code>get size() { … }</code>. Y revisa qué debe regresar <code>push</code> según el enunciado.',
        ],
      },
      {
        id: '03-is-instance-of',
        title: 'isInstanceOf',
        xp: 40,
        brief: 'Re-implementa <code>instanceof</code> recorriendo la cadena de prototipos a mano.',
        hints: [
          '<code>instanceof</code> pregunta: ¿aparece <code>Class.prototype</code> en algún punto de la cadena del objeto?',
          'Empieza en <code>Object.getPrototypeOf(obj)</code> y avanza con un <code>while</code> hasta encontrarlo o llegar a <code>null</code>.',
          'Los primitivos y <code>null</code> deben regresar <code>false</code> antes de empezar. (<code>Object.getPrototypeOf(5)</code> sí regresa algo, por eso hay que filtrar.)',
        ],
      },
    ],
    boss: [
      {
        id: 'boss-1-min-stack',
        title: 'MinStack',
        xp: 80,
        brief: 'Un stack que te da su mínimo en O(1). Pregunta real de entrevista (LeetCode 155).',
        hints: [
          'Guardar el mínimo en una sola variable falla cuando haces <code>pop</code> del mínimo: ¿cuál era el anterior?',
          'El mínimo "de este elemento hacia abajo" nunca cambia mientras ese elemento siga en el stack. ¿Y si lo guardas junto con cada elemento?',
          'Dos formas equivalentes: un stack de pares <code>{ value, min }</code>, o dos stacks en paralelo (valores y mínimos).',
        ],
      },
      {
        id: 'boss-2-event-emitter',
        title: 'EventEmitter',
        xp: 80,
        brief: 'Un sistema de eventos con <code>on</code>, <code>off</code>, <code>once</code> y <code>emit</code>. Clásico de entrevistas de JavaScript.',
        hints: [
          'Estructura: un <code>Map</code> de nombre de evento → array de listeners. Si usas un objeto normal, el test de "constructor" te va a recordar la lección 2.',
          'Para <code>once</code>: guarda cada registro como <code>{ fn, once }</code> y revisa la bandera al emitir.',
          'Si quitas elementos de un array mientras lo recorres, te saltas elementos. Recorre una copia (<code>[...lista]</code>) y quita de la original.',
        ],
      },
    ],
  };

  // ───────────────────────────── M4 · ASYNC ─────────────────────────────
  const m4 = {
    id: 'm4',
    dir: 'm4-async',
    title: 'Async y el event loop',
    tagline: 'Un solo hilo, muchas cosas a la vez. Cómo lo logra y cómo controlarlo.',
    zone: 'Volcán Asíncrono',
    mob: { sprite: 'imp', name: 'Diablillo Callback' },
    bossMob: { name: 'Señor del Event Loop' },
    lessons: [
      {
        title: 'El event loop',
        steps: [
          {
            type: 'predict',
            q: 'El timeout es de 0 milisegundos. ¿En qué orden sale?',
            code: 'console.log("A");\nsetTimeout(() => console.log("B"), 0);\nPromise.resolve().then(() => console.log("C"));\nconsole.log("D");',
            options: ['A B C D', 'A D B C', 'A D C B', 'A C D B'],
            answer: 2,
            why: 'Primero corre todo el código síncrono (A, D). Después, las promesas (C) tienen prioridad sobre los timers (B), aunque el timer sea de 0 ms. La animación de abajo te muestra por qué.',
          },
          {
            type: 'viz',
            title: 'El event loop paso a paso',
            spec: {
              code: 'console.log("A");\nsetTimeout(() => console.log("B"), 0);\nPromise.resolve().then(() => console.log("C"));\nconsole.log("D");',
              panels: [
                { key: 'stack', title: 'Call stack', kind: 'stack' },
                { key: 'micro', title: 'Microtasks (promesas)' },
                { key: 'macro', title: 'Macrotasks (timers, eventos)' },
                { key: 'out', title: 'Output' },
              ],
              steps: [
                { line: 1, note: 'Código síncrono: corre de inmediato.', s: { stack: ['script', 'console.log("A")'], out: ['A'] } },
                { line: 2, note: 'setTimeout NO ejecuta el callback: se lo entrega al entorno, que lo forma en la cola de macrotasks cuando el timer vence.', s: { stack: ['script', 'setTimeout(…)'], macro: [{ t: '() => log("B")', hl: true }], out: ['A'] } },
                { line: 3, note: 'La promesa ya está resuelta, pero su .then tampoco corre ahorita: va a la cola de microtasks.', s: { stack: ['script', '.then(…)'], micro: [{ t: '() => log("C")', hl: true }], macro: ['() => log("B")'], out: ['A'] } },
                { line: 4, note: 'Más código síncrono. Las colas siguen esperando.', s: { stack: ['script', 'console.log("D")'], micro: ['() => log("C")'], macro: ['() => log("B")'], out: ['A', 'D'] } },
                { line: null, note: 'El script terminó y el stack quedó vacío. Solo ahora el event loop revisa las colas. Regla: PRIMERO todas las microtasks.', s: { micro: [{ t: '() => log("C")', hl: true }], macro: ['() => log("B")'], out: ['A', 'D'] } },
                { line: 3, note: 'Corre la microtask.', s: { stack: ['() => log("C")'], macro: ['() => log("B")'], out: ['A', 'D', 'C'] } },
                { line: null, note: 'Microtasks vacías. Ahora sí toma UNA macrotask.', s: { macro: [{ t: '() => log("B")', hl: true }], out: ['A', 'D', 'C'] } },
                { line: 2, note: 'Corre el callback del timer. Fin.', s: { stack: ['() => log("B")'], out: ['A', 'D', 'C', 'B'] } },
              ],
            },
          },
          {
            type: 'text',
            html: `<p>JavaScript tiene <strong>un solo hilo</strong>: nunca ejecuta dos pedazos de tu código al mismo tiempo. El event loop es el ciclo que decide qué sigue:</p>
<ol>
<li>Ejecuta lo que hay en el call stack <strong>hasta que quede vacío</strong>. Nada lo interrumpe.</li>
<li>Vacía <strong>toda</strong> la cola de microtasks (callbacks de promesas, <code>await</code>, <code>queueMicrotask</code>). Si una microtask agrega otra, también corre.</li>
<li>Toma <strong>una</strong> macrotask (timer, click, respuesta de red) y vuelve al paso 1.</li>
</ol>`,
          },
          {
            type: 'predict',
            q: 'Dos .then encadenados contra un timeout:',
            code: 'setTimeout(() => console.log("timeout"), 0);\n\nPromise.resolve()\n  .then(() => console.log("micro 1"))\n  .then(() => console.log("micro 2"));\n\nconsole.log("sync");',
            options: ['sync, micro 1, timeout, micro 2', 'sync, micro 1, micro 2, timeout', 'sync, timeout, micro 1, micro 2', 'timeout, sync, micro 1, micro 2'],
            answer: 1,
            why: 'Cuando "micro 1" termina, encola a "micro 2" como otra microtask. Y la regla dice que la cola de microtasks se vacía <strong>completa</strong> antes de tocar cualquier macrotask.',
          },
          {
            type: 'predict',
            q: 'Un timer de 10 ms y un loop que bloquea 100 ms. ¿Qué imprime?',
            code: 'const inicio = Date.now();\n\nsetTimeout(() => {\n  console.log(Date.now() - inicio >= 100);\n}, 10);\n\nwhile (Date.now() - inicio < 100) {}',
            options: ['false: el timer corre a los 10 ms', 'true: el timer espera a que el loop termine', 'No imprime nada', 'Depende de la computadora'],
            answer: 1,
            why: 'El timer vence a los 10 ms, pero su callback solo puede correr cuando el stack esté vacío, y el <code>while</code> lo tiene ocupado. El delay de <code>setTimeout</code> es un <strong>mínimo</strong>, no una garantía.',
          },
          {
            type: 'analogy',
            title: 'Un héroe, un tablón de misiones',
            html: 'Eres <strong>un solo héroe</strong> y no puedes pelear dos batallas a la vez. Terminas tu pelea actual (call stack). Luego revisas los <strong>mensajes urgentes del gremio</strong> (microtasks) y los atiendes todos, incluso los que lleguen mientras los atiendes. Solo cuando no queda ninguno tomas <strong>una misión del tablón</strong> (macrotask), y se repite el ciclo.',
          },
          {
            type: 'dsa',
            html: '<p>"¿En qué orden se imprime esto?" es pregunta fija en entrevistas de JavaScript, sobre todo para roles de frontend y full stack. Si puedes dibujar las tres cajas (stack, microtasks, macrotasks) y narrar el recorrido en voz alta, ya vas por delante de la mayoría.</p>',
          },
          {
            type: 'links',
            items: [
              { t: 'javascript.info · Event loop: microtasks and macrotasks', u: JSI + 'event-loop' },
              { t: 'MDN · JavaScript execution model', u: MDN + 'Web/JavaScript/Reference/Execution_model' },
              { t: 'Loupe · visualizador interactivo del event loop', u: 'http://latentflip.com/loupe/' },
            ],
          },
        ],
      },
      {
        title: 'Promesas',
        steps: [
          {
            type: 'predict',
            q: 'Sigue el valor por la cadena. ¿Qué se imprime?',
            code: 'Promise.resolve(1)\n  .then((x) => x + 1)\n  .then((x) => { throw new Error("boom"); })\n  .then((x) => console.log("then", x))\n  .catch((e) => { console.log("catch", e.message); return 10; })\n  .then((x) => console.log("fin", x));',
            options: ['"then 2" y "fin undefined"', '"catch boom" y "fin 10"', 'Solo "catch boom"', '"then 2", "catch boom" y "fin 10"'],
            answer: 1,
            why: 'Un error se salta todos los <code>.then</code> hasta el siguiente <code>.catch</code>. Y si el <code>.catch</code> regresa un valor, la cadena <strong>se recupera</strong> y sigue normal con ese valor.',
          },
          {
            type: 'text',
            html: `<p>Una <strong>promesa</strong> es un objeto que representa un valor que todavía no llega. Tiene tres estados:</p>
<ul>
<li><strong>pending</strong>: aún no hay resultado.</li>
<li><strong>fulfilled</strong>: llegó el valor.</li>
<li><strong>rejected</strong>: falló, con un error.</li>
</ul>
<p>Una vez que sale de pending, <strong>no vuelve a cambiar nunca</strong>.</p>
<p>La clave para leer cadenas: <strong>cada <code>.then</code> regresa una promesa nueva</strong>, que se resuelve con lo que regrese tu callback. Si regresas un valor, pasa al siguiente. Si regresas una promesa, la cadena la espera. Si lanzas un error, la cadena se rechaza.</p>`,
          },
          {
            type: 'code',
            caption: 'Crear una promesa a mano (envolver una API de callbacks):',
            code: `const wait = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const leer = (ruta) =>
  new Promise((resolve, reject) => {
    fs.readFile(ruta, "utf8", (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });`,
          },
          {
            type: 'predict',
            q: '¿Qué pasa si resuelves dos veces?',
            code: 'const p = new Promise((resolve, reject) => {\n  resolve("uno");\n  resolve("dos");\n  reject(new Error("tres"));\n});\n\np.then((v) => console.log(v));',
            options: ['"uno" y "dos"', '"uno"', '"dos"', 'Error: tres'],
            answer: 1,
            why: 'Solo cuenta la primera llamada. Todo lo que venga después se ignora en silencio. Este detalle te va a simplificar la vida en el jefe del módulo.',
          },
          {
            type: 'text',
            html: `<table>
<tr><th>Combinador</th><th>Se cumple cuando…</th><th>Se rechaza cuando…</th></tr>
<tr><td><code>Promise.all</code></td><td>todas se cumplen (array en orden)</td><td>cualquiera falla</td></tr>
<tr><td><code>Promise.allSettled</code></td><td>todas terminan, bien o mal</td><td>nunca</td></tr>
<tr><td><code>Promise.race</code></td><td>la primera en terminar se cumple</td><td>la primera en terminar falla</td></tr>
<tr><td><code>Promise.any</code></td><td>la primera que se cumple</td><td>todas fallan</td></tr>
</table>`,
          },
          {
            type: 'predict',
            q: 'La lenta va primero en el array. ¿En qué orden llegan los resultados?',
            code: 'const lento = new Promise((r) => setTimeout(() => r("lento"), 50));\nconst rapido = new Promise((r) => setTimeout(() => r("rapido"), 10));\n\nPromise.all([lento, rapido]).then((res) => console.log(res));',
            options: ['["rapido", "lento"]', '["lento", "rapido"]', '"rapido"', 'Depende'],
            answer: 1,
            why: '<code>Promise.all</code> respeta el orden <strong>del array que le pasaste</strong>, no el orden en que terminaron. Cuando lo implementes tú, ese es justo el reto.',
          },
          {
            type: 'analogy',
            title: 'El ticket de preventa',
            html: 'Una promesa es el <strong>ticket de preventa</strong> de un juego. No tienes el juego, pero tienes algo en la mano hoy con lo que puedes planear ("cuando llegue, lo instalo y luego invito a mis amigos"). El ticket termina en una de dos: te entregan el juego o te cancelan el pedido. Y una vez entregado, no se "des-entrega".',
          },
          {
            type: 'links',
            items: [
              { t: 'javascript.info · Promise', u: JSI + 'promise-basics' },
              { t: 'javascript.info · Promises chaining', u: JSI + 'promise-chaining' },
              { t: 'javascript.info · Promise API', u: JSI + 'promise-api' },
              { t: 'MDN · Using promises', u: MDN + 'Web/JavaScript/Guide/Using_promises' },
            ],
          },
        ],
      },
      {
        title: 'async / await',
        steps: [
          {
            type: 'predict',
            q: 'Hay un await en medio de la función:',
            code: 'async function f() {\n  console.log(1);\n  await null;\n  console.log(2);\n}\n\nconsole.log(0);\nf();\nconsole.log(3);',
            options: ['0 1 2 3', '0 1 3 2', '0 3 1 2', '1 2 0 3'],
            answer: 1,
            why: 'Una función <code>async</code> corre de forma síncrona <strong>hasta su primer <code>await</code></strong>. Ahí se pausa, le devuelve el control a quien la llamó (se imprime 3), y el resto de la función se encola como microtask.',
          },
          {
            type: 'text',
            html: `<p><code>async/await</code> es otra forma de escribir promesas, no un mecanismo nuevo:</p>
<ul>
<li>Una función <code>async</code> <strong>siempre regresa una promesa</strong>. Si haces <code>return 5</code>, regresa una promesa cumplida con 5. Si lanzas un error, una promesa rechazada.</li>
<li><code>await promesa</code> pausa <strong>esa función</strong> (no el hilo) hasta que la promesa termine, y te da su valor.</li>
<li>Si la promesa se rechaza, <code>await</code> lanza el error ahí mismo, y lo atrapas con <code>try / catch</code> normal.</li>
</ul>`,
          },
          {
            type: 'predict',
            q: '¿Qué imprime?',
            code: 'async function g() {\n  return 5;\n}\n\nconsole.log(g() === 5, g() instanceof Promise);',
            options: ['true false', 'false true', 'true true', 'false false'],
            answer: 1,
            why: 'Llamar a una función <code>async</code> te da una promesa, siempre. Para sacar el 5 necesitas <code>await g()</code> o <code>g().then(…)</code>.',
          },
          {
            type: 'predict',
            q: 'wait(100) tarda 100 ms. ¿Cuánto tarda cada función, aproximadamente?',
            code: 'async function a() {\n  await wait(100);\n  await wait(100);\n}\n\nasync function b() {\n  await Promise.all([wait(100), wait(100)]);\n}',
            options: ['a: 100 ms, b: 100 ms', 'a: 200 ms, b: 100 ms', 'a: 200 ms, b: 200 ms', 'a: 100 ms, b: 200 ms'],
            answer: 1,
            why: 'En <code>a</code>, el segundo <code>wait</code> ni siquiera <em>empieza</em> hasta que el primero termina: van en serie. En <code>b</code>, los dos arrancan antes de esperar a ninguno: van en paralelo. Es el error de rendimiento más común con <code>await</code>.',
          },
          {
            type: 'code',
            caption: 'La trampa de forEach con async:',
            code: `// ❌ forEach no espera a nadie: "listo" sale antes de que termine alguna
ids.forEach(async (id) => { await guardar(id); });
console.log("listo");

// ✅ En serie: uno después de otro
for (const id of ids) {
  await guardar(id);
}

// ✅ En paralelo: todos a la vez, y esperas al conjunto
await Promise.all(ids.map((id) => guardar(id)));`,
          },
          {
            type: 'think',
            q: 'Tienes 1,000 URLs que descargar y el servidor te bloquea si haces más de 5 peticiones al mismo tiempo. En serie es lentísimo; con <code>Promise.all</code> te bloquean. ¿Cómo lo organizarías? No pienses en código todavía, piensa en personas.',
            a: 'Imagina <strong>5 trabajadores</strong> frente a una sola lista de pendientes. Cada uno toma la siguiente URL libre, la descarga, y al terminar toma otra, hasta que la lista se acaba. Nunca hay más de 5 descargas activas y nadie se queda sin hacer nada. Eso es un <em>promise pool</em>, y es el jefe final de este acto.',
          },
          {
            type: 'analogy',
            title: 'Punto de guardado',
            html: '<code>await</code> es un <strong>punto de guardado</strong>. La función guarda su partida exactamente en esa línea y sale al menú. El héroe (el hilo) se va a atender otras cosas. Cuando la promesa termina, la función <strong>carga la partida</strong> y sigue justo donde se quedó, con todas sus variables intactas.',
          },
          {
            type: 'links',
            items: [
              { t: 'javascript.info · Async/await', u: JSI + 'async-await' },
              { t: 'MDN · async function', u: MDN + 'Web/JavaScript/Reference/Statements/async_function' },
              { t: 'MDN · Promise.all', u: MDN + 'Web/JavaScript/Reference/Global_Objects/Promise/all' },
            ],
          },
        ],
      },
    ],
    quiz: [
      {
        q: '¿En qué orden se imprime?',
        code: 'console.log(1);\nsetTimeout(() => console.log(2));\nqueueMicrotask(() => console.log(3));\nPromise.resolve().then(() => console.log(4));\nconsole.log(5);',
        options: ['1 5 2 3 4', '1 5 3 4 2', '1 2 3 4 5', '1 5 4 3 2'],
        answer: 1,
        why: 'Síncrono primero (1, 5). Luego las microtasks en el orden en que se encolaron (3, 4). Al final la macrotask (2).',
      },
      {
        q: '¿Qué imprime?',
        code: 'async function f() {\n  throw new Error("x");\n}\n\nf().catch(() => console.log("atrapado"));\nconsole.log("sigue");',
        options: ['"atrapado" y "sigue"', '"sigue" y "atrapado"', 'Solo "sigue"', 'Error sin atrapar'],
        answer: 1,
        why: 'Un <code>throw</code> dentro de una función <code>async</code> no truena de forma síncrona: se vuelve una promesa rechazada. El <code>.catch</code> corre después, como microtask.',
      },
      {
        q: '¿Qué pasa con esta promesa?',
        code: 'Promise.all([\n  Promise.resolve(1),\n  Promise.reject(new Error("no")),\n  Promise.resolve(3),\n]);',
        options: ['Se cumple con [1, undefined, 3]', 'Se rechaza con el error "no"', 'Se cumple con [1, 3]', 'Se queda pendiente para siempre'],
        answer: 1,
        why: '<code>Promise.all</code> es todo o nada: un solo rechazo rechaza el conjunto. Si quieres el resultado de cada una pase lo que pase, usa <code>Promise.allSettled</code>.',
      },
      {
        q: '¿En qué orden se imprime?',
        code: 'setTimeout(() => console.log("A"), 10);\nsetTimeout(() => console.log("B"), 0);\nPromise.resolve().then(() => {\n  setTimeout(() => console.log("C"), 0);\n});',
        options: ['A B C', 'B C A', 'C B A', 'B A C'],
        answer: 1,
        why: 'B se registra con 0 ms. La microtask corre al terminar el script y registra C, también con 0 ms pero después de B. A espera sus 10 ms.',
      },
      {
        q: '¿Qué imprime?',
        code: 'const r = [];\n[1, 2, 3].forEach(async (n) => {\n  await null;\n  r.push(n);\n});\nconsole.log(r.length);',
        options: ['3', '0', '1', 'undefined'],
        answer: 1,
        why: '<code>forEach</code> llama a los tres callbacks y sigue de largo sin esperar sus promesas. Cada callback se pausó en su <code>await</code>, así que al imprimir nadie ha hecho push todavía.',
      },
    ],
    exercises: [
      {
        id: '01-wait',
        title: 'wait',
        xp: 40,
        brief: 'Convierte <code>setTimeout</code> en una promesa que puedas esperar con <code>await</code>.',
        hints: [
          'Necesitas crear una promesa a mano con <code>new Promise((resolve) =&gt; { … })</code>.',
          'Dentro, programa un <code>setTimeout</code> que llame a <code>resolve</code> cuando pase el tiempo.',
          'Para que la promesa se cumpla con <code>value</code>, pásaselo a <code>resolve</code>.',
        ],
      },
      {
        id: '02-in-series',
        title: 'inSeries',
        xp: 40,
        brief: 'Ejecuta tareas asíncronas una después de otra y junta sus resultados.',
        hints: [
          'Una tarea es una función. El trabajo empieza cuando la <strong>llamas</strong>, no antes.',
          'Recuerda la trampa de la lección 3: ¿qué tipo de loop sí respeta el <code>await</code>?',
          '<code>for…of</code> con <code>await task()</code> adentro. Si una tarea falla, el <code>await</code> lanza el error y la función se rechaza sola: no necesitas <code>try/catch</code>.',
        ],
      },
      {
        id: '03-retry',
        title: 'retry',
        xp: 40,
        brief: 'Reintenta una operación que falla, hasta un máximo de intentos.',
        hints: [
          'Un loop de 1 a <code>attempts</code>, con un <code>try/catch</code> adentro.',
          'Si el intento funciona, haz <code>return</code> de inmediato desde dentro del <code>try</code>. Si falla, guarda el error y deja que el loop siga.',
          'Ojo: tiene que ser <code>return await fn()</code>. Sin el <code>await</code>, la promesa rechazada se escapa del <code>try</code> antes de fallar y tu <code>catch</code> nunca la ve.',
        ],
      },
    ],
    boss: [
      {
        id: 'boss-1-promise-all',
        title: 'promiseAll',
        xp: 80,
        brief: 'Implementa <code>Promise.all</code> desde cero. De las preguntas más repetidas en entrevistas de JavaScript.',
        hints: [
          'Regresa un <code>new Promise((resolve, reject) =&gt; …)</code>. Adentro, engancha un <code>.then</code> a cada elemento.',
          'Guarda cada resultado en <code>results[i]</code> usando el índice del elemento, así el orden no depende de quién termine primero. Para tratar valores normales como promesas: <code>Promise.resolve(item)</code>.',
          'Lleva un contador de cuántas faltan y resuelve cuando llegue a 0. No uses <code>results.length</code>: asignar <code>results[2]</code> ya hace que <code>length</code> valga 3. Para los errores, pasa <code>reject</code> directo: solo cuenta la primera llamada.',
        ],
      },
      {
        id: 'boss-2-with-limit',
        title: 'withLimit',
        xp: 80,
        brief: 'Un pool de promesas con concurrencia máxima. El jefe final del Acto I y favorito de las FAANG.',
        hints: [
          'Vuelve a la pregunta de los 5 trabajadores en la lección 3. Un trabajador es una función <code>async</code> con un <code>while</code>: mientras queden tareas, toma la siguiente y espérala.',
          'La "lista de pendientes" es un índice compartido en el closure (<code>let next = 0</code>). Tomar una tarea es <code>const i = next++</code>; guarda el resultado en <code>results[i]</code>.',
          'Arranca <code>limit</code> trabajadores (o menos, si hay pocas tareas) y espera a que todos terminen con <code>Promise.all</code>. Aquí sí lo puedes usar.',
        ],
      },
    ],
  };

  root.COURSE = {
    title: 'JS Quest',
    acts: [
      { id: 'a1', title: 'Acto I · JavaScript por dentro', modules: ['m1', 'm2', 'm3', 'm4'] },
      {
        id: 'a2',
        title: 'Acto II · Herramientas de DSA',
        locked: true,
        planned: ['Big O', 'Arrays y strings', 'Hash maps y sets', 'Two pointers y sliding window'],
      },
      {
        id: 'a3',
        title: 'Acto III · Estructuras de datos',
        locked: true,
        planned: ['Stack y queue', 'Linked lists', 'Árboles y BST', 'Heaps', 'Grafos'],
      },
      {
        id: 'a4',
        title: 'Acto IV · Patrones FAANG',
        locked: true,
        planned: ['Recursión y backtracking', 'Binary search', 'BFS y DFS', 'Programación dinámica', 'Mock interviews'],
      },
    ],
    modules: [m1, m2, m3, m4],
  };
})(typeof window !== 'undefined' ? window : globalThis);
