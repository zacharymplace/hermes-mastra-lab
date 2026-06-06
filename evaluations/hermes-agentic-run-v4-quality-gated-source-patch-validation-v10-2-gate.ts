import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const reportPath = path.join(
  root,
  "reports/agentic-workflow/run-v4/hermes-agentic-run-v4-quality-gated-source-patch-validation-v10.2.json"
);

const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));

const requiredArtifacts = [
  "hermes/agentic-workflow/run-v4/source-patch-validation/v10.2.json",
  "reports/agentic-workflow/run-v4/hermes-agentic-run-v4-quality-gated-source-patch-validation-v10.2.json",
  "reports/agentic-workflow/run-v4/hermes-agentic-run-v4-quality-gated-source-patch-validation-v10.2.md"
];

const checks = [
  {
    id: "runtime-labeled",
    pass:
      report.runtime ===
      "hermes-agentic-run-v4-quality-gated-source-patch-validation-v10.2"
  },
  {
    id: "status-validated",
    pass: report.status === "validated"
  },
  {
    id: "apply-ready",
    pass: report.checks?.applyReady === true
  },
  {
    id: "quality-gate-present",
    pass: report.checks?.qualityGatePresent === true
  },
  {
    id: "quality-gate-passed",
    pass: report.checks?.qualityGatePassed === true
  },
  {
    id: "required-gate-outputs-present",
    pass: report.checks?.requiredGateOutputsPresent === true
  },
  {
    id: "required-apply-fields-present",
    pass: report.checks?.requiredApplyFieldsPresent === true
  },
  {
    id: "declared-targets-clean",
    pass: report.checks?.declaredTargetsClean === true
  },
  {
    id: "validations-passed",
    pass: report.checks?.validationsPassed === true
  },
  {
    id: "validation-only",
    pass: report.safetyBoundary?.validationOnly === true
  },
  {
    id: "no-patch-applied-by-this-step",
    pass: report.safetyBoundary?.patchAppliedByThisStep === false
  },
  {
    id: "no-branch-created",
    pass: report.safetyBoundary?.branchCreated === false
  },
  {
    id: "no-push",
    pass: report.safetyBoundary?.pushed === false
  },
  {
    id: "no-merge",
    pass: report.safetyBoundary?.merged === false
  },
  {
    id: "no-pr-opened",
    pass: report.safetyBoundary?.prOpened === false
  },
  {
    id: "human-approval-required",
    pass: report.safetyBoundary?.humanApprovalRequiredForGitHubActions === true
  },
  {
    id: "artifacts-exist",
    pass: requiredArtifacts.every((p) => fs.existsSync(path.join(root, p)))
  }
];

const passed = checks.every((check) => check.pass);

console.log(JSON.stringify({ passed, checks }, null, 2));

if (!passed) {
  process.exit(1);
}
