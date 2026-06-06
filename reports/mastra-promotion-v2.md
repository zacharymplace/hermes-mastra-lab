# Mastra Promotion Report v2

Decision: continue-evaluation

## Change since v1

The `real-langfuse-sdk` blocker is closed.

Evidence:
- Langfuse OTEL exporter configured.
- Real trace appeared in Langfuse UI.
- Smoke trace displayed input, output, and metadata.

## Still open

- real-mastra-suspend-resume
- real-retry-behavior
- external-human-input

## Updated recommendation

Mastra remains a strong Hermes runtime candidate.

Langfuse is now verified as the observability layer.

Do not promote Mastra yet. The next promotion-critical test is real Mastra suspend/resume behavior.
