# Performance Workflow

Runs `node scripts/analytics/performanceAgent.js` (analytics-agent).

1. Collect Instagram metrics (from data/performance/ manual logs, or a real
   API integration once built).
2. Collect website analytics (data/sales/ sessions, once GA4/adapter exists).
3. Collect sales data (data/sales/).
4. Match UTM/content IDs across all three.
5. Calculate growth_score, sales_score, final_score per config/scoring.yaml.
6. Identify winners/losers vs account median and same-format/pillar peers.
7. Update data/learning/ with this week's findings.
8. Output data/reports/performance-<date>.json + a readable summary.
