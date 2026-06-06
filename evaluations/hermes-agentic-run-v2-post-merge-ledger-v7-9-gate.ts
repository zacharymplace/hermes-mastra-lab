import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const reportPath = path.join(
  root,
  "reports/agentic-workflow/run-v2/hermes-agentic-run-v2-post-merge-ledger-v7.9.json"
);

const requiredArtifacts = [
  "sentra/ledger/post-merge-validation.json",
  "hermes/agentic-workflow/run-v2/post-merge/v7.9.json",
  "reports/agentic-workflow/run-v2/hermes-agentic-run-v2-post-merge-ledger-v7.9.json",
  "reports/agentic-workflow/run-v2/hermes-agentic-run-v2-post-merge-ledger-v7.9.md"
];

const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));

const checks = [
  {
    id: "runtime-labeled",
    pass: report.runtime === "hermes-agentic-run-v2-post-merge-ledger-v7.9"
  },
  {
    id: "status-recorded",
    pass: report.status === "recorded"
  },
  {
    id: "lifecycle-merged",
    pass: report.checks?.lifecycleMerged === true
  },
  {
    id: "lifecycle-tracked",
    pass: report.checks?.lifecycleTracked === true
  },
  {
    id: "validation-ran",
    pass: report.checks?.validationRan === true
  },
  {
    id: "validation-passed",
    pass: report.checks?.validationPassed === true
  },
  {
    id: "ledger-entry-written",
    pass: report.checks?.ledgerEntryWritten === true
  },
  {
    id: "merge-commit-captured",
    pass: report.checks?.mergeCommitCaptured === true
  },
  {
    id: "pr-url-captured",
    pass: report.checks?.prUrlCaptured === true
  },
  {
    id: "branch-status-captured",
    pass: report.checks?.branchStatusCaptured === true
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
