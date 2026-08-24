'use strict';

/**
 * Daily Content pipeline (.agents/workflows/daily-content.md), driven by the
 * Claude API instead of a human running each agent by hand.
 *
 * Usage:
 *   node scripts/pipeline.js research     -> research-agent + web search, saves data/trends/<date>.json
 *   node scripts/pipeline.js strategize   -> content-strategist, saves content/ideas/<date>.json
 *   node scripts/pipeline.js creative <content_id>  -> creative-director, saves content/drafts/<content_id>.md
 *   node scripts/pipeline.js quality <content_id>   -> quality-checker, moves to content/review/ on pass
 *   node scripts/pipeline.js daily        -> runs research -> strategize -> creative (top concept) -> quality
 *
 * Requires ANTHROPIC_API_KEY. Never publishes anything — see scripts/publish/.
 */

const fs = require('fs');
const path = require('path');
const { ROOT, loadProducts, loadScoring, loadContentPillars, loadAutomationFlags, loadYaml } = require('./utilities/config');
const { askClaude, extractJson } = require('./utilities/claude');
const { loadAgentPrompt, loadAgentsMd } = require('./utilities/agentPrompt');
const { buildUtmUrl } = require('./utilities/utm');
const { checkDraft } = require('./quality/qualityChecker');

const TRENDS_DIR = path.join(ROOT, 'data', 'trends');
const IDEAS_DIR = path.join(ROOT, 'content', 'ideas');
const DRAFTS_DIR = path.join(ROOT, 'content', 'drafts');
const REVIEW_DIR = path.join(ROOT, 'content', 'review');

function today() {
  return new Date().toISOString().slice(0, 10);
}

function baseSystem(agentName) {
  return `${loadAgentsMd()}\n\n---\n\n${loadAgentPrompt(agentName)}`;
}

async function runResearch() {
  const brand = loadYaml('config/brand.yaml');
  const competitors = loadYaml('config/competitors.yaml').competitors || [];
  const prompt = `Brand context:\n${JSON.stringify(brand, null, 2)}\n\n` +
    `Known competitors so far (may be empty):\n${JSON.stringify(competitors, null, 2)}\n\n` +
    `Use web search to find 5-8 real, currently-active parenting/kids-activity Instagram accounts, ` +
    `recent high-performing posts in this niche, or emerging topics relevant to screen-free kids activities. ` +
    `Only include things you can verify from search results — never invent an account or URL. ` +
    `Respond with ONLY a JSON array, each item matching this shape:\n` +
    `{"research_date":"${today()}","source":"","account":"","url":"","topic":"","format":"","hook":"","observed_engagement":"","why_it_may_work":"","audience_problem":"","original_adaptation":"","ip_risk":""}`;

  const text = await askClaude({
    system: baseSystem('research-agent'),
    prompt,
    tools: [{ type: 'web_search_20260209', name: 'web_search', max_uses: 8 }],
  });
  const findings = extractJson(text);

  fs.mkdirSync(TRENDS_DIR, { recursive: true });
  const outPath = path.join(TRENDS_DIR, `${today()}.json`);
  fs.writeFileSync(outPath, JSON.stringify(findings, null, 2));
  console.log(`Saved ${findings.length} research findings -> ${path.relative(ROOT, outPath)}`);
  return findings;
}

async function runStrategy(findings) {
  const products = loadProducts();
  const scoring = loadScoring();
  const pillars = loadContentPillars();

  const prompt = `Research findings:\n${JSON.stringify(findings, null, 2)}\n\n` +
    `Products (never invent prices/URLs beyond this):\n${JSON.stringify(products, null, 2)}\n\n` +
    `Content pillars:\n${JSON.stringify(pillars, null, 2)}\n\n` +
    `Scoring weights:\n${JSON.stringify(scoring, null, 2)}\n\n` +
    `Generate exactly 5 original concepts. Respond with ONLY a JSON array, each item:\n` +
    `{"content_id":"WC-${today()}-001","pillar":"","format":"","hook":"","problem":"","concept":"","audience":"",` +
    `"growth_score":0,"sales_score":0,"final_score":0,"product_id":"","cta":"","visual_direction":"","ip_risk":""}\n` +
    `Increment the numeric suffix of content_id for each of the 5 (001-005). Compute final_score using the ` +
    `growth_weight/sales_weight in the scoring config.`;

  const text = await askClaude({ system: baseSystem('content-strategist'), prompt });
  const concepts = extractJson(text);

  fs.mkdirSync(IDEAS_DIR, { recursive: true });
  const outPath = path.join(IDEAS_DIR, `${today()}.json`);
  fs.writeFileSync(outPath, JSON.stringify(concepts, null, 2));
  console.log(`Saved ${concepts.length} concepts -> ${path.relative(ROOT, outPath)}`);
  return concepts;
}

async function runCreative(concept) {
  const products = loadProducts();
  const automation = loadAutomationFlags();
  const product = products.find((p) => p.id === concept.product_id);

  const prompt = `Selected concept:\n${JSON.stringify(concept, null, 2)}\n\n` +
    `Matched product (use ONLY this data for price/URL/claims):\n${JSON.stringify(product || {}, null, 2)}\n\n` +
    `Produce the full creative. Respond with ONLY JSON:\n` +
    `{"content_id":"${concept.content_id}","format":"","slides":[{"slide":1,"text":"","design_notes":""}],` +
    `"reel_script":"","caption":"","cta_text":"","alt_text":"","visual_direction":""}\n` +
    `Leave slides empty array if format is a reel; leave reel_script empty string if format is a carousel.`;

  const text = await askClaude({ system: baseSystem('creative-director'), prompt });
  const draft = extractJson(text);

  const campaign = automation.utm.campaign_prefix || `${new Date().toLocaleString('en-US', { month: 'long' }).toLowerCase()}_${new Date().getFullYear()}`;
  draft.product_id = concept.product_id;
  draft.product_url = product ? product.url : null;
  draft.utm_url = product
    ? buildUtmUrl(product.url, {
        source: automation.utm.source, medium: automation.utm.medium, campaign, content: concept.content_id,
      })
    : null;

  fs.mkdirSync(DRAFTS_DIR, { recursive: true });
  const outPath = path.join(DRAFTS_DIR, `${concept.content_id}.json`);
  fs.writeFileSync(outPath, JSON.stringify(draft, null, 2));
  console.log(`Saved draft -> ${path.relative(ROOT, outPath)}`);
  return draft;
}

async function runQuality(draft) {
  const products = loadProducts();
  const product = products.find((p) => p.id === draft.product_id);

  // Automatable subset: price/URL verification against config/products.yaml.
  const priceMatch = draft.cta_text && product
    ? (product.variants || []).find((v) => draft.cta_text.includes(String(v.price_usd)))
    : null;
  const auto = checkDraft({ productId: draft.product_id, priceUsd: priceMatch?.price_usd, url: draft.product_url }, products);

  // Subjective checks (tone, IP similarity, copy quality) via the quality-checker agent prompt.
  const prompt = `Draft to review:\n${JSON.stringify(draft, null, 2)}\n\n` +
    `Automated price/URL check result: ${JSON.stringify(auto)}\n\n` +
    `Respond with ONLY JSON: {"pass": true|false, "failures": ["..."], "notes": "..."}`;
  const text = await askClaude({ system: baseSystem('quality-checker'), prompt });
  const llmResult = extractJson(text);

  const result = {
    content_id: draft.content_id,
    pass: auto.pass && llmResult.pass,
    failures: [...auto.failures, ...(llmResult.failures || [])],
    notes: llmResult.notes || '',
    checked_at: new Date().toISOString(),
  };

  fs.mkdirSync(REVIEW_DIR, { recursive: true });
  const reviewPath = path.join(REVIEW_DIR, `${draft.content_id}.json`);
  fs.writeFileSync(reviewPath, JSON.stringify({ ...draft, quality: result }, null, 2));

  if (result.pass) {
    console.log(`PASS -> ${path.relative(ROOT, reviewPath)}. Awaiting human approval (.agents/workflows/approval.md).`);
  } else {
    console.log(`DO NOT PUBLISH — quality check failed: ${result.failures.join('; ')}`);
  }
  return result;
}

async function runDaily() {
  const findings = await runResearch();
  const concepts = await runStrategy(findings);
  const top = [...concepts].sort((a, b) => (b.final_score ?? 0) - (a.final_score ?? 0))[0];
  console.log(`Top concept: ${top.content_id} (final_score ${top.final_score})`);
  const draft = await runCreative(top);
  await runQuality(draft);
}

async function main() {
  const [, , cmd, arg] = process.argv;
  if (cmd === 'research') return runResearch();
  if (cmd === 'strategize') {
    const latest = fs.readdirSync(TRENDS_DIR).sort().pop();
    const findings = JSON.parse(fs.readFileSync(path.join(TRENDS_DIR, latest), 'utf8'));
    return runStrategy(findings);
  }
  if (cmd === 'creative') {
    const latest = fs.readdirSync(IDEAS_DIR).sort().pop();
    const concepts = JSON.parse(fs.readFileSync(path.join(IDEAS_DIR, latest), 'utf8'));
    const concept = concepts.find((c) => c.content_id === arg) || concepts[0];
    return runCreative(concept);
  }
  if (cmd === 'quality') {
    const draft = JSON.parse(fs.readFileSync(path.join(DRAFTS_DIR, `${arg}.json`), 'utf8'));
    return runQuality(draft);
  }
  if (cmd === 'daily') return runDaily();
  console.log('Usage: node scripts/pipeline.js <research|strategize|creative|quality|daily> [content_id]');
}

if (require.main === module) {
  main().catch((err) => { console.error(err); process.exit(1); });
}

module.exports = { runResearch, runStrategy, runCreative, runQuality, runDaily };
