import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const reportPath = path.join(
  root,
  "reports/agentic-workflow/run-v4/hermes-agentic-run-v4-quality-gated-source-patch-proposal-v10.0.json"
);

const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));

const requiredArtifacts = [
  "hermes/agentic-workflow/run-v4/source-patch-proposal/v10.0.json",
  "reports/agentic-workflow/run-v4/hermes-agentic-run-v4-quality-gated-source-patch-proposal-v10.0.json",
  "reports/agentic-workflow/run-v4/hermes-agentic-run-v4-quality-gated-source-patch-proposal-v10.0.md"
];

const checks = [
  {
    id: "runtime-labeled",
    pass:
      report.runtime ===
      "hermes-agentic-run-v4-quality-gated-source-patch-proposal-v10.0"
  },
  {
    id: "status-proposed",
    pass: report.status === "proposed"
  },
  {
    id: "source-index-ready",
    pass: report.checks?.sourceIndexReady === true
  },
  {
    id: "source-closeout-ready",
    pass: report.checks?.sourceCloseoutReady === true
  },
  {
    id: "quality-gate-present",
    pass: report.checks?.qualityGatePresent === true
  },
  {
    id: "quality-gate-required-before-apply",
    pass: report.checks?.qualityGateRequiredBeforeApply === true
  },
  {
    id: "quality-gate-passed",
    pass: report.checks?.qualityGatePassed === true
  },
  {
    id: "expected-changed-paths-declared",
    pass: report.checks?.expectedChangedPathsDeclared === true
  },
  {
    id: "proposed-patch-shape-declared",
    pass: report.checks?.proposedPatchShapeDeclared === true
  },
  {
    id: "validations-passed",
    pass: report.checks?.validationsPassed === true
  },
  {
    id: "proposal-only",
    pass: report.safetyBoundary?.proposalOnly === true
  },
  {
    id: "no-patch-generated",
    pass: report.safetyBoundary?.patchGenerated === false
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
    id: "human-approval-before-apply",
    pass: report.safetyBoundary?.humanApprovalRequiredBeforeApply === true
  },
  {
    id: "artifacts-exist",
    pass: requiredArtifacts.every((p) => fs.existsSync(path.join(root, p)))
  }
];

const passed = checks.every((check) => check.pass);

console.log(JSON.stringify({ passed, checks }, null, 2));

if (!passed) {
  process.exit(1);
}
