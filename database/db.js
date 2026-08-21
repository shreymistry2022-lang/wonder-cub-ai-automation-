import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const dbDir = path.resolve(projectRoot, 'data');
const dbPath = path.resolve(dbDir, 'thewondercub.db');
const schemaPath = path.resolve(__dirname, 'schema.sql');

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

let dbInstance = null;

export function getDatabase() {
  if (!dbInstance) {
    dbInstance = new DatabaseSync(dbPath);
    initSchema(dbInstance);
  }
  return dbInstance;
}

function initSchema(db) {
  const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
  // Execute individual statements from schema
  const statements = schemaSql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  for (const stmt of statements) {
    try {
      db.exec(stmt + ';');
    } catch (err) {
      // Ignore if table exists or minor dialect differences
      if (!err.message.includes('already exists')) {
        console.error('Schema initialization error:', err.message);
      }
    }
  }
}

export const dbService = {
  getDb: getDatabase,

  // Products
  seedProducts(productsList) {
    const db = getDatabase();
    const insertStmt = db.prepare(`
      INSERT OR REPLACE INTO products (id, name, url, price, currency, format, target_age, details)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const p of productsList) {
      insertStmt.run(
        p.id,
        p.name,
        p.url,
        p.price || 0,
        p.currency || 'USD',
        p.format || 'Printable PDF',
        p.target_age || 'Ages 3–7',
        JSON.stringify(p)
      );
    }
  },

  getAllProducts() {
    const db = getDatabase();
    return db.prepare(`SELECT * FROM products`).all();
  },

  getProductById(id) {
    const db = getDatabase();
    return db.prepare(`SELECT * FROM products WHERE id = ?`).get(id);
  },

  // Content Ideas
  saveContentIdea(idea) {
    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO content_ideas 
      (id, pillar, format, hook, problem, concept, audience, growth_score, sales_score, composite_score, product_id, cta, visual_direction, ip_risk, is_winner, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      idea.id,
      idea.pillar,
      idea.format,
      idea.hook,
      idea.problem,
      idea.concept,
      idea.audience,
      idea.growth_score,
      idea.sales_score,
      idea.composite_score,
      idea.product_id || null,
      idea.cta,
      idea.visual_direction || '',
      idea.ip_risk || 0.0,
      idea.is_winner ? 1 : 0,
      idea.status || 'IDEA'
    );
  },

  // Content Posts
  saveContentPost(post) {
    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO content_posts 
      (content_id, idea_id, pillar, format, hook, caption, product_id, url, utm_url, media_assets, growth_score, sales_score, ip_risk, quality_check_passed, status, rejection_reason, approved_by, approved_at, published_at, instagram_post_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      post.content_id,
      post.idea_id,
      post.pillar,
      post.format,
      post.hook,
      post.caption,
      post.product_id || null,
      post.url || null,
      post.utm_url || null,
      JSON.stringify(post.media_assets || []),
      post.growth_score || 0.0,
      post.sales_score || 0.0,
      post.ip_risk || 0.0,
      post.quality_check_passed ? 1 : 0,
      post.status || 'DRAFT',
      post.rejection_reason || null,
      post.approved_by || null,
      post.approved_at || null,
      post.published_at || null,
      post.instagram_post_id || null
    );
  },

  getContentPost(contentId) {
    const db = getDatabase();
    return db.prepare(`SELECT * FROM content_posts WHERE content_id = ?`).get(contentId);
  },

  getPostsByStatus(status) {
    const db = getDatabase();
    return db.prepare(`SELECT * FROM content_posts WHERE status = ? ORDER BY created_at DESC`).all(status);
  },

  updatePostStatus(contentId, newStatus, extra = {}) {
    const db = getDatabase();
    const stmt = db.prepare(`
      UPDATE content_posts 
      SET status = ?, approved_by = COALESCE(?, approved_by), approved_at = COALESCE(?, approved_at), rejection_reason = COALESCE(?, rejection_reason)
      WHERE content_id = ?
    `);

    stmt.run(
      newStatus,
      extra.approved_by || null,
      extra.approved_at || null,
      extra.rejection_reason || null,
      contentId
    );
  },

  // Audit Logs
  logAudit(eventType, actor, details = {}) {
    const db = getDatabase();
    const id = 'AUDIT-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
    const stmt = db.prepare(`
      INSERT INTO audit_logs (id, event_type, actor, details)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(id, eventType, actor, JSON.stringify(details));
  },

  // Automation Runs
  recordRun(runId, workflowName, status, summary, errorMessage = null) {
    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT INTO automation_runs (id, workflow_name, status, summary, error_message, finished_at)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);
    stmt.run(runId, workflowName, status, summary, errorMessage);
  }
};
