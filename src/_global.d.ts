export {};

declare global {
  type Nullable<T> = null | T;

  namespace AHOCON {
    interface LexerToken {
      name: string;
      regex: RegExp;
    }

    interface LexerContext {
      content: string;
      index: number;
      token: AHOCON.LexerToken;
    }

    interface ParserFuncParams<
      Args extends Array<unknown> = Array<unknown>,
      Abs extends {} = Record<string | number, unknown>,
      Ref extends {} = Record<string | number, unknown>
    > {
      abs: Abs;
      ref: Ref;
      args: Args;
      argsRaw: ParserContext['deferred'][symbol]['argsRaw'];
    }

    type ParserFunc<
      Args extends Array<unknown> = Array<unknown>,
      Ref extends {} = Record<string | number, unknown>,
      Abs extends {} = Record<string | number, unknown>,
      ReturnValue = unknown
    > = (params: ParserFuncParams<Args, Abs, Ref>) => {
      value: ReturnValue;
      cleanup?: (key: string | number) => void;
    };

    interface ParserOptions {
      funcs: Record<string, AHOCON.ParserFunc>;
      inputDetections?: Partial<{
        custom: (input: string) => unknown;
        true: RegExp | Array<string> | string;
        false: RegExp | Array<string> | string;
        numbers: RegExp | Array<string> | string;
        null: RegExp | Array<string> | string;
        undefined: RegExp | Array<string> | string;
      }>;
    }

    type ParserCallback = (ctx: AHOCON.ParserContext) => {
      next: number;
      computed: null | {
        value: unknown;
      };
    };

    interface ParserContext {
      index: number;
      currentPath: Array<{ type: string; value: string | number }>;
      deferred: Record<
        symbol,
        {
          args: Array<unknown>;
          argsRaw: Array<{ type: string }>;
          inside: Nullable<symbol>;
          name: string | number;
          rawPath: AHOCON.ParserContext['currentPath'];
          ref: Nullable<Record<string | number, unknown>>;
          refKey: Nullable<string | number>;
          self: symbol;
        }
      >;
      tokens: Array<AHOCON.LexerContext>;
    }
  }
}
