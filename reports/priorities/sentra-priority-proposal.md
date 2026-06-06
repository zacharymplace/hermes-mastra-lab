# Sentra Priority Proposal

Generated: 2026-06-06T04:44:32.271Z
Status: pending-approval

## Review summary

Sentra generated operating context, Hermes consumed the promotion input, a promotion decision was produced, and the operating ledger linked the cycle artifacts.

## Proposed priorities

- 1. Promotion History Ledger: Promotion decisions should accumulate as a durable, queryable operating history.
- 2. Multi-project Prioritization: Sentra should choose between multiple active projects instead of only operating Hermes Mastra Lab.
- 3. Weekly Review Feedback: Weekly reviews should update priorities and stale risks instead of only reporting them.

## Checks

- hasCurrentPriorities: true
- hasProposedPriorities: true
- proposalChangesTopPriority: true
- allProposalsSourcedFromReview: true

## Notes

- This proposes a priority rewrite from the weekly review.
- It does not mutate sentra/priorities/current.json without approval.
- The apply step requires sentra/priorities/proposals/current-approval.json.
