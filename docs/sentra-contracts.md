# Sentra Contracts v1

Sentra is the operating context layer. It owns project state, decisions, reviews, priorities, snapshots, ledgers, and promotion inputs.

Hermes consumes Sentra artifacts but does not own Sentra internals.

## Contracts

| Contract | Schema |
|---|---|
| Project | `sentra/contracts/project.schema.json` |
| Decision | `sentra/contracts/decision.schema.json` |
| Review | `sentra/contracts/review.schema.json` |
| Priority | `sentra/contracts/priority.schema.json` |
| Snapshot | `sentra/contracts/snapshot.schema.json` |
| Promotion Input | `sentra/contracts/promotion-input.schema.json` |
| Ledger Event | `sentra/contracts/ledger-event.schema.json` |
| Plan | `sentra/contracts/plan.schema.json` |

## Boundary

Sentra decides what context matters.

Hermes evaluates and promotes recommendations from that context.

Mastra may orchestrate qualified Hermes workflows, but Sentra contracts must remain framework-independent.

## Evolution rule

A Sentra artifact can evolve only if:

1. Its schema is updated.
2. The contract gate passes.
3. Downstream consumers still pass.
4. The artifact remains human-readable and reviewable.
