import type { BaseLexer } from './lexer';

export { BaseParser };

class BaseParser<T extends BaseLexer, O extends {}> {
  lexer: T;
  options: O;

  constructor(lexer: T) {
    this.lexer = lexer;
    this.options = {} as O;
  }

  parse<X extends {} = {}>(_str: string, _options: O) {
    return {} as X;
  }

  get [Symbol.toStringTag]() {
    return 'AHOCON-Parser';
  }
}
