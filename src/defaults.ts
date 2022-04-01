import { BaseLexer } from './lexer';
import { BaseParser } from './parser';
import { CyclicError, EOFError, FuncResolveError, ParserError, ParserTypeError } from './errors';
import {
  LEXER_ASSIGNMENT,
  LEXER_COMMA,
  LEXER_OBJECT_OPEN,
  LEXER_OBJECT_CLOSE,
  LEXER_ARRAY_OPEN,
  LEXER_ARRAY_CLOSE,
  LEXER_STRING,
  LEXER_SINGLELINE_COMMENT,
  LEXER_MULTILINE_COMMENT_OPEN,
  LEXER_MULTILINE_COMMENT_CLOSE,
  LEXER_NEW_LINE,
  LEXER_RAW,
  LEXER_WHITESPACE,
  LEXER_FUNCTION,
  LEXER_FUNCTION_OPEN,
  LEXER_FUNCTION_CLOSE,
  CONST_ARRAY,
  CONST_STRING,
  CONST_RAW,
} from './statics';
import { detectedValue, optional, prettifyString, resolvePath, splitPath } from './utils';
import { funcs } from './internal_funcs';

export { Lexer, Parser };

class Lexer extends BaseLexer {
  constructor() {
    super(
      {
        name: LEXER_ASSIGNMENT,
        regex: /:=|[:=]/,
      },
      {
        name: LEXER_COMMA,
        regex: /,/,
      },
      {
        name: LEXER_OBJECT_OPEN,
        regex: /\{/,
      },
      {
        name: LEXER_OBJECT_CLOSE,
        regex: /\}/,
      },
      {
        name: LEXER_ARRAY_OPEN,
        regex: /\[/,
      },
      {
        name: LEXER_ARRAY_CLOSE,
        regex: /\]/,
      },
      {
        name: LEXER_FUNCTION,
        regex: /\$[-_a-z\d.]+/i,
      },
      {
        name: LEXER_FUNCTION_OPEN,
        regex: /\(/,
      },
      {
        name: LEXER_FUNCTION_CLOSE,
        regex: /\)/,
      },
      {
        name: LEXER_STRING,
        regex: /"""|'''|```|["'`]/,
      },
      {
        name: LEXER_SINGLELINE_COMMENT,
        regex: /(?:#|\/\/)/,
      },
      {
        name: LEXER_MULTILINE_COMMENT_OPEN,
        regex: /\/\*/,
      },
      {
        name: LEXER_MULTILINE_COMMENT_CLOSE,
        regex: /\*\//,
      },
      {
        name: LEXER_NEW_LINE,
        regex: /\n/,
      },
      {
        name: LEXER_WHITESPACE,
        regex: /\s/,
      }
    );
  }
}

class Parser extends BaseParser<
  Lexer,
  Partial<AHOCON.ParserOptions> & { funcs: AHOCON.ParserOptions['funcs'] }
> {
  constructor() {
    super(new Lexer());

    this.options = { funcs } as unknown as Partial<AHOCON.ParserOptions> & {
      funcs: AHOCON.ParserOptions['funcs'];
    };
  }

  override parse<X extends {} = {}>(str: string, options?: Partial<AHOCON.ParserOptions>) {
    if (typeof str !== 'string')
      throw Error(`HOCON.parse(...) requires a string argument first! got ${typeof str}`);

    // assign params on defaults
    this.options = Object.assign(
      {
        funcs,
      },
      options
    );
    // add globals

    let tokens = this.trimTokens(this.lexer.lex(str));

    if (tokens.length === 0) return {} as X;
    // 1 token can't be any assigment, empty object or anything
    if (tokens.length === 1 && tokens[0].token.name !== LEXER_SINGLELINE_COMMENT)
      throw new ParserError(
        {
          index: 0,
          currentPath: [],
          deferred: {},
          tokens,
        },
        `expected at least 2 tokens, got 1`
      );

    // stores the currentPath within nested objects (= useful meta information for refs f.e.)
    const currentPath: AHOCON.ParserContext['currentPath'] = [],
      // refs and funcs are deferredly handled
      deferred: AHOCON.ParserContext['deferred'] = {};

    // add top-level parentheses if omitted (so either OBJECT_OPEN or ARRAY_OPEN can handle the rest)
    if (tokens[0].token.name !== LEXER_OBJECT_OPEN && tokens[0].token.name !== LEXER_ARRAY_OPEN)
      tokens = [
        {
          content: '{',
          token: {
            name: LEXER_OBJECT_OPEN,
            regex: this.lexer.tokenMap[LEXER_OBJECT_OPEN],
          },
          index: -1,
        },
        ...tokens,
        // adds } after a new line in case the code ends with a singleline comment
        {
          content: '\n',
          token: {
            name: LEXER_NEW_LINE,
            regex: this.lexer.tokenMap[LEXER_NEW_LINE],
          },
          index: -1,
        },
        {
          content: '}',
          token: {
            name: LEXER_OBJECT_CLOSE,
            regex: this.lexer.tokenMap[LEXER_OBJECT_CLOSE],
          },
          index: -1,
        },
      ];

    const { computed, next } = this.call(
      {
        index: 0,
        deferred,
        tokens,
        currentPath,
      },
      tokens[0].token.name
    );

    if (next !== tokens.length)
      throw new ParserError(
        {} as AHOCON.ParserContext,
        `expected more assignments, got ${LEXER_OBJECT_CLOSE}`,
        next
      );

    const calledFuncs = Object.getOwnPropertySymbols(deferred).map((self) => deferred[self]),
      isDeferredSymbol = (arg: unknown): arg is symbol =>
        typeof arg === 'symbol' && arg in deferred;

    // stores the results of evaluated funcs
    const results: Record<symbol, unknown> = {};
    const dependencies: Record<symbol, Array<(value: unknown) => void>> = {};
    const cleanups: Array<() => void> = [];

    for (const func of calledFuncs) {
      const funcArgs = func.args.filter(isDeferredSymbol);
      const exec = this.options.funcs[func.name];

      if (!exec) throw new FuncResolveError(`${func.name} not found!`);

      const executeFunc = () =>
        exec({
          abs: computed!.value as Record<string | number, unknown>,
          args: func.args,
          ref: func.ref!,
          argsRaw: func.argsRaw,
        });

      // create a depedency object
      const createDependency = (sym: symbol) => {
        dependencies[sym] = dependencies[sym] || [
          (value) => {
            results[func.self] = value;
          },
        ];
        dependencies[sym].push(() => resolveDependencies());
      };

      // resolve all dependants of a dependency and set the value if necessary
      const resolveDependencies = () => {
        if (dependencies[func.self]) {
          for (const cb of dependencies[func.self]) cb(results[func.self]);

          delete dependencies[func.self];
        }

        if (func.refKey !== null) func.ref![func.refKey] = results[func.self];
      };

      // without arguments it can be executed immediately
      if (funcArgs.length === 0) {
        // execute the function
        const { value: result, cleanup } = executeFunc();

        if (cleanup && func.refKey !== null) cleanups.push(() => cleanup(func.refKey!));

        // ref f.e. returns a reference which doesn't necessarily need to be resolved
        if (isDeferredSymbol(result)) {
          // if the value exists take it instantly
          if (result in results) {
            results[func.self] = results[result];

            resolveDependencies();
            // else set it as dependant
          } else createDependency(result);
        } else {
          // value is not a reference, it can be used therefore
          results[func.self] = result;

          resolveDependencies();
        }
      } else {
        // register as dependency
        for (const arg of funcArgs) {
          if (arg in results) {
            // arg was evaluated already, can be replaced instantly
            func.args.splice(func.args.indexOf(arg), 1, results[arg]);
          }
        }

        const deferredArgs = func.args.filter(isDeferredSymbol);

        // if no deferreds are found anymore it can be executed and resolved
        if (deferredArgs.length === 0) {
          const { value, cleanup } = executeFunc();
          results[func.self] = value;

          if (cleanup && func.refKey !== null) cleanups.push(() => cleanup(func.refKey!));

          resolveDependencies();
        } // register the dependendant otherwise
        else {
          for (const arg of deferredArgs) createDependency(arg);
        }
      }
    }

    const deps = Object.getOwnPropertySymbols(dependencies);

    // check for cyclic references (they can't resolve)
    if (deps.length !== 0) throw new CyclicError(deps.map((dep) => dep.description).join(','));

    // cleanup everything
    cleanups.forEach((cleanup) => cleanup());

    return computed!.value as unknown as X;
  }

  /*
    *************************************
    helpers
    *************************************
  */

  /** @description trims WHITESPACEs and NEW_LINES */
  trimTokens(tokens: Array<AHOCON.LexerContext>) {
    const re = tokens.slice();

    if (re.length === 0) return re;

    const shouldTrim = (index: number) => {
      const { name } = re[index].token;

      return name === LEXER_WHITESPACE || name === LEXER_NEW_LINE;
    };

    while (shouldTrim(0)) re.shift();
    while (shouldTrim(re.length - 1)) re.pop();

    return re;
  }

  /** @description asserts the proper type */
  assert(ctx: AHOCON.ParserContext, type: string, index?: number) {
    if (ctx.tokens[optional(index, ctx.index)].token.name !== type)
      throw new ParserTypeError(ctx, type, index);
  }

  /** @description extracts the value between 2 provided indexes */
  extractContent(ctx: AHOCON.ParserContext, { from, to }: { from: number; to: number }) {
    return ctx.tokens
      .slice(from, to)
      .map((item) => item.content)
      .join('');
  }

  /** @description noop handler for ignored tokens */
  noop(
    ctx: AHOCON.ParserContext,
    { newIndex, increment }: Partial<{ newIndex: number; increment: number }> = {}
  ): ReturnType<AHOCON.ParserCallback> {
    return {
      next: optional(newIndex, ctx.index) + optional(increment, 1),
      computed: null,
    };
  }

  /** @description loops while it's not eof and the condition is true */
  loop(
    ctx: AHOCON.ParserContext,
    condition: (token: string, index: number, rawContent: string) => boolean,
    start?: number
  ): [eof: boolean, newIndex: number] {
    let tmpIndex = optional(start, ctx.index + 1);

    for (
      ;
      tmpIndex < ctx.tokens.length &&
      condition(ctx.tokens[tmpIndex].token.name, tmpIndex, ctx.tokens[tmpIndex].content);
      tmpIndex += 1
    );

    const eof = tmpIndex === ctx.tokens.length;

    return [eof, tmpIndex];
  }

  /** @description a generic parsing call */
  call(ctx: AHOCON.ParserContext, funcName: string, index?: number) {
    const callback = this[funcName as unknown as keyof Parser];

    if (callback === undefined || typeof callback !== 'function')
      throw new ParserError(ctx, `no resolver for ${funcName} found`);

    return (callback as AHOCON.ParserCallback).bind(this)({
      ...ctx,
      index: optional(index, ctx.index),
    });
  }

  /** @description formats RAWs to types (bools etc) */
  value(value: unknown, type: string) {
    if (type !== LEXER_RAW) return value;

    return this.parseValue(value as string);
  }

  /** @description returns function if existing, throws error if not */
  func(ctx: AHOCON.ParserContext, key: string) {
    if (!(key in this.options.funcs)) throw new ParserError(ctx, `function ${key} not found`);

    return this.options.funcs[key];
  }

  funcAddedHandler(
    ctx: AHOCON.ParserContext,
    {
      token,
      ref,
      value,
      refKey,
      inside,
    }: {
      token: string;
      value: unknown;
      ref: Record<string | number, unknown>;
      refKey: AHOCON.Nullable<string | number>;
      inside: AHOCON.Nullable<symbol>;
    }
  ) {
    if (token !== LEXER_FUNCTION) return;

    const func = ctx.deferred[value as symbol];
    func.ref = ref;
    func.refKey = refKey;
    func.inside = inside;

    for (const arg of func.args) {
      // inner funcs inherit the path
      if (typeof arg === 'symbol' && ctx.deferred[arg]?.ref === null) {
        ctx.deferred[arg].ref = ref;

        // recursively let inner funcs inherit the ref
        this.funcAddedHandler(ctx, {
          token,
          ref,
          value: arg,
          refKey: null,
          inside: func.self,
        });
      }
    }
  }

  /** @description parses values into the proper format */
  parseValue(input: string): unknown {
    // custom over all
    if (this.options.inputDetections?.custom) return this.options.inputDetections.custom(input);

    // bools
    if (detectedValue(input, this.options.inputDetections?.true || 'true')) return true;
    if (detectedValue(input, this.options.inputDetections?.false || 'false')) return false;

    // numbers (formats: 1, 1e5, 1.0)
    if (
      detectedValue(
        input,
        this.options.inputDetections?.numbers || /^[-+]?\d+(?:(?:\.\d+)|(?:e\d+)?)?$/
      )
    )
      return parseFloat(input);

    // null & undefined
    if (detectedValue(input, this.options.inputDetections?.null || 'null')) return null;
    if (detectedValue(input, this.options.inputDetections?.undefined || 'undefined'))
      return undefined;

    // unknown so we don't touch it
    return input;
  }

  /*
    *************************************
    token handlers
    *************************************
  */

  /*
    error tokens
   */
  [LEXER_MULTILINE_COMMENT_CLOSE](ctx: AHOCON.ParserContext): ReturnType<AHOCON.ParserCallback> {
    throw new ParserError(ctx, 'found multiline comment close, but none opened');
  }

  [LEXER_OBJECT_CLOSE](ctx: AHOCON.ParserContext): ReturnType<AHOCON.ParserCallback> {
    throw new ParserError(ctx, 'found object close, but none opened');
  }

  [LEXER_ARRAY_CLOSE](ctx: AHOCON.ParserContext): ReturnType<AHOCON.ParserCallback> {
    throw new ParserError(ctx, 'found array close, but none opened');
  }

  [LEXER_FUNCTION_OPEN](ctx: AHOCON.ParserContext): ReturnType<AHOCON.ParserCallback> {
    throw new ParserError(ctx, 'found function open, but without a name');
  }

  [LEXER_FUNCTION_CLOSE](ctx: AHOCON.ParserContext): ReturnType<AHOCON.ParserCallback> {
    throw new ParserError(ctx, 'found function close, but none opened');
  }

  /*
    skipped tokens
   */
  [LEXER_ASSIGNMENT](ctx: AHOCON.ParserContext): ReturnType<AHOCON.ParserCallback> {
    this.assert(ctx, LEXER_ASSIGNMENT);

    return this.noop(ctx);
  }

  [LEXER_COMMA](ctx: AHOCON.ParserContext): ReturnType<AHOCON.ParserCallback> {
    this.assert(ctx, LEXER_COMMA);

    return this.noop(ctx);
  }

  [LEXER_NEW_LINE](ctx: AHOCON.ParserContext): ReturnType<AHOCON.ParserCallback> {
    this.assert(ctx, LEXER_NEW_LINE);

    return this.noop(ctx);
  }

  [LEXER_WHITESPACE](ctx: AHOCON.ParserContext): ReturnType<AHOCON.ParserCallback> {
    this.assert(ctx, LEXER_WHITESPACE);

    return this.noop(ctx, { increment: ctx.tokens[ctx.index].content.length });
  }

  [LEXER_SINGLELINE_COMMENT](ctx: AHOCON.ParserContext): ReturnType<AHOCON.ParserCallback> {
    this.assert(ctx, LEXER_SINGLELINE_COMMENT);

    const [, newIndex] = this.loop(ctx, (token) => token !== LEXER_NEW_LINE);

    return this.noop(ctx, {
      // -1 to allow the next token to see the newline (it can be important since it's like a comma!)
      newIndex: newIndex - 1,
    });
  }

  [LEXER_MULTILINE_COMMENT_OPEN](ctx: AHOCON.ParserContext): ReturnType<AHOCON.ParserCallback> {
    this.assert(ctx, LEXER_MULTILINE_COMMENT_OPEN);

    const [eof, newIndex] = this.loop(ctx, (token) => token !== LEXER_MULTILINE_COMMENT_CLOSE);

    if (eof) throw new EOFError(ctx, 'multiline comment opened but not closed');

    return this.noop(ctx, {
      newIndex: newIndex,
    });
  }

  /*
    actually handled tokens
   */
  [LEXER_RAW](ctx: AHOCON.ParserContext): ReturnType<AHOCON.ParserCallback> {
    this.assert(ctx, LEXER_RAW);

    // loop for all upcoming RAWs
    const [eof, newIndex] = this.loop(ctx, (token) => token === LEXER_RAW),
      rawSelf = {
        next: newIndex,
        computed: {
          value: this.extractContent(ctx, { from: ctx.index, to: newIndex }),
        },
      };

    // eof or no whitespace => RAW is done
    if (eof || ctx.tokens[newIndex].token.name !== LEXER_WHITESPACE) return rawSelf;

    const [w_eof, w_newIndex] = this.loop(ctx, (token) => token === LEXER_WHITESPACE, newIndex);

    // if, after all WHITESPACEs it's eof or the next token isn't RAW => RAW is done
    if (w_eof || ctx.tokens[w_newIndex].token.name !== LEXER_RAW) {
      rawSelf.next = w_newIndex;
      return rawSelf;
    }

    // extend this RAW with the RAW behind the WHITESPACEs
    const tmp = this[LEXER_RAW]({ ...ctx, index: w_newIndex });

    rawSelf.next = tmp.next;
    rawSelf.computed.value += // merge this RAW + WHITESPACES + RAW after WHITESPACEs
      this.extractContent(ctx, { from: newIndex, to: w_newIndex }) + tmp.computed!.value;

    return rawSelf;
  }

  [LEXER_STRING](ctx: AHOCON.ParserContext): ReturnType<AHOCON.ParserCallback> {
    this.assert(ctx, LEXER_STRING);

    // loop for everything except an upcoming quote which is equal to the current one
    const [eof, newIndex] = this.loop(
      ctx,
      (token, _index, content) =>
        token !== LEXER_STRING || content !== ctx.tokens[ctx.index].content
    );

    // no closing quote
    if (eof || ctx.tokens[newIndex].token.name !== LEXER_STRING)
      throw new ParserError(ctx, 'string opened but not closed');

    let value = this.extractContent(ctx, { from: ctx.index + 1, to: newIndex });

    if (ctx.tokens[ctx.index].content.length === 3) value = prettifyString(value);

    return {
      next: newIndex + 1,
      computed: {
        value,
      },
    };
  }

  [LEXER_OBJECT_OPEN](ctx: AHOCON.ParserContext): ReturnType<AHOCON.ParserCallback> {
    this.assert(ctx, LEXER_OBJECT_OPEN);

    const re: Record<string | number, unknown> = {};
    let nextName: string,
      nextIndex = ctx.index + 1,
      valueAllowed = true;

    do {
      if (nextIndex >= ctx.tokens.length) throw new EOFError(ctx, 'object opened but not closed');

      nextName = ctx.tokens[nextIndex].token.name;

      switch (nextName) {
        // everything unknown is an error
        default: {
          throw new ParserError(
            ctx,
            `expected ${LEXER_STRING} / ${LEXER_RAW} / ${LEXER_OBJECT_CLOSE}, got ${nextName}`,
            nextIndex
          );
        }
        // just parse em
        case LEXER_COMMA:
        case LEXER_NEW_LINE: {
          nextIndex = this.call(ctx, nextName, nextIndex).next;
          valueAllowed = true;
          break;
        }
        // just parse em
        case LEXER_WHITESPACE:
        case LEXER_SINGLELINE_COMMENT:
        case LEXER_MULTILINE_COMMENT_OPEN: {
          nextIndex = this.call(ctx, nextName, nextIndex).next;
          break;
        }
        // this ends the loop
        case LEXER_OBJECT_CLOSE: {
          break;
        }
        // keys can only be STRINGs and RAWs
        case LEXER_STRING:
        case LEXER_RAW: {
          // between 2 values there needs to be a comma or a newline
          if (!valueAllowed)
            throw new ParserError(
              ctx,
              `you cannot define two values without ${LEXER_COMMA} / ${LEXER_NEW_LINE} inbetween!`,
              nextIndex
            );

          // STRING/RAW is clear
          const key = this.call(ctx, nextName, nextIndex),
            path: AHOCON.ParserContext['currentPath'] =
              nextName === LEXER_STRING
                ? [{ type: CONST_STRING, value: key.computed!.value as string }]
                : splitPath(key.computed!.value as string).map((value) => ({
                    type: CONST_RAW,
                    value,
                  }));

          // the path is essential for deferred ref/func resolving later
          ctx.currentPath.push(...path);

          let valueEOF: boolean,
            valueIndex: number = key.next,
            valueTokenName: string,
            valueAssignment: boolean = false;

          // value needs to be evaluated properly (it can be behind an assigment, an inline comment, ...)
          value_label: do {
            // skip whitespaces
            [valueEOF, valueIndex] = this.loop(
              ctx,
              (token) => token === LEXER_WHITESPACE || token === LEXER_NEW_LINE,
              valueIndex
            );

            // eof => error
            if (valueEOF)
              throw new ParserError(
                ctx,
                `token ${key.computed!.value} was defined without value`,
                valueIndex
              );

            // contains the current token name
            valueTokenName = ctx.tokens[valueIndex].token.name;

            switch (valueTokenName) {
              default: {
                // anything except the special handed ones break (unless they're assigned as value properly)
                if (!valueAssignment)
                  throw new ParserError(
                    ctx,
                    `only objects and arrays can be assigned without assignment token, write '${
                      key.computed!.value
                    } = ...' instead`,
                    valueIndex
                  );

                // break out of this loop
                break value_label;
              }
              // allowed to assign without assignment token
              case LEXER_OBJECT_OPEN:
              case LEXER_ARRAY_OPEN: {
                // break out of this loop
                break value_label;
              }
              // allow inline comments and any whitespaces
              case LEXER_WHITESPACE:
              case LEXER_NEW_LINE:
              case LEXER_SINGLELINE_COMMENT:
              case LEXER_MULTILINE_COMMENT_OPEN: {
                valueIndex = this.call(ctx, valueTokenName, valueIndex).next;
                break;
              }
              // parse the assignment
              case LEXER_ASSIGNMENT: {
                valueIndex = this.call(ctx, valueTokenName, valueIndex).next;
                valueAssignment = true; // flag that any value can be set now
                break;
              }
            }
          } while (true);

          const value = this.call(ctx, valueTokenName, valueIndex),
            [ref, refKey] = resolvePath(re, path);

          nextIndex = value.next;
          valueAllowed = false;
          ref[refKey] = this.value(value.computed!.value, valueTokenName);

          this.funcAddedHandler(ctx, {
            ref,
            token: valueTokenName,
            value: ref[refKey],
            refKey,
            inside: null,
          });
          ctx.currentPath.splice(ctx.currentPath.length - 1 - path.length, path.length);

          break;
        }
      }
    } while (nextName !== LEXER_OBJECT_CLOSE);

    return {
      // + 1 since nextIndex points on OBJECT_CLOSE
      next: nextIndex + 1,
      computed: {
        value: re,
      },
    };
  }

  [LEXER_ARRAY_OPEN](ctx: AHOCON.ParserContext): ReturnType<AHOCON.ParserCallback> {
    this.assert(ctx, LEXER_ARRAY_OPEN);

    let nextName: string,
      nextIndex = ctx.index + 1,
      valueAllowed = true;
    const re: Array<unknown> = [];

    do {
      if (nextIndex >= ctx.tokens.length) throw new EOFError(ctx, 'array opened but not closed');

      nextName = ctx.tokens[nextIndex].token.name;

      switch (nextName) {
        default: {
          // the path is essential for deferred ref/func resolving later
          ctx.currentPath.push({
            type: CONST_ARRAY,
            value: re.length,
          });

          const { computed, next } = this.call(ctx, nextName, nextIndex);

          nextIndex = next;

          // add non-ignored items to the return value
          if (computed !== null) {
            // between 2 values there needs to be a comma or a newline
            if (!valueAllowed)
              throw new ParserError(
                ctx,
                `you cannot define two values without ${LEXER_COMMA} / ${LEXER_NEW_LINE} inbetween!`,
                nextIndex
              );

            // after this a value is not allowed anymore (whitespaces are ignored)
            valueAllowed = nextName === LEXER_WHITESPACE;

            re.push(this.value(computed.value, nextName));

            this.funcAddedHandler(ctx, {
              token: nextName,
              value: computed.value,
              ref: re as unknown as Record<string | number, unknown>,
              refKey: re.length - 1,
              inside: null,
            });
          }

          ctx.currentPath.pop();

          break;
        }
        // assignments in arrays are not possible
        case LEXER_ASSIGNMENT: {
          throw new ParserError(ctx, 'cannot assign inside arrays', nextIndex);
        }
        case LEXER_NEW_LINE:
        case LEXER_COMMA: {
          nextIndex += 1;
          valueAllowed = true;
          break;
        }
        // this ends the loop
        case LEXER_ARRAY_CLOSE: {
          break;
        }
      }
    } while (nextName !== LEXER_ARRAY_CLOSE);

    return {
      // + 1 since nextIndex points on ARRAY_CLOSE
      next: nextIndex + 1,
      computed: {
        value: re,
      },
    };
  }

  [LEXER_FUNCTION](ctx: AHOCON.ParserContext): ReturnType<AHOCON.ParserCallback> {
    this.assert(ctx, LEXER_FUNCTION);

    const key = ctx.tokens[ctx.index].content.slice(1);

    // this is considered a reference, like $add
    if (ctx.tokens[ctx.index + 1]?.token.name !== LEXER_FUNCTION_OPEN)
      return {
        next: ctx.index + 1,
        computed: {
          value: this.func(ctx, key),
        },
      };

    let nextName: string,
      nextIndex = ctx.index + 2, // 2 since we skip the FUNCTION_OPEN token
      valueAllowed = true;

    const args: Array<unknown> = [];
    const argsRaw: Array<{ type: string }> = [];

    do {
      if (nextIndex >= ctx.tokens.length) throw new EOFError(ctx, 'function opened but not closed');

      nextName = ctx.tokens[nextIndex].token.name;

      switch (nextName) {
        default: {
          const { next, computed } = this.call(ctx, nextName, nextIndex);

          nextIndex = next;

          if (computed !== null) {
            // between 2 values there needs to be a comma or a newline
            if (!valueAllowed)
              throw new ParserError(
                ctx,
                `you cannot define two values without ${LEXER_COMMA} / ${LEXER_NEW_LINE} inbetween!`,
                nextIndex
              );

            // after this a value is not allowed anymore (whitespaces are ignored)
            valueAllowed = nextName === LEXER_WHITESPACE;

            args.push(this.value(computed.value, nextName));
            argsRaw.push({
              type: nextName,
            });
          }
          break;
        }
        case LEXER_ASSIGNMENT: {
          throw new ParserError(ctx, 'cannot assign inside functions', nextIndex);
        }
        case LEXER_NEW_LINE:
        case LEXER_COMMA: {
          nextIndex += 1;
          valueAllowed = true;
          break;
        }
        case LEXER_FUNCTION_CLOSE: {
          break;
        }
      }
    } while (nextName !== LEXER_FUNCTION_CLOSE);

    // easier to debug with paths as symbol descriptions
    const value = Symbol(key);
    ctx.deferred[value] = {
      self: value,
      name: key,
      args,
      ref: null,
      refKey: null,
      rawPath: [],
      argsRaw,
      inside: null,
    };

    return {
      // + 1 since nextIndex points on FUNCTION_CLOSE
      next: nextIndex + 1,
      computed: {
        value,
      },
    };
  }
}
