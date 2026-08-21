---
name: sales-analysis
description: Skill for attributing verified orders, revenue, and customer conversion paths to specific content campaigns.
---

# Sales Analysis Skill

## Attribution Protocol
1. Map order records against `utm_content` tags (e.g. `WC-2026-08-21-001`).
2. Calculate:
   - Conversion Rate = (Attributed Purchases / Instagram Visitors) * 100
   - Revenue per Visitor = Attributed Revenue / Instagram Visitors
   - ROI per Content Asset
3. Compare conversion performance across pillars: Does an "Interactive Animal Quiz" convert higher or lower than a "Parent Problem / Screen-Free Solution" post?
