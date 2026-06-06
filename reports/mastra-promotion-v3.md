# Mastra Promotion Report v3

Generated: 2026-06-06T04:23:35.718Z

Decision: promote-for-controlled-use

## Recommendation

Use Mastra as the Hermes orchestration runtime for qualified workflows, while keeping Hermes domain logic, scoring, promotion rules, and artifacts framework-independent.

## Score

27 / 30 (90%)

## Criteria

### clarity

Score: 4 / 5

Mastra makes multi-step orchestration, suspend/resume, and review boundaries explicit. Plain TypeScript remains clearer for simple deterministic logic.

### type-safety

Score: 4 / 5

Workflow schemas improve runtime boundaries while Hermes domain scoring and recommendation types stay framework-independent.

### observability-handoff

Score: 5 / 5

Langfuse SDK, OTEL export, and UI visibility are verified. Hermes artifacts can be tied to runtime traces.

### human-review-flow

Score: 5 / 5

Suspend/resume, persisted snapshots, and external review artifacts are all qualified.

### retry-error-handling

Score: 4 / 5

Controlled failure recovery is qualified. Built-in automatic retry policy behavior remains a future refinement.

### workflow-composition

Score: 5 / 5

Native workflow, fan-out/fan-in critique, persisted review, and recovery paths show strong composition fit.

## Closed blockers

- real-langfuse-sdk
- langfuse-ui-visibility
- real-mastra-suspend
- snapshot-persistence
- external-human-input
- failure-recovery

## Remaining blockers / refinements

- automatic-retry-policy (medium): Explicit rerun-based recovery is qualified, but Mastra-native automatic retry policy behavior has not been isolated.
- production-storage-choice (medium): Local LibSQL persistence is qualified. Production deployment still needs a storage choice and backup policy.
- runtime-cost-and-complexity (low): Mastra adds framework surface area. Keep Hermes domain logic framework-independent to preserve reversibility.

## Guardrails

- Hermes domain logic must remain outside Mastra workflow definitions.
- Mastra should orchestrate; Hermes should decide.
- All promotion decisions must remain explicit and artifact-backed.
- Local storage artifacts must remain ignored.
- Langfuse traces should support review, not replace committed artifacts.

## Next actions

- Add Mastra promotion v3 gate.
- Wire the qualified path into a single end-to-end Hermes promotion workflow.
- Add a production storage decision record before using this outside local development.
- Optionally isolate Mastra-native automatic retry policy behavior.
