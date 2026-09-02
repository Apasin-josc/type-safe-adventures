# TypeScript Notes 🦔

A recap of everything covered so far in `src/index.ts`, explained in plain English.
The idea is to be able to re-read this every now and then without scanning the
whole source file.

---

## 1. Basic types

TypeScript is JavaScript, but you tell the compiler what type each thing is.
The syntax is `name: type`.

```ts
let age: number = 30
let firstName: string = "Omar"
let isFictional: boolean = true
```

Once the type is declared, the variable is married to it. If I later write
`age = "thirty"`, TypeScript yells at me *before* compiling. That's the whole
point: errors show up while I'm typing, not when a user clicks the button.

### `null` vs `undefined`

The difference is more about intent than mechanics:

- **`null`** → "there's nothing here, **on purpose**". I decided to empty it.
- **`undefined`** → "there's nothing here, **and I didn't mean that**". Never assigned.

```ts
let something: null
let anotherThing: undefined
```

---

## 2. Arrays

Written as `type[]`. It means "an array where **every** element is that type".

```ts
let names: string[] = ['Mario', 'Luigi', 'Peach']
names.push('Bowser')   // ✅
names.push(42)         // ❌ error
```

### Type inference

This is one of the nicest things about TS: **you rarely have to write the type
by hand**. Give it an initial value and the compiler figures it out.

```ts
let fruits = ['apples', 'pears', 'bananas']  // TS already knows: string[]
fruits.push('peaches')                        // ✅
```

And if I mix types, it infers a **union** (see section 9):

```ts
let things = [1, true, 'hello']   // (string | number | boolean)[]
```

> ⚠️ **Careful with this `tsconfig`**: I have `noUncheckedIndexedAccess` turned on.
> That means `fruits[3]` is not `string`, it's `string | undefined` — because TS
> can't know whether that position actually exists. I have to check before using it
> (`if (f) { ... }`). Stricter than the default, but it kills the classic
> "cannot read property of undefined".

---

## 3. Object literals

You describe the shape of the object inside braces:

```ts
let user: { firstName: string, age: number, id: number } = {
    firstName: 'omar',
    age: 28,
    id: 1
}
```

The object has to have **exactly** those properties: no missing ones, no extra ones.

Inference works here too, and it's what you use 90% of the time:

```ts
let person = { name: 'Luigi', age: 28 }  // TS infers { name: string, age: number }
const personAge = person.age             // number
```

Writing the type inline like `user` gets unbearable fast — that's what
**interfaces** and **type aliases** are for (sections 7 and 8).

---

## 4. Functions

You type the parameters **and** the return value:

```ts
function addTwoNumbers(a: number, b: number): number {
    return a + b
}

const substractTwoNumbers = (a: number, b: number): number => {
    return a - b
}
```

### `void`

When a function doesn't return anything (it just *does* something, like logging),
the return type is `void`:

```ts
function addAllNumbers(items: number[]): void {
    const total = items.reduce((a, c) => a + c, 0)
    console.log(total)
}
```

> Detail worth remembering: `console.log(addAllNumbers([1,2,3]))` prints `undefined`,
> because the function doesn't return — it only logs internally.

### Return type inference

The return type can be omitted too; TS deduces it from the `return`:

```ts
function formatGreeting(name: string, greeting: string) {
    return `${greeting}, ${name}`   // TS infers: string
}
```

Still, **writing it by hand has value**: if I one day break the function and it
stops returning a string, the error shows up *inside* the function instead of
20 files away where it was used.

---

## 5. `any` — the escape hatch

`any` turns type checking off for that variable. It goes back to being plain JavaScript.

```ts
let anyAge: any
anyAge = 30
anyAge = 'thirty'   // ✅ ... anything goes
```

If I declare with no type and no value (`let title`), TS treats it as `any` too.

**So what's it good for?** Mostly **migrating projects from JS to TS**: I can mark
whatever isn't typed yet as `any` so the project compiles from day one, then remove
them little by little.

**When to avoid it?** Almost everywhere else. Every `any` is a little hole for
exactly the bugs I came to TypeScript to avoid.

---

## 6. Tuples

A regular array is "N things of the same type". A **tuple** is "exactly these
things, in this order, with these types".

```ts
let personTup: [string, number, boolean] = ['mario', 30, true]
```

Order matters: `[30, 'mario', true]` would be an error.

Where they shine:

```ts
// an HSLA color: number, percentage, percentage, opacity
let hsla: [number, string, string, number]
hsla = [200, '100%', '100%', 1]

// coordinates
let xy: [number, number]
xy = [94.7, 20.1]
```

### Returning multiple values from a function

This is **the** killer use case (and it's exactly React's `useState` pattern,
which I'll get to later):

```ts
function useCoords(): [number, number] {
    const lat = 100
    const long = 50
    return [lat, long]
}

const [lat, long] = useCoords()   // both: number
```

### Named tuples

Purely for readability — the name changes nothing at runtime, but the editor shows
you what each position means:

```ts
let userTup: [name: string, age: number]
userTup = ['mario', 30]
```

---

## 7. Interfaces

An interface is a **contract**: a reusable name for the shape of an object.

```ts
interface Author {
    name: string,
    avatar: string
}

const authorOne: Author = { name: 'mario', avatar: '/img/mario.png' }
const authorTwo: Author = { name: 'yoshi', avatar: '/img/yoshi.png' }
```

The good part is that they **compose** — one interface can use another as the type
of one of its properties:

```ts
interface Post {
    title: string,
    body: string,
    tags: string[],
    created_at: Date,
    author: Author      // 👈 reusing the interface above
}
```

And they're used anywhere a type would go:

```ts
function createPost(post: Post): void { ... }   // as a parameter
let posts: Post[] = []                          // as an array
```

Convention: **PascalCase** and singular (`Author`, `Post` — not `Authors`).

---

## 8. Type aliases

`type` names *any* type, not just objects. An interface only describes object
shapes; `type` is more general.

```ts
type Rgb = [number, number, number]      // alias for a tuple

function getRandomColor(): Rgb {
    const r = Math.floor(Math.random() * 255)
    const g = Math.floor(Math.random() * 255)
    const b = Math.floor(Math.random() * 255)
    return [r, g, b]
}
```

It works for objects too, same as an interface:

```ts
type User = {
    name: string,
    score: number
}

const userOne: User = { name: 'mario', score: 75 }
```

### `interface` vs `type` — which one?

For objects they're nearly interchangeable. Rule of thumb:

- **`interface`** → object shapes, especially ones that will grow or be extended.
- **`type`** → everything else: unions, tuples, aliases for primitives, functions.

Not worth agonizing over; both work. (They also differ in *how* you extend them —
`extends` vs `&`, see section 15.)

---

## 9. Union types

The `|` means "**either** this **or** that":

```ts
let someId: number | string
someId = 1      // ✅
someId = '2'    // ✅
someId = true   // ❌
```

Really useful for values that can be empty:

```ts
let email: string | null = null
email = "omarscoppola97@gmail.com"
email = null    // ✅ allowed on purpose
```

And unions can be stored in an alias:

```ts
type Id = number | string
```

### ⚠️ The union pitfall

If something is `number | string`, **I can only use what both types have in common**.
TS doesn't know which one it is right now, so it won't let me take the risk:

```ts
function swapIdType(id: Id): Id {
    // parseInt(id)  ❌ not allowed: if it were a number, this doesn't apply
    return id
}
```

Which leads straight into the next topic.

---

## 10. Type guards — the fix for that pitfall

A **type guard** is a runtime check that teaches TS which of the union's types
we're holding. Inside each branch TS "narrows" the type (this is called
*narrowing*) and then lets me use the type-specific methods:

```ts
function swapIdTypeGuard(id: Id) {
    if (typeof id === 'string') {
        return parseInt(id)     // ✅ here TS knows it's a string
    } else {
        return id.toString()    // ✅ here it knows it's a number
    }
}
```

It's the same logic I already wrote in JavaScript — the difference is the compiler
now *understands* it and unlocks the matching methods.

### Tagged interfaces (discriminated unions)

`typeof` works for primitives, but it can't tell two objects apart. The trick is
giving each interface a literal property that acts as a **tag**:

```ts
interface UserGuard {
    type: 'user',           // 👈 the tag
    username: string,
    email: string,
    id: Id
}

interface PersonGuard {
    type: 'person',         // 👈 the tag
    firstname: string,
    age: string,
    id: Id
}

function logDetails(value: UserGuard | PersonGuard): void {
    if (value.type === 'user') {
        console.log(value.email, value.username)      // ✅ only UserGuard props
    }

    if (value.type === 'person') {
        console.log(value.firstname, value.age)       // ✅ only PersonGuard props
    }
}
```

Note that `type: 'user'` is not `string` — it's the **literal type** `'user'`,
meaning that property can only ever hold that exact word. That's what lets TS rule
out the other branch. This pattern shows up constantly in real code (reducer
actions, API responses, loading states...).

---

## 11. Reusable interfaces

An interface doesn't have to describe a *whole* object. It can describe just the
one slice a function actually cares about:

```ts
interface hasQuantity {
    quantity: number
}

function printQuantity(item: hasQuantity): void {
    console.log(`the quantity of the item is ${item.quantity}`)
}
```

Now anything with a `quantity: number` fits, no matter what else it carries:

```ts
const fruit   = { name: 'mango', quantity: 50 }
const vehicle = { type: 'car',   quantity: 50 }
const personReusable = { name: 'mario', age: 30 }

printQuantity(fruit)          // ✅ has quantity (extra 'name' is fine)
printQuantity(vehicle)        // ✅ has quantity (extra 'type' is fine)
// printQuantity(personReusable)  ❌ no 'quantity' anywhere
```

This is structural typing again, but used *deliberately* as a design tool: type the
**minimum requirement**, not the full object. It's how you write functions that stay
reusable — `printQuantity` doesn't care about fruit or cars, only about `quantity`.

> Naming nit: interfaces are conventionally PascalCase, so this would usually be
> `HasQuantity`. Purely cosmetic, TS doesn't care.

### ⚠️ Gotcha: extra properties, variable vs literal

Passing `fruit` works even though it has an extra `name`. But passing the **same
shape written inline** fails:

```ts
printQuantity(fruit)                              // ✅
printQuantity({ name: 'kiwi', quantity: 3 })      // ❌ 'name' does not exist in type 'hasQuantity'
```

That's the **excess property check**: TS is stricter with fresh object literals passed
directly to a function, because an extra property there is almost always a typo or a
misunderstanding. Once the object lives in a variable, TS assumes you know what you're
doing and only checks that the required parts are present. Confusing the first time
you hit it — the error looks like a contradiction, but it isn't.

---

## 12. Function signatures

You can type a **function itself** — not what it returns, but its whole shape:
what it takes in and what it gives back.

```ts
type Calculator = (numOne: number, numTwo: number) => number
```

Read it as: "takes two numbers, returns a number". Note the `=>` here is part of the
*type*, not an arrow function. It says nothing about *how* the function works — any
implementation matching that shape qualifies.

```ts
function multiplyTwoNumbers(first: number, second: number) {
    return first * second
}

function joinTwoNumbers(numOne: number, numTwo: number) {
    return `${numOne}${numTwo}`     // returns a string!
}

let calcs: Calculator[] = []

calcs.push(multiplyTwoNumbers)   // ✅
// calcs.push(joinTwoNumbers)    ❌ returns string, not number
```

### The surprising one: fewer parameters is allowed

```ts
function squareNumber(num: number) {
    return num * num
}

calcs.push(squareNumber)   // ✅ ... even though Calculator takes TWO numbers
```

This isn't a bug. A function that **ignores** arguments it's handed is always safe —
whoever calls it through `Calculator` passes two numbers, `squareNumber` uses the
first and drops the second. Nothing breaks. The reverse would be unsafe: a function
needing *three* params would read an argument nobody passed.

It's the same reason `arr.map(x => x * 2)` works even though `map` hands your callback
three arguments (item, index, array) — you just take the one you need.

---

## 13. Function signatures inside interfaces

Same idea, used as a property of an object shape:

```ts
interface HasArea {
    name: string,
    calcArea: (a: number) => number
}
```

The interface says a `HasArea` must have a name **and** a method taking one number
and returning a number. What that number *means* is up to each implementation:

```ts
const shapeOne: HasArea = {
    name: 'square',
    calcArea(l: number) {        // l = side length
        return l * l
    }
}

const shapeTwo: HasArea = {
    name: 'circle',
    calcArea(r: number) {        // r = radius
        return Math.PI * r ** 2
    }
}
```

Both satisfy `HasArea` while doing completely different math. That's the payoff of
typing *shape* instead of implementation — and it's the same pattern as the
`format(): string` in section 14, just written with the arrow style.

> 🐛 **Bug alert from the source file**: `Math.PI * r^2` compiles, but it's wrong.
> In JavaScript `^` is **bitwise XOR**, not exponentiation — `5^2` is `7`, not `25`.
> The exponent operator is `**`, so it must be `r ** 2`. TypeScript can't catch this
> because XOR between two numbers *is* a valid `number`. A good reminder that types
> verify shape, never meaning.

---

## 14. Extending interfaces

An interface can build on another one with `extends`. The child gets everything the
parent has, plus whatever it adds:

```ts
interface HasFormatter {
    format(): string
}

interface Bill extends HasFormatter {
    id: string | number,
    amount: number,
    server: string
}
```

So a `Bill` needs `id`, `amount`, `server` **and** a `format()` method.

### Method signatures

`format(): string` inside an interface isn't a property holding a function — it's a
**method signature**. It says "whatever implements me must have a `format` method
that takes nothing and returns a string". The interface describes the shape; it
never says *how* it works.

### Structural typing (this is the big idea)

Notice that neither object below is annotated with `: HasFormatter`:

```ts
const userInterface = {
    id: 1,
    format(): string {
        return `This user has an id of ${this.id}`
    }
}

const bill = {
    id: 2,
    amount: 50,
    server: 'mario',
    format(): string {
        return `bill with id ${this.id} has ${this.amount} to pay`
    }
}
```

And yet both work here:

```ts
function printFormatted(val: HasFormatter): void {
    console.log(val.format())
}

printFormatted(userInterface)   // ✅
printFormatted(bill)            // ✅
```

This is **structural typing** (a.k.a. duck typing): TypeScript doesn't care about
declared labels, it cares about *shape*. If the object has a `format()` returning a
string, it counts as a `HasFormatter` — no `implements` keyword needed. Coming from
languages like Java or C#, this is the part that feels different.

### Why one of them fails

```ts
function printBill(bill: Bill): void {
    console.log(`server: ${bill.server}`)
    console.log(bill.format())
}

// printBill(userInterface)  ❌ missing 'amount' and 'server'
printBill(bill)              // ✅
```

`userInterface` satisfies `HasFormatter` but **not** `Bill` — it's missing two
properties. Same object, valid for one type and not the other, purely based on shape.
That's why the call is commented out in the file instead of deleted: it's there as a
reminder of the error.

Also worth noting: `this.id` inside `format()` works because TS infers `this` from
the object literal it's written in.

---

## 15. Extending type aliases (intersections)

Type aliases can't use `extends`. Their equivalent is `&`, the **intersection**
operator: "everything from A **and** everything from B".

```ts
type Person = {
    id: string | number,
    firstName: string
}

type UserAlias = Person & {
    email: string
}
```

So `UserAlias` requires `id`, `firstName` **and** `email` — all three.

```ts
const personOne: Person = {
    id: 1,
    firstName: 'Mario'
}

const personTwo: UserAlias = {
    id: '1',
    firstName: 'Yoshi',
    email: 'yoshi@gmail.com'
}
```

```ts
function printUser(user: UserAlias) {
    console.log(`${user.id}, ${user.email}, ${user.firstName}`)
}

// printUser(personOne)  ❌ Person has no 'email'
printUser(personTwo)     // ✅
```

### `|` vs `&` — don't mix them up

- **`|` (union)** → "either one **or** the other". *Fewer* things allowed, because
  you can only touch what both sides share (section 9).
- **`&` (intersection)** → "both at once". *More* requirements, because the object
  must satisfy every side.

Easy trap: `&` sounds like it should mean "one or the other" in English. It doesn't.

### So: `extends` or `&`?

They land in the same place for object shapes. Two practical differences:

- `interface ... extends` gives clearer error messages and can be **reopened** later
  (declaring the same interface twice merges it — useful for extending library types).
- `&` composes anything, not just object shapes, and reads better when you're already
  living in `type` land.

Same advice as section 8: pick one and stay consistent, don't agonize.

---

## Notes about this project

- Everything lives in **one file** (`src/index.ts`), in the chronological order I
  learned it, split by `/* 🦔 topic 🦔 */` banners.
- Since it's a single scope, **names can't repeat**. That's why there are odd
  suffixes like `personTup`, `userTup`, `UserGuard`, `IdGuard` — it's not style,
  redeclaring the same name is an actual error.
- Workflow (two terminals):
  ```
  tsc --watch                  # recompile on save
  node --watch dist/index.js   # run the output
  ```
- `dist/` is in `.gitignore` — it gets regenerated, never edited.

---

## What's next 🚀

- Finish "pure" TypeScript: generics, enums, classes, `unknown` vs `any`,
  utility types (`Partial`, `Pick`, `Omit`...).
- **Node + Express with TypeScript** → typing `req` and `res`, `@types/node`,
  `@types/express`, and finally a real `package.json`.
- **React with TypeScript** → typed props, `useState<T>()`, events, custom hooks.
