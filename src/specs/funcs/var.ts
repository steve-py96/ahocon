import { var as variable } from '../../funcs/index';
import { test } from 'uvu';
import * as assert from 'uvu/assert';

test('var works properly', () => {
  let ref = { a: { b: null } };
  let { value, cleanup } = variable({
    ref,
    args: [123],
  } as unknown as AHOCON.ParserFuncParams);

  // doesn't mutate itself
  assert.equal(ref, { a: { b: null } });
  // returns the value
  assert.equal(value, 123);
  // returns a cleanup to remove a provided path inside the ref
  assert.is.not(cleanup, undefined);
  cleanup!('a'); // not a path since we're in ref
  // ref got removed
  assert.equal(ref, {});

  // throws an error without an argument or too many (everything except 1)
  assert.throws(
    () =>
      variable({
        args: [],
        ref: { a: { b: null } },
      } as unknown as AHOCON.ParserFuncParams),
    /you must specify exactly one variable within \$var/
  );
  assert.throws(
    () =>
      variable({
        args: ['a', 'b'],
        ref: { a: { b: null } },
      } as unknown as AHOCON.ParserFuncParams),
    /you must specify exactly one variable within \$var/
  );
});

test.run();
