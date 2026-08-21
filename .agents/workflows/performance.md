# Workflow: Performance Collection (`performance.md`)

## Trigger
- Runs at T+6h, T+24h, and T+72h after post publication.

## Pipeline Steps
1. **Instagram Metrics Ingestion**:
   - Query Meta Graph API for Reach, Impressions, Likes, Comments, Shares, Saves, Profile Visits, Follows.
   - Calculate Engagement Rate and Share/Save Ratio.
2. **Website & Sales Attribution**:
   - Query GA4 and website order records matching the post's UTM content tag (`WC-YYYY-MM-DD-###`).
   - Tally: Sessions, Product Views, Add-to-Carts, Checkouts, Attributed Orders, Revenue.
3. **Database Update**:
   - Insert snapshot row into `content_metrics` and `website_sessions`.
4. **Daily Reporting**:
   - Compile daily executive report in `data/reports/daily-report-YYYY-MM-DD.md`.
