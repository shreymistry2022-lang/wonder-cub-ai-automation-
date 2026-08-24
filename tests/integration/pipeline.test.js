'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const os = require('os');
const {
  loadPerformanceRecords, loadSalesRecords, computeMedians, attributeSales,
  scoreRecord, identifyWinnersLosers, findRepeatedPatterns, buildNextPlan, buildReport,
} = require('../../scripts/analytics/performanceAgent');
const { loadScoring, loadContentPillars } = require('../../scripts/utilities/config');

function tmpDirWith(files) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'wc-test-'));
  for (const [name, content] of Object.entries(files)) {
    fs.writeFileSync(path.join(dir, name), JSON.stringify(content));
  }
  return dir;
}

test('full analytics pipeline: load -> attribute -> score -> rank -> plan, on sample data', () => {
  const perfDir = tmpDirWith({
    'wc1.json': { content_id: 'WC-1', pillar: 'educational', format: 'carousel', metrics: { reach: 2000, shares: 40, saves: 60, comments: 20, profile_visits: 30, follows: 10, website_clicks: 20 } },
    'wc2.json': { content_id: 'WC-2', pillar: 'educational', format: 'carousel', metrics: { reach: 1800, shares: 35, saves: 50, comments: 15, profile_visits: 25, follows: 8, website_clicks: 18 } },
    'wc3.json': { content_id: 'WC-3', pillar: 'sales', format: 'reel', metrics: { reach: 400, shares: 2, saves: 3, comments: 1, profile_visits: 2, follows: 0, website_clicks: 1 } },
  });
  const salesDir = tmpDirWith({ 'order1.json': { order_id: 'O1', utm_content: 'WC-1', revenue_usd: 13.99 } });

  const records = loadPerformanceRecords(perfDir);
  const sales = loadSalesRecords(salesDir);
  assert.equal(records.length, 3);
  assert.equal(sales.length, 1);

  const withSales = attributeSales(records, sales);
  const medians = computeMedians(withSales);
  const scoring = loadScoring();
  const scored = withSales.map((r) => scoreRecord(r, medians, scoring));

  const { winners, losers } = identifyWinnersLosers(scored, 1);
  assert.equal(winners[0].content_id, 'WC-1');
  assert.equal(losers[0].content_id, 'WC-3');

  const patterns = findRepeatedPatterns(scored);
  assert.equal(patterns.length, 1);
  assert.equal(patterns[0].pillar, 'educational');

  const plan = buildNextPlan(patterns, loadContentPillars());
  assert.match(plan.suggested_focus, /educational/);
  assert.ok(plan.next_tests.length > 0 && plan.next_tests.length <= 5);

  const report = buildReport(scored, { winners, losers }, sales);
  assert.equal(report.posts_analyzed, 3);
  assert.equal(report.attributed_orders, 1);
  assert.equal(report.attributed_revenue_usd, 13.99);
});
