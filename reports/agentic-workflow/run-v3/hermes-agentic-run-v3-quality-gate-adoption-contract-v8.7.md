# Hermes Agentic Run v3 Quality Gate Adoption Contract v8.7

- Runtime: hermes-agentic-run-v3-quality-gate-adoption-contract-v8.7
- Status: contracted
- Generated: 2026-06-06T09:30:14.073Z
- Source validation: hermes-agentic-run-v3-quality-gate-validation-v8.6
- Source implementation: hermes-agentic-run-v3-quality-gate-implementation-v8.5

## Adoption Rules

- Every future source patch proposal must declare whether it is subject to the loop-quality gate.
- Every future source patch apply step must include quality gate status before reporting readiness.
- Patch apply reports must include applied, changed, diffOutput, and semanticChange fields.
- Timestamp-only changes must be classified separately from semantic changes.
- Generated artifact drift must be either committed as a declared output or restored before final clean state.
- Branch, push, PR creation, and merge remain operator-controlled unless a later explicit contract changes that boundary.
- Changed paths must be compared against declared targets before a patch is considered clean.

## Required Checks Before Patch Apply

- generated-artifact-drift
- stale-timestamp-churn
- no-op-patch-claims
- human-boundary-preservation
- declared-target-only-changes

## Safety

- Contract only: true
- Patch applied: false
- Branch created: false
- Pushed: false
- Merged: false
- PR opened: false

## Notes

- This contract moves the v8.5/v8.6 quality gate from validated artifact to future loop requirement.
- It does not apply a patch, create a branch, push, merge, or open a PR.
- The next safe step is v8.8 quality gate adoption report.
