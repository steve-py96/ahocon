![GitHub package.json version](https://img.shields.io/github/package-json/v/steve-py96/ahocon?style=flat-square&color=000000)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/ahocon?style=flat-square&color=000000)
![npms score](https://img.shields.io/npms-io/final-score/ahocon)

# AHOCON

Ahocon (short for Another [HOCON](https://github.com/lightbend/config/blob/master/HOCON.md)) (or sth japanese + spanish?) is a little superset of [HOCON](https://github.com/lightbend/config/blob/master/HOCON.md) in a self-written parser. <br /> <br />

TL;DR (HOCON-link): HOCON is a JSON-subset which allows simpler writing style for humans (omiting quotes f.e., see [syntax below!](#syntax)).

<br />

# supported environments

- Node
- Browser

<br />

# how to use

1. `yarn add ahocon` in your project
1. import as shown below

```js
import { parse } from 'ahocon'

parse(...) // results in a json suiting the provided hocon (which is provided as string)
```

also available for typescript

```ts
import { parse } from 'ahocon'

parse<...>(...) // results in a json suiting the provided hocon
```

<br />

# syntax

Some notes about the syntax:

- top-level `{}` is omitable (unless you want a top-level array, then you need top-level `[]`)
- assigning variables can be done (no matter where) with `:` or `=`
- variable keys can be a path (`a.b.c` resolves to value c in object b in object a, or as JSON `{ a: { b: { c: ... } } }`)
- there are single-line comments (`#` or `//`) and inline/multiline comments (`/* ... */`), they don't appear in the produced json
- string quotes can be omitted in many cases (for keys AND values), cases where they should/have to be used:
  - you want to preserve whitespaces
  - you want to use some special character (like `@`) at some special spot (you'll find out once an error appears, try with omiting til then cause it's love \<3)
- commas are omitable everywhere (unless you want to do inline action like `array = [1,2,3]`)
- assignments are omitable for objects and arrays
- refs (referencing other values) are possible via `${reference_path}` or `@reference_path` (they even support relative refs via `@.`)
- conflicting objects merge (the later value definition wins if they occur to have the same value keys)

<br />

## examples

```
# comment
// comment
/*
  comment
*/

# types (assigning is possible via = and :, remember!)
string = abc # => { string: "abc" }
number = 123 # => { number: 123 } # => floats ofc also
bool = true => { bool: true }
null = null # => { null: null }
undefined = undefined { undefined: undefined }
short.hand = 123 # => { short: { hand: 123 } }

# objects (commas are optional, remember!)
obj {
  value = 123
  nested {
    otherValue = 456
    someArray = [1,2,3]
    ref: @.otherValue # => will be 456 here (obj[otherValue])
  }
}

# arrays (commas are optional, remember!)
arr [
  0,1,6
  2
  3
  4,
  { obj: inside }
  @.0 # => will be 0 here (arr[0])
]

# refs
value = 123
valueRef = @value
nestedValue = { other = 2 }
nestedRef = @nestedValue.other

# merges
config {
  a = 1
}

config { # => overwrites config.a above and adds b
  a = 2
  b = 1
}

config.a = 3 # => overwrites config.a again via shorthand
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
