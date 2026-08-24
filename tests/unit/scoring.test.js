'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  computeMedians, ratioSubscore, attributeSales, scoreRecord,
  identifyWinnersLosers, findRepeatedPatterns,
} = require('../../scripts/analytics/performanceAgent');

const scoring = {
  growth_score: { share_potential: 0.30, save_potential: 0.20, comment_potential: 0.15, reach_potential: 0.15, follow_potential: 0.10, profile_visit_potential: 0.10 },
  sales_score: { audience_product_fit: 0.30, problem_product_fit: 0.20, website_click_potential: 0.20, purchase_intent: 0.15, cta_quality: 0.15 },
  final_score: { growth_weight: 0.60, sales_weight: 0.40 },
};

function post(id, pillar, format, metrics) {
  return { content_id: id, pillar, format, metrics };
}

test('ratioSubscore: at the median gives 5, at >=2x median gives 10, zero median with a value gives 10', () => {
  assert.equal(ratioSubscore(10, 10), 5);
  assert.equal(ratioSubscore(20, 10), 10);
  assert.equal(ratioSubscore(30, 10), 10);
  assert.equal(ratioSubscore(5, 0), 10);
  assert.equal(ratioSubscore(0, 0), 5);
});

test('computeMedians handles missing metric keys as zero', () => {
  const records = [post('a', 'p', 'f', { reach: 100, shares: 10 }), post('b', 'p', 'f', { reach: 300 })];
  const medians = computeMedians(records);
  assert.equal(medians.reach, 200);
  assert.equal(medians.shares, 5);
  assert.equal(medians.saves, 0);
});

test('attributeSales matches sales by utm_content === content_id', () => {
  const records = [post('WC-1', 'p', 'f', {})];
  const sales = [{ utm_content: 'WC-1', revenue_usd: 13.99 }, { utm_content: 'WC-2', revenue_usd: 5.99 }];
  const [withSales] = attributeSales(records, sales);
  assert.equal(withSales.attributed_orders, 1);
  assert.equal(withSales.attributed_revenue_usd, 13.99);
});

test('scoreRecord: a post with above-median engagement scores higher than a below-median post', () => {
  const records = [
    post('WC-hi', 'parent_problems', 'reel', { reach: 2000, shares: 40, saves: 60, comments: 20, profile_visits: 30, follows: 10, website_clicks: 20 }),
    post('WC-lo', 'parent_problems', 'reel', { reach: 500, shares: 2, saves: 3, comments: 1, profile_visits: 2, follows: 0, website_clicks: 1 }),
  ];
  const withSales = attributeSales(records, []);
  const medians = computeMedians(withSales);
  const [hi, lo] = withSales.map((r) => scoreRecord(r, medians, scoring));
  assert.ok(hi.growth_score > lo.growth_score, `expected ${hi.growth_score} > ${lo.growth_score}`);
  assert.ok(hi.final_score > lo.final_score);
});

test('identifyWinnersLosers ranks by final_score descending/ascending', () => {
  const scored = [
    { content_id: 'a', final_score: 3 },
    { content_id: 'b', final_score: 9 },
    { content_id: 'c', final_score: 6 },
  ];
  const { winners, losers } = identifyWinnersLosers(scored, 1);
  assert.equal(winners[0].content_id, 'b');
  assert.equal(losers[0].content_id, 'a');
});

test('findRepeatedPatterns requires at least 2 observations before surfacing a pattern (anti-overfitting)', () => {
  const scored = [
    { content_id: 'a', pillar: 'educational', format: 'carousel', final_score: 8 },
    { content_id: 'b', pillar: 'educational', format: 'carousel', final_score: 7 },
    { content_id: 'c', pillar: 'sales', format: 'reel', final_score: 9 },
  ];
  const patterns = findRepeatedPatterns(scored);
  assert.equal(patterns.length, 1);
  assert.equal(patterns[0].pillar, 'educational');
  assert.equal(patterns[0].observations, 2);
});
