'use strict';

const { loadProducts } = require('../utilities/config');

/**
 * Automatable subset of the Quality/IP Agent's commercial checks:
 * verifies any price/URL mentioned in a draft matches config/products.yaml
 * exactly. Everything subjective (tone, IP similarity, copy quality) still
 * requires the human/agent review described in .agents/agents/quality-checker.md.
 *
 * draft: { productId, priceUsd, url, ctaText }
 */
function checkDraft(draft, products = loadProducts()) {
  const failures = [];
  const product = products.find((p) => p.id === draft.productId);

  if (!product) {
    failures.push(`Unknown product_id "${draft.productId}" — not found in config/products.yaml`);
    return { pass: false, failures };
  }

  if (draft.url && draft.url.split('?')[0] !== product.url) {
    failures.push(`URL "${draft.url}" does not match verified product URL "${product.url}"`);
  }

  if (draft.priceUsd !== undefined) {
    const validPrices = [
      ...(product.variants || []).map((v) => v.price_usd),
      product.price_usd,
    ].filter((p) => p !== undefined);
    if (!validPrices.includes(draft.priceUsd)) {
      failures.push(
        `Price ${draft.priceUsd} does not match any verified price for "${product.name}" (${validPrices.join(', ')})`
      );
    }
  }

  return { pass: failures.length === 0, failures };
}

module.exports = { checkDraft };
