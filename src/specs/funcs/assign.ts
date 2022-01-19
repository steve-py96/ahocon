import { assign } from '../../funcs/index';
import { test } from 'uvu';
import * as assert from 'uvu/assert';

test('assigns assigns properly', () => {
  assert.equal(
    assign({ args: [{ a: 1 }, { b: 2 }] } as unknown as AHOCON.ParserFuncParams<
      [object, ...Array<unknown>]
    >).value,
    {
      a: 1,
      b: 2,
    }
  );
  assert.equal(
    assign({ args: [{}, { b: 2 }] } as unknown as AHOCON.ParserFuncParams<
      [object, ...Array<unknown>]
    >).value,
    {
      b: 2,
    }
  );
  assert.equal(
    assign({ args: [{ a: 1 }, undefined] } as unknown as AHOCON.ParserFuncParams<
      [object, ...Array<unknown>]
    >).value,
    { a: 1 }
  );

  // ports to Object.assign...
});

test.run();
