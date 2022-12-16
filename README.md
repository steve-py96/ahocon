![GitHub package.json version](https://img.shields.io/github/package-json/v/steve-py96/ahocon?style=flat-square&color=000000)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/ahocon?style=flat-square&color=000000)

# AHOCON

AHOCON (short for Another [HOCON](https://github.com/lightbend/config/blob/master/HOCON.md)) (or sth japanese 🇯🇵 + spanish 🇪🇸?) is a little superset of [HOCON](https://github.com/lightbend/config/blob/master/HOCON.md) in a self-written parser.

TL;DR (HOCON-link): HOCON is a JSON superset which allows simpler writing style for humans (omiting quotes f.e., see [syntax below!](#syntax)).

<br />

# supported environments

- Node
- Browser

<br />

# playground

(temporarily dead, coming back soon!)

<br />

# documentation

https://steve-py96.github.io/ahocon/

<br />

# how to use

1. `npm install ahocon` / `yarn add ahocon` / `pnpm add ahocon` in your project
1. import as shown below

```js
import { parse } from 'ahocon'

parse(...) // results in a json suiting the provided hocon (which is provided as string)
```

also available for typescript

```ts
import { parse } from 'ahocon'

parse<...>(...) // results in a json suiting the provided hocon (which is provided as string)
```

# upcoming / TODOs

- new improved playground
- vscode plugin
- tests (unit / post-build)
