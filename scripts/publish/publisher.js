'use strict';

/**
 * Publisher (.agents/agents/publisher.md, .agents/workflows/publishing.md).
 *
 * Preconditions enforced in order — any failure stops the run:
 *   1. config/automation.yaml publish_enabled === true
 *   2. content/approved/<content_id>.json exists with status APPROVED
 *   3. media_urls are public https URLs (Meta must be able to fetch them —
 *      export creatives from Canva and host them publicly first; this script
 *      does not do that hosting step)
 *   4. caption and utm_url are present
 *   5. content_id not already in content/published/
 *
 * Usage: node scripts/publish/publisher.js <content_id>
 */

const fs = require('fs');
const path = require('path');
const { ROOT, loadAutomationFlags } = require('../utilities/config');
const ig = require('./instagramClient');

const APPROVED_DIR = path.join(ROOT, 'content', 'approved');
const PUBLISHED_DIR = path.join(ROOT, 'content', 'published');

function printManualChecklist(contentId) {
  console.log('PUBLISH_ENABLED is false — refusing to auto-publish (Phase 1 default).');
  console.log('Manual posting checklist:');
  console.log(`  1. Open content/approved/${contentId}.json`);
  console.log('  2. Post the creative to Instagram yourself, using the exact caption and utm_url.');
  console.log('  3. Log the resulting instagram_post_id and move the file to content/published/ manually,');
  console.log('     or record its performance via data/performance/<content_id>.json for the analytics agent.');
}

async function validateAndLoad(contentId) {
  const approvedPath = path.join(APPROVED_DIR, `${contentId}.json`);
  if (!fs.existsSync(approvedPath)) throw new Error(`No approved content at ${approvedPath}. Run scripts/utilities/approve.js approve ${contentId} first.`);
  const draft = JSON.parse(fs.readFileSync(approvedPath, 'utf8'));
  if (draft.status !== 'APPROVED') throw new Error(`content_id ${contentId} is not APPROVED (status=${draft.status})`);

  if (!draft.caption) throw new Error('Missing caption');
  if (!draft.utm_url) throw new Error('Missing utm_url');
  const mediaUrls = draft.media_urls || [];
  if (mediaUrls.length === 0) {
    throw new Error(
      'Missing media_urls. Export the approved creative from Canva, upload it somewhere publicly ' +
      'reachable (your own site, S3, Cloudinary, etc.), and add {"media_urls": ["https://..."]} to ' +
      `content/approved/${contentId}.json before publishing — Meta must be able to fetch the file.`
    );
  }
  for (const url of mediaUrls) {
    if (!/^https:\/\//.test(url)) throw new Error(`media_urls must be public https URLs, got: ${url}`);
  }

  fs.mkdirSync(PUBLISHED_DIR, { recursive: true });
  if (fs.existsSync(path.join(PUBLISHED_DIR, `${contentId}.json`))) {
    throw new Error(`Duplicate: ${contentId} is already in content/published/`);
  }

  return { draft, approvedPath, mediaUrls };
}

async function publish(contentId) {
  const flags = loadAutomationFlags();
  if (!flags.publish_enabled) {
    printManualChecklist(contentId);
    return { published: false, reason: 'PUBLISH_ENABLED=false' };
  }

  const { draft, approvedPath, mediaUrls } = await validateAndLoad(contentId);

  let mediaId;
  try {
    if (draft.format === 'reel') {
      const containerId = await ig.createReelContainer(mediaUrls[0], draft.caption);
      await ig.waitUntilFinished(containerId);
      mediaId = await ig.publishContainer(containerId);
    } else if (mediaUrls.length > 1) {
      const itemIds = [];
      for (const url of mediaUrls) itemIds.push(await ig.createCarouselItem(url));
      const containerId = await ig.createCarouselContainer(itemIds, draft.caption);
      mediaId = await ig.publishContainer(containerId);
    } else {
      const containerId = await ig.createImageContainer(mediaUrls[0], draft.caption);
      mediaId = await ig.publishContainer(containerId);
    }
  } catch (err) {
    console.error(`FAILED to publish ${contentId}: ${err.message}`);
    console.error('ALERT: publish failure — see section 44 (Notifications). Wire a real alert channel here.');
    draft.status = 'FAILED';
    draft.failure_reason = err.message;
    fs.writeFileSync(approvedPath, JSON.stringify(draft, null, 2));
    return { published: false, error: err.message };
  }

  draft.status = 'PUBLISHED';
  draft.instagram_post_id = mediaId;
  draft.published_at = new Date().toISOString();
  fs.writeFileSync(path.join(PUBLISHED_DIR, `${contentId}.json`), JSON.stringify(draft, null, 2));
  fs.unlinkSync(approvedPath);
  console.log(`Published ${contentId} -> instagram_post_id ${mediaId}`);
  return { published: true, mediaId };
}

if (require.main === module) {
  const contentId = process.argv[2];
  if (!contentId) {
    console.log('Usage: node scripts/publish/publisher.js <content_id>');
    process.exit(1);
  }
  publish(contentId).catch((err) => { console.error(err.message); process.exit(1); });
}

module.exports = { publish };
