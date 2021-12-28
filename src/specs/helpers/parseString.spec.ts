import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { parseString } from '../../parserHelpers';
import { lex } from '../../lexer';
import { errorMessage } from '../testhelpers';

const test = suite('"parseString"');

test('"parseString" returns proper values', () => {
  assert.equal(parseString(lex('abc = 123').context, 0), [['abc'], 1, false]); // raw
  assert.equal(parseString(lex('"abc" = 123').context, 0), [['abc'], 2, true]); // raw + quote
});

test('"parseString" resolves keys when necessary', () => {
  // no path
  assert.equal(parseString(lex('abc = 123').context, 0)[0], ['abc']);

  // path
  assert.equal(parseString(lex('a.b.c = 123').context, 0)[0], ['a', 'b', 'c']);

  // no path since quoted
  assert.equal(parseString(lex('"a.b.c" = 123').context, 0)[0], ['a.b.c']);

  // partial path since escaped
  assert.equal(parseString(lex('a.b\\".c = 123').context, 0)[0], ['a', 'b\\"', 'c']);

  // no path since value
  assert.equal(parseString(lex('abc = a.b.c').context, 1, true)[0], ['a.b.c']);
});

test('"parseString" parses strings properly', () => {
  // normal
  assert.equal(parseString(lex('abc = 123').context, 1)[0], ['123']);

  // with quotes
  assert.equal(parseString(lex('abc = "123"').context, 1)[0], ['123']);

  // with whitespaces
  assert.equal(parseString(lex('abc = 12 3').context, 1)[0], ['12 3']);
  assert.equal(parseString(lex('abc = 12 3 ').context, 1)[0], ['12 3']);

  // multiline
  assert.equal(parseString(lex('abc = `  raw\n  world`').context, 1)[0], ['  raw\n  world']);
  assert.equal(parseString(lex('abc = """\n  formatted\n  world"""').context, 1)[0], [
    'formatted\nworld',
  ]);
  assert.equal(parseString(lex('abc = """\n  formatted\n   world"""').context, 1)[0], [
    'formatted\n world',
  ]);

  // other quotes / escaped
  assert.equal(parseString(lex('abc = "hello ` world"').context, 1)[0], ['hello ` world']);
  assert.equal(parseString(lex('abc = "hello \\" world"').context, 1)[0], ['hello \\" world']);
});

test('"parseString" throws proper errors', () => {
  // unclosed string literal
  assert.is(
    errorMessage(() => parseString(lex('abc = "hello world').context, 1)),
    'malformed string found at 1 (missing closing quote)'
  );

  // unclosed due to newline
  assert.is(
    errorMessage(() => parseString(lex('abc = "hello \nworld').context, 1)),
    'unexpected token at 1 (quotes not closed)'
  );
});

test.run();
