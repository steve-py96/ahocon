import { Parser } from '../../defaults';
import { test } from 'uvu';
import * as assert from 'uvu/assert';

const parser = new Parser(),
  parse = parser.parse.bind(parser);

test('raws work properly', () => {
  assert.equal(parse('a = 1'), { a: 1 });
  assert.equal(parse('a = true'), { a: true });
  assert.equal(parse('a = false'), { a: false });
  assert.equal(parse('a = null'), { a: null });
  assert.equal(parse('a = undefined'), { a: undefined });
  assert.equal(parse('a = test'), { a: 'test' });
  assert.equal(parse('a = 1, b = 2'), { a: 1, b: 2 });
  assert.equal(parse('a = 1\nb = 2'), { a: 1, b: 2 });
  assert.equal(parse('a = t e s t'), { a: 't e s t' });
  assert.equal(parse('a.b = 1'), { a: { b: 1 } });
  assert.equal(parse('a.b.0 = 1'), { a: { b: [1] } });
});

test.run();
