import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { lex } from '../../lexer';
import { parseRef } from '../../parserHelpers';
import { errorMessage } from '../testhelpers';

const test = suite('"parseRef"');

test('"parseRef" formats properly', () => {
  // normal ref
  assert.equal(parseRef(lex('abc = ${x}').context, 1)[0], ['x']);

  // nested ref
  assert.equal(parseRef(lex('abc = ${x.y}').context, 1)[0], ['x', 'y']);

  // with number
  assert.equal(parseRef(lex('abc = ${x.0}').context, 1)[0], ['x', '0']);
});

test('"parseRef" throws proper errors', () => {
  // no closing ref bracket
  assert.is(
    errorMessage(() => parseRef(lex('abc = ${x.0').context, 1)),
    'malformed ref found at 1 (missing closing ref)'
  );
});

test.run();
