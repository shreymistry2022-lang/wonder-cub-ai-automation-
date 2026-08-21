import { test } from 'node:test';
import assert from 'node:assert/strict';
import { WebsiteAdapter } from '../../scripts/website/websiteAdapter.js';
import { CreativeEngine } from '../../scripts/creative/creativeEngine.js';

test('WebsiteAdapter: Generates valid UTM URL for Jungle Safari product', () => {
  const adapter = new WebsiteAdapter();
  const contentId = 'WC-2026-08-21-001';
  const utmUrl = adapter.buildUtmUrl('jungle-safari-bundle', contentId, {
    campaign: 'august_2026'
  });

  const parsed = new URL(utmUrl);
  assert.equal(parsed.origin, 'https://thewondercub.store');
  assert.equal(parsed.pathname, '/jungle-safari');
  assert.equal(parsed.searchParams.get('utm_source'), 'instagram');
  assert.equal(parsed.searchParams.get('utm_medium'), 'organic_social');
  assert.equal(parsed.searchParams.get('utm_campaign'), 'august_2026');
  assert.equal(parsed.searchParams.get('utm_content'), 'WC-2026-08-21-001');
});

test('CreativeEngine: Formats Content ID to standard WC-YYYY-MM-DD-### pattern', () => {
  const engine = new CreativeEngine();
  const date = new Date(2026, 7, 21); // Aug 21, 2026
  const id1 = engine.generateContentId(date, 1);
  const id42 = engine.generateContentId(date, 42);

  assert.equal(id1, 'WC-2026-08-21-001');
  assert.equal(id42, 'WC-2026-08-21-042');
  assert.match(id1, /^WC-\d{4}-\d{2}-\d{2}-\d{3}$/);
});
