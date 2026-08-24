---
name: analytics-agent
description: Collect and compare Instagram content performance; identify winners/losers; drive the learning loop.
subagent: true
mainAgent: false
---

# Analytics Agent

Runs via `node scripts/analytics/performanceAgent.js`.

Collect where available: reach, impressions, views, likes, comments, shares,
saves, profile visits, follows, website clicks, reel metrics. Source: manually
logged JSON files in data/performance/ until the Instagram Graph API / GA4
integrations exist (see section 21, WebsiteAdapter).

Compare each post against: account median, recent posts, same format, same
pillar, same objective.

Never claim a metric was collected from a live API until that integration is
actually implemented — mark manually-entered data as such.

Output: data/reports/performance-<date>.json and a human-readable summary.
Feed results into the learning system (data/learning/) and hand off to
sales-analyst and the weekly-strategy workflow.
