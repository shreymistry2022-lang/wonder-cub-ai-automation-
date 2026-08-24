'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { extractJson } = require('../../scripts/utilities/claude');

test('extractJson parses a clean JSON object', () => {
  assert.deepEqual(extractJson('{"a": 1}'), { a: 1 });
});

test('extractJson pulls JSON out of surrounding prose', () => {
  const text = 'Here is the result:\n```json\n{"a": 1, "b": [1,2,3]}\n```\nDone.';
  assert.deepEqual(extractJson(text), { a: 1, b: [1, 2, 3] });
});

test('extractJson handles a top-level array', () => {
  assert.deepEqual(extractJson('some preamble [1, 2, {"x": 3}] trailing'), [1, 2, { x: 3 }]);
});

test('extractJson throws when there is no JSON', () => {
  assert.throws(() => extractJson('no json here'));
});
