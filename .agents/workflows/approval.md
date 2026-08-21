# Workflow: Human Approval Gate (`approval.md`)

## Trigger
- Operator runs approval CLI (`npm run approve`) or reviews pending artifacts in `content/review/`.

## Review Card Information
The operator is presented with:
- **Content ID** (e.g. `WC-2026-08-21-001`)
- **Pillar & Format** (e.g. `Educational Facts` | `Carousel 7-Slide`)
- **Hook**: Opening line / slide 1 headline
- **Creative Preview**: Full slide copy or Reel script
- **Caption**: Complete caption with hashtags and CTAs
- **Linked Product & UTM URL**: Validated store link
- **Scores**: Growth Score, Sales Score, Composite Score
- **Quality & IP Check**: PASS / FAIL status and flags

## Action Choices
1. **[A] Approve**: Status updated to `APPROVED` with `approved_by` operator name and timestamp.
2. **[R] Reject**: Operator provides rejection reason; status set to `REJECTED`, moved to `content/rejected/`.
3. **[E] Edit**: Allows inline modification of hook, caption, or slides before approval.
