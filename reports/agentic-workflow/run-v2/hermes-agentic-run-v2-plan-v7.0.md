# Hermes Agentic Run v2 Plan v7.0

Generated: 2026-06-06T06:48:33.193Z
Status: planned

## Objective

Execute the second controlled Hermes agentic run by improving target selection and preparing a bounded patch proposal without applying source edits.

## Plan

- Mode: repo-local
- Autonomy: semi-autonomous
- Phase: planning-only
- Patch application allowed: false
- Branch creation allowed: false
- Push allowed: false
- Merge allowed: false

## Steps

- **load-context**: Read v6.9 target contract, v6.8 selector, v6.7 run index, and Sentra post-merge ledger.
- **confirm-contract**: Verify that v6.9 selected the second controlled agentic run and declared target boundaries.
- **define-patch-intent**: Define the next patch intent as target-selection improvement, not broad source modification.
- **declare-validation**: Declare validation commands required before any v2 patch apply step.
- **stop-before-patch**: Stop at a plan artifact. Do not apply patches, create branches, push, merge, or open PRs.

## Patch intent

- ID: `run-v2-target-selection-improvement`
- Title: Improve Hermes Agentic Run v2 Target Selection
- Summary: Use completed run history, selector output, and Sentra ledger entries to pick a concrete next patch target before any source patch is generated.
- Proposed next artifact: `reports/agentic-workflow/run-v2/hermes-agentic-run-v2-patch-intent-v7.1.json`

## Validation commands

- `npm run hermes:agentic-run-v2-target:v6.9:gate`
- `npm run hermes:agentic-next-run:v6.8:gate`
- `npm run hermes:agentic-run-index:v6.7:gate`
- `npm run check`
- `npm run mastra:check`

## Safety boundary

- Planning only: true
- Patch applied: false
- Branch created: false
- Pushed: false
- Merged: false
- PR opened: false
- Human approval before patch: true

## Notes

- This begins Hermes agentic run v2 without applying any source patch.
- The next artifact should be a v7.1 patch intent, not a patch apply.
- The run remains bounded by the v6.9 target contract.
