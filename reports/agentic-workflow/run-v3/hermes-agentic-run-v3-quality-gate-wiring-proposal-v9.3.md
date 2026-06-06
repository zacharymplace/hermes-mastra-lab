# Hermes Agentic Run v3 Quality Gate Wiring Proposal v9.3

- Runtime: hermes-agentic-run-v3-quality-gate-wiring-proposal-v9.3
- Status: proposed
- Generated: 2026-06-06T09:58:51.934Z

## Summary

Proposes the exact future workflow phases where the validated qualityGate shape should be wired before any broad source rewrite.

## Wiring Targets

### source-patch-proposal

- Target: future source patch proposal generators
- Wiring: Add qualityGate.applicability and expectedChangedPaths metadata.
- Required: true
- Patch now: false

### source-patch-apply

- Target: future source patch apply generators
- Wiring: Add complete qualityGate status before ready-for-human-review.
- Required: true
- Patch now: false

### source-patch-validation

- Target: future source patch validation gates
- Wiring: Fail closed when qualityGate is missing, failed, null, or incomplete.
- Required: true
- Patch now: false

### branch-prepare

- Target: future branch preparation artifacts
- Wiring: Require clean or declared generated drift before branch preparation.
- Required: true
- Patch now: false

### pr-draft

- Target: future PR draft artifacts
- Wiring: Include qualityGate status in PR draft validation metadata.
- Required: true
- Patch now: false

### post-merge-ledger

- Target: future post-merge ledger entries
- Wiring: Record qualityGate status with post-merge validation results.
- Required: true
- Patch now: false

### run-index

- Target: future run index artifacts
- Wiring: Expose qualityGate status as durable run-level state.
- Required: true
- Patch now: false

## Fail-Closed Policy

- Future source-patch-validation gates fail when qualityGate is required and absent.
- Future source-patch-validation gates fail when qualityGate.passed is false or null.
- Future readiness reports fail when required qualityGate output fields are missing.
- Future apply reports fail when applied, changed, diffOutput, or semanticChange are missing.
- Future branch preparation fails when generated drift is neither clean nor declared.

## Safety

- Proposal only.
- No broad source rewrite.
- No patch applied.
- No branch created.
- No push, PR, merge, or GitHub lifecycle action.

## Next

- run-v3-quality-gate-wiring-intent-v9.4: Declare a bounded wiring intent before modifying future patch/apply generators or gates.
