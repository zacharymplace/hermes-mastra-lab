import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const reportPath = path.join(
  root,
  "reports/agentic-workflow/run-v4/hermes-agentic-run-v4-quality-gated-source-patch-apply-v10.1.json"
);

const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));

const requiredArtifacts = [
  "hermes/agentic-workflow/run-v4/source-patch-apply/v10.1.json",
  "reports/agentic-workflow/run-v4/hermes-agentic-run-v4-quality-gated-source-patch-apply-v10.1.json",
  "reports/agentic-workflow/run-v4/hermes-agentic-run-v4-quality-gated-source-patch-apply-v10.1.md"
];

const checks = [
  {
    id: "runtime-labeled",
    pass:
      report.runtime ===
      "hermes-agentic-run-v4-quality-gated-source-patch-apply-v10.1"
  },
  {
    id: "ready-for-human-review",
    pass: report.status === "ready-for-human-review"
  },
  {
    id: "proposal-ready",
    pass: report.checks?.proposalReady === true
  },
  {
    id: "quality-gate-present",
    pass: report.checks?.qualityGatePresent === true
  },
  {
    id: "quality-gate-passed",
    pass: report.checks?.qualityGatePassed === true
  },
  {
    id: "quality-gate-carried-from-proposal",
    pass: report.checks?.qualityGateCarriedFromProposal === true
  },
  {
    id: "applied-declared",
    pass: report.sourcePatchApply?.applied === true
  },
  {
    id: "changed-declared",
    pass: report.sourcePatchApply?.changed === true
  },
  {
    id: "diff-output-declared",
    pass: typeof report.sourcePatchApply?.diffOutput === "string" && report.sourcePatchApply.diffOutput.length > 0
  },
  {
    id: "semantic-change-declared",
    pass: report.sourcePatchApply?.semanticChange === true
  },
  {
    id: "declared-targets-clean",
    pass: report.checks?.declaredTargetsClean === true
  },
  {
    id: "validations-passed",
    pass: report.checks?.validationsPassed === true
  },
  {
    id: "apply-artifact-only",
    pass: report.safetyBoundary?.applyArtifactOnly === true
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
    id: "human-approval-required",
    pass: report.safetyBoundary?.humanApprovalRequiredForGitHubActions === true
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
