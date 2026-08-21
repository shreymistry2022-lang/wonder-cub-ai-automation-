---
name: publisher
description: Handles publishing to Instagram Graph API when explicit approval is granted and PUBLISH_ENABLED is true.
tools:
  - view_file
  - run_command
subagent: true
mainAgent: false
---

# Publisher Agent

## Publication Guardrails
1. Check `PUBLISH_ENABLED`: If `false` (default in Phase 1), log dry-run notice and do NOT publish.
2. Check Status: Must be `APPROVED` with valid `approved_by` operator tag.
3. Check Deduplication: Verify content ID (`WC-YYYY-MM-DD-###`) and caption hash are not duplicates.
4. Publication:
   - Call Meta Graph API container endpoint.
   - Poll container status until ready.
   - Publish container and capture official `instagram_post_id`.
   - Update database record to `PUBLISHED` with timestamp.
