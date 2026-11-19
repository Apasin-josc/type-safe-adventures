// Curso 2: JavaScript a fondo. Sigue el orden de temas de The Modern JavaScript Tutorial
// (https://javascript.info), pero los textos y ejercicios son propios. Cada lección termina con
// links a los capítulos de javascript.info para leer más.
window.COURSES = window.COURSES || [];
window.COURSES.push({
  id: 'js',
  icon: '🟨',
  colors: ['#C98500', '#8C4A12', '#5E300B'],
  title: { es: 'JavaScript a fondo', en: 'JavaScript in depth' },
  unit: { es: 'Fundamentos', en: 'Fundamentals' },
  blurb: {
    es: 'El lenguaje de punta a punta, en el orden de javascript.info: variables, tipos, conversiones, operadores, loops y funciones. Cada lección te deja el link para leer más.',
    en: 'The whole language, in javascript.info’s order: variables, types, conversions, operators, loops and functions. Every lesson links to the chapter to read more.',
  },
  soon: [
    { icon: '🗃️', title: { es: 'Objetos', en: 'Objects' } },
    { icon: '🧰', title: { es: 'Métodos de arrays', en: 'Array methods' } },
    { icon: '🗺️', title: { es: 'Map, Set y desestructuración', en: 'Map, Set and destructuring' } },
    { icon: '🎒', title: { es: 'Closures', en: 'Closures' } },
    { icon: '🧬', title: { es: 'Prototipos y clases', en: 'Prototypes and classes' } },
    { icon: '🚨', title: { es: 'Manejo de errores', en: 'Error handling' } },
    { icon: '⏳', title: { es: 'Promesas y async/await', en: 'Promises and async/await' } },
  ],
  lessons: [
    // ═══════════════════════ 1 · Variables ═══════════════════════
    {
      id: 'variables',
      icon: '📦',
      title: { es: 'Cajas con etiqueta', en: 'Labeled boxes' },
      blurb: { es: 'let, const y por qué ya casi nadie usa var', en: 'let, const and why almost nobody uses var anymore' },
      more: [{ title: { es: 'Variables', en: 'Variables' }, url: 'https://javascript.info/variables' }],
      steps: [
        {
          type: 'read',
          title: { es: 'Una caja con su etiqueta', en: 'A box with a label' },
          code: "let message = 'hola';\nmessage = 'adiós';",
          body: {
            es: '<p>Una <b>variable</b> es una caja con una etiqueta. <code>let</code> crea la caja, y <code>=</code> guarda algo adentro.</p><p>Con <code>let</code> puedes cambiar lo que hay en la caja cuantas veces quieras. Con <code>const</code>, la caja queda sellada.</p>',
            en: '<p>A <b>variable</b> is a box with a label. <code>let</code> creates the box, and <code>=</code> puts something in it.</p><p>With <code>let</code> you can change what’s inside as often as you like. With <code>const</code>, the box is sealed.</p>',
          },
        },
        {
          type: 'choice',
          prompt: { es: '¿Qué vale <code>b</code> al final?', en: 'What is <code>b</code> at the end?' },
          code: 'let a = 1;\na = 2;\nlet b = a;\na = 3;\nb',
          options: ['<code>1</code>', '<code>2</code>', '<code>3</code>'],
          answer: 1,
          why: {
            2: {
              es: 'Cuando hiciste <code>let b = a</code>, <code>b</code> recibió una <b>copia</b> del 2. Cambiar <code>a</code> después no toca a <code>b</code>.',
              en: 'When you did <code>let b = a</code>, <code>b</code> got a <b>copy</b> of 2. Changing <code>a</code> later doesn’t touch <code>b</code>.',
            },
          },
          explain: {
            es: 'Con números, textos y booleanos, <code>=</code> copia el valor. Cada caja tiene el suyo. (Con objetos es distinto: lo verás en la unidad de objetos.)',
            en: 'With numbers, strings and booleans, <code>=</code> copies the value. Each box has its own. (Objects behave differently: you’ll see that in the objects unit.)',
          },
        },
        {
          type: 'choice',
          prompt: { es: '¿Qué pasa al correr esto?', en: 'What happens when this runs?' },
          code: 'const PI = 3.14;\nPI = 3;',
          options: [
            { es: '<code>PI</code> ahora vale 3', en: '<code>PI</code> is now 3' },
            { es: 'Error: no se puede reasignar una constante', en: 'Error: you can’t reassign a constant' },
            { es: 'No pasa nada, se queda en 3.14', en: 'Nothing, it stays 3.14' },
          ],
          answer: 1,
          why: {
            2: { es: 'JavaScript no lo ignora en silencio: lanza un <code>TypeError</code>.', en: 'JavaScript doesn’t silently ignore it: it throws a <code>TypeError</code>.' },
          },
          explain: {
            es: '<code>const</code> prohíbe volver a usar <code>=</code> con esa variable: lanza <code>TypeError: Assignment to constant variable</code>. Úsala por defecto, y <code>let</code> solo cuando de verdad vayas a cambiar el valor.',
            en: '<code>const</code> forbids using <code>=</code> on that variable again: it throws <code>TypeError: Assignment to constant variable</code>. Use it by default, and <code>let</code> only when you really will change the value.',
          },
        },
        {
          type: 'choice',
          prompt: { es: 'Y con un objeto, ¿qué vale <code>user.name</code>?', en: 'And with an object, what is <code>user.name</code>?' },
          code: "const user = { name: 'Ana' };\nuser.name = 'Luz';\nuser.name",
          options: ["<code>'Ana'</code>", "<code>'Luz'</code>", { es: 'Error', en: 'An error' }],
          answer: 1,
          why: {
            2: {
              es: '<code>const</code> prohíbe <code>user = otraCosa</code>, pero no cambiar lo que hay <b>dentro</b> del objeto.',
              en: '<code>const</code> forbids <code>user = somethingElse</code>, but not changing what’s <b>inside</b> the object.',
            },
          },
          explain: {
            es: 'La caja <code>user</code> está sellada: siempre apunta al mismo objeto. Pero el objeto en sí se puede modificar. Es la confusión número uno con <code>const</code>.',
            en: 'The <code>user</code> box is sealed: it always points to the same object. But the object itself can change. It’s the number one confusion about <code>const</code>.',
          },
        },
        {
          type: 'classify',
          prompt: { es: '¿Cuáles nombres de variable son válidos?', en: 'Which variable names are valid?' },
          bins: [
            { es: 'Válido', en: 'Valid' },
            { es: 'No válido', en: 'Invalid' },
          ],
          items: [
            { label: '<code>userName</code>', bin: 0 },
            { label: '<code>2nd</code>', bin: 1 },
            { label: '<code>$price</code>', bin: 0 },
            { label: '<code>_count</code>', bin: 0 },
            { label: '<code>my-name</code>', bin: 1 },
            { label: '<code>let</code>', bin: 1 },
          ],
          explain: {
            es: 'Un nombre puede tener letras, números, <code>$</code> y <code>_</code>, pero <b>no puede empezar con número</b>. El guion se leería como resta, y las palabras reservadas (<code>let</code>, <code>class</code>, <code>return</code>…) no se valen.',
            en: 'A name can have letters, digits, <code>$</code> and <code>_</code>, but it <b>can’t start with a digit</b>. A dash would read as minus, and reserved words (<code>let</code>, <code>class</code>, <code>return</code>…) aren’t allowed.',
          },
        },
        {
          type: 'choice',
          prompt: { es: '¿Qué imprime?', en: 'What does it print?' },
          code: 'console.log(x);\nlet x = 5;',
          options: ['<code>undefined</code>', '<code>5</code>', { es: 'Error', en: 'An error' }],
          answer: 2,
          why: {
            0: {
              es: 'Eso pasaría con <code>var</code>, la forma vieja. Con <code>let</code>, la variable no se puede usar antes de su línea.',
              en: 'That’s what <code>var</code>, the old way, would do. With <code>let</code>, the variable can’t be used before its line.',
            },
          },
          explain: {
            es: 'Antes de <code>let x</code>, la variable está en la "zona muerta temporal": usarla lanza <code>ReferenceError</code>. Es una ventaja: los errores salen pronto en lugar de un <code>undefined</code> misterioso.',
            en: 'Before <code>let x</code>, the variable is in the "temporal dead zone": using it throws <code>ReferenceError</code>. That’s a feature: bugs show up early instead of as a mystery <code>undefined</code>.',
          },
        },
        {
          type: 'fill',
          prompt: { es: '¿<code>let</code> o <code>const</code>? Escoge el que funciona.', en: '<code>let</code> or <code>const</code>? Pick the one that works.' },
          code: '[[0]] total = 0;\nfor (let i = 1; i <= 3; i++) {\n  total = total + i;\n}',
          chips: ['const', 'let'],
          answers: ['let'],
          hint: { es: 'Fíjate si a <code>total</code> se le vuelve a asignar algo con <code>=</code>.', en: 'Check whether <code>total</code> gets assigned again with <code>=</code>.' },
          explain: {
            es: '<code>total</code> cambia en cada vuelta, así que necesita <code>let</code>. Con <code>const</code>, la primera vuelta lanzaría un error.',
            en: '<code>total</code> changes on every lap, so it needs <code>let</code>. With <code>const</code>, the first lap would throw an error.',
          },
        },
        {
          type: 'number',
          prompt: { es: '¿Cuánto vale <code>x</code> al final?', en: 'What is <code>x</code> at the end?' },
          code: 'let x = 10;\nx = x * 2;\nx = x - 5;',
          answer: 15,
          hint: { es: 'Ve línea por línea: cada una usa el valor que dejó la anterior.', en: 'Go line by line: each one uses the value left by the previous one.' },
          explain: { es: '10 → 20 → 15. Cada <code>=</code> reemplaza lo que había en la caja.', en: '10 → 20 → 15. Each <code>=</code> replaces what was in the box.' },
        },
      ],
    },

    // ═══════════════════════ 2 · Tipos ═══════════════════════
    {
      id: 'types',
      icon: '🧪',
      title: { es: 'Ocho tipos de datos', en: 'Eight data types' },
      blurb: { es: 'typeof, NaN, Infinity y los textos con backticks', en: 'typeof, NaN, Infinity and backtick strings' },
      more: [{ title: { es: 'Tipos de datos', en: 'Data types' }, url: 'https://javascript.info/types' }],
      steps: [
        {
          type: 'read',
          title: { es: 'Todo valor tiene un tipo', en: 'Every value has a type' },
          body: {
            es: '<p>JavaScript tiene <b>8 tipos</b>. Siete son <b>primitivos</b>, valores simples que no se pueden partir: <code>number</code>, <code>bigint</code>, <code>string</code>, <code>boolean</code>, <code>null</code>, <code>undefined</code> y <code>symbol</code>.</p><p>El octavo es <code>object</code>, y ahí caben arrays, funciones, fechas… todo lo demás.</p>',
            en: '<p>JavaScript has <b>8 types</b>. Seven are <b>primitives</b>, simple values you can’t split: <code>number</code>, <code>bigint</code>, <code>string</code>, <code>boolean</code>, <code>null</code>, <code>undefined</code> and <code>symbol</code>.</p><p>The eighth is <code>object</code>, and it holds arrays, functions, dates… everything else.</p>',
          },
        },
        {
          type: 'classify',
          prompt: { es: '¿Primitivo u objeto?', en: 'Primitive or object?' },
          bins: [
            { es: 'Primitivo', en: 'Primitive' },
            { es: 'Objeto', en: 'Object' },
          ],
          items: [
            { label: "<code>'hola'</code>", bin: 0 },
            { label: '<code>[1, 2]</code>', bin: 1 },
            { label: '<code>null</code>', bin: 0 },
            { label: '<code>{}</code>', bin: 1 },
            { label: '<code>function () {}</code>', bin: 1 },
            { label: '<code>42n</code>', bin: 0 },
          ],
          explain: {
            es: 'Arrays y funciones son objetos con superpoderes. <code>42n</code> es un <code>bigint</code> (enteros gigantes) y <code>null</code> es su propio tipo primitivo, aunque <code>typeof</code> diga otra cosa…',
            en: 'Arrays and functions are objects with superpowers. <code>42n</code> is a <code>bigint</code> (huge integers) and <code>null</code> is its own primitive type, even if <code>typeof</code> says otherwise…',
          },
        },
        {
          type: 'choice',
          prompt: { es: '¿Qué devuelve?', en: 'What does it return?' },
          code: 'typeof null',
          options: ["<code>'null'</code>", "<code>'object'</code>", "<code>'undefined'</code>"],
          answer: 1,
          why: {
            0: { es: 'Sería lo lógico… pero no.', en: 'That would make sense… but no.' },
          },
          explain: {
            es: 'Es un error famoso de 1995 que nunca se arregló para no romper la web. <code>null</code> <b>no</b> es un objeto. Para revisarlo, compara directo: <code>x === null</code>.',
            en: 'It’s a famous bug from 1995 that was never fixed so the web wouldn’t break. <code>null</code> is <b>not</b> an object. To check for it, compare directly: <code>x === null</code>.',
          },
        },
        {
          type: 'choice',
          prompt: { es: '¿Y con una función?', en: 'And with a function?' },
          code: 'typeof function () {}',
          options: ["<code>'object'</code>", "<code>'function'</code>", "<code>'undefined'</code>"],
          answer: 1,
          explain: {
            es: 'Las funciones son objetos, pero <code>typeof</code> las distingue con <code>\'function\'</code> porque es muy útil saber si algo se puede llamar.',
            en: 'Functions are objects, but <code>typeof</code> reports <code>\'function\'</code> because it’s handy to know whether something is callable.',
          },
        },
        {
          type: 'choice',
          prompt: { es: '¿Qué da dividir entre cero?', en: 'What does dividing by zero give?' },
          code: '1 / 0',
          options: [{ es: 'Error', en: 'An error' }, '<code>Infinity</code>', '<code>NaN</code>', '<code>0</code>'],
          answer: 1,
          why: {
            0: { es: 'En otros lenguajes, sí. JavaScript no se rompe con matemáticas: te da un número especial.', en: 'In other languages, yes. JavaScript doesn’t crash on math: it gives you a special number.' },
            2: { es: '<code>NaN</code> sale de operaciones sin sentido, como <code>0 / 0</code>. Esto sí tiene sentido: crece sin límite.', en: '<code>NaN</code> comes from meaningless operations like <code>0 / 0</code>. This one makes sense: it grows without limit.' },
          },
          explain: {
            es: '<code>Infinity</code> es un <code>number</code> de verdad: <code>Infinity > 1000</code> es <code>true</code>. Las matemáticas en JavaScript nunca lanzan errores.',
            en: '<code>Infinity</code> is a real <code>number</code>: <code>Infinity > 1000</code> is <code>true</code>. Math in JavaScript never throws.',
          },
        },
        {
          type: 'choice',
          prompt: { es: '¿Qué da multiplicar un texto?', en: 'What does multiplying a string give?' },
          code: "'hola' * 2",
          options: ['<code>NaN</code>', "<code>'holahola'</code>", { es: 'Error', en: 'An error' }],
          answer: 0,
          why: {
            1: { es: 'Eso es Python. En JavaScript, <code>*</code> convierte todo a número, y <code>\'hola\'</code> no es un número.', en: 'That’s Python. In JavaScript, <code>*</code> turns everything into a number, and <code>\'hola\'</code> isn’t one.' },
          },
          explain: {
            es: '<code>NaN</code> ("Not a Number") es el resultado de una cuenta imposible, y es contagioso: <code>NaN + 1</code> también es <code>NaN</code>. Ojo: <code>NaN === NaN</code> es <code>false</code>; usa <code>Number.isNaN(x)</code>.',
            en: '<code>NaN</code> ("Not a Number") is the result of an impossible calculation, and it’s contagious: <code>NaN + 1</code> is <code>NaN</code> too. Careful: <code>NaN === NaN</code> is <code>false</code>; use <code>Number.isNaN(x)</code>.',
          },
        },
        {
          type: 'choice',
          prompt: { es: '¿Qué texto sale de la segunda línea?', en: 'What string does the second line give?' },
          code: "const name = 'Salsa';\n'Hola, ${name}!'",
          options: ["<code>'Hola, Salsa!'</code>", "<code>'Hola, ${name}!'</code>", { es: 'Error', en: 'An error' }],
          answer: 1,
          why: {
            0: {
              es: 'Eso pasaría con backticks: <code>`Hola, ${name}!`</code>. Con comillas simples, <code>${name}</code> es texto normal.',
              en: 'That’s what backticks would do: <code>`Hola, ${name}!`</code>. With single quotes, <code>${name}</code> is just text.',
            },
          },
          explain: {
            es: 'Solo los textos entre <b>backticks</b> (<code>`…`</code>) meten valores con <code>${…}</code>. Las comillas simples y dobles son iguales entre sí y no hacen esa magia.',
            en: 'Only <b>backtick</b> strings (<code>`…`</code>) embed values with <code>${…}</code>. Single and double quotes are equivalent and don’t do that magic.',
          },
        },
        {
          type: 'choice',
          prompt: { es: 'La pregunta de entrevista clásica:', en: 'The classic interview question:' },
          code: '0.1 + 0.2 === 0.3',
          options: ['<code>true</code>', '<code>false</code>'],
          answer: 1,
          explain: {
            es: 'Los números se guardan en binario, y 0.1 no tiene representación exacta: la suma da <code>0.30000000000000004</code>. Para comparar decimales usa una tolerancia: <code>Math.abs(a - b) &lt; Number.EPSILON</code>.',
            en: 'Numbers are stored in binary, and 0.1 has no exact representation: the sum is <code>0.30000000000000004</code>. To compare decimals use a tolerance: <code>Math.abs(a - b) &lt; Number.EPSILON</code>.',
          },
        },
      ],
    },

    // ═══════════════════════ 3 · Conversiones y comparaciones ═══════════════════════
    {
      id: 'conversions',
      icon: '⚖️',
      title: { es: 'Conversiones y comparaciones', en: 'Conversions and comparisons' },
      blurb: { es: 'Cuándo JavaScript cambia tus tipos sin avisar', en: 'When JavaScript changes your types without asking' },
      more: [
        { title: { es: 'Conversiones de tipo', en: 'Type conversions' }, url: 'https://javascript.info/type-conversions' },
        { title: { es: 'Comparaciones', en: 'Comparisons' }, url: 'https://javascript.info/comparison' },
      ],
      steps: [
        {
          type: 'read',
          title: { es: 'JavaScript convierte por ti', en: 'JavaScript converts for you' },
          body: {
            es: '<p>Cuando mezclas tipos, JavaScript convierte solo:</p><p>• con <code>+</code> y un texto, todo se vuelve <b>texto</b>;<br>• con <code>-</code>, <code>*</code>, <code>/</code>, todo se vuelve <b>número</b>;<br>• en un <code>if</code>, todo se vuelve <b>booleano</b>.</p><p>Conocer estas tres reglas te ahorra horas de bugs.</p>',
            en: '<p>When you mix types, JavaScript converts on its own:</p><p>• with <code>+</code> and a string, everything becomes a <b>string</b>;<br>• with <code>-</code>, <code>*</code>, <code>/</code>, everything becomes a <b>number</b>;<br>• in an <code>if</code>, everything becomes a <b>boolean</b>.</p><p>Knowing these three rules saves you hours of bugs.</p>',
          },
        },
        {
          type: 'choice',
          prompt: { es: '¿Qué da?', en: 'What does it give?' },
          code: "'5' + 1",
          options: ['<code>6</code>', "<code>'51'</code>", { es: 'Error', en: 'An error' }],
          answer: 1,
          why: {
            0: { es: 'Con <code>+</code>, si uno de los dos es texto, gana el texto: se pegan.', en: 'With <code>+</code>, if either side is a string, the string wins: they get glued.' },
          },
          explain: { es: '<code>+</code> con un texto concatena: <code>\'5\' + 1</code> es <code>\'51\'</code>.', en: '<code>+</code> with a string concatenates: <code>\'5\' + 1</code> is <code>\'51\'</code>.' },
        },
        {
          type: 'choice',
          prompt: { es: '¿Y con resta?', en: 'And with minus?' },
          code: "'5' - 1",
          options: ['<code>4</code>', "<code>'51'</code>", '<code>NaN</code>'],
          answer: 0,
          why: {
            1: { es: 'Restar textos no tiene sentido, así que <code>-</code> convierte a número.', en: 'Subtracting strings makes no sense, so <code>-</code> converts to numbers.' },
          },
          explain: {
            es: '<code>-</code> solo sabe de números: convierte <code>\'5\'</code> a 5 y da 4. Por eso <code>+</code> es el raro: es el único que también pega textos.',
            en: '<code>-</code> only knows numbers: it turns <code>\'5\'</code> into 5 and gives 4. That’s why <code>+</code> is the odd one: it’s the only one that also glues strings.',
          },
        },
        {
          type: 'classify',
          prompt: { es: 'En un <code>if</code>, ¿cuáles cuentan como verdadero?', en: 'In an <code>if</code>, which count as true?' },
          bins: [
            { es: 'Verdadero (truthy)', en: 'True (truthy)' },
            { es: 'Falso (falsy)', en: 'False (falsy)' },
          ],
          items: [
            { label: '<code>0</code>', bin: 1 },
            { label: "<code>'0'</code>", bin: 0 },
            { label: "<code>''</code>", bin: 1 },
            { label: "<code>' '</code>", bin: 0 },
            { label: '<code>[]</code>', bin: 0 },
            { label: '<code>null</code>', bin: 1 },
            { label: '<code>NaN</code>', bin: 1 },
            { label: "<code>'false'</code>", bin: 0 },
          ],
          explain: {
            es: 'La lista de falsos es corta y vale la pena memorizarla: <code>false</code>, <code>0</code>, <code>\'\'</code>, <code>null</code>, <code>undefined</code> y <code>NaN</code>. <b>Todo lo demás</b> es verdadero, incluso <code>\'0\'</code>, <code>\'false\'</code> y un array vacío.',
            en: 'The falsy list is short and worth memorizing: <code>false</code>, <code>0</code>, <code>\'\'</code>, <code>null</code>, <code>undefined</code> and <code>NaN</code>. <b>Everything else</b> is truthy, even <code>\'0\'</code>, <code>\'false\'</code> and an empty array.',
          },
        },
        {
          type: 'choice',
          prompt: { es: '¿Qué número sale de un texto vacío?', en: 'What number comes out of an empty string?' },
          code: "Number('')",
          options: ['<code>NaN</code>', '<code>0</code>', '<code>undefined</code>'],
          answer: 1,
          why: {
            0: { es: 'Sería lo lógico, pero JavaScript trata el texto vacío (o puros espacios) como 0.', en: 'That would make sense, but JavaScript treats an empty (or all-spaces) string as 0.' },
          },
          explain: {
            es: '<code>Number(\'\')</code> y <code>Number(\'   \')</code> dan <code>0</code>, mientras que <code>Number(\'12px\')</code> da <code>NaN</code>. Si validas formularios, revisa el texto vacío aparte.',
            en: '<code>Number(\'\')</code> and <code>Number(\'   \')</code> give <code>0</code>, while <code>Number(\'12px\')</code> gives <code>NaN</code>. When validating forms, check the empty string separately.',
          },
        },
        {
          type: 'choice',
          prompt: { es: '¿Verdadero o falso?', en: 'True or false?' },
          code: "'2' > '12'",
          options: ['<code>true</code>', '<code>false</code>'],
          answer: 0,
          why: {
            1: {
              es: 'Con números sí sería falso. Pero son dos <b>textos</b>, y los textos se comparan letra por letra, como en un diccionario.',
              en: 'With numbers it would be false. But these are two <b>strings</b>, and strings compare character by character, like a dictionary.',
            },
          },
          explain: {
            es: 'Compara el primer carácter: <code>\'2\'</code> contra <code>\'1\'</code>, y el 2 va después, así que <code>\'2\'</code> es "mayor". Si comparas números que vienen de un input, conviértelos primero con <code>Number()</code>.',
            en: 'It compares the first character: <code>\'2\'</code> against <code>\'1\'</code>, and 2 comes later, so <code>\'2\'</code> is "greater". If you compare numbers from an input, convert them first with <code>Number()</code>.',
          },
        },
        {
          type: 'choice',
          prompt: { es: '¿Y este?', en: 'And this one?' },
          code: 'null == undefined',
          options: ['<code>true</code>', '<code>false</code>'],
          answer: 0,
          explain: {
            es: 'Con <code>==</code>, <code>null</code> y <code>undefined</code> son iguales entre sí (y con nada más). Con <code>===</code> no, porque son tipos distintos. Regla práctica: usa siempre <code>===</code>.',
            en: 'With <code>==</code>, <code>null</code> and <code>undefined</code> equal each other (and nothing else). With <code>===</code> they don’t, since they’re different types. Rule of thumb: always use <code>===</code>.',
          },
        },
        {
          type: 'code',
          prompt: {
            es: 'Escribe <code>toNumberOrZero(value)</code>: convierte <code>value</code> a número y, si el resultado es <code>NaN</code>, regresa <code>0</code>.',
            en: 'Write <code>toNumberOrZero(value)</code>: convert <code>value</code> to a number and, if the result is <code>NaN</code>, return <code>0</code>.',
          },
          fnName: 'toNumberOrZero',
          starter: 'function toNumberOrZero(value) {\n  \n}\n',
          tests: [
            { args: ['42'], expect: 42 },
            { args: ['  7 '], expect: 7 },
            { args: ['7px'], expect: 0 },
            { args: [''], expect: 0 },
            { args: [true], expect: 1 },
            { args: [null], expect: 0 },
          ],
          hint: {
            es: 'Primero <code>const n = Number(value);</code>. Luego, recuerda que <code>NaN === NaN</code> es falso: usa <code>Number.isNaN(n)</code>.',
            en: 'First <code>const n = Number(value);</code>. Then remember <code>NaN === NaN</code> is false: use <code>Number.isNaN(n)</code>.',
          },
          solution: 'function toNumberOrZero(value) {\n  const n = Number(value);\n  return Number.isNaN(n) ? 0 : n;\n}',
          explain: {
            es: 'Fíjate en lo que hizo <code>Number</code>: quitó los espacios de <code>\'  7 \'</code>, convirtió <code>true</code> en 1 y <code>null</code> en 0. Esas reglas son las que acabas de ver.',
            en: 'Look at what <code>Number</code> did: it trimmed the spaces in <code>\'  7 \'</code>, turned <code>true</code> into 1 and <code>null</code> into 0. Those are the rules you just saw.',
          },
        },
      ],
    },

    // ═══════════════════════ 4 · ||, && y ?? ═══════════════════════
    {
      id: 'logical',
      icon: '🚪',
      title: { es: 'El portero de la fiesta', en: 'The bouncer at the door' },
      blurb: { es: '||, && y ?? no regresan true o false', en: '||, && and ?? don’t return true or false' },
      more: [
        { title: { es: 'Operadores lógicos', en: 'Logical operators' }, url: 'https://javascript.info/logical-operators' },
        { title: { es: 'El operador ??', en: 'The ?? operator' }, url: 'https://javascript.info/nullish-coalescing-operator' },
      ],
      steps: [
        {
          type: 'read',
          title: { es: 'Regresan un valor, no un sí o un no', en: 'They return a value, not a yes or no' },
          body: {
            es: '<p><code>a || b</code> es un portero que busca al primer invitado <b>verdadero</b> y lo deja pasar. Si nadie lo es, deja pasar al último.</p><p><code>a &amp;&amp; b</code> es al revés: se detiene en el primer <b>falso</b>.</p><p>En los dos casos, en cuanto sabe la respuesta deja de revisar. A eso se le llama <b>cortocircuito</b>.</p>',
            en: '<p><code>a || b</code> is a bouncer looking for the first <b>truthy</b> guest and letting them in. If nobody is, the last one gets in.</p><p><code>a &amp;&amp; b</code> is the opposite: it stops at the first <b>falsy</b> one.</p><p>Either way, as soon as it knows the answer it stops looking. That’s called <b>short-circuiting</b>.</p>',
          },
        },
        {
          type: 'choice',
          prompt: { es: '¿Qué valor sale?', en: 'What value comes out?' },
          code: "null || 'invitado'",
          options: ['<code>true</code>', "<code>'invitado'</code>", '<code>null</code>'],
          answer: 1,
          why: {
            0: { es: '<code>||</code> no convierte a booleano: regresa el valor tal cual.', en: '<code>||</code> doesn’t convert to a boolean: it returns the value itself.' },
          },
          explain: {
            es: '<code>null</code> es falso, así que pasa el siguiente: <code>\'invitado\'</code>. Por eso <code>nombre || \'invitado\'</code> es la forma clásica de poner un valor por defecto.',
            en: '<code>null</code> is falsy, so the next one gets in: <code>\'invitado\'</code>. That’s why <code>name || \'guest\'</code> is the classic way to set a default.',
          },
        },
        {
          type: 'choice',
          prompt: { es: '¿Y con <code>&amp;&amp;</code>?', en: 'And with <code>&amp;&amp;</code>?' },
          code: "'Ana' && 0 && 'Luz'",
          options: ["<code>'Luz'</code>", '<code>0</code>', '<code>false</code>', "<code>'Ana'</code>"],
          answer: 1,
          why: {
            0: { es: '<code>&amp;&amp;</code> solo llega al final si todos son verdaderos. Aquí se detuvo antes.', en: '<code>&amp;&amp;</code> only reaches the end if everything is truthy. It stopped earlier here.' },
            2: { es: 'Casi: se detiene en el primer falso, pero regresa <b>ese valor</b> tal cual, no <code>false</code>.', en: 'Close: it stops at the first falsy value, but returns <b>that value</b> itself, not <code>false</code>.' },
          },
          explain: {
            es: '<code>\'Ana\'</code> es verdadero, sigue. <code>0</code> es falso: se detiene y lo regresa. <code>\'Luz\'</code> ni siquiera se revisa.',
            en: '<code>\'Ana\'</code> is truthy, keep going. <code>0</code> is falsy: it stops and returns it. <code>\'Luz\'</code> isn’t even checked.',
          },
        },
        {
          type: 'choice',
          prompt: { es: 'El volumen está en 0 a propósito. ¿Qué sale?', en: 'The volume is set to 0 on purpose. What comes out?' },
          code: 'const volume = 0;\nvolume || 50',
          options: ['<code>0</code>', '<code>50</code>'],
          answer: 1,
          explain: {
            es: '<code>0</code> es falso, así que <code>||</code> lo cambia por 50. ¡Bug! El usuario quería silencio. Para eso existe <code>??</code>.',
            en: '<code>0</code> is falsy, so <code>||</code> replaces it with 50. Bug! The user wanted silence. That’s what <code>??</code> is for.',
          },
        },
        {
          type: 'choice',
          prompt: { es: 'Ahora con <code>??</code>:', en: 'Now with <code>??</code>:' },
          code: 'const volume = 0;\nvolume ?? 50',
          options: ['<code>0</code>', '<code>50</code>'],
          answer: 0,
          why: {
            1: { es: '<code>??</code> es más exigente que <code>||</code>: solo reemplaza <code>null</code> y <code>undefined</code>.', en: '<code>??</code> is pickier than <code>||</code>: it only replaces <code>null</code> and <code>undefined</code>.' },
          },
          explain: {
            es: '<code>??</code> pregunta "¿existe?", no "¿es verdadero?". <code>0</code>, <code>\'\'</code> y <code>false</code> sí existen, así que se quedan.',
            en: '<code>??</code> asks "does it exist?", not "is it truthy?". <code>0</code>, <code>\'\'</code> and <code>false</code> do exist, so they stay.',
          },
        },
        {
          type: 'classify',
          prompt: {
            es: 'Con <code>value ?? \'default\'</code>, ¿cuáles terminan como <code>\'default\'</code>?',
            en: 'With <code>value ?? \'default\'</code>, which ones end up as <code>\'default\'</code>?',
          },
          bins: [
            { es: "Sale 'default'", en: "Becomes 'default'" },
            { es: 'Se queda igual', en: 'Stays the same' },
          ],
          items: [
            { label: '<code>null</code>', bin: 0 },
            { label: '<code>0</code>', bin: 1 },
            { label: '<code>undefined</code>', bin: 0 },
            { label: "<code>''</code>", bin: 1 },
            { label: '<code>false</code>', bin: 1 },
            { label: '<code>NaN</code>', bin: 1 },
          ],
          explain: {
            es: 'Solo <code>null</code> y <code>undefined</code>. Con <code>||</code>, en cambio, <b>todos</b> los de esta lista saldrían como <code>\'default\'</code>.',
            en: 'Only <code>null</code> and <code>undefined</code>. With <code>||</code>, on the other hand, <b>all</b> of these would become <code>\'default\'</code>.',
          },
        },
        {
          type: 'code',
          prompt: {
            es: 'Escribe <code>getPort(config)</code>: regresa <code>config.port</code> si viene (aunque sea 0) y <code>8080</code> si no.',
            en: 'Write <code>getPort(config)</code>: return <code>config.port</code> if it’s set (even if it’s 0) and <code>8080</code> otherwise.',
          },
          fnName: 'getPort',
          starter: 'function getPort(config) {\n  \n}\n',
          tests: [
            { args: [{ port: 3000 }], expect: 3000 },
            { args: [{ port: 0 }], expect: 0 },
            { args: [{}], expect: 8080 },
            { args: [{ port: null }], expect: 8080 },
          ],
          hint: { es: 'Una línea: <code>return config.port ?? 8080;</code> ¿Ves por qué con <code>||</code> fallaría una prueba?', en: 'One line: <code>return config.port ?? 8080;</code> Can you see why <code>||</code> would fail one test?' },
          solution: 'function getPort(config) {\n  return config.port ?? 8080;\n}',
          explain: {
            es: 'Con <code>||</code>, <code>getPort({ port: 0 })</code> daría 8080. Es un bug real que pasa mucho en configuraciones; <code>??</code> llegó al lenguaje justo para esto.',
            en: 'With <code>||</code>, <code>getPort({ port: 0 })</code> would give 8080. It’s a real bug that happens a lot in configs; <code>??</code> was added to the language for exactly this.',
          },
        },
      ],
    },

    // ═══════════════════════ 5 · Loops ═══════════════════════
    {
      id: 'loops',
      icon: '🔁',
      title: { es: 'Dar vueltas', en: 'Going around' },
      blurb: { es: 'while, for, break y continue', en: 'while, for, break and continue' },
      more: [{ title: { es: 'Loops: while y for', en: 'Loops: while and for' }, url: 'https://javascript.info/while-for' }],
      steps: [
        {
          type: 'read',
          title: { es: 'Repetir sin copiar y pegar', en: 'Repeat without copy-paste' },
          code: 'for (let i = 0; i < 3; i++) {\n  console.log(i);\n}',
          body: {
            es: '<p>Un <code>for</code> tiene tres partes separadas por <code>;</code>: el <b>inicio</b> (<code>let i = 0</code>), la <b>condición</b> para seguir (<code>i &lt; 3</code>) y el <b>paso</b> después de cada vuelta (<code>i++</code>).</p><p>Este imprime 0, 1 y 2.</p>',
            en: '<p>A <code>for</code> has three parts separated by <code>;</code>: the <b>start</b> (<code>let i = 0</code>), the <b>condition</b> to keep going (<code>i &lt; 3</code>) and the <b>step</b> after each lap (<code>i++</code>).</p><p>This one prints 0, 1 and 2.</p>',
          },
        },
        {
          type: 'trace',
          prompt: { es: 'Avanza paso a paso. Fíjate cuándo se revisa la condición.', en: 'Step through it. Notice when the condition is checked.' },
          code: 'let i = 0;\nwhile (i < 3) {\n  i++;\n}',
          frames: [
            { line: 0, vars: {} },
            { line: 1, vars: { i: 0 }, note: { es: '<code>0 &lt; 3</code>: entra.', en: '<code>0 &lt; 3</code>: in we go.' } },
            { line: 2, vars: { i: 1 } },
            { line: 1, vars: { i: 1 }, note: { es: 'Regresa a revisar: <code>1 &lt; 3</code>.', en: 'Back to check: <code>1 &lt; 3</code>.' } },
            { line: 2, vars: { i: 2 } },
            { line: 1, vars: { i: 2 } },
            { line: 2, vars: { i: 3 } },
            { line: 1, vars: { i: 3 }, note: { es: '<code>3 &lt; 3</code> es falso: sale del loop.', en: '<code>3 &lt; 3</code> is false: out of the loop.' } },
          ],
        },
        {
          type: 'number',
          prompt: { es: '¿Cuánto vale <code>count</code> al final?', en: 'What is <code>count</code> at the end?' },
          code: 'let count = 0;\nfor (let i = 0; i < 10; i += 3) {\n  count++;\n}',
          answer: 4,
          hint: { es: 'Escribe los valores de <code>i</code>: 0, 3, … ¿cuándo deja de cumplirse <code>i &lt; 10</code>?', en: 'Write down the values of <code>i</code>: 0, 3, … when does <code>i &lt; 10</code> stop being true?' },
          explain: { es: '<code>i</code> vale 0, 3, 6 y 9. Con 12 ya no entra: son 4 vueltas.', en: '<code>i</code> is 0, 3, 6 and 9. At 12 it stops: 4 laps.' },
        },
        {
          type: 'choice',
          prompt: { es: '¿Qué imprime?', en: 'What does it print?' },
          code: 'for (let i = 0; i < 5; i++) {\n  if (i === 2) continue;\n  if (i === 4) break;\n  console.log(i);\n}',
          options: ['<code>0 1 2 3 4</code>', '<code>0 1 3</code>', '<code>0 1 3 4</code>', '<code>0 1</code>'],
          answer: 1,
          why: {
            2: { es: '<code>break</code> sale del loop <b>antes</b> del <code>console.log</code>, así que el 4 nunca se imprime.', en: '<code>break</code> leaves the loop <b>before</b> the <code>console.log</code>, so 4 never prints.' },
            3: { es: '<code>continue</code> no termina el loop: solo se salta el resto de <b>esa</b> vuelta.', en: '<code>continue</code> doesn’t end the loop: it only skips the rest of <b>that</b> lap.' },
          },
          explain: {
            es: '<code>continue</code> brinca a la siguiente vuelta (se salta el 2) y <code>break</code> sale del loop por completo (en el 4).',
            en: '<code>continue</code> jumps to the next lap (skipping 2) and <code>break</code> leaves the loop entirely (at 4).',
          },
        },
        {
          type: 'choice',
          prompt: { es: '¿Qué pasa en la última línea?', en: 'What happens on the last line?' },
          code: 'for (let i = 0; i < 3; i++) {}\nconsole.log(i);',
          options: [{ es: 'Imprime <code>3</code>', en: 'It prints <code>3</code>' }, { es: 'Imprime <code>undefined</code>', en: 'It prints <code>undefined</code>' }, { es: 'Error', en: 'An error' }],
          answer: 2,
          why: {
            0: { es: 'Con <code>var i</code> sí imprimiría 3. Con <code>let</code>, la <code>i</code> solo existe dentro del loop.', en: 'With <code>var i</code> it would print 3. With <code>let</code>, <code>i</code> only exists inside the loop.' },
          },
          explain: {
            es: 'La <code>i</code> declarada con <code>let</code> dentro del <code>for</code> vive solo en el loop. Afuera no existe: <code>ReferenceError</code>.',
            en: 'An <code>i</code> declared with <code>let</code> inside the <code>for</code> lives only in the loop. Outside it doesn’t exist: <code>ReferenceError</code>.',
          },
        },
        {
          type: 'order',
          prompt: { es: 'Arma <code>sumTo(n)</code>, que suma 1 + 2 + … + n. Se prueba de verdad.', en: 'Build <code>sumTo(n)</code>, which adds 1 + 2 + … + n. It runs real tests.' },
          pre: 'function sumTo(n) {',
          post: '}',
          lines: ['  let total = 0;', '  for (let i = 1; i <= n; i++) {', '    total += i;', '  }', '  return total;'],
          seed: 5,
          fnName: 'sumTo',
          tests: [
            { args: [3], expect: 6 },
            { args: [1], expect: 1 },
            { args: [0], expect: 0 },
            { args: [100], expect: 5050 },
          ],
          explain: {
            es: 'El acumulador (<code>total</code>) nace antes del loop y se regresa después. Dato: Gauss lo resolvía sin loop, con <code>n * (n + 1) / 2</code>.',
            en: 'The accumulator (<code>total</code>) is born before the loop and returned after it. Fun fact: Gauss solved it without a loop, with <code>n * (n + 1) / 2</code>.',
          },
        },
        {
          type: 'code',
          prompt: {
            es: 'Escribe <code>countVowels(text)</code>: cuántas vocales (a, e, i, o, u, sin importar mayúsculas) tiene <code>text</code>.',
            en: 'Write <code>countVowels(text)</code>: how many vowels (a, e, i, o, u, any case) <code>text</code> has.',
          },
          fnName: 'countVowels',
          starter: "function countVowels(text) {\n  let count = 0;\n  for (const ch of text) {\n    \n  }\n  return count;\n}\n",
          tests: [
            { args: ['hola'], expect: 2 },
            { args: ['JavaScript'], expect: 3 },
            { args: ['xyz'], expect: 0 },
            { args: [''], expect: 0 },
            { args: ['AEIOU'], expect: 5 },
          ],
          hint: {
            es: '<code>for (const ch of text)</code> te da cada letra. Revisa si <code>\'aeiou\'.includes(ch.toLowerCase())</code>.',
            en: '<code>for (const ch of text)</code> gives you each letter. Check whether <code>\'aeiou\'.includes(ch.toLowerCase())</code>.',
          },
          solution:
            "function countVowels(text) {\n  let count = 0;\n  for (const ch of text) {\n    if ('aeiou'.includes(ch.toLowerCase())) count++;\n  }\n  return count;\n}",
          explain: {
            es: '<code>for…of</code> recorre los elementos directamente, sin índices. Úsalo cuando no necesites saber en qué posición vas.',
            en: '<code>for…of</code> walks the elements directly, no indexes. Use it when you don’t need to know the position.',
          },
        },
      ],
    },

    // ═══════════════════════ 6 · Funciones ═══════════════════════
    {
      id: 'functions',
      icon: '🧩',
      title: { es: 'Funciones', en: 'Functions' },
      blurb: { es: 'Parámetros, return, hoisting y funciones flecha', en: 'Parameters, return, hoisting and arrow functions' },
      more: [
        { title: { es: 'Funciones', en: 'Functions' }, url: 'https://javascript.info/function-basics' },
        { title: { es: 'Expresiones de función', en: 'Function expressions' }, url: 'https://javascript.info/function-expressions' },
        { title: { es: 'Funciones flecha', en: 'Arrow functions' }, url: 'https://javascript.info/arrow-functions-basics' },
      ],
      steps: [
        {
          type: 'read',
          title: { es: 'Una receta con nombre', en: 'A named recipe' },
          code: "function greet(name) {\n  return 'Hola, ' + name;\n}\ngreet('Salsa'); // 'Hola, Salsa'",
          body: {
            es: '<p>Una función es una receta: recibe ingredientes (<b>parámetros</b>), hace algo y entrega un resultado con <code>return</code>.</p><p>Si no hay <code>return</code>, la función entrega <code>undefined</code>.</p>',
            en: '<p>A function is a recipe: it takes ingredients (<b>parameters</b>), does something and hands back a result with <code>return</code>.</p><p>Without a <code>return</code>, the function hands back <code>undefined</code>.</p>',
          },
        },
        {
          type: 'choice',
          prompt: { es: '¿Qué regresa <code>f(5)</code>?', en: 'What does <code>f(5)</code> return?' },
          code: 'function f(x) {\n  x * 2;\n}\nf(5)',
          options: ['<code>10</code>', '<code>undefined</code>', { es: 'Error', en: 'An error' }],
          answer: 1,
          why: {
            0: { es: 'Sí calcula 10… y lo tira a la basura. Sin <code>return</code>, el resultado no sale de la función.', en: 'It does compute 10… and throws it away. Without <code>return</code>, the result never leaves the function.' },
          },
          explain: { es: 'Olvidar el <code>return</code> es de los bugs más comunes. Toda función sin <code>return</code> regresa <code>undefined</code>.', en: 'Forgetting <code>return</code> is one of the most common bugs. Any function without <code>return</code> returns <code>undefined</code>.' },
        },
        {
          type: 'choice',
          prompt: { es: '¿Qué regresa <code>hi()</code>?', en: 'What does <code>hi()</code> return?' },
          code: "function hi(name = 'amigo') {\n  return 'Hola, ' + name;\n}\nhi()",
          options: ["<code>'Hola, undefined'</code>", "<code>'Hola, amigo'</code>", { es: 'Error', en: 'An error' }],
          answer: 1,
          why: {
            0: { es: 'Eso pasaría sin el <code>= \'amigo\'</code>. Ese es su valor por defecto.', en: 'That would happen without the <code>= \'amigo\'</code>. That’s its default value.' },
          },
          explain: {
            es: 'Si no pasas un parámetro, vale <code>undefined</code>… a menos que le pongas un valor por defecto con <code>=</code>. Ojo: el defecto también se usa si pasas <code>undefined</code> a propósito, pero no si pasas <code>null</code>.',
            en: 'If you don’t pass a parameter, it’s <code>undefined</code>… unless you give it a default with <code>=</code>. Note: the default also kicks in if you pass <code>undefined</code> on purpose, but not if you pass <code>null</code>.',
          },
        },
        {
          type: 'choice',
          prompt: { es: 'Llamas a la función antes de definirla. ¿Qué pasa?', en: 'You call the function before defining it. What happens?' },
          code: "sayBye();\nconst sayBye = function () {\n  return 'bye';\n};",
          options: ["<code>'bye'</code>", '<code>undefined</code>', { es: 'Error', en: 'An error' }],
          answer: 2,
          why: {
            0: {
              es: 'Eso pasaría con <code>function sayBye() {…}</code>: las declaraciones se "suben" al inicio. Pero esto es una <b>expresión</b> guardada en un <code>const</code>.',
              en: 'That would happen with <code>function sayBye() {…}</code>: declarations are "hoisted" to the top. But this is an <b>expression</b> stored in a <code>const</code>.',
            },
          },
          explain: {
            es: 'Las <b>declaraciones</b> (<code>function nombre() {}</code>) existen desde antes de su línea; las <b>expresiones</b> (<code>const f = function () {}</code>) solo después. Aquí, <code>sayBye</code> está en la zona muerta: <code>ReferenceError</code>.',
            en: '<b>Declarations</b> (<code>function name() {}</code>) exist before their line; <b>expressions</b> (<code>const f = function () {}</code>) only after. Here, <code>sayBye</code> is in the dead zone: <code>ReferenceError</code>.',
          },
        },
        {
          type: 'fill',
          prompt: { es: 'Completa la función flecha.', en: 'Complete the arrow function.' },
          code: 'const double = (n) [[0]] n * 2;',
          chips: ['=>', '->', '=='],
          answers: ['=>'],
          hint: { es: 'Es la "flecha gorda": un igual y un mayor que.', en: 'It’s the "fat arrow": an equals sign and a greater-than.' },
          explain: {
            es: '<code>(n) => n * 2</code> es una función corta. Sin llaves, lo que va después de la flecha se regresa solo, sin escribir <code>return</code>.',
            en: '<code>(n) => n * 2</code> is a short function. Without braces, whatever follows the arrow is returned automatically, no <code>return</code> needed.',
          },
        },
        {
          type: 'choice',
          prompt: { es: 'Ahora con llaves. ¿Qué regresa?', en: 'Now with braces. What does it return?' },
          code: 'const add = (a, b) => { a + b };\nadd(2, 3)',
          options: ['<code>5</code>', '<code>undefined</code>', { es: 'Error', en: 'An error' }],
          answer: 1,
          why: {
            0: { es: 'Con llaves, la flecha se vuelve una función normal: necesita <code>return</code>.', en: 'With braces, the arrow becomes a regular function body: it needs <code>return</code>.' },
          },
          explain: {
            es: 'Sin llaves, el resultado se regresa solo; con llaves hay que escribir <code>return</code>: <code>(a, b) => { return a + b; }</code>.',
            en: 'Without braces the result is returned automatically; with braces you write <code>return</code>: <code>(a, b) => { return a + b; }</code>.',
          },
        },
        {
          type: 'code',
          prompt: {
            es: 'Escribe <code>clamp(n, min = 0, max = 100)</code>: regresa <code>n</code>, pero nunca menos que <code>min</code> ni más que <code>max</code>.',
            en: 'Write <code>clamp(n, min = 0, max = 100)</code>: return <code>n</code>, but never below <code>min</code> or above <code>max</code>.',
          },
          fnName: 'clamp',
          starter: 'function clamp(n, min = 0, max = 100) {\n  \n}\n',
          tests: [
            { args: [50], expect: 50 },
            { args: [-5], expect: 0 },
            { args: [150], expect: 100 },
            { args: [5, 10, 20], expect: 10 },
            { args: [25, 10, 20], expect: 20 },
          ],
          hint: {
            es: 'Dos <code>if</code>: si <code>n &lt; min</code>, regresa <code>min</code>; si <code>n &gt; max</code>, regresa <code>max</code>. O en una línea: <code>Math.min(Math.max(n, min), max)</code>.',
            en: 'Two <code>if</code>s: if <code>n &lt; min</code>, return <code>min</code>; if <code>n &gt; max</code>, return <code>max</code>. Or in one line: <code>Math.min(Math.max(n, min), max)</code>.',
          },
          solution: 'function clamp(n, min = 0, max = 100) {\n  if (n < min) return min;\n  if (n > max) return max;\n  return n;\n}',
          explain: {
            es: 'Los valores por defecto hacen que <code>clamp(150)</code> funcione sin pasar los límites. Terminaste los fundamentos: lo que sigue son objetos y arrays.',
            en: 'Default values let <code>clamp(150)</code> work without passing the limits. You’ve finished the fundamentals: objects and arrays are next.',
          },
        },
      ],
    },
  ],
});
