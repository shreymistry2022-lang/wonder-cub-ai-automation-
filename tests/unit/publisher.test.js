'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { publish } = require('../../scripts/publish/publisher');

test('publisher refuses to publish while PUBLISH_ENABLED=false (Phase 1 default)', async () => {
  const result = await publish('WC-does-not-exist');
  assert.equal(result.published, false);
  assert.equal(result.reason, 'PUBLISH_ENABLED=false');
});
