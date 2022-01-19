import { concat } from '../../funcs/index';
import { test } from 'uvu';
import * as assert from 'uvu/assert';

test('concat concats properly', () => {
  // concat strings
  assert.equal(
    concat({ args: ['hello ', 'world'] } as unknown as AHOCON.ParserFuncParams).value,
    'hello world'
  );
  assert.equal(
    concat({ args: ['hello ', 1] } as unknown as AHOCON.ParserFuncParams).value,
    'hello 1'
  );
  // concat numbers/bools
  assert.equal(concat({ args: [0, 1] } as unknown as AHOCON.ParserFuncParams).value, '01');
  assert.equal(
    concat({ args: [true, false] } as unknown as AHOCON.ParserFuncParams).value,
    'truefalse'
  );
  // concat arrays
  assert.equal(concat({ args: [['hello'], [1]] } as unknown as AHOCON.ParserFuncParams).value, [
    'hello',
    1,
  ]);
  // concat objects (via assign)
  assert.equal(concat({ args: [{ a: 1 }, { b: 2 }] } as unknown as AHOCON.ParserFuncParams).value, {
    a: 1,
    b: 2,
  });
});

test.run();
