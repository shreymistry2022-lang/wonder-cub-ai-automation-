import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { dbService } from '../../database/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

export class ApprovalManager {
  constructor() {
    this.reviewDir = path.resolve(projectRoot, 'content/review');
    this.approvedDir = path.resolve(projectRoot, 'content/approved');
    this.rejectedDir = path.resolve(projectRoot, 'content/rejected');

    [this.reviewDir, this.approvedDir, this.rejectedDir].forEach(dir => {
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    });
  }

  getPendingReviewPosts() {
    return dbService.getPostsByStatus('REVIEW');
  }

  formatReviewCard(post) {
    const divider = '═'.repeat(60);
    const media = Array.isArray(post.media_assets) 
      ? post.media_assets 
      : (typeof post.media_assets === 'string' ? JSON.parse(post.media_assets || '[]') : []);

    const slideSummaries = media.map(m => `  • Slide ${m.slideNumber || m.sequence || '?'}: ${m.headline || m.title || ''}`).join('\n');

    return `
${divider}
📋 THE WONDER CUB — CONTENT APPROVAL CARD
${divider}
Content ID:        ${post.content_id}
Pillar:            ${post.pillar}
Format:            ${post.format}
Target Age:        Ages 3–7
Product:           ${post.product_id || 'Jungle Safari Bundle'} ($13.99)
Destination URL:   ${post.url || 'https://thewondercub.store/jungle-safari'}
UTM Tracked Link:  ${post.utm_url || 'N/A'}

🎯 SCORING BREAKDOWN:
  Growth Score:    ${post.growth_score}/10
  Sales Score:     ${post.sales_score}/10
  IP Risk Score:   ${post.ip_risk} (PASS: ${post.quality_check_passed ? 'YES' : 'NO'})

🪝 HOOK:
"${post.hook}"

🖼️ SLIDES / CREATIVE PREVIEW:
${slideSummaries || '  (No slides attached)'}

📝 CAPTION PREVIEW:
${post.caption ? post.caption.split('\n').map(l => '  ' + l).join('\n') : '  (No caption)'}

${divider}
STATUS: [ ${post.status} ] — Awaiting Operator Decision (Approve / Reject)
${divider}
`;
  }

  approvePost(contentId, approver = 'Operator') {
    dbService.updatePostStatus(contentId, 'APPROVED', {
      approved_by: approver,
      approved_at: new Date().toISOString()
    });

    dbService.logAudit('CONTENT_APPROVED', approver, { contentId });

    // Move file artifact if exists
    const srcFile = path.resolve(this.reviewDir, `${contentId}.json`);
    const dstFile = path.resolve(this.approvedDir, `${contentId}.json`);
    if (fs.existsSync(srcFile)) {
      const data = JSON.parse(fs.readFileSync(srcFile, 'utf-8'));
      data.status = 'APPROVED';
      data.approvedBy = approver;
      data.approvedAt = new Date().toISOString();
      fs.writeFileSync(dstFile, JSON.stringify(data, null, 2), 'utf-8');
      fs.unlinkSync(srcFile);
    }

    return { success: true, contentId, status: 'APPROVED', approver };
  }

  rejectPost(contentId, reason = 'Operator rejected', approver = 'Operator') {
    dbService.updatePostStatus(contentId, 'REJECTED', {
      rejection_reason: reason
    });

    dbService.logAudit('CONTENT_REJECTED', approver, { contentId, reason });

    const srcFile = path.resolve(this.reviewDir, `${contentId}.json`);
    const dstFile = path.resolve(this.rejectedDir, `${contentId}.json`);
    if (fs.existsSync(srcFile)) {
      const data = JSON.parse(fs.readFileSync(srcFile, 'utf-8'));
      data.status = 'REJECTED';
      data.rejectionReason = reason;
      fs.writeFileSync(dstFile, JSON.stringify(data, null, 2), 'utf-8');
      fs.unlinkSync(srcFile);
    }

    return { success: true, contentId, status: 'REJECTED', reason };
  }
}

// CLI Execution handler
if (process.argv[1] && process.argv[1].endsWith('approvalManager.js')) {
  const manager = new ApprovalManager();
  const pending = manager.getPendingReviewPosts();
  console.log(`\n🔍 Found ${pending.length} post(s) pending human approval:\n`);
  
  for (const post of pending) {
    console.log(manager.formatReviewCard(post));
  }
  
  if (process.argv.includes('--approve-all')) {
    for (const post of pending) {
      manager.approvePost(post.content_id, 'CLI-Admin');
      console.log(`✅ Approved post: ${post.content_id}`);
    }
  }
}
