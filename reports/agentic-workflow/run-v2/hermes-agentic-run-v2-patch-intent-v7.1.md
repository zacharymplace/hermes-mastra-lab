# Hermes Agentic Run v2 Patch Intent v7.1

Generated: 2026-06-06T06:52:48.871Z
Status: intent-declared

## Intent

- ID: `run-v2-target-selection-improvement`
- Title: Improve Hermes Agentic Run v2 Target Selection
- Type: source-patch-intent
- Summary: Prepare the second agentic run to select concrete patch targets from completed run history, selector output, and Sentra ledger state before generating any patch.

## Problem

The v2 plan identifies target-selection improvement, but the repo still needs a bounded patch intent artifact before any source patch proposal.

## Proposed patch shape

- Generator: `scripts/write-hermes-agentic-run-v2-target-selection-v7-2.ts`
- Gate: `evaluations/hermes-agentic-run-v2-target-selection-v7-2-gate.ts`
- Machine artifact: `hermes/agentic-workflow/run-v2/target-selection-v7.2.json`
- Report JSON: `reports/agentic-workflow/run-v2/hermes-agentic-run-v2-target-selection-v7.2.json`
- Report Markdown: `reports/agentic-workflow/run-v2/hermes-agentic-run-v2-target-selection-v7.2.md`

## Target-selection rules

- Prefer the smallest patch that increases autonomy without reducing human control.
- Prefer generated artifacts and gates before source rewrites.
- Do not modify secrets, environment files, credentials, or destructive git behavior.
- Do not push, merge, or open PRs inside the workflow.
- Require explicit approval before patch application.

## Safety boundary

- Intent only: true
- Patch generated: false
- Patch applied: false
- Branch created: false
- Pushed: false
- Merged: false
- PR opened: false
- Human approval before patch: true

## Expected next step

Generate v7.2 target-selection artifact and gate; do not apply a patch yet.

## Notes

- This declares the v2 patch intent but does not generate or apply a patch.
- The next safe step is v7.2 target selection.
- Patch application remains blocked until a later approval-gated step.
