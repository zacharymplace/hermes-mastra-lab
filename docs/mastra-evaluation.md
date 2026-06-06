# Mastra Evaluation

Mastra is being evaluated as the possible runtime layer between Hermes and Langfuse.

## Current test

The first experiment is deterministic:

Sentra input
→ idea generator
→ critic
→ scorer
→ Hermes recommendation artifact

## Why deterministic first

This gives Hermes a stable baseline before adding framework-specific agent calls, live models, memory, or tracing.

## Promotion criteria

Mastra should only be promoted if it improves:

- agent/workflow ergonomics
- typed execution boundaries
- observability handoff
- repeatability
- local development speed

## Hold criteria

Do not promote Mastra if it creates:

- framework lock-in
- hidden state
- unclear execution traces
- harder testing
- more ceremony than value

## API exploration

See `docs/mastra-api-exploration.md` before wiring framework code.
