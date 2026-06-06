import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const reportPath = path.join(
  root,
  "reports/agentic-workflow/run-v2/hermes-agentic-run-v2-index-v8.0.json"
);

const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));

const requiredArtifacts = [
  "hermes/agentic-workflow/run-v2/index/v8.0.json",
  "reports/agentic-workflow/run-v2/hermes-agentic-run-v2-index-v8.0.json",
  "reports/agentic-workflow/run-v2/hermes-agentic-run-v2-index-v8.0.md"
];

const checks = [
  {
    id: "runtime-labeled",
    pass: report.runtime === "hermes-agentic-run-v2-index-v8.0"
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
    id: "lifecycle-merged",
    pass: report.checks?.lifecycleMerged === true
  },
  {
    id: "post-merge-ledger-recorded",
    pass: report.checks?.postMergeLedgerRecorded === true
  },
  {
    id: "ledger-has-run-v2-entry",
    pass: report.checks?.ledgerHasRunV2Entry === true
  },
  {
    id: "validations-passed",
    pass: report.checks?.validationsPassed === true
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
