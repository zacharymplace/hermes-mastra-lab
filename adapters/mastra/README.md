# Mastra Adapter Spike

Purpose:
Test whether Mastra should become the Hermes runtime layer.

This adapter is intentionally isolated from the deterministic Hermes workflow.

## Current boundary

Hermes core:
- owns domain logic
- owns scoring rules
- owns promotion gates
- emits JSON/Markdown artifacts

Mastra candidate runtime:
- may own workflow execution
- may own agent/tool orchestration
- may own runtime observability hooks

## Rule

Mastra can be promoted only if it improves the workflow without making Hermes harder to test, inspect, or replace.
