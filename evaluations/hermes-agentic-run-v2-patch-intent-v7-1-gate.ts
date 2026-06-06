import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const report = JSON.parse(
  fs.readFileSync(
    path.join(
      root,
      "reports/agentic-workflow/run-v2/hermes-agentic-run-v2-patch-intent-v7.1.json"
    ),
    "utf8"
  )
);

const requiredArtifacts = [
  "hermes/agentic-workflow/run-v2/patch-intent-v7.1.json",
  "reports/agentic-workflow/run-v2/hermes-agentic-run-v2-patch-intent-v7.1.json",
  "reports/agentic-workflow/run-v2/hermes-agentic-run-v2-patch-intent-v7.1.md"
];

const checks = [
  {
    id: "runtime-labeled",
    pass: report.runtime === "hermes-agentic-run-v2-patch-intent-v7.1"
  },
  {
    id: "status-intent-declared",
    pass: report.status === "intent-declared"
  },
  {
    id: "plan-valid",
    pass: report.checks?.planValid === true
  },
  {
    id: "contract-valid",
    pass: report.checks?.contractValid === true
  },
  {
    id: "next-run-selected",
    pass: report.checks?.nextRunSelected === true
  },
  {
    id: "patch-intent-present",
    pass: report.checks?.patchIntentPresent === true
  },
  {
    id: "proposed-patch-shape-declared",
    pass: report.checks?.proposedPatchShapeDeclared === true
  },
  {
    id: "target-selection-rules-declared",
    pass: report.checks?.targetSelectionRulesDeclared === true
  },
  {
    id: "validations-passed",
    pass: report.checks?.validationsPassed === true
  },
  {
    id: "intent-only",
    pass: report.checks?.intentOnly === true
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
