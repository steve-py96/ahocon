import { Parser } from '../../defaults';
import { test } from 'uvu';
import * as assert from 'uvu/assert';

const parser = new Parser(),
  parse = parser.parse.bind(parser);

const quotes = ['"', "'", '`'];

const stringTest = (quote: string) => {
  const triple = quote.repeat(3),
    others = quotes.filter((item) => item !== quote);

  assert.equal(parse(`a = ${quote}1${quote}`), { a: '1' });
  assert.equal(parse(`a = ${triple}1${triple}`), { a: '1' });
  assert.equal(parse(`${quote}a${quote} = 1`), { a: 1 });
  assert.equal(parse(`${triple}a${triple} = 1`), { a: 1 });
  assert.equal(parse(`a = ${quote}${others.join('')}{}[],=-$ref().a# /*  */${quote}`), {
    a: others.join('') + '{}[],=-$ref().a# /*  */',
  });
  assert.equal(parse(`a = ${triple}${others.join('')}{}[],=-$ref().a# /*  */${triple}`), {
    a: others.join('') + '{}[],=-$ref().a# /*  */',
  });
  assert.equal(parse(`${quote}a.b${quote} = 1`), { 'a.b': 1 });
  assert.equal(
    parse(`a = ${quote}
    hello
    world
  ${quote}`),
    { a: '\n    hello\n    world\n  ' }
  );
  assert.equal(
    parse(`a = ${triple}
    hello
    world
  ${triple}`),
    { a: 'hello\nworld' }
  );
};

test('strings work properly', () => quotes.forEach(stringTest));

test.run();
