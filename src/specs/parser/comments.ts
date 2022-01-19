import { Parser } from '../../defaults';
import { test } from 'uvu';
import * as assert from 'uvu/assert';

const parser = new Parser(),
  parse = parser.parse.bind(parser);

test('comments work properly', () => {
  assert.equal(parse('#'), {});
  assert.equal(parse('//'), {});
  assert.equal(parse('/**/'), {});
  assert.equal(parse('#test'), {});
  assert.equal(parse('//test'), {});
  assert.equal(parse('/*test*/'), {});
  assert.equal(parse('#//#othertest'), {});
  assert.equal(parse('//#///*other*/test'), {});
  assert.equal(parse('/*test#///*other*/'), {});
  assert.equal(parse('a = 1 # test'), { a: 1 });
  assert.equal(parse('a = 1 // test'), { a: 1 });
  assert.equal(parse('a = 1 /* test */'), { a: 1 });
  assert.equal(parse('a = # test\n1'), { a: 1 });
  assert.equal(parse('a = // test\n1'), { a: 1 });
  assert.equal(parse('a = /* test */1'), { a: 1 });
  assert.equal(parse('a # test\n=1'), { a: 1 });
  assert.equal(parse('a // test\n=1'), { a: 1 });
  assert.equal(parse('a /* test */=1'), { a: 1 });
  assert.equal(parse('# test\na=1'), { a: 1 });
  assert.equal(parse('// test\na=1'), { a: 1 });
  assert.equal(parse('/* test */a=1'), { a: 1 });
  assert.equal(parse('#{}[] a.b=3!$ref(.0)'), {});
  assert.equal(parse('//{}[] a.b=3!$ref(.0)'), {});
  assert.equal(parse('/*{}[] a.b=3!$ref(.0)*/'), {});
  assert.equal(parse('{#\n}'), {});
  assert.equal(parse('{//\n}'), {});
  assert.equal(parse('{/**/}'), {});
  assert.equal(parse('[#\n]'), []);
  assert.equal(parse('[//\n]'), []);
  assert.equal(parse('[/**/]'), []);
});

test.run();
