import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const artifactPath =
  "reports/agentic-workflow/run-v4/hermes-agentic-run-v4-quality-gated-pr-lifecycle-tracking-v10.6.json";

const artifact = JSON.parse(fs.readFileSync(path.join(root, artifactPath), "utf8"));

const checks = [
  { id: "runtime-labeled", pass: artifact.runtime === "hermes-agentic-run-v4-quality-gated-pr-lifecycle-tracking-v10.6" },
  { id: "tracking-ready", pass: artifact.status === "tracking-ready" },
  { id: "lifecycle-plan-ready", pass: artifact.checks.lifecyclePlanReady === true },
  { id: "quality-gate-present", pass: artifact.checks.qualityGatePresent === true },
  { id: "quality-gate-passed", pass: artifact.checks.qualityGatePassed === true },
  { id: "operator-commands-carried-forward", pass: artifact.checks.operatorCommandsCarriedForward === true },
  { id: "tracking-only", pass: artifact.safetyBoundary.trackingOnly === true },
  { id: "no-branch-created", pass: artifact.safetyBoundary.branchCreated === false },
  { id: "no-push", pass: artifact.safetyBoundary.pushed === false },
  { id: "no-merge", pass: artifact.safetyBoundary.merged === false },
  { id: "no-pr-opened", pass: artifact.safetyBoundary.prOpened === false },
  { id: "human-approval-required", pass: artifact.safetyBoundary.humanApprovalRequiredForGitHubActions === true },
  {
    id: "artifacts-exist",
    pass: artifact.outputArtifacts.every((p: string) => fs.existsSync(path.join(root, p)))
  }
];

const passed = checks.every((check) => check.pass);

console.log(JSON.stringify({ passed, checks }, null, 2));

if (!passed) {
  process.exit(1);
}
