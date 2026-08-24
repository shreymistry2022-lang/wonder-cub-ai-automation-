# Weekly Strategy Workflow

Runs `node scripts/analytics/performanceAgent.js --weekly` (analytics-agent +
sales-analyst), then produces next week's plan.

1. Read this week's content, website, and sales data.
2. Identify winners.
3. Identify repeated patterns (require >=2 supporting observations before
   generalizing -- see anti-overfitting rule, section 53 of the spec).
4. Reject unsupported assumptions.
5. Update data/learning/.
6. Propose next week's content pillar mix and up to 5 next tests.
7. Hand the plan to content-strategist for next week's daily-content runs.
