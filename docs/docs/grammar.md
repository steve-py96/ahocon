# grammar

JSON is actually valid AHOCON - that said the question "why AHOCON then?" pops up.
AHOCON provides shorthands, simpler and easier to read grammar than JSON - that's why.
To compare them directly each explained feature is also compared to it's output / respective JSON representation.

## the root-type

In AHOCON it's like in JSON, the first character decides the "root-type".
Here you can decide if you want to have an object or an array as output (which also has direct influence on the way you define things).

### object

::: tip AHOCON

```

```

:::

::: danger JSON

```json
{}
```

:::

Yes, AHOCON doesn't require anything to be an object.
However, it's of course still possible and results in the same result as the 2 examples above.

::: tip AHOCON

```
{}
```

:::

Under the hood the parser automatically adds those 2 parenthesis by default (if you didn't declare the whole thing an [array](#array)).

### array

JSON with array as root-type is also very common, AHOCON does it here the JSON way.

::: tip AHOCON

```
[]
```

:::

::: danger JSON

```json
[]
```

:::

## assignments

In objects we have to assign values to keys (reminder: in arrays you just have values, therefore you don't need assignments).
In JSON you do this with the colon (`:`), in AHOCON you have the free choice between colon (`:`), equal sign (`=`) or the colon equal sign (`:=`).

::: tip AHOCON

```
a : 1

# or

a = 1

# or

a := 1
```

:::

::: danger JSON

```json
{
  "a": 1
}
```

:::

::: info
As in JSON whitespaces don't really matter in AHOCON. The following two takes would result in the same product.

```
a = 1

# vs

a       =      1
```

:::

## keys

Keys in AHOCON are not just keys, they're way more powerful than they seem.

### duplicate keys

First of all, unlike in JSON, duplicate keys in AHOCON aren't discouraged.
The behavior is equal tho (the first set value is overwritten).

::: tip AHOCON

```
a = 1
a = 2
```

:::

::: danger JSON

```json
{
  "a": 1,
  "a": 2
}
```

:::

Both result in `{ "a": 2 }` but editors and validators will show and throw errors on JSONs trying this and the JSON spec generally says keys should be unique.
Meanwhile they're all fine in AHOCON and lead to even more functionality as shown in the [section below](#nested-objects).

### nested objects

Keys in AHOCON can also generate nested objects.

::: tip AHOCON

```
a.b.c = 1
```

:::

::: danger JSON

```json
{
  "a": {
    "b": {
      "c": 1
    }
  }
}
```

:::

Duplicate keys (at least partially duplicate, when creating nested objects) are handy in AHOCON since they merge objects and arrays (not hard-overwriting).
Example:

::: tip AHOCON

```
a.b.c = 1
a.b.d = 2
```

:::

Results in `{ "a": { "b": { "c": 1, "d": 2 } } }` (the first `a.b` is merging with the second `a.b` instead of being overwritten).

Using numbers you can also define arrays in those paths (note: [sparse arrays](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Indexed_collections#sparse_arrays) possible).

::: tip AHOCON

```
a.b.0 = 1
```

:::

::: danger JSON

```json
{
  "a": {
    "b": [1]
  }
}
```

:::

::: info
You can also use strings as keys (spoiler alert: AHOCON supports strings, [string section](#strings) is coming below) to avoid paths and use special characters.

```
'a.b.c' = 1

'a.b'.c = 2
```

This would result in `{ "a.b.c": 1, "a.b": { c: 2 } }`.
This "trick" can also be used to create objects with number keys (instead of arrays) as here:

```
a.b.'0' = 1
```

This wouldn't create an array as previously shown, this would generate `{ "a": { "b": { "0": 1 } } }`.
Also worth noting: Strings as keys have the same power as normal strings (dedenting / multiline), more to those things in the [next section](#strings)
:::

## strings

AHOCON supports, as previously spoilered, strings. JSON also does but it's quite a hassle to write multiline strings in casual JSON.
In JSON you're also bound to double quotes (`"`) which can be a pain when having to escape double quotes within strings..
AHOCON supports multiple quotes to avoid this issue, you can choose between single quotes (`'`), double quotes (`"`) and backticks (<code>`</code>).
Also AHOCON supports multilines without any struggles, just do newlines and type :D.

::: tip AHOCON

```
a = "
  This
  is a
    multiline string
"
```

:::

::: danger JSON

```json
{
  "a": "\n  This\n  is a\n    multiline string\n"
}
```

:::

But wait, there's more! You can use triple quotes (doesn't matter which) to trim and dedent (= remove indent, aka leading whitespaces) your multiline string.
AHOCON measures the first found line and dedents each following line like that. Therefore...

::: tip AHOCON

```
a = """
  This
  is a
    multiline string
"""
```

:::

::: danger JSON

```json
{
  "a": "This\nis a\n  multiline string"
}
```

:::

::: info
Multiline and dedenting work also on string [keys](#keys).
:::

But wait, there's a final more! AHOCON strings can also be written **without any quotes** while they're not containing special characters (for example quotes :D).
Therefore:

::: tip AHOCON

```
a = on
b = off
c = this is nice
```

:::

::: danger JSON

```json
{
  "a": "on",
  "b": "off",
  "c": "this is nice"
}
```

:::

::: info
Note: New lines are special characters, normal spaces are fine for the parser. (just in case you wonder)
:::

## comments

Unless you use JSONc or any other JSON superset you don't have comments in JSON.
AHOCON provides the usual comment types. So it provides single line comments via hashtag (`#`) or double slash (`//`) and inline / multiline comments via `/* */`.

::: tip AHOCON

```
# single line comment
// single line comment
/* inline comment */
/*
  multiline comment
*/
```

:::

::: info
As usual in programming languages single line comments end the line literally, doing stuff after `#` or `//` won't affect anything until the new line started.
:::

::: info
Since JSON has no comment functionality comments are omited completely when parsing.
:::

## primitives

AHOCON supports, just like JSON, the casual primitives (strings, numbers, booleans, null). Note: AHOCON additionally supports undefined, JSON isn't aware of that primitive.
AHOCON sets the types automatically (just as JSON does), so here in short:

::: tip AHOCON

```
a = string
b = "string"
c = 123
d = 1.23
e = true
f = false
g = null
h = undefined
```

:::

::: danger JSON

```json
{
  "a": "string",
  "b": "string",
  "c": 123,
  "d": 1.23,
  "e": true,
  "f": false,
  "g": null
}
```

:::

## arrays and objects

There's not much to say about arrays and objects in AHOCON, they behave like in JSON. The only difference is mainly that you have the free choice of how to [assign](#assignments) values and that you can omit quotes on stuff... You thought. Considering you read yourself through the whole documentation above until this point you might have noticed this thing maybe: AHOCON does not require commas to separate things. This is of course of course only half the truth, the previous examples all showed newlines as separator instead of comma (which is why strings with newlines aren't the same as strings with whitespaces, see last info in [strings](#strings)). This is also the case in arrays, to demonstrate:

::: tip AHOCON

```
a = {
  key1 = 1 # no comma here
  key2 = 2
}

b = { key1 = 1, key2 = 2 } # comma cause inline

c = [
  1 # no comma here
  2
]

d = [1, 2] # comma cause inline
```

:::

::: danger JSON

```json
{
  "a": {
    "key1": 1,
    "key2": 2
  },
  "b": {
    "key1": 1,
    "key2": 2
  },
  "c": [1, 2],
  "d": [1, 2]
}
```

:::

Besides of that you can also mix the separators freely like...

::: tip AHOCON

```
a = [
  1,2
  3
  4,5
  6
]   # results in [1,2,3,4,5,6]
```

:::

... which isn't recommended due to readability, but that's up to you.

Another tiny thing AHOCON let's you do is omiting the assignment when using objects / arrays (only them, primitives **always** require one).

::: tip AHOCON

```
a {
  key1: 1
  key2: 2
}

b [
  1
  2
]
```

:::

::: danger JSON

```json
{
  "a": {
    "key1": 1,
    "key2": 2
  },
  "b": [1, 2]
}
```

:::

::: info
This is also allowed in nested structures!

```
a {
  b {
    c {
      d = 1
    }
  }
  e [
    {
      f [
        0
      ]
    }
  ]
}
```

:::
