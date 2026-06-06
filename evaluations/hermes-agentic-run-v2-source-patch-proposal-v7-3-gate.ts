import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const reportPath =
  "reports/agentic-workflow/run-v2/hermes-agentic-run-v2-source-patch-proposal-v7.3.json";

const report = JSON.parse(fs.readFileSync(path.join(root, reportPath), "utf8"));

const requiredArtifacts = [
  "hermes/agentic-workflow/run-v2/source-patch-proposal-v7.3.json",
  reportPath,
  "reports/agentic-workflow/run-v2/hermes-agentic-run-v2-source-patch-proposal-v7.3.md"
];

const checks = [
  { id: "runtime-labeled", pass: report.runtime === "hermes-agentic-run-v2-source-patch-proposal-v7.3" },
  { id: "status-patch-proposed", pass: report.status === "patch-proposed" },
  { id: "target-selection-valid", pass: report.checks?.targetSelectionValid === true },
  { id: "patch-intent-valid", pass: report.checks?.patchIntentValid === true },
  { id: "plan-valid", pass: report.checks?.planValid === true },
  { id: "selected-target-present", pass: report.checks?.selectedTargetPresent === true },
  { id: "proposal-present", pass: report.checks?.proposalPresent === true },
  { id: "proposed-files-declared", pass: report.checks?.proposedFilesDeclared === true },
  { id: "validation-commands-declared", pass: report.checks?.validationCommandsDeclared === true },
  { id: "proposal-only", pass: report.checks?.proposalOnly === true },
  { id: "no-patch-generated", pass: report.checks?.noPatchGenerated === true },
  { id: "no-patch-applied", pass: report.checks?.noPatchApplied === true },
  { id: "no-branch-created", pass: report.checks?.noBranchCreated === true },
  { id: "no-push", pass: report.checks?.noPush === true },
  { id: "no-merge", pass: report.checks?.noMerge === true },
  { id: "no-pr-opened", pass: report.checks?.noPrOpened === true },
  {
    id: "human-approval-required-before-patch",
    pass: report.checks?.humanApprovalRequiredBeforePatch === true
  },
  {
    id: "artifacts-exist",
    pass: requiredArtifacts.every((artifact) => fs.existsSync(path.join(root, artifact)))
  }
];

const passed = checks.every((check) => check.pass);

console.log(JSON.stringify({ passed, checks }, null, 2));

if (!passed) {
  process.exit(1);
}
