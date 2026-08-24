# Publishing Workflow

1. Confirm config/automation.yaml publish_enabled == true.
2. Confirm content status == APPROVED.
3. Validate media.
4. Validate caption.
5. Validate URL.
6. Check duplicate (content_id, media hash, caption hash vs content/published/).
7. Publish through the official Instagram integration.
8. Verify response.
9. Save instagram_post_id.
10. Set status PUBLISHED, move to content/published/.

On failure: status FAILED + alert (see analytics-agent / notifications).

Phase 1: publish_enabled is false, so this workflow prints the manual
checklist instead of publishing (see .agents/agents/publisher.md).
