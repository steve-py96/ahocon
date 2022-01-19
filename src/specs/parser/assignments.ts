import { Parser } from '../../defaults';
import { test } from 'uvu';
import * as assert from 'uvu/assert';
import { ParserError } from '../../errors';

const parser = new Parser(),
  parse = parser.parse.bind(parser);

const assignmentTests = (token: string) => {
  assert.equal(parse(`a{}`), { a: {} });
  assert.equal(parse(`a[]`), { a: [] });
  assert.equal(parse(`a  {}`), { a: {} });
  assert.equal(parse(`a  []`), { a: [] });
  assert.equal(parse(`a\n{}`), { a: {} });
  assert.equal(parse(`a\n[]`), { a: [] });
  assert.equal(parse(`a${token}b`), { a: 'b' });
  assert.equal(parse(`a ${token}b`), { a: 'b' });
  assert.equal(parse(`a${token} b`), { a: 'b' });
  assert.equal(parse(`a ${token} b`), { a: 'b' });
  assert.equal(parse(`a   ${token}   b`), { a: 'b' });
  assert.equal(parse(`a \n ${token} \n b`), { a: 'b' });
  assert.throws(
    () => parse(`a 'b'`),
    (err: Error) => err instanceof ParserError
  );
};

test('assignments work properly', () => ['=', ':', ':='].forEach(assignmentTests));

test.run();
