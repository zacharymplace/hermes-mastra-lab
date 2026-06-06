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

## Real Langfuse emission verification

Use this only with real Langfuse credentials available locally:

```bash
export LANGFUSE_PUBLIC_KEY="..."
export LANGFUSE_SECRET_KEY="..."
export LANGFUSE_BASE_URL="https://cloud.langfuse.com"

npm run langfuse:real-emission:check
```

Passing this command only proves SDK emission completed locally. Manual verification in the Langfuse UI is still required before closing the `real-langfuse-sdk` promotion blocker.
