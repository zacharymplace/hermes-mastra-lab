import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const reportPath =
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-validation-v8.6.json";

const report = JSON.parse(fs.readFileSync(path.join(root, reportPath), "utf8"));

const requiredArtifacts = [
  "hermes/agentic-workflow/run-v3/quality-gate-validation/v8.6.json",
  reportPath,
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-validation-v8.6.md"
];

const checks = [
  {
    id: "runtime-labeled",
    pass: report.runtime === "hermes-agentic-run-v3-quality-gate-validation-v8.6"
  },
  {
    id: "status-validated",
    pass: report.status === "validated"
  },
  {
    id: "implementation-ready",
    pass: report.checks?.implementationReady === true
  },
  {
    id: "implementation-gate-passed",
    pass: report.checks?.implementationGatePassed === true
  },
  {
    id: "prior-declared-target-failure-resolved",
    pass: report.checks?.priorDeclaredTargetFailureResolved === true
  },
  {
    id: "path-normalization-fixed",
    pass: report.checks?.pathNormalizationFixed === true
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
