import fs from "node:fs";

const reportPath =
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-wiring-validation-v9.6.json";

const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));

const requiredArtifacts = [
  "hermes/agentic-workflow/run-v3/quality-gate-wiring-validation/v9.6.json",
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-wiring-validation-v9.6.json",
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-wiring-validation-v9.6.md"
];

const checks = [
  { id: "runtime-labeled", pass: report.runtime === "hermes-agentic-run-v3-quality-gate-wiring-validation-v9.6" },
  { id: "status-validated", pass: report.status === "validated" },
  { id: "wiring-implementation-ready", pass: report.checks.wiringImplementationReady === true },
  { id: "quality-gate-shape-present", pass: report.checks.qualityGateShapePresent === true },
  { id: "required-gate-outputs-present", pass: report.checks.requiredGateOutputsPresent === true },
  { id: "required-checks-present", pass: report.checks.requiredChecksPresent === true },
  { id: "wired-phases-valid", pass: report.checks.wiredPhasesValid === true },
  { id: "reusable-contract-valid", pass: report.checks.reusableContractValid === true },
  { id: "fail-closed-policy-present", pass: report.checks.failClosedPolicyPresent === true },
  { id: "validations-passed", pass: report.checks.validationsPassed === true },
  { id: "validation-only", pass: report.checks.validationOnly === true },
  { id: "no-broad-source-rewrite", pass: report.checks.noBroadSourceRewrite === true },
  { id: "no-patch-applied-by-this-step", pass: report.checks.noPatchAppliedByThisStep === true },
  { id: "no-branch-created", pass: report.checks.noBranchCreated === true },
  { id: "no-push", pass: report.checks.noPush === true },
  { id: "no-merge", pass: report.checks.noMerge === true },
  { id: "no-pr-opened", pass: report.checks.noPrOpened === true },
  { id: "artifacts-exist", pass: requiredArtifacts.every((artifact) => fs.existsSync(artifact)) }
];

const passed = checks.every((check) => check.pass);

console.log(JSON.stringify({ passed, checks }, null, 2));

if (!passed) {
  process.exit(1);
}
