import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { AutomationPipeline } from '../../scripts/pipeline.js';
import { ApprovalManager } from '../../scripts/approval/approvalManager.js';
import { dbService } from '../../database/db.js';

test('Integration: Phase 1 Daily Pipeline runs safely to Human Approval Gate', async () => {
  const pipeline = new AutomationPipeline();
  const result = await pipeline.runDailyCycle();

  assert.equal(result.success, true);
  assert.equal(result.status, 'REVIEW');
  assert.ok(result.contentId);
  assert.match(result.contentId, /^WC-\d{4}-\d{2}-\d{2}-\d{3}$/);

  // Verify post stored in DB
  const postInDb = dbService.getContentPost(result.contentId);
  assert.ok(postInDb);
  assert.equal(postInDb.status, 'REVIEW');
  assert.equal(postInDb.quality_check_passed, 1);
  assert.equal(postInDb.url, 'https://thewondercub.store/jungle-safari');

  // Verify Human Approval workflow
  const approvalManager = new ApprovalManager();
  const cardText = approvalManager.formatReviewCard(postInDb);
  assert.ok(cardText.includes(result.contentId));
  assert.ok(cardText.includes('THE WONDER CUB — CONTENT APPROVAL CARD'));

  // Test approval transition
  const approvedRes = approvalManager.approvePost(result.contentId, 'TestAdmin');
  assert.equal(approvedRes.status, 'APPROVED');

  const updatedDbPost = dbService.getContentPost(result.contentId);
  assert.equal(updatedDbPost.status, 'APPROVED');
  assert.equal(updatedDbPost.approved_by, 'TestAdmin');
});
