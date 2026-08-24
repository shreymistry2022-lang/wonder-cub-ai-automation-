-- The Wonder Cub AI Growth & Sales Automation
-- PostgreSQL schema per THE_WONDER_CUB_ANTIGRAVITY_AUTOMATION.md section 37.

CREATE TABLE IF NOT EXISTS products (
    product_id      TEXT PRIMARY KEY,
    name            TEXT NOT NULL,
    url             TEXT NOT NULL,
    price_usd       NUMERIC(10,2),
    description     TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS competitors (
    competitor_id   SERIAL PRIMARY KEY,
    handle          TEXT NOT NULL UNIQUE,
    platform        TEXT NOT NULL DEFAULT 'instagram',
    category        TEXT,
    url             TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS competitor_posts (
    post_id           SERIAL PRIMARY KEY,
    competitor_id     INTEGER REFERENCES competitors(competitor_id),
    source_url        TEXT NOT NULL,
    topic             TEXT,
    format            TEXT,
    hook              TEXT,
    observed_engagement TEXT,
    audience_problem  TEXT,
    ip_risk           TEXT,
    research_date     DATE NOT NULL DEFAULT current_date
);

CREATE TABLE IF NOT EXISTS content_ideas (
    content_id        TEXT PRIMARY KEY,   -- WC-YYYY-MM-DD-###
    pillar            TEXT NOT NULL,
    format            TEXT NOT NULL,
    hook              TEXT,
    problem           TEXT,
    concept           TEXT,
    audience          TEXT,
    growth_score      NUMERIC(5,2),
    sales_score       NUMERIC(5,2),
    final_score       NUMERIC(5,2),
    product_id        TEXT REFERENCES products(product_id),
    cta               TEXT,
    ip_risk           TEXT,
    status            TEXT NOT NULL DEFAULT 'IDEA',
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS content_assets (
    asset_id          SERIAL PRIMARY KEY,
    content_id        TEXT REFERENCES content_ideas(content_id),
    asset_type        TEXT,   -- carousel_slide, reel_video, cover_image
    file_path         TEXT,
    alt_text          TEXT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS content_posts (
    content_id          TEXT PRIMARY KEY REFERENCES content_ideas(content_id),
    caption              TEXT,
    utm_url              TEXT,
    instagram_post_id    TEXT,
    status                TEXT NOT NULL DEFAULT 'DRAFT',
    published_at          TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS content_metrics (
    metric_id         SERIAL PRIMARY KEY,
    content_id        TEXT REFERENCES content_ideas(content_id),
    collected_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    reach             INTEGER DEFAULT 0,
    impressions       INTEGER DEFAULT 0,
    views             INTEGER DEFAULT 0,
    likes             INTEGER DEFAULT 0,
    comments          INTEGER DEFAULT 0,
    shares            INTEGER DEFAULT 0,
    saves             INTEGER DEFAULT 0,
    profile_visits    INTEGER DEFAULT 0,
    follows           INTEGER DEFAULT 0,
    website_clicks    INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS website_sessions (
    session_id        SERIAL PRIMARY KEY,
    utm_content       TEXT,
    utm_campaign      TEXT,
    utm_source        TEXT,
    sessions          INTEGER DEFAULT 0,
    product_views     INTEGER DEFAULT 0,
    add_to_cart       INTEGER DEFAULT 0,
    session_date      DATE NOT NULL DEFAULT current_date
);

CREATE TABLE IF NOT EXISTS sales (
    sale_id           SERIAL PRIMARY KEY,
    product_id        TEXT REFERENCES products(product_id),
    utm_content       TEXT,
    utm_campaign      TEXT,
    revenue_usd       NUMERIC(10,2),
    order_id          TEXT,
    sale_date         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS creators (
    creator_id        SERIAL PRIMARY KEY,
    handle            TEXT NOT NULL,
    platform          TEXT DEFAULT 'instagram',
    audience_fit      NUMERIC(4,2),
    engagement_quality NUMERIC(4,2),
    content_quality   NUMERIC(4,2),
    brand_safety      NUMERIC(4,2),
    status            TEXT DEFAULT 'PROSPECT'
);

CREATE TABLE IF NOT EXISTS creator_campaigns (
    campaign_id       SERIAL PRIMARY KEY,
    creator_id        INTEGER REFERENCES creators(creator_id),
    tracking_url      TEXT,
    discount_code     TEXT,
    commission_rate   NUMERIC(5,4),
    clicks            INTEGER DEFAULT 0,
    orders            INTEGER DEFAULT 0,
    revenue_usd       NUMERIC(10,2) DEFAULT 0,
    commission_usd    NUMERIC(10,2) DEFAULT 0
);

CREATE TABLE IF NOT EXISTS utm_links (
    utm_id            SERIAL PRIMARY KEY,
    content_id        TEXT REFERENCES content_ideas(content_id),
    full_url          TEXT NOT NULL,
    utm_source        TEXT,
    utm_medium        TEXT,
    utm_campaign      TEXT,
    utm_content       TEXT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS experiments (
    experiment_id     SERIAL PRIMARY KEY,
    hypothesis        TEXT NOT NULL,
    variant_a_content_id TEXT REFERENCES content_ideas(content_id),
    variant_b_content_id TEXT REFERENCES content_ideas(content_id),
    variable_tested   TEXT,
    result            TEXT,
    conclusion        TEXT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS learning (
    learning_id       SERIAL PRIMARY KEY,
    week_of           DATE NOT NULL,
    winners           JSONB,
    losers            JSONB,
    repeated_patterns JSONB,
    failed_hypotheses JSONB,
    sales_insights    JSONB,
    next_tests        JSONB,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS automation_runs (
    run_id            SERIAL PRIMARY KEY,
    workflow          TEXT NOT NULL,
    status            TEXT NOT NULL,
    started_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    finished_at       TIMESTAMPTZ,
    summary           TEXT
);

CREATE TABLE IF NOT EXISTS audit_logs (
    log_id            SERIAL PRIMARY KEY,
    actor             TEXT,
    action            TEXT NOT NULL,
    details           JSONB,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
