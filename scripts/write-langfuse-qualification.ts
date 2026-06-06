import fs from "node:fs";
import path from "node:path";

import type { LangfuseTraceEvent, LangfuseTraceReport } from "../observability/langfuse/trace-contract.js";

const root = process.cwd();
const traceId = `hermes-mastra-${Date.now()}`;

const artifactExists = (file: string) => fs.existsSync(path.join(root, file));

const events: LangfuseTraceEvent[] = [
  {
    traceId,
    stage: "core",
    name: "Hermes core recommendation",
    inputArtifact: "sentra/sample-input.json",
    outputArtifact: "hermes/idea-recommendation.json",
    status: "success",
    metadata: { artifactExists: artifactExists("hermes/idea-recommendation.json") }
  },
  {
    traceId,
    stage: "native",
    name: "Mastra native workflow",
    inputArtifact: "sentra/sample-input.json",
    outputArtifact: "hermes/mastra-native-workflow.json",
    status: "success",
    metadata: { artifactExists: artifactExists("hermes/mastra-native-workflow.json") }
  },
  {
    traceId,
    stage: "parallel",
    name: "Mastra parallel critique",
    outputArtifact: "hermes/mastra-native-parallel-critique.json",
    status: "success",
    metadata: { artifactExists: artifactExists("hermes/mastra-native-parallel-critique.json") }
  },
  {
    traceId,
    stage: "human-review",
    name: "Mastra human review",
    outputArtifact: "hermes/mastra-native-human-review.json",
    status: "approved",
    metadata: { artifactExists: artifactExists("hermes/mastra-native-human-review.json") }
  },
  {
    traceId,
    stage: "suspend",
    name: "Suspend packet",
    outputArtifact: "hermes/mastra-suspend-packet.json",
    status: "suspended",
    metadata: { artifactExists: artifactExists("hermes/mastra-suspend-packet.json") }
  },
  {
    traceId,
    stage: "resume",
    name: "Resume result",
    outputArtifact: "hermes/mastra-resume-result.json",
    status: "approved",
    metadata: { artifactExists: artifactExists("hermes/mastra-resume-result.json") }
  },
  {
    traceId,
    stage: "qualification",
    name: "Mastra qualification report",
    outputArtifact: "reports/mastra-qualification.json",
    status: "success",
    metadata: { artifactExists: artifactExists("reports/mastra-qualification.json") }
  }
];

const report: LangfuseTraceReport = {
  runtime: "langfuse-qualification-local-contract",
  mode: "local-deterministic-no-network",
  traceId,
  events,
  notes: [
    "This is a local Langfuse trace contract, not a network integration.",
    "Every Hermes/Mastra stage must be traceable to an artifact.",
    "Next step is replacing this local contract with real Langfuse SDK emission."
  ]
};

fs.writeFileSync(
  path.join(root, "reports/langfuse-qualification.json"),
  JSON.stringify(report, null, 2) + "\n"
);

const lines = [
  "# Langfuse Qualification Report",
  "",
  `Trace ID: ${traceId}`,
  "",
  "Mode: local deterministic trace contract",
  "",
  "## Events",
  "",
  "| Stage | Status | Output Artifact |",
  "|---|---:|---|",
  ...events.map((event) => `| ${event.stage} | ${event.status} | \`${event.outputArtifact ?? ""}\` |`),
  "",
  "## Decision",
  "",
  "Langfuse remains unqualified for live runtime use until SDK emission, trace viewing, and artifact linking are tested.",
  ""
];

fs.writeFileSync(
  path.join(root, "reports/langfuse-qualification.md"),
  lines.join("\n")
);

console.log(JSON.stringify(report, null, 2));
