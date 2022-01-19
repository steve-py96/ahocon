import { clone } from '../../funcs/index';
import { test } from 'uvu';
import * as assert from 'uvu/assert';

test('clone clones properly', () => {
  const original = { a: { b: { c: 1 } } };
  const originalArray = [{ a: 1 }, { b: 2 }];

  assert.is.not(clone({ args: [original] } as unknown as AHOCON.ParserFuncParams).value, original);
  assert.is.not(
    clone({ args: originalArray } as unknown as AHOCON.ParserFuncParams).value,
    originalArray
  );
  assert.is.not(
    (
      clone({ args: originalArray } as unknown as AHOCON.ParserFuncParams)
        .value as unknown as Array<unknown>
    )[0],
    originalArray[0]
  );
  assert.is.not(
    (
      clone({ args: originalArray } as unknown as AHOCON.ParserFuncParams)
        .value as unknown as Array<unknown>
    )[1],
    originalArray[1]
  );

  // ports to rfdc...
});

test.run();
