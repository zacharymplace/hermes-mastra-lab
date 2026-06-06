import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const report = JSON.parse(
  fs.readFileSync(
    path.join(
      root,
      "reports/agentic-workflow/run-v2/hermes-agentic-run-v2-plan-v7.0.json"
    ),
    "utf8"
  )
);

const requiredArtifacts = [
  "hermes/agentic-workflow/run-v2/plan-v7.0.json",
  "reports/agentic-workflow/run-v2/hermes-agentic-run-v2-plan-v7.0.json",
  "reports/agentic-workflow/run-v2/hermes-agentic-run-v2-plan-v7.0.md"
];

const checks = [
  {
    id: "runtime-labeled",
    pass: report.runtime === "hermes-agentic-run-v2-plan-v7.0"
  },
  {
    id: "status-planned",
    pass: report.status === "planned"
  },
  {
    id: "contract-valid",
    pass: report.checks?.contractValid === true
  },
  {
    id: "selector-chose-next-run",
    pass: report.checks?.selectorChoseNextRun === true
  },
  {
    id: "source-run-complete",
    pass: report.checks?.sourceRunComplete === true
  },
  {
    id: "ledger-has-entry",
    pass: report.checks?.ledgerHasEntry === true
  },
  {
    id: "validations-passed",
    pass: report.checks?.validationsPassed === true
  },
  {
    id: "planning-only",
    pass: report.checks?.planningOnly === true
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
