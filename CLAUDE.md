# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repository is

A personal TypeScript learning repository ("type-safe adventures"). It is not an application or a library — each top-level directory is a self-contained course/topic sandbox. Currently there is one: `ts-101/`.

Code here is written to be *type-checked and read*, not to be consumed. Most of `ts-101/src/index.ts` is a single running file of annotated examples grouped by topic with `/* 🦔 topic 🦔 */` banner comments, in the order the topics were learned (basics → arrays/objects → functions → `any` → tuples → interfaces → type aliases → unions → type guards). New material is appended to the end of that file under a new banner, not split into modules — keep that convention unless the user asks otherwise.

Because everything lives in one top-level scope, identifiers must be globally unique across the whole file. That's why later sections use suffixed names (`anyAge`, `personTup`, `userTup`, `IdGuard`, `UserGuard`, `PersonGuard`) — reusing an earlier name is a redeclaration error, not a style issue.

## Commands

There is no `package.json` and no test runner. Everything goes through a globally installed `tsc`, run from inside `ts-101/`:

```bash
cd ts-101
tsc                       # compile src/ -> dist/
tsc --watch               # recompile on save
node --watch dist/index.js  # run the compiled output, in a second terminal
tsc --noEmit              # type-check only
```

`dist/` is gitignored; regenerate it rather than editing it.

## tsconfig notes that affect how code must be written

`ts-101/tsconfig.json` is the stock `tsc --init` output with `rootDir`/`outDir` uncommented, so a few non-default flags are on and will reject otherwise-fine code:

- `noUncheckedIndexedAccess` — indexing an array yields `T | undefined`. `fruits[3]` is `string | undefined`, so narrow before use.
- `exactOptionalPropertyTypes` — `{ x?: string }` will not accept an explicit `undefined`.
- `verbatimModuleSyntax` + `isolatedModules` — type-only imports must be written `import type`.
- `moduleDetection: "force"` — every file is a module, so `index.ts` top-level names are file-scoped, not truly global.
- `"types": []` and no `lib` override — Node globals are unavailable. `console.log` currently resolves only via DOM lib inference; if Node APIs are needed, uncomment the `lib`/`types` lines in the tsconfig and install `@types/node`.
