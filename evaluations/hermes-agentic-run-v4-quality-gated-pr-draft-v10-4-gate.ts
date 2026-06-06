import fs from "node:fs";

const reportPath =
  "reports/agentic-workflow/run-v4/hermes-agentic-run-v4-quality-gated-pr-draft-v10.4.json";

const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));

const requiredArtifacts = [
  "hermes/agentic-workflow/run-v4/pr-draft/v10.4.json",
  reportPath,
  "reports/agentic-workflow/run-v4/hermes-agentic-run-v4-quality-gated-pr-draft-v10.4.md"
];

const checks = [
  {
    id: "runtime-labeled",
    pass: report.runtime === "hermes-agentic-run-v4-quality-gated-pr-draft-v10.4"
  },
  {
    id: "drafted-for-human-review",
    pass: report.status === "drafted-for-human-review"
  },
  {
    id: "branch-prepare-ready",
    pass: report.checks.branchPrepareReady === true
  },
  {
    id: "quality-gate-present",
    pass: report.checks.qualityGatePresent === true
  },
  {
    id: "quality-gate-passed",
    pass: report.checks.qualityGatePassed === true
  },
  {
    id: "pr-draft-present",
    pass: report.checks.prDraftPresent === true
  },
  {
    id: "pr-body-includes-quality-gate",
    pass: report.checks.prBodyIncludesQualityGate === true
  },
  {
    id: "declared-targets-clean",
    pass: report.checks.declaredTargetsClean === true
  },
  {
    id: "validations-passed",
    pass: report.validationResults.every((result: any) => result.passed === true)
  },
  {
    id: "draft-only",
    pass: report.safetyBoundary.draftOnly === true
  },
  {
    id: "no-branch-created",
    pass: report.safetyBoundary.branchCreated === false
  },
  {
    id: "no-push",
    pass: report.safetyBoundary.pushed === false
  },
  {
    id: "no-merge",
    pass: report.safetyBoundary.merged === false
  },
  {
    id: "no-pr-opened",
    pass:
      report.safetyBoundary.prOpened === false &&
      report.prDraft.prOpenedByThisStep === false
  },
  {
    id: "human-approval-required",
    pass: report.safetyBoundary.humanApprovalRequiredForGitHubActions === true
  },
  {
    id: "artifacts-exist",
    pass: requiredArtifacts.every((artifact) => fs.existsSync(artifact))
  }
];

const passed = checks.every((check) => check.pass);

console.log(JSON.stringify({ passed, checks }, null, 2));

if (!passed) {
  process.exit(1);
}
