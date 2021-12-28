import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { errorMessage, silentLogs } from '../testhelpers';
import { parsePath } from '../../parserHelpers';

const test = suite('"parsePath"');

const { reset, mocks } = silentLogs({ partials: ['warn'] });

test('"parsePath" splits properly', () => {
  // split
  assert.equal(parsePath('a.b.c', 0), ['a', 'b', 'c']);

  // split except escaped
  assert.equal(parsePath('a.b\\.c', 0), ['a', 'b.c']);

  // split with numbers
  assert.equal(parsePath('a.1.b', 0), ['a', '1', 'b']);

  // split with trailing dot (=> no error)
  assert.equal(parsePath('a.b.c.', 0), ['a', 'b', 'c']);
});

test('"parsePath" gives proper warnings & throws proper errors', () => {
  // .. => error
  assert.is(
    errorMessage(() => parsePath('a..b.c', 0)),
    'malformed key path found at 0 (contains ..)'
  );

  // trailing . => warning
  parsePath('a.b.c.', 0);
  assert.is(mocks.warn.lastCall.arguments[0], 'malformed key path found at 0 (ends with .)');
});

test.after(() => reset());

test.run();
