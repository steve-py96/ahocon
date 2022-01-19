import { sum } from '../../funcs/index';
import { test } from 'uvu';
import * as assert from 'uvu/assert';

test('sum sums properly', () => {
  // sums all args
  assert.equal(
    sum({
      args: [1, 2, 3],
    } as unknown as AHOCON.ParserFuncParams<Array<number>>).value,
    6
  );

  // throws if arg is no number
  assert.throws(
    () =>
      sum({
        args: [1, 2, '3'],
      } as unknown as AHOCON.ParserFuncParams<Array<number>>).value,
    /expected number, got string!/
  );
});

test.run();
