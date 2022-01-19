import { Lexer } from '../defaults';
import { test } from 'uvu';
import * as assert from 'uvu/assert';
import {
  LEXER_ARRAY_CLOSE,
  LEXER_ARRAY_OPEN,
  LEXER_ASSIGNMENT,
  LEXER_COMMA,
  LEXER_FUNCTION,
  LEXER_FUNCTION_CLOSE,
  LEXER_FUNCTION_OPEN,
  LEXER_MULTILINE_COMMENT_CLOSE,
  LEXER_MULTILINE_COMMENT_OPEN,
  LEXER_NEW_LINE,
  LEXER_OBJECT_CLOSE,
  LEXER_OBJECT_OPEN,
  LEXER_SINGLELINE_COMMENT,
  LEXER_STRING,
  LEXER_WHITESPACE,
  TOKEN_RAW,
} from '../statics';

const lexer = new Lexer();

test('lexer lexes properly', () => {
  // raws
  assert.equal(lexer.lex('a'), [
    {
      content: 'a',
      token: TOKEN_RAW,
      index: 0,
    },
  ]);
  assert.equal(lexer.lex('.'), [
    {
      content: '.',
      token: TOKEN_RAW,
      index: 0,
    },
  ]);
  assert.equal(lexer.lex('0'), [
    {
      content: '0',
      token: TOKEN_RAW,
      index: 0,
    },
  ]);

  // escaped tokens are raws too
  assert.equal(lexer.lex('\\"'), [
    {
      content: '\\',
      index: 0,
      token: TOKEN_RAW,
    },
    {
      content: '"',
      index: 1,
      token: TOKEN_RAW,
    },
  ]);
  assert.equal(lexer.lex('\\{'), [
    {
      content: '\\',
      index: 0,
      token: TOKEN_RAW,
    },
    {
      content: '{',
      index: 1,
      token: TOKEN_RAW,
    },
  ]);
  assert.equal(lexer.lex('\\}'), [
    {
      content: '\\',
      index: 0,
      token: TOKEN_RAW,
    },
    {
      content: '}',
      index: 1,
      token: TOKEN_RAW,
    },
  ]);
  assert.equal(lexer.lex('\\['), [
    {
      content: '\\',
      index: 0,
      token: TOKEN_RAW,
    },
    {
      content: '[',
      index: 1,
      token: TOKEN_RAW,
    },
  ]);
  assert.equal(lexer.lex('\\]'), [
    {
      content: '\\',
      index: 0,
      token: TOKEN_RAW,
    },
    {
      content: ']',
      index: 1,
      token: TOKEN_RAW,
    },
  ]);
  assert.equal(lexer.lex('\\#'), [
    {
      content: '\\',
      index: 0,
      token: TOKEN_RAW,
    },
    {
      content: '#',
      index: 1,
      token: TOKEN_RAW,
    },
  ]);
  assert.equal(lexer.lex('\\='), [
    {
      content: '\\',
      index: 0,
      token: TOKEN_RAW,
    },
    {
      content: '=',
      index: 1,
      token: TOKEN_RAW,
    },
  ]);
  assert.equal(lexer.lex('\\,'), [
    {
      content: '\\',
      index: 0,
      token: TOKEN_RAW,
    },
    {
      content: ',',
      index: 1,
      token: TOKEN_RAW,
    },
  ]);
  assert.equal(lexer.lex('\\('), [
    {
      content: '\\',
      index: 0,
      token: TOKEN_RAW,
    },
    {
      content: '(',
      index: 1,
      token: TOKEN_RAW,
    },
  ]);
  assert.equal(lexer.lex('\\)'), [
    {
      content: '\\',
      index: 0,
      token: TOKEN_RAW,
    },
    {
      content: ')',
      index: 1,
      token: TOKEN_RAW,
    },
  ]);

  // strings
  assert.equal(lexer.lex('"'), [
    {
      content: '"',
      index: 0,
      token: lexer.tokens.find(({ name }) => name === LEXER_STRING),
    },
  ]);
  assert.equal(lexer.lex("'"), [
    {
      content: "'",
      index: 0,
      token: lexer.tokens.find(({ name }) => name === LEXER_STRING),
    },
  ]);
  assert.equal(lexer.lex('`'), [
    {
      content: '`',
      index: 0,
      token: lexer.tokens.find(({ name }) => name === LEXER_STRING),
    },
  ]);
  assert.equal(lexer.lex('"""'), [
    {
      content: '"""',
      index: 0,
      token: lexer.tokens.find(({ name }) => name === LEXER_STRING),
    },
  ]);
  assert.equal(lexer.lex("'''"), [
    {
      content: "'''",
      index: 0,
      token: lexer.tokens.find(({ name }) => name === LEXER_STRING),
    },
  ]);
  assert.equal(lexer.lex('```'), [
    {
      content: '```',
      index: 0,
      token: lexer.tokens.find(({ name }) => name === LEXER_STRING),
    },
  ]);

  // assignments
  assert.equal(lexer.lex(':'), [
    {
      content: ':',
      index: 0,
      token: lexer.tokens.find(({ name }) => name === LEXER_ASSIGNMENT),
    },
  ]);
  assert.equal(lexer.lex('='), [
    {
      content: '=',
      index: 0,
      token: lexer.tokens.find(({ name }) => name === LEXER_ASSIGNMENT),
    },
  ]);
  assert.equal(lexer.lex(':='), [
    {
      content: ':=',
      index: 0,
      token: lexer.tokens.find(({ name }) => name === LEXER_ASSIGNMENT),
    },
  ]);

  // comma
  assert.equal(lexer.lex(','), [
    {
      content: ',',
      index: 0,
      token: lexer.tokens.find(({ name }) => name === LEXER_COMMA),
    },
  ]);

  // object-open/-close
  assert.equal(lexer.lex('{'), [
    {
      content: '{',
      index: 0,
      token: lexer.tokens.find(({ name }) => name === LEXER_OBJECT_OPEN),
    },
  ]);
  assert.equal(lexer.lex('}'), [
    {
      content: '}',
      index: 0,
      token: lexer.tokens.find(({ name }) => name === LEXER_OBJECT_CLOSE),
    },
  ]);

  // array-open/-close
  assert.equal(lexer.lex('['), [
    {
      content: '[',
      index: 0,
      token: lexer.tokens.find(({ name }) => name === LEXER_ARRAY_OPEN),
    },
  ]);
  assert.equal(lexer.lex(']'), [
    {
      content: ']',
      index: 0,
      token: lexer.tokens.find(({ name }) => name === LEXER_ARRAY_CLOSE),
    },
  ]);

  // function, function-open/-close
  assert.equal(lexer.lex('$test'), [
    {
      content: '$test',
      index: 0,
      token: lexer.tokens.find(({ name }) => name === LEXER_FUNCTION),
    },
  ]);
  assert.equal(lexer.lex('('), [
    {
      content: '(',
      index: 0,
      token: lexer.tokens.find(({ name }) => name === LEXER_FUNCTION_OPEN),
    },
  ]);
  assert.equal(lexer.lex(')'), [
    {
      content: ')',
      index: 0,
      token: lexer.tokens.find(({ name }) => name === LEXER_FUNCTION_CLOSE),
    },
  ]);

  // comments (singleline, multiline)
  assert.equal(lexer.lex('#'), [
    {
      content: '#',
      index: 0,
      token: lexer.tokens.find(({ name }) => name === LEXER_SINGLELINE_COMMENT),
    },
  ]);
  assert.equal(lexer.lex('/*'), [
    {
      content: '/*',
      index: 0,
      token: lexer.tokens.find(({ name }) => name === LEXER_MULTILINE_COMMENT_OPEN),
    },
  ]);
  assert.equal(lexer.lex('*/'), [
    {
      content: '*/',
      index: 0,
      token: lexer.tokens.find(({ name }) => name === LEXER_MULTILINE_COMMENT_CLOSE),
    },
  ]);

  // whitespaces, since whitespaces are trimmed they need some content around
  assert.equal(lexer.lex('# a'), [
    {
      content: '#',
      index: 0,
      token: lexer.tokens.find(({ name }) => name === LEXER_SINGLELINE_COMMENT),
    },
    {
      content: ' ',
      index: 1,
      token: lexer.tokens.find(({ name }) => name === LEXER_WHITESPACE),
    },
    {
      content: 'a',
      index: 2,
      token: TOKEN_RAW,
    },
  ]);
  assert.equal(lexer.lex('#a\n#b'), [
    {
      content: '#',
      index: 0,
      token: lexer.tokens.find(({ name }) => name === LEXER_SINGLELINE_COMMENT),
    },
    {
      content: 'a',
      index: 1,
      token: TOKEN_RAW,
    },
    {
      content: '\n',
      index: 2,
      token: lexer.tokens.find(({ name }) => name === LEXER_NEW_LINE),
    },
    {
      content: '#',
      index: 3,
      token: lexer.tokens.find(({ name }) => name === LEXER_SINGLELINE_COMMENT),
    },
    {
      content: 'b',
      index: 4,
      token: TOKEN_RAW,
    },
  ]);

  // no syntax judgement
  assert.equal(lexer.lex('a,b=4.3{]'), [
    {
      content: 'a',
      index: 0,
      token: TOKEN_RAW,
    },
    {
      content: ',',
      index: 1,
      token: lexer.tokens.find(({ name }) => name === LEXER_COMMA),
    },
    {
      content: 'b',
      index: 2,
      token: TOKEN_RAW,
    },
    {
      content: '=',
      index: 3,
      token: lexer.tokens.find(({ name }) => name === LEXER_ASSIGNMENT),
    },
    {
      content: '4',
      index: 4,
      token: TOKEN_RAW,
    },
    {
      content: '.',
      index: 5,
      token: TOKEN_RAW,
    },
    {
      content: '3',
      index: 6,
      token: TOKEN_RAW,
    },
    {
      content: '{',
      index: 7,
      token: lexer.tokens.find(({ name }) => name === LEXER_OBJECT_OPEN),
    },
    {
      content: ']',
      index: 8,
      token: lexer.tokens.find(({ name }) => name === LEXER_ARRAY_CLOSE),
    },
  ]);

  // throws when same name or regex is added
  assert.throws(
    () =>
      lexer.addToken({
        name: LEXER_WHITESPACE,
        regex: /\s\s/,
      }),
    /failed adding token WHITESPACE since it's the same as token WHITESPACE!/
  );
  assert.throws(
    () =>
      lexer.addToken({
        name: LEXER_WHITESPACE + '-123',
        regex: lexer.tokens.find(({ name }) => name === LEXER_WHITESPACE)!.regex,
      }),
    /failed adding token WHITESPACE-123 since it's the same as token WHITESPACE!/
  );
});

test.run();
