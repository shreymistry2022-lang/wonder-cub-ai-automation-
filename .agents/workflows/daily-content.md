# Workflow: Daily Content Generation (`daily-content.md`)

## Trigger
- Following Daily Research completion or manual execution via `npm run pipeline:content`.

## Pipeline Steps
1. **Input Ingestion**: Ingest latest research insights, historical performance data, and product specifications.
2. **Invoke `content-strategist`**:
   - Generate 5 distinct concepts across approved pillars.
   - Compute Growth Score, Sales Score, and Composite Score.
   - Designate the Daily Winner and top sub-winners.
3. **Invoke `creative-director`**:
   - For the Daily Winner, draft complete carousel slide breakdown (7 slides) or Reel script (5-stage structure).
   - Write high-converting caption with hook, value, and authentic CTA.
   - Generate UTM tracked destination link.
4. **Invoke `quality-checker`**:
   - Perform automated checks: Brand voice, claims, IP safety, URL validity.
5. **Persist Post**:
   - Assign unique Content ID (`WC-YYYY-MM-DD-###`).
   - Save record to `content_posts` table with status `REVIEW`.
   - Save draft artifact to `content/review/`.
6. **Guardrail**: Stop immediately at `REVIEW` stage. Do NOT publish.
