'use strict';

/**
 * Build a UTM-tagged URL. Throws if required fields are missing so callers
 * can never silently publish an untracked link.
 */
function buildUtmUrl(baseUrl, { source, medium, campaign, content }) {
  if (!baseUrl) throw new Error('buildUtmUrl: baseUrl is required');
  if (!source || !medium || !campaign || !content) {
    throw new Error('buildUtmUrl: source, medium, campaign, and content are all required');
  }
  const url = new URL(baseUrl);
  url.searchParams.set('utm_source', source);
  url.searchParams.set('utm_medium', medium);
  url.searchParams.set('utm_campaign', campaign);
  url.searchParams.set('utm_content', content);
  return url.toString();
}

/** Parse utm_content/utm_campaign/utm_source back out of a URL, if present. */
function parseUtm(url) {
  const u = new URL(url);
  return {
    source: u.searchParams.get('utm_source'),
    medium: u.searchParams.get('utm_medium'),
    campaign: u.searchParams.get('utm_campaign'),
    content: u.searchParams.get('utm_content'),
  };
}

module.exports = { buildUtmUrl, parseUtm };
