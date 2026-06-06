import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const report = JSON.parse(
  fs.readFileSync(
    path.join(
      root,
      "reports/agentic-workflow/branch-prep/hermes-agentic-branch-prepare-v5.json"
    ),
    "utf8"
  )
);

const requiredArtifacts = [
  "hermes/agentic-workflow/approvals/branch-prepare-v5.example.json",
  "hermes/agentic-workflow/branch-prep/v5.json",
  "reports/agentic-workflow/branch-prep/hermes-agentic-branch-prepare-v5.json",
  "reports/agentic-workflow/branch-prep/hermes-agentic-branch-prepare-v5.md"
];

const checks = [
  {
    id: "runtime-labeled",
    pass: report.runtime === "hermes-agentic-branch-prepare-v5"
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
    id: "source-pr-draft-ready",
    pass: report.checks?.sourcePrDraftReady === true
  },
  {
    id: "branch-prepared",
    pass: report.checks?.branchPrepared === true
  },
  {
    id: "branch-name-matches",
    pass: report.checks?.branchNameMatches === true
  },
  {
    id: "validations-passed",
    pass: report.checks?.validationsPassed === true
  },
  {
    id: "local-branch-only",
    pass: report.checks?.localBranchOnly === true
  },
  {
    id: "not-pushed",
    pass: report.checks?.notPushed === true
  },
  {
    id: "pr-not-opened",
    pass: report.checks?.prNotOpened === true
  },
  {
    id: "no-auto-merge",
    pass: report.checks?.noAutoMerge === true
  },
  {
    id: "human-approval-required",
    pass: report.checks?.humanApprovalRequired === true
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
