import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const reportPath = path.join(
  root,
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-index-v9.7.json"
);

const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));

const requiredOutputs = [
  "status",
  "requiredChecks",
  "results",
  "generatedArtifactDrift",
  "timestampChurn",
  "noOpPatchClaims",
  "humanBoundaryPreserved",
  "declaredTargetOnlyChanges",
  "passed"
];

const requiredChecks = [
  "generated-artifact-drift",
  "stale-timestamp-churn",
  "no-op-patch-claims",
  "human-boundary-preservation",
  "declared-target-only-changes"
];

const requiredWiredPhases = [
  "source-patch-proposal",
  "source-patch-apply",
  "source-patch-validation",
  "branch-prepare",
  "pr-draft",
  "post-merge-ledger",
  "run-index"
];

const artifactPaths = [
  "hermes/agentic-workflow/run-v3/quality-gate-index/v9.7.json",
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-index-v9.7.json",
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-index-v9.7.md"
];

const checks = [
  {
    id: "runtime-labeled",
    pass: report.runtime === "hermes-agentic-run-v3-quality-gate-index-v9.7"
  },
  {
    id: "status-indexed",
    pass: report.status === "indexed"
  },
  {
    id: "run-v3-indexed",
    pass: report.run?.id === "hermes-agentic-run-v3"
  },
  {
    id: "quality-gate-validated",
    pass: report.qualityGate?.status === "validated-for-future-use"
  },
  {
    id: "required-gate-outputs-present",
    pass: requiredOutputs.every((field) => report.qualityGate.requiredGateOutputs.includes(field))
  },
  {
    id: "required-checks-present",
    pass: requiredChecks.every((check) => report.qualityGate.requiredChecks.includes(check))
  },
  {
    id: "wired-phases-valid",
    pass: requiredWiredPhases.every((phase) => report.qualityGate.wiredPhases.includes(phase))
  },
  {
    id: "reusable-contract-valid",
    pass: report.qualityGate.reusableContract?.fieldName === "qualityGate"
  },
  {
    id: "fail-closed-policy-present",
    pass: Array.isArray(report.qualityGate.failClosedPolicy) && report.qualityGate.failClosedPolicy.length >= 5
  },
  {
    id: "required-artifacts-present",
    pass: report.checks?.requiredArtifactsPresent === true
  },
  {
    id: "validations-passed",
    pass: report.checks?.validationsPassed === true
  },
  {
    id: "index-only",
    pass: report.safetyBoundary?.indexOnly === true
  },
  {
    id: "no-broad-source-rewrite",
    pass: report.safetyBoundary?.broadSourceRewrite === false
  },
  {
    id: "no-patch-applied",
    pass: report.safetyBoundary?.patchApplied === false
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
    id: "artifacts-exist",
    pass: artifactPaths.every((artifactPath) => fs.existsSync(path.join(root, artifactPath)))
  }
];

const passed = checks.every((check) => check.pass);

console.log(JSON.stringify({ passed, checks }, null, 2));

if (!passed) {
  process.exit(1);
}
