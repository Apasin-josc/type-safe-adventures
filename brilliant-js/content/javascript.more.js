// JavaScript a fondo, unidades 2 a 6. Mismo orden que javascript.info; textos y ejercicios propios.
(function () {
  const c = window.COURSES.find((x) => x.id === 'js');
  delete c.unit;
  c.units = [
    { es: 'Fundamentos', en: 'Fundamentals' },
    { es: 'Objetos', en: 'Objects' },
    { es: 'Arrays y colecciones', en: 'Arrays and collections' },
    { es: 'Funciones avanzadas', en: 'Advanced functions' },
    { es: 'Clases', en: 'Classes' },
    { es: 'Errores y async', en: 'Errors and async' },
  ];
  c.blurb = {
    es: 'El lenguaje de punta a punta, en el orden de javascript.info: de variables y tipos a objetos, closures, clases y async. Cada lección te deja el link para leer más.',
    en: 'The whole language, in javascript.info’s order: from variables and types to objects, closures, classes and async. Every lesson links to the chapter to read more.',
  };
  c.soon = [
    { icon: '🔄', title: { es: 'Iteradores y generadores', en: 'Iterators and generators' } },
    { icon: '📦', title: { es: 'Módulos', en: 'Modules' } },
  ];

  c.lessons.push(
    // ═══════════════════════ Unidad 2 · Objetos ═══════════════════════
    {
      id: 'objects',
      unit: 1,
      icon: '🗃️',
      title: { es: 'Objetos y referencias', en: 'Objects and references' },
      blurb: { es: 'Por qué copiar un objeto no siempre lo copia', en: 'Why copying an object doesn’t always copy it' },
      more: [
        { title: { es: 'Objetos', en: 'Objects' }, url: 'https://javascript.info/object' },
        { title: { es: 'Referencias y copias', en: 'Object references and copying' }, url: 'https://javascript.info/object-copy' },
      ],
      steps: [
        {
          type: 'read',
          title: { es: 'Un mueble con cajones', en: 'A chest of drawers' },
          code: "const dog = { name: 'Salsa', age: 3 };\ndog.name;      // 'Salsa'\ndog['age'];    // 3",
          body: {
            es: '<p>Un objeto es un mueble con cajones con nombre: cada <b>propiedad</b> es un cajón con su valor.</p><p>Lo importante: la variable no guarda el mueble, guarda <b>la dirección</b> de dónde está. Eso cambia cómo funcionan las copias.</p>',
            en: '<p>An object is a chest of drawers with names: each <b>property</b> is a drawer with its value.</p><p>The key point: the variable doesn’t hold the chest, it holds <b>its address</b>. That changes how copies work.</p>',
          },
        },
        {
          type: 'choice',
          prompt: { es: '¿Qué vale <code>a.n</code> al final?', en: 'What is <code>a.n</code> at the end?' },
          code: 'const a = { n: 1 };\nconst b = a;\nb.n = 2;\na.n',
          options: ['<code>1</code>', '<code>2</code>'],
          answer: 1,
          why: {
            0: {
              es: 'Con números <code>=</code> copiaba el valor. Con objetos copia la <b>dirección</b>: <code>a</code> y <code>b</code> apuntan al mismo objeto.',
              en: 'With numbers <code>=</code> copied the value. With objects it copies the <b>address</b>: <code>a</code> and <code>b</code> point to the same object.',
            },
          },
          explain: {
            es: 'Solo hay <b>un</b> objeto con dos etiquetas. Cambiarlo por <code>b</code> se ve por <code>a</code>. Es la causa de muchísimos bugs en React y en entrevistas.',
            en: 'There’s only <b>one</b> object with two labels. Changing it through <code>b</code> shows up through <code>a</code>. It causes tons of bugs in React and in interviews.',
          },
        },
        {
          type: 'choice',
          prompt: { es: '¿Verdadero o falso?', en: 'True or false?' },
          code: '({ n: 1 }) === ({ n: 1 })',
          options: ['<code>true</code>', '<code>false</code>'],
          answer: 1,
          explain: {
            es: '<code>===</code> con objetos compara direcciones, no contenido. Son dos objetos distintos que se ven igual, así que es <code>false</code>.',
            en: '<code>===</code> on objects compares addresses, not contents. These are two different objects that look alike, so it’s <code>false</code>.',
          },
        },
        {
          type: 'choice',
          prompt: { es: 'Copias con <code>...</code>. ¿Qué sale?', en: 'You copy with <code>...</code>. What comes out?' },
          code: "const a = { n: 1, tags: ['x'] };\nconst b = { ...a };\nb.n = 2;\nb.tags.push('y');\n[a.n, a.tags.length]",
          options: ['<code>[1, 1]</code>', '<code>[1, 2]</code>', '<code>[2, 2]</code>'],
          answer: 1,
          why: {
            0: {
              es: 'El <code>n</code> sí quedó separado, pero <code>tags</code> es un array: la copia se llevó su <b>dirección</b>, no un array nuevo.',
              en: '<code>n</code> was separated, but <code>tags</code> is an array: the copy took its <b>address</b>, not a new array.',
            },
            2: { es: '<code>{ ...a }</code> sí crea un objeto nuevo, así que <code>b.n = 2</code> no toca a <code>a</code>.', en: '<code>{ ...a }</code> does create a new object, so <code>b.n = 2</code> doesn’t touch <code>a</code>.' },
          },
          explain: {
            es: '<code>...</code> hace una copia <b>superficial</b>: el primer nivel es nuevo, pero lo de adentro se comparte. Para copiar todo hasta el fondo: <code>structuredClone(a)</code>.',
            en: '<code>...</code> makes a <b>shallow</b> copy: the first level is new, but what’s inside is shared. To copy all the way down: <code>structuredClone(a)</code>.',
          },
        },
        {
          type: 'classify',
          prompt: { es: 'Después de cada línea, ¿<code>b</code> es un objeto nuevo o el mismo que <code>a</code>?', en: 'After each line, is <code>b</code> a new object or the same one as <code>a</code>?' },
          bins: [
            { es: 'Objeto nuevo', en: 'New object' },
            { es: 'El mismo', en: 'The same' },
          ],
          items: [
            { label: '<code>const b = a;</code>', bin: 1 },
            { label: '<code>const b = { ...a };</code>', bin: 0 },
            { label: '<code>const b = structuredClone(a);</code>', bin: 0 },
            { label: '<code>const b = Object.assign({}, a);</code>', bin: 0 },
            { label: '<code>const b = [a][0];</code>', bin: 1 },
          ],
          explain: {
            es: 'Solo hay objeto nuevo cuando algo lo <b>crea</b> (<code>{}</code>, <code>...</code>, <code>structuredClone</code>). Pasarlo, guardarlo en un array o sacarlo de ahí siempre mueve la misma dirección.',
            en: 'You only get a new object when something <b>creates</b> it (<code>{}</code>, <code>...</code>, <code>structuredClone</code>). Passing it around, storing it in an array or taking it out always moves the same address.',
          },
        },
        {
          type: 'choice',
          prompt: { es: 'La llave está en una variable. ¿Qué sale?', en: 'The key is in a variable. What comes out?' },
          code: "const key = 'age';\nconst user = { age: 30 };\nuser.key",
          options: ['<code>30</code>', '<code>undefined</code>', { es: 'Error', en: 'An error' }],
          answer: 1,
          why: {
            0: { es: 'Con punto, <code>user.key</code> busca un cajón llamado literalmente "key".', en: 'With a dot, <code>user.key</code> looks for a drawer literally named "key".' },
          },
          explain: {
            es: 'Para usar el valor de la variable como nombre de cajón van corchetes: <code>user[key]</code> da 30.',
            en: 'To use the variable’s value as the drawer name you need brackets: <code>user[key]</code> gives 30.',
          },
        },
        {
          type: 'code',
          prompt: {
            es: 'Escribe <code>invert(obj)</code>: regresa un objeto nuevo con llaves y valores intercambiados.',
            en: 'Write <code>invert(obj)</code>: return a new object with keys and values swapped.',
          },
          fnName: 'invert',
          starter: 'function invert(obj) {\n  const out = {};\n  \n  return out;\n}\n',
          tests: [
            { args: [{ a: 'x', b: 'y' }], expect: { x: 'a', y: 'b' } },
            { args: [{}], expect: {} },
            { args: [{ dog: 'Salsa' }], expect: { Salsa: 'dog' } },
          ],
          hint: {
            es: '<code>for (const key in obj)</code> recorre las llaves. Dentro: <code>out[obj[key]] = key;</code>',
            en: '<code>for (const key in obj)</code> walks the keys. Inside: <code>out[obj[key]] = key;</code>',
          },
          solution: 'function invert(obj) {\n  const out = {};\n  for (const key in obj) {\n    out[obj[key]] = key;\n  }\n  return out;\n}',
          explain: {
            es: 'Creaste un objeto nuevo y no tocaste el original: así se evitan los bugs de referencias. Otra forma: <code>Object.fromEntries(Object.entries(obj).map(([k, v]) => [v, k]))</code>.',
            en: 'You made a new object and left the original alone: that’s how you avoid reference bugs. Another way: <code>Object.fromEntries(Object.entries(obj).map(([k, v]) => [v, k]))</code>.',
          },
        },
      ],
    },
    {
      id: 'this',
      unit: 1,
      icon: '🫵',
      title: { es: 'this: ¿quién llama?', en: 'this: who’s calling?' },
      blurb: { es: 'Métodos, this perdido, bind y ?.', en: 'Methods, lost this, bind and ?.' },
      more: [
        { title: { es: 'Métodos y this', en: 'Object methods, "this"' }, url: 'https://javascript.info/object-methods' },
        { title: { es: 'Optional chaining ?.', en: 'Optional chaining ?.' }, url: 'https://javascript.info/optional-chaining' },
      ],
      steps: [
        {
          type: 'read',
          title: { es: 'this es quien está antes del punto', en: 'this is whoever’s before the dot' },
          code: "const dog = {\n  name: 'Salsa',\n  hi() {\n    return 'Soy ' + this.name;\n  },\n};\ndog.hi(); // 'Soy Salsa'",
          body: {
            es: '<p>Dentro de un método, <code>this</code> es el objeto que lo está llamando: el que va <b>antes del punto</b> en el momento de la llamada.</p><p>No importa dónde se escribió la función, sino <b>cómo se llama</b>.</p>',
            en: '<p>Inside a method, <code>this</code> is the object calling it: whatever comes <b>before the dot</b> at call time.</p><p>It doesn’t matter where the function was written, but <b>how it’s called</b>.</p>',
          },
        },
        {
          type: 'choice',
          prompt: { es: 'Sacas el método a una variable. ¿Qué pasa? (modo estricto, como en clases y módulos)', en: 'You pull the method into a variable. What happens? (strict mode, like in classes and modules)' },
          code: "'use strict';\nconst dog = {\n  name: 'Salsa',\n  hi() { return 'Soy ' + this.name; },\n};\nconst hi = dog.hi;\nhi()",
          options: ["<code>'Soy Salsa'</code>", { es: 'Error: <code>this</code> es <code>undefined</code>', en: 'Error: <code>this</code> is <code>undefined</code>' }, "<code>'Soy '</code>"],
          answer: 1,
          why: {
            0: {
              es: 'La función es la misma, pero ahora no hay nada antes del punto: <code>hi()</code> se llama sola, y <code>this</code> se perdió.',
              en: 'It’s the same function, but now there’s nothing before the dot: <code>hi()</code> is called alone, and <code>this</code> is lost.',
            },
          },
          explain: {
            es: 'Es el famoso "<code>this</code> perdido": pasa al guardar un método en una variable o al pasarlo como callback (<code>setTimeout(dog.hi)</code>).',
            en: 'This is the famous "lost <code>this</code>": it happens when you store a method in a variable or pass it as a callback (<code>setTimeout(dog.hi)</code>).',
          },
        },
        {
          type: 'choice',
          prompt: { es: '¿Y con <code>bind</code>?', en: 'And with <code>bind</code>?' },
          code: "const hi = dog.hi.bind(dog);\nhi()",
          options: ["<code>'Soy Salsa'</code>", { es: 'Error', en: 'An error' }],
          answer: 0,
          explain: {
            es: '<code>bind(dog)</code> crea una función nueva con el <code>this</code> amarrado para siempre a <code>dog</code>. Así puedes pasarla como callback sin perderlo.',
            en: '<code>bind(dog)</code> creates a new function with <code>this</code> tied to <code>dog</code> forever. Now you can pass it as a callback safely.',
          },
        },
        {
          type: 'choice',
          prompt: { es: 'Una flecha dentro de un método. ¿Qué regresa <code>dog.later()</code>?', en: 'An arrow inside a method. What does <code>dog.later()</code> return?' },
          code: "const dog = {\n  name: 'Salsa',\n  later() {\n    return [1].map(() => this.name)[0];\n  },\n};\ndog.later()",
          options: ["<code>'Salsa'</code>", '<code>undefined</code>', { es: 'Error', en: 'An error' }],
          answer: 0,
          why: {
            1: {
              es: 'Eso pasaría con <code>function () { return this.name; }</code>. Las flechas no tienen <code>this</code> propio: usan el de afuera.',
              en: 'That’s what <code>function () { return this.name; }</code> would do. Arrows have no <code>this</code> of their own: they use the outer one.',
            },
          },
          explain: {
            es: 'La flecha toma el <code>this</code> del método donde nació (<code>dog</code>). Por eso las flechas son perfectas para callbacks dentro de métodos.',
            en: 'The arrow takes the <code>this</code> of the method it was born in (<code>dog</code>). That’s why arrows are perfect for callbacks inside methods.',
          },
        },
        {
          type: 'choice',
          prompt: { es: 'El usuario no tiene dirección. ¿Cuál NO lanza error?', en: 'The user has no address. Which one does NOT throw?' },
          code: 'const user = {};',
          options: ['<code>user.address.street</code>', '<code>user.address?.street</code>'],
          answer: 1,
          why: {
            0: { es: '<code>user.address</code> es <code>undefined</code>, y leer <code>.street</code> de <code>undefined</code> lanza <code>TypeError</code>.', en: '<code>user.address</code> is <code>undefined</code>, and reading <code>.street</code> from <code>undefined</code> throws <code>TypeError</code>.' },
          },
          explain: {
            es: '<code>?.</code> se detiene si lo de la izquierda es <code>null</code> o <code>undefined</code> y regresa <code>undefined</code>. Combinado con <code>??</code>: <code>user.address?.street ?? \'sin calle\'</code>.',
            en: '<code>?.</code> stops if the left side is <code>null</code> or <code>undefined</code> and returns <code>undefined</code>. Combine it with <code>??</code>: <code>user.address?.street ?? \'no street\'</code>.',
          },
        },
        {
          type: 'code',
          prompt: {
            es: 'Escribe <code>makeDog(name)</code>: regresa un objeto con <code>name</code> y un método <code>speak()</code> que regrese <code>name + \': guau!\'</code>. Usa <code>this</code>: si le cambias el nombre al perro, <code>speak</code> debe usar el nuevo.',
            en: 'Write <code>makeDog(name)</code>: return an object with <code>name</code> and a <code>speak()</code> method returning <code>name + \': guau!\'</code>. Use <code>this</code>: if the dog’s name changes, <code>speak</code> must use the new one.',
          },
          fnName: 'makeDog',
          wrap: '(name, rename) => { const d = makeDog(name); if (rename) d.name = rename; return d.speak(); }',
          starter: 'function makeDog(name) {\n  return {\n    name,\n    speak() {\n      \n    },\n  };\n}\n',
          tests: [
            { args: ['Salsa', null], expect: 'Salsa: guau!', label: "makeDog('Salsa').speak()" },
            { args: ['Salsa', 'Luna'], expect: 'Luna: guau!', label: "d = makeDog('Salsa'); d.name = 'Luna'; d.speak()" },
          ],
          hint: { es: "Dentro de <code>speak</code>: <code>return this.name + ': guau!';</code>", en: "Inside <code>speak</code>: <code>return this.name + ': guau!';</code>" },
          solution: "function makeDog(name) {\n  return {\n    name,\n    speak() {\n      return this.name + ': guau!';\n    },\n  };\n}",
          explain: {
            es: 'Si hubieras usado la variable <code>name</code> en vez de <code>this.name</code>, la segunda prueba fallaría: el método recordaría el nombre viejo. <code>this</code> lee el objeto en el momento de la llamada.',
            en: 'If you had used the <code>name</code> variable instead of <code>this.name</code>, the second test would fail: the method would remember the old name. <code>this</code> reads the object at call time.',
          },
        },
      ],
    },

    // ═══════════════════════ Unidad 3 · Arrays y colecciones ═══════════════════════
    {
      id: 'array-methods',
      unit: 2,
      icon: '🧰',
      title: { es: 'map, filter y reduce', en: 'map, filter and reduce' },
      blurb: { es: 'Transformar, quedarte con algunos y juntar en uno', en: 'Transform, keep some, combine into one' },
      more: [{ title: { es: 'Métodos de arrays', en: 'Array methods' }, url: 'https://javascript.info/array-methods' }],
      steps: [
        {
          type: 'read',
          title: { es: 'Tres herramientas que vas a usar diario', en: 'Three tools you’ll use every day' },
          code: 'const nums = [1, 2, 3, 4];\nnums.map(n => n * 10);        // [10, 20, 30, 40]\nnums.filter(n => n > 2);      // [3, 4]\nnums.reduce((a, n) => a + n, 0); // 10',
          body: {
            es: '<p><b>map</b> transforma cada elemento. <b>filter</b> se queda con los que cumplen. <b>reduce</b> junta todo en un solo valor.</p><p><code>map</code> y <code>filter</code> regresan un array <b>nuevo</b>: el original no cambia.</p>',
            en: '<p><b>map</b> transforms each element. <b>filter</b> keeps the ones that pass. <b>reduce</b> combines everything into one value.</p><p><code>map</code> and <code>filter</code> return a <b>new</b> array: the original stays the same.</p>',
          },
        },
        {
          type: 'choice',
          prompt: { es: '¿Qué regresa?', en: 'What does it return?' },
          code: '[1, 2, 3].map(n => n * 2)',
          options: ['<code>[2, 4, 6]</code>', '<code>12</code>', '<code>[1, 2, 3]</code>'],
          answer: 0,
          explain: { es: 'Un array del mismo tamaño, con cada elemento transformado.', en: 'An array of the same size, with each element transformed.' },
        },
        {
          type: 'choice',
          prompt: { es: '¿Y este?', en: 'And this one?' },
          code: '[1, 2, 3, 4].filter(n => n % 2 === 0)',
          options: ['<code>[true, false, true, false]</code>', '<code>[2, 4]</code>', '<code>[1, 3]</code>'],
          answer: 1,
          why: {
            0: { es: 'Eso haría <code>map</code>. <code>filter</code> usa el <code>true</code> o <code>false</code> para decidir quién se queda.', en: 'That’s what <code>map</code> would do. <code>filter</code> uses the <code>true</code> or <code>false</code> to decide who stays.' },
          },
          explain: { es: '<code>%</code> es el residuo: <code>n % 2 === 0</code> significa "es par". Se quedan el 2 y el 4.', en: '<code>%</code> is the remainder: <code>n % 2 === 0</code> means "is even". 2 and 4 stay.' },
        },
        {
          type: 'number',
          prompt: { es: '¿Qué número sale?', en: 'What number comes out?' },
          code: '[1, 2, 3, 4].reduce((acc, n) => acc + n * n, 0)',
          answer: 30,
          hint: { es: 'Empieza en 0 y en cada vuelta suma el cuadrado: 1, 4, 9, 16.', en: 'Start at 0 and add each square: 1, 4, 9, 16.' },
          explain: { es: '0 + 1 + 4 + 9 + 16 = 30. El <code>0</code> del final es el valor inicial del acumulador.', en: '0 + 1 + 4 + 9 + 16 = 30. The final <code>0</code> is the accumulator’s starting value.' },
        },
        {
          type: 'choice',
          prompt: { es: 'La trampa clásica. ¿Qué regresa?', en: 'The classic trap. What does it return?' },
          code: '[10, 9, 1].sort()',
          options: ['<code>[1, 9, 10]</code>', '<code>[1, 10, 9]</code>', '<code>[10, 9, 1]</code>'],
          answer: 1,
          why: {
            0: {
              es: 'Eso esperarías… pero sin función, <code>sort</code> ordena como <b>textos</b>: "10" va antes que "9" porque "1" &lt; "9".',
              en: 'That’s what you’d expect… but without a function, <code>sort</code> orders as <b>strings</b>: "10" comes before "9" because "1" &lt; "9".',
            },
          },
          explain: {
            es: 'Para números siempre pásale cómo comparar: <code>nums.sort((a, b) => a - b)</code>. Ojo: <code>sort</code> sí cambia el array original.',
            en: 'For numbers always tell it how to compare: <code>nums.sort((a, b) => a - b)</code>. Careful: <code>sort</code> does change the original array.',
          },
        },
        {
          type: 'fill',
          prompt: { es: 'Quieres un array con solo los nombres. ¿Qué método va?', en: 'You want an array with only the names. Which method goes here?' },
          code: 'const names = users.[[0]](u => u.name);',
          chips: ['map', 'filter', 'forEach'],
          answers: ['map'],
          hint: { es: 'Cada usuario se convierte en otra cosa (su nombre), y quieres el array resultante.', en: 'Each user turns into something else (its name), and you want the resulting array.' },
          explain: {
            es: '<code>map</code> transforma uno a uno. <code>forEach</code> también recorre, pero regresa <code>undefined</code>: sirve para hacer algo, no para construir un array.',
            en: '<code>map</code> transforms one by one. <code>forEach</code> also loops, but returns <code>undefined</code>: it’s for doing something, not for building an array.',
          },
        },
        {
          type: 'code',
          prompt: {
            es: 'Escribe <code>totalPrice(cart)</code>: suma <code>price * qty</code> de cada producto. Con <code>reduce</code> sale en una línea.',
            en: 'Write <code>totalPrice(cart)</code>: add up <code>price * qty</code> for each item. With <code>reduce</code> it’s one line.',
          },
          fnName: 'totalPrice',
          starter: 'function totalPrice(cart) {\n  \n}\n',
          tests: [
            { args: [[{ price: 10, qty: 2 }, { price: 5, qty: 1 }]], expect: 25 },
            { args: [[]], expect: 0 },
            { args: [[{ price: 3, qty: 3 }]], expect: 9 },
          ],
          hint: { es: '<code>return cart.reduce((sum, item) => sum + item.price * item.qty, 0);</code> ¿Qué pasa con el carrito vacío si olvidas el <code>0</code>?', en: '<code>return cart.reduce((sum, item) => sum + item.price * item.qty, 0);</code> What happens with an empty cart if you forget the <code>0</code>?' },
          solution: 'function totalPrice(cart) {\n  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);\n}',
          explain: {
            es: 'Sin el valor inicial <code>0</code>, <code>reduce</code> sobre un array vacío lanza error. Ponlo siempre.',
            en: 'Without the initial <code>0</code>, <code>reduce</code> on an empty array throws. Always include it.',
          },
        },
      ],
    },
    {
      id: 'collections',
      unit: 2,
      icon: '🗺️',
      title: { es: 'Map, Set y desestructuración', en: 'Map, Set and destructuring' },
      blurb: { es: 'Valores únicos, llaves de cualquier tipo y sacar cosas rápido', en: 'Unique values, keys of any type and unpacking fast' },
      more: [
        { title: { es: 'Map y Set', en: 'Map and Set' }, url: 'https://javascript.info/map-set' },
        { title: { es: 'Desestructuración', en: 'Destructuring assignment' }, url: 'https://javascript.info/destructuring-assignment' },
      ],
      steps: [
        {
          type: 'read',
          title: { es: 'Dos colecciones con superpoderes', en: 'Two collections with superpowers' },
          code: "const seen = new Set();\nseen.add('a');\nseen.has('a'); // true\n\nconst ages = new Map();\nages.set('Salsa', 3);\nages.get('Salsa'); // 3",
          body: {
            es: '<p>Un <b>Set</b> guarda valores sin repetir. Un <b>Map</b> guarda pares llave → valor, y la llave puede ser de cualquier tipo, hasta un objeto.</p><p>Los dos buscan en <b>un paso</b> (<code>has</code>, <code>get</code>): eso los hace oro en entrevistas.</p>',
            en: '<p>A <b>Set</b> stores values without repeats. A <b>Map</b> stores key → value pairs, and the key can be any type, even an object.</p><p>Both look things up in <b>one step</b> (<code>has</code>, <code>get</code>): that makes them gold in interviews.</p>',
          },
        },
        {
          type: 'choice',
          prompt: { es: '¿Cuántos valores guarda?', en: 'How many values does it hold?' },
          code: 'new Set([1, 1, 2, 3, 3]).size',
          options: ['<code>5</code>', '<code>3</code>', '<code>2</code>'],
          answer: 1,
          explain: { es: 'Los repetidos se ignoran: quedan 1, 2 y 3.', en: 'Repeats are ignored: 1, 2 and 3 remain.' },
        },
        {
          type: 'choice',
          prompt: { es: 'Un truco para quitar repetidos:', en: 'A trick to remove duplicates:' },
          code: "[...new Set('hello')].join('')",
          options: ["<code>'hello'</code>", "<code>'helo'</code>", "<code>'hel'</code>"],
          answer: 1,
          explain: {
            es: 'Un texto se recorre letra por letra: el Set guarda h, e, l, o (la segunda l se ignora) y en el orden en que aparecieron.',
            en: 'A string is walked letter by letter: the Set keeps h, e, l, o (the second l is ignored), in the order they first appeared.',
          },
        },
        {
          type: 'choice',
          prompt: { es: 'Desestructuración de arrays. ¿Qué vale <code>b</code>?', en: 'Array destructuring. What is <code>b</code>?' },
          code: 'const [a, , b] = [1, 2, 3];\nb',
          options: ['<code>2</code>', '<code>3</code>', '<code>undefined</code>'],
          answer: 1,
          why: {
            0: { es: 'La coma vacía <b>se salta</b> un lugar: el 2 no se guarda en nadie.', en: 'The empty comma <b>skips</b> a spot: 2 isn’t stored anywhere.' },
          },
          explain: { es: 'Cada posición de la izquierda toma la misma posición de la derecha. La coma sola se salta el 2.', en: 'Each position on the left takes the same position on the right. The lone comma skips 2.' },
        },
        {
          type: 'choice',
          prompt: { es: 'Con objetos y un valor por defecto. ¿Qué vale <code>age</code>?', en: 'With objects and a default. What is <code>age</code>?' },
          code: "const { name, age = 5 } = { name: 'Salsa' };\nage",
          options: ['<code>undefined</code>', '<code>5</code>', { es: 'Error', en: 'An error' }],
          answer: 1,
          explain: {
            es: 'Sacas propiedades por nombre. Como el objeto no trae <code>age</code>, se usa el defecto. Lo verás muchísimo en props de React: <code>function Card({ title, size = \'md\' })</code>.',
            en: 'You pull properties out by name. Since the object has no <code>age</code>, the default is used. You’ll see this all the time in React props: <code>function Card({ title, size = \'md\' })</code>.',
          },
        },
        {
          type: 'choice',
          prompt: { es: 'Intercambiar sin variable extra. ¿Qué vale <code>x</code>?', en: 'Swapping without an extra variable. What is <code>x</code>?' },
          code: 'let x = 1, y = 2;\n[x, y] = [y, x];\nx',
          options: ['<code>1</code>', '<code>2</code>'],
          answer: 1,
          explain: {
            es: 'Primero se arma el array <code>[2, 1]</code> y luego se reparte: <code>x = 2</code>, <code>y = 1</code>. Te va a servir en algoritmos que intercambian posiciones.',
            en: 'First the array <code>[2, 1]</code> is built, then unpacked: <code>x = 2</code>, <code>y = 1</code>. Handy in algorithms that swap positions.',
          },
        },
        {
          type: 'code',
          prompt: {
            es: 'Escribe <code>firstDuplicate(nums)</code>: regresa el primer número que aparece por segunda vez, o <code>null</code> si no se repite ninguno. Usa un Set.',
            en: 'Write <code>firstDuplicate(nums)</code>: return the first number that shows up a second time, or <code>null</code> if none repeat. Use a Set.',
          },
          fnName: 'firstDuplicate',
          starter: 'function firstDuplicate(nums) {\n  const seen = new Set();\n  \n  return null;\n}\n',
          tests: [
            { args: [[2, 1, 3, 1, 2]], expect: 1 },
            { args: [[1, 2, 3]], expect: null },
            { args: [[5, 5]], expect: 5 },
            { args: [[]], expect: null },
          ],
          hint: {
            es: 'Recorre con <code>for (const n of nums)</code>: si <code>seen.has(n)</code>, ya lo viste, así que regrésalo. Si no, <code>seen.add(n)</code>.',
            en: 'Loop with <code>for (const n of nums)</code>: if <code>seen.has(n)</code>, you’ve seen it, so return it. Otherwise <code>seen.add(n)</code>.',
          },
          solution: 'function firstDuplicate(nums) {\n  const seen = new Set();\n  for (const n of nums) {\n    if (seen.has(n)) return n;\n    seen.add(n);\n  }\n  return null;\n}',
          explain: {
            es: 'Una vuelta y búsquedas de un paso: O(n). Con dos loops anidados sería O(n²). Este patrón, "¿ya lo vi?", es la base de muchos problemas de entrevista.',
            en: 'One pass with one-step lookups: O(n). With two nested loops it would be O(n²). This "have I seen it?" pattern is the base of many interview problems.',
          },
        },
      ],
    },

    // ═══════════════════════ Unidad 4 · Funciones avanzadas ═══════════════════════
    {
      id: 'closures',
      unit: 3,
      icon: '🎒',
      title: { es: 'Closures: la mochila', en: 'Closures: the backpack' },
      blurb: { es: 'Funciones que recuerdan dónde nacieron', en: 'Functions that remember where they were born' },
      more: [{ title: { es: 'Closures', en: 'Variable scope, closure' }, url: 'https://javascript.info/closure' }],
      steps: [
        {
          type: 'read',
          title: { es: 'Una mochila con lo de su casa', en: 'A backpack with stuff from home' },
          code: 'function makeCounter() {\n  let count = 0;\n  return () => ++count;\n}',
          body: {
            es: '<p>Cuando una función nace dentro de otra, se lleva una <b>mochila</b> con las variables de donde nació. Aunque la función de afuera ya terminó, la de adentro sigue pudiendo usarlas.</p><p>A eso se le llama <b>closure</b>.</p>',
            en: '<p>When a function is born inside another, it takes a <b>backpack</b> with the variables from where it was born. Even after the outer function finishes, the inner one can still use them.</p><p>That’s called a <b>closure</b>.</p>',
          },
        },
        {
          type: 'choice',
          prompt: { es: '¿Qué regresa la tercera llamada?', en: 'What does the third call return?' },
          code: 'const c = makeCounter();\nc();\nc();\nc()',
          options: ['<code>1</code>', '<code>3</code>', '<code>0</code>'],
          answer: 1,
          why: {
            0: { es: '<code>count</code> no se reinicia: vive en la mochila de <code>c</code> y cada llamada lo sube.', en: '<code>count</code> doesn’t reset: it lives in <code>c</code>’s backpack and each call bumps it.' },
          },
          explain: { es: '<code>makeCounter</code> ya terminó, pero <code>count</code> sigue vivo en la mochila: 1, 2, 3.', en: '<code>makeCounter</code> is done, but <code>count</code> lives on in the backpack: 1, 2, 3.' },
        },
        {
          type: 'choice',
          prompt: { es: 'Dos contadores. ¿Qué regresa <code>b()</code>?', en: 'Two counters. What does <code>b()</code> return?' },
          code: 'const a = makeCounter();\nconst b = makeCounter();\na();\na();\nb()',
          options: ['<code>1</code>', '<code>3</code>'],
          answer: 0,
          explain: {
            es: 'Cada llamada a <code>makeCounter</code> crea su <b>propia</b> mochila con su propio <code>count</code>. Así se hacen variables privadas en JavaScript.',
            en: 'Each call to <code>makeCounter</code> creates its <b>own</b> backpack with its own <code>count</code>. That’s how you make private variables in JavaScript.',
          },
        },
        {
          type: 'choice',
          prompt: { es: 'La pregunta de entrevista del <code>var</code> en un loop:', en: 'The interview question about <code>var</code> in a loop:' },
          code: 'const fns = [];\nfor (var i = 0; i < 3; i++) {\n  fns.push(() => i);\n}\nfns[0]()',
          options: ['<code>0</code>', '<code>3</code>', '<code>undefined</code>'],
          answer: 1,
          why: {
            0: {
              es: 'Eso pasaría con <code>let</code>. Con <code>var</code> hay <b>una sola</b> <code>i</code> para todo el loop, y al final vale 3.',
              en: 'That’s what <code>let</code> would give. With <code>var</code> there’s <b>a single</b> <code>i</code> for the whole loop, and it ends at 3.',
            },
          },
          explain: {
            es: 'Las tres flechas comparten la misma mochila con la misma <code>i</code>. Con <code>let</code>, cada vuelta crea una <code>i</code> nueva y <code>fns[0]()</code> daría 0. Otra razón para no usar <code>var</code>.',
            en: 'All three arrows share the same backpack with the same <code>i</code>. With <code>let</code>, each lap creates a fresh <code>i</code> and <code>fns[0]()</code> would give 0. Another reason to skip <code>var</code>.',
          },
        },
        {
          type: 'code',
          prompt: {
            es: 'Escribe <code>once(fn)</code>: regresa una función que llama a <code>fn</code> solo la <b>primera</b> vez; las siguientes regresa el mismo resultado sin volver a llamarla.',
            en: 'Write <code>once(fn)</code>: return a function that calls <code>fn</code> only the <b>first</b> time; after that it returns the same result without calling it again.',
          },
          fnName: 'once',
          wrap: '(a, b) => { let calls = 0; const add = (x, y) => { calls++; return x + y; }; const f = once(add); return [f(a, b), f(10, 10), calls]; }',
          starter: 'function once(fn) {\n  let called = false;\n  let result;\n  return (...args) => {\n    \n  };\n}\n',
          tests: [
            { args: [1, 2], expect: [3, 3, 1], label: 'f = once(add); [f(1, 2), f(10, 10), veces que corrió add]' },
            { args: [5, 5], expect: [10, 10, 1], label: 'f = once(add); [f(5, 5), f(10, 10), veces que corrió add]' },
          ],
          hint: {
            es: 'Dentro de la flecha: si <code>!called</code>, marca <code>called = true</code> y guarda <code>result = fn(...args)</code>. Al final, siempre <code>return result</code>.',
            en: 'Inside the arrow: if <code>!called</code>, set <code>called = true</code> and store <code>result = fn(...args)</code>. At the end, always <code>return result</code>.',
          },
          solution:
            'function once(fn) {\n  let called = false;\n  let result;\n  return (...args) => {\n    if (!called) {\n      called = true;\n      result = fn(...args);\n    }\n    return result;\n  };\n}',
          explain: {
            es: '<code>called</code> y <code>result</code> viven en la mochila de la función que regresas. Así funcionan <code>once</code>, <code>memoize</code> y <code>debounce</code>, que también salen en entrevistas.',
            en: '<code>called</code> and <code>result</code> live in the returned function’s backpack. That’s how <code>once</code>, <code>memoize</code> and <code>debounce</code> work, and those show up in interviews too.',
          },
        },
      ],
    },

    // ═══════════════════════ Unidad 5 · Clases ═══════════════════════
    {
      id: 'classes',
      unit: 4,
      icon: '🧬',
      title: { es: 'Prototipos y clases', en: 'Prototypes and classes' },
      blurb: { es: 'class, new, extends y el prototipo compartido', en: 'class, new, extends and the shared prototype' },
      more: [
        { title: { es: 'Clases', en: 'Classes' }, url: 'https://javascript.info/class' },
        { title: { es: 'Herencia por prototipos', en: 'Prototypal inheritance' }, url: 'https://javascript.info/prototype-inheritance' },
      ],
      steps: [
        {
          type: 'read',
          title: { es: 'Un molde para hacer objetos', en: 'A mold for making objects' },
          code: "class Dog {\n  constructor(name) {\n    this.name = name;\n  }\n  hi() {\n    return 'guau, soy ' + this.name;\n  }\n}\nconst salsa = new Dog('Salsa');",
          body: {
            es: '<p>Una <b>clase</b> es un molde. <code>new Dog(\'Salsa\')</code> crea un objeto y corre el <code>constructor</code> con <code>this</code> apuntando al objeto nuevo.</p><p>Los métodos como <code>hi</code> no se copian a cada perro: viven en un solo lugar compartido, el <b>prototipo</b>.</p>',
            en: '<p>A <b>class</b> is a mold. <code>new Dog(\'Salsa\')</code> creates an object and runs the <code>constructor</code> with <code>this</code> pointing at the new object.</p><p>Methods like <code>hi</code> aren’t copied to each dog: they live in one shared place, the <b>prototype</b>.</p>',
          },
        },
        {
          type: 'choice',
          prompt: { es: '¿Qué regresa?', en: 'What does it return?' },
          code: "new Dog('Salsa').hi()",
          options: ["<code>'guau, soy Salsa'</code>", "<code>'guau, soy undefined'</code>", { es: 'Error', en: 'An error' }],
          answer: 0,
          explain: { es: 'El constructor guardó <code>name</code> en el objeto nuevo, y <code>hi</code> lo lee con <code>this</code>.', en: 'The constructor stored <code>name</code> on the new object, and <code>hi</code> reads it with <code>this</code>.' },
        },
        {
          type: 'choice',
          prompt: { es: 'Dos perros. ¿Comparten el mismo método?', en: 'Two dogs. Do they share the same method?' },
          code: "const a = new Dog('A');\nconst b = new Dog('B');\na.hi === b.hi",
          options: ['<code>true</code>', '<code>false</code>'],
          answer: 0,
          why: {
            1: { es: 'Si cada perro tuviera su copia sería <code>false</code>, pero <code>hi</code> vive una sola vez en <code>Dog.prototype</code>.', en: 'If each dog had its own copy it would be <code>false</code>, but <code>hi</code> lives once on <code>Dog.prototype</code>.' },
          },
          explain: {
            es: 'Cuando pides <code>a.hi</code>, JavaScript no lo encuentra en <code>a</code> y sube a su prototipo. Mil perros comparten un solo <code>hi</code>.',
            en: 'When you ask for <code>a.hi</code>, JavaScript doesn’t find it on <code>a</code> and climbs to its prototype. A thousand dogs share one <code>hi</code>.',
          },
        },
        {
          type: 'choice',
          prompt: { es: 'Una curiosidad. ¿Qué devuelve?', en: 'A curiosity. What does it return?' },
          code: 'typeof Dog',
          options: ["<code>'class'</code>", "<code>'object'</code>", "<code>'function'</code>"],
          answer: 2,
          explain: {
            es: 'Por dentro, una clase es una función especial con su prototipo. <code>class</code> es una forma más bonita de escribir lo que JavaScript ya hacía con prototipos.',
            en: 'Under the hood, a class is a special function with its prototype. <code>class</code> is a nicer way to write what JavaScript already did with prototypes.',
          },
        },
        {
          type: 'choice',
          prompt: { es: 'Herencia con <code>extends</code>. ¿Qué regresa?', en: 'Inheritance with <code>extends</code>. What does it return?' },
          code: "class Galgo extends Dog {\n  hi() {\n    return super.hi() + ' y corro rápido';\n  }\n}\nnew Galgo('Salsa').hi()",
          options: ["<code>'guau, soy Salsa y corro rápido'</code>", "<code>' y corro rápido'</code>", { es: 'Error: no tiene constructor', en: 'Error: it has no constructor' }],
          answer: 0,
          why: {
            2: { es: 'Si no escribes constructor, la clase hija usa el del padre automáticamente.', en: 'If you don’t write a constructor, the child class uses the parent’s automatically.' },
          },
          explain: {
            es: '<code>super.hi()</code> llama a la versión del padre y la extiende. <code>Galgo</code> hereda el constructor de <code>Dog</code>, así que el nombre se guarda igual.',
            en: '<code>super.hi()</code> calls the parent’s version and extends it. <code>Galgo</code> inherits <code>Dog</code>’s constructor, so the name is stored the same way.',
          },
        },
        {
          type: 'code',
          prompt: {
            es: 'Escribe la clase <code>Stack</code> (pila): <code>push(x)</code> agrega arriba, <code>pop()</code> saca y regresa el de arriba, <code>peek()</code> lo regresa sin sacarlo y <code>size()</code> dice cuántos hay.',
            en: 'Write the <code>Stack</code> class: <code>push(x)</code> adds on top, <code>pop()</code> removes and returns the top, <code>peek()</code> returns it without removing and <code>size()</code> says how many there are.',
          },
          fnName: 'Stack',
          wrap: "(ops) => { const s = new Stack(); const out = []; for (const [op, v] of ops) { if (op === 'push') s.push(v); else out.push(s[op]() ?? null); } return out; }",
          starter: 'class Stack {\n  constructor() {\n    this.items = [];\n  }\n  push(x) {\n    \n  }\n  pop() {\n    \n  }\n  peek() {\n    \n  }\n  size() {\n    \n  }\n}\n',
          tests: [
            { args: [[['push', 1], ['push', 2], ['peek'], ['pop'], ['size']]], expect: [2, 2, 1], label: 'push 1, push 2 → [peek(), pop(), size()]' },
            { args: [[['size'], ['pop']]], expect: [0, null], label: 'vacía → [size(), pop()]' },
            { args: [[['push', 'a'], ['pop'], ['peek']]], expect: ['a', null], label: "push 'a' → [pop(), peek()]" },
          ],
          hint: {
            es: 'Usa el array de adentro: <code>this.items.push(x)</code>, <code>this.items.pop()</code>, <code>this.items[this.items.length - 1]</code> y <code>this.items.length</code>.',
            en: 'Use the inner array: <code>this.items.push(x)</code>, <code>this.items.pop()</code>, <code>this.items[this.items.length - 1]</code> and <code>this.items.length</code>.',
          },
          solution:
            'class Stack {\n  constructor() {\n    this.items = [];\n  }\n  push(x) {\n    this.items.push(x);\n  }\n  pop() {\n    return this.items.pop();\n  }\n  peek() {\n    return this.items[this.items.length - 1];\n  }\n  size() {\n    return this.items.length;\n  }\n}',
          explain: {
            es: 'Acabas de construir una estructura de datos de entrevista. Las pilas resuelven paréntesis balanceados, deshacer/rehacer y DFS.',
            en: 'You just built an interview data structure. Stacks solve balanced parentheses, undo/redo and DFS.',
          },
        },
      ],
    },

    // ═══════════════════════ Unidad 6 · Errores y async ═══════════════════════
    {
      id: 'errors',
      unit: 5,
      icon: '🚨',
      title: { es: 'try, catch y finally', en: 'try, catch and finally' },
      blurb: { es: 'Atrapar errores sin que se caiga todo', en: 'Catching errors without everything crashing' },
      more: [{ title: { es: 'Manejo de errores', en: 'Error handling, "try...catch"' }, url: 'https://javascript.info/try-catch' }],
      steps: [
        {
          type: 'read',
          title: { es: 'Una red debajo del trapecio', en: 'A net under the trapeze' },
          code: "try {\n  riskyThing();\n} catch (error) {\n  console.log('falló:', error.message);\n} finally {\n  console.log('esto corre siempre');\n}",
          body: {
            es: '<p>Si algo dentro de <code>try</code> lanza un error, JavaScript salta directo al <code>catch</code> en lugar de tronar todo.</p><p><code>finally</code> corre <b>siempre</b>, haya error o no: ahí va lo de "limpiar", como cerrar un archivo o quitar un spinner.</p>',
            en: '<p>If something inside <code>try</code> throws, JavaScript jumps straight to <code>catch</code> instead of crashing everything.</p><p><code>finally</code> <b>always</b> runs, error or not: that’s where cleanup goes, like closing a file or hiding a spinner.</p>',
          },
        },
        {
          type: 'choice',
          prompt: { es: '¿Qué se imprime?', en: 'What gets printed?' },
          code: "try {\n  JSON.parse('{bad json}');\n  console.log('A');\n} catch (e) {\n  console.log('B');\n} finally {\n  console.log('C');\n}",
          options: ['<code>A C</code>', '<code>B C</code>', '<code>A B C</code>', '<code>B</code>'],
          answer: 1,
          why: {
            0: { es: '<code>JSON.parse</code> lanza antes de llegar a la A: el resto del <code>try</code> se salta.', en: '<code>JSON.parse</code> throws before reaching A: the rest of the <code>try</code> is skipped.' },
            3: { es: 'Falta algo: <code>finally</code> corre siempre.', en: 'Something’s missing: <code>finally</code> always runs.' },
          },
          explain: { es: 'Error en el <code>try</code> → salta al <code>catch</code> (B) → <code>finally</code> (C).', en: 'Error in <code>try</code> → jump to <code>catch</code> (B) → <code>finally</code> (C).' },
        },
        {
          type: 'choice',
          prompt: { es: '¿Qué tipo de error es?', en: 'What kind of error is it?' },
          code: 'let kind;\ntry {\n  null.x;\n} catch (e) {\n  kind = e.name;\n}\nkind',
          options: ["<code>'TypeError'</code>", "<code>'ReferenceError'</code>", "<code>'SyntaxError'</code>"],
          answer: 0,
          why: {
            1: { es: '<code>ReferenceError</code> es cuando usas una variable que no existe. Aquí <code>null</code> sí existe; lo que no se puede es leerle propiedades.', en: '<code>ReferenceError</code> is for using a variable that doesn’t exist. Here <code>null</code> exists; you just can’t read properties from it.' },
          },
          explain: {
            es: 'Leer una propiedad de <code>null</code> o <code>undefined</code> es un <code>TypeError</code>: el error más común de JavaScript. Ya conoces la vacuna: <code>?.</code>.',
            en: 'Reading a property of <code>null</code> or <code>undefined</code> is a <code>TypeError</code>: JavaScript’s most common error. You already know the vaccine: <code>?.</code>.',
          },
        },
        {
          type: 'choice',
          prompt: { es: '<code>return</code> dentro de <code>try</code>, con <code>finally</code>. ¿Qué pasa al llamar <code>f()</code>?', en: '<code>return</code> inside <code>try</code>, with <code>finally</code>. What happens when you call <code>f()</code>?' },
          code: "function f() {\n  try {\n    return 'try';\n  } finally {\n    console.log('finally');\n  }\n}\nf()",
          options: [
            { es: "Regresa <code>'try'</code> y no imprime nada", en: "It returns <code>'try'</code> and prints nothing" },
            { es: "Imprime <code>finally</code> y regresa <code>'try'</code>", en: "It prints <code>finally</code> and returns <code>'try'</code>" },
            { es: 'Imprime <code>finally</code> y regresa <code>undefined</code>', en: 'It prints <code>finally</code> and returns <code>undefined</code>' },
          ],
          answer: 1,
          why: {
            0: { es: 'Ni un <code>return</code> se salta el <code>finally</code>: corre justo antes de salir de la función.', en: 'Not even a <code>return</code> skips <code>finally</code>: it runs right before leaving the function.' },
          },
          explain: { es: 'El <code>return</code> prepara el valor, corre el <code>finally</code> y después sale con <code>\'try\'</code>.', en: 'The <code>return</code> prepares the value, <code>finally</code> runs, and then it leaves with <code>\'try\'</code>.' },
        },
        {
          type: 'code',
          prompt: {
            es: 'Escribe <code>safeParse(text, fallback)</code>: regresa <code>JSON.parse(text)</code>, o <code>fallback</code> si el texto no es JSON válido.',
            en: 'Write <code>safeParse(text, fallback)</code>: return <code>JSON.parse(text)</code>, or <code>fallback</code> if the text isn’t valid JSON.',
          },
          fnName: 'safeParse',
          starter: 'function safeParse(text, fallback) {\n  \n}\n',
          tests: [
            { args: ['{"a":1}', null], expect: { a: 1 } },
            { args: ['{bad', null], expect: null },
            { args: ['[1,2]', []], expect: [1, 2] },
            { args: ['', 'vacío'], expect: 'vacío' },
          ],
          hint: { es: '<code>try { return JSON.parse(text); } catch { return fallback; }</code>', en: '<code>try { return JSON.parse(text); } catch { return fallback; }</code>' },
          solution: 'function safeParse(text, fallback) {\n  try {\n    return JSON.parse(text);\n  } catch {\n    return fallback;\n  }\n}',
          explain: {
            es: 'Puedes escribir <code>catch</code> sin <code>(error)</code> cuando no necesitas el error. Esta función la vas a usar en serio cada vez que leas datos de <code>localStorage</code> o de una API.',
            en: 'You can write <code>catch</code> without <code>(error)</code> when you don’t need the error. You’ll use this for real every time you read data from <code>localStorage</code> or an API.',
          },
        },
      ],
    },
    {
      id: 'async',
      unit: 5,
      icon: '⏳',
      title: { es: 'Promesas y el event loop', en: 'Promises and the event loop' },
      blurb: { es: 'En qué orden corre el código asíncrono', en: 'The order async code runs in' },
      more: [
        { title: { es: 'Promesas', en: 'Promise basics' }, url: 'https://javascript.info/promise-basics' },
        { title: { es: 'async/await', en: 'Async/await' }, url: 'https://javascript.info/async-await' },
        { title: { es: 'El event loop', en: 'Event loop' }, url: 'https://javascript.info/event-loop' },
      ],
      steps: [
        {
          type: 'read',
          title: { es: 'La fila del restaurante', en: 'The restaurant line' },
          body: {
            es: '<p>JavaScript atiende una cosa a la vez. El orden es:</p><p>1. Todo el código normal, de arriba abajo.<br>2. La fila VIP: las <b>promesas</b> (<code>.then</code>, lo que sigue de un <code>await</code>).<br>3. La fila normal: <code>setTimeout</code>, clics, etc.</p><p>Aunque un <code>setTimeout</code> diga 0 ms, siempre espera a que se vacíe la fila VIP.</p>',
            en: '<p>JavaScript serves one thing at a time. The order is:</p><p>1. All the regular code, top to bottom.<br>2. The VIP line: <b>promises</b> (<code>.then</code>, whatever follows an <code>await</code>).<br>3. The regular line: <code>setTimeout</code>, clicks, etc.</p><p>Even if a <code>setTimeout</code> says 0 ms, it always waits for the VIP line to empty.</p>',
          },
        },
        {
          type: 'choice',
          prompt: { es: 'La pregunta de entrevista más clásica de async. ¿En qué orden se imprime?', en: 'The most classic async interview question. In what order does it print?' },
          code: "console.log('A');\nsetTimeout(() => console.log('B'), 0);\nPromise.resolve().then(() => console.log('C'));\nconsole.log('D');",
          options: ['<code>A B C D</code>', '<code>A D B C</code>', '<code>A D C B</code>', '<code>A C D B</code>'],
          answer: 2,
          why: {
            0: { es: 'B y C no corren en su línea: se forman en sus filas. Primero termina todo el código normal (A y D).', en: 'B and C don’t run on their line: they queue up. All the regular code (A and D) finishes first.' },
            1: { es: 'Casi: la promesa (C) está en la fila VIP, así que pasa antes que el <code>setTimeout</code> (B).', en: 'Close: the promise (C) is in the VIP line, so it goes before the <code>setTimeout</code> (B).' },
            3: { es: 'El <code>.then</code> nunca interrumpe al código normal: D se imprime antes que C.', en: '<code>.then</code> never interrupts regular code: D prints before C.' },
          },
          explain: { es: 'Código normal (A, D) → fila VIP de promesas (C) → fila normal de timers (B).', en: 'Regular code (A, D) → VIP promise line (C) → regular timer line (B).' },
        },
        {
          type: 'order',
          prompt: {
            es: 'Con <code>async/await</code>. Ordena lo que se imprime, de primero a último.',
            en: 'With <code>async/await</code>. Put what gets printed in order, first to last.',
          },
          pre: "async function f() {\n  console.log('1');\n  await null;\n  console.log('2');\n}\nf();\nconsole.log('3');\n// Se imprime:",
          lines: ['1', '3', '2'],
          seed: 4,
          explain: {
            es: 'Lo de antes del <code>await</code> corre de inmediato (1). El <code>await</code> pausa la función y manda el resto a la fila VIP; mientras, sigue el código normal (3). Después regresa (2).',
            en: 'Everything before <code>await</code> runs right away (1). <code>await</code> pauses the function and sends the rest to the VIP line; meanwhile regular code continues (3). Then it comes back (2).',
          },
        },
        {
          type: 'choice',
          prompt: { es: '¿Qué tipo de valor regresa?', en: 'What kind of value does it return?' },
          code: 'async function get() {\n  return 7;\n}\ntypeof get()',
          options: ["<code>'number'</code>", "<code>'object'</code>", "<code>'function'</code>"],
          answer: 1,
          why: {
            0: { es: 'Adentro regresas 7, pero una función <code>async</code> siempre envuelve su resultado en una <b>promesa</b>.', en: 'Inside you return 7, but an <code>async</code> function always wraps its result in a <b>promise</b>.' },
          },
          explain: {
            es: '<code>get()</code> regresa una promesa (un objeto). Para obtener el 7 necesitas <code>await get()</code> o <code>get().then(x => …)</code>. Olvidar el <code>await</code> es un bug clásico.',
            en: '<code>get()</code> returns a promise (an object). To get the 7 you need <code>await get()</code> or <code>get().then(x => …)</code>. Forgetting <code>await</code> is a classic bug.',
          },
        },
        {
          type: 'choice',
          prompt: { es: 'Encadenando promesas. ¿Qué se imprime?', en: 'Chaining promises. What gets printed?' },
          code: 'Promise.resolve(5)\n  .then(x => x * 2)\n  .then(x => x + 1)\n  .then(x => console.log(x));',
          options: ['<code>5</code>', '<code>10</code>', '<code>11</code>', '<code>12</code>'],
          answer: 2,
          explain: {
            es: 'Cada <code>.then</code> recibe lo que regresó el anterior: 5 → 10 → 11. Es la misma idea que una cadena de <code>map</code>, pero con valores que llegan después.',
            en: 'Each <code>.then</code> gets what the previous one returned: 5 → 10 → 11. Same idea as a chain of <code>map</code>s, but with values that arrive later.',
          },
        },
      ],
    },
  );
})();
