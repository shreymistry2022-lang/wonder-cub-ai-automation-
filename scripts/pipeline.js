import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { dbService } from '../database/db.js';
import { WebsiteAdapter } from './website/websiteAdapter.js';
import { ResearchEngine } from './research/researchEngine.js';
import { StrategyEngine } from './strategy/strategyEngine.js';
import { CreativeEngine } from './creative/creativeEngine.js';
import { QualityChecker } from './quality/qualityChecker.js';
import { ApprovalManager } from './approval/approvalManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

export class AutomationPipeline {
  constructor(options = {}) {
    this.websiteAdapter = new WebsiteAdapter();
    this.researchEngine = new ResearchEngine();
    this.strategyEngine = new StrategyEngine();
    this.creativeEngine = new CreativeEngine();
    this.qualityChecker = new QualityChecker();
    this.approvalManager = new ApprovalManager();

    // Guardrails
    this.flags = {
      AUTOMATION_ENABLED: true,
      PUBLISH_ENABLED: false, // Locked to false in Phase 1
      OUTREACH_ENABLED: false,
      SPEND_ENABLED: false
    };
  }

  async runDailyCycle() {
    const runId = `RUN-${Date.now()}`;
    console.log(`\n🚀 [The Wonder Cub AI] Starting Daily Automation Pipeline [Run: ${runId}]`);
    console.log(`🔒 Guardrail Status: PUBLISH_ENABLED=${this.flags.PUBLISH_ENABLED}, OUTREACH_ENABLED=${this.flags.OUTREACH_ENABLED}`);

    try {
      // 1. Seed / Verify Products in DB
      const products = this.websiteAdapter.getProducts();
      dbService.seedProducts(products);
      console.log(`📦 Seeded ${products.length} verified store product(s) into database.`);

      // 2. Run Daily Research
      console.log(`🔎 Running Competitor & Trend Research...`);
      const researchFindings = await this.researchEngine.runDailyResearch();
      console.log(`✅ Research complete. Analyzed ${researchFindings.totalAnalyzed} benchmarks.`);

      // 3. Run Strategy & Scoring
      console.log(`💡 Generating 5 candidate concepts across content pillars...`);
      const concepts = this.strategyEngine.generateDailyConcepts(researchFindings);

      for (const concept of concepts) {
        dbService.saveContentIdea({
          id: concept.id,
          pillar: concept.pillar,
          format: concept.format,
          hook: concept.hook,
          problem: concept.problem,
          concept: concept.concept,
          audience: concept.audience,
          growth_score: concept.growthScore,
          sales_score: concept.salesScore,
          composite_score: concept.compositeScore,
          product_id: concept.productId,
          cta: concept.cta,
          visual_direction: concept.visualDirection,
          is_winner: concept.isWinner || false,
          status: 'IDEA'
        });
      }

      const winner = concepts.find(c => c.isWinner) || concepts[0];
      console.log(`🏆 Selected Daily Winner: "${winner.hook}" (Growth: ${winner.growthScore}, Sales: ${winner.salesScore}, Composite: ${winner.compositeScore})`);

      // 4. Creative Engine Generation
      const contentId = this.creativeEngine.generateContentId(new Date(), 1);
      console.log(`🎨 Generating Creative Assets & Carousel structure for [${contentId}]...`);
      const postDraft = this.creativeEngine.buildCarouselPost(winner, contentId);

      // 5. Quality & IP Checker Gate
      console.log(`🛡️ Running Strict Brand & IP Quality Checks...`);
      const qualityResult = this.qualityChecker.evaluatePost(postDraft);

      if (!qualityResult.passed) {
        console.error(`❌ Quality Check Failed with flags:`, qualityResult.flags);
        postDraft.status = 'REJECTED';
        postDraft.quality_check_passed = false;
        postDraft.rejection_reason = qualityResult.flags.join('; ');
        dbService.saveContentPost(postDraft);
        dbService.recordRun(runId, 'daily-content', 'FAILED', 'Quality check failed', qualityResult.flags.join('; '));
        return { success: false, reason: 'Quality check failed', flags: qualityResult.flags };
      }

      console.log(`✅ Quality & IP Check Passed! (IP Risk: ${qualityResult.ipRiskScore})`);
      postDraft.status = 'REVIEW';
      postDraft.quality_check_passed = true;
      postDraft.ip_risk = qualityResult.ipRiskScore;

      // 6. Save Draft Post to DB and Filesystem
      dbService.saveContentPost({
        content_id: postDraft.contentId,
        idea_id: postDraft.ideaId,
        pillar: postDraft.pillar,
        format: postDraft.format,
        hook: postDraft.hook,
        caption: postDraft.caption,
        product_id: postDraft.productId,
        url: postDraft.url,
        utm_url: postDraft.utmUrl,
        media_assets: postDraft.mediaAssets,
        growth_score: postDraft.growthScore,
        sales_score: postDraft.salesScore,
        ip_risk: postDraft.ipRisk,
        quality_check_passed: true,
        status: 'REVIEW'
      });

      const reviewFile = path.resolve(projectRoot, `content/review/${postDraft.contentId}.json`);
      fs.writeFileSync(reviewFile, JSON.stringify(postDraft, null, 2), 'utf-8');

      // 7. Render Review Card
      console.log(`\n🛑 Human Approval Gate Reached:`);
      const card = this.approvalManager.formatReviewCard({
        content_id: postDraft.contentId,
        pillar: postDraft.pillar,
        format: postDraft.format,
        product_id: postDraft.productId,
        url: postDraft.url,
        utm_url: postDraft.utmUrl,
        growth_score: postDraft.growthScore,
        sales_score: postDraft.salesScore,
        ip_risk: postDraft.ipRisk,
        quality_check_passed: true,
        hook: postDraft.hook,
        caption: postDraft.caption,
        media_assets: postDraft.mediaAssets,
        status: 'REVIEW'
      });
      console.log(card);

      // 8. Phase 1 Safety Check
      if (!this.flags.PUBLISH_ENABLED) {
        console.log(`🔒 Phase 1 Guardrail: Post [${postDraft.contentId}] is securely staged in REVIEW status.`);
        console.log(`👉 Run "npm run approve" to inspect and approve pending drafts.`);
      }

      dbService.recordRun(runId, 'daily-content', 'STOPPED_AT_GATE', `Content ${postDraft.contentId} successfully prepared for human review.`);
      return { success: true, contentId: postDraft.contentId, status: 'REVIEW' };

    } catch (err) {
      console.error(`💥 Pipeline Error:`, err);
      dbService.recordRun(runId, 'daily-content', 'FAILED', 'Unhandled pipeline error', err.message);
      throw err;
    }
  }
}

// CLI entry point
if (process.argv[1] && process.argv[1].endsWith('pipeline.js')) {
  const pipeline = new AutomationPipeline();
  pipeline.runDailyCycle()
    .then(res => {
      console.log(`\n🏁 Daily run completed successfully. (Status: ${res.status})\n`);
      process.exit(0);
    })
    .catch(err => {
      console.error(`\n❌ Daily run failed:`, err.message);
      process.exit(1);
    });
}
