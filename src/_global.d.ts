import type { TOKEN } from './tokens';

export {};

declare global {
  type Nullable<T> = T | null;

  namespace HOCON {
    interface LexerContext {
      startIndex: number;
      raw: string;
      token: Nullable<TOKEN>;
    }

    interface LexerState {
      currentIndex: number;
      context: Array<HOCON.LexerContext>;
      inside: {
        comment: boolean;
        string: boolean;
      };
    }

    interface ParserState {
      keyRef: Array<string | number>;
      prefix: Array<string | number>;
      inside: Array<{ key: 'array' | 'object'; size: number }>;
      refs: Array<{ target: Array<string | number>; source: Array<string | number> }>;
      topLevel: {
        object: boolean;
        array: boolean;
      };
    }

    interface Token {
      key: TOKEN;
      tokens: Array<string | RegExp>;
      size: (str: string) => number;
    }
  }
}
