'use strict';

/**
 * Pulls real Instagram insights for every published post and writes them into
 * data/performance/<content_id>.json in the shape performanceAgent.js expects.
 * Run this on a schedule (e.g. daily) so the analytics agent has real data
 * instead of manual logs. Requires META_ACCESS_TOKEN.
 *
 * Usage: node scripts/analytics/instagramMetricsSync.js
 */

const fs = require('fs');
const path = require('path');
const { ROOT } = require('../utilities/config');
const ig = require('../publish/instagramClient');

const PUBLISHED_DIR = path.join(ROOT, 'content', 'published');
const PERFORMANCE_DIR = path.join(ROOT, 'data', 'performance');

const METRICS = ['reach', 'impressions', 'likes', 'comments', 'saved', 'shares'];

async function syncOne(publishedFile) {
  const draft = JSON.parse(fs.readFileSync(publishedFile, 'utf8'));
  if (!draft.instagram_post_id) return null;

  const insights = await ig.getMediaInsights(draft.instagram_post_id, METRICS);
  const metrics = {};
  for (const entry of insights.data || []) {
    metrics[entry.name === 'saved' ? 'saves' : entry.name] = entry.values?.[0]?.value ?? 0;
  }

  const record = {
    content_id: draft.content_id,
    pillar: draft.pillar,
    format: draft.format,
    published_at: draft.published_at,
    metrics: {
      reach: metrics.reach || 0,
      impressions: metrics.impressions || 0,
      views: 0,
      likes: metrics.likes || 0,
      comments: metrics.comments || 0,
      shares: metrics.shares || 0,
      saves: metrics.saves || 0,
      profile_visits: 0,
      follows: 0,
      website_clicks: 0,
    },
    source: 'instagram_graph_api',
    synced_at: new Date().toISOString(),
  };

  fs.mkdirSync(PERFORMANCE_DIR, { recursive: true });
  fs.writeFileSync(path.join(PERFORMANCE_DIR, `${draft.content_id}.json`), JSON.stringify(record, null, 2));
  return record;
}

async function syncAll() {
  if (!fs.existsSync(PUBLISHED_DIR)) {
    console.log('No published content yet.');
    return [];
  }
  const files = fs.readdirSync(PUBLISHED_DIR).filter((f) => f.endsWith('.json'));
  const results = [];
  for (const f of files) {
    try {
      const record = await syncOne(path.join(PUBLISHED_DIR, f));
      if (record) {
        results.push(record);
        console.log(`Synced ${record.content_id}: reach=${record.metrics.reach} saves=${record.metrics.saves} shares=${record.metrics.shares}`);
      }
    } catch (err) {
      console.error(`Failed to sync ${f}: ${err.message}`);
    }
  }
  return results;
}

if (require.main === module) {
  syncAll().catch((err) => { console.error(err); process.exit(1); });
}

module.exports = { syncAll, syncOne };
