import { optional } from '../../utils';
import { test } from 'uvu';
import * as assert from 'uvu/assert';

test('optional decides properly', () => {
  // undefined => 2nd value taken
  assert.equal(optional(undefined, true), true);
  // else first
  assert.equal(optional(true, false), true);
  assert.equal(optional(false, true), false);
  assert.equal(optional(null, true), null);
  assert.equal(optional('', true), '');
  assert.equal(optional(0, true), 0);
  assert.equal(optional({}, true), {});
  assert.equal(optional([], true), []);
});

test.run();
