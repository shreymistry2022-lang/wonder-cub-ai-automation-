# Workflow: Daily Research (`daily-research.md`)

## Trigger
- Daily schedule at 08:00 or manual execution via `npm run pipeline:research`.

## Pipeline Steps
1. **Load Configuration**: Read `AGENTS.md`, `config/brand.yaml`, `config/products.yaml`, and `config/competitors.yaml`.
2. **Invoke `research-agent`**: Scan benchmark accounts and trending parent topics. Extract hooks, problems addressed, and engagement signals.
3. **Invoke `viral-analyst`**: Evaluate hook strength, curiosity gaps, and shareability.
4. **Persist Findings**: Store candidate topics in `data/trends/` and `competitor_posts` table.
5. **Generate Summary**: Output morning intelligence summary to `data/reports/daily-research-summary.json`.
6. **Guardrail**: Do not create publishable drafts; output research findings only.
