import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const reportPath =
  "reports/agentic-workflow/run-v2/hermes-agentic-run-v2-source-patch-validation-v7.5.json";

const requiredArtifacts = [
  "hermes/agentic-workflow/run-v2/source-patch-validation-v7.5.json",
  reportPath,
  "reports/agentic-workflow/run-v2/hermes-agentic-run-v2-source-patch-validation-v7.5.md"
];

const report = JSON.parse(fs.readFileSync(path.join(root, reportPath), "utf8"));

const checks = [
  {
    id: "runtime-labeled",
    pass: report.runtime === "hermes-agentic-run-v2-source-patch-validation-v7.5"
  },
  {
    id: "status-validated",
    pass: report.status === "validated"
  },
  {
    id: "source-patch-apply-ready",
    pass: report.checks?.sourcePatchApplyReady === true
  },
  {
    id: "source-patch-apply-gate-passed",
    pass: report.checks?.sourcePatchApplyGatePassed === true
  },
  {
    id: "validation-ran",
    pass: report.checks?.validationRan === true
  },
  {
    id: "validations-passed",
    pass: report.checks?.validationsPassed === true
  },
  {
    id: "validation-only",
    pass: report.checks?.validationOnly === true
  },
  {
    id: "no-patch-applied-by-this-step",
    pass: report.checks?.noPatchAppliedByThisStep === true
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
