import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const report = JSON.parse(
  fs.readFileSync(
    path.join(
      root,
      "reports/agentic-workflow/post-merge/hermes-post-merge-validation-ledger-v6.6.json"
    ),
    "utf8"
  )
);

const ledger = JSON.parse(
  fs.readFileSync(path.join(root, "sentra/ledger/post-merge-validation.json"), "utf8")
);

const requiredArtifacts = [
  "sentra/ledger/post-merge-validation.json",
  "hermes/agentic-workflow/post-merge/v6.6.json",
  "reports/agentic-workflow/post-merge/hermes-post-merge-validation-ledger-v6.6.json",
  "reports/agentic-workflow/post-merge/hermes-post-merge-validation-ledger-v6.6.md"
];

const entryExists = ledger.entries?.some(
  (entry: any) => entry.id === report.entry?.id
);

const checks = [
  {
    id: "runtime-labeled",
    pass: report.runtime === "hermes-post-merge-validation-ledger-v6.6"
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
    pass: report.checks?.ledgerEntryWritten === true && entryExists === true
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
