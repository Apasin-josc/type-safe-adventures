// ACT I · JavaScript Under the Hood
// All of the course content lives here as data. The app (app/app.js) only renders it.
//
// Step types in a lesson:
//   predict → "what does this print?" question BEFORE explaining (Socratic method)
//   think   → open question; you write your answer and then compare
//   text    → explanation
//   code    → code example
//   analogy → geek analogy
//   viz     → step-by-step animation
//   dsa     → why it matters in interviews
//   links   → for researching on your own
(function (root) {
  'use strict';

  const MDN = 'https://developer.mozilla.org/en-US/docs/';
  const JSI = 'https://javascript.info/';

  // ───────────────────────────── M1 · TYPES ─────────────────────────────
  const m1 = {
    id: 'm1',
    dir: 'm1-types',
    title: 'Types and coercion',
    tagline: 'What JavaScript does with your values when you’re not looking.',
    zone: 'Type Meadow',
    mob: { sprite: 'slime', name: 'Slime NaN' },
    bossMob: { name: 'Coercion King Slime' },
    lessons: [
      {
        title: 'typeof and the 7 primitives',
        steps: [
          {
            type: 'predict',
            q: 'Before reading anything: what does this print?',
            code: 'console.log(typeof null);',
            options: ['"null"', '"object"', '"undefined"', 'TypeError'],
            answer: 1,
            why: 'It’s a bug from the very first version of JavaScript (1995) that could never be fixed because it would break millions of sites. <code>null</code> is NOT an object, but <code>typeof</code> lies. That’s why you compare directly: <code>x === null</code>.',
          },
          {
            type: 'text',
            html: `<p>JavaScript has <strong>7 primitive types</strong>. Everything else is an object.</p>
<table>
<tr><th>Primitive</th><th>Example</th><th>typeof</th></tr>
<tr><td>string</td><td><code>"hola"</code></td><td><code>"string"</code></td></tr>
<tr><td>number</td><td><code>42</code>, <code>3.14</code>, <code>NaN</code>, <code>Infinity</code></td><td><code>"number"</code></td></tr>
<tr><td>bigint</td><td><code>10n</code></td><td><code>"bigint"</code></td></tr>
<tr><td>boolean</td><td><code>true</code></td><td><code>"boolean"</code></td></tr>
<tr><td>undefined</td><td><code>undefined</code></td><td><code>"undefined"</code></td></tr>
<tr><td>symbol</td><td><code>Symbol("id")</code></td><td><code>"symbol"</code></td></tr>
<tr><td>null</td><td><code>null</code></td><td><code>"object"</code> 🐛</td></tr>
</table>
<p>Objects (arrays, functions, dates, Map, Set…) give <code>"object"</code>, except functions, which give <code>"function"</code>.</p>
<p>Primitives are <strong>immutable</strong>: you can’t change a string, only create a new one. Hold on to that fact, it comes back in lesson 3.</p>`,
          },
          {
            type: 'predict',
            q: 'NaN means "Not a Number". So…',
            code: 'console.log(typeof NaN);\nconsole.log(NaN === NaN);',
            options: ['"NaN" and true', '"number" and true', '"number" and false', '"undefined" and false'],
            answer: 2,
            why: '<code>NaN</code> is a value of type number: it’s what failed numeric operations return (<code>0 / 0</code>, <code>Number("abc")</code>). And it’s the <strong>only value in JS that isn’t equal to itself</strong>. To detect it: <code>Number.isNaN(x)</code>.',
          },
          {
            type: 'code',
            caption: 'The reliable checks you’ll actually use:',
            code: `x === null              // is it null?
Array.isArray(x)        // is it an array? (typeof [] gives "object")
Number.isNaN(x)         // is it NaN?
Number.isInteger(x)     // is it an integer?
typeof x === "function" // can it be called?`,
          },
          {
            type: 'think',
            q: 'You’re given a value <code>x</code> that can be an array or a plain object. <code>typeof</code> gives "object" for both. How do you tell them apart, and why do you think <code>typeof</code> isn’t enough?',
            a: '<code>Array.isArray(x)</code>. An array IS an object (with keys "0", "1", "2"… and a special <code>length</code> property), which is why <code>typeof</code> can’t see the difference. This shows up literally in your first exercise.',
          },
          {
            type: 'analogy',
            title: 'Your RPG party',
            html: 'The 7 primitives are the game’s <strong>base classes</strong>: warrior, mage, archer… each character has exactly one class and can’t change it. Objects are the <strong>inventory</strong>: a bag you stuff everything into, including other bags. And <code>typeof null</code> is that bugged NPC who claims to be a merchant but sells nothing: everyone knows it’s broken and nobody can patch it.',
          },
          {
            type: 'dsa',
            html: `<p>Three number-type traps that come up in interviews:</p>
<ul>
<li><strong>Every number is a 64-bit float.</strong> <code>0.1 + 0.2</code> gives <code>0.30000000000000004</code>. Never compare decimals with <code>===</code>.</li>
<li><strong>There’s no integer division.</strong> <code>7 / 2</code> is <code>3.5</code>. For the midpoint in binary search: <code>Math.floor((lo + hi) / 2)</code>.</li>
<li><strong>Modulo keeps the sign.</strong> <code>-7 % 3</code> is <code>-1</code>, not <code>2</code>. For circular indexes: <code>((i % n) + n) % n</code>.</li>
</ul>
<p>And the largest safe integer is <code>Number.MAX_SAFE_INTEGER</code> (2<sup>53</sup> − 1). Beyond that you need <code>BigInt</code>.</p>`,
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
        title: 'Coercion: == vs ===',
        steps: [
          {
            type: 'predict',
            q: 'Same string, same number, different operator:',
            code: 'console.log("5" + 2);\nconsole.log("5" - 2);',
            options: ['7 and 3', '"52" and 3', '"52" and "3"', '"52" and NaN'],
            answer: 1,
            why: '<code>+</code> has two jobs: adding and concatenating. If <strong>either</strong> side is a string, it concatenates. <code>-</code> only knows how to subtract, so it converts both sides to numbers.',
          },
          {
            type: 'text',
            html: `<p><strong>Coercion</strong> is when JS converts a value from one type to another on its own. Rules that cover almost everything:</p>
<ul>
<li><code>+</code> with a string on either side → converts the other side to a string and concatenates.</li>
<li><code>- * / %</code> and the comparisons <code>&lt; &gt;</code> → convert to number.</li>
<li><code>if (x)</code>, <code>!x</code>, <code>&amp;&amp;</code>, <code>||</code> → convert to boolean.</li>
<li><code>==</code> → if the types differ, it converts (almost always to number) and then compares.</li>
<li><code>===</code> → <strong>never</strong> converts. Different types, <code>false</code>, done.</li>
</ul>`,
          },
          {
            type: 'predict',
            q: 'Using the rules above, try to work it out:',
            code: 'console.log([] == false);\nconsole.log(null == 0);',
            options: ['true and true', 'false and false', 'true and false', 'false and true'],
            answer: 2,
            why: '<code>[]</code> converts to <code>""</code>, then to <code>0</code>; <code>false</code> also becomes <code>0</code>. Equal. But <code>null</code> is a special case: with <code>==</code> it’s only equal to <code>undefined</code> (and itself), nothing else. Moral: always use <code>===</code> and don’t memorize this table.',
          },
          {
            type: 'text',
            html: `<p>There are only <strong>8 falsy values</strong>. Learn them, because everything else is truthy:</p>
<p class="big-code"><code>false</code> · <code>0</code> · <code>-0</code> · <code>0n</code> · <code>""</code> · <code>null</code> · <code>undefined</code> · <code>NaN</code></p>`,
          },
          {
            type: 'predict',
            q: 'Which letters get printed?',
            code: 'if ([]) console.log("A");\nif ("0") console.log("B");\nif (0) console.log("C");\nif ({}) console.log("D");',
            options: ['Only D', 'A, B and D', 'A and D', 'B and D'],
            answer: 1,
            why: 'An empty array and an empty object are truthy (they’re not on the list of 8). So is the string <code>"0"</code>: it’s not the empty string. Only the number <code>0</code> is falsy.',
          },
          {
            type: 'predict',
            q: 'This one will bite you in an interview if you don’t know it:',
            code: 'console.log([10, 9, 1].sort());',
            options: ['[1, 9, 10]', '[1, 10, 9]', '[10, 9, 1]', 'TypeError'],
            answer: 1,
            why: '<code>sort()</code> with no arguments converts everything to a <strong>string</strong> and sorts alphabetically: "10" comes before "9" because "1" &lt; "9". For numbers, always pass the comparator: <code>arr.sort((a, b) =&gt; a - b)</code>.',
          },
          {
            type: 'analogy',
            title: '== is a Ditto',
            html: '<code>==</code> is like a Ditto: before fighting, it <strong>transforms</strong> to look like its opponent, and sometimes the result is super weird. <code>===</code> is the Pokédex scanner: it tells you exactly what each thing is and doesn’t accept disguises.',
          },
          {
            type: 'dsa',
            html: `<p>The number one coercion bug in algorithm problems:</p>
<pre><code>const index = arr.indexOf(x);
if (!index) { /* "not found" */ }   // ❌ index 0 is falsy</code></pre>
<p>Same thing with <code>if (map[key])</code> when the stored value is <code>0</code>, or with <code>count || 1</code>. Compare explicitly (<code>index === -1</code>, <code>map.has(key)</code>) and use <code>??</code> instead of <code>||</code> when 0 is a valid value:</p>
<pre><code>0 || 5    // 5   (0 is falsy)
0 ?? 5    // 0   (?? only kicks in for null and undefined)</code></pre>`,
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
        title: 'Value vs reference',
        steps: [
          {
            type: 'predict',
            q: 'We never touch a directly. Or do we?',
            code: 'const a = [1, 2];\nconst b = a;\nb.push(3);\nconsole.log(a.length);',
            options: ['2', '3', 'undefined', 'TypeError: a is const'],
            answer: 1,
            why: '<code>b = a</code> didn’t copy the array: it copied <strong>the reference</strong>. Both variables point to the same array. And <code>const</code> only prevents re-assigning the variable, not modifying the object it points to.',
          },
          {
            type: 'viz',
            title: 'See it in memory',
            spec: {
              code: 'let x = 10;\nlet y = x;\ny = 20;\nconst a = [1, 2];\nconst b = a;\nb.push(3);\nconsole.log(x, a.length);',
              panels: [
                { key: 'vars', title: 'Variables' },
                { key: 'heap', title: 'Heap (objects)' },
                { key: 'out', title: 'Output' },
              ],
              steps: [
                { line: 1, note: 'A primitive is stored directly in the variable.', s: { vars: ['x = 10'] } },
                { line: 2, note: 'y gets a COPY of the value. They’re two separate 10s.', s: { vars: ['x = 10', 'y = 10'] } },
                { line: 3, note: 'Changing y doesn’t affect x.', s: { vars: ['x = 10', { t: 'y = 20', hl: true }] } },
                { line: 4, note: 'The array lives on the heap. The variable a only stores its address (#1).', s: { vars: ['x = 10', 'y = 20', 'a = → #1'], heap: ['#1  [1, 2]'] } },
                { line: 5, note: 'b copies the address, not the array. Now two variables point to #1.', s: { vars: ['x = 10', 'y = 20', 'a = → #1', 'b = → #1'], heap: ['#1  [1, 2]'] } },
                { line: 6, note: 'push modifies array #1. Since a points to the same one, it "sees" it too.', s: { vars: ['x = 10', 'y = 20', 'a = → #1', 'b = → #1'], heap: [{ t: '#1  [1, 2, 3]', hl: true }] } },
                { line: 7, note: 'x is still 10 (copied by value). a.length is 3 (same reference).', s: { vars: ['x = 10', 'y = 20', 'a = → #1', 'b = → #1'], heap: ['#1  [1, 2, 3]'], out: ['10 3'] } },
              ],
            },
          },
          {
            type: 'predict',
            q: 'Now with functions. Look closely at the difference between these two:',
            code: 'function reset(arr) { arr = []; }\nfunction clear(arr) { arr.length = 0; }\n\nconst nums = [1, 2, 3];\nreset(nums);\nconsole.log(nums.length);\nclear(nums);\nconsole.log(nums.length);',
            options: ['0 and 0', '3 and 0', '3 and 3', '0 and 3'],
            answer: 1,
            why: 'When you call a function, the parameter receives a copy <strong>of the reference</strong>. <code>reset</code> re-assigns its local variable to a new array: nothing happens outside. <code>clear</code> modifies the original array through the reference: outside, you do notice.',
          },
          {
            type: 'code',
            caption: 'How to really copy:',
            code: `const copia = [...original];          // shallow copy (1 level)
const copia2 = original.slice();      // same
const obj2 = { ...obj };              // shallow, for objects
const profunda = structuredClone(x);  // deep copy (every level)`,
          },
          {
            type: 'predict',
            q: 'The classic trap when building a matrix. What does it print?',
            code: 'const grid = new Array(2).fill([]);\ngrid[0].push("X");\nconsole.log(grid[1].length);',
            options: ['0', '1', 'undefined', 'TypeError'],
            answer: 1,
            why: '<code>fill([])</code> creates <strong>a single</strong> array and puts the same reference in every slot. All the "rows" are the same one. The right way: <code>Array.from({ length: 2 }, () =&gt; [])</code>, which runs the function once per row.',
          },
          {
            type: 'analogy',
            title: 'The shared save file',
            html: 'Copying a primitive is <strong>photocopying</strong> your character sheet: everyone scribbles on their own. Copying a reference is giving your friend <strong>the password to your cloud save</strong>: if they release your Charizard, you lost it too, because there were never two saves.',
          },
          {
            type: 'think',
            q: '<code>[1, 2] === [1, 2]</code> gives <code>false</code>. Explain why in your own words. And then: if in a grid problem you want to store visited coordinates in a <code>Set</code>, does <code>visited.add([r, c])</code> work?',
            a: 'They’re two different arrays on the heap; <code>===</code> compares addresses, not contents. For the same reason, a <code>Set</code> of arrays never finds duplicates: <code>visited.has([0, 1])</code> is always <code>false</code>. The standard trick is to convert to a primitive: <code>visited.add(r + "," + c)</code>.',
          },
          {
            type: 'dsa',
            html: `<p>This lesson is probably the one that will save you the most bugs in interviews:</p>
<ul>
<li>Matrices built with <code>fill([])</code> that share rows.</li>
<li>In backtracking, saving <code>result.push(path)</code> instead of <code>result.push([...path])</code>: at the end every answer is the same empty array.</li>
<li>Accidentally modifying the input (<code>sort</code>, <code>reverse</code> and <code>splice</code> mutate the original array).</li>
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
        q: 'What does it print?',
        code: 'console.log(1 + "2" + 3);',
        options: ['6', '"123"', '"33"', '"15"'],
        answer: 1,
        why: 'It’s evaluated left to right: <code>1 + "2"</code> is <code>"12"</code>, and <code>"12" + 3</code> is <code>"123"</code>.',
      },
      {
        q: 'What does it print?',
        code: 'console.log(0.1 + 0.2 === 0.3);',
        options: ['true', 'false', 'NaN', 'TypeError'],
        answer: 1,
        why: 'Binary floating point can’t represent 0.1 exactly. The sum gives 0.30000000000000004.',
      },
      {
        q: 'What does it print?',
        code: 'console.log(-7 % 3);',
        options: ['2', '-1', '1', '-2'],
        answer: 1,
        why: 'In JS the result of <code>%</code> takes the sign of the dividend. For an always-positive modulo: <code>((a % n) + n) % n</code>.',
      },
      {
        q: 'How many keys does the object have?',
        code: 'const m = {};\nm[1] = "a";\nm["1"] = "b";\nconsole.log(Object.keys(m).length);',
        options: ['2', '1', '0', 'TypeError'],
        answer: 1,
        why: 'Object keys are always strings: <code>m[1]</code> and <code>m["1"]</code> are the same key. A <code>Map</code> does tell <code>1</code> apart from <code>"1"</code>.',
      },
      {
        q: 'What does it print?',
        code: 'const a = { n: 1, tags: ["x"] };\nconst b = { ...a };\nb.n = 2;\nb.tags.push("y");\nconsole.log(a.n, a.tags.length);',
        options: ['1 1', '2 2', '1 2', '2 1'],
        answer: 2,
        why: 'Spread only copies one level. <code>n</code> is a primitive (independent copy), but <code>tags</code> is a shared reference.',
      },
    ],
    exercises: [
      {
        id: '01-real-type',
        title: 'realType',
        xp: 40,
        brief: 'Write the honest version of <code>typeof</code>: one that tells apart <code>null</code>, arrays and <code>NaN</code>.',
        hints: [
          'The order of your <code>if</code>s matters: check the three special cases first and leave <code>typeof</code> for last.',
          'In lesson 1 you saw a reliable check for each special case. It’s three lines.',
          'Watch out for the global <code>isNaN("hola")</code>: it converts before checking and gives <code>true</code>. Use <code>Number.isNaN</code>, which doesn’t convert.',
        ],
      },
      {
        id: '02-same-value',
        title: 'sameValue',
        xp: 40,
        brief: 'An upgraded <code>===</code>: <code>NaN</code> should equal <code>NaN</code>, and <code>+0</code> and <code>-0</code> should be different. Without using <code>Object.is</code>.',
        hints: [
          'Handle each blind spot separately and leave <code>a === b</code> for everything else.',
          'What’s the only value that isn’t equal to itself? That gives you a way to detect it without any functions.',
          'For the zeros: what is <code>1 / 0</code>? And <code>1 / -0</code>?',
        ],
      },
      {
        id: '03-deep-clone',
        title: 'deepClone',
        xp: 40,
        brief: 'A deep copy of nested arrays and objects, by hand. Your first recursive function of the course.',
        hints: [
          'Think in three cases: it’s an array, it’s an object, or it’s a primitive. Which of the three is the base case?',
          'To clone an array: create a new one where each element is the clone of the original element. Which function knows how to clone an element?',
          'Careful with <code>typeof null</code>. Check for <code>null</code> before treating something as an object.',
        ],
      },
    ],
    boss: [
      {
        id: 'boss-1-deep-equal',
        title: 'deepEqual',
        xp: 80,
        brief: 'Compare two values by structure and content, at any depth.',
        hints: [
          'Start with the easy part: if <code>a === b</code>, you’re done. Then rule out anything that isn’t two objects.',
          'Two objects are equal if they have the same number of keys and, for every key in one, the other has it with a deepEqual value.',
          'One test compares <code>{ a: undefined }</code> with <code>{ b: undefined }</code>. Comparing <code>a[key]</code> with <code>b[key]</code> isn’t enough: check that the key exists in the other one.',
        ],
      },
      {
        id: 'boss-2-safe-sum',
        title: 'safeSum',
        xp: 80,
        brief: 'Add up only what is truly a number in an array full of junk. Every coercion trap at once.',
        hints: [
          'Don’t blindly convert everything with <code>Number()</code>. Open the console and try <code>Number("")</code>, <code>Number(null)</code>, <code>Number(true)</code> and <code>Number([5])</code>.',
          'Filter by <code>typeof</code> first: you only care about two types. That alone makes almost every trap disappear.',
          'For strings: discard the empty ones (after trimming whitespace) and then check that the number is finite with <code>Number.isFinite</code>.',
        ],
      },
    ],
  };

  // ───────────────────────────── M2 · CLOSURES ─────────────────────────────
  const m2 = {
    id: 'm2',
    dir: 'm2-closures',
    title: 'Scope and closures',
    tagline: 'Where your variables live and why a function remembers things.',
    zone: 'Scope Crypt',
    mob: { sprite: 'ghost', name: 'Undefined Ghost' },
    bossMob: { name: 'Closure Wraith' },
    lessons: [
      {
        title: 'var, let, const and hoisting',
        steps: [
          {
            type: 'predict',
            q: 'We use x before declaring it:',
            code: 'console.log(x);\nvar x = 5;',
            options: ['5', 'undefined', 'ReferenceError', 'null'],
            answer: 1,
            why: 'Before running, the engine registers every declaration in the scope. That’s called <strong>hoisting</strong>. A <code>var</code> gets registered and also initialized to <code>undefined</code>; the assignment (<code>= 5</code>) stays on its line.',
          },
          {
            type: 'predict',
            q: 'Same code, but with let:',
            code: 'console.log(y);\nlet y = 5;',
            options: ['5', 'undefined', 'ReferenceError', 'null'],
            answer: 2,
            why: '<code>let</code> and <code>const</code> are also registered at the start, but they’re <strong>not initialized</strong>. From the start of the block until their line they’re in the <em>Temporal Dead Zone</em>: they exist, but touching them throws a <code>ReferenceError</code>. That’s on purpose: it warns you about the bug instead of handing you a silent <code>undefined</code>.',
          },
          {
            type: 'text',
            html: `<table>
<tr><th></th><th>Scope</th><th>Before its line</th><th>Re-assignable?</th></tr>
<tr><td><code>var</code></td><td>the whole function</td><td><code>undefined</code></td><td>yes</td></tr>
<tr><td><code>let</code></td><td>the <code>{ }</code> block</td><td>ReferenceError (TDZ)</td><td>yes</td></tr>
<tr><td><code>const</code></td><td>the <code>{ }</code> block</td><td>ReferenceError (TDZ)</td><td>no</td></tr>
<tr><td><code>function f() {}</code></td><td>the whole function</td><td>already fully works</td><td>yes</td></tr>
</table>`,
          },
          {
            type: 'predict',
            q: 'Two ways to create functions. What happens when you run this?',
            code: 'saludar();\nfunction saludar() { console.log("hola"); }\n\ndespedir();\nconst despedir = () => console.log("bye");',
            options: ['"hola" and "bye"', '"hola" then ReferenceError', 'ReferenceError without printing anything', '"hola" then TypeError'],
            answer: 1,
            why: 'A <em>function declaration</em> is hoisted whole, body and all. <code>despedir</code> is a <code>const</code> that holds a function: it follows the <code>const</code> rules and is in the TDZ.',
          },
          {
            type: 'code',
            caption: 'Block scope vs function scope:',
            code: `function demo() {
  if (true) {
    var a = 1;   // lives in the whole function
    let b = 2;   // lives only inside this if
  }
  console.log(a);  // 1
  console.log(b);  // ReferenceError: b is not defined
}`,
          },
          {
            type: 'analogy',
            title: 'Fog of war',
            html: 'When entering a scope, the engine already has the <strong>full map</strong> with every variable marked. <code>var</code>s are zones that are already explored but empty (<code>undefined</code>). <code>let</code> and <code>const</code> are under the <strong>fog of war</strong>: you know something is there, but you can’t go in until your character reaches that line.',
          },
          {
            type: 'think',
            q: 'If <code>let</code> throws an error where <code>var</code> gave you <code>undefined</code>… why is that an <em>improvement</em>?',
            a: 'Because using a variable before assigning it is almost always a bug. A silent <code>undefined</code> travels through your program and blows up far away, three functions later. A <code>ReferenceError</code> blows up right on the line with the problem.',
          },
          {
            type: 'dsa',
            html: '<p>Interview rule: <strong><code>const</code> by default, <code>let</code> when you’re going to re-assign</strong> (counters, pointers, accumulators) and <code>var</code> never. The interviewer reads it as a sign that you write modern JS, and it also saves you from the bug in lesson 3.</p>',
          },
          {
            type: 'links',
            items: [
              { t: 'javascript.info · The old "var"', u: JSI + 'var' },
              { t: 'MDN · let (and the Temporal Dead Zone)', u: MDN + 'Web/JavaScript/Reference/Statements/let' },
              { t: 'MDN · Hoisting', u: MDN + 'Glossary/Hoisting' },
            ],
          },
        ],
      },
      {
        title: 'Call stack and lexical scope',
        steps: [
          {
            type: 'predict',
            q: 'mostrar() is called from inside envolver(). Which nombre does it see?',
            code: 'const nombre = "global";\n\nfunction mostrar() {\n  console.log(nombre);\n}\n\nfunction envolver() {\n  const nombre = "local";\n  mostrar();\n}\n\nenvolver();',
            options: ['"local"', '"global"', 'undefined', 'ReferenceError'],
            answer: 1,
            why: 'JavaScript has <strong>lexical scope</strong>: a function looks up its variables where it was <em>written</em>, not where it was <em>called</em> from. <code>mostrar</code> is written in the global scope, so it sees the global <code>nombre</code>.',
          },
          {
            type: 'text',
            html: `<p>Two concepts that get mixed up a lot:</p>
<ul>
<li><strong>Scope chain</strong> (where I look up variables): decided when the code is <em>written</em>. Function → the one wrapping it → … → global.</li>
<li><strong>Call stack</strong> (who called whom): built while <em>running</em>. Each call pushes a <em>frame</em> with its local variables; on <code>return</code>, the frame is removed.</li>
</ul>`,
          },
          {
            type: 'viz',
            title: 'The call stack in action',
            spec: {
              code: 'function cuadrado(n) {\n  return n * n;\n}\nfunction sumaCuadrados(a, b) {\n  const x = cuadrado(a);\n  const y = cuadrado(b);\n  return x + y;\n}\nconsole.log(sumaCuadrados(2, 3));',
              panels: [
                { key: 'stack', title: 'Call stack', kind: 'stack' },
                { key: 'vars', title: 'Variables of the top frame' },
                { key: 'out', title: 'Output' },
              ],
              steps: [
                { line: 9, note: 'To print, we first need to compute sumaCuadrados(2, 3).', s: { stack: ['global'] } },
                { line: 4, note: 'New call: a frame with its parameters is pushed.', s: { stack: ['global', 'sumaCuadrados(2, 3)'], vars: ['a = 2', 'b = 3'] } },
                { line: 5, note: 'To compute x we have to call cuadrado(2). sumaCuadrados is paused.', s: { stack: ['global', 'sumaCuadrados(2, 3)', 'cuadrado(2)'], vars: ['n = 2'] } },
                { line: 2, note: 'cuadrado returns 4. Its frame is about to disappear.', s: { stack: ['global', 'sumaCuadrados(2, 3)', 'cuadrado(2)'], vars: ['n = 2', { t: 'return 4', hl: true }] } },
                { line: 5, note: 'Pop. We’re back right where we left off, now with x = 4.', s: { stack: ['global', 'sumaCuadrados(2, 3)'], vars: ['a = 2', 'b = 3', { t: 'x = 4', hl: true }] } },
                { line: 6, note: 'Another call: a NEW frame for cuadrado, with its own n.', s: { stack: ['global', 'sumaCuadrados(2, 3)', 'cuadrado(3)'], vars: ['n = 3'] } },
                { line: 6, note: 'It returns 9 and is popped.', s: { stack: ['global', 'sumaCuadrados(2, 3)'], vars: ['a = 2', 'b = 3', 'x = 4', { t: 'y = 9', hl: true }] } },
                { line: 7, note: 'sumaCuadrados returns 13.', s: { stack: ['global', 'sumaCuadrados(2, 3)'], vars: ['a = 2', 'b = 3', 'x = 4', 'y = 9', { t: 'return 13', hl: true }] } },
                { line: 9, note: 'Stack back at global. The result gets printed.', s: { stack: ['global'], out: ['13'] } },
              ],
            },
          },
          {
            type: 'predict',
            q: 'And what if a function calls itself non-stop?',
            code: 'function f() {\n  return f();\n}\nf();',
            options: ['It hangs forever', 'RangeError: Maximum call stack size exceeded', 'It returns undefined', 'SyntaxError'],
            answer: 1,
            why: 'Each call pushes a frame and none get popped. The stack has a limit (around 10,000 frames, depending on the engine) and when you pass it, it crashes: the famous <em>stack overflow</em>.',
          },
          {
            type: 'analogy',
            title: 'The Magic stack',
            html: 'If you play Magic you already know this: spells go on <strong>the stack</strong> and resolve from last to first. You cast a spell, someone responds with another, you respond to that… and the last one in is the first to resolve. That’s LIFO, and it’s exactly what the call stack does with function calls.',
          },
          {
            type: 'dsa',
            html: `<p>Why it matters for DSA:</p>
<ul>
<li><strong>Recursion = using the call stack as a data structure.</strong> Any recursive DFS can be written with an explicit stack.</li>
<li><strong>Recursion costs memory.</strong> If the maximum depth is <em>d</em>, the space is O(d) even if you don’t create a single array. You will get asked about this.</li>
<li><strong>Very deep lists or trees</strong> (100,000 nodes in a line) blow up the stack. The interview answer: "I can do it iteratively".</li>
</ul>`,
          },
          {
            type: 'links',
            items: [
              { t: 'javascript.info · Recursion and stack', u: JSI + 'recursion' },
              { t: 'MDN · Call stack', u: MDN + 'Glossary/Call_stack' },
              { t: 'MDN · Closures (Lexical scoping section)', u: MDN + 'Web/JavaScript/Guide/Closures' },
            ],
          },
        ],
      },
      {
        title: 'Closures: functions with a backpack',
        steps: [
          {
            type: 'predict',
            q: 'The most famous bug in JavaScript. What does it print?',
            code: 'for (var i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 0);\n}',
            options: ['0 1 2', '3 3 3', '2 2 2', '0 0 0'],
            answer: 1,
            why: 'With <code>var</code> there’s <strong>a single</strong> <code>i</code> variable for the whole loop. The three callbacks didn’t save a copy of the value: they saved access to <em>that same</em> variable. When they finally run, the loop is already over and <code>i</code> is 3.',
          },
          {
            type: 'think',
            q: 'If you change <code>var</code> to <code>let</code>, it prints <code>0 1 2</code>. With what you know about block scope, why do you think it changes?',
            a: 'With <code>let</code>, each iteration of the loop creates a <strong>new</strong> <code>i</code> variable (one per block). Each callback is tied to its own: one is 0, another 1, another 2.',
          },
          {
            type: 'text',
            html: '<p>A <strong>closure</strong> is a function together with access to the variables of the place where it was created. The function carries that environment wherever it goes, even after the outer function has finished.</p><p>Important: it keeps access to <strong>the variables</strong>, not a snapshot of their values. If the variable changes, the closure sees the change.</p>',
          },
          {
            type: 'viz',
            title: 'A closure step by step',
            spec: {
              code: 'function crearContador() {\n  let cuenta = 0;\n  return function () {\n    cuenta++;\n    return cuenta;\n  };\n}\nconst contar = crearContador();\ncontar();\ncontar();',
              panels: [
                { key: 'stack', title: 'Call stack', kind: 'stack' },
                { key: 'env', title: '🎒 Live environments' },
                { key: 'out', title: 'Returned values' },
              ],
              steps: [
                { line: 8, note: 'We call crearContador. Its frame gets pushed.', s: { stack: ['global', 'crearContador()'] } },
                { line: 2, note: 'Its local variable lives in the environment of THIS call.', s: { stack: ['global', 'crearContador()'], env: ['Env #1 { cuenta: 0 }'] } },
                { line: 3, note: 'A new function is created. It’s born with a link to Env #1: that’s its backpack.', s: { stack: ['global', 'crearContador()'], env: ['Env #1 { cuenta: 0 }', { t: 'anonymous function → 🎒 #1', hl: true }] } },
                { line: 8, note: 'crearContador finished and left the stack. But its environment is NOT deleted: contar still needs it.', s: { stack: ['global'], env: ['Env #1 { cuenta: 0 }', 'contar → 🎒 #1'] } },
                { line: 9, note: 'We call contar. It looks up cuenta: it’s not its own, so it pulls it out of its backpack.', s: { stack: ['global', 'contar()'], env: ['Env #1 { cuenta: 0 }', 'contar → 🎒 #1'] } },
                { line: 4, note: 'It modifies the ORIGINAL variable inside the environment.', s: { stack: ['global', 'contar()'], env: [{ t: 'Env #1 { cuenta: 1 }', hl: true }, 'contar → 🎒 #1'], out: ['1'] } },
                { line: 10, note: 'Second call: same environment, the count picks up where it left off.', s: { stack: ['global', 'contar()'], env: [{ t: 'Env #1 { cuenta: 2 }', hl: true }, 'contar → 🎒 #1'], out: ['1', '2'] } },
              ],
            },
          },
          {
            type: 'predict',
            q: 'Using the crearContador from the animation:',
            code: 'const a = crearContador();\nconst b = crearContador();\na();\na();\nconsole.log(b());',
            options: ['3', '1', '2', '0'],
            answer: 1,
            why: 'Each <strong>call</strong> to <code>crearContador</code> creates a new environment with its own <code>cuenta</code>. <code>a</code> and <code>b</code> carry different backpacks.',
          },
          {
            type: 'analogy',
            title: 'The adventurer and their inventory',
            html: 'A function is an adventurer born in a village (the outer function). When they leave, <strong>they take their backpack</strong> with everything that was within reach. The village may end up empty (the outer function already finished), but as long as the adventurer is alive, so is their backpack. And if two adventurers set out from two different visits to the village, each one carries their own backpack.',
          },
          {
            type: 'dsa',
            html: `<p>You’ll use closures in almost every problem, even if you don’t name them:</p>
<pre><code>function subsets(nums) {
  const result = [];              // ← lives in the closure

  function dfs(start, path) {     // inner helper
    result.push([...path]);       // modifies it without receiving it as a parameter
    for (let i = start; i &lt; nums.length; i++) {
      dfs(i + 1, [...path, nums[i]]);
    }
  }

  dfs(0, []);
  return result;
}</code></pre>
<p>That pattern (outer function holding the state, recursive helper inside) is the skeleton of backtracking, DFS and memoization. You’ll write it hundreds of times.</p>`,
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
        q: 'What does it print?',
        code: 'let x = 1;\n{\n  let x = 2;\n}\nconsole.log(x);',
        options: ['2', '1', 'undefined', 'SyntaxError'],
        answer: 1,
        why: 'The inner <code>x</code> only lives in that block and shadows the outer one while it lasts. Once you leave, the original <code>x</code> is still there.',
      },
      {
        q: 'What does it print?',
        code: 'function f() {\n  if (true) {\n    var a = 1;\n    let b = 2;\n  }\n  console.log(typeof a, typeof b);\n}\nf();',
        options: ['"number" "number"', '"number" "undefined"', '"undefined" "undefined"', 'ReferenceError'],
        answer: 1,
        why: '<code>a</code> is a <code>var</code>: it lives in the whole function. <code>b</code> doesn’t exist outside the <code>if</code>, and <code>typeof</code> of something that doesn’t exist gives <code>"undefined"</code> without throwing.',
      },
      {
        q: 'What does it print?',
        code: 'const fns = [];\nfor (let i = 0; i < 3; i++) {\n  fns.push(() => i * 2);\n}\nconsole.log(fns[2]());',
        options: ['6', '4', '2', '0'],
        answer: 1,
        why: 'With <code>let</code> each iteration has its own <code>i</code>. The third function closed over <code>i = 2</code>.',
      },
      {
        q: 'What does it print?',
        code: 'function make() {\n  let n = 0;\n  return { inc: () => ++n, get: () => n };\n}\nconst c = make();\nc.inc();\nc.inc();\nconsole.log(c.get(), c.n);',
        options: ['2 2', '2 undefined', '0 undefined', '2 0'],
        answer: 1,
        why: '<code>n</code> lives in the closure, it’s not a property of the object. That’s how private variables were done before <code>#</code> existed.',
      },
      {
        q: 'Recursive factorial(n) creates no arrays or objects. How much space does it use?',
        code: 'function factorial(n) {\n  if (n <= 1) return 1;\n  return n * factorial(n - 1);\n}',
        options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
        answer: 1,
        why: 'There are n frames stacked at the same time before the first one can return. The call stack counts as memory too.',
      },
    ],
    exercises: [
      {
        id: '01-create-counter',
        title: 'createCounter',
        xp: 40,
        brief: 'A counter with truly private state, using only closures.',
        hints: [
          'It’s almost the animation from lesson 3, but returning an object with several functions instead of just one.',
          'All the functions in the object can share the same closure variable.',
          'For <code>reset</code> you need to remember the initial value. Where is <code>start</code> still available after <code>createCounter</code> finishes?',
        ],
      },
      {
        id: '02-once',
        title: 'once',
        xp: 40,
        brief: 'Wrap a function so it can only run once.',
        hints: [
          'You need to remember two things between calls: whether it was already called and what it returned.',
          'Those two things are variables in the closure of the function you return.',
          'Don’t use the result as a flag (<code>if (!result)</code>): what happens if the function returns <code>0</code> or <code>undefined</code>? You saw this in module 1.',
        ],
      },
      {
        id: '03-memoize',
        title: 'memoize',
        xp: 40,
        brief: 'Automatic caching for any function. The foundation of top-down dynamic programming.',
        hints: [
          'The cache lives in the closure: a structure that maps arguments → result.',
          'The arguments arrive as an array (<code>...args</code>). You need to turn them into ONE key that tells <code>(1, 23)</code> apart from <code>(12, 3)</code> and <code>1</code> from <code>"1"</code>. <code>args.join("")</code> won’t work. Which function converts any value to a string without ambiguity?',
          'To know whether something is cached, ask whether the key <strong>exists</strong> (<code>Map.has</code>), not whether its value is truthy.',
        ],
      },
    ],
    boss: [
      {
        id: 'boss-1-curry',
        title: 'curry',
        xp: 80,
        brief: 'Turn <code>f(a, b, c)</code> into something that accepts <code>f(a)(b)(c)</code>, <code>f(a, b)(c)</code> and any combination.',
        hints: [
          '<code>fn.length</code> tells you how many parameters a function declares. That’s your criterion for knowing whether you have enough yet.',
          'The function you return receives <code>...args</code>. If there are enough, call <code>fn</code>. If not, return ANOTHER function that waits for more.',
          'That other function joins the old arguments with the new ones and asks the same question again. "The same question" sounds like recursion: give your inner function a name so you can call it.',
        ],
      },
      {
        id: 'boss-2-pipe',
        title: 'pipe',
        xp: 80,
        brief: 'Chain functions: the output of one is the input of the next.',
        hints: [
          'Do it first with a plain <code>for</code>: a <code>resultado</code> variable that you pass through each function.',
          'The first function is special because it receives all the arguments. The rest receive a single value.',
          'The no-functions case deserves its own <code>if</code> at the start.',
        ],
      },
    ],
  };

  // ───────────────────────────── M3 · THIS AND PROTOTYPES ─────────────────────────────
  const m3 = {
    id: 'm3',
    dir: 'm3-this-prototypes',
    title: 'this, prototypes and classes',
    tagline: 'JavaScript’s real object model, and how to build data structures with it.',
    zone: 'Prototype Dungeon',
    mob: { sprite: 'mimic', name: 'this Mimic' },
    bossMob: { name: 'Great Inherited Mimic' },
    lessons: [
      {
        title: 'this: it depends on who calls',
        steps: [
          {
            type: 'predict',
            q: 'The same function, called two ways:',
            code: '"use strict";\nconst heroe = {\n  nombre: "Link",\n  saludar() { return "Soy " + this.nombre; },\n};\n\nconst f = heroe.saludar;\n\nconsole.log(heroe.saludar());\nconsole.log(f());',
            options: ['"Soy Link" twice', '"Soy Link" then TypeError', '"Soy Link" and "Soy undefined"', 'TypeError without printing anything'],
            answer: 1,
            why: '<code>this</code> isn’t decided where you write the function, but <strong>at the moment you call it</strong>. <code>heroe.saludar()</code> has an object before the dot: that’s <code>this</code>. <code>f()</code> has nothing before the dot: <code>this</code> is <code>undefined</code> and reading <code>.nombre</code> from it crashes. (Without strict mode, <code>this</code> would be the global object and you’d see "Soy undefined".)',
          },
          {
            type: 'text',
            html: `<p>To know what <code>this</code> is, look at <strong>how the function was called</strong>. Four rules, in order of priority:</p>
<table>
<tr><th>How it’s called</th><th>this is…</th></tr>
<tr><td><code>new Fn()</code></td><td>the brand-new object just created</td></tr>
<tr><td><code>fn.call(obj)</code> · <code>fn.apply(obj)</code> · <code>fn.bind(obj)</code></td><td><code>obj</code>, whatever you say</td></tr>
<tr><td><code>obj.fn()</code></td><td><code>obj</code>, whatever is before the dot</td></tr>
<tr><td><code>fn()</code></td><td><code>undefined</code> (strict mode) or the global object</td></tr>
</table>
<p>And one exception: <strong>arrow functions don’t have their own <code>this</code></strong>. They use the <code>this</code> of the place where they were written, like any other closure variable.</p>`,
          },
          {
            type: 'predict',
            q: 'Here’s an arrow function inside a method:',
            code: 'const equipo = {\n  nombre: "Party",\n  miembros: ["Cloud", "Tifa"],\n  listar() {\n    return this.miembros.map((m) => m + " @ " + this.nombre);\n  },\n};\nconsole.log(equipo.listar()[0]);',
            options: ['"Cloud @ undefined"', '"Cloud @ Party"', 'TypeError', '"Cloud @ equipo"'],
            answer: 1,
            why: 'The arrow has no <code>this</code> of its own, so it uses the one from <code>listar</code>, which is <code>equipo</code>. If you used <code>function (m) { … }</code> instead, that function would have its own <code>this</code> (<code>undefined</code>) and it would crash. That’s why callbacks are almost always written as arrows.',
          },
          {
            type: 'code',
            caption: 'Controlling this by hand:',
            code: `function atacar(arma, bonus) {
  return this.nombre + " ataca con " + arma + " +" + bonus;
}
const link = { nombre: "Link" };

atacar.call(link, "espada", 5);      // separate arguments
atacar.apply(link, ["espada", 5]);   // arguments as an array
const atacarLink = atacar.bind(link, "espada");  // does NOT call it: returns a new function
atacarLink(5);                       // "Link ataca con espada +5"`,
          },
          {
            type: 'predict',
            q: 'bind vs call. Who wins?',
            code: 'function quien() { return this.n; }\nconst a = { n: 1 };\nconst b = { n: 2 };\n\nconst g = quien.bind(a);\nconsole.log(g.call(b));',
            options: ['2', '1', 'undefined', 'TypeError'],
            answer: 1,
            why: 'A <code>bind</code> is permanent: the function it returns ignores any later attempt to change its <code>this</code>.',
          },
          {
            type: 'analogy',
            title: 'The weapon and who wields it',
            html: 'A regular function is a <strong>sword lying on the ground</strong>: its damage depends on whoever picks it up at that moment (<code>this</code> = whoever calls it). <code>bind</code> is enchanting it so it only answers to one owner. And an arrow function is a <strong>soulbound item</strong>: it’s bound to the place where it was forged and can’t be transferred.',
          },
          {
            type: 'dsa',
            html: `<p>The typical bug when writing classes in an interview:</p>
<pre><code>class Grafo {
  visitar(nodo) { this.vistos.add(nodo); }
  recorrer(nodos) {
    nodos.forEach(this.visitar);            // ❌ this gets lost
    nodos.forEach((n) =&gt; this.visitar(n));  // ✅
  }
}</code></pre>
<p>Passing <code>this.metodo</code> as a callback detaches it from its object, just like <code>const f = heroe.saludar</code>.</p>`,
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
        title: 'The prototype chain',
        steps: [
          {
            type: 'predict',
            q: 'You never defined push on your array. So…',
            code: 'const arr = [1, 2];\nconsole.log(arr.hasOwnProperty("push"));\nconsole.log("push" in arr);',
            options: ['true and true', 'false and true', 'false and false', 'true and false'],
            answer: 1,
            why: '<code>push</code> doesn’t live on your array: it lives on <code>Array.prototype</code>, an object that every array shares. <code>hasOwnProperty</code> only looks at the object itself; <code>in</code> climbs the whole chain.',
          },
          {
            type: 'text',
            html: '<p>Every object has a hidden link to another object: its <strong>prototype</strong>. When you read <code>obj.something</code>:</p><ol><li>Does <code>obj</code> have it? Done.</li><li>If not, does its prototype have it?</li><li>If not, the prototype’s prototype?</li><li>… until you reach <code>null</code>. There, the result is <code>undefined</code>.</li></ol><p>That’s all of JavaScript’s "inheritance". There are no copies: there’s a lookup chain.</p>',
          },
          {
            type: 'viz',
            title: 'Looking up properties along the chain',
            spec: {
              code: 'const animal = { come() { return "ñam"; } };\nconst perro = Object.create(animal);\nperro.ladra = () => "guau";\n\nperro.ladra();\nperro.come();\nperro.toString();\nperro.vuela();',
              panels: [
                { key: 'chain', title: 'Prototype chain', kind: 'chain' },
                { key: 'out', title: 'Result' },
              ],
              steps: [
                { line: 1, note: 'A plain object. Its prototype is Object.prototype.', s: { chain: ['animal { come }', 'Object.prototype { toString, hasOwnProperty… }', 'null'] } },
                { line: 2, note: 'Object.create(animal) creates an empty object whose prototype is animal.', s: { chain: [{ t: 'perro { }', hl: true }, 'animal { come }', 'Object.prototype { toString, hasOwnProperty… }', 'null'] } },
                { line: 3, note: 'Writing ALWAYS creates the property on the object itself, never on the prototype.', s: { chain: [{ t: 'perro { ladra }', hl: true }, 'animal { come }', 'Object.prototype { toString, hasOwnProperty… }', 'null'] } },
                { line: 5, note: 'ladra is on perro. Found on the first try.', s: { chain: [{ t: 'perro { ladra } ✔', hl: true }, 'animal { come }', 'Object.prototype { toString, hasOwnProperty… }', 'null'], out: ['"guau"'] } },
                { line: 6, note: 'come isn’t on perro. We climb one level: it’s on animal.', s: { chain: [{ t: 'perro { ladra } ✘', x: true }, { t: 'animal { come } ✔', hl: true }, 'Object.prototype { toString, hasOwnProperty… }', 'null'], out: ['"guau"', '"ñam"'] } },
                { line: 7, note: 'toString: neither perro nor animal. Two levels up, on Object.prototype.', s: { chain: [{ t: 'perro { ladra } ✘', x: true }, { t: 'animal { come } ✘', x: true }, { t: 'Object.prototype { toString… } ✔', hl: true }, 'null'], out: ['"guau"', '"ñam"', '"[object Object]"'] } },
                { line: 8, note: 'vuela isn’t on any level. We hit null: perro.vuela is undefined, and calling undefined() crashes.', s: { chain: [{ t: 'perro { ladra } ✘', x: true }, { t: 'animal { come } ✘', x: true }, { t: 'Object.prototype ✘', x: true }, { t: 'null → undefined', hl: true }], out: ['"guau"', '"ñam"', '"[object Object]"', 'TypeError: perro.vuela is not a function'] } },
              ],
            },
          },
          {
            type: 'predict',
            q: 'Reading climbs the chain. What about writing?',
            code: 'const base = { hp: 100 };\nconst mob = Object.create(base);\nmob.hp -= 30;\nconsole.log(base.hp, mob.hp);',
            options: ['70 70', '100 70', '100 100', '70 100'],
            answer: 1,
            why: '<code>mob.hp -= 30</code> is <code>mob.hp = mob.hp - 30</code>. The read climbs and finds 100 on <code>base</code>; the write creates a new <code>hp</code> property on <code>mob</code>. From then on, <code>mob.hp</code> shadows the one on <code>base</code>.',
          },
          {
            type: 'predict',
            q: 'You use an object as a "set" of words already seen. The word "constructor" comes in:',
            code: 'const visto = {};\nconst palabra = "constructor";\nconsole.log(visto[palabra] ? "ya la vi" : "nueva");',
            options: ['"nueva"', '"ya la vi"', 'undefined', 'TypeError'],
            answer: 1,
            why: '<code>visto</code> is empty, but <code>visto["constructor"]</code> climbs the chain and finds <code>Object.prototype.constructor</code>, which is truthy. This bug is real, and it’s why <code>Map</code> exists: it has no inherited keys.',
          },
          {
            type: 'analogy',
            title: 'Looking for a spell',
            html: 'You need a spell. First you check <strong>your grimoire</strong>. If it’s not there, you go to <strong>your guild’s library</strong>. If it’s not there either, to the <strong>Royal Archive</strong>, which holds what every mage knows. If it doesn’t show up there, the spell doesn’t exist (<code>undefined</code>). Nobody copied the books for you: you just know where to go look.',
          },
          {
            type: 'dsa',
            html: `<p>Two takeaways:</p>
<ul>
<li><strong>Use <code>Map</code> and <code>Set</code> as your hash map and hash set</strong>, not objects. They accept any type of key, have no inherited keys, and have <code>.size</code>.</li>
<li><strong>The prototype chain is a linked list.</strong> Each object points to the next and the last one points to <code>null</code>. In your exercise 3 you’ll walk it with a <code>while</code>, just like you’ll walk linked lists in Act III.</li>
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
        title: 'Classes: sugar over prototypes',
        steps: [
          {
            type: 'predict',
            q: 'JavaScript has the class keyword. What is a class under the hood?',
            code: 'class Mob {}\nconsole.log(typeof Mob);',
            options: ['"class"', '"function"', '"object"', '"undefined"'],
            answer: 1,
            why: 'A class is a constructor function with cleaner syntax. Its methods are stored on <code>Mob.prototype</code> and each instance points there through the chain you already know. No new magic.',
          },
          {
            type: 'code',
            caption: 'Everything you need from classes for DSA, in one example:',
            code: `class Mob {
  #hp;                         // private field: only accessible inside the class
  static total = 0;            // belongs to the class, not the instances

  constructor(nombre, hp) {    // runs on every new
    this.nombre = nombre;
    this.#hp = hp;
    Mob.total++;
  }

  get vivo() {                 // getter: used like a property, mob.vivo
    return this.#hp > 0;
  }

  recibir(dmg) {               // method: lives on Mob.prototype
    this.#hp -= dmg;
    return this;               // returning this allows chaining
  }
}

class Jefe extends Mob {       // Jefe.prototype → Mob.prototype → Object.prototype
  constructor(nombre) {
    super(nombre, 500);        // calls the parent’s constructor (required before using this)
  }
  recibir(dmg) {
    return super.recibir(dmg / 2);   // calls the parent’s method
  }
}`,
          },
          {
            type: 'predict',
            q: 'With inheritance:',
            code: 'class A {\n  hola() { return "A"; }\n}\nclass B extends A {\n  hola() { return super.hola() + "B"; }\n}\nconst b = new B();\nconsole.log(b.hola(), b instanceof A);',
            options: ['"B" true', '"AB" true', '"AB" false', '"BA" true'],
            answer: 1,
            why: '<code>super.hola()</code> runs the parent’s version and then "B" is concatenated to it. And <code>instanceof</code> checks whether <code>A.prototype</code> appears anywhere in <code>b</code>’s chain: it does, one level above <code>B.prototype</code>.',
          },
          {
            type: 'predict',
            q: 'The same problem from lesson 1, now with classes:',
            code: 'class Contador {\n  n = 0;\n  inc() { this.n++; }\n}\nconst c = new Contador();\nconst inc = c.inc;\ninc();',
            options: ['c.n becomes 1', 'Nothing happens', 'TypeError', 'c.n becomes NaN'],
            answer: 2,
            why: 'A class body always runs in strict mode. When you detach the method from its object, <code>this</code> is <code>undefined</code> and <code>this.n++</code> crashes. Classes don’t change the rules of <code>this</code>.',
          },
          {
            type: 'think',
            q: 'You’re asked to implement a linked list in an interview. Before writing any code: which classes do you need and what properties would each one have?',
            a: 'Two classes. <code>Node</code> with <code>value</code> and <code>next</code> (which starts as <code>null</code>). And <code>LinkedList</code> with <code>head</code> (the first node, or <code>null</code> if it’s empty) and usually <code>size</code>. That’s how almost every data structure starts: a tiny class for the node and another that manages the nodes.',
          },
          {
            type: 'analogy',
            title: 'The crafting recipe',
            html: 'A class is the <strong>recipe</strong>; <code>new</code> is crafting an item with it. Each item has its own stats (instance properties), but they all share the same abilities, which live only once in the recipe book (<code>prototype</code>). A thousand swords, a single copy of the <code>atacar</code> method.',
          },
          {
            type: 'dsa',
            html: '<p>In interviews you’ll write classes for: <code>ListNode</code>, <code>TreeNode</code>, <code>Stack</code>, <code>Queue</code>, <code>MinStack</code>, <code>LRUCache</code>, <code>Trie</code>, <code>UnionFind</code>, <code>MinHeap</code>. JavaScript doesn’t ship with a heap or an efficient queue out of the box, so knowing how to build them quickly with <code>class</code> is part of the exam. Your two bosses in this module are exactly that.</p>',
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
        q: 'What does it print?',
        code: '"use strict";\nfunction f() { return typeof this; }\nconsole.log(f(), f.call(5));',
        options: ['"object" "object"', '"undefined" "number"', '"undefined" "object"', 'TypeError'],
        answer: 1,
        why: 'Bare call in strict mode: <code>this</code> is <code>undefined</code>. With <code>call(5)</code>, <code>this</code> is exactly the 5 you passed.',
      },
      {
        q: 'What does it print?',
        code: 'const o = {\n  n: 1,\n  f() { return () => this.n; },\n};\nconst g = o.f();\nconsole.log(g.call({ n: 2 }));',
        options: ['2', '1', 'undefined', 'TypeError'],
        answer: 1,
        why: 'The arrow took <code>f</code>’s <code>this</code> at the moment it was created (<code>o</code>). You can’t change an arrow’s <code>this</code>, not even with <code>call</code>.',
      },
      {
        q: 'What’s at the end of every prototype chain?',
        code: 'console.log(Object.getPrototypeOf(Object.prototype));',
        options: ['undefined', 'null', 'Object', '{}'],
        answer: 1,
        why: '<code>Object.prototype</code> is the last link. Its prototype is <code>null</code>, and every lookup stops there.',
      },
      {
        q: 'What does it print?',
        code: 'class P {\n  static crear() { return new P(); }\n}\nconst p = P.crear();\nconsole.log(typeof p.crear);',
        options: ['"function"', '"undefined"', '"object"', 'TypeError'],
        answer: 1,
        why: 'A <code>static</code> method lives on the class itself (<code>P.crear</code>), not on <code>P.prototype</code>. Instances can’t see it.',
      },
      {
        q: 'What does it print?',
        code: 'function Mob() {}\nMob.prototype.hp = 10;\nconst a = new Mob();\nconst b = new Mob();\na.hp = 5;\nconsole.log(b.hp);',
        options: ['5', '10', 'undefined', '15'],
        answer: 1,
        why: 'Writing <code>a.hp</code> creates an own property on <code>a</code>. The prototype didn’t change, so <code>b</code> still reads 10 from there.',
      },
    ],
    exercises: [
      {
        id: '01-my-bind',
        title: 'myBind',
        xp: 40,
        brief: 'Re-implement <code>bind</code> to understand once and for all how <code>this</code> is controlled.',
        hints: [
          '<code>bind</code> doesn’t call the function: it returns a new function that will call it later.',
          'Inside that new function you need to call <code>fn</code> while choosing its <code>this</code>. You saw two methods that do exactly that.',
          'The final arguments are the pre-set ones first and the new ones after. <code>apply</code> takes them as a single array.',
        ],
      },
      {
        id: '02-stack',
        title: 'Stack',
        xp: 40,
        brief: 'Your first data structure as a class, with a private field and a getter.',
        hints: [
          'Internally you can use a plain array: array <code>push</code> and <code>pop</code> already work at the end in O(1).',
          'The private field is declared at the top of the class body: <code>#items = [];</code> and used as <code>this.#items</code>.',
          '<code>size</code> must be a getter: <code>get size() { … }</code>. And check what <code>push</code> should return according to the spec.',
        ],
      },
      {
        id: '03-is-instance-of',
        title: 'isInstanceOf',
        xp: 40,
        brief: 'Re-implement <code>instanceof</code> by walking the prototype chain by hand.',
        hints: [
          '<code>instanceof</code> asks: does <code>Class.prototype</code> appear anywhere in the object’s chain?',
          'Start at <code>Object.getPrototypeOf(obj)</code> and move forward with a <code>while</code> until you find it or reach <code>null</code>.',
          'Primitives and <code>null</code> must return <code>false</code> before you start. (<code>Object.getPrototypeOf(5)</code> does return something, which is why you need to filter.)',
        ],
      },
    ],
    boss: [
      {
        id: 'boss-1-min-stack',
        title: 'MinStack',
        xp: 80,
        brief: 'A stack that gives you its minimum in O(1). A real interview question (LeetCode 155).',
        hints: [
          'Keeping the minimum in a single variable fails when you <code>pop</code> the minimum: what was the previous one?',
          'The minimum "from this element down" never changes while that element is still on the stack. What if you store it alongside each element?',
          'Two equivalent approaches: a stack of <code>{ value, min }</code> pairs, or two parallel stacks (values and minimums).',
        ],
      },
      {
        id: 'boss-2-event-emitter',
        title: 'EventEmitter',
        xp: 80,
        brief: 'An event system with <code>on</code>, <code>off</code>, <code>once</code> and <code>emit</code>. A JavaScript interview classic.',
        hints: [
          'Structure: a <code>Map</code> from event name → array of listeners. If you use a plain object, the "constructor" test will remind you of lesson 2.',
          'For <code>once</code>: store each registration as <code>{ fn, once }</code> and check the flag when emitting.',
          'If you remove elements from an array while iterating over it, you skip elements. Iterate over a copy (<code>[...lista]</code>) and remove from the original.',
        ],
      },
    ],
  };

  // ───────────────────────────── M4 · ASYNC ─────────────────────────────
  const m4 = {
    id: 'm4',
    dir: 'm4-async',
    title: 'Async and the event loop',
    tagline: 'A single thread, lots of things at once. How it pulls it off and how to control it.',
    zone: 'Async Volcano',
    mob: { sprite: 'imp', name: 'Callback Imp' },
    bossMob: { name: 'Lord of the Event Loop' },
    lessons: [
      {
        title: 'The event loop',
        steps: [
          {
            type: 'predict',
            q: 'The timeout is 0 milliseconds. In what order does it come out?',
            code: 'console.log("A");\nsetTimeout(() => console.log("B"), 0);\nPromise.resolve().then(() => console.log("C"));\nconsole.log("D");',
            options: ['A B C D', 'A D B C', 'A D C B', 'A C D B'],
            answer: 2,
            why: 'First, all the synchronous code runs (A, D). Then promises (C) take priority over timers (B), even if the timer is 0 ms. The animation below shows you why.',
          },
          {
            type: 'viz',
            title: 'The event loop step by step',
            spec: {
              code: 'console.log("A");\nsetTimeout(() => console.log("B"), 0);\nPromise.resolve().then(() => console.log("C"));\nconsole.log("D");',
              panels: [
                { key: 'stack', title: 'Call stack', kind: 'stack' },
                { key: 'micro', title: 'Microtasks (promises)' },
                { key: 'macro', title: 'Macrotasks (timers, events)' },
                { key: 'out', title: 'Output' },
              ],
              steps: [
                { line: 1, note: 'Synchronous code: runs immediately.', s: { stack: ['script', 'console.log("A")'], out: ['A'] } },
                { line: 2, note: 'setTimeout does NOT run the callback: it hands it to the environment, which queues it in the macrotask queue when the timer expires.', s: { stack: ['script', 'setTimeout(…)'], macro: [{ t: '() => log("B")', hl: true }], out: ['A'] } },
                { line: 3, note: 'The promise is already resolved, but its .then doesn’t run right now either: it goes to the microtask queue.', s: { stack: ['script', '.then(…)'], micro: [{ t: '() => log("C")', hl: true }], macro: ['() => log("B")'], out: ['A'] } },
                { line: 4, note: 'More synchronous code. The queues keep waiting.', s: { stack: ['script', 'console.log("D")'], micro: ['() => log("C")'], macro: ['() => log("B")'], out: ['A', 'D'] } },
                { line: null, note: 'The script finished and the stack is empty. Only now does the event loop check the queues. Rule: ALL microtasks FIRST.', s: { micro: [{ t: '() => log("C")', hl: true }], macro: ['() => log("B")'], out: ['A', 'D'] } },
                { line: 3, note: 'The microtask runs.', s: { stack: ['() => log("C")'], macro: ['() => log("B")'], out: ['A', 'D', 'C'] } },
                { line: null, note: 'Microtasks empty. Now it takes ONE macrotask.', s: { macro: [{ t: '() => log("B")', hl: true }], out: ['A', 'D', 'C'] } },
                { line: 2, note: 'The timer callback runs. The end.', s: { stack: ['() => log("B")'], out: ['A', 'D', 'C', 'B'] } },
              ],
            },
          },
          {
            type: 'text',
            html: `<p>JavaScript has <strong>a single thread</strong>: it never runs two pieces of your code at the same time. The event loop is the cycle that decides what comes next:</p>
<ol>
<li>Run whatever is on the call stack <strong>until it’s empty</strong>. Nothing interrupts it.</li>
<li>Drain the <strong>entire</strong> microtask queue (promise callbacks, <code>await</code>, <code>queueMicrotask</code>). If a microtask adds another, that one runs too.</li>
<li>Take <strong>one</strong> macrotask (timer, click, network response) and go back to step 1.</li>
</ol>`,
          },
          {
            type: 'predict',
            q: 'Two chained .then calls vs a timeout:',
            code: 'setTimeout(() => console.log("timeout"), 0);\n\nPromise.resolve()\n  .then(() => console.log("micro 1"))\n  .then(() => console.log("micro 2"));\n\nconsole.log("sync");',
            options: ['sync, micro 1, timeout, micro 2', 'sync, micro 1, micro 2, timeout', 'sync, timeout, micro 1, micro 2', 'timeout, sync, micro 1, micro 2'],
            answer: 1,
            why: 'When "micro 1" finishes, it queues "micro 2" as another microtask. And the rule says the microtask queue is drained <strong>completely</strong> before touching any macrotask.',
          },
          {
            type: 'predict',
            q: 'A 10 ms timer and a loop that blocks for 100 ms. What does it print?',
            code: 'const inicio = Date.now();\n\nsetTimeout(() => {\n  console.log(Date.now() - inicio >= 100);\n}, 10);\n\nwhile (Date.now() - inicio < 100) {}',
            options: ['false: the timer runs at 10 ms', 'true: the timer waits for the loop to finish', 'It prints nothing', 'It depends on the computer'],
            answer: 1,
            why: 'The timer expires at 10 ms, but its callback can only run when the stack is empty, and the <code>while</code> keeps it busy. The <code>setTimeout</code> delay is a <strong>minimum</strong>, not a guarantee.',
          },
          {
            type: 'analogy',
            title: 'One hero, one quest board',
            html: 'You’re <strong>a single hero</strong> and you can’t fight two battles at once. You finish your current fight (call stack). Then you check the <strong>guild’s urgent messages</strong> (microtasks) and handle all of them, even the ones that arrive while you’re handling them. Only when none are left do you take <strong>one quest from the board</strong> (macrotask), and the cycle repeats.',
          },
          {
            type: 'dsa',
            html: '<p>"In what order does this print?" is a staple question in JavaScript interviews, especially for frontend and full stack roles. If you can draw the three boxes (stack, microtasks, macrotasks) and narrate the flow out loud, you’re already ahead of most people.</p>',
          },
          {
            type: 'links',
            items: [
              { t: 'javascript.info · Event loop: microtasks and macrotasks', u: JSI + 'event-loop' },
              { t: 'MDN · JavaScript execution model', u: MDN + 'Web/JavaScript/Reference/Execution_model' },
              { t: 'Loupe · interactive event loop visualizer', u: 'http://latentflip.com/loupe/' },
            ],
          },
        ],
      },
      {
        title: 'Promises',
        steps: [
          {
            type: 'predict',
            q: 'Follow the value down the chain. What gets printed?',
            code: 'Promise.resolve(1)\n  .then((x) => x + 1)\n  .then((x) => { throw new Error("boom"); })\n  .then((x) => console.log("then", x))\n  .catch((e) => { console.log("catch", e.message); return 10; })\n  .then((x) => console.log("fin", x));',
            options: ['"then 2" and "fin undefined"', '"catch boom" and "fin 10"', 'Only "catch boom"', '"then 2", "catch boom" and "fin 10"'],
            answer: 1,
            why: 'An error skips every <code>.then</code> until the next <code>.catch</code>. And if the <code>.catch</code> returns a value, the chain <strong>recovers</strong> and carries on normally with that value.',
          },
          {
            type: 'text',
            html: `<p>A <strong>promise</strong> is an object that represents a value that hasn’t arrived yet. It has three states:</p>
<ul>
<li><strong>pending</strong>: no result yet.</li>
<li><strong>fulfilled</strong>: the value arrived.</li>
<li><strong>rejected</strong>: it failed, with an error.</li>
</ul>
<p>Once it leaves pending, <strong>it never changes again</strong>.</p>
<p>The key to reading chains: <strong>every <code>.then</code> returns a new promise</strong>, which resolves with whatever your callback returns. If you return a value, it passes to the next one. If you return a promise, the chain waits for it. If you throw an error, the chain is rejected.</p>`,
          },
          {
            type: 'code',
            caption: 'Creating a promise by hand (wrapping a callback API):',
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
            q: 'What happens if you resolve twice?',
            code: 'const p = new Promise((resolve, reject) => {\n  resolve("uno");\n  resolve("dos");\n  reject(new Error("tres"));\n});\n\np.then((v) => console.log(v));',
            options: ['"uno" and "dos"', '"uno"', '"dos"', 'Error: tres'],
            answer: 1,
            why: 'Only the first call counts. Everything after that is silently ignored. This detail will make your life easier in this module’s boss.',
          },
          {
            type: 'text',
            html: `<table>
<tr><th>Combinator</th><th>Fulfills when…</th><th>Rejects when…</th></tr>
<tr><td><code>Promise.all</code></td><td>all of them fulfill (array in order)</td><td>any one fails</td></tr>
<tr><td><code>Promise.allSettled</code></td><td>all of them finish, good or bad</td><td>never</td></tr>
<tr><td><code>Promise.race</code></td><td>the first to finish fulfills</td><td>the first to finish fails</td></tr>
<tr><td><code>Promise.any</code></td><td>the first one that fulfills</td><td>all of them fail</td></tr>
</table>`,
          },
          {
            type: 'predict',
            q: 'The slow one goes first in the array. In what order do the results arrive?',
            code: 'const lento = new Promise((r) => setTimeout(() => r("lento"), 50));\nconst rapido = new Promise((r) => setTimeout(() => r("rapido"), 10));\n\nPromise.all([lento, rapido]).then((res) => console.log(res));',
            options: ['["rapido", "lento"]', '["lento", "rapido"]', '"rapido"', 'It depends'],
            answer: 1,
            why: '<code>Promise.all</code> respects the order <strong>of the array you passed it</strong>, not the order in which they finished. When you implement it yourself, that’s exactly the challenge.',
          },
          {
            type: 'analogy',
            title: 'The pre-order ticket',
            html: 'A promise is the <strong>pre-order ticket</strong> for a game. You don’t have the game, but you have something in your hand today that you can plan with ("when it arrives, I’ll install it and then invite my friends"). The ticket ends one of two ways: they deliver the game or they cancel your order. And once delivered, it doesn’t get "un-delivered".',
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
            q: 'There’s an await in the middle of the function:',
            code: 'async function f() {\n  console.log(1);\n  await null;\n  console.log(2);\n}\n\nconsole.log(0);\nf();\nconsole.log(3);',
            options: ['0 1 2 3', '0 1 3 2', '0 3 1 2', '1 2 0 3'],
            answer: 1,
            why: 'An <code>async</code> function runs synchronously <strong>until its first <code>await</code></strong>. There it pauses, hands control back to whoever called it (3 gets printed), and the rest of the function is queued as a microtask.',
          },
          {
            type: 'text',
            html: `<p><code>async/await</code> is another way of writing promises, not a new mechanism:</p>
<ul>
<li>An <code>async</code> function <strong>always returns a promise</strong>. If you <code>return 5</code>, it returns a promise fulfilled with 5. If you throw an error, a rejected promise.</li>
<li><code>await promise</code> pauses <strong>that function</strong> (not the thread) until the promise finishes, and gives you its value.</li>
<li>If the promise rejects, <code>await</code> throws the error right there, and you catch it with a regular <code>try / catch</code>.</li>
</ul>`,
          },
          {
            type: 'predict',
            q: 'What does it print?',
            code: 'async function g() {\n  return 5;\n}\n\nconsole.log(g() === 5, g() instanceof Promise);',
            options: ['true false', 'false true', 'true true', 'false false'],
            answer: 1,
            why: 'Calling an <code>async</code> function gives you a promise, always. To get the 5 out you need <code>await g()</code> or <code>g().then(…)</code>.',
          },
          {
            type: 'predict',
            q: 'wait(100) takes 100 ms. Roughly how long does each function take?',
            code: 'async function a() {\n  await wait(100);\n  await wait(100);\n}\n\nasync function b() {\n  await Promise.all([wait(100), wait(100)]);\n}',
            options: ['a: 100 ms, b: 100 ms', 'a: 200 ms, b: 100 ms', 'a: 200 ms, b: 200 ms', 'a: 100 ms, b: 200 ms'],
            answer: 1,
            why: 'In <code>a</code>, the second <code>wait</code> doesn’t even <em>start</em> until the first one finishes: they run in series. In <code>b</code>, both start before waiting on either: they run in parallel. It’s the most common performance mistake with <code>await</code>.',
          },
          {
            type: 'code',
            caption: 'The forEach trap with async:',
            code: `// ❌ forEach waits for nobody: "listo" prints before any of them finishes
ids.forEach(async (id) => { await guardar(id); });
console.log("listo");

// ✅ In series: one after another
for (const id of ids) {
  await guardar(id);
}

// ✅ In parallel: all at once, then wait for the whole group
await Promise.all(ids.map((id) => guardar(id)));`,
          },
          {
            type: 'think',
            q: 'You have 1,000 URLs to download and the server blocks you if you make more than 5 requests at the same time. In series it’s painfully slow; with <code>Promise.all</code> you get blocked. How would you organize it? Don’t think about code yet, think about people.',
            a: 'Picture <strong>5 workers</strong> in front of a single to-do list. Each one takes the next free URL, downloads it, and when done takes another, until the list runs out. There are never more than 5 active downloads and nobody sits idle. That’s a <em>promise pool</em>, and it’s the final boss of this act.',
          },
          {
            type: 'analogy',
            title: 'Save point',
            html: '<code>await</code> is a <strong>save point</strong>. The function saves its game exactly on that line and exits to the menu. The hero (the thread) goes off to handle other things. When the promise finishes, the function <strong>loads the save</strong> and continues right where it left off, with all its variables intact.',
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
        q: 'In what order does it print?',
        code: 'console.log(1);\nsetTimeout(() => console.log(2));\nqueueMicrotask(() => console.log(3));\nPromise.resolve().then(() => console.log(4));\nconsole.log(5);',
        options: ['1 5 2 3 4', '1 5 3 4 2', '1 2 3 4 5', '1 5 4 3 2'],
        answer: 1,
        why: 'Synchronous first (1, 5). Then the microtasks in the order they were queued (3, 4). Finally the macrotask (2).',
      },
      {
        q: 'What does it print?',
        code: 'async function f() {\n  throw new Error("x");\n}\n\nf().catch(() => console.log("atrapado"));\nconsole.log("sigue");',
        options: ['"atrapado" and "sigue"', '"sigue" and "atrapado"', 'Only "sigue"', 'Uncaught error'],
        answer: 1,
        why: 'A <code>throw</code> inside an <code>async</code> function doesn’t crash synchronously: it becomes a rejected promise. The <code>.catch</code> runs later, as a microtask.',
      },
      {
        q: 'What happens to this promise?',
        code: 'Promise.all([\n  Promise.resolve(1),\n  Promise.reject(new Error("no")),\n  Promise.resolve(3),\n]);',
        options: ['It fulfills with [1, undefined, 3]', 'It rejects with the error "no"', 'It fulfills with [1, 3]', 'It stays pending forever'],
        answer: 1,
        why: '<code>Promise.all</code> is all or nothing: a single rejection rejects the whole set. If you want each one’s result no matter what, use <code>Promise.allSettled</code>.',
      },
      {
        q: 'In what order does it print?',
        code: 'setTimeout(() => console.log("A"), 10);\nsetTimeout(() => console.log("B"), 0);\nPromise.resolve().then(() => {\n  setTimeout(() => console.log("C"), 0);\n});',
        options: ['A B C', 'B C A', 'C B A', 'B A C'],
        answer: 1,
        why: 'B is registered with 0 ms. The microtask runs when the script finishes and registers C, also with 0 ms but after B. A waits its 10 ms.',
      },
      {
        q: 'What does it print?',
        code: 'const r = [];\n[1, 2, 3].forEach(async (n) => {\n  await null;\n  r.push(n);\n});\nconsole.log(r.length);',
        options: ['3', '0', '1', 'undefined'],
        answer: 1,
        why: '<code>forEach</code> calls the three callbacks and keeps going without waiting for their promises. Each callback paused at its <code>await</code>, so by the time it prints, nobody has pushed anything yet.',
      },
    ],
    exercises: [
      {
        id: '01-wait',
        title: 'wait',
        xp: 40,
        brief: 'Turn <code>setTimeout</code> into a promise you can wait on with <code>await</code>.',
        hints: [
          'You need to create a promise by hand with <code>new Promise((resolve) =&gt; { … })</code>.',
          'Inside, schedule a <code>setTimeout</code> that calls <code>resolve</code> once the time is up.',
          'To make the promise fulfill with <code>value</code>, pass it to <code>resolve</code>.',
        ],
      },
      {
        id: '02-in-series',
        title: 'inSeries',
        xp: 40,
        brief: 'Run async tasks one after another and collect their results.',
        hints: [
          'A task is a function. The work starts when you <strong>call</strong> it, not before.',
          'Remember the trap from lesson 3: which kind of loop actually respects <code>await</code>?',
          '<code>for…of</code> with <code>await task()</code> inside. If a task fails, the <code>await</code> throws the error and the function rejects on its own: you don’t need <code>try/catch</code>.',
        ],
      },
      {
        id: '03-retry',
        title: 'retry',
        xp: 40,
        brief: 'Retry an operation that fails, up to a maximum number of attempts.',
        hints: [
          'A loop from 1 to <code>attempts</code>, with a <code>try/catch</code> inside.',
          'If the attempt works, <code>return</code> immediately from inside the <code>try</code>. If it fails, save the error and let the loop continue.',
          'Heads up: it has to be <code>return await fn()</code>. Without the <code>await</code>, the rejected promise escapes the <code>try</code> before failing and your <code>catch</code> never sees it.',
        ],
      },
    ],
    boss: [
      {
        id: 'boss-1-promise-all',
        title: 'promiseAll',
        xp: 80,
        brief: 'Implement <code>Promise.all</code> from scratch. One of the most frequently asked questions in JavaScript interviews.',
        hints: [
          'Return a <code>new Promise((resolve, reject) =&gt; …)</code>. Inside, hook a <code>.then</code> onto each element.',
          'Store each result in <code>results[i]</code> using the element’s index, so the order doesn’t depend on who finishes first. To treat plain values as promises: <code>Promise.resolve(item)</code>.',
          'Keep a counter of how many are left and resolve when it hits 0. Don’t use <code>results.length</code>: assigning <code>results[2]</code> already makes <code>length</code> equal 3. For errors, pass <code>reject</code> directly: only the first call counts.',
        ],
      },
      {
        id: 'boss-2-with-limit',
        title: 'withLimit',
        xp: 80,
        brief: 'A promise pool with maximum concurrency. The final boss of Act I and a FAANG favorite.',
        hints: [
          'Go back to the 5-workers question in lesson 3. A worker is an <code>async</code> function with a <code>while</code>: while there are tasks left, it takes the next one and awaits it.',
          'The "to-do list" is a shared index in the closure (<code>let next = 0</code>). Taking a task is <code>const i = next++</code>; store the result in <code>results[i]</code>.',
          'Start <code>limit</code> workers (or fewer, if there are only a few tasks) and wait for all of them to finish with <code>Promise.all</code>. Here you can use it.',
        ],
      },
    ],
  };

  root.COURSE_EN = {
    title: 'JS Quest',
    acts: [
      { id: 'a1', title: 'Act I · JavaScript Under the Hood', modules: ['m1', 'm2', 'm3', 'm4'] },
      {
        id: 'a2',
        title: 'Act II · DSA Tools',
        locked: true,
        planned: ['Big O', 'Arrays and strings', 'Hash maps and sets', 'Two pointers and sliding window'],
      },
      {
        id: 'a3',
        title: 'Act III · Data Structures',
        locked: true,
        planned: ['Stack and queue', 'Linked lists', 'Trees and BST', 'Heaps', 'Graphs'],
      },
      {
        id: 'a4',
        title: 'Act IV · FAANG Patterns',
        locked: true,
        planned: ['Recursion and backtracking', 'Binary search', 'BFS and DFS', 'Dynamic programming', 'Mock interviews'],
      },
    ],
    modules: [m1, m2, m3, m4],
  };
})(typeof window !== 'undefined' ? window : globalThis);
