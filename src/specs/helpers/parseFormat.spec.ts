import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { parseFormat } from '../../parserHelpers';

const test = suite('"parseFormat"');

test('"parseFormat" formats properly', () => {
  // numbers
  assert.is(parseFormat('123'), 123);
  assert.is(parseFormat('123.456'), 123.456);
  assert.is(parseFormat('"123"'), '"123"');
  assert.is(parseFormat('"123.456"'), '"123.456"');

  // bools
  assert.is(parseFormat('true'), true);
  assert.is(parseFormat('false'), false);
  assert.is(parseFormat('"true"'), '"true"');
  assert.is(parseFormat('"false"'), '"false"');

  // null / undefined
  assert.is(parseFormat('null'), null);
  assert.is(parseFormat('undefined'), undefined);
  assert.is(parseFormat('"null"'), '"null"');
  assert.is(parseFormat('"undefined"'), '"undefined"');

  // strings
  assert.is(parseFormat('hello'), 'hello');
  assert.is(parseFormat('hello 123 true null'), 'hello 123 true null');
  assert.is(parseFormat('"hello"'), '"hello"');
});

test.run();
