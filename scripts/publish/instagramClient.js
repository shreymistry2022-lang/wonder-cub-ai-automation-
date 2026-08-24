'use strict';

/**
 * Thin wrapper around the Meta Instagram Graph API (Content Publishing +
 * Insights). Needs a Meta app with instagram_basic, instagram_content_publish,
 * and pages_read_engagement permissions, and a long-lived access token for an
 * Instagram professional account linked to a Facebook Page.
 *
 * Docs: https://developers.facebook.com/docs/instagram-platform/content-publishing
 */

const GRAPH_VERSION = 'v21.0';
const BASE_URL = `https://graph.facebook.com/${GRAPH_VERSION}`;

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set. See .env.example — this is required to call the Instagram Graph API.`);
  return value;
}

async function graphRequest(pathSegment, { method = 'GET', body } = {}) {
  const token = requireEnv('META_ACCESS_TOKEN');
  const url = new URL(`${BASE_URL}/${pathSegment}`);
  if (method === 'GET' && body) {
    for (const [k, v] of Object.entries(body)) url.searchParams.set(k, v);
  }
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: method !== 'GET' ? JSON.stringify(body) : undefined,
  });
  const json = await res.json();
  if (!res.ok || json.error) {
    throw new Error(`Instagram Graph API error: ${JSON.stringify(json.error || json)}`);
  }
  return json;
}

function igUserId() {
  return requireEnv('INSTAGRAM_ACCOUNT_ID');
}

/** Single image post container. */
async function createImageContainer(imageUrl, caption) {
  const { id } = await graphRequest(`${igUserId()}/media`, { method: 'POST', body: { image_url: imageUrl, caption } });
  return id;
}

/** Reel (video) container. Video processing is async — poll checkContainerStatus before publishing. */
async function createReelContainer(videoUrl, caption) {
  const { id } = await graphRequest(`${igUserId()}/media`, {
    method: 'POST', body: { media_type: 'REELS', video_url: videoUrl, caption },
  });
  return id;
}

/** One slide of a carousel. */
async function createCarouselItem(imageUrl) {
  const { id } = await graphRequest(`${igUserId()}/media`, { method: 'POST', body: { image_url: imageUrl, is_carousel_item: true } });
  return id;
}

/** Parent carousel container referencing already-created item containers. */
async function createCarouselContainer(childrenIds, caption) {
  const { id } = await graphRequest(`${igUserId()}/media`, {
    method: 'POST', body: { media_type: 'CAROUSEL', children: childrenIds.join(','), caption },
  });
  return id;
}

async function checkContainerStatus(creationId) {
  const res = await graphRequest(creationId, { method: 'GET', body: { fields: 'status_code' } });
  return res.status_code; // EXPIRED | ERROR | FINISHED | IN_PROGRESS | PUBLISHED
}

async function waitUntilFinished(creationId, { timeoutMs = 120000, intervalMs = 5000 } = {}) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const status = await checkContainerStatus(creationId);
    if (status === 'FINISHED') return true;
    if (status === 'ERROR' || status === 'EXPIRED') throw new Error(`Media container ${creationId} failed processing: ${status}`);
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error(`Media container ${creationId} did not finish processing within ${timeoutMs}ms`);
}

async function publishContainer(creationId) {
  const { id } = await graphRequest(`${igUserId()}/media_publish`, { method: 'POST', body: { creation_id: creationId } });
  return id; // this is the published media (post) id
}

async function getMediaInsights(mediaId, metrics = ['reach', 'impressions', 'likes', 'comments', 'saved', 'shares']) {
  return graphRequest(`${mediaId}/insights`, { method: 'GET', body: { metric: metrics.join(',') } });
}

module.exports = {
  createImageContainer, createReelContainer, createCarouselItem, createCarouselContainer,
  checkContainerStatus, waitUntilFinished, publishContainer, getMediaInsights,
};
