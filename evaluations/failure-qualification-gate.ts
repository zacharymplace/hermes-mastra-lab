import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const report = JSON.parse(
  fs.readFileSync(path.join(root, "reports/failure-qualification.json"), "utf8")
);

const requiredScenarios = [
  "generator-throws",
  "critic-throws",
  "scorer-invalid",
  "artifact-write-blocked"
];

const checks = [
  {
    id: "runtime-labeled",
    pass: report.runtime === "failure-qualification-local-contract"
  },
  {
    id: "no-network-mode",
    pass: report.mode === "local-deterministic-no-network"
  },
  {
    id: "required-scenarios-present",
    pass: requiredScenarios.every((id) =>
      report.results?.some((result: any) => result.id === id)
    )
  },
  {
    id: "all-results-pass",
    pass: report.results?.every((result: any) => result.passed === true)
  },
  {
    id: "retry-recovery-covered",
    pass: report.results?.some(
      (result: any) =>
        result.expectedBehavior === "retry-then-recover" &&
        result.finalStatus === "recovered" &&
        result.attempts?.length >= 2
    )
  },
  {
    id: "safe-failure-covered",
    pass: report.results?.some(
      (result: any) =>
        result.expectedBehavior === "fail-safely" &&
        result.finalStatus === "safe-failure"
    )
  },
  {
    id: "artifacts-preserved",
    pass: report.results?.every((result: any) => result.artifactPreserved === true)
  },
  {
    id: "traces-emitted",
    pass: report.results?.every((result: any) => result.traceEmitted === true)
  }
];

const passed = checks.every((check) => check.pass);

console.log(JSON.stringify({ passed, checks }, null, 2));

if (!passed) {
  process.exit(1);
}
