import { namespace } from '../../utils';
import { test } from 'uvu';
import * as assert from 'uvu/assert';

test('namespace prefixes properly', () => {
  assert.equal(namespace('a', { a: 1, b: 1, c: 1 }), { 'a.a': 1, 'a.b': 1, 'a.c': 1 });
});

test.run();
