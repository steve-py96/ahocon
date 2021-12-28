import { COMMENT_TOKENS, IGNORABLE_TOKENS, TOKEN, TOKEN_COLLECTION } from './tokens';

export { lex };

const lex = (input: string, config?: Partial<{ raw: boolean }>): HOCON.LexerState => {
  const conf = config || {};
  const state: HOCON.LexerState = {
    currentIndex: 0,
    context: [],
    inside: {
      comment: false,
      string: false,
    },
  };

  while (state.currentIndex < input.length) {
    let { currentIndex, context, inside } = state;
    let currentChar = input[currentIndex];
    const token = TOKEN_COLLECTION.find(({ tokens }) =>
      tokens.some((token) =>
        typeof token === 'string'
          ? token === input.slice(currentIndex, currentIndex + token.length)
          : token.test(input.slice(currentIndex))
      )
    );
    // some checks for special handling, UNRELATED to the state
    const isWhiteSpace = token?.key === TOKEN.WHITESPACE;
    const isTokenString = token?.key === TOKEN.STRING;
    const isTokenComment = COMMENT_TOKENS.includes(token?.key || ('' as TOKEN));

    // we might update the last value by hand from somewhere
    const updateLastRaw = (providedChar?: string) => {
      // add the found char to some value (which we need to identify)
      const previous = context[context.length - 1];
      const char = providedChar || currentChar;

      if (
        // if there's no previous or if the previous context was a token we need to create a new context for the char
        !previous ||
        TOKEN_COLLECTION.some(({ tokens }) =>
          tokens.some((token) =>
            // string or regex comparison
            typeof token === 'string'
              ? token ===
                input.slice(
                  previous.startIndex,
                  previous.startIndex +
                    // defaulting to '' which results in false if not found
                    (TOKEN_COLLECTION.find((token) => token.key === previous.token)?.size(
                      input.slice(previous.startIndex)
                    ) || previous.startIndex)
                )
              : token.test(input.slice(previous.startIndex))
          )
        )
      )
        context.push({
          raw: char,
          startIndex: currentIndex,
          token: null,
        });
      // else we extend the existing one
      else previous.raw += char;
    };

    if (
      // we might enter if we found a token
      token !== undefined &&
      // which is a whitespace
      (isWhiteSpace ||
        // and it's not within a string (unless we're about to close one f.e.)
        ((!inside.string || isTokenString) &&
          // or within a comment (unless we're about to close one f.e.)
          (!inside.comment || isTokenComment))) &&
      // allow escaping (f.e. \" shouldn't result in a string)
      input[currentIndex - 1] !== '\\'
    ) {
      const tokenSize = token.size(input.slice(currentIndex));
      const item: HOCON.LexerContext = {
        startIndex: currentIndex,
        raw: input.slice(currentIndex, currentIndex + tokenSize),
        token: token.key,
      };

      // ignore casual whitespaces
      if (isWhiteSpace && currentChar === ' ') {
        if (inside.string) updateLastRaw();
        else if (context[context.length - 1]?.token === null)
          context[context.length - 1].raw += ' ';

        state.currentIndex += 1;
        continue;
      }

      context.push(item);
      state.currentIndex += tokenSize;

      // ensure we only are able to leave a string if we use the same quotes (" can't close with ')
      if (isTokenString) {
        const lastQuote = context.filter((ctx) => ctx.token === TOKEN.STRING && ctx !== item).pop();
        const isSameQuote = lastQuote?.raw === item.raw;

        if (inside.string) {
          // we can only come out of strings with the same quotes at start & end
          if (isSameQuote) inside.string = false;
          // if they're not the same quotes we just added wrong quotes, we need to remove em and add them to
          // the last raw input (key or value)
          else if (lastQuote !== undefined) {
            context.pop();
            updateLastRaw(currentChar);
          }
        } else {
          // if we weren't inside a string we are now since we came here thru quotes
          inside.string = true;
        }
      } else if (isWhiteSpace) {
        const lastComment = context
          .filter((ctx) => COMMENT_TOKENS.includes(ctx.token || ('' as TOKEN)))
          .pop();

        // newline + singleline comment => done, prune both from the output therefore
        if (lastComment?.token === TOKEN.SINGLELINE_COMMENT && item.raw.includes('\n')) {
          inside.comment = false;
          const lastCommentIndex = context.indexOf(lastComment);
          context.splice(lastCommentIndex, context.length - lastCommentIndex);
        }
      } else if (isTokenComment) {
        const isCommentClose = token.key === TOKEN.MULTILINE_COMMENT_CLOSE;
        const lastComment = context
          .filter((ctx) => COMMENT_TOKENS.includes(ctx.token || ('' as TOKEN)) && ctx !== item)
          .pop();

        // if it's not a closing one fitting to an open one we can already skip this
        if (isCommentClose && lastComment?.token !== TOKEN.MULTILINE_COMMENT_OPEN) continue;

        // otherwise it depends, a singleline will be true, an opening one will be true, everything but a closing comment
        inside.comment = !isCommentClose;

        // if we're really closing the comment we prune the output
        if (isCommentClose) {
          const lastCommentIndex = context.indexOf(lastComment!);
          context.splice(lastCommentIndex, context.length - lastCommentIndex);
        }
      } else if (item.token === TOKEN.OBJECT_CLOSE) {
        const lastOpeningItem = context
          .filter((ctx) => ctx.token === TOKEN.OBJECT_OPEN || ctx.token === TOKEN.REF_OPEN)
          .pop();

        // for proper parsing we differenciate between object_close and ref_close, even tho they're the same
        if (lastOpeningItem?.token === TOKEN.REF_OPEN) item.token = TOKEN.REF_CLOSE;
      }
    } else {
      updateLastRaw();
      state.currentIndex += 1;
    }
  }

  let { context } = state;

  if (!conf.raw) {
    // trim out whitespaces (leading and trailing newlines)
    while (context.length > 0 && context[0].token === TOKEN.WHITESPACE) context.shift();
    while (context.length > 0 && context[context.length - 1].token === TOKEN.WHITESPACE)
      context.pop();

    // prune useless tokens
    state.context = context.filter(
      (ctx) =>
        !IGNORABLE_TOKENS.includes(ctx.token || ('' as TOKEN)) ||
        // don't prune newlines inbetween, they're important for string parsing
        (ctx.token === TOKEN.WHITESPACE && !ctx.raw.includes('\n'))
    );
  }

  return state;
};
