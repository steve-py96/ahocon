import { detectedValue } from '../../utils';
import { test } from 'uvu';
import * as assert from 'uvu/assert';

test('detectedValue detects properly', () => {
  // returns true if matches
  assert.equal(detectedValue('true', 'true'), true);
  assert.equal(detectedValue('true', /true/), true);
  assert.equal(detectedValue('true', ['true', 'false']), true);
  // returns false if it doesn't
  assert.equal(detectedValue('hans', 'peter'), false);
  assert.equal(detectedValue('hans', /peter/), false);
  assert.equal(detectedValue('hans', ['peter', 'jürgen']), false);
  // ignores case
  assert.equal(detectedValue('hAnS', 'hans'), true);
  assert.equal(detectedValue('hans', 'hAnS'), true);
  assert.equal(detectedValue('hans', ['hAnS', 'pEtEr']), true);
  assert.equal(detectedValue('hAnS', ['hans', 'peter']), true);
});

test.run();
