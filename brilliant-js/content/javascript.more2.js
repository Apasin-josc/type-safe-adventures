// JavaScript a fondo, unidad 7: iteradores, generadores y módulos (cierra la parte 1 de javascript.info).
(function () {
  const c = window.COURSES.find((x) => x.id === 'js');
  c.units.push({ es: 'Iteradores y módulos', en: 'Iterators and modules' });
  c.soon = [
    { icon: '🪞', title: { es: 'Proxy y Reflect', en: 'Proxy and Reflect' } },
    { icon: '🧪', title: { es: 'Testing', en: 'Testing' } },
  ];

  c.lessons.push(
    {
      id: 'generators',
      unit: 6,
      icon: '🔄',
      title: { es: 'Iteradores y generadores', en: 'Iterators and generators' },
      blurb: { es: 'for…of por dentro y funciones que se pausan', en: 'for…of under the hood and functions that pause' },
      more: [
        { title: { es: 'Iterables', en: 'Iterables' }, url: 'https://javascript.info/iterable' },
        { title: { es: 'Generadores', en: 'Generators' }, url: 'https://javascript.info/generators' },
      ],
      steps: [
        {
          type: 'read',
          title: { es: 'Una función con botón de pausa', en: 'A function with a pause button' },
          code: 'function* countdown() {\n  yield 3;\n  yield 2;\n  yield 1;\n}\nfor (const n of countdown()) console.log(n); // 3, 2, 1',
          body: {
            es: '<p>Un <b>generador</b> (<code>function*</code>) es una función que se puede pausar: cada <code>yield</code> entrega un valor y se detiene hasta que le pidan el siguiente.</p><p><code>for…of</code> funciona con todo lo que sea <b>iterable</b>: arrays, textos, Map, Set… y generadores.</p>',
            en: '<p>A <b>generator</b> (<code>function*</code>) is a function you can pause: each <code>yield</code> hands out a value and stops until the next one is requested.</p><p><code>for…of</code> works with anything <b>iterable</b>: arrays, strings, Map, Set… and generators.</p>',
          },
        },
        {
          type: 'choice',
          prompt: { es: '¿Qué sale?', en: 'What comes out?' },
          code: 'function* gen() {\n  yield 1;\n  yield 2;\n}\n[...gen()]',
          options: ['<code>[1, 2]</code>', '<code>[gen]</code>', '<code>2</code>'],
          answer: 0,
          explain: { es: 'El <code>...</code> recorre el generador completo y junta cada valor que entrega con <code>yield</code>.', en: 'The <code>...</code> walks the whole generator and collects each value it yields.' },
        },
        {
          type: 'choice',
          prompt: { es: 'Llamas a <code>next()</code> a mano. ¿Qué regresa la primera vez?', en: 'You call <code>next()</code> by hand. What does it return the first time?' },
          code: 'const g = gen();\ng.next()',
          options: ['<code>1</code>', '<code>{ value: 1, done: false }</code>', '<code>{ value: 1, done: true }</code>'],
          answer: 1,
          why: {
            0: { es: '<code>next()</code> no regresa el valor solo: lo envuelve con <code>done</code> para avisar si ya se acabó.', en: '<code>next()</code> doesn’t return the bare value: it wraps it with <code>done</code> to say whether it’s finished.' },
            2: { es: 'Todavía falta el <code>yield 2</code>: no ha terminado.', en: 'There’s still the <code>yield 2</code>: it isn’t finished.' },
          },
          explain: {
            es: 'Así funciona <code>for…of</code> por dentro: llama a <code>next()</code> hasta que <code>done</code> sea <code>true</code>. Eso es el <b>protocolo de iteración</b>.',
            en: 'That’s how <code>for…of</code> works inside: it calls <code>next()</code> until <code>done</code> is <code>true</code>. That’s the <b>iteration protocol</b>.',
          },
        },
        {
          type: 'choice',
          prompt: { es: 'Un generador infinito. ¿Esto se cuelga?', en: 'An infinite generator. Does this hang?' },
          code: 'function* naturals() {\n  let n = 0;\n  while (true) yield n++;\n}\nconst g = naturals();\ng.next();\ng.next();\ng.next().value',
          options: [{ es: 'Sí, el <code>while (true)</code> nunca termina', en: 'Yes, the <code>while (true)</code> never ends' }, { es: 'No: regresa <code>2</code>', en: 'No: it returns <code>2</code>' }],
          answer: 1,
          why: {
            0: { es: 'Con una función normal, sí. Pero el generador se pausa en cada <code>yield</code> y solo avanza cuando le pides.', en: 'With a regular function, yes. But the generator pauses at each <code>yield</code> and only moves on when asked.' },
          },
          explain: {
            es: 'Los generadores son <b>perezosos</b>: calculan cada valor justo cuando lo pides. Puedes representar listas infinitas sin llenar la memoria. (Ojo: <code>[...naturals()]</code> sí se colgaría.)',
            en: 'Generators are <b>lazy</b>: they compute each value right when you ask. You can represent infinite lists without filling memory. (Careful: <code>[...naturals()]</code> would hang.)',
          },
        },
        {
          type: 'code',
          prompt: {
            es: 'Escribe el generador <code>range(start, end, step = 1)</code>: entrega <code>start</code>, <code>start + step</code>, … mientras sea menor que <code>end</code>.',
            en: 'Write the generator <code>range(start, end, step = 1)</code>: yield <code>start</code>, <code>start + step</code>, … while it’s less than <code>end</code>.',
          },
          fnName: 'range',
          wrap: '(a, b, c) => [...range(a, b, c)]',
          starter: 'function* range(start, end, step = 1) {\n  \n}\n',
          tests: [
            { args: [0, 5], expect: [0, 1, 2, 3, 4], label: '[...range(0, 5)]' },
            { args: [1, 10, 3], expect: [1, 4, 7], label: '[...range(1, 10, 3)]' },
            { args: [5, 5], expect: [], label: '[...range(5, 5)]' },
          ],
          hint: { es: '<code>for (let i = start; i &lt; end; i += step) yield i;</code>', en: '<code>for (let i = start; i &lt; end; i += step) yield i;</code>' },
          solution: 'function* range(start, end, step = 1) {\n  for (let i = start; i < end; i += step) yield i;\n}',
          explain: {
            es: 'JavaScript no trae <code>range</code> como Python, pero en una línea te hiciste uno. Y como es perezoso, <code>range(0, 1e9)</code> no ocupa memoria hasta que lo recorres.',
            en: 'JavaScript has no <code>range</code> like Python, but you just built one in a line. And since it’s lazy, <code>range(0, 1e9)</code> uses no memory until you walk it.',
          },
        },
      ],
    },
    {
      id: 'modules',
      unit: 6,
      icon: '📦',
      title: { es: 'Módulos', en: 'Modules' },
      blurb: { es: 'export, import y por qué cada archivo es su propio mundo', en: 'export, import and why each file is its own world' },
      more: [
        { title: { es: 'Módulos: introducción', en: 'Modules, introduction' }, url: 'https://javascript.info/modules-intro' },
        { title: { es: 'Export e import', en: 'Export and Import' }, url: 'https://javascript.info/import-export' },
      ],
      steps: [
        {
          type: 'read',
          title: { es: 'Cada archivo, su propia casa', en: 'Each file, its own house' },
          code: "// math.js\nexport function sum(a, b) {\n  return a + b;\n}\nexport default function square(x) {\n  return x * x;\n}\n\n// app.js\nimport square, { sum } from './math.js';",
          body: {
            es: '<p>Un <b>módulo</b> es un archivo con su propio espacio: lo que declaras ahí no se ve afuera, a menos que lo <b>exportes</b>.</p><p>Hay exports <b>con nombre</b> (se importan con llaves) y un export <b>por defecto</b> (se importa sin llaves, con el nombre que quieras).</p>',
            en: '<p>A <b>module</b> is a file with its own space: what you declare there isn’t visible outside unless you <b>export</b> it.</p><p>There are <b>named</b> exports (imported with braces) and one <b>default</b> export (imported without braces, under any name you like).</p>',
          },
        },
        {
          type: 'fill',
          prompt: { es: 'Para que otros archivos puedan usar <code>sum</code>, ¿qué palabra va?', en: 'So other files can use <code>sum</code>, which word goes here?' },
          code: '[[0]] function sum(a, b) {\n  return a + b;\n}',
          chips: ['export', 'import', 'public'],
          answers: ['export'],
          hint: { es: 'El archivo que <b>tiene</b> la función la saca; el que la <b>usa</b>, la trae.', en: 'The file that <b>has</b> the function sends it out; the one that <b>uses</b> it brings it in.' },
          explain: { es: '<code>export</code> la saca del módulo. <code>public</code> no existe en JavaScript (es de Java y TypeScript).', en: '<code>export</code> sends it out of the module. <code>public</code> doesn’t exist in JavaScript (it’s from Java and TypeScript).' },
        },
        {
          type: 'choice',
          prompt: { es: '<code>math.js</code> tiene <code>export function sum</code>. ¿Cuál import funciona?', en: '<code>math.js</code> has <code>export function sum</code>. Which import works?' },
          options: ["<code>import sum from './math.js'</code>", "<code>import { sum } from './math.js'</code>", "<code>import './math.js'.sum</code>"],
          answer: 1,
          why: {
            0: { es: 'Sin llaves importas el export <b>por defecto</b>. <code>sum</code> es un export con nombre: van llaves.', en: 'Without braces you import the <b>default</b> export. <code>sum</code> is a named export: it needs braces.' },
          },
          explain: { es: 'Exports con nombre → llaves y el mismo nombre. Export por defecto → sin llaves y el nombre que tú quieras.', en: 'Named exports → braces and the same name. Default export → no braces and any name you want.' },
        },
        {
          type: 'choice',
          prompt: { es: 'Dos archivos importan <code>config.js</code>, que tiene un <code>console.log(\'cargado\')</code>. ¿Cuántas veces se imprime?', en: 'Two files import <code>config.js</code>, which has a <code>console.log(\'loaded\')</code>. How many times does it print?' },
          options: [{ es: 'Una vez', en: 'Once' }, { es: 'Dos veces', en: 'Twice' }, { es: 'Ninguna', en: 'Never' }],
          answer: 0,
          explain: {
            es: 'Un módulo se ejecuta <b>una sola vez</b>, la primera vez que alguien lo importa; los demás reciben el mismo resultado. Por eso un módulo sirve para compartir un mismo objeto (una conexión, una configuración).',
            en: 'A module runs <b>only once</b>, the first time someone imports it; everyone else gets the same result. That’s why a module is good for sharing one object (a connection, a config).',
          },
        },
        {
          type: 'choice',
          prompt: { es: 'En <code>a.js</code> (un módulo) escribes <code>let secret = 42;</code> sin exportarlo. Desde <code>b.js</code>, ¿qué pasa con <code>secret</code>?', en: 'In <code>a.js</code> (a module) you write <code>let secret = 42;</code> without exporting it. From <code>b.js</code>, what happens with <code>secret</code>?' },
          options: [{ es: 'Vale 42', en: 'It’s 42' }, { es: 'No existe: <code>ReferenceError</code>', en: 'It doesn’t exist: <code>ReferenceError</code>' }],
          answer: 1,
          explain: {
            es: 'Cada módulo tiene su propio scope: sus variables son privadas, como la mochila de un closure. Con los <code>&lt;script&gt;</code> de antes todo iba al scope global y chocaba entre sí.',
            en: 'Each module has its own scope: its variables are private, like a closure’s backpack. With old-school <code>&lt;script&gt;</code> tags everything went to the global scope and collided.',
          },
        },
      ],
    },
  );

  // Complejidad de los retos de código (para el modo entrevista).
  const mark = (lessonId, time, space) => {
    const l = c.lessons.find((x) => x.id === lessonId);
    const s = l && l.steps.find((x) => x.type === 'code');
    if (s && !s.complexity) s.complexity = { time, space };
  };
  mark('loops', 'O(n)', 'O(1)');
  mark('array-methods', 'O(n)', 'O(1)');
  mark('collections', 'O(n)', 'O(n)');
})();
