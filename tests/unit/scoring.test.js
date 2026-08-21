import { test } from 'node:test';
import assert from 'node:assert/strict';
import { StrategyEngine } from '../../scripts/strategy/strategyEngine.js';

test('StrategyEngine: Growth Score calculation weights correctly', () => {
  const engine = new StrategyEngine();
  const factors = {
    share: 10,       // 10 * 0.30 = 3.0
    save: 10,        // 10 * 0.20 = 2.0
    comment: 10,     // 10 * 0.15 = 1.5
    reach: 10,       // 10 * 0.15 = 1.5
    follow: 10,      // 10 * 0.10 = 1.0
    profileVisit: 10 // 10 * 0.10 = 1.0
  }; // Total = 10.0

  const score = engine.calculateGrowthScore(factors);
  assert.equal(score, 10.0);

  const mixedFactors = {
    share: 8.0,        // 2.4
    save: 9.0,         // 1.8
    comment: 6.0,      // 0.9
    reach: 7.0,        // 1.05
    follow: 5.0,       // 0.5
    profileVisit: 5.0  // 0.5
  }; // Total = 7.15 -> 7.2

  const mixedScore = engine.calculateGrowthScore(mixedFactors);
  assert.equal(mixedScore, 7.2);
});

test('StrategyEngine: Sales Score calculation weights correctly', () => {
  const engine = new StrategyEngine();
  const factors = {
    productFit: 10,       // 10 * 0.30 = 3.0
    problemFit: 10,       // 10 * 0.20 = 2.0
    clickPotential: 10,   // 10 * 0.20 = 2.0
    purchaseIntent: 10,   // 10 * 0.15 = 1.5
    ctaQuality: 10        // 10 * 0.15 = 1.5
  }; // Total = 10.0

  const score = engine.calculateSalesScore(factors);
  assert.equal(score, 10.0);
});

test('StrategyEngine: Composite Score uses 60% Growth + 40% Sales formula', () => {
  const engine = new StrategyEngine();
  const growthScore = 8.0;
  const salesScore = 6.0;
  // (8.0 * 0.60) + (6.0 * 0.40) = 4.8 + 2.4 = 7.2

  const composite = engine.calculateCompositeScore(growthScore, salesScore);
  assert.equal(composite, 7.2);
});

test('StrategyEngine: Generates 5 distinct concepts and selects top Daily Winner', () => {
  const engine = new StrategyEngine();
  const concepts = engine.generateDailyConcepts({});

  assert.equal(concepts.length, 5);
  assert.ok(concepts[0].isWinner);
  assert.ok(concepts[0].compositeScore >= concepts[1].compositeScore);
  assert.ok(concepts[1].compositeScore >= concepts[2].compositeScore);
});
