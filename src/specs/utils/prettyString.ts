import { prettifyString } from '../../utils';
import { test } from 'uvu';
import * as assert from 'uvu/assert';

test('prettifyString trims & dedents properly', () => {
  // trim properly (not inbetween chars!)
  assert.equal(prettifyString('hello world'), 'hello world');
  assert.equal(prettifyString('   hello world   '), 'hello world');
  assert.equal(prettifyString('   hello   world   '), 'hello   world');
  // dedent properly (1. indentation is taken as default for all)
  assert.equal(
    prettifyString(`
    hello
    world
  `),
    'hello\nworld'
  );
  // preserve whitespaces which go beyond the indentation
  assert.equal(
    prettifyString(`
    hello
      world
  `),
    'hello\n  world'
  );
  // don't touch whitespaces which don't suit the detected indentation
  assert.equal(
    prettifyString(`
      hello
    world
  `),
    'hello\n    world'
  );
});

test.run();
