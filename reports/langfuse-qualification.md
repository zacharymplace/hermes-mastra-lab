# Langfuse Qualification Report

Trace ID: hermes-mastra-1780714803975

Mode: local deterministic trace contract

## Events

| Stage | Status | Output Artifact |
|---|---:|---|
| core | success | `hermes/idea-recommendation.json` |
| native | success | `hermes/mastra-native-workflow.json` |
| parallel | success | `hermes/mastra-native-parallel-critique.json` |
| human-review | approved | `hermes/mastra-native-human-review.json` |
| suspend | suspended | `hermes/mastra-suspend-packet.json` |
| resume | approved | `hermes/mastra-resume-result.json` |
| qualification | success | `reports/mastra-qualification.json` |

## Decision

Langfuse remains unqualified for live runtime use until SDK emission, trace viewing, and artifact linking are tested.
