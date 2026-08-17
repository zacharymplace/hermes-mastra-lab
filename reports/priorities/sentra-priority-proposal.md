# Sentra Priority Proposal

Generated: 2026-08-17T20:15:37.678Z
Status: pending-approval

## Review summary

Sentra generated operating context, Hermes consumed the promotion input, a promotion decision was produced, and the operating ledger linked the cycle artifacts.

## Proposed priorities

- 1. Promotion Ledger Multi-Source: The promotion history ledger only reads the single hardcoded hermes-promotion-v1.json artifact, so it would silently miss any future Hermes promotion workflow version.
- 2. Operating Loop CI Coverage: CI only runs npm run check and npm run mastra:check, neither of which exercises the Sentra/Hermes promotion and ledger loop, so a regression there would go unnoticed.
- 3. Hermes Agentic Workflow Run Closeout: Multi-project prioritization selected Hermes Agentic Workflow as the top project, but its run-v4 PR lifecycle has been tracking-ready with no branch, push, or PR across multiple cycles, and no closeout artifact has been produced.

## Checks

- hasCurrentPriorities: true
- hasProposedPriorities: true
- proposalChangesTopPriority: true
- allProposalsSourcedFromReview: true

## Notes

- This proposes a priority rewrite from the weekly review.
- It does not mutate sentra/priorities/current.json without approval.
- The apply step requires sentra/priorities/proposals/current-approval.json.
