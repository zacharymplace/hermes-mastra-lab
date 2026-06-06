import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function readJson(filePath: string) {
  return JSON.parse(fs.readFileSync(path.join(root, filePath), "utf8"));
}

const reportPath =
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-wiring-intent-v9.4.json";

const artifact = readJson(reportPath);

const requiredFiles = [
  "scripts/write-hermes-agentic-run-v3-quality-gate-wiring-intent-v9-4.ts",
  "evaluations/hermes-agentic-run-v3-quality-gate-wiring-intent-v9-4-gate.ts",
  "hermes/agentic-workflow/run-v3/quality-gate-wiring-intent/v9.4.json",
  reportPath,
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-wiring-intent-v9.4.md"
];

const checks = [
  {
    id: "runtime-labeled",
    pass: artifact.runtime === "hermes-agentic-run-v3-quality-gate-wiring-intent-v9.4"
  },
  { id: "status-intent-declared", pass: artifact.status === "intent-declared" },
  { id: "wiring-proposal-ready", pass: artifact.checks?.wiringProposalReady === true },
  {
    id: "enforcement-validation-ready",
    pass: artifact.checks?.enforcementValidationReady === true
  },
  {
    id: "proposed-patch-shape-declared",
    pass: Boolean(artifact.wiringIntent?.proposedPatchShape?.generator)
  },
  {
    id: "wiring-scope-declared",
    pass: Array.isArray(artifact.wiringIntent?.wiringScope) &&
      artifact.wiringIntent.wiringScope.length >= 5
  },
  {
    id: "required-gate-outputs-carried-forward",
    pass: Array.isArray(artifact.wiringIntent?.requiredGateOutputs) &&
      artifact.wiringIntent.requiredGateOutputs.includes("passed")
  },
  {
    id: "fail-closed-policy-carried-forward",
    pass: Array.isArray(artifact.wiringIntent?.failClosedPolicy) &&
      artifact.wiringIntent.failClosedPolicy.length >= 3
  },
  {
    id: "implementation-rules-declared",
    pass: Array.isArray(artifact.wiringIntent?.implementationRules) &&
      artifact.wiringIntent.implementationRules.length >= 5
  },
  { id: "validations-passed", pass: artifact.checks?.validationsPassed === true },
  { id: "intent-only", pass: artifact.safetyBoundary?.intentOnly === true },
  {
    id: "no-broad-source-rewrite",
    pass: artifact.safetyBoundary?.broadSourceRewrite === false
  },
  { id: "no-patch-applied", pass: artifact.safetyBoundary?.patchApplied === false },
  { id: "no-branch-created", pass: artifact.safetyBoundary?.branchCreated === false },
  { id: "no-push", pass: artifact.safetyBoundary?.pushed === false },
  { id: "no-merge", pass: artifact.safetyBoundary?.merged === false },
  { id: "no-pr-opened", pass: artifact.safetyBoundary?.prOpened === false },
  {
    id: "artifacts-exist",
    pass: requiredFiles.every((filePath) => fs.existsSync(path.join(root, filePath)))
  }
];

const passed = checks.every((check) => check.pass);

console.log(JSON.stringify({ passed, checks }, null, 2));

if (!passed) {
  process.exit(1);
}
