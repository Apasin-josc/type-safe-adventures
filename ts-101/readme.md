# Typescript 101

## to compile a ts file into js
```
tsc index.ts
node index.js
```

## better workflow with tsconfig
```
tsc --init


uncommenting the src and dist lines from the tsconfig.json
"compilerOptions": {
    // File Layout
    "rootDir": "./src",
    "outDir": "./dist",

josescoppola@QUE-PADRE ts-101 % tsc

josescoppola@QUE-PADRE ts-101 % tsc --watch
josescoppola@QUE-PADRE ts-101 % node --watch dist/index.js
```

## topics covered

All the TypeScript topics from `src/` are written up, with examples and gotchas,
in **[NOTES.md](./NOTES.md)**:

basics · arrays & inference · object literals · functions & `void` · `any` ·
tuples · interfaces · type aliases · unions · type guards · reusable interfaces ·
function signatures · extending interfaces (`extends`) · intersections (`&`) ·
classes · inheritance, `abstract` & `implements`

## running a specific file

`tsc --watch` compiles everything under `src/`, but `node` runs one entry point:

```
node --watch dist/index.js
node --watch dist/class.js
```
