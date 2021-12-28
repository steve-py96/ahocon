export { TOKEN, TOKEN_COLLECTION, COMMENT_TOKENS, IGNORABLE_TOKENS };

enum TOKEN {
  // opening + close types
  ARRAY_OPEN = 'ARRAY_OPEN', // [
  ARRAY_CLOSE = 'ARRAY_CLOSE', // ]
  MULTILINE_COMMENT_OPEN = 'MULTILINE_COMMENT_OPEN', // /*
  MULTILINE_COMMENT_CLOSE = 'MULTILINE_COMMENT_CLOSE', // */
  OBJECT_OPEN = 'OBJECT_OPEN', // {
  OBJECT_CLOSE = 'OBJECT_CLOSE', // }
  REF_OPEN = 'REF_OPEN', // ${
  REF_CLOSE = 'REF_CLOSE', // }
  REF_SHORT = 'REF_SHORT', // @
  STRING = 'STRING', // " or ' or ` or """ or '''

  // other types
  ASSIGNMENT = 'ASSIGNMENT', // = or :
  COMMA = 'COMMA', // ,
  SINGLELINE_COMMENT = 'SINGLELINE_COMMENT', // # or //
  WHITESPACE = 'WHITESPACE', // any whitespace
}

// all comment possibilities
const COMMENT_TOKENS = [
  TOKEN.MULTILINE_COMMENT_OPEN,
  TOKEN.MULTILINE_COMMENT_CLOSE,
  TOKEN.SINGLELINE_COMMENT,
];

// post-lexing filter for tokens (since they're not necessary for parsing)
const IGNORABLE_TOKENS = [TOKEN.COMMA, TOKEN.ASSIGNMENT];

const TOKEN_COLLECTION: Array<HOCON.Token> = [
  {
    key: TOKEN.ARRAY_OPEN,
    tokens: ['['],
    size: () => 1,
  },
  {
    key: TOKEN.ARRAY_CLOSE,
    tokens: [']'],
    size: () => 1,
  },
  {
    key: TOKEN.MULTILINE_COMMENT_OPEN,
    tokens: ['/*'],
    size: () => 2,
  },
  {
    key: TOKEN.MULTILINE_COMMENT_CLOSE,
    tokens: ['*/'],
    size: () => 2,
  },
  {
    key: TOKEN.OBJECT_OPEN,
    tokens: ['{'],
    size: () => 1,
  },
  {
    key: TOKEN.OBJECT_CLOSE,
    tokens: ['}'],
    size: () => 1,
  },
  {
    key: TOKEN.REF_OPEN, // REF_CLOSE is the same as OBJECT_CLOSE, therefore it can't be controlled here
    tokens: ['${'],
    size: () => 2,
  },
  {
    key: TOKEN.REF_SHORT,
    tokens: ['@'],
    size: () => 1,
  },
  {
    key: TOKEN.STRING,
    tokens: ['"""', "'''", '"', "'", '`'],
    size: (str) => (str[0] === str[1] && str[0] === str[2] ? 3 : 1),
  },
  {
    key: TOKEN.ASSIGNMENT,
    tokens: ['=', ':'],
    size: () => 1,
  },
  {
    key: TOKEN.COMMA,
    tokens: [','],
    size: () => 1,
  },
  {
    key: TOKEN.SINGLELINE_COMMENT,
    tokens: ['//', '#'],
    size: (str) => (str[0] === '#' ? 1 : 2),
  },
  {
    key: TOKEN.WHITESPACE,
    tokens: [/^(\s+)/],
    size(str) {
      return (this.tokens[0] as RegExp).exec(str)![0].length;
    },
  },
];
