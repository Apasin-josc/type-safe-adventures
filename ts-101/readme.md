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