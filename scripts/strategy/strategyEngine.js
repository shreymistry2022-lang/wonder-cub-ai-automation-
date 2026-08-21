import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

export class StrategyEngine {
  constructor() {
    this.growthWeights = {
      share: 0.30,
      save: 0.20,
      comment: 0.15,
      reach: 0.15,
      follow: 0.10,
      profileVisit: 0.10
    };

    this.salesWeights = {
      productFit: 0.30,
      problemFit: 0.20,
      clickPotential: 0.20,
      purchaseIntent: 0.15,
      ctaQuality: 0.15
    };
  }

  calculateGrowthScore(factors) {
    const raw = (
      (factors.share || 0) * this.growthWeights.share +
      (factors.save || 0) * this.growthWeights.save +
      (factors.comment || 0) * this.growthWeights.comment +
      (factors.reach || 0) * this.growthWeights.reach +
      (factors.follow || 0) * this.growthWeights.follow +
      (factors.profileVisit || 0) * this.growthWeights.profileVisit
    );
    return Math.round(raw * 10) / 10;
  }

  calculateSalesScore(factors) {
    const raw = (
      (factors.productFit || 0) * this.salesWeights.productFit +
      (factors.problemFit || 0) * this.salesWeights.problemFit +
      (factors.clickPotential || 0) * this.salesWeights.clickPotential +
      (factors.purchaseIntent || 0) * this.salesWeights.purchaseIntent +
      (factors.ctaQuality || 0) * this.salesWeights.ctaQuality
    );
    return Math.round(raw * 10) / 10;
  }

  calculateCompositeScore(growthScore, salesScore) {
    const score = (growthScore * 0.60) + (salesScore * 0.40);
    return Math.round(score * 10) / 10;
  }

  generateDailyConcepts(researchFindings) {
    const today = new Date().toISOString().split('T')[0];

    const concepts = [
      {
        id: `CONCEPT-${today}-001`,
        pillar: 'Screen-Free Activities',
        format: 'Carousel (7 Slides)',
        hook: '3 zero-prep animal games to try before turning on the TV tonight',
        problem: 'Evening digital fatigue & restless toddlers',
        concept: 'Step-by-step interactive animal mimic & observation games from Jungle Safari Vol 1',
        audience: 'Parents of 3–6 year-olds looking for instant evening calm',
        growthFactors: { share: 9.0, save: 9.5, comment: 7.5, reach: 8.5, follow: 8.0, profileVisit: 7.5 },
        salesFactors: { productFit: 8.5, problemFit: 9.0, clickPotential: 7.5, purchaseIntent: 7.0, ctaQuality: 8.0 },
        productId: 'jungle-safari-bundle',
        cta: 'Save this post for tonight & tap the link in bio to explore the complete 60-animal printable pack!',
        visualDirection: 'High-contrast warm amber background with playful animal illustrations and clean typography.'
      },
      {
        id: `CONCEPT-${today}-002`,
        pillar: 'Interactive Games',
        format: 'Carousel Quiz (5 Slides)',
        hook: 'Can your 4-year-old spot the 3 differences in this jungle scene?',
        problem: 'Passive attention vs active observation skills',
        concept: 'Swipeable animal detective challenge featuring the Jungle Safari monkey & elephant scenes',
        audience: 'Parents wanting quick educational games for their kids',
        growthFactors: { share: 9.5, save: 8.0, comment: 9.5, reach: 9.0, follow: 8.5, profileVisit: 7.0 },
        salesFactors: { productFit: 8.0, problemFit: 7.5, clickPotential: 7.0, purchaseIntent: 6.5, ctaQuality: 7.5 },
        productId: 'jungle-safari-bundle',
        cta: 'Comment your child’s score below! Full 15+ puzzle activity pack available in our bio.',
        visualDirection: 'Side-by-side jungle illustrations with a magnifying glass badge graphic.'
      },
      {
        id: `CONCEPT-${today}-003`,
        pillar: 'Educational Facts',
        format: 'Reel (20 Seconds)',
        hook: 'How big is an elephant foot compared to your child’s shoes? 🐘',
        problem: 'Difficulty visualizing animal sizes in early STEM learning',
        concept: 'Real life "As Big As..." size demonstration showing real scale comparisons',
        audience: 'Curious kids aged 3–7 and homeschooling parents',
        growthFactors: { share: 9.0, save: 9.0, comment: 8.0, reach: 9.0, follow: 8.0, profileVisit: 8.0 },
        salesFactors: { productFit: 9.0, problemFit: 8.5, clickPotential: 8.0, purchaseIntent: 7.5, ctaQuality: 8.0 },
        productId: 'jungle-safari-bundle',
        cta: 'Download the printable size comparison charts in the Jungle Safari Adventure bundle!',
        visualDirection: 'Dynamic zoom on footprint graphic with ruler scale and child shoe overlay.'
      },
      {
        id: `CONCEPT-${today}-004`,
        pillar: 'Parent Problems',
        format: 'Carousel (6 Slides)',
        hook: 'What to pack for a 3-hour road trip with a 5-year-old (without an iPad)',
        problem: 'Travel restlessness and screen meltdowns in cars/airplanes',
        concept: 'Compact printable activity toolkit: Mazes, animal bingo, and explorer badge checkpoints',
        audience: 'Traveling families and vacationing parents',
        growthFactors: { share: 9.0, save: 9.5, comment: 7.0, reach: 8.5, follow: 8.0, profileVisit: 8.5 },
        salesFactors: { productFit: 9.5, problemFit: 9.5, clickPotential: 8.5, purchaseIntent: 8.5, ctaQuality: 9.0 },
        productId: 'jungle-safari-bundle',
        cta: 'Print your pack before your next trip — grab the 3-volume bundle at the link in bio!',
        visualDirection: 'Flatlay of clipboard with printed US Letter pages, crayons, and explorer badges.'
      },
      {
        id: `CONCEPT-${today}-005`,
        pillar: 'Product Showcase',
        format: 'Reel (25 Seconds)',
        hook: 'Inside the screen-free activity book that saved our rainy Saturday 🌧️',
        problem: 'Finding high-quality, instant, print-at-home activities',
        concept: 'Flip-through of Jungle Safari Volumes 1–3 + the Free Coloring Bonus book + badge ceremony',
        audience: 'Parents ready to buy an instant solution for weekend play',
        growthFactors: { share: 7.0, save: 7.5, comment: 6.5, reach: 7.0, follow: 7.5, profileVisit: 9.0 },
        salesFactors: { productFit: 10.0, problemFit: 9.5, clickPotential: 9.5, purchaseIntent: 9.5, ctaQuality: 9.5 },
        productId: 'jungle-safari-bundle',
        cta: 'Tap link in bio to download the bundle today for just $13.99 + free bonus book!',
        visualDirection: 'Crisp hands-on page turn video highlighting badges and rich illustrations.'
      }
    ];

    // Calculate all scores
    for (const c of concepts) {
      c.growthScore = this.calculateGrowthScore(c.growthFactors);
      c.salesScore = this.calculateSalesScore(c.salesFactors);
      c.compositeScore = this.calculateCompositeScore(c.growthScore, c.salesScore);
    }

    // Sort by composite score descending
    concepts.sort((a, b) => b.compositeScore - a.compositeScore);

    // Designate Winner
    concepts[0].isWinner = true;
    concepts[0].winnerCategory = 'Daily Overall Winner';

    return concepts;
  }
}
