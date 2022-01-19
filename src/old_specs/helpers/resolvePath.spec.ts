import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { resolvePath } from '../../parserHelpers';
import { errorMessage } from '../testhelpers';

const test = suite('"resolvePath"');

test('"resolvePath" provides proper refs', () => {
  // normal resolving
  assert.equal(resolvePath({ hello: { world: 123 } }, ['hello', 'world']), { world: 123 });

  // resolving with numbers
  assert.equal(resolvePath({ hello: { world: ['abc'] } }, ['hello', 'world', '1']), ['abc']);
});

test('"resolvePath" mutates properly', () => {
  // use the mutated object
  const re = {};
  resolvePath(re, ['a', 'b'], (ref, partial) => {
    ref[partial] = ref[partial] || {};
  });
  assert.equal(re, { a: {} });
});

test('"resolvePath" throws proper errors', () => {
  // not existing path => error
  assert.is(
    errorMessage(() => resolvePath({}, ['a', 'b'])),
    "failed to resolve a.b (a doesn't exist!)"
  );
});

test.run();
