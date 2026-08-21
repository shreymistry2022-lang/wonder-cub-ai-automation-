# Workflow: Weekly Strategy & Learning Loop (`weekly-strategy.md`)

## Trigger
- Weekly every Sunday evening.

## Pipeline Steps
1. **Aggregated Review**:
   - Ingest all posts, metrics, website visits, and sales from the trailing 7 days.
2. **Winners & Losers Classification**:
   - Identify top 20% posts by Engagement, Saves/Shares, and Attributed Revenue.
   - Identify bottom 20% posts.
3. **Pattern Recognition & Anti-Overfitting**:
   - Extract recurring themes in winning hooks and formats.
   - Reject single-post anomalies (require repeated evidence across at least 3 posts).
4. **Learning Database**:
   - Store conclusions in `data/learning/week-YYYY-WW.json`.
5. **Next Week Strategy Formulation**:
   - Adjust pillar weights and hook angles for the upcoming week.
   - Generate `data/reports/weekly-strategy-report.md`.
