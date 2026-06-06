# Hermes Agentic Run v2 Target Contract v6.9

Generated: 2026-06-06T06:44:21.943Z
Status: contracted

## Run v2

- ID: `hermes-agentic-run-v2`
- Target: Hermes Agentic Run v2 Target Contract
- Objective: Define the allowed target, constraints, success criteria, and safety boundaries before any v2 patching is allowed.
- Source run: `hermes-agentic-workflow-v1-through-v6.7`
- Source ledger entry: `pr-1-post-merge-v6.6`

## Allowed targets

- `hermes/agentic-workflow/run-v2/target-contract-v6.9.json` — Machine-readable contract for the second controlled agentic run.
- `reports/agentic-workflow/run-v2/hermes-agentic-run-v2-target-contract-v6.9.json` — Report artifact for audit and gates.
- `reports/agentic-workflow/run-v2/hermes-agentic-run-v2-target-contract-v6.9.md` — Human-readable review artifact.
- `scripts/write-hermes-agentic-run-v2-target-contract-v6-9.ts` — Generator for the target contract.
- `evaluations/hermes-agentic-run-v2-target-contract-v6-9-gate.ts` — Gate for contract validity.
- `package.json` — Expose v6.9 commands.

## Disallowed targets

- secrets
- .env files
- credential stores
- destructive git operations
- auto-push
- auto-merge
- opening GitHub PRs without explicit operator approval
- broad source rewrites outside the declared contract

## Safety boundary

- Requires human approval before patch: true
- Requires gate before commit: true
- Auto-push: false
- Auto-merge: false
- External side effects: false

## Success criteria

- v6.8 selected Start Next Agentic Run.
- v6.7 source run is complete.
- v6.6 post-merge ledger has at least one entry.
- Run v2 has a declared target before patching.
- Allowed and disallowed targets are explicit.
- Human approval remains required before patch application.

## Notes

- This prevents the second agentic run from becoming an unconstrained patch loop.
- The run can plan next, but patch application must be separately approved.
- This becomes the contract v2 must satisfy before source edits.
