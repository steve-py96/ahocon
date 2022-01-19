import { optional } from './utils';

export { ParserError, EOFError, ParserTypeError, FuncResolveError, CyclicError };

class ParserTypeError extends Error {
  constructor(ctx: AHOCON.ParserContext, expected: string, index?: number) {
    const tmp = optional(index, ctx.index);

    super(
      `unexpected type at index ${tmp}! (expected ${expected}, got ${ctx.tokens[tmp].token.name})`
    );
  }
}

class ParserError extends Error {
  constructor(ctx: AHOCON.ParserContext, message: string, index?: number) {
    super(`unexpected token at index ${optional(index, ctx.index)}! (${message})`);
  }
}

class EOFError extends Error {
  constructor(ctx: AHOCON.ParserContext, message: string) {
    super(`unexpected eof at index ${ctx.index}! (${message})`);
  }
}

class FuncResolveError extends Error {
  constructor(message: string) {
    super(`failed to resolve function! (${message})`);
  }
}

class CyclicError extends Error {
  constructor(name: string) {
    super(`reference cycle spotted at function ${name}`);
  }
}
