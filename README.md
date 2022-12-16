![GitHub package.json version](https://img.shields.io/github/package-json/v/steve-py96/ahocon?style=flat-square&color=000000)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/ahocon?style=flat-square&color=000000)

# getting started

## documentation

https://steve-py96.github.io/ahocon/

## what is AHOCON?

AHOCON (short for Another HOCON, or something 🇯🇵 + 🇪🇸?) is a custom implementation of the [HOCON grammar](https://github.com/lightbend/config/blob/master/HOCON.md).
The goal is to provide a dead simple grammar to write configurations in and of course a parser to parse that configuration to a usable format (aka JSON).
AHOCON is also extendable via custom functions (more about this in the [advanced section](https://steve-py96.github.io/ahocon/advanced)) later.

## where can I use AHOCON?

- Browser
- Node
- ...? (not tested in more runtimes yet)

## install

### pnpm

```sh
pnpm add ahocon
```

### npm

```sh
npm install ahocon
```

### yarn

```sh
yarn add ahocon
```

## use

Import the `parse` function from the previously installed [`ahocon`](https://www.npmjs.com/package/ahocon) package and use it on your configuration (which needs to be a string).
It will return an object representing your configuration.

```javascript
import { parse } from 'ahocon';

const myConfig = parse('example = true /* comment */');

console.log(myConfig); // logs { "example": true }
```

## typescript

AHOCON is built in typescript, therefore it naturally supports typecasting on the parse.

```typescript
import { parse } from 'ahocon';

interface MyConfig {
  example: boolean;
}

const myConfig = parse<MyConfig>('example = true /* comment */');

console.log(myConfig); // logs { "example": true }

type TypeofMyConfig = typeof myConfig; // shows MyConfig
```

### warning

AHOCON is not a type / schema checker. Consider using [zod](https://www.npmjs.com/package/zod) or similar if the configuration isn't static or comes from a user and needs to be validated.

```typescript
import { parse } from 'ahocon';
import { z } from 'zod';

const schema = z
  .object({
    example: z.boolean(),
  })
  .strict(); // don't allow other keys

const myConfig = parse<z.infer<typeof schema>>('example = true'); // type { example: boolean }
const evilUserConfig = parse<z.infer<typeof schema>>('example = 123'); // type { example: boolean }

schema.parse(myConfig); // all good
schema.parse(evilUserConfig); // ZodError
```
