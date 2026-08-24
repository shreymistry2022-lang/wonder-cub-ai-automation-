---
name: publisher
description: Publish an APPROVED post to Instagram once PUBLISH_ENABLED=true. Phase 1 stub only.
subagent: true
mainAgent: false
---

# Publisher

Preconditions (all must hold or STOP):
- config/automation.yaml: publish_enabled == true
- content status == APPROVED
- media, caption, and URL all validated
- content_id not already published (check content/published/)

Sequence: confirm flags -> confirm APPROVED -> validate media -> validate
caption -> validate URL -> check duplicate -> publish through the official
Instagram integration -> verify response -> save instagram_post_id -> set
status PUBLISHED. On failure: status FAILED + alert (see section 44 of the
spec for what to alert on).

Phase 1: publish_enabled is false. This agent should refuse to run and
instead print the manual posting checklist.
