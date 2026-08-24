'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { checkDraft } = require('../../scripts/quality/qualityChecker');

const products = [{
  id: 'wild-wonders-jungle-safari',
  name: 'Wild Wonders — A Jungle Safari Adventure',
  url: 'https://thewondercub.store/jungle-safari',
  variants: [
    { name: 'Single Volume', price_usd: 5.99 },
    { name: 'Any 2 Volumes', price_usd: 9.99 },
    { name: 'Complete Bundle', price_usd: 13.99 },
  ],
}];

test('checkDraft passes when price and URL are verified', () => {
  const result = checkDraft({
    productId: 'wild-wonders-jungle-safari',
    priceUsd: 13.99,
    url: 'https://thewondercub.store/jungle-safari?utm_content=WC-1',
  }, products);
  assert.equal(result.pass, true);
  assert.deepEqual(result.failures, []);
});

test('checkDraft fails on an invented price', () => {
  const result = checkDraft({
    productId: 'wild-wonders-jungle-safari',
    priceUsd: 999,
    url: 'https://thewondercub.store/jungle-safari',
  }, products);
  assert.equal(result.pass, false);
  assert.match(result.failures[0], /does not match any verified price/);
});

test('checkDraft fails on an unknown product', () => {
  const result = checkDraft({ productId: 'made-up-product' }, products);
  assert.equal(result.pass, false);
  assert.match(result.failures[0], /Unknown product_id/);
});
