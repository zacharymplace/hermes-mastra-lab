import fs from "node:fs";

const artifact = JSON.parse(
  fs.readFileSync(
    "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-wiring-validation-v9.6.json",
    "utf8"
  )
);

const requiredFiles = [
  "scripts/write-hermes-agentic-run-v3-quality-gate-wiring-validation-v9-6.ts",
  "evaluations/hermes-agentic-run-v3-quality-gate-wiring-validation-v9-6-gate.ts",
  "hermes/agentic-workflow/run-v3/quality-gate-wiring-validation/v9.6.json",
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-wiring-validation-v9.6.json",
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-wiring-validation-v9.6.md"
];

const checks = [
  { id: "runtime-labeled", pass: artifact.runtime === "hermes-agentic-run-v3-quality-gate-wiring-validation-v9.6" },
  { id: "status-validated", pass: artifact.status === "validated" },
  { id: "wiring-implementation-ready", pass: artifact.checks.wiringImplementationReady === true },
  { id: "quality-gate-shape-present", pass: artifact.checks.qualityGateShapePresent === true },
  { id: "required-output-fields-present", pass: artifact.checks.requiredOutputFieldsPresent === true },
  { id: "required-checks-present", pass: artifact.checks.requiredChecksPresent === true },
  { id: "wired-phases-present", pass: artifact.checks.wiredPhasesPresent === true },
  { id: "reusable-contract-present", pass: artifact.checks.reusableContractPresent === true },
  { id: "fail-closed-policy-present", pass: artifact.checks.failClosedPolicyPresent === true },
  { id: "validations-passed", pass: artifact.checks.validationsPassed === true },
  { id: "validation-only", pass: artifact.checks.validationOnly === true },
  { id: "no-broad-source-rewrite", pass: artifact.checks.noBroadSourceRewrite === true },
  { id: "no-patch-applied-by-this-step", pass: artifact.checks.noPatchAppliedByThisStep === true },
  { id: "no-branch-created", pass: artifact.checks.noBranchCreated === true },
  { id: "no-push", pass: artifact.checks.noPush === true },
  { id: "no-merge", pass: artifact.checks.noMerge === true },
  { id: "no-pr-opened", pass: artifact.checks.noPrOpened === true },
  { id: "artifacts-exist", pass: requiredFiles.every((file) => fs.existsSync(file)) }
];

const passed = checks.every((check) => check.pass);

console.log(JSON.stringify({ passed, checks }, null, 2));

if (!passed) {
  process.exit(1);
}
