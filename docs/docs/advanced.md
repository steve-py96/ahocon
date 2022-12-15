# advanced

What is "advanced" AHOCON? Well as often in coding you can do kinda nasty stuff somewhere in the libraries - AHOCON is no exception here.

## functions

You can change your import from `import { parse } from 'ahocon'` to `import { parse } from 'ahocon/extended'` to integrate function parsing.
Importing the extended version of AHOCON expands the grammar. To use functions you need to provide them, there are none defined out-of-the box inside the parser.

```js
import { parse } from 'ahocon/extended';

parse('example = true', {
  functions: {
    // your functions here, can also be nested objects (aka emulating namespaces)
  },
});
```

AHOCON provides some predefined example functions within the `ahocon/funcs`-subdirectory, but you're able to create your owns, just be inspired:
https://github.com/steve-py96/ahocon/tree/main/src/funcs/

Let's say you include the math namespace...

```js
import { parse } from 'ahocon';
import * as math from 'ahocon/funcs/math'; // math = { add, subtract, divide, multiply }

parse('example = true', {
  functions: {
    math,
  },
});
```

::: tip AHOCON

```
a = $math.add(1,2,3)
```

:::

Result would be `{ "a": 6 }`.

What happens here is that the AHOCON parser notices the `$` and does a look-up in the config functions. Since the function name contains a dot it'll look up math as namespace and inside math for add. Once found it'll call the function with all values within the parenthesis parsed (so 1 2 and 3 are passed as numbers, not strings).

::: info
A namespace is of course no must, if you import it like `import { add } from 'ahocon/funcs/math'` and include it alone like `functions: { add }` it'll be called via `$add(...)`.
:::

::: danger
It's in general discouraged to use namespace imports (since they ruin tree-shaking), but in case you define a file full of functions and use the namespace here it'd be completely fine (just to underline that general bad practice is not always bad).
:::

::: danger
Note: It's not recommended to use heavy operations in these functions, they're for light operations or light extensions (you might use this library in node and connect the fs with configs for example, but it shouldn't be used for rocket launches :D). If you wanna launch rockets analyse / modify the outcoming object instead!
:::

If you wanna write your own functions: Your function will receive:

```typescript
interface CustomFunctionParams {
  args: Array<unknown>;
  root: AHOCON.PickNode<'root'>;
  node: AHOCON.PickNode<'function'>;
  parseNode: (node: AHOCON.Node) => unknown;
}
```

It's recommended here to write as many assertions for the arguments as possible (f.e. in math libraries you should always assert every value to be a number).
`args` are the arguments provided in the AHOCON config, `root` is the top-node in the AHOCON parsing AST (yes, it's a simplistic AST!), node is the current node (of the function itself). `parseNode` can be helpful if you analyse other nodes in the tree and need their value. To finish your function you don't return the value: you set it via `node.evaluated = ...` (yes mutations are mostly disgusting without observables but it saves memory and further logic here).

::: danger
Note: AHOCON doesn't protect you from building endless loops with functions (which is possible with the example `ahocon/funcs/ref` function).
For example:

```typescript
import { parse } from 'ahocon';
import { ref } from 'ahocon/funcs/ref';

parse(
  `
  # how it's supposed to be used, good_b will be 1 too
  good_a = 1
  good_b = ref($good_a)

  # how it can be misused (they'll crash due to an endless loop)
  a = $ref(b)
  b = $ref(a)
`,
  {
    functions: {
      ref,
    },
  }
);
```

:::

## preparse

AHOCON goes through 2 steps when parsing:

1. parse the input string to AST-nodes
2. parse the AST-nodes to an object

`preparse` gives the opportunity to get between those processes: You can manipulate the AST before it gets parsed.

```typescript
type PreparseHook = (root: AHOCON.ParseNode<'root'>) => unknown;
```

Since everything is possible here there's not much to say but enjoy to discover :D.
