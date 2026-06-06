# Hermes Source Patch Proposal v1

Generated: 2026-06-06T05:32:49.062Z
Status: proposed

## Objective

Generate a source-code patch proposal without applying source changes, pushing, or merging.

## Selected project

- Hermes Agentic Workflow
- Score: 82
- Next action: Define the first safe agentic execution loop: plan, patch, test, report, and require approval before merge.

## Target files

- docs/hermes-agentic-workflow.md (modify): Document the next safe transition from artifact-only patch apply to source patch proposal.
- hermes/agentic-workflow/source-patches/v1.json (create): Store the proposed source patch contract as a durable Hermes artifact.

## Proposed changes

- docs/hermes-agentic-workflow.md: Add Source Patch Proposal v1 section describing proposal-only behavior, required approval, checks, and rollback notes. Expected outcome: The agentic workflow documentation explains how Hermes proposes source changes safely before applying them.
- hermes/agentic-workflow/source-patches/v1.json: Create durable source patch proposal contract for future apply step. Expected outcome: Future source patch apply workflow can read a structured proposal artifact.

## Validation commands

- `npm run hermes:source-patch-proposal:gate`
- `npm run check`
- `npm run mastra:check`

## Rollback notes

- Do not apply source changes if proposal target files fall outside allowed prefixes.
- Delete generated source patch proposal artifacts if proposal is rejected.
- Restore docs/hermes-agentic-workflow.md before commit if documentation change is not approved.

## Safety

- Proposal only: true
- Source changes applied: false
- Human approval required: true
- No auto-merge: true
- No push: true
