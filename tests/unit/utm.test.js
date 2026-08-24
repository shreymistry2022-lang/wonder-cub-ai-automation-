'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { buildUtmUrl, parseUtm } = require('../../scripts/utilities/utm');

test('buildUtmUrl produces a correctly tagged URL', () => {
  const url = buildUtmUrl('https://thewondercub.store/jungle-safari', {
    source: 'instagram', medium: 'organic_social', campaign: 'august_2026', content: 'WC-2026-08-24-001',
  });
  assert.equal(url, 'https://thewondercub.store/jungle-safari?utm_source=instagram&utm_medium=organic_social&utm_campaign=august_2026&utm_content=WC-2026-08-24-001');
});

test('buildUtmUrl throws when a required field is missing', () => {
  assert.throws(() => buildUtmUrl('https://thewondercub.store/jungle-safari', { source: 'instagram' }));
});

test('parseUtm round-trips what buildUtmUrl wrote', () => {
  const url = buildUtmUrl('https://thewondercub.store/jungle-safari', {
    source: 'instagram', medium: 'organic_social', campaign: 'august_2026', content: 'WC-2026-08-24-002',
  });
  assert.deepEqual(parseUtm(url), {
    source: 'instagram', medium: 'organic_social', campaign: 'august_2026', content: 'WC-2026-08-24-002',
  });
});
