import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const report = JSON.parse(
  fs.readFileSync(
    path.join(
      root,
      "reports/agentic-workflow/run-index/hermes-agentic-run-index-v6.7.json"
    ),
    "utf8"
  )
);

const requiredArtifacts = [
  "hermes/agentic-workflow/run-index/v6.7.json",
  "reports/agentic-workflow/run-index/hermes-agentic-run-index-v6.7.json",
  "reports/agentic-workflow/run-index/hermes-agentic-run-index-v6.7.md"
];

const checks = [
  {
    id: "runtime-labeled",
    pass: report.runtime === "hermes-agentic-run-index-v6.7"
  },
  {
    id: "status-complete",
    pass: report.status === "complete"
  },
  {
    id: "required-artifacts-present",
    pass: report.checks?.requiredArtifactsPresent === true
  },
  {
    id: "validations-passed",
    pass: report.checks?.validationsPassed === true
  },
  {
    id: "lifecycle-merged",
    pass: report.checks?.lifecycleMerged === true
  },
  {
    id: "post-merge-ledger-recorded",
    pass: report.checks?.postMergeLedgerRecorded === true
  },
  {
    id: "run-state-complete",
    pass: report.checks?.runStateComplete === true
  },
  {
    id: "pr-linked",
    pass: report.checks?.prLinked === true
  },
  {
    id: "ledger-linked",
    pass: report.checks?.ledgerLinked === true
  },
  {
    id: "artifacts-exist",
    pass: requiredArtifacts.every((artifact) =>
      fs.existsSync(path.join(root, artifact))
    )
  }
];

const passed = checks.every((check) => check.pass);

console.log(JSON.stringify({ passed, checks }, null, 2));

if (!passed) {
  process.exit(1);
}
