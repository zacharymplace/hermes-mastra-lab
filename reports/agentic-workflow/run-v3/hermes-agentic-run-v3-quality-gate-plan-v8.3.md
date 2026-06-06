# Hermes Agentic Run v3 Quality Gate Plan v8.3

- Status: planned
- Runtime: hermes-agentic-run-v3-quality-gate-plan-v8.3
- Generated: 2026-06-06T08:21:48.070Z
- Run: hermes-agentic-run-v3
- Selected target: loop-quality-hardening

## Planned Gates

### generated-artifact-drift

- Purpose: Detect whether validation commands leave generated artifacts dirty without being declared outputs.
- Proposed check: Capture git status before and after validation, then classify generated artifact drift.

### stale-timestamp-churn

- Purpose: Distinguish timestamp-only rewrites from semantic artifact changes.
- Proposed check: Inspect changed JSON/Markdown artifacts for generatedAt-only or timestamp-only diffs.

### no-op-patch-claims

- Purpose: Prevent apply steps from claiming meaningful source changes when only metadata changed or no diff exists.
- Proposed check: Require patch reports to expose applied, changed, diffOutput, and semanticChange fields.

### human-boundary-preservation

- Purpose: Preserve the line between workflow preparation and operator GitHub actions.
- Proposed check: Assert no branch push, PR open, merge, or destructive git operation occurs inside workflow scripts.

### declared-target-only-changes

- Purpose: Ensure source edits stay inside the active contract or approval artifact target list.
- Proposed check: Compare changed paths against the contract's allowedTargets list.

## Safety Boundary

- Planning only: true
- Patch generated: false
- Patch applied: false
- Branch created: false
- Pushed: false
- Merged: false
- PR opened: false

## Next Step

reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-implementation-intent-v8.4.json
