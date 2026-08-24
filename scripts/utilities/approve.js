'use strict';

/**
 * Human approval gate (.agents/workflows/approval.md). No content moves past
 * content/review/ without a human running this explicitly.
 *
 * Usage:
 *   node scripts/utilities/approve.js show <content_id>
 *   node scripts/utilities/approve.js approve <content_id>
 *   node scripts/utilities/approve.js reject <content_id> "reason"
 */

const fs = require('fs');
const path = require('path');
const { ROOT } = require('./config');

const REVIEW_DIR = path.join(ROOT, 'content', 'review');
const APPROVED_DIR = path.join(ROOT, 'content', 'approved');
const REJECTED_DIR = path.join(ROOT, 'content', 'rejected');

function loadReview(contentId) {
  const p = path.join(REVIEW_DIR, `${contentId}.json`);
  if (!fs.existsSync(p)) throw new Error(`No review file for ${contentId} at ${p}`);
  return { p, draft: JSON.parse(fs.readFileSync(p, 'utf8')) };
}

function show(contentId) {
  const { draft } = loadReview(contentId);
  console.log(`Hook / concept: ${draft.reel_script ? draft.reel_script.slice(0, 120) : draft.slides?.[0]?.text}`);
  console.log(`Caption:\n${draft.caption}\n`);
  console.log(`CTA: ${draft.cta_text}`);
  console.log(`Product URL: ${draft.utm_url}`);
  console.log(`Quality: pass=${draft.quality?.pass} notes=${draft.quality?.notes}`);
  if (draft.quality?.failures?.length) console.log(`Failures: ${draft.quality.failures.join('; ')}`);
}

function approve(contentId) {
  const { p, draft } = loadReview(contentId);
  fs.mkdirSync(APPROVED_DIR, { recursive: true });
  draft.status = 'APPROVED';
  draft.approved_at = new Date().toISOString();
  fs.writeFileSync(path.join(APPROVED_DIR, `${contentId}.json`), JSON.stringify(draft, null, 2));
  fs.unlinkSync(p);
  console.log(`${contentId} -> APPROVED (content/approved/${contentId}.json)`);
}

function reject(contentId, reason) {
  const { p, draft } = loadReview(contentId);
  fs.mkdirSync(REJECTED_DIR, { recursive: true });
  draft.status = 'REJECTED';
  draft.rejected_at = new Date().toISOString();
  draft.rejection_reason = reason || '';
  fs.writeFileSync(path.join(REJECTED_DIR, `${contentId}.json`), JSON.stringify(draft, null, 2));
  fs.unlinkSync(p);
  console.log(`${contentId} -> REJECTED (content/rejected/${contentId}.json)`);
}

function main() {
  const [, , cmd, contentId, reason] = process.argv;
  if (cmd === 'show') return show(contentId);
  if (cmd === 'approve') return approve(contentId);
  if (cmd === 'reject') return reject(contentId, reason);
  console.log('Usage: node scripts/utilities/approve.js <show|approve|reject> <content_id> ["reason"]');
}

if (require.main === module) main();

module.exports = { show, approve, reject };
