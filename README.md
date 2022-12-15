TODOs:

- package test (tar.gz import => types working? import working? build working? ...)
- playground
- interactive preview in docs?
- README update
- unit tests
- vscode plugin

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

also available without functions (lite-version)

```js
import { parse } from 'ahocon/lite';

parse(...) // results in a json suiting the provided hocon (which is provided as string)
```

<br />

# syntax

(Better documentation coming soon.. 😕)

Some notable notes about the syntax:

- values are autoformatted if raw (not in string quotes)! (extendable!)
  - `a = 1` => `{ a: 1 }` (same with negative nums, floats or nums containing e)
  - `a = true` => `{ a: true }` (same with false)
  - `a = null` => `{ a: null }`
  - `a = undefined` => `{ a: undefined }`
- keys can be nested object paths! `a.b.c = 1` => `{ a: { b: { c: 1 } } }`
- AHOCON provides no direct refing as HOCON, it provides functions instead (including a ref function)! (extendable!)
  - `a = 1, b = $ref(a)` => `{ a: 1, b: 1 }` (attention: this only references, it's no clone!)
  - `a = {}, b = $clone(a)` => `{ a: {}, b: {} }` (cloned, not the same reference anymore)
- AHOCON provides auto-string-dedenting (when using a triple-quote of `"`, `'` or `) and raw strings (single quotes of the same types, can also be multiline tho)
  ```
    a = '
      test
      test
    '       # => { a: '\n    test\n    test' }
    a = '''
      test
      test
    '''     # => { a: 'test\ntest' }
  ```
- comments in multiple formats everywhere usable (singleline/multiline/inline)
  - `# singleline` (ends with eof/eos or newline)
  - `// singleline` (ends with eof/eos or newline)
  - `/* multiline or inline */`

<br />

## examples

```
# comment
// comment
/*
  comment
*/

# string
string = abc

# number
number = 123

# boolean
bool = true

# null
null = null

# undefined
undefined = undefined

# nested object shorthand for short { hand = 123 }
short.hand = 123

# object (assignment is omitable)
obj {
  value = 123
  nested {
    otherValue = 456
    someArray = [1,2,3]

    # refs starting with dot are referencing relatively to their position
    ref: $ref(.otherValue)
  }
}

# array
arr [
  0,1,6
  2
  3
  4,
  { obj: inside }

  # ref within array pointing on index 0
  $ref(.0)
]

# merge same objects (with overwrites on same keys)
config {
  a = 1
}
config { # => overwrites config.a above and adds b
  a = 2
  b = 1
}
# shorthands also overwrite when conflicting!
config.a = 3
```

so a usage might look like:

```js
import { parse } from 'ahocon';

let ahocon = `
# PARSE ME SENPAI

a = 1
b = "2"
arr [
  1,2,3
  4
]
`;

// obj => { a: 1, b: "2", arr: [1,2,3,4] }
const obj = parse(ahocon);

console.log(obj.a, typeof obj.b, obj.arr.length);
```

(or for typescript)

```ts
import { parse } from 'ahocon';

interface MyInterface {
  a: number;
  b: string;
  arr: Array<number>;
}

let ahocon = `
# PARSE ME SENPAI

a = 1
b = "2"
arr [
  1,2,3
  4
]
`;

// obj => { a: 1, b: "2", arr: [1,2,3,4] }
// & type MyInterface
const obj = parse<MyInterface>(ahocon);

console.log(obj.a, typeof obj.b, obj.arr.length);
```

<br />

# upcoming

- (new) docs & README..
- improved playground
- tests
- little subpackages (math, convert, ...)
- vscode extension
