# package

The main package, `ahocon`, is the basic AHOCON. It provides the parser and nothing more.

Instead of importing from `ahocon` you can also import from the subdirectory `ahocon/extended` which allows the usage of functions within the parsing process (see [advanced](/advanced) for this).
When using the extended package you also can integrate predefined functions from the `ahocon/funcs` subdirectory. You can find there f.e. some
math utilities (like add, subtract, multiply), a simple memory size converter (can convert anything from bit to tebibyte) or a ref function (to create references within the created object).

::: info
If you don't need functions it's recommended to use the basic AHOCON (since it has the functions tree-shaked out and is lighter therefore).
:::
