# THE WONDER CUB --- ANTIGRAVITY AI GROWTH & SALES AUTOMATION

Version: 2.0\
Platform: Google Antigravity 2.0 / Antigravity CLI\
Website: https://thewondercub.store

## 1. Objective

Build an AI marketing system that continuously:

1.  Researches competitors, creators, trends, and audience problems.
2.  Analyzes high-performing Instagram content.
3.  Generates original The Wonder Cub content.
4.  Creates branded carousels and Reels.
5.  Performs quality and IP checks.
6.  Publishes approved content to Instagram.
7.  Tracks Instagram performance.
8.  Tracks website traffic and purchases.
9.  Attributes traffic/sales where technically possible.
10. Learns from performance and improves future content.
11. Finds creator/affiliate opportunities.
12. Produces daily and weekly reports.

The objective is **not** merely automatic posting.

The loop is:

`RESEARCH → ANALYZE → CREATE → CHECK → PUBLISH → MEASURE → LEARN → SELL → IMPROVE`

## 2. Business Goals

Primary goals:

-   Grow a relevant Instagram audience.
-   Increase shares and saves.
-   Increase profile visits.
-   Increase qualified website traffic.
-   Increase purchases and revenue.
-   Reduce manual content-production time.
-   Build a repeatable marketing engine.

Do not optimize only for followers or likes. A smaller post that
generates sales can be more valuable than a large post with no
commercial intent.

## 3. Website

The Wonder Cub website:

`https://thewondercub.store`

This is **not Shopify**.

Before implementing website integration, inspect and confirm:

-   Framework
-   Hosting
-   Backend
-   Product database
-   Checkout provider
-   Payment provider
-   Order storage
-   API/webhooks
-   GA4
-   Meta Pixel
-   Meta Conversions API availability

Never invent endpoints, prices, product URLs, order APIs, or payment
capabilities. If unknown, create an adapter/interface and mark the
integration as TODO.

## 4. Why Antigravity

Use Google Antigravity as the primary agent-development and
orchestration environment.

Use its current supported capabilities for:

-   Main agents
-   Parallel subagents
-   Browser interaction
-   Terminal/code execution
-   Artifacts
-   MCP
-   Custom agents
-   Workflows
-   Scheduled tasks
-   Plugins

Antigravity supports custom agents as Markdown files with YAML
frontmatter, and workspace agents can live under `.agents/agents/`.

Always verify current official Antigravity documentation before
implementing changing features.

## 5. Architecture

``` text
                         ANTIGRAVITY
                    AI MARKETING COMMAND
                             |
              +--------------+--------------+
              |              |              |
              v              v              v
         RESEARCH        STRATEGY       ANALYTICS
           AGENTS          AGENT          AGENT
              |              |              |
              v              v              v
        Competitors       Content       Instagram
        Trends            Ideas         Website
        Creators          Scoring       Sales
              |              |              |
              +--------------+--------------+
                             |
                             v
                    CREATIVE DIRECTOR
                             |
                             v
                     QUALITY / IP AGENT
                             |
                             v
                       APPROVAL GATE
                             |
                             v
                    INSTAGRAM PUBLISHER
                             |
                             v
                       INSTAGRAM
                             |
                             v
                    THEWONDERCUB.STORE
                             |
                             v
                          SALES
                             |
                             v
                     ANALYTICS AGENT
                             |
                             v
                       LEARNING LOOP
                             |
                             +----------> NEXT CONTENT
```

## 6. Project Structure

``` text
wonder-cub-ai/
├── AGENTS.md
├── AUTOMATION.md
├── README.md
├── .env.example
├── .gitignore
├── .agents/
│   ├── agents/
│   │   ├── research-agent.md
│   │   ├── viral-analyst.md
│   │   ├── content-strategist.md
│   │   ├── creative-director.md
│   │   ├── quality-checker.md
│   │   ├── publisher.md
│   │   ├── analytics-agent.md
│   │   ├── sales-analyst.md
│   │   └── creator-agent.md
│   ├── workflows/
│   │   ├── daily-research.md
│   │   ├── daily-content.md
│   │   ├── approval.md
│   │   ├── publishing.md
│   │   ├── performance.md
│   │   └── weekly-strategy.md
│   ├── skills/
│   │   ├── competitor-research/
│   │   ├── instagram-content/
│   │   ├── website-analytics/
│   │   └── sales-analysis/
│   └── mcp_config.json
├── config/
│   ├── brand.yaml
│   ├── products.yaml
│   ├── competitors.yaml
│   ├── content-pillars.yaml
│   ├── scoring.yaml
│   └── automation.yaml
├── database/
│   ├── schema.sql
│   └── migrations/
├── data/
│   ├── competitors/
│   ├── trends/
│   ├── content/
│   ├── performance/
│   ├── sales/
│   ├── creators/
│   └── reports/
├── content/
│   ├── ideas/
│   ├── drafts/
│   ├── review/
│   ├── approved/
│   ├── scheduled/
│   ├── published/
│   └── rejected/
├── creatives/
│   ├── templates/
│   ├── generated/
│   └── final/
├── scripts/
│   ├── research/
│   ├── instagram/
│   ├── website/
│   ├── analytics/
│   └── utilities/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── fixtures/
└── logs/
```

## 7. AGENTS.md Rules

Create `AGENTS.md` containing:

``` text
BRAND:
The Wonder Cub

WEBSITE:
https://thewondercub.store

MISSION:
Help parents find fun, educational and screen-free activities for children.

BUSINESS GOAL:
Generate qualified attention, website traffic and sales.

CONTENT GOAL:
Create content people want to watch, save, share, comment on, follow for,
and click through to the website from.

BRAND:
Helpful, fun, educational, parent-friendly, child-safe, creative, trustworthy.

IP:
Never copy competitor images, artwork, captions, exact wording, logos,
characters, layouts, or brand identity.

Never use copyrighted characters or trademarks without documented permission.

ACCURACY:
Never invent prices, discounts, reviews, statistics, product features,
customer results, URLs, or availability.

PUBLISHING:
Phase 1 must use PUBLISH_ENABLED=false.
```

## 8. Custom Subagents

Each specialized agent should be a Markdown file under
`.agents/agents/`.

Use YAML frontmatter supported by the installed Antigravity version.

Example:

``` yaml
---
name: research-agent
description: Research competitors, trends and relevant audience topics for The Wonder Cub.
tools:
  - view_file
  - grep_search
  - run_command
subagent: true
mainAgent: false
---
```

Verify the exact available tool names before finalizing the `tools`
list. Do not invent undocumented tool names.

## 9. Research Agent

Responsibilities:

-   Find direct competitors.
-   Find parenting accounts.
-   Find kids activity accounts.
-   Find educational accounts.
-   Find relevant creators.
-   Find emerging topics.
-   Find recent high-performing content.
-   Record source URLs.
-   Avoid copying.

For each candidate:

``` text
Research date
Source
Account
URL
Topic
Format
Hook
Observed engagement
Why it may work
Audience problem
Original adaptation
IP risk
```

Do not label something "viral" based only on raw likes.

## 10. Viral Analyst

Analyze:

-   Hook
-   Topic
-   Audience problem
-   Curiosity
-   Emotional trigger
-   Format
-   Shareability
-   Saveability
-   Commentability
-   Visual clarity
-   CTA
-   Audience fit
-   Product relevance

Starting score:

``` text
Hook                 /10
Problem relevance    /10
Share potential      /10
Save potential       /10
Comment potential    /10
Curiosity            /10
Visual clarity       /10
Audience fit         /10
Product relevance    /10
Original adaptation  /10
```

This score is a prioritization aid, not a guarantee of virality.

## 11. Content Strategist

Inputs:

-   Competitor research
-   Viral analysis
-   Historical The Wonder Cub performance
-   Product catalog
-   Current trends
-   Previous learnings

Generate approximately five original concepts.

Each:

``` text
content_id
pillar
format
hook
problem
concept
audience
growth_score
sales_score
product_connection
cta
visual_direction
ip_risk
```

## 12. Content Pillars

Start with:

### Parent Problems

Boredom, screen time, travel boredom, rainy days, quiet time.

### Screen-Free Activities

5-minute activities, no-prep activities, travel activities, indoor
activities.

### Interactive

Guessing games, hidden objects, puzzles, challenges,
spot-the-difference.

### Educational

Animal facts, learning challenges, simple educational activities.

### Relatable Parenting

Parent POV, funny situations, common child behavior.

### Product / Conversion

Product demonstrations, what's inside, benefits, use cases, gift ideas,
legitimate promotions.

## 13. Content Mix

Initial hypothesis:

``` text
60% growth/value
25% trust/education
15% sales
```

Change this based on actual performance.

## 14. Growth Score

Initial weighting:

``` text
30% share potential
20% save potential
15% comment potential
15% reach potential
10% follow potential
10% profile-visit potential
```

Do not optimize only for likes.

## 15. Sales Score

Initial weighting:

``` text
30% audience-product fit
20% problem-product fit
20% website-click potential
15% purchase intent
15% CTA quality
```

Replace assumptions with learned data once enough observations exist.

## 16. Daily Winner

Initial formula:

``` text
Final Score = 60% Growth Score + 40% Sales Score
```

Also label:

-   Growth Winner
-   Engagement Winner
-   Traffic Winner
-   Sales Winner

## 17. Creative Director

Generate:

-   Carousel copy
-   Slide structure
-   Reel script
-   Caption
-   CTA
-   Visual direction
-   Product URL
-   UTM URL
-   Alt text
-   Design instructions

Prefer reusable branded Canva templates.

Start with 10--15 templates:

-   5 tips
-   7 tips
-   Quiz
-   Guessing game
-   Hidden object
-   Parent problem
-   Educational fact
-   Product showcase
-   Product demonstration
-   Testimonial

## 18. Reels

Test:

-   Problem/solution
-   Activity demonstrations
-   Parent POV
-   Educational
-   Interactive challenges
-   Product walkthroughs
-   Voiceover
-   Text-led Reels

Suggested structure:

``` text
0–2 sec: Hook
2–5 sec: Problem
5–15 sec: Value
15–20 sec: Payoff
Final: CTA
```

Adapt timing to the actual creative.

## 19. Caption Agent

Structure:

``` text
Hook
Value/context
Actionable takeaway
CTA
```

Possible CTAs:

-   Save this.
-   Send this to a parent.
-   Follow for more screen-free ideas.
-   Try this with your child.
-   Explore The Wonder Cub.

Sales CTAs:

-   Explore the complete activity pack.
-   See the full collection.
-   Get the activity pack.

No fake urgency.

## 20. Quality / IP Agent

Before publication check:

### Brand

-   Correct name
-   Consistent visual style
-   Appropriate tone
-   Correct website

### Copy

-   Spelling
-   Grammar
-   Claims
-   Statistics
-   Testimonials

### IP

-   Copyrighted characters
-   Trademarks
-   Competitor artwork
-   Copied wording
-   Confusing similarity

### Commercial

-   Correct product
-   Correct price if shown
-   Correct URL
-   Correct CTA

### Technical

-   Dimensions
-   Text readability
-   Cropping
-   Broken media
-   Duplicates

Critical failure = `DO NOT PUBLISH`.

## 21. Website Adapter

Create:

``` text
WebsiteAdapter
├── get_products()
├── get_product()
├── get_order_metrics()
├── get_sales_metrics()
└── health_check()
```

Implement only what the real website supports.

## 22. UTM Tracking

Every Instagram website link should use UTMs.

Example:

``` text
https://thewondercub.store/product/example
?utm_source=instagram
&utm_medium=organic_social
&utm_campaign=august_2026
&utm_content=WC-2026-08-21-001
```

Use only verified URLs.

## 23. Sales Attribution

Track where possible:

``` text
Instagram post
↓
Profile visit
↓
Website click
↓
Landing page
↓
Product view
↓
Add to cart
↓
Checkout
↓
Purchase
```

Use GA4, Meta tracking, website/backend data, or a combination.

Never claim an order is Instagram-attributed without supporting data.

## 24. Analytics Agent

Collect where available:

-   Reach
-   Impressions
-   Views
-   Likes
-   Comments
-   Shares
-   Saves
-   Profile visits
-   Follows
-   Website clicks
-   Reel metrics

Compare against:

-   Account median
-   Recent posts
-   Same format
-   Same pillar
-   Same objective

## 25. Sales Analyst

Analyze:

-   Instagram sessions
-   Product views
-   Add-to-cart
-   Checkout
-   Purchases
-   Revenue
-   Product
-   UTM source
-   UTM campaign
-   UTM content

Output:

``` text
Top sales content
Top traffic content
Top products
Conversion patterns
Weak points
Next tests
```

Never expose payment-card information or unnecessary customer data to
the AI.

## 26. Learning System

Maintain:

``` text
data/learning/
```

Each week record:

``` text
WINNERS
LOSERS
REPEATED PATTERNS
FAILED HYPOTHESES
SALES INSIGHTS
NEXT TESTS
```

Do not overfit to one viral post. Require repeated evidence.

## 27. Creator Agent

Research:

-   Parenting creators
-   Mom creators
-   Kids activity creators
-   Homeschool creators
-   Teacher creators
-   Family creators

Score:

``` text
Audience fit
Engagement quality
Content quality
Brand safety
Audience geography
Product relevance
Potential conversion
```

Initially:

`OUTREACH_ENABLED=false`

Human approval is required before outreach.

## 28. Affiliate System

For approved creators track:

``` text
creator_id
tracking_url
discount_code
commission_rate
clicks
orders
revenue
commission
ROI
```

Never invent commission rates.

## 29. MCP

Use MCP for reliable integrations such as:

-   Database
-   GitHub
-   Website/backend
-   Analytics
-   Cloud storage
-   Design tools
-   Notifications

Prefer official/verified MCP servers.

For custom MCP, follow the currently installed Antigravity configuration
format.

Review:

-   Publisher
-   Permissions
-   Source
-   Credentials
-   Data access
-   Write capabilities

Use least privilege.

## 30. Workflows

Create:

``` text
.agents/workflows/daily-research.md
.agents/workflows/daily-content.md
.agents/workflows/approval.md
.agents/workflows/publishing.md
.agents/workflows/performance.md
.agents/workflows/weekly-strategy.md
```

### Daily Research

``` text
Read AGENTS.md.
Read current products.
Read recent performance.
Invoke research-agent.
Invoke viral-analyst.
Save findings.
Produce report.
Do not publish.
```

### Daily Content

``` text
Read latest research.
Read historical performance.
Read products.
Invoke content-strategist.
Generate five concepts.
Score them.
Select winner.
Invoke creative-director.
Invoke quality-checker.
Save draft.
Set REVIEW.
Do not publish.
```

### Approval

``` text
Display:
- Hook
- Preview
- Caption
- CTA
- Product
- URL
- Growth score
- Sales score
- IP result

Wait for explicit human approval.
Approved → APPROVED.
Rejected → REJECTED.
```

### Publishing

``` text
Confirm PUBLISH_ENABLED.
Confirm APPROVED status.
Validate media.
Validate caption.
Validate URL.
Check duplicate.
Publish through official Instagram integration.
Verify response.
Save post ID.
Set PUBLISHED.
On failure: FAILED + alert.
```

### Performance

``` text
Collect Instagram metrics.
Collect website analytics.
Collect sales data.
Match UTM/content IDs.
Calculate metrics.
Identify winners/losers.
Update learning.
```

### Weekly Strategy

``` text
Read weekly content, website and sales data.
Identify winners.
Identify repeated patterns.
Reject unsupported assumptions.
Update learning.
Create next week's strategy.
```

## 31. Scheduled Tasks

Use Antigravity scheduled tasks for recurring agent work where
appropriate.

Suggested:

-   Morning: research + planning
-   Midday: creative + approval
-   After publishing: performance collection
-   Weekly: strategy review

Do not assume a local desktop session is an always-on production server.
Use reliable server-side scheduling for production-critical jobs when
required.

## 32. Daily Pipeline

``` text
08:00
↓
Research
↓
Competitor analysis
↓
Trend analysis
↓
Read previous performance
↓
Generate 5 concepts
↓
Score
↓
Select winner
↓
Generate creative
↓
Quality/IP check
↓
Human approval
↓
Publish
↓
Save post ID
↓
Track performance
```

## 33. Phase 1 --- Human Approval

``` text
AUTOMATION_ENABLED=true
PUBLISH_ENABLED=false
OUTREACH_ENABLED=false
SPEND_ENABLED=false
```

Pipeline:

`Research → Analyze → Generate → Design → Check → Human review → Publish manually`

## 34. Phase 2 --- Semi-Automatic

``` text
AUTOMATION_ENABLED=true
PUBLISH_ENABLED=true
OUTREACH_ENABLED=false
SPEND_ENABLED=false
```

Pipeline:

`Research → Generate → Design → Check → Auto-schedule → Notify`

Keep manual cancellation.

## 35. Phase 3 --- Full Content Automation

Only after sufficient validation:

`Research → Strategy → Creative → Quality/IP → Publish → Measure → Learn`

Keep creator outreach and ad spending as separate approval gates.

## 36. Never Automate Initially

Do not automate:

-   Mass DMs
-   Mass creator outreach
-   Fake engagement
-   Buying followers
-   Buying likes
-   Follow/unfollow schemes
-   Fake comments
-   Automatic ad spending
-   Unreviewed controversial content
-   Unreviewed legal/IP claims

## 37. Database

Use PostgreSQL for production.

Tables:

``` text
products
competitors
competitor_posts
content_ideas
content_assets
content_posts
content_metrics
website_sessions
sales
creators
creator_campaigns
utm_links
experiments
learning
automation_runs
audit_logs
```

Every content record should include:

``` text
content_id
created_at
status
pillar
format
hook
concept
caption
product_id
url
utm_url
growth_score
sales_score
ip_risk
published_at
instagram_post_id
```

## 38. Status Machine

``` text
IDEA
↓
DRAFT
↓
REVIEW
↓
APPROVED
↓
SCHEDULED
↓
PUBLISHED
↓
ANALYZING
↓
LEARNED
```

Failure states:

`REJECTED`, `FAILED`, `CANCELLED`

## 39. Duplicate Protection

Every post receives:

`WC-YYYY-MM-DD-###`

Example:

`WC-2026-08-21-001`

Before publishing check:

-   Content ID
-   Media hash
-   Caption hash
-   Recent published content

## 40. Security

Never commit:

-   API keys
-   Access tokens
-   Passwords
-   Payment credentials
-   Customer secrets

Use `.env` or a secure secret manager.

Example:

``` text
ANTHROPIC_API_KEY=
META_APP_ID=
META_APP_SECRET=
META_ACCESS_TOKEN=
INSTAGRAM_ACCOUNT_ID=
GA4_PROPERTY_ID=
DATABASE_URL=
WEBSITE_API_URL=
WEBSITE_API_KEY=
```

Only add variables actually required.

## 41. Antigravity Security

Keep default approval/security controls during development.

Do not use unrestricted/full-machine permissions just to make
development easier.

Use:

-   Project-bounded access
-   Explicit approvals
-   Least-privilege MCP permissions
-   Separate development/production credentials
-   Restricted production publishing

## 42. Kill Switch

Create:

``` text
AUTOMATION_ENABLED=false
PUBLISH_ENABLED=false
OUTREACH_ENABLED=false
SPEND_ENABLED=false
```

Each capability must be independently controllable.

## 43. Error Handling

``` text
TRY
↓
ACTION
↓
VERIFY
↓
SUCCESS
```

On failure:

`RETRY → VERIFY`

After maximum retries:

`LOG → ALERT → STOP`

Never retry indefinitely.

## 44. Notifications

Notify owner for:

-   Content ready
-   Approval required
-   Publish success/failure
-   Website API failure
-   Analytics failure
-   Large sales drop
-   Exceptional content performance
-   Security error

## 45. Daily Report

``` text
THE WONDER CUB — DAILY REPORT

Posts published: 1
Reach: 18,420
Shares: 412
Saves: 681
Profile visits: 95
Website clicks: 42
Attributed Instagram orders: 6
Attributed revenue: ₹XXX

BEST GROWTH POST:
...

BEST SALES POST:
...

AI INSIGHT:
...

NEXT TEST:
...
```

Only report attributed sales when supported by tracking data.

## 46. Weekly Report

``` text
1. Best posts
2. Worst posts
3. Growth winners
4. Engagement winners
5. Traffic winners
6. Sales winners
7. Best pillar
8. Best format
9. Best hook
10. Best CTA
11. Best product angle
12. What to stop
13. What to repeat
14. What to test
15. Next week's calendar
```

## 47. Organic Growth Engine

Test:

### Hooks

Curiosity, problem/solution, challenge, question, list, parent POV,
contrarian.

### Formats

Reels, carousels, quizzes, puzzles, stories, static posts.

### Topics

Screen-free activities, boredom, travel, learning, animals, parenting,
activities, product use cases.

### CTAs

Save, share, comment, follow, profile visit, website visit.

Use real data to determine what to scale.

## 48. Sales Engine

``` text
DISCOVERY
↓
Instagram content
↓
PROFILE
↓
WEBSITE CLICK
↓
LANDING PAGE
↓
PRODUCT VIEW
↓
CHECKOUT
↓
PURCHASE
```

Content should connect real customer problems to relevant products.

## 49. Organic → Ads Loop

Do not automatically boost everything.

``` text
Organic content
↓
Find winners
↓
Check shares, saves, clicks, purchases
↓
Select promising creative
↓
Human-approved paid test
↓
Measure ROI
```

## 50. Creator Distribution

Build a creator shortlist with:

``` text
creator
platform
profile_url
audience
estimated_fit
engagement
content_type
country
brand_safety
product_fit
status
```

Keep:

`OUTREACH_ENABLED=false`

until approved.

## 51. Repurposing

A winning concept can become:

``` text
Carousel
↓
Reel
↓
Story
↓
Facebook post
↓
Pinterest concept
↓
Email topic
↓
Website content
```

Adapt the format instead of blindly duplicating.

## 52. A/B Testing

Test one major variable at a time.

Example:

A: `Your child is bored again?`

B: `Try this before giving them a screen.`

Compare:

-   Retention
-   Shares
-   Saves
-   Clicks
-   Purchases

Store experiments in `experiments`.

## 53. Anti-Overfitting

One successful post does not prove a strategy.

Example:

One successful animal quiz:

``` text
DO NOT conclude:
Animal quizzes always go viral.

INSTEAD:
Create a hypothesis.
Test 3–5 variations.
Decide from repeated evidence.
```

## 54. Hosting

Development:

Google Antigravity on the development machine.

Production where required:

``` text
Linux VPS
+
Docker
+
PostgreSQL
+
Application services
+
HTTPS
+
Backups
```

Antigravity is the development/agent command environment; do not assume
a local desktop session is an always-on production server.

## 55. Backups

Back up:

-   Database
-   Configuration
-   Content metadata
-   Learning data
-   Important generated assets

Never back up secrets into public repositories.

Test restoration.

## 56. Development Plan

### Phase 1

Build repository, rules, configuration, database, research, analysis,
strategy, scoring, quality checks and approval.

### Phase 2

Build creative generation, UTM links, Instagram integration and
analytics.

### Phase 3

Build website integration, sales attribution and weekly learning.

### Phase 4

Build creator discovery, affiliate tracking and repurposing.

### Phase 5

Enable controlled automatic publishing.

## 57. First 7 Days

Day 1: - Antigravity project - Git - AGENTS.md - Structure

Day 2: - Brand - Products - Content pillars - Competitors

Day 3: - Research Agent - Viral Analyst

Day 4: - Content Strategist - Scoring

Day 5: - Creative Director - Caption Agent - Quality Agent

Day 6: - Run complete pipeline manually

Day 7: - Review quality, research, IP risks and missing integrations

Do not publish automatically yet.

## 58. FIRST ANTIGRAVITY PROMPT

Use this as the first prompt in Antigravity:

``` text
Read AUTOMATION.md and AGENTS.md completely.

You are the lead engineer for The Wonder Cub AI Growth & Sales System.

Do NOT build the entire system in one step.

First inspect the repository and determine what already exists.

Create a detailed implementation plan.

Phase 1 must implement:

1. Project structure.
2. AGENTS.md.
3. Brand configuration.
4. Product configuration.
5. Competitor configuration.
6. Content pillar configuration.
7. Database schema.
8. Research Agent.
9. Viral Analyst.
10. Content Strategist.
11. Content Scoring.
12. Quality/IP checker.
13. Human approval workflow.
14. Tests.

Restrictions:

- Do not publish to Instagram.
- Do not send creator outreach.
- Do not spend money.
- Do not create or guess credentials.
- Do not invent product data.
- Do not invent URLs.
- Do not delete existing data.
- Do not enable unrestricted permissions.
- Use mock data for unavailable integrations.
- Use official documentation for external APIs.
- Keep production and development separate.

Use Antigravity subagents where useful.

After each major stage:
1. Run tests.
2. Inspect changes.
3. Report files changed.
4. Report tests passed/failed.
5. Report remaining work.

Do not move to production publishing until I explicitly approve it.
```

## 59. Quality Standard

Every post should answer:

-   Who is this for?
-   What problem does it solve?
-   Why would someone stop scrolling?
-   Why would someone save it?
-   Why would someone share it?
-   Why would someone follow The Wonder Cub?
-   Does it naturally connect to a product?
-   Is it original?
-   Is it safe to publish?

If weak, regenerate.

## 60. Sales Standard

Every sales-oriented post:

``` text
Problem
↓
Relevant value
↓
Product connection
↓
Reason to click
↓
Clear CTA
↓
Verified landing page
```

Never force irrelevant products into content.

## 61. Growth Standard

Do not turn the account into a product catalog.

Balance:

`Value + Entertainment + Interaction + Education + Product`

## 62. Success Metrics

### Audience

-   Follower growth
-   Reach
-   Profile visits

### Engagement

-   Shares
-   Saves
-   Comments
-   Views

### Traffic

-   Website sessions
-   Product views
-   Click-through rate

### Sales

-   Add-to-cart
-   Checkout
-   Purchases
-   Revenue
-   Revenue per Instagram visitor

### Efficiency

-   Posts produced
-   Human hours saved
-   Cost per asset
-   Winning-content rate

## 63. Final System

``` text
RESEARCH AGENT
      ↓
VIRAL ANALYST
      ↓
CONTENT STRATEGIST
      ↓
CREATIVE DIRECTOR
      ↓
QUALITY/IP AGENT
      ↓
HUMAN APPROVAL
      ↓
PUBLISHER
      ↓
INSTAGRAM
      ↓
WEBSITE
      ↓
SALES
      ↓
ANALYTICS AGENT
      ↓
SALES ANALYST
      ↓
LEARNING SYSTEM
      ↓
CONTENT STRATEGIST
```

The system should continuously answer:

> What should The Wonder Cub post next?

and, more importantly:

> What type of content is actually growing the audience and generating
> sales?

## 64. Non-Negotiable Rule

Never optimize for "viral" as an isolated metric.

The real objective is:

``` text
RELEVANT ATTENTION
+
TRUST
+
WEBSITE TRAFFIC
+
CONVERSION
+
LEARNING
=
BUSINESS GROWTH
```

A viral post that attracts the wrong audience is not necessarily a
success.

A moderately sized post that attracts parents who purchase The Wonder
Cub products can be a major success.

## 65. Implementation Authority

For Antigravity functionality, use current official Google Antigravity
documentation for:

-   MCP
-   Custom agents
-   Workflows
-   Scheduled tasks
-   Permissions
-   Plugins
-   CLI commands
-   Agent behavior

For Instagram functionality, use current official Meta developer
documentation.

For website/payment functionality, use the actual
website/backend/payment provider documentation.

Do not rely on old tutorials for changing APIs.
