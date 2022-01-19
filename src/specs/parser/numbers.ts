import { Parser } from '../../defaults';
import { test } from 'uvu';
import * as assert from 'uvu/assert';

const parser = new Parser(),
  parse = parser.parse.bind(parser);

test('numbers work properly', () => {
  assert.equal(parse('a = 1'), { a: 1 });
  assert.equal(parse('a = 1.2'), { a: 1.2 });
  assert.equal(parse('a = -1'), { a: -1 });
  assert.equal(parse('a = -1.2'), { a: -1.2 });
  assert.equal(parse('a = 1e3'), { a: 1e3 });
  assert.equal(parse('a = -1e3'), { a: -1e3 });
  assert.equal(parse('[-1,2,3.3,4e5]'), [-1, 2, 3.3, 4e5]);
  assert.equal(parse('{ a: 1, b: -1, c: 1.2, d: 3e4 }'), { a: 1, b: -1, c: 1.2, d: 3e4 });
});

test.run();
