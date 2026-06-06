import fs from "node:fs";
import path from "node:path";

import type {
  FailureQualificationReport,
  FailureResult,
  FailureScenario
} from "../reliability/failure/failure-contract.js";

const root = process.cwd();
const reportDir = path.join(root, "reports");
fs.mkdirSync(reportDir, { recursive: true });

const scenarios: FailureScenario[] = [
  {
    id: "generator-throws",
    stage: "generate",
    expectedBehavior: "retry-then-recover",
    maxAttempts: 2
  },
  {
    id: "critic-throws",
    stage: "critique",
    expectedBehavior: "retry-then-recover",
    maxAttempts: 2
  },
  {
    id: "scorer-invalid",
    stage: "score",
    expectedBehavior: "fail-safely",
    maxAttempts: 1
  },
  {
    id: "artifact-write-blocked",
    stage: "artifact",
    expectedBehavior: "fail-safely",
    maxAttempts: 1
  }
];

function simulateScenario(scenario: FailureScenario): FailureResult {
  if (scenario.expectedBehavior === "retry-then-recover") {
    return {
      id: scenario.id,
      stage: scenario.stage,
      expectedBehavior: scenario.expectedBehavior,
      passed: true,
      attempts: [
        {
          attempt: 1,
          status: "failed",
          error: `${scenario.stage} failed on first attempt`
        },
        {
          attempt: 2,
          status: "recovered"
        }
      ],
      finalStatus: "recovered",
      artifactPreserved: true,
      traceEmitted: true
    };
  }

  return {
    id: scenario.id,
    stage: scenario.stage,
    expectedBehavior: scenario.expectedBehavior,
    passed: true,
    attempts: [
      {
        attempt: 1,
        status: "safe-failure",
        error: `${scenario.stage} failure was contained`
      }
    ],
    finalStatus: "safe-failure",
    artifactPreserved: true,
    traceEmitted: true
  };
}

const results = scenarios.map(simulateScenario);
const passed = results.every((result) => result.passed);
const recovered = results.filter((result) => result.finalStatus === "recovered").length;
const safeFailures = results.filter((result) => result.finalStatus === "safe-failure").length;

const report: FailureQualificationReport = {
  runtime: "failure-qualification-local-contract",
  mode: "local-deterministic-no-network",
  recommendation: passed ? "advance-failure-handling" : "hold",
  results,
  notes: [
    "This is a local failure qualification contract, not real Mastra retry execution.",
    "The suite defines expected Hermes behavior for retry, recovery, safe failure, trace emission, and artifact preservation.",
    "Next step is replacing simulated attempts with real Mastra retry/error behavior."
  ]
};

fs.writeFileSync(
  path.join(reportDir, "failure-qualification.json"),
  JSON.stringify(report, null, 2) + "\n"
);

const lines = [
  "# Failure Qualification Report",
  "",
  `Runtime: ${report.runtime}`,
  `Mode: ${report.mode}`,
  `Recommendation: **${report.recommendation}**`,
  "",
  "## Summary",
  "",
  `- Scenarios: ${results.length}`,
  `- Recovered: ${recovered}`,
  `- Safe failures: ${safeFailures}`,
  `- Passed: ${passed}`,
  "",
  "## Scenarios",
  "",
  "| Scenario | Stage | Expected | Final Status | Artifact Preserved | Trace Emitted |",
  "|---|---|---|---|---:|---:|",
  ...results.map(
    (result) =>
      `| ${result.id} | ${result.stage} | ${result.expectedBehavior} | ${result.finalStatus} | ${result.artifactPreserved} | ${result.traceEmitted} |`
  ),
  "",
  "## Notes",
  "",
  ...report.notes.map((note) => `- ${note}`),
  ""
];

fs.writeFileSync(
  path.join(reportDir, "failure-qualification.md"),
  lines.join("\n")
);

console.log(JSON.stringify(report, null, 2));
