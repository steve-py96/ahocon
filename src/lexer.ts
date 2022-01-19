import { TOKEN_RAW } from './statics';

export { BaseLexer };

class BaseLexer {
  tokens: Array<AHOCON.LexerToken> = [];
  tokenMap: Record<string, RegExp> = {};

  constructor(...tokens: Array<AHOCON.LexerToken>) {
    this.addTokens(...tokens);
  }

  addToken(token: AHOCON.LexerToken) {
    const sameRegexOrName = this.tokens.find(
      (item) => item.name === token.name || item.regex.toString() === token.regex.toString()
    );

    if (sameRegexOrName)
      throw Error(
        `failed adding token ${token.name} since it's the same as token ${sameRegexOrName.name}!`
      );

    this.tokens.push(token);
    this.tokenMap[token.name] = token.regex;
  }

  addTokens(...tokens: Array<AHOCON.LexerToken>) {
    tokens.forEach((token) => this.addToken(token));
  }

  lex(input: string) {
    const str = input.trim();
    const re: Array<AHOCON.LexerContext> = [];

    for (let i = 0; i < str.length; ) {
      const currentIndex = i;
      const currentStr = str.slice(i);

      // escaping => any token becomes raw
      if (str[i] === '\\') {
        re.push({
          content: str[i],
          token: TOKEN_RAW,
          index: i,
        });

        if (i + 1 < str.length) {
          re.push({
            content: str[i + 1],
            token: TOKEN_RAW,
            index: i + 1,
          });

          i += 2;
        } else i += 1;

        continue;
      }

      for (let token of this.tokens) {
        const [res] = token.regex.exec(currentStr) || [null];

        // not found
        // or not found at the beginning (since the regex doesn't necessarily need to have a caret in the beginning)
        if (res === null || token.regex.exec(currentStr.slice(0, res.length))?.[0] !== res)
          continue;

        re.push({
          content: res,
          token,
          index: i,
        });

        i += res.length;
        break;
      }

      if (i === currentIndex) {
        re.push({
          content: str[i],
          token: TOKEN_RAW,
          index: i,
        });

        i += 1;
      }
    }

    return re;
  }

  get [Symbol.toStringTag]() {
    return 'AHOCON-Lexer';
  }
}
