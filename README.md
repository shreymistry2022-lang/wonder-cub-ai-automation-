# The Wonder Cub — AI Growth & Sales Automation (Phase 1)

Implements Phase 1 of `THE_WONDER_CUB_ANTIGRAVITY_AUTOMATION.md`: structure,
configs, database schema, agents, workflows, and a working performance
analytics agent. `PUBLISH_ENABLED=false` — nothing here posts to Instagram
automatically. See `AGENTS.md` for the non-negotiable brand/IP/accuracy rules.

## Setup

```
npm install
npm test
```

## Daily loop (manual today, semi-automatic once Phase 2 lands)

1. Pick/generate concepts — see `.agents/agents/content-strategist.md` and
   `content/ideas/`.
2. Build the creative in Canva, write the caption — see
   `.agents/agents/creative-director.md`. Build links with
   `scripts/utilities/utm.js` so every link is tracked.
3. Run it through `.agents/agents/quality-checker.md` (the automatable price/
   URL check lives in `scripts/quality/qualityChecker.js`).
4. Get human approval (`.agents/workflows/approval.md`).
5. Post manually. Record `instagram_post_id` and the `content_id`.

## Performance agent — the "verify performance and plan" loop

After a post has been live a day or two, log its numbers manually (until the
Instagram Graph API / GA4 adapters are built) as
`data/performance/<content_id>.json`:

```json
{
  "content_id": "WC-2026-08-24-001",
  "pillar": "parent_problems",
  "format": "reel",
  "published_at": "2026-08-24",
  "metrics": {
    "reach": 1800, "impressions": 2100, "views": 1500, "likes": 90,
    "comments": 12, "shares": 22, "saves": 34, "profile_visits": 20,
    "follows": 6, "website_clicks": 15
  }
}
```

Log any resulting sale as `data/sales/<order_id>.json`:

```json
{ "order_id": "TWC-1042", "product_id": "wild-wonders-jungle-safari", "utm_content": "WC-2026-08-24-001", "revenue_usd": 13.99, "date": "2026-08-25" }
```

Then run:

```
npm run analytics           # daily-style report: winners, losers, attributed revenue
npm run analytics:weekly    # also writes data/learning/<date>.json and proposes next week's plan
```

This is `scripts/analytics/performanceAgent.js`. It computes growth/sales
scores from real metrics against the account median (not guesses), attributes
sales via UTM match, refuses to call something a "pattern" until at least 2
posts support it (anti-overfitting rule, spec section 53), and proposes next
tests based on what's actually winning. Output also goes to
`data/reports/performance-<date>.json`.

## What's not built yet

- Real Instagram Graph API / GA4 / website adapter integrations (`scripts/website/`,
  section 21) — currently manual JSON logs.
- Publisher, creator outreach, and ad-spend automation — all gated off by
  `config/automation.yaml` flags (`publish_enabled`, `outreach_enabled`,
  `spend_enabled` = false) until explicitly approved.
