# The Wonder Cub — AI Growth & Sales Automation System

An autonomous AI marketing, intelligence, and sales attribution engine for **[The Wonder Cub](https://thewondercub.store)** built on **Google Antigravity 2.0 / Antigravity CLI**.

---

## 🧭 The Core Growth Loop

```text
RESEARCH ➔ ANALYZE ➔ CREATE ➔ CHECK ➔ APPROVE ➔ PUBLISH ➔ MEASURE ➔ LEARN ➔ IMPROVE
```

---

## 🔒 Safety & Phase 1 Guardrails

The system is configured with strict safety controls in [`config/automation.yaml`](file:///c:/Users/Admin/Projects/Automation/config/automation.yaml) and [`AGENTS.md`](file:///c:/Users/Admin/Projects/Automation/AGENTS.md):
- `PUBLISH_ENABLED=false`: Direct automated posting to Instagram is disabled during Phase 1.
- `OUTREACH_ENABLED=false`: Direct creator messaging is disabled.
- `SPEND_ENABLED=false`: Paid ad spend is locked.
- **Human-in-the-Loop Approval**: Every generated post halts at `REVIEW` status until explicitly approved by an operator.

---

## 📁 Project Layout

```text
c:/Users/Admin/Projects/Automation/
├── AGENTS.md                          # Master brand & compliance operating rules
├── THE_WONDER_CUB_ANTIGRAVITY_AUTOMATION.md # Architecture specification
├── package.json                       # Scripts and dependencies
├── .env.example                       # Environment keys template
├── .agents/
│   ├── agents/                        # 9 Specialized Antigravity Subagents
│   │   ├── research-agent.md
│   │   ├── viral-analyst.md
│   │   ├── content-strategist.md
│   │   ├── creative-director.md
│   │   ├── quality-checker.md
│   │   ├── publisher.md
│   │   ├── analytics-agent.md
│   │   ├── sales-analyst.md
│   │   └── creator-agent.md
│   ├── workflows/                     # 6 Antigravity Workflows
│   │   ├── daily-research.md
│   │   ├── daily-content.md
│   │   ├── approval.md
│   │   ├── publishing.md
│   │   ├── performance.md
│   │   └── weekly-strategy.md
│   ├── skills/                        # Custom Antigravity Skills
│   │   ├── competitor-research/SKILL.md
│   │   ├── instagram-content/SKILL.md
│   │   ├── website-analytics/SKILL.md
│   │   └── sales-analysis/SKILL.md
│   └── mcp_config.json                # MCP configuration
├── config/
│   ├── brand.yaml                     # Brand voice, colors, typography, forbidden claims
│   ├── products.yaml                  # Verified product catalog (Jungle Safari bundle)
│   ├── content-pillars.yaml           # 6 Pillars & 60/25/15 content mix
│   ├── competitors.yaml               # Benchmark accounts & extraction rules
│   ├── scoring.yaml                   # Growth Score, Sales Score, & Winner weights
│   └── automation.yaml                # Master feature flags & scheduler config
├── database/
│   ├── schema.sql                     # Full relational schema (SQLite / PostgreSQL)
│   └── db.js                          # Database client & lifecycle repository
├── content/
│   ├── review/                        # Pending drafts awaiting human review
│   ├── approved/                      # Operator-approved assets ready for scheduling
│   ├── published/                     # Historical published assets
│   └── rejected/                      # Rejected drafts with logged feedback
├── scripts/
│   ├── pipeline.js                    # Master Phase 1 dry-run orchestrator
│   ├── research/researchEngine.js     # Market & trend research engine
│   ├── strategy/strategyEngine.js     # Scoring & winner selection engine
│   ├── creative/creativeEngine.js     # Carousel & Reel creative generator
│   ├── quality/qualityChecker.js      # Zero-tolerance IP & quality gate
│   ├── approval/approvalManager.js    # Human review cards & CLI workflow
│   └── website/websiteAdapter.js      # Store adapter & UTM builder
└── tests/
    ├── unit/scoring.test.js
    ├── unit/quality.test.js
    ├── unit/utm.test.js
    └── integration/pipeline.test.js
```

---

## ⚡ Quick Start & Commands

### 1. Run Automated Tests
```bash
npm test
```

### 2. Run the Daily Dry-Run Pipeline
```bash
npm run pipeline:daily
```
This executes the full loop:
1. Seeds verified store products.
2. Ingests research benchmarks.
3. Generates 5 scored concepts across pillars.
4. Selects the Daily Winner.
5. Builds a 7-slide carousel and 4-part caption with UTM link.
6. Runs the Quality & IP Gate.
7. Stages the draft in `content/review/` and prints the **Content Approval Card**.

### 3. Review & Approve Content
Inspect pending posts:
```bash
npm run approve
```
Approve all staged drafts:
```bash
node scripts/approval/approvalManager.js --approve-all
```
