import fs from "node:fs";

const reportPath =
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-enforcement-validation-v9.2.json";

const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));

const checks = [
  { id: "runtime-labeled", pass: report.runtime === "hermes-agentic-run-v3-quality-gate-enforcement-validation-v9.2" },
  { id: "status-validated", pass: report.status === "validated" },
  { id: "implementation-ready", pass: report.checks.implementationReady === true },
  { id: "quality-gate-shape-present", pass: report.checks.qualityGateShapePresent === true },
  { id: "required-output-fields-present", pass: report.checks.requiredOutputFieldsPresent === true },
  { id: "required-checks-present", pass: report.checks.requiredChecksPresent === true },
  { id: "fail-closed-conditions-declared", pass: report.checks.failClosedConditionsDeclared === true },
  { id: "future-phase-requirements-declared", pass: report.checks.futurePhaseRequirementsDeclared === true },
  { id: "validations-passed", pass: report.checks.validationsPassed === true },
  { id: "validation-only", pass: report.checks.validationOnly === true },
  { id: "no-patch-applied-by-this-step", pass: report.checks.noPatchAppliedByThisStep === true },
  { id: "no-branch-created", pass: report.checks.noBranchCreated === true },
  { id: "no-push", pass: report.checks.noPush === true },
  { id: "no-merge", pass: report.checks.noMerge === true },
  { id: "no-pr-opened", pass: report.checks.noPrOpened === true },
  {
    id: "artifacts-exist",
    pass: [
      "hermes/agentic-workflow/run-v3/quality-gate-enforcement-validation/v9.2.json",
      "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-enforcement-validation-v9.2.json",
      "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-enforcement-validation-v9.2.md"
    ].every((file) => fs.existsSync(file))
  }
];

const passed = checks.every((check) => check.pass);

console.log(JSON.stringify({ passed, checks }, null, 2));

if (!passed) {
  process.exit(1);
}
