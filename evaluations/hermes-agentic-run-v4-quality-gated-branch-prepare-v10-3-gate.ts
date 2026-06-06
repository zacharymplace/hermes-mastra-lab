import fs from "node:fs";

const reportPath =
  "reports/agentic-workflow/run-v4/hermes-agentic-run-v4-quality-gated-branch-prepare-v10.3.json";

const artifact = JSON.parse(fs.readFileSync(reportPath, "utf8"));

const requiredFiles = [
  "scripts/write-hermes-agentic-run-v4-quality-gated-branch-prepare-v10-3.ts",
  "evaluations/hermes-agentic-run-v4-quality-gated-branch-prepare-v10-3-gate.ts",
  "hermes/agentic-workflow/run-v4/branch-prepare/v10.3.json",
  reportPath,
  "reports/agentic-workflow/run-v4/hermes-agentic-run-v4-quality-gated-branch-prepare-v10.3.md"
];

const checks = [
  {
    id: "runtime-labeled",
    pass: artifact.runtime === "hermes-agentic-run-v4-quality-gated-branch-prepare-v10.3"
  },
  {
    id: "ready-for-branch-prep",
    pass: artifact.status === "ready-for-human-branch-prep"
  },
  {
    id: "validation-ready",
    pass: artifact.checks?.validationReady === true
  },
  {
    id: "quality-gate-present",
    pass: Boolean(artifact.qualityGate)
  },
  {
    id: "quality-gate-passed",
    pass: artifact.qualityGate?.passed === true
  },
  {
    id: "expected-branch-declared",
    pass:
      artifact.branchPrepare?.expectedBranchName ===
      "hermes/agentic-run-v4-quality-gated-source-patch-v10-3"
  },
  {
    id: "recommended-commands-declared",
    pass: Array.isArray(artifact.branchPrepare?.recommendedCommands)
      && artifact.branchPrepare.recommendedCommands.length >= 4
  },
  {
    id: "branch-prepare-artifact-only",
    pass: artifact.safetyBoundary?.branchPrepareArtifactOnly === true
  },
  {
    id: "no-branch-created",
    pass: artifact.safetyBoundary?.branchCreated === false
  },
  {
    id: "no-push",
    pass: artifact.safetyBoundary?.pushed === false
  },
  {
    id: "no-merge",
    pass: artifact.safetyBoundary?.merged === false
  },
  {
    id: "no-pr-opened",
    pass: artifact.safetyBoundary?.prOpened === false
  },
  {
    id: "human-approval-required",
    pass: artifact.safetyBoundary?.humanApprovalRequiredForGitHubActions === true
  },
  {
    id: "artifacts-exist",
    pass: requiredFiles.every((file) => fs.existsSync(file))
  }
];

const passed = checks.every((check) => check.pass);

console.log(JSON.stringify({ passed, checks }, null, 2));

if (!passed) {
  process.exit(1);
}
