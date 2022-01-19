import { assertType } from '../../utils';
import { test } from 'uvu';
import * as assert from 'uvu/assert';

test('assertType throws properly', () => {
  // throws when type doesn't match
  assert.throws(() => assertType(undefined, 'object'), /expected object, got undefined!/);
  assert.throws(() => assertType(null, 'number'), /expected number, got object!/);
  assert.throws(() => assertType(0, 'string'), /expected string, got number!/);
  assert.throws(() => assertType({}, 'undefined'), /expected undefined, got object!/);
  assert.throws(() => assertType([], 'boolean'), /expected boolean, got object!/);
  assert.throws(() => assertType(true, 'object'), /expected object, got boolean!/);
  assert.throws(() => assertType(false, 'string'), /expected string, got boolean!/);
  // doesn't do anything when it does
  assert.equal(assertType('test', 'string'), undefined);
  assert.equal(assertType(123, 'number'), undefined);
  assert.equal(assertType(null, 'object'), undefined);
  assert.equal(assertType({}, 'object'), undefined);
  assert.equal(assertType([], 'object'), undefined);
  assert.equal(assertType(true, 'boolean'), undefined);
  assert.equal(assertType(false, 'boolean'), undefined);
  assert.equal(assertType(undefined, 'undefined'), undefined);
});

test.run();
