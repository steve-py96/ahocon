import { Parser } from '../../defaults';
import { test } from 'uvu';
import * as assert from 'uvu/assert';

const parser = new Parser(),
  parse = parser.parse.bind(parser);

test('objects work properly', () => {
  assert.equal(parse('{}'), {});
  assert.equal(parse('{   }'), {});
  assert.equal(parse('{ \n }'), {});
  assert.equal(parse(''), {});
  assert.equal(parse('a = {}'), { a: {} });
  assert.equal(parse('a {}'), { a: {} });
  assert.equal(parse('a {,,,,,,,}'), { a: {} });
  assert.equal(parse('a      {}'), { a: {} });
  assert.equal(parse('a     \n {}'), { a: {} });
  assert.equal(
    parse('a { bool = true, num = 1, obj {}, arr [], null = null, undefined = undefined }'),
    {
      a: {
        bool: true,
        num: 1,
        obj: {},
        arr: [],
        null: null,
        undefined: undefined,
      },
    }
  );
  assert.equal(
    parse('a { bool = true\n num = 1\n obj {}\n arr []\n null = null\n undefined = undefined }'),
    {
      a: {
        bool: true,
        num: 1,
        obj: {},
        arr: [],
        null: null,
        undefined: undefined,
      },
    }
  );
});

test.run();
