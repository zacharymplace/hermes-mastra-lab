# Sentra OS Extraction Plan

Generated: 2026-06-06T05:10:58.073Z

## Selected project

**Sentra OS** — 52

Extract the Sentra operating layer into its own repo/system with projects, decisions, reviews, priorities, ledger, and promotion inputs.

## Objective

Extract the reusable Sentra operating layer from Hermes Mastra Lab into a portable Sentra OS structure.

## Thesis

Sentra should become the operating context layer that selects, plans, reviews, and updates work before Hermes promotes decisions.

## Milestones

### Define Sentra contracts

Document the canonical shapes for projects, decisions, reviews, priorities, snapshots, ledgers, and promotion inputs.

Deliverables:
- docs/sentra-contracts.md
- sentra/contracts/*.schema.json

### Extract portable generators

Move Sentra context, review, ledger, priority rewrite, and project prioritization generators behind stable script contracts.

Deliverables:
- scripts/sentra-context.ts
- scripts/sentra-weekly-review.ts
- scripts/sentra-priority-rewrite.ts
- scripts/sentra-project-prioritize.ts

### Create operating loop command

Provide one command that runs context generation, promotion input generation, ledger report, weekly review, and priority proposal.

Deliverables:
- npm run sentra:operating-loop
- evaluations/sentra-operating-loop-gate.ts

### Gate extraction readiness

Verify the Sentra OS extraction is reversible, artifact-backed, and does not leak Hermes-specific runtime logic.

Deliverables:
- reports/plans/sentra-os-extraction-plan.json
- reports/plans/sentra-os-extraction-plan.md
- evaluations/sentra-extraction-plan-gate.ts

## Dependencies

- stable-lab-loop (satisfied): Hermes Mastra Lab has working context, promotion, ledger, review, priority rewrite, and project prioritization flows.
- domain-boundary (watch): Sentra OS must not absorb Hermes promotion logic or Mastra runtime-specific orchestration details.
- schema-discipline (needed): Extraction should add schemas or contract docs before moving logic across repos.

## Risks

- premature-extraction (medium): Extract contracts and generators first; defer app/UI/runtime expansion.
- duplicated-logic (medium): Keep Hermes-specific promotion logic in Hermes and Sentra context logic in Sentra.
- framework-creep (medium): Keep Sentra plain TypeScript and artifact-first unless a runtime proves necessary.

## Success criteria

- Sentra OS can generate snapshot and promotion input from its own project/decision/review/priority files.
- Hermes can consume Sentra OS output without knowing Sentra internals.
- The extraction has contract docs or schemas.
- The operating loop remains reproducible with npm scripts.
- No Mastra-specific logic is required inside Sentra OS.

## Next action

Add Sentra contracts and schemas before creating or extracting a separate Sentra OS repo.
