-- The Wonder Cub AI Automation Relational Schema
-- Compatible with SQLite (Dev) and PostgreSQL (Production)

CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    price REAL NOT NULL,
    currency TEXT DEFAULT 'USD',
    format TEXT NOT NULL,
    target_age TEXT NOT NULL,
    details JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS competitors (
    id TEXT PRIMARY KEY,
    handle TEXT UNIQUE NOT NULL,
    platform TEXT DEFAULT 'instagram',
    category TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS competitor_posts (
    id TEXT PRIMARY KEY,
    competitor_id TEXT NOT NULL,
    post_url TEXT,
    topic TEXT NOT NULL,
    format TEXT NOT NULL,
    hook TEXT,
    engagement_observed TEXT,
    why_it_worked TEXT,
    audience_problem TEXT,
    adaptation_concept TEXT,
    ip_risk_score REAL DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (competitor_id) REFERENCES competitors(id)
);

CREATE TABLE IF NOT EXISTS content_ideas (
    id TEXT PRIMARY KEY,
    pillar TEXT NOT NULL,
    format TEXT NOT NULL,
    hook TEXT NOT NULL,
    problem TEXT NOT NULL,
    concept TEXT NOT NULL,
    audience TEXT NOT NULL,
    growth_score REAL NOT NULL,
    sales_score REAL NOT NULL,
    composite_score REAL NOT NULL,
    product_id TEXT,
    cta TEXT NOT NULL,
    visual_direction TEXT,
    ip_risk REAL DEFAULT 0.0,
    is_winner BOOLEAN DEFAULT 0,
    status TEXT DEFAULT 'IDEA', -- IDEA, DRAFT, REVIEW, APPROVED, SCHEDULED, PUBLISHED, REJECTED, FAILED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS content_posts (
    content_id TEXT PRIMARY KEY, -- e.g. WC-2026-08-21-001
    idea_id TEXT NOT NULL,
    pillar TEXT NOT NULL,
    format TEXT NOT NULL,
    hook TEXT NOT NULL,
    caption TEXT NOT NULL,
    product_id TEXT,
    url TEXT,
    utm_url TEXT,
    media_assets JSON,
    growth_score REAL,
    sales_score REAL,
    ip_risk REAL DEFAULT 0.0,
    quality_check_passed BOOLEAN DEFAULT 0,
    status TEXT DEFAULT 'DRAFT', -- DRAFT, REVIEW, APPROVED, SCHEDULED, PUBLISHED, REJECTED, FAILED, LEARNED
    rejection_reason TEXT,
    approved_by TEXT,
    approved_at TIMESTAMP,
    scheduled_for TIMESTAMP,
    published_at TIMESTAMP,
    instagram_post_id TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (idea_id) REFERENCES content_ideas(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS content_assets (
    id TEXT PRIMARY KEY,
    content_id TEXT NOT NULL,
    asset_type TEXT NOT NULL, -- carousel_slide, reel_video, cover_image, script
    sequence_order INTEGER DEFAULT 1,
    content_payload TEXT,
    file_path TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (content_id) REFERENCES content_posts(content_id)
);

CREATE TABLE IF NOT EXISTS content_metrics (
    id TEXT PRIMARY KEY,
    content_id TEXT NOT NULL,
    reach INTEGER DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    saves INTEGER DEFAULT 0,
    profile_visits INTEGER DEFAULT 0,
    follows INTEGER DEFAULT 0,
    website_clicks INTEGER DEFAULT 0,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (content_id) REFERENCES content_posts(content_id)
);

CREATE TABLE IF NOT EXISTS website_sessions (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    utm_content TEXT, -- matches content_id
    landing_page TEXT,
    product_viewed TEXT,
    added_to_cart BOOLEAN DEFAULT 0,
    reached_checkout BOOLEAN DEFAULT 0,
    converted BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sales (
    id TEXT PRIMARY KEY,
    order_id TEXT UNIQUE NOT NULL,
    product_id TEXT NOT NULL,
    amount REAL NOT NULL,
    currency TEXT DEFAULT 'USD',
    utm_content TEXT, -- links to content_id
    attributed_instagram BOOLEAN DEFAULT 0,
    order_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS creators (
    id TEXT PRIMARY KEY,
    handle TEXT NOT NULL,
    platform TEXT DEFAULT 'instagram',
    profile_url TEXT,
    audience_size INTEGER DEFAULT 0,
    estimated_fit_score REAL DEFAULT 0.0,
    brand_safety_score REAL DEFAULT 0.0,
    product_fit_score REAL DEFAULT 0.0,
    status TEXT DEFAULT 'IDENTIFIED', -- IDENTIFIED, APPROVED, CONTACTED, ACTIVE, INACTIVE
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS creator_campaigns (
    id TEXT PRIMARY KEY,
    creator_id TEXT NOT NULL,
    tracking_url TEXT,
    discount_code TEXT,
    commission_rate REAL DEFAULT 0.15,
    clicks INTEGER DEFAULT 0,
    orders INTEGER DEFAULT 0,
    revenue REAL DEFAULT 0.0,
    commission_paid REAL DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (creator_id) REFERENCES creators(id)
);

CREATE TABLE IF NOT EXISTS utm_links (
    id TEXT PRIMARY KEY,
    content_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    full_url TEXT NOT NULL,
    short_code TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (content_id) REFERENCES content_posts(content_id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS experiments (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    variable_tested TEXT NOT NULL, -- hook, format, cta, visual
    variant_a TEXT NOT NULL,
    variant_b TEXT NOT NULL,
    results JSON,
    winner TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS learning (
    id TEXT PRIMARY KEY,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    winners JSON,
    losers JSON,
    repeated_patterns JSON,
    failed_hypotheses JSON,
    sales_insights JSON,
    actionable_tests JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS automation_runs (
    id TEXT PRIMARY KEY,
    workflow_name TEXT NOT NULL,
    status TEXT NOT NULL, -- SUCCESS, FAILED, STOPPED_AT_GATE
    summary TEXT,
    error_message TEXT,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    finished_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    event_type TEXT NOT NULL,
    actor TEXT NOT NULL,
    details JSON,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
