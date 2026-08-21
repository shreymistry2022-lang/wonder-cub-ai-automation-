import { test } from 'node:test';
import assert from 'node:assert/strict';
import { QualityChecker } from '../../scripts/quality/qualityChecker.js';

test('QualityChecker: Passes clean compliant post draft', () => {
  const checker = new QualityChecker();
  const validPost = {
    hook: '3 zero-prep animal games for curious little explorers tonight',
    caption: 'When 5 PM hits, try these 3 screen-free animal games with your child. Full details inside! #screenfreekids #thewondercub',
    url: 'https://thewondercub.store/jungle-safari',
    mediaAssets: [{ slideNumber: 1, headline: '3 zero-prep games' }]
  };

  const result = checker.evaluatePost(validPost);
  assert.equal(result.passed, true);
  assert.equal(result.flags.length, 0);
  assert.equal(result.ipRiskScore, 0.0);
});

test('QualityChecker: Flags unauthorized third-party trademarked characters', () => {
  const checker = new QualityChecker();
  const infringingPost = {
    hook: 'Disney and Paw Patrol animal games for your 4-year-old',
    caption: 'Play with Mickey Mouse and Peppa Pig in this activity pack.',
    url: 'https://thewondercub.store/jungle-safari',
    mediaAssets: [{ slideNumber: 1, headline: 'Paw Patrol games' }]
  };

  const result = checker.evaluatePost(infringingPost);
  assert.equal(result.passed, false);
  assert.ok(result.flags.some(f => f.includes('trademarked entity "disney"')));
  assert.ok(result.flags.some(f => f.includes('trademarked entity "paw patrol"')));
  assert.ok(result.flags.some(f => f.includes('trademarked entity "peppa pig"')));
  assert.equal(result.ipRiskScore, 0.9);
});

test('QualityChecker: Flags forbidden aggressive marketing claims', () => {
  const checker = new QualityChecker();
  const aggressivePost = {
    hook: 'HURRY BEFORE IT\'S GONE: The secret hack doctors don\'t want you to know',
    caption: '100% cure for tantrums guaranteed genius child only 2 left in stock.',
    url: 'https://thewondercub.store/jungle-safari',
    mediaAssets: [{ slideNumber: 1, headline: 'Hurry now' }]
  };

  const result = checker.evaluatePost(aggressivePost);
  assert.equal(result.passed, false);
  assert.ok(result.flags.some(f => f.includes('aggressive marketing phrase')));
});

test('QualityChecker: Flags unverified destination URLs', () => {
  const checker = new QualityChecker();
  const badUrlPost = {
    hook: '3 zero-prep animal games for curious little explorers',
    caption: 'Check out this brand new activity pack for kids! #screenfreekids',
    url: 'https://unverified-third-party-store.com/checkout',
    mediaAssets: [{ slideNumber: 1, headline: 'Play games' }]
  };

  const result = checker.evaluatePost(badUrlPost);
  assert.equal(result.passed, false);
  assert.ok(result.flags.some(f => f.includes('URL Warning')));
});
