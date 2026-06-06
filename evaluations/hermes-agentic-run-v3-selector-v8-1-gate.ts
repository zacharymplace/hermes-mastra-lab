import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const reportPath = path.join(
  root,
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-selector-v8.1.json"
);

const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));

const requiredArtifacts = [
  "hermes/agentic-workflow/run-v3/selector/v8.1.json",
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-selector-v8.1.json",
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-selector-v8.1.md"
];

const checks = [
  {
    id: "runtime-labeled",
    pass: report.runtime === "hermes-agentic-run-v3-selector-v8.1"
  },
  {
    id: "status-selected",
    pass: report.status === "selected"
  },
  {
    id: "run-v2-index-complete",
    pass: report.checks?.runV2IndexComplete === true
  },
  {
    id: "ledger-has-entries",
    pass: report.checks?.ledgerHasEntries === true
  },
  {
    id: "candidates-ranked",
    pass: report.checks?.candidatesRanked === true
  },
  {
    id: "selected-candidate-present",
    pass: report.checks?.selectedCandidatePresent === true
  },
  {
    id: "recommendation-present",
    pass: report.checks?.recommendationPresent === true
  },
  {
    id: "selector-only",
    pass: report.checks?.selectorOnly === true
  },
  {
    id: "no-patch-generated",
    pass: report.checks?.noPatchGenerated === true
  },
  {
    id: "no-patch-applied",
    pass: report.checks?.noPatchApplied === true
  },
  {
    id: "no-branch-created",
    pass: report.checks?.noBranchCreated === true
  },
  {
    id: "no-push",
    pass: report.checks?.noPush === true
  },
  {
    id: "no-merge",
    pass: report.checks?.noMerge === true
  },
  {
    id: "no-pr-opened",
    pass: report.checks?.noPrOpened === true
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
