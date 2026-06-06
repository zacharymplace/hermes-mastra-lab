import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const reportPath = path.join(
  root,
  "reports/agentic-workflow/run-v2/hermes-agentic-run-v2-source-patch-apply-v7.4.json"
);

const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));

const requiredArtifacts = [
  "hermes/agentic-workflow/run-v2/source-patch-applied-v7.4.json",
  "reports/agentic-workflow/run-v2/hermes-agentic-run-v2-source-patch-apply-v7.4.json",
  "reports/agentic-workflow/run-v2/hermes-agentic-run-v2-source-patch-apply-v7.4.md"
];

const checks = [
  {
    id: "runtime-labeled",
    pass: report.runtime === "hermes-agentic-run-v2-source-patch-apply-v7.4"
  },
  {
    id: "ready-for-human-review",
    pass: report.status === "ready-for-human-review"
  },
  {
    id: "approval-granted",
    pass: report.checks?.approvalGranted === true
  },
  {
    id: "reviewer-captured",
    pass: report.checks?.reviewerCaptured === true
  },
  {
    id: "reason-captured",
    pass: report.checks?.reasonCaptured === true
  },
  {
    id: "source-proposal-ready",
    pass: report.checks?.sourceProposalReady === true
  },
  {
    id: "patch-applied",
    pass: report.checks?.patchApplied === true
  },
  {
    id: "diff-captured",
    pass: report.checks?.diffCaptured === true
  },
  {
    id: "validations-passed",
    pass: report.checks?.validationsPassed === true
  },
  {
    id: "no-branch-created",
    pass: report.checks?.noBranchCreated === true
  },
  {
    id: "no-push",
    pass: report.checks?.noPush === true
  },
  {
    id: "no-merge",
    pass: report.checks?.noMerge === true
  },
  {
    id: "no-pr-opened",
    pass: report.checks?.noPrOpened === true
  },
  {
    id: "constrained-patch-only",
    pass: report.checks?.constrainedPatchOnly === true
  },
  {
    id: "artifacts-exist",
    pass: requiredArtifacts.every((artifact) =>
      fs.existsSync(path.join(root, artifact))
    )
  }
];

const passed = checks.every((check) => check.pass);

console.log(JSON.stringify({ passed, checks }, null, 2));

if (!passed) {
  process.exit(1);
}
