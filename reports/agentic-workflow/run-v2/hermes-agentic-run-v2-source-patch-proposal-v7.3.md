# Hermes Agentic Run v2 Source Patch Proposal v7.3

Status: patch-proposed

## Objective

Create a bounded source patch proposal for the next run-v2 step without applying the patch, creating branches, pushing, merging, or opening PRs.

## Selected target

- ID: target-selection-artifact
- Title: Target Selection Artifact
- Type: generated-artifact-and-gate
- Score: 95

## Proposed next step

- Approved Source Patch Apply v7.4
- Approval artifact: `hermes/agentic-workflow/approvals/run-v2-source-patch-apply-v7.4.json`
- Expected command: `npm run hermes:agentic-run-v2-source-patch-apply:v7.4:check`

## Proposed files

- `scripts/write-hermes-agentic-run-v2-source-patch-proposal-v7-3.ts`
- `evaluations/hermes-agentic-run-v2-source-patch-proposal-v7-3-gate.ts`
- `hermes/agentic-workflow/run-v2/source-patch-proposal-v7.3.json`
- `reports/agentic-workflow/run-v2/hermes-agentic-run-v2-source-patch-proposal-v7.3.json`
- `reports/agentic-workflow/run-v2/hermes-agentic-run-v2-source-patch-proposal-v7.3.md`
- `package.json`

## Validation commands

- `npm run hermes:agentic-run-v2-target-selection:v7.2:gate`
- `npm run hermes:agentic-run-v2-patch-intent:v7.1:gate`
- `npm run hermes:agentic-run-v2-plan:v7.0:gate`
- `npm run check`
- `npm run mastra:check`

## Safety

- Proposal only: true
- Patch applied: false
- Branch created: false
- Pushed: false
- Merged: false
- PR opened: false
- Human approval required before patch: true
