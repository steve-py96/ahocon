import { Parser } from '../../defaults';
import { test } from 'uvu';
import * as assert from 'uvu/assert';

const parser = new Parser(),
  parse = parser.parse.bind(parser);

test('arrays work properly', () => {
  assert.equal(parse('a[]'), { a: [] });
  assert.equal(parse('a[\n]'), { a: [] });
  assert.equal(parse('a[,,,,,,,]'), { a: [] });
  assert.equal(parse('a []'), { a: [] });
  assert.equal(parse('a   []'), { a: [] });
  assert.equal(parse('a\n[]'), { a: [] });
  assert.equal(parse('a = []'), { a: [] });
  assert.equal(parse('[]'), []);
  assert.equal(parse('[1, "2", {}, [], true, null, undefined, $ref(.0)]'), [
    1,
    '2',
    {},
    [],
    true,
    null,
    undefined,
    1,
  ]);
  assert.equal(parse('[1\n"2"\n{}\n[]\ntrue\nnull\nundefined\n$ref(.0)]'), [
    1,
    '2',
    {},
    [],
    true,
    null,
    undefined,
    1,
  ]);
  assert.equal(parse('[[[[]]]]'), [[[[]]]]);
});

test.run();
