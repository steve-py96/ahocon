import { splitPath } from '../../utils';
import { test } from 'uvu';
import * as assert from 'uvu/assert';

test('splitPath splits properly', () => {
  // normal splitting
  assert.equal(splitPath('a.b.c'), ['a', 'b', 'c']);
  // escaped chars
  assert.equal(splitPath('a\\.b.c'), ['a\\.b', 'c']);
  // strings and nums
  assert.equal(splitPath('a.0'), ['a', '0']);
  // no dots to split
  assert.equal(splitPath('test'), ['test']);
  // number as path
  assert.equal(splitPath(0), ['0']);
});

test.run();
