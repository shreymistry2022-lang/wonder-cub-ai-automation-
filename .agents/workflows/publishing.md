# Workflow: Publishing Pipeline (`publishing.md`)

## Trigger
- Scheduled posting window or manual trigger on `APPROVED` posts.

## Execution Sequence
1. **Safety Pre-Check**:
   - Check `PUBLISH_ENABLED`: If `false`, abort execution and log `"Phase 1 Safety Mode: Publishing disabled"`.
   - Check post status: Must be `APPROVED`.
2. **Deduplication Check**:
   - Verify content ID, image media hash, and caption hash have not been published in the last 60 days.
3. **Meta API Dispatch**:
   - Upload media container to Instagram Graph API.
   - Attach caption and verified link sticker / bio reference.
   - Execute publication call.
4. **Post-Publish Verification**:
   - Verify Meta API returns valid `instagram_post_id`.
   - Transition status to `PUBLISHED` with `published_at` timestamp.
   - Move artifact to `content/published/`.
   - On error: Transition status to `FAILED`, generate alert, do not retry indefinitely.
