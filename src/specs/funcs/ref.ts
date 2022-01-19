import { ref } from '../../funcs/index';
import { test } from 'uvu';
import * as assert from 'uvu/assert';

test('ref refs properly', () => {
  // no args returns ref
  assert.equal(
    ref({
      abs: { a: { b: { c: { d: 123 } } } },
      args: [],
      argsRaw: [{ type: 'RAW' }],
      ref: { b: { c: { d: 123 } } },
    }).value,
    { b: { c: { d: 123 } } }
  );

  // absolute path
  assert.equal(
    ref({
      abs: { a: { b: { c: { d: 123 } } } },
      args: ['a.b.c.d'],
      argsRaw: [{ type: 'RAW' }],
      ref: { b: { c: { d: 123 } } },
    }).value,
    123
  );

  // relative path
  assert.equal(
    ref({
      abs: { a: { b: { c: { d: 123 } } } },
      args: ['.b.c'],
      argsRaw: [{ type: 'RAW' }],
      ref: { b: { c: { d: 123 } } },
    }).value,
    { d: 123 }
  );

  // complex paths with different arg types
  assert.equal(
    ref({
      abs: { arr: [{ inner: { otherArr: [1, 2] } }] },
      ref: { arr: [{ inner: { otherArr: [1, 2] } }] },
      args: ['arr', 0, 'inner', 'otherArr.1'],
      argsRaw: [{ type: 'RAW' }, { type: 'ARRAY' }, { type: 'STRING' }, { type: 'RAW' }],
    }).value,
    2
  );

  // throws if args-path not existing
  assert.throws(
    () =>
      ref({
        abs: {},
        ref: {},
        args: ['a.b'],
        argsRaw: [{ type: 'RAW' }],
      }),
    /failed to resolve ref "a.b" \(failed to resolve path! \(partial a not found\)\)/
  );
});

test.run();
