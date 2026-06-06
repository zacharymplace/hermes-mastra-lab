import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function readJson(relativePath: string) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

const mastra = readJson("reports/mastra-qualification.json");
const langfuse = readJson("reports/langfuse-qualification.json");
const failure = readJson("reports/failure-qualification.json");

const blockers = [
  {
    id: "real-langfuse-sdk",
    status: "open",
    severity: "high",
    reason: "Langfuse qualification is still a local trace contract, not SDK emission."
  },
  {
    id: "real-mastra-suspend-resume",
    status: "open",
    severity: "high",
    reason: "Suspend/resume is modeled as a contract, not verified against real Mastra runtime API."
  },
  {
    id: "real-retry-behavior",
    status: "open",
    severity: "medium",
    reason: "Failure qualification defines retry expectations but does not execute real Mastra retry behavior."
  },
  {
    id: "external-human-input",
    status: "open",
    severity: "medium",
    reason: "Human review is simulated locally rather than injected from an external decision source."
  }
];

const evidence = [
  {
    id: "workflow-composition",
    status: "strong",
    source: "reports/mastra-qualification.json",
    reason: "Parallel critique and fan-out/fan-in passed."
  },
  {
    id: "governance-flow",
    status: "strong",
    source: "reports/mastra-qualification.json",
    reason: "Human review and suspend/resume contract passed."
  },
  {
    id: "traceability-model",
    status: "promising",
    source: "reports/langfuse-qualification.json",
    reason: "Every major stage has a local trace event linked to an artifact."
  },
  {
    id: "failure-model",
    status: "promising",
    source: "reports/failure-qualification.json",
    reason: "Retry/recovery and safe-failure scenarios passed as local contracts."
  }
];

const highBlockers = blockers.filter(
  (blocker) => blocker.status === "open" && blocker.severity === "high"
);

const decision =
  highBlockers.length > 0
    ? "continue-evaluation"
    : mastra.score?.percentage >= 75
      ? "promote"
      : "continue-evaluation";

const promotion = {
  generatedAt: new Date().toISOString(),
  decision,
  summary:
    decision === "promote"
      ? "Mastra is qualified for promotion as a Hermes runtime candidate."
      : "Mastra remains a strong runtime candidate but should not be promoted until high-severity integration blockers are resolved.",
  inputs: {
    mastraQualification: "reports/mastra-qualification.json",
    langfuseQualification: "reports/langfuse-qualification.json",
    failureQualification: "reports/failure-qualification.json"
  },
  scores: {
    mastraQualification: mastra.score,
    langfuseEvents: langfuse.events?.length ?? 0,
    failureScenarios: failure.results?.length ?? 0
  },
  evidence,
  blockers,
  requiredForPromotion: [
    "emit real Langfuse SDK traces",
    "verify real Mastra suspend/resume API",
    "verify real Mastra retry/error behavior",
    "inject human review decision from external input",
    "regenerate promotion report with no open high-severity blockers"
  ],
  decisionBoundary:
    "Mastra may become the Hermes runtime layer, but Hermes domain logic, scoring, promotion criteria, and artifacts must remain framework-independent."
};

fs.writeFileSync(
  path.join(root, "reports/mastra-promotion-v1.json"),
  JSON.stringify(promotion, null, 2) + "\n"
);

const lines = [
  "# Mastra Promotion Report v1",
  "",
  `Generated: ${promotion.generatedAt}`,
  "",
  `Decision: **${promotion.decision}**`,
  "",
  promotion.summary,
  "",
  "## Inputs",
  "",
  `- Mastra qualification: \`${promotion.inputs.mastraQualification}\``,
  `- Langfuse qualification: \`${promotion.inputs.langfuseQualification}\``,
  `- Failure qualification: \`${promotion.inputs.failureQualification}\``,
  "",
  "## Scores",
  "",
  `- Mastra qualification: ${mastra.score.total}/${mastra.score.max} (${mastra.score.percentage}%)`,
  `- Langfuse trace events: ${promotion.scores.langfuseEvents}`,
  `- Failure scenarios: ${promotion.scores.failureScenarios}`,
  "",
  "## Evidence",
  "",
  "| Evidence | Status | Source | Rationale |",
  "|---|---|---|---|",
  ...evidence.map(
    (item) => `| ${item.id} | ${item.status} | \`${item.source}\` | ${item.reason} |`
  ),
  "",
  "## Blockers",
  "",
  "| Blocker | Severity | Status | Reason |",
  "|---|---|---|---|",
  ...blockers.map(
    (item) => `| ${item.id} | ${item.severity} | ${item.status} | ${item.reason} |`
  ),
  "",
  "## Required for Promotion",
  "",
  ...promotion.requiredForPromotion.map((item) => `- ${item}`),
  "",
  "## Decision Boundary",
  "",
  promotion.decisionBoundary,
  ""
];

fs.writeFileSync(
  path.join(root, "reports/mastra-promotion-v1.md"),
  lines.join("\n")
);

console.log(JSON.stringify(promotion, null, 2));
