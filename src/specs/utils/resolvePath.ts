import { resolvePath, splitPath } from '../../utils';
import { test } from 'uvu';
import * as assert from 'uvu/assert';

test('resolvePath resolves properly', () => {
  const ref: Record<string, Record<string, Record<string, unknown>>> = {
    a: {
      b: {
        c: 123,
      },
    },
  };

  // no overwrites if existing
  assert.equal(
    resolvePath(
      ref,
      splitPath('a.b').map((value) => ({
        value,
        type: 'RAW',
      }))
    ),
    [{ b: { c: 123 } }, 'b']
  );
  assert.equal(ref, { a: { b: { c: 123 } } });

  // create when not existing
  assert.equal(
    resolvePath(
      ref,
      splitPath('a.e.f').map((value) => ({
        value,
        type: 'RAW',
      }))
    ),
    [{}, 'f']
  );
  assert.equal(ref, { a: { b: { c: 123 }, e: {} } });

  // mixed types
  assert.equal(
    resolvePath(
      ref,
      splitPath('a.e.f.0.a').map((value) => ({
        value,
        type: 'RAW',
      }))
    ),
    [{}, 'a']
  );
  assert.instance(ref.a.e.f, Array);

  // don't create when flagged so
  assert.throws(() =>
    resolvePath(
      ref,
      splitPath('a.z.f.g').map((value) => ({
        value,
        type: 'RAW',
      })),
      false
    )
  );
});

test.run();
