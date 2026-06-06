import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const report = JSON.parse(
  fs.readFileSync(
    path.join(
      root,
      "reports/agentic-workflow/run-v2/hermes-agentic-run-v2-target-selection-v7.2.json"
    ),
    "utf8"
  )
);

const requiredArtifacts = [
  "hermes/agentic-workflow/run-v2/target-selection-v7.2.json",
  "reports/agentic-workflow/run-v2/hermes-agentic-run-v2-target-selection-v7.2.json",
  "reports/agentic-workflow/run-v2/hermes-agentic-run-v2-target-selection-v7.2.md"
];

const checks = [
  {
    id: "runtime-labeled",
    pass: report.runtime === "hermes-agentic-run-v2-target-selection-v7.2"
  },
  {
    id: "status-target-selected",
    pass: report.status === "target-selected"
  },
  {
    id: "intent-valid",
    pass: report.checks?.intentValid === true
  },
  {
    id: "plan-valid",
    pass: report.checks?.planValid === true
  },
  {
    id: "run-index-complete",
    pass: report.checks?.runIndexComplete === true
  },
  {
    id: "ledger-has-entry",
    pass: report.checks?.ledgerHasEntry === true
  },
  {
    id: "targets-ranked",
    pass: report.checks?.targetsRanked === true
  },
  {
    id: "selected-target-present",
    pass: report.checks?.selectedTargetPresent === true
  },
  {
    id: "selected-target-has-files",
    pass: report.checks?.selectedTargetHasFiles === true
  },
  {
    id: "validations-passed",
    pass: report.checks?.validationsPassed === true
  },
  {
    id: "target-selection-only",
    pass: report.checks?.targetSelectionOnly === true
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
    id: "human-approval-required-before-patch",
    pass: report.checks?.humanApprovalRequiredBeforePatch === true
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
