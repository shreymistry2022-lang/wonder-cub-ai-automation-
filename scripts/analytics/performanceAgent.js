'use strict';

/**
 * Analytics Agent — the "runs and verifies performance and plans accordingly" agent.
 *
 * Usage:
 *   node scripts/analytics/performanceAgent.js            (daily report)
 *   node scripts/analytics/performanceAgent.js --weekly    (weekly report + learning update + next plan)
 *
 * Data sources (manual logs until real Instagram Graph API / GA4 adapters exist —
 * see section 21 "Website Adapter" of THE_WONDER_CUB_ANTIGRAVITY_AUTOMATION.md):
 *   data/performance/*.json  -> { content_id, pillar, format, published_at, metrics: {...} }
 *   data/sales/*.json        -> [{ order_id, product_id, utm_content, utm_campaign, revenue_usd, date }]
 *
 * Outputs:
 *   data/reports/performance-<date>.json
 *   data/learning/<date>.json   (only on --weekly)
 *   human-readable report printed to stdout
 */

const fs = require('fs');
const path = require('path');
const { ROOT, loadScoring, loadContentPillars } = require('../utilities/config');

const PERFORMANCE_DIR = path.join(ROOT, 'data', 'performance');
const SALES_DIR = path.join(ROOT, 'data', 'sales');
const REPORTS_DIR = path.join(ROOT, 'data', 'reports');
const LEARNING_DIR = path.join(ROOT, 'data', 'learning');

const METRIC_KEYS = [
  'reach', 'impressions', 'views', 'likes', 'comments', 'shares', 'saves',
  'profile_visits', 'follows', 'website_clicks',
];

function readJsonFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
}

function loadPerformanceRecords(dir = PERFORMANCE_DIR) {
  return readJsonFiles(dir);
}

function loadSalesRecords(dir = SALES_DIR) {
  return readJsonFiles(dir).flatMap((entry) => (Array.isArray(entry) ? entry : [entry]));
}

function median(values) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

/** Median of each metric across all records — the account-level baseline (section 24). */
function computeMedians(records) {
  const medians = {};
  for (const key of METRIC_KEYS) {
    medians[key] = median(records.map((r) => r.metrics?.[key] ?? 0));
  }
  return medians;
}

/** value vs. median -> 0-10 subscore. At the median -> 5. At >=2x median -> 10. No data -> 5 (neutral). */
function ratioSubscore(value, med) {
  if (med === 0) return value > 0 ? 10 : 5;
  const ratio = value / med;
  return Math.min(ratio, 2) / 2 * 10;
}

/** Attach attributed sales (matched on utm_content === content_id) to each performance record. */
function attributeSales(records, salesRecords) {
  return records.map((record) => {
    const matched = salesRecords.filter((s) => s.utm_content === record.content_id);
    const attributed_revenue_usd = matched.reduce((sum, s) => sum + (s.revenue_usd || 0), 0);
    return { ...record, attributed_orders: matched.length, attributed_revenue_usd };
  });
}

/**
 * Score one record. growth_score uses the config/scoring.yaml growth_score weights
 * directly against actual metrics. sales_score can only be computed from what's
 * actually measurable post-publish (website_click_potential, purchase_intent) —
 * those two weights are renormalized to sum to 1; audience/problem/CTA fit stay as
 * the content-strategist's pre-publish estimate (record.pre_scores) when present.
 */
function scoreRecord(record, medians, scoring) {
  const m = record.metrics || {};
  const gw = scoring.growth_score;
  const growth_score =
    gw.share_potential * ratioSubscore(m.shares ?? 0, medians.shares) +
    gw.save_potential * ratioSubscore(m.saves ?? 0, medians.saves) +
    gw.comment_potential * ratioSubscore(m.comments ?? 0, medians.comments) +
    gw.reach_potential * ratioSubscore(m.reach ?? 0, medians.reach) +
    gw.follow_potential * ratioSubscore(m.follows ?? 0, medians.follows) +
    gw.profile_visit_potential * ratioSubscore(m.profile_visits ?? 0, medians.profile_visits);

  const sw = scoring.sales_score;
  const renorm = sw.website_click_potential + sw.purchase_intent;
  const clickSub = ratioSubscore(m.website_clicks ?? 0, medians.website_clicks);
  const purchaseSub = record.attributed_orders > 0
    ? ratioSubscore(record.attributed_revenue_usd ?? 0, medians.website_clicks || 1)
    : 0;
  const sales_score =
    (sw.website_click_potential / renorm) * clickSub +
    (sw.purchase_intent / renorm) * purchaseSub;

  const fw = scoring.final_score;
  const final_score = fw.growth_weight * growth_score + fw.sales_weight * sales_score;

  return { ...record, growth_score: round2(growth_score), sales_score: round2(sales_score), final_score: round2(final_score) };
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

function identifyWinnersLosers(scored, n = 3) {
  const sorted = [...scored].sort((a, b) => b.final_score - a.final_score);
  return { winners: sorted.slice(0, n), losers: sorted.slice(-n).reverse() };
}

/** Anti-overfitting rule (section 53): only surface a pattern with >=2 supporting posts. */
function findRepeatedPatterns(scored, minObservations = 2) {
  const groups = {};
  for (const r of scored) {
    const key = `${r.pillar}::${r.format}`;
    (groups[key] ||= []).push(r);
  }
  return Object.entries(groups)
    .filter(([, posts]) => posts.length >= minObservations)
    .map(([key, posts]) => {
      const [pillar, format] = key.split('::');
      const avg_final_score = round2(posts.reduce((s, p) => s + p.final_score, 0) / posts.length);
      return { pillar, format, observations: posts.length, avg_final_score };
    })
    .sort((a, b) => b.avg_final_score - a.avg_final_score);
}

/** Propose next actions: which pillar mix to lean into, and what to test next. */
function buildNextPlan(patterns, pillarsConfig) {
  const currentMix = pillarsConfig.content_mix;
  const topPattern = patterns[0];
  const nextTests = [];

  if (topPattern) {
    nextTests.push(
      `Produce 2-3 more "${topPattern.pillar}" pillar posts in "${topPattern.format}" format ` +
      `(avg final_score ${topPattern.avg_final_score} across ${topPattern.observations} posts) before generalizing further.`
    );
  } else {
    nextTests.push('Not enough repeated observations yet (need >=2 posts per pillar+format combo) — keep the current mix and log more performance data.');
  }
  if (patterns.length > 1) {
    const weakest = patterns[patterns.length - 1];
    nextTests.push(`Reconsider or A/B-test the weakest combo: "${weakest.pillar}" / "${weakest.format}" (avg final_score ${weakest.avg_final_score}).`);
  }
  nextTests.push('Test one hook variable at a time (see section 52, A/B Testing) before changing multiple elements.');

  return {
    current_content_mix: currentMix,
    suggested_focus: topPattern ? `${topPattern.pillar} / ${topPattern.format}` : 'insufficient data',
    next_tests: nextTests.slice(0, 5),
  };
}

function buildReport(scored, winnersLosers, salesRecords) {
  const totalAttributedRevenue = round2(scored.reduce((s, r) => s + (r.attributed_revenue_usd || 0), 0));
  const totalAttributedOrders = scored.reduce((s, r) => s + (r.attributed_orders || 0), 0);
  return {
    generated_at: new Date().toISOString(),
    posts_analyzed: scored.length,
    total_sales_records: salesRecords.length,
    attributed_orders: totalAttributedOrders,
    attributed_revenue_usd: totalAttributedRevenue,
    winners: winnersLosers.winners.map(summarizePost),
    losers: winnersLosers.losers.map(summarizePost),
  };
}

function summarizePost(r) {
  return {
    content_id: r.content_id,
    pillar: r.pillar,
    format: r.format,
    final_score: r.final_score,
    growth_score: r.growth_score,
    sales_score: r.sales_score,
    reach: r.metrics?.reach ?? 0,
    shares: r.metrics?.shares ?? 0,
    saves: r.metrics?.saves ?? 0,
    website_clicks: r.metrics?.website_clicks ?? 0,
    attributed_orders: r.attributed_orders ?? 0,
    attributed_revenue_usd: r.attributed_revenue_usd ?? 0,
  };
}

function printHumanReport(report, plan) {
  const lines = [];
  lines.push('THE WONDER CUB — PERFORMANCE REPORT');
  lines.push('');
  if (report.posts_analyzed === 0) {
    lines.push('No performance data logged yet.');
    lines.push('Log metrics for each published post as data/performance/<content_id>.json:');
    lines.push('  { "content_id": "WC-...", "pillar": "...", "format": "...", "published_at": "YYYY-MM-DD", "metrics": { "reach": 0, "shares": 0, "saves": 0, "comments": 0, "profile_visits": 0, "follows": 0, "website_clicks": 0 } }');
    lines.push('Log sales as data/sales/<order_id>.json: { "order_id": "...", "product_id": "...", "utm_content": "WC-...", "revenue_usd": 0, "date": "YYYY-MM-DD" }');
    console.log(lines.join('\n'));
    return;
  }
  lines.push(`Posts analyzed: ${report.posts_analyzed}`);
  lines.push(`Attributed orders: ${report.attributed_orders}`);
  lines.push(`Attributed revenue: $${report.attributed_revenue_usd}`);
  lines.push('');
  lines.push('BEST POSTS:');
  for (const w of report.winners) {
    lines.push(`  ${w.content_id} [${w.pillar}/${w.format}] final=${w.final_score} growth=${w.growth_score} sales=${w.sales_score} reach=${w.reach} shares=${w.shares} saves=${w.saves} clicks=${w.website_clicks} revenue=$${w.attributed_revenue_usd}`);
  }
  lines.push('');
  lines.push('WEAKEST POSTS:');
  for (const l of report.losers) {
    lines.push(`  ${l.content_id} [${l.pillar}/${l.format}] final=${l.final_score} growth=${l.growth_score} sales=${l.sales_score}`);
  }
  if (plan) {
    lines.push('');
    lines.push('NEXT PLAN:');
    lines.push(`  Suggested focus: ${plan.suggested_focus}`);
    for (const t of plan.next_tests) lines.push(`  - ${t}`);
  }
  console.log(lines.join('\n'));
}

function run({ weekly = false } = {}) {
  const records = loadPerformanceRecords();
  const salesRecords = loadSalesRecords();
  const scoring = loadScoring();
  const pillarsConfig = loadContentPillars();

  const withSales = attributeSales(records, salesRecords);
  const medians = computeMedians(withSales);
  const scored = withSales.map((r) => scoreRecord(r, medians, scoring));
  const winnersLosers = identifyWinnersLosers(scored);
  const report = buildReport(scored, winnersLosers, salesRecords);

  fs.mkdirSync(REPORTS_DIR, { recursive: true });
  const dateStr = new Date().toISOString().slice(0, 10);
  fs.writeFileSync(path.join(REPORTS_DIR, `performance-${dateStr}.json`), JSON.stringify(report, null, 2));

  let plan = null;
  if (weekly && scored.length > 0) {
    const patterns = findRepeatedPatterns(scored);
    plan = buildNextPlan(patterns, pillarsConfig);
    const learningEntry = {
      week_of: dateStr,
      winners: winnersLosers.winners.map((w) => w.content_id),
      losers: winnersLosers.losers.map((l) => l.content_id),
      repeated_patterns: patterns,
      failed_hypotheses: [],
      sales_insights: {
        attributed_orders: report.attributed_orders,
        attributed_revenue_usd: report.attributed_revenue_usd,
      },
      next_tests: plan.next_tests,
    };
    fs.mkdirSync(LEARNING_DIR, { recursive: true });
    fs.writeFileSync(path.join(LEARNING_DIR, `${dateStr}.json`), JSON.stringify(learningEntry, null, 2));
  }

  printHumanReport(report, plan);
  return { report, plan };
}

if (require.main === module) {
  const weekly = process.argv.includes('--weekly');
  run({ weekly });
}

module.exports = {
  loadPerformanceRecords, loadSalesRecords, computeMedians, ratioSubscore,
  attributeSales, scoreRecord, identifyWinnersLosers, findRepeatedPatterns,
  buildNextPlan, buildReport, run,
};
